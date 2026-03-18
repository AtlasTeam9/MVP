from fastapi import HTTPException

from app.application.interfaces.answer_use_case import IAnswerUseCase
from app.application.interfaces.session_service import ISessionService
from app.application.use_cases.session.dto import AnswerRequest, AnswerResponse


class AnswerUseCase(IAnswerUseCase):
    def __init__(self, session_service: ISessionService):
        self._session_service = session_service

    async def execute(self, request: AnswerRequest) -> AnswerResponse:
        session = self._session_service.get_session(request.session_id)

        if session is None:
            raise HTTPException(status_code=404, detail="Session not find")

        answer_result = session.answer(request.answer)

        self._session_service.save_session(session=session)

        return AnswerResponse(
            next_node_id=answer_result.next_node.get_id if answer_result.next_node else None,
            tree_completed=answer_result.tree_completed,
            tree_result=answer_result.tree_result.value if answer_result.tree_result else None,
            session_finished=answer_result.session_finished,
            results=session.results.to_dict() if answer_result.session_finished else None,
        )
