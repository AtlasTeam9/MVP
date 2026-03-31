from unittest.mock import MagicMock

import pytest

from app.application.use_cases.session.answer import AnswerUseCase
from app.application.use_cases.session.dtos.requests import AnswerRequest
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.exceptions import SessionNotFoundException


@pytest.fixture
def mock_session_service():
    return MagicMock()


@pytest.fixture
def use_case(mock_session_service):
    return AnswerUseCase(mock_session_service)


@pytest.fixture
def sample_session(session_factory):
    device = Device(
        device_name="Test",
        assets=[
            Asset("A1", "Asset 1", AssetType.NETWORK_FUN, True),
            Asset("A2", "Asset 2", AssetType.SECURITY_FUN, True),
        ],
        operating_sys="Linux",
        firm_vers="1.0.0",
        funcs="Routing",
    )
    return session_factory.create(device=device)


class TestAnswerUseCase:
    async def test_raises_if_session_not_found(self, use_case, mock_session_service):
        mock_session_service.get_session.return_value = None
        request = AnswerRequest(session_id="fake-id", answer=True)

        with pytest.raises(SessionNotFoundException):
            await use_case.execute(request)

    async def test_returns_answer_response_tree_completed(
        self, use_case, mock_session_service, sample_session
    ):
        mock_session_service.get_session.return_value = sample_session
        request = AnswerRequest(session_id=sample_session.get_id, answer=True)

        response = await use_case.execute(request)

        assert response is not None
        assert response.tree_completed is True
        assert response.tree_result == "NOT_APPLICABLE"
        assert response.session_finished is False

    async def test_saves_session_after_answer(self, use_case, mock_session_service, sample_session):
        mock_session_service.get_session.return_value = sample_session
        request = AnswerRequest(session_id=sample_session.get_id, answer=False)

        await use_case.execute(request)

        mock_session_service.save_session.assert_called_once_with(session=sample_session)

    async def test_answer_false_tree_not_completed(
        self, use_case, mock_session_service, sample_session
    ):
        """Risposta False porta al nodo successivo: tree non ancora completato."""
        mock_session_service.get_session.return_value = sample_session
        request = AnswerRequest(session_id=sample_session.get_id, answer=False)

        response = await use_case.execute(request)

        assert response.tree_completed is False
        assert response.next_node_id is not None

    async def test_response_includes_indexes(self, use_case, mock_session_service, sample_session):
        mock_session_service.get_session.return_value = sample_session
        request = AnswerRequest(session_id=sample_session.get_id, answer=True)

        response = await use_case.execute(request)

        assert hasattr(response, "current_asset_index")
        assert hasattr(response, "current_tree_index")
        assert response.current_asset_index >= 0
        assert response.current_tree_index >= 0

    async def test_results_present_when_session_finished(
        self, use_case, mock_session_service, sample_session
    ):
        """I risultati sono presenti nella risposta solo quando la sessione è finita."""
        mock_session_service.get_session.return_value = sample_session

        response = None
        for _ in range(20):
            request = AnswerRequest(session_id=sample_session.get_id, answer=True)
            response = await use_case.execute(request)
            if response.session_finished:
                break

        assert response is not None
        assert response.session_finished is True
        assert response.results is not None

    async def test_results_none_when_session_not_finished(
        self, use_case, mock_session_service, sample_session
    ):
        mock_session_service.get_session.return_value = sample_session
        request = AnswerRequest(session_id=sample_session.get_id, answer=False)

        response = await use_case.execute(request)

        assert response.results is None

    async def test_answer_true_na_skips_dependent_tree(
        self, use_case, mock_session_service, sample_session
    ):
        """
        Risposta True su Q1 → NOT_APPLICABLE su tree_01,
        tree_02 (dipendente) viene saltato automaticamente.
        """
        mock_session_service.get_session.return_value = sample_session

        # Avanza al prossimo tree o asset
        request = AnswerRequest(session_id=sample_session.get_id, answer=True)
        response = await use_case.execute(request)

        # tree_02 saltato perché dipende da tree_01=NA → siamo all'asset 2 o session finita
        assert response.tree_completed is True
        assert response.tree_result == "NOT_APPLICABLE"
