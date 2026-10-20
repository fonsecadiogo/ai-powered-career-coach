from io import BytesIO
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI
from pypdf import PdfReader
from pypdf.errors import PdfReadError
from starlette.concurrency import run_in_threadpool

from .cv_prompts import CV_REVIEW_SYSTEM_PROMPT
from .cv_schemas import CVReviewResponse

# Create an independent router for our CV Reviewer.
router = APIRouter()
MAX_PDF_BYTES = 5 * 1024 * 1024



@router.post("/review-cv", response_model=CVReviewResponse)
async def review_cv(
    role: str = Form(...),
    cv_text: str | None = Form(None),
    cv_file: UploadFile | None = File(None),
    job_description: str | None = Form(None),
):
    """
    Receive a CV and return structured AI-generated feedback.
    """

    try:
        cleaned_role = prepare_role(role)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    # Require either a PDF upload or pasted CV text.
    if cv_file is None and not cv_text:
        raise HTTPException(
            status_code=400,
            detail="Provide a PDF file or CV text.",
        )

    # Prevent ambiguous input when both are submitted.
    if cv_file is not None and cv_text and cv_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Provide either a PDF or CV text, not both.",
        )

    try:
        if cv_file is not None:
            # Accept PDF uploads only.
            if not cv_file.filename or not cv_file.filename.lower().endswith(".pdf"):
                raise HTTPException(
                    status_code=400,
                    detail="Only PDF files are supported.",
                )

            # Read the uploaded PDF into memory.
            pdf_bytes = await cv_file.read()

            if len(pdf_bytes) > MAX_PDF_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail="PDF file is too large. Maximum size is 5 MB.",
                )

            # Convert the PDF content into plain text.
            prepared_cv = extract_cv_from_pdf(pdf_bytes)

        else:
            # Clean pasted CV text using our existing function.
            prepared_cv = prepare_cv_text(cv_text)

        try:
            # Run the AI analysis without blocking FastAPI's event loop.
            review = await run_in_threadpool(
                analyze_cv,
                prepared_cv,
                cleaned_role,
                job_description,
            )
        except Exception:
            raise HTTPException(
                status_code=502,
                detail="CV review service is temporarily unavailable.",
            )

        # Return the agreed response schema.
        return review

    except HTTPException:
        # Preserve explicit HTTP error responses.
        raise

    except ValueError as error:
        # Return understandable validation errors.
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


def prepare_cv_text(cv_text: str | None) -> str:
    """
    Prepare and validate CV text before AI analysis.
    """

    # Check whether the user provided any text.
    if cv_text is None:
        raise ValueError("CV text is required")

    # Remove whitespace from the beginning and end.
    cleaned_text = cv_text.strip()

    # Reject text that is empty after cleaning.
    if not cleaned_text:
        raise ValueError("CV text cannot be empty")

    # Return the valid, cleaned text.
    return cleaned_text


def prepare_role(role: str) -> str:
    """Validate and normalize a required target role."""

    cleaned_role = role.strip()
    if not cleaned_role:
        raise ValueError("Target role is required")
    return cleaned_role


def extract_cv_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract readable text from a PDF CV.
    """

    try:
        # Open the PDF from its binary content.
        reader = PdfReader(BytesIO(pdf_bytes))

        # Store text extracted from each page.
        pages_text = []

        # Process every page of the PDF.
        for page in reader.pages:
            # Extract the page's text.
            text = page.extract_text()

            # Keep pages containing readable text.
            if text:
                pages_text.append(text)
    except PdfReadError as error:
        raise ValueError("Invalid or unreadable PDF file.") from error

    # Combine all extracted pages into one string.
    full_text = "\n".join(pages_text)

    # Reuse our existing CV text validation function.
    return prepare_cv_text(full_text)
# Locate ironhack-workspace/.env from the Career Coach backend.
workspace_env = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(workspace_env)


def analyze_cv(
    cv_text: str,
    role: str,
    job_description: str | None = None,
) -> CVReviewResponse:
    """
    Analyze a CV using OpenAI and return structured feedback.
    """

    # Reuse our existing CV text validation function.
    cleaned_cv = prepare_cv_text(cv_text)

    # Ensure that a target role was provided.
    cleaned_role = prepare_role(role)

    # Initialize the OpenAI client using the loaded API key.
    client = OpenAI()

    # Prepare the candidate information for analysis.
    user_input = (
        f"Target role: {cleaned_role}\n\n"
        f"CV:\n{cleaned_cv}\n\n"
        f"Job description:\n{job_description or 'Not provided'}"
    )

    # Request feedback matching our agreed Pydantic schema.
    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=CV_REVIEW_SYSTEM_PROMPT,
        input=user_input,
        text_format=CVReviewResponse,
    )

    # Get the parsed Pydantic response.
    result = response.output_parsed

    # Reject responses that could not be parsed.
    if result is None:
        raise ValueError("OpenAI returned no structured CV feedback")

    return result
