from unittest.mock import patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.job_fit import router
from backend.job_fit_schemas import JobFitResponse


app = FastAPI()
app.include_router(router)

client = TestClient(app)


def mock_job_fit_result():
    return JobFitResponse(
        score=78,
        summary="Good compatibility with the job requirements.",
        matching_skills=["Python", "Machine Learning"],
        missing_skills=["Docker"],
        strengths=["Practical ML project experience"],
        recommendations=["Develop Docker skills"],
    )


def test_job_fit_valid_cv():
    with patch(
        "backend.job_fit.analyze_job_fit",
        return_value=mock_job_fit_result(),
    ) as mock_analyze:

        response = client.post(
            "/job-fit",
            data={
                "cv_text": "Python developer with ML experience.",
                "job_description": "Looking for Python, ML and Docker.",
            },
        )

    assert response.status_code == 200
    assert response.json()["score"] == 78
    assert "Python" in response.json()["matching_skills"]
    mock_analyze.assert_called_once()


def test_job_fit_missing_cv():
    response = client.post(
        "/job-fit",
        data={
            "job_description": "Python developer required.",
        },
    )

    assert response.status_code == 400


def test_job_fit_rejects_cv_text_and_pdf():
    response = client.post(
        "/job-fit",
        data={
            "cv_text": "Python developer",
            "job_description": "Python developer required.",
        },
        files={
            "cv_file": (
                "resume.pdf",
                b"%PDF-1.4 fake content",
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 400


def test_job_fit_rejects_invalid_pdf():
    response = client.post(
        "/job-fit",
        data={
            "job_description": "Python developer required.",
        },
        files={
            "cv_file": (
                "resume.pdf",
                b"This is not a PDF",
                "application/pdf",
            ),
        },
    )

    assert response.status_code == 400


def test_job_fit_rejects_oversized_cv_text():
    response = client.post(
        "/job-fit",
        data={
            "cv_text": "Python " * 4000,
            "job_description": "Python developer required.",
        },
    )

    assert response.status_code == 400
