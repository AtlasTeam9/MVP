from app.application.interfaces.go_back_use_case import IGoBackUseCase
from app.application.interfaces.session_service import ISessionService
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

        # Cerca il nodo target nella navigation_stack corrente dell'asset
        target_node = None
        for tree_index, node, _ in session.state.navigation_stack:
            # Controllo combinato: l'indice dell'albero e l'ID del nodo devono coincidere
            if tree_index == request.target_tree_index and node.get_id == request.target_node_id:
                target_node = node
                break

        if target_node is None:
            return GoBackResponse(found=False, node_id=None)

        go_back_result = session.go_back(target_node)
        if not go_back_result.found:
            return GoBackResponse(found=False, node_id=None)

        answer_result = session.answer(request.new_answer)
        self._session_service.save_session(session)

        return GoBackResponse(
            found=True,
            node_id=answer_result.next_node.get_id if answer_result.next_node else None,
            tree_completed=answer_result.tree_completed,
            tree_result=answer_result.tree_result.value if answer_result.tree_result else None,
            session_finished=answer_result.session_finished,
            current_asset_index=session.state.current_asset_index,
            current_tree_index=session.state.current_tree_index,
        )
