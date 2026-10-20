from pathlib import Path

from fastapi.testclient import TestClient

import backend.cv_reviewer as cv_reviewer
from backend.cv_schemas import CVReviewResponse
from backend.app import app

SAMPLE_PDF = Path(__file__).with_name("sample_cv.pdf")


def successful_review() -> CVReviewResponse:
    return CVReviewResponse(
        score=82,
        strengths=["Relevant Python experience"],
        weaknesses=["Limited production AI examples"],
        suggestions=["Add a deployed AI project"],
    )


def client() -> TestClient:
    return TestClient(app, raise_server_exceptions=False)


def assert_review_response(response) -> None:
    assert response.status_code == 200
    assert response.json() == successful_review().model_dump()


def test_pdf_upload_returns_structured_review(monkeypatch):
    monkeypatch.setattr(cv_reviewer, "analyze_cv", lambda *args: successful_review())

    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer"},
        files={"cv_file": ("sample_cv.pdf", SAMPLE_PDF.read_bytes(), "application/pdf")},
    )

    assert_review_response(response)


def test_text_input_forwards_optional_job_description(monkeypatch):
    received = {}

    def analyze(cv_text, role, job_description=None):
        received.update(
            cv_text=cv_text,
            role=role,
            job_description=job_description,
        )
        return successful_review()

    monkeypatch.setattr(cv_reviewer, "analyze_cv", analyze)

    response = client().post(
        "/review-cv",
        data={
            "role": "Junior AI Engineer",
            "cv_text": "  Fictional Python developer CV.  ",
            "job_description": "Build reliable AI products.",
        },
    )

    assert_review_response(response)
    assert received == {
        "cv_text": "Fictional Python developer CV.",
        "role": "Junior AI Engineer",
        "job_description": "Build reliable AI products.",
    }


def test_pdf_and_nonempty_text_are_rejected(monkeypatch):
    monkeypatch.setattr(cv_reviewer, "analyze_cv", lambda *args: successful_review())

    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer", "cv_text": "Pasted CV"},
        files={"cv_file": ("sample_cv.pdf", SAMPLE_PDF.read_bytes(), "application/pdf")},
    )

    assert response.status_code == 400


def test_missing_cv_input_is_rejected():
    response = client().post("/review-cv", data={"role": "Junior AI Engineer"})

    assert response.status_code == 400


def test_whitespace_only_cv_text_is_rejected():
    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer", "cv_text": "   "},
    )

    assert response.status_code == 400


def test_non_pdf_upload_is_rejected():
    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer"},
        files={"cv_file": ("cv.txt", b"not a PDF", "text/plain")},
    )

    assert response.status_code == 400


def test_corrupt_pdf_is_rejected():
    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer"},
        files={"cv_file": ("corrupt.pdf", b"not a PDF", "application/pdf")},
    )

    assert response.status_code == 400


def test_empty_role_is_rejected(monkeypatch):
    monkeypatch.setattr(cv_reviewer, "analyze_cv", lambda *args: successful_review())

    response = client().post(
        "/review-cv",
        data={"role": "   ", "cv_text": "Fictional CV"},
    )

    assert response.status_code == 400


def test_pdf_larger_than_limit_is_rejected():
    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer"},
        files={
            "cv_file": (
                "large.pdf",
                b"%PDF-" + b"0" * (5 * 1024 * 1024),
                "application/pdf",
            )
        },
    )

    assert response.status_code == 413


def test_openai_failure_returns_a_safe_service_error(monkeypatch):
    def unavailable(*args):
        raise RuntimeError("internal-provider-error-token")

    monkeypatch.setattr(cv_reviewer, "analyze_cv", unavailable)

    response = client().post(
        "/review-cv",
        data={"role": "Junior AI Engineer", "cv_text": "Fictional CV"},
    )

    assert response.status_code == 502
    assert "internal-provider-error-token" not in response.text
