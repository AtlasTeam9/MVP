from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.answer import IAnswerUseCase
from app.application.use_cases.session.dtos.requests import AnswerRequest
from app.application.use_cases.session.dtos.responses import AnswerResponse
from app.domain.exceptions import SessionNotFoundException


class AnswerUseCase(IAnswerUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: AnswerRequest) -> AnswerResponse:
        session = self._session_service.get_session(request.session_id)

        if session is None:
            raise SessionNotFoundException(session_id=request.session_id)

        answer_result = session.answer(request.answer)
        current_node = session.current_node
        self._session_service.save_session(session=session)

        all_tree_ids = [t.get_id for t in session.get_trees]
        return AnswerResponse(
            next_node_id=current_node.get_id if current_node else None,
            tree_completed=answer_result.tree_completed,
            tree_result=answer_result.tree_result.value if answer_result.tree_result else None,
            session_finished=answer_result.session_finished,
            results=session.results.get_aggregated_results(all_tree_ids)
            if answer_result.session_finished
            else None,
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
        )
