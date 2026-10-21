"""Interview engine independent of FastAPI, React, and Postman.

Public interface:
    start_interview(role, job_description='') -> InterviewSession
    submit_answer(session, answer) -> InterviewSession
    finish_interview(session) -> (InterviewSession, InterviewEvaluation)

Conversation state: Responses API / previous_response_id. The explicit
InterviewSession state is JSON-serializable. No database is used.
"""

import json
import os
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from openai import OpenAI, OpenAIError

from .interview_prompts import QUESTION_INSTRUCTIONS, EVALUATION_INSTRUCTIONS
from .interview_schemas import (
    EvaluationDraft,
    InterviewEvaluation,
    InterviewQuestion,
    InterviewSession,
    InterviewTurn,
)


PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

QUESTION_LIMIT = 15
# Fifteen-question competency plan; adaptive questions must respect assigned competencies.
QUESTION_COMPETENCIES = (
    "practical_experience", "technical_competence", "technical_competence",
    "problem_solving", "technical_competence", "problem_solving",
    "practical_experience", "communication", "role_fit",
    "technical_competence", "problem_solving", "practical_experience",
    "technical_competence", "communication", "role_fit",
)
assert len(QUESTION_COMPETENCIES) == QUESTION_LIMIT

MAX_ROLE_CHARS = 120
MAX_JOB_DESCRIPTION_CHARS = 5_000
MAX_ANSWER_CHARS = 5_000
MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

# Assessment weights are defined by the application, not the language model.
WEIGHTS = {
    "technical_competence": 0.30,
    "problem_solving": 0.25,
    "practical_experience": 0.20,
    "communication": 0.15,
    "role_fit": 0.10,
}


class InterviewError(Exception):
    """Raised for interview validation, API communication, or state errors."""


def _clean_text(value: str, field: str, maximum: int) -> str:
    if not isinstance(value, str):
        raise InterviewError(f"{field} must be a string.")
    value = value.strip()
    if not value:
        raise InterviewError(f"{field} cannot be empty.")
    if len(value) > maximum:
        raise InterviewError(f"{field} cannot exceed {maximum} characters.")
    return value


def _get_session(session: InterviewSession | dict[str, Any]) -> InterviewSession:
    try:
        state = InterviewSession.model_validate(session)
    except (ValueError, TypeError) as exc:
        raise InterviewError("Invalid interview session format.") from exc

    _clean_text(state.role, "role", MAX_ROLE_CHARS)
    if len(state.job_description) > MAX_JOB_DESCRIPTION_CHARS:
        raise InterviewError("Job description is too long.")
    if not state.turns or len(state.turns) > QUESTION_LIMIT:
        raise InterviewError("Invalid question count in session.")
    if not state.previous_response_id:
        raise InterviewError("Missing previous_response_id.")
    if state.status == "in_progress":
        if state.turns[-1].answer is not None:
            raise InterviewError("No pending question in this session.")
        if any(turn.answer is None for turn in state.turns[:-1]):
            raise InterviewError("Session contains unanswered earlier questions.")
    else:
        if any(turn.answer is None for turn in state.turns[:-1]):
            raise InterviewError("Session contains unanswered earlier questions.")
        if state.status == "ready_for_feedback" and any(
            turn.answer is None for turn in state.turns
        ):
            raise InterviewError("Session cannot be ready while questions are unanswered.")
    for turn in state.turns:
        if not turn.question.question.strip():
            raise InterviewError("Question text cannot be empty.")
        if turn.answer is not None:
            _clean_text(turn.answer, "answer", MAX_ANSWER_CHARS)
    return state


