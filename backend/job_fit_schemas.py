
from pydantic import BaseModel, Field


class JobFitResponse(BaseModel):
    # Estimated compatibility score between CV and job description.
    score: int = Field(ge=0, le=100)

    # Short explanation of the overall compatibility.
    summary: str

    # Skills demonstrated in the CV that match the job.
    matching_skills: list[str]

    # Job requirements not demonstrated in the CV.
    missing_skills: list[str]

    # Candidate's relevant strengths for this opportunity.
    strengths: list[str]

    # Practical actions to improve compatibility.
    recommendations: list[str]
