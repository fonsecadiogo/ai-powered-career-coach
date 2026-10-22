# AI-Powered Career Coach (Atena)

A React and FastAPI career-coaching MVP with four user-facing tools:

- **Mock Interview** — a 15-question adaptive interview with structured feedback.
- **CV Reviewer** — structured CV feedback from pasted text or a PDF.
- **Job Discovery** — live remote-job search through the Himalayas job-listings API.
- **Job-Fit Analysis** — an OpenAI-generated compatibility estimate comparing a CV with a job description.

This is a collaborative Ironhack AI Engineering bootcamp project. See
[Team Project and Contributions](docs/TEAM_PROJECT_AND_CONTRIBUTIONS.md) for
portfolio attribution and contribution guidance. The project is licensed
under the [MIT License](LICENSE).

The application does not store job listings or interview sessions, and no production deployment is configured in this repository.

## Architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19, Vite 8 | User interface, client-side validation, and HTTP requests |
| Backend | Python, FastAPI, Pydantic | API routes, validation, PDF extraction, and orchestration |
| AI services | OpenAI Python SDK | Mock Interview, CV Reviewer, and Job-Fit Analysis |
| Job data | Himalayas public jobs API | Job Discovery search results; listings are fetched at request time |
| Documents | pypdf | Text extraction from uploaded PDF CVs |

Job Discovery does not use OpenAI. The other three AI-backed tools send user-provided content to OpenAI. OpenAI credentials remain server-side.

## Repository structure

```text
.
├── backend/
│   ├── app.py                 # FastAPI app and route registration
│   ├── interview.py           # Mock Interview engine
│   ├── cv_reviewer.py         # CV review and PDF processing
│   ├── jobs.py                # Himalayas job search integration
│   ├── job_fit.py             # CV/job compatibility endpoint
│   ├── job_fit_schemas.py     # Job-Fit response contract
│   └── requirements.txt       # Backend and test dependencies
├── frontend/src/
│   ├── components/            # Mock Interview, CV, jobs, and job-fit UI
│   └── services/api.js        # Backend HTTP client
├── tests/                     # Offline Mock Interview, jobs, and job-fit tests
├── .env.example               # Server-side local configuration template
├── frontend/.env.example      # Public frontend API URL template
└── docs/                      # Audit and handoff documentation
```

## Prerequisites

- Python 3.12 or a compatible version for the pinned backend dependencies.
- Node.js and npm compatible with the checked-in frontend lockfile.
- An OpenAI API key for Mock Interview, CV Reviewer, or Job-Fit Analysis. The deterministic tests do not require one.

## Local setup

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
cp .env.example .env
```

Set `OPENAI_API_KEY` in the project-root `.env`. Both `interview.py`, `cv_reviewer.py`, and `job_fit.py` load this optional project-local file; hosting-provider process variables take precedence because `python-dotenv` does not override existing variables by default. Job Discovery has no application secret or separate configuration variable.

The server-side example contains:

```dotenv
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_MODEL` configures Mock Interview only. CV Reviewer and Job-Fit Analysis currently use `gpt-4o-mini` in their implementation. Do not place `OPENAI_API_KEY` in a `VITE_` variable or commit a real `.env` file.

Start the backend first, from the repository root:

```bash
python -m uvicorn backend.app:app --reload
```

In a second terminal, configure and start React/Vite:

```bash
cd frontend
npm ci
cp .env.example .env
npm run dev
```

 `VITE_API_BASE_URL` is optional locally and defaults to `http://127.0.0.1:8000`. Set it to the public backend origin before a production build. Vite variables are public in the generated client bundle. Open the Vite URL, normally `http://localhost:5173`.

 A no-cost backend health check is:

```bash
curl http://127.0.0.1:8000/health
```

## Features

### Mock Interview

Enter a target role and optional job description, then answer the adaptive questions. A complete interview plans 15 questions across technical competence, problem solving, practical experience, communication, and role fit. **Finish Interview** can be used after at least one answer; early completion produces feedback from only the answered transcript. The browser sends the serialized session state with each request; there is no server-side session database.

### CV Reviewer

Provide a target role and exactly one CV input: pasted text or a readable PDF. An optional job description is accepted. The response contains a score, strengths, weaknesses, and suggestions. PDF uploads are limited to 5 MiB; scanned/image-only documents may not yield extractable text.

### Job Discovery

