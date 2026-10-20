from unittest.mock import patch

import httpx
import pytest
from fastapi import HTTPException

from backend.jobs import search_jobs


def test_search_jobs_returns_real_job_fields():
    sample_response = {
        "jobs": [
            {
                "title": "Junior AI Engineer",
                "companyName": "Example Company",
                "applicationLink": "https://example.com/apply",
                "seniority": "Junior",
                "locationRestrictions": ["Portugal"],
            }
        ]
    }

    with patch("backend.jobs.httpx.get") as mock_get:
        mock_get.return_value.json.return_value = sample_response

        result = search_jobs(q="AI Engineer")

    assert result["source"] == "Himalayas"
    assert len(result["jobs"]) == 1
    assert result["jobs"][0]["title"] == "Junior AI Engineer"
    assert result["jobs"][0]["company"] == "Example Company"
    assert result["jobs"][0]["apply_url"] == "https://example.com/apply"

    mock_get.assert_called_once()


def test_search_jobs_handles_api_failure():
    with patch(
        "backend.jobs.httpx.get",
        side_effect=httpx.ConnectError("Connection failed"),
    ):
        with pytest.raises(HTTPException) as error:
            search_jobs(q="Python")

    assert error.value.status_code == 502


def test_search_jobs_ranks_relevant_titles_first():
    sample_response = {
        "jobs": [
            {
                "title": "Senior React Developer",
                "companyName": "Company A",
            },
            {
                "title": "Junior AI Engineer",
                "companyName": "Company B",
            },
            {
                "title": "Junior Golang Engineer",
                "companyName": "Company C",
            },
        ]
    }

    with patch("backend.jobs.httpx.get") as mock_get:
        mock_get.return_value.json.return_value = sample_response

        result = search_jobs(q="Junior AI Engineer")

    assert result["jobs"][0]["title"] == "Junior AI Engineer"
    assert result["jobs"][1]["title"] == "Junior Golang Engineer"
    assert result["jobs"][2]["title"] == "Senior React Developer"
