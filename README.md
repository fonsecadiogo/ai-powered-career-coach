# AI-Powered Career Coach

A local-first career-coaching application with a React user interface and a FastAPI backend. It uses the OpenAI API to provide two implemented tools:

- **Mock Interview**: a 15-question adaptive practice interview followed by structured feedback.
- **CV Reviewer**: analysis of pasted CV text or a PDF CV for a selected target role.

Job Discovery and Job-Fit Analysis appear in the interface as unavailable, coming-soon modules. They are not supported workflows yet. No production deployment is configured in this repository.

## Architecture and technologies

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19, Vite 8 | Forms, client-side validation, and calls to the backend HTTP API |
| Backend | Python, FastAPI, Pydantic | API routes, request validation, interview state, and response schemas |
| AI | OpenAI Python SDK | Structured interview questions, evaluation, and CV feedback |
| PDF processing | pypdf | Extraction of text from uploaded PDF CVs |

The browser calls the FastAPI application over HTTP. The frontend reads `VITE_API_BASE_URL` at build time and otherwise uses `http://127.0.0.1:8000`. The backend keeps OpenAI credentials server-side.

## Repository structure

```text
.
├── backend/
│   ├── app.py                 # FastAPI app and interview routes
│   ├── interview.py           # Mock Interview engine
│   ├── cv_reviewer.py         # CV Review API route and PDF processing
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── src/                   # React application
│   ├── package.json           # Frontend scripts and dependencies
│   └── .env.example           # Safe frontend configuration example
├── tests/test_interview.py    # Offline Mock Interview tests
├── .env.example               # Safe backend configuration example
└── docs/                      # Project audit and supporting documentation
```

## Prerequisites

- Python 3.12 or a compatible Python version supported by the pinned backend dependencies.
- Node.js and npm versions compatible with the checked-in frontend lockfile. Use a current Node LTS release for deployment; the repository does not declare an `engines` field.
- An OpenAI API key for using either AI feature. Offline tests do not require one.

## Backend setup

Run these commands from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
cp .env.example .env
```

Edit the newly created `.env` and set `OPENAI_API_KEY` to a real key. `.env` is ignored by Git and must not be committed.

Start the backend from the repository root:

```bash
python -m uvicorn backend.app:app --reload
```

The API is then available at `http://127.0.0.1:8000`; verify it without making an AI request:

```bash
curl http://127.0.0.1:8000/health
```

## Environment variables

### Backend (server-side)

Create a project-root `.env` from [`.env.example`](.env.example) for local development. In a hosted environment, configure these values as process environment variables instead; the application will not overwrite values supplied by the host.

| Variable | Required | Used by | Behavior |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes for AI requests | Mock Interview and CV Reviewer | Read by the OpenAI SDK. Keep it only on the server. |
| `OPENAI_MODEL` | No | Mock Interview | Defaults to `gpt-4.1-mini`. |

CV Reviewer currently uses `gpt-4o-mini` directly in its implementation, rather than `OPENAI_MODEL`. That difference is current behavior and is documented here so a future configuration change can be coordinated and tested.

### Frontend (public build-time configuration)

Copy [`frontend/.env.example`](frontend/.env.example) to `frontend/.env` only when a custom backend URL is needed:

```bash
cp frontend/.env.example frontend/.env
```

`VITE_API_BASE_URL` is optional locally because the frontend defaults to `http://127.0.0.1:8000`. Set it to the public HTTPS backend origin before building for production. Values prefixed with `VITE_` are embedded in the client build and therefore public. Never put `OPENAI_API_KEY` or another server secret in a `VITE_` variable.

## Frontend setup

In a separate terminal, run:

```bash
cd frontend
npm ci
npm run dev
```

Vite prints the local browser URL, normally `http://localhost:5173`. Keep the backend running at the configured API base URL.

## Run the complete application locally

