import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/jobs", tags=["Job Discovery"])

HIMALAYAS_URL = "https://himalayas.app/jobs/api/search"


@router.get("/search")
def search_jobs(
    q: str = Query(min_length=2, max_length=120),
    country: str | None = None,
):
    params = {"q": q, "sort": "recent"}

    if country:
        params["country"] = country

    try:
        response = httpx.get(
            HIMALAYAS_URL,
            params=params,
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    except httpx.HTTPError:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve job listings.",
        )

    jobs = []

    for job in data.get("jobs", []):
        jobs.append({
            "title": job.get("title"),
            "company": job.get("companyName"),
            "summary": job.get("excerpt"),
            "seniority": job.get("seniority"),
            "employment_type": job.get("employmentType"),
            "locations": job.get("locationRestrictions", []),
            "published_at": job.get("pubDate"),
            "description": job.get("description"),
            "apply_url": job.get("applicationLink"),
        })


    # Rank jobs by relevance to the searched job title.
    search_terms = q.lower().split()

    def relevance_score(job):
        title_words = job.get("title") or ""
        title_words = title_words.lower().split()

        return sum(
            1 for term in search_terms
            if term in title_words
        )

    jobs.sort(key=relevance_score, reverse=True)


    return {
        "source": "Himalayas",
        "source_url": "https://himalayas.app",
        "jobs": jobs,
    }