class InterviewEngine:
    """Orchestrate interviews with an injectable OpenAI client for testing."""

    def __init__(self, client: Any | None = None, model: str = MODEL) -> None:
        self._client = client
        self.model = model

    @property
    def client(self) -> Any:
        # Initialize the client lazily so offline tests do not require an API key.
        if self._client is None:
            if not os.getenv("OPENAI_API_KEY"):
                raise InterviewError("OPENAI_API_KEY missing from project .env.")
            self._client = OpenAI(timeout=40.0, max_retries=1)
        return self._client

    def _parse(self, *, instructions: str, payload: dict,
               schema: type, previous_response_id: str | None = None) -> Any:
        arguments = {
            "model": self.model,
            "instructions": instructions,
            "input": json.dumps(payload, ensure_ascii=False),
            "text_format": schema,
            "store": True,
        }
        if previous_response_id is not None:
            arguments["previous_response_id"] = previous_response_id
        try:
            response = self.client.responses.parse(**arguments)
        except OpenAIError as exc:
            # Never expose API keys, complete prompts, or sensitive responses in errors.
            raise InterviewError(
                f"OpenAI request failed ({type(exc).__name__})."
            ) from exc
        if response.output_parsed is None:
            raise InterviewError("The model did not return a usable structured output.")
        if not response.id:
            raise InterviewError("The model response is missing its response ID.")
        return response

    @staticmethod
    def _validate_question(question: InterviewQuestion, index: int) -> None:
        if question.competency != QUESTION_COMPETENCIES[index]:
            raise InterviewError("Question did not follow the required competency plan.")
        if not question.question.strip():
            raise InterviewError("Generated question cannot be empty.")

    def start_interview(self, role: str, job_description: str = "") -> InterviewSession:
        role = _clean_text(role, "role", MAX_ROLE_CHARS)
        if not isinstance(job_description, str):
            raise InterviewError("job_description must be a string.")
        job_description = job_description.strip()
        if len(job_description) > MAX_JOB_DESCRIPTION_CHARS:
            raise InterviewError("Job description is too long.")
        response = self._parse(
            instructions=QUESTION_INSTRUCTIONS,
            payload={
                "stage": "opening_question",
                "target_role": role,
                "job_description": job_description,
                "question_number": 1,
                "total_questions": QUESTION_LIMIT,
                "required_competency": QUESTION_COMPETENCIES[0],
                "instruction": "Ask the first relevant interview question.",
            },
            schema=InterviewQuestion,
        )
        self._validate_question(response.output_parsed, 0)
        return InterviewSession(
            role=role,
            job_description=job_description,
            status="in_progress",
            previous_response_id=response.id,
            turns=[InterviewTurn(question=response.output_parsed, answer=None)],
        )

    def submit_answer(
        self, session: InterviewSession | dict[str, Any], answer: str
    ) -> InterviewSession:
        state = _get_session(session)
        if state.status != "in_progress":
            raise InterviewError("Interview is not accepting answers.")
        answer = _clean_text(answer, "answer", MAX_ANSWER_CHARS)
        state = state.model_copy(deep=True)
        state.turns[-1].answer = answer

        if len(state.turns) >= QUESTION_LIMIT:
            state.status = "ready_for_feedback"
            return state

        response = self._parse(
            instructions=QUESTION_INSTRUCTIONS,  # Resend instructions on EVERY turn.
            payload={
                "stage": "follow_up_question",
                "target_role": state.role,
                "job_description": state.job_description,
                "candidate_answer": answer,
                "question_number": len(state.turns) + 1,
                "total_questions": QUESTION_LIMIT,
                "required_competency": QUESTION_COMPETENCIES[len(state.turns)],
                "previous_questions": [turn.question.question for turn in state.turns],
                "coverage_so_far": [turn.question.competency for turn in state.turns],
                "instruction": (
                    "Ask exactly one question on the required competency. "
                    "Use the candidate's answer where relevant; avoid repeating topics. "
                    "Do not coach or grade."
                ),
            },
            schema=InterviewQuestion,
            previous_response_id=state.previous_response_id,
        )
        self._validate_question(response.output_parsed, len(state.turns))
        state.turns.append(InterviewTurn(question=response.output_parsed, answer=None))
        state.previous_response_id = response.id
        return state

    def finish_interview(
        self, session: InterviewSession | dict[str, Any]
    ) -> tuple[InterviewSession, InterviewEvaluation]:
        state = _get_session(session)
        if state.status == "completed":
            raise InterviewError("Interview has already been completed.")
        answered = [turn for turn in state.turns if turn.answer is not None]
        if not answered:
            raise InterviewError("Answer at least one question before requesting feedback.")

        # Evaluate ONLY the explicit transcript, using a separate scoring request.
        # Do not mix the question-generation conversation into scoring.
        response = self._parse(
            instructions=EVALUATION_INSTRUCTIONS,
            payload={
                "stage": "final_evaluation",
                "target_role": state.role,
                "job_description": state.job_description,
                "answered_questions": len(answered),
                "planned_questions": QUESTION_LIMIT,
                "early_termination": len(answered) < QUESTION_LIMIT,
                "transcript": [
                    {"question": turn.question.question, "answer": turn.answer}
                    for turn in answered
                ],
            },
            schema=EvaluationDraft,
        )
        evaluation = response.output_parsed
        # Each category must provide a verifiable quote or indicate missing evidence.
        # Reject quotations that do not appear in candidate answers.
        answer_texts = [turn.answer for turn in answered]
        for key in WEIGHTS:
            quote = getattr(evaluation, key).evidence_quote
            if quote is not None and not any(quote in text for text in answer_texts):
                raise InterviewError(
                    f"Assessment contains unsupported evidence in {key}."
                )
        scores = {key: getattr(evaluation, key).score for key in WEIGHTS}
        if any(score < 0 or score > 100 for score in scores.values()):
            raise InterviewError("An assessment score was outside the 0–100 range.")
        weighted_score = round(sum(scores[key] * weight for key, weight in WEIGHTS.items()))
        report = InterviewEvaluation(
            overall_score=weighted_score,
            answered_questions=len(answered),
            planned_questions=QUESTION_LIMIT,
            assessment=evaluation,
            disclaimer=(
                "AI-generated practice assessment, not a certified hiring decision. "
                "Scores depend on the evidence provided; early completion limits reliability."
            ),
        )
        completed = state.model_copy(deep=True)
        completed.status = "completed"
        return completed, report


# Convenience interface for future FastAPI integration.
# One engine instance is sufficient; it does not store sessions in memory.
_engine = InterviewEngine()


def start_interview(role: str, job_description: str = "") -> InterviewSession:
    return _engine.start_interview(role, job_description)


def submit_answer(
    session: InterviewSession | dict[str, Any], answer: str
) -> InterviewSession:
    return _engine.submit_answer(session, answer)


def finish_interview(
    session: InterviewSession | dict[str, Any]
) -> tuple[InterviewSession, InterviewEvaluation]:
    return _engine.finish_interview(session)
