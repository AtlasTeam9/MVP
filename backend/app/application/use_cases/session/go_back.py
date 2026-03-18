from fastapi import HTTPException

from app.application.interfaces.go_back_use_case import IGoBackUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.dto import GoBackRequest, GoBackResponse


class GoBackUseCase(IGoBackUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: GoBackRequest) -> GoBackResponse:
        session = self._session_service.get_session(request.session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="Session not found")

        # Cerca il nodo target nella navigation_stack corrente
        target_node = None
        for node, _ in session.state.navigation_stack:
            if node.get_id == request.target_node_id:
                target_node = node
                break

        if target_node is None:
            return GoBackResponse(found=False, node_id=None)

        go_back_result = session.go_back(target_node)

        return GoBackResponse(
            found=go_back_result.found,
            node_id=go_back_result.node.get_id if go_back_result.node else None,
        )
