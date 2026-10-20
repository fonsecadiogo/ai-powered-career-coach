from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from openai import OpenAI
from starlette.concurrency import run_in_threadpool

from .cv_reviewer import prepare_cv_text, extract_cv_from_pdf
from .job_fit_prompts import JOB_FIT_SYSTEM_PROMPT
from .job_fit_schemas import JobFitResponse


router = APIRouter(tags=["Job-Fit Analysis"])

MAX_PDF_BYTES = 5 * 1024 * 1024
MAX_CV_CHARS = 20000
MAX_JOB_CHARS = 12000

# Load environment variables from the project root.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")


def analyze_job_fit(
    cv_text: str,
    job_description: str,
) -> JobFitResponse:
    """Evaluate CV-to-job compatibility using OpenAI."""

    client = OpenAI()

    user_input = (
        "=== UNTRUSTED CV DATA ===\n"
        f"{cv_text}\n"
        "=== END CV DATA ===\n\n"
        "=== UNTRUSTED JOB DESCRIPTION ===\n"
        f"{job_description}\n"
        "=== END JOB DESCRIPTION ==="
    )

    response = client.responses.parse(
        model="gpt-4o-mini",
        instructions=JOB_FIT_SYSTEM_PROMPT,
        input=user_input,
        text_format=JobFitResponse,
    )

    result = response.output_parsed

    if result is None:
        raise ValueError("No structured job-fit analysis returned.")

    return result


@router.post("/job-fit", response_model=JobFitResponse)
async def evaluate_job_fit(
    cv_text: str | None = Form(None),
    cv_file: UploadFile | None = File(None),
    job_description: str = Form(...),
):
    """Analyze the compatibility between a CV and a job."""

    # Validate the job description.
    cleaned_job = job_description.strip()

    if not cleaned_job:
        raise HTTPException(
            status_code=400,
            detail="Job description is required.",
        )

    if len(cleaned_job) > MAX_JOB_CHARS:
        raise HTTPException(
            status_code=400,
            detail="Job description is too long.",
        )

    # Require exactly one CV input.
    has_text = bool(cv_text and cv_text.strip())

    if cv_file is None and not has_text:
        raise HTTPException(
            status_code=400,
            detail="Provide a PDF or CV text.",
        )

    if cv_file is not None and has_text:
        raise HTTPException(
            status_code=400,
            detail="Provide either a PDF or CV text, not both.",
        )

    if cv_file is not None:
        # Check the filename.
        if (
            not cv_file.filename
            or not cv_file.filename.lower().endswith(".pdf")
        ):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported.",
            )

        # Read only up to the permitted limit plus one byte.
        pdf_bytes = await cv_file.read(MAX_PDF_BYTES + 1)

        if len(pdf_bytes) > MAX_PDF_BYTES:
            raise HTTPException(
                status_code=413,
                detail="PDF exceeds the 5 MB limit.",
            )

        # Reject files without a PDF signature.
        if not pdf_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=400,
                detail="Invalid PDF file.",
            )

        # Reuse the CV Reviewer's PDF extraction.
        try:
            prepared_cv = await run_in_threadpool(
                extract_cv_from_pdf,
                pdf_bytes,
            )
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from PDF.",
            )

    else:
        # Validate pasted CV text.
        try:
            prepared_cv = prepare_cv_text(cv_text)
        except ValueError as error:
            raise HTTPException(
                status_code=400,
                detail=str(error),
            )

    if len(prepared_cv) > MAX_CV_CHARS:
        raise HTTPException(
            status_code=400,
            detail="CV text is too long.",
        )

    # Run OpenAI processing outside the event loop.
    try:
        result = await run_in_threadpool(
            analyze_job_fit,
            prepared_cv,
            cleaned_job,
        )
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Job-fit analysis is temporarily unavailable.",
        )

    return result
