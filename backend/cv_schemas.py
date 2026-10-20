
# Import Pydantic tools to define our response data structure
from pydantic import BaseModel, Field


# Define how our CV Reviewer feedback must be structured
class CVReviewResponse(BaseModel):

    # The numerical score must be between 0 and 100
    score: int = Field(ge=0, le=100)

    # Lists of observations and recommendations
    strengths: list[str]
    weaknesses: list[str]
    suggestions: list[str]
