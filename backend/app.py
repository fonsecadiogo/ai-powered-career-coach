from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .interview import InterviewEngine, InterviewError
from .interview_schemas import InterviewSession, InterviewEvaluation


app = FastAPI(title="AI-Powered Career Coach")

interview_engine = InterviewEngine()


class StartInterviewRequest(BaseModel):
    role: str = Field(min_length=1, max_length=120)
    job_description: str = Field(default="", max_length=5000)


class AnswerInterviewRequest(BaseModel):
    session: InterviewSession
    answer: str = Field(min_length=1, max_length=5000)


class FinishInterviewRequest(BaseModel):
    session: InterviewSession


class FinishInterviewResponse(BaseModel):
    session: InterviewSession
    evaluation: InterviewEvaluation



@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/interview/start",
    response_model=InterviewSession
)
def start_interview(request: StartInterviewRequest):
    try:
        return interview_engine.start_interview(
            role=request.role,
            job_description=request.job_description
        )
    except InterviewError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error


@app.post(
    "/interview/answer",
    response_model=InterviewSession
)
def answer_interview(request: AnswerInterviewRequest):
    try:
        return interview_engine.submit_answer(
            session=request.session,
            answer=request.answer
        )
    except InterviewError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error


@app.post(
    "/interview/finish",
    response_model=FinishInterviewResponse
)
def finish_interview(request: FinishInterviewRequest):
    try:
        session, evaluation = interview_engine.finish_interview(
            session=request.session
        )

        return FinishInterviewResponse(
            session=session,
            evaluation=evaluation
        )
    except InterviewError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        ) from error