1. Set `OPENAI_API_KEY` in the root `.env`.
2. From the repository root, run `python -m uvicorn backend.app:app --reload`.
3. In another terminal, run `cd frontend && npm ci && npm run dev`.
4. Open the Vite URL shown in the terminal.
5. Select Mock Interview or CV Reviewer and submit a request. These feature requests call the OpenAI API and may incur account charges.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Returns `{"status":"ok"}` without calling OpenAI. |
| `POST` | `/interview/start` | Starts an interview from `role` and optional `job_description`. |
| `POST` | `/interview/answer` | Sends an answer with the full session state and returns the next question or ready state. |
| `POST` | `/interview/finish` | Returns the completed session and structured evaluation. |
| `POST` | `/review-cv` | Accepts a target `role`, exactly one of `cv_text` or `cv_file`, and optional `job_description`. |

`/review-cv` accepts PDF uploads only and rejects files larger than 5 MiB. The backend currently allows the local Vite origins `localhost`/`127.0.0.1` on ports 5173–5175; see the production notes before hosting the frontend elsewhere.

## Using the application

### Mock Interview

Enter a target role and, optionally, a job description. Start the interview, answer each displayed question, and choose **Finish Interview** after at least one answer. A full session has 15 questions; finishing earlier produces feedback based only on the answered questions.

### CV Reviewer

Enter a target role and provide either a PDF (maximum 5 MiB) or pasted CV text, not both. A job description is optional. Submit the form to receive a score, strengths, weaknesses, and suggestions. Image-only or otherwise unreadable PDFs cannot be meaningfully extracted.

## Validation and development checks

Run backend tests from the repository root using the environment where dependencies are installed:

```bash
python -m pytest -q backend/test_review_cv_api.py tests/test_interview.py
python -m pytest -q backend/test_review_cv_api.py backend/test_cv_processing.py backend/test_pdf_processing.py tests/test_interview.py
```

The first command exercises the API contract and Mock Interview logic. The second adds deterministic CV text and PDF extraction tests. Do not run `backend/test_cv_ai.py` as part of routine validation: it is a manual script that makes a real OpenAI request when run directly.

Check the frontend from `frontend/`:

```bash
npm run lint
npm run build
```

Check documentation and source changes for whitespace errors from the repository root:

```bash
git diff --check
```

## Production deployment considerations

This repository does not include deployment infrastructure. The deployment owner should address the following before release:

- Set `OPENAI_API_KEY` as a server-side secret in the backend host; do not rely on a checked-in `.env`.
- Set `VITE_API_BASE_URL` to the final public backend HTTPS origin before the frontend production build.
- Coordinate a change to `backend/app.py` so CORS explicitly permits the deployed frontend origin. The current allow-list is local-development only.
- Run the backend with a production process manager/server command appropriate for the selected host rather than `--reload`.
- Confirm host request-body limits permit the CV PDF limit of 5 MiB; reverse proxies can reject uploads before FastAPI receives them.
- Choose and declare supported Node and Python runtime versions for the target platform.
- Use HTTPS and configure the public frontend and backend URLs consistently.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `OPENAI_API_KEY` error or AI request failure | Set the key in the backend host environment or root `.env`; restart the backend. Do not add it to frontend configuration. |
| Frontend cannot reach the API | Confirm the backend is running, check `VITE_API_BASE_URL`, and verify CORS allows the frontend origin. |
| CV upload returns 413 | Use a PDF no larger than 5 MiB and check any reverse-proxy upload limit. |
| CV PDF is rejected | Ensure it is a readable `.pdf` file; scanned/image-only PDFs may not provide extractable text. |
| `npm run build` fails | Run `npm ci` from `frontend/` with a Node version compatible with the lockfile. |
| Tests unexpectedly call OpenAI | Run only the documented pytest commands; do not execute `backend/test_cv_ai.py` unless a paid integration test is intentionally required. |

## Current limitations

- Job Discovery and Job-Fit Analysis are not available in the current UI.
- There is no database or persistent server-side interview-session storage; the client sends session state with each request.
- CV analysis supports PDF text extraction and pasted text, not OCR for scanned documents.
- Production CORS, runtime version policy, hosting, secrets provisioning, and deployment automation remain deployment work.
- AI output depends on the configured provider/model and the input supplied by the user; it is not a hiring decision.
