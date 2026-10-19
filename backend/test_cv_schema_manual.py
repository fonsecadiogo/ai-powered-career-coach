
# Import the Pydantic validation exception
from pydantic import ValidationError

# Import our CV feedback schema
from cv_schemas import CVReviewResponse


# Try creating a CV review with an invalid score
try:
    review = CVReviewResponse(
        score=150,
        strengths=["Good Python experience"],
        weaknesses=["Limited AI project experience"],
        suggestions=["Build a practical AI application"]
    )

    # This only executes if validation succeeds
    print(review.model_dump())

except ValidationError as error:
    # Handle the expected validation failure
    print("CV feedback validation failed!")
    print(error.errors()[0]["msg"])
