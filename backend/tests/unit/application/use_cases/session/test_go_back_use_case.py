from unittest.mock import MagicMock

import pytest

from app.application.use_cases.session.dtos.requests import GoBackRequest
from app.application.use_cases.session.go_back import GoBackUseCase
from app.domain.entities.device import Asset, AssetType, Device
from app.domain.exceptions import SessionNotFoundException


@pytest.fixture
def mock_service():
    return MagicMock()


@pytest.fixture
def use_case(mock_service):
    return GoBackUseCase(mock_service)


@pytest.fixture
def sample_session(session_factory):
    device = Device(
        device_name="Test",
        assets=[Asset("A1", "Asset 1", AssetType.NETWORK_FUN, True)],
    )
    return session_factory.create(device=device)


@pytest.fixture
def two_asset_session(session_factory):
    device = Device(
        device_name="Test",
        assets=[
            Asset("A1", "Asset 1", AssetType.NETWORK_FUN, True),
            Asset("A2", "Asset 2", AssetType.SECURITY_FUN, True),
        ],
    )
    return session_factory.create(device=device)


class TestGoBackUseCase:
    async def test_raises_if_session_not_found(self, use_case, mock_service):
        mock_service.get_session.return_value = None
        request = GoBackRequest(
            session_id="fake-id",
            target_asset_index=0,
            target_tree_index=0,
            target_node_id="node1",
            new_answer=True,
        )
        with pytest.raises(SessionNotFoundException):
            await use_case.execute(request)

    async def test_returns_not_found_if_node_not_in_stack(
        self, use_case, mock_service, sample_session
    ):
        """Se il nodo non è nello stack, found=False."""
        mock_service.get_session.return_value = sample_session
        request = GoBackRequest(
            session_id=sample_session.get_id,
            target_asset_index=0,
            target_tree_index=0,
            target_node_id="node_inesistente",
            new_answer=True,
        )

        response = await use_case.execute(request)

        assert response.found is False
        assert response.node_id is None

    async def test_go_back_success_after_false_answer(self, use_case, mock_service, sample_session):
        """
        Prima rispondiamo False (Q1→Q2, Q1 va nello stack),
        poi go_back a Q1 con new_answer=True → tree completato con NA.
        """
        mock_service.get_session.return_value = sample_session

        # Rispondiamo False: Q1 finisce nello stack, ci spostiamo su Q2
        sample_session.answer(False)
        assert len(sample_session.state.navigation_stack) == 1

        node1_id = sample_session.state.navigation_stack[0][2].get_id

        request = GoBackRequest(
            session_id=sample_session.get_id,
            target_asset_index=0,
            target_tree_index=0,
            target_node_id=node1_id,
            new_answer=True,
        )

        response = await use_case.execute(request)

        assert response.found is True
        assert response.tree_completed is True
        assert response.tree_result == "NOT_APPLICABLE"

    async def test_go_back_saves_session(self, use_case, mock_service, sample_session):
        """save_session viene chiamato dopo un go_back riuscito."""
        mock_service.get_session.return_value = sample_session
        sample_session.answer(False)

        node1_id = sample_session.state.navigation_stack[0][2].get_id

        request = GoBackRequest(
            session_id=sample_session.get_id,
            target_asset_index=0,
            target_tree_index=0,
            target_node_id=node1_id,
            new_answer=True,
        )

        await use_case.execute(request)
        mock_service.save_session.assert_called_once()

    async def test_go_back_not_found_does_not_save(self, use_case, mock_service, sample_session):
        """Se il nodo non è trovato, save_session non viene chiamato."""
        mock_service.get_session.return_value = sample_session

        request = GoBackRequest(
            session_id=sample_session.get_id,
            target_asset_index=0,
            target_tree_index=0,
            target_node_id="ghost_node",
            new_answer=True,
        )

        await use_case.execute(request)
        mock_service.save_session.assert_not_called()

    async def test_go_back_returns_correct_indexes(self, use_case, mock_service, sample_session):
        """La response contiene gli indici correnti di asset e tree."""
        mock_service.get_session.return_value = sample_session
        sample_session.answer(False)

        node1_id = sample_session.state.navigation_stack[0][2].get_id

        request = GoBackRequest(
            session_id=sample_session.get_id,
            target_asset_index=0,
            target_tree_index=0,
            target_node_id=node1_id,
            new_answer=False,
        )

        response = await use_case.execute(request)

        assert response.found is True
        assert response.current_asset_index is not None
        assert response.current_tree_index is not None
