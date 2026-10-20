
# Import FastAPI to create the local development application.
from fastapi import FastAPI

# Import our CV Reviewer router.
from cv_reviewer import router

# Create the FastAPI application.
app = FastAPI()

# Connect the CV Reviewer endpoints.
app.include_router(router)
