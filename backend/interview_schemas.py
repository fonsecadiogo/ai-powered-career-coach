"""Mock Interview contracts: session state and structured AI outputs."""
from typing import Literal
from pydantic import BaseModel, ConfigDict


Competency = Literal[
    "technical_competence", "problem_solving", "practical_experience",
    "communication", "role_fit",
]
Difficulty = Literal["introductory", "intermediate", "advanced"]
InterviewStatus = Literal["in_progress", "ready_for_feedback", "completed"]


class InterviewQuestion(BaseModel):
    """Strictly structured AI output for a single interview question."""
    model_config = ConfigDict(extra="forbid")
    question: str
    competency: Competency
    difficulty: Difficulty


class InterviewTurn(BaseModel):
    """An interviewer question and an optional candidate answer."""
    model_config = ConfigDict(extra="forbid")
    question: InterviewQuestion
    answer: str | None


class InterviewSession(BaseModel):
    """JSON-serializable interview state; no database is required."""
    model_config = ConfigDict(extra="forbid")
    role: str
    job_description: str
    status: InterviewStatus
    previous_response_id: str | None
    turns: list[InterviewTurn]


class CompetencyAssessment(BaseModel):
    """Competency assessment with a score validated between 0 and 100."""
    model_config = ConfigDict(extra="forbid")
    score: int
    evidence: str
    evidence_quote: str | None
    recommendation: str


class EvaluationDraft(BaseModel):
    """Structured AI assessment; the overall score is calculated in Python."""
    model_config = ConfigDict(extra="forbid")
    technical_competence: CompetencyAssessment
    problem_solving: CompetencyAssessment
    practical_experience: CompetencyAssessment
    communication: CompetencyAssessment
    role_fit: CompetencyAssessment
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
    summary: str
    evidence_limitations: str


class InterviewEvaluation(BaseModel):
    """Final assessment report calculated and returned by the application."""
    model_config = ConfigDict(extra="forbid")
    overall_score: int
    answered_questions: int
    planned_questions: int
    assessment: EvaluationDraft
    disclaimer: str
