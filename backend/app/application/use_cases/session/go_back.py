from app.application.interfaces.session_service import ISessionService
from app.application.interfaces.use_cases.go_back import IGoBackUseCase
from app.application.use_cases.session.dtos.requests import GoBackRequest
from app.application.use_cases.session.dtos.responses import GoBackResponse
from app.domain.exceptions import SessionNotFoundException


class GoBackUseCase(IGoBackUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: GoBackRequest) -> GoBackResponse:
        session = self._session_service.get_session(request.session_id)
        if session is None:
            raise SessionNotFoundException(request.session_id)

        # Cerca il nodo target nella navigation_stack cross-asset
        target_node = None
        for asset_index, tree_index, node, _ in session.state.navigation_stack:
            if (
                asset_index == request.target_asset_index
                and tree_index == request.target_tree_index
                and node.get_id == request.target_node_id
            ):
                target_node = node
                break

        if target_node is None:
            return GoBackResponse(found=False, node_id=None)

        go_back_result = session.go_back(target_node)
        if not go_back_result.found:
            return GoBackResponse(found=False, node_id=None)

        answer_result = session.answer(request.new_answer)
        current_node = session.current_node
        self._session_service.save_session(session)

        return GoBackResponse(
            found=True,
            node_id=current_node.get_id if current_node else None,
            tree_completed=answer_result.tree_completed,
            tree_result=answer_result.tree_result.value if answer_result.tree_result else None,
            session_finished=answer_result.session_finished,
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
        )