Enter at least two characters of job-title or keyword search text. The backend calls `https://himalayas.app/jobs/api/search` with `q`, `sort=recent`, and an optional `country` query parameter. Results are ranked by the number of search terms appearing in each title and returned as:

```json
{
  "source": "Himalayas",
  "source_url": "https://himalayas.app",
  "jobs": [
    {
      "title": "...",
      "company": "...",
      "summary": "...",
      "seniority": "...",
      "employment_type": "...",
      "locations": [],
      "published_at": "...",
      "description": "...",
      "apply_url": "..."
    }
  ]
}
```

Listings are live external data, are not stored locally, and may become unavailable or change after the search. Provider failures are returned as HTTP 502.

### Job-Fit Analysis

Provide exactly one pasted CV or PDF CV and a required job description. CV text is limited to 20,000 characters, the job description to 12,000 characters, and PDFs to 5 MiB. The structured response contains `score` (0–100), `summary`, `matching_skills`, `missing_skills`, `strengths`, and `recommendations`. The score is an AI-generated estimate based only on the supplied documents; it is not a hiring decision or an employment guarantee.

## API reference

All endpoints are served by the FastAPI application at the configured backend origin.

| Method | Endpoint | Request | Response and errors |
| --- | --- | --- | --- |
| `GET` | `/health` | None | `{"status":"ok"}`. |
| `POST` | `/interview/start` | JSON: required `role` (1–120 chars), optional `job_description` (max 5,000). | `InterviewSession`; validation or interview errors are 400. May call OpenAI. |
| `POST` | `/interview/answer` | JSON: `session`, required non-empty `answer` (max 5,000). | Updated `InterviewSession`; invalid state/input is 400. May call OpenAI unless the interview is complete. |
| `POST` | `/interview/finish` | JSON: `session`. | `{session, evaluation}` with weighted assessment; invalid state or no answer is 400. Calls OpenAI for evaluation. |
| `POST` | `/review-cv` | Multipart: required `role`, exactly one `cv_text` or `cv_file` PDF, optional `job_description`. | `score`, `strengths`, `weaknesses`, `suggestions`; invalid input is 400, oversized PDF is 413, provider failure is 502. Calls OpenAI. |
| `GET` | `/jobs/search` | Query `q` (2–120 chars), optional `country`. | Himalayas-normalized job list described above; upstream failure is 502. Calls the external jobs API, not OpenAI. |
| `POST` | `/job-fit` | Multipart: required `job_description`, exactly one `cv_text` or `cv_file` PDF. | `score`, `summary`, `matching_skills`, `missing_skills`, `strengths`, `recommendations`; invalid input is 400, oversized PDF is 413, provider failure is 502. Calls OpenAI. |

## Validation and development checks

From the repository root, run the explicit deterministic suite:

```bash
python -m pytest -q backend/test_review_cv_api.py backend/test_cv_processing.py backend/test_pdf_processing.py tests/test_interview.py tests/test_jobs.py tests/test_job_fit.py
```

Do not execute `backend/test_cv_ai.py` as routine validation: it is a manual integration script that makes a real OpenAI request. The listed tests use fakes/mocks for OpenAI and Himalayas; they validate contracts and error handling, not live provider availability.

From `frontend/`:

```bash
npm run lint
npm run build
```

From the repository root:

```bash
python -m pip check
git diff --check
```

## Production considerations and limitations

This repository has not been deployed. Before release, Diogo/the deployment owner must:

- Set `OPENAI_API_KEY` as a backend-host secret and keep it out of frontend builds.
- Set `VITE_API_BASE_URL` to the final HTTPS backend origin before building the frontend.
- Update FastAPI CORS in `backend/app.py` for the actual hosted frontend origin; current origins are local Vite ports 5173–5175.
- Select and test supported Python and Node runtimes and a production Uvicorn/process-manager command.
- Use HTTPS for both hosted surfaces and configure the total reverse-proxy request-body limit above 5 MiB so it accommodates a PDF of up to 5 MiB plus multipart form overhead and other fields; exactly 5 MiB is not sufficient for a multipart upload.
- Account for Himalayas availability, timeout, schema changes, and stale/unavailable listings; no uptime or job availability guarantee is made.
- Decide how to monitor upstream/provider failures and rate limits.

Other current limitations include no database-backed sessions or job persistence, no OCR for scanned PDFs, and AI assessments that depend on the supplied input and model output.
