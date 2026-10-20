# Deployment Readiness Audit

**Project:** AI-Powered Career Coach
**Audit branch:** `docs/deployment-readiness`
**Audited integration revision:** `e79d060da0101bf0f2a8c00c999160bd7196d800`
**Scope:** Caio's local documentation, configuration, dependency, and deployment-readiness responsibilities.

## A. Executive summary

The project is ready for local development and deterministic validation after the configuration portability fix below. It is **not yet deployment-ready**: no deployment configuration exists, the backend CORS allow-list permits only local Vite origins, runtime versions are not declared, and public frontend/backend URLs must be chosen by the deployment owner.

No deployment was attempted. No API keys were read, printed, or added to tracked files.

## B. Files changed

| File | Change | Reason |
| --- | --- | --- |
| `backend/cv_reviewer.py` | Replaced a workspace-relative `.env` lookup with a project-root optional `.env` lookup. | Makes local configuration portable while preserving host-provided environment variables. |
| `.env.example` | Added a safe backend configuration template. | Documents the required server-side secret and optional Mock Interview model setting. |
| `frontend/.env.example` | Added a safe frontend configuration template. | Documents the public build-time API URL without exposing secrets. |
| `README.md` | Replaced the minimal README with reproducible setup, usage, validation, and deployment guidance. | Gives contributors and reviewers an accurate project guide. |
| `docs/DEPLOYMENT_READINESS_AUDIT.md` | Added this audit. | Records findings, validation, blockers, and handoff actions. |

## C. Configuration findings

- Mock Interview loads an optional root `.env`, then reads `OPENAI_MODEL`, defaulting to `gpt-4.1-mini`. Its OpenAI client is created lazily, so offline tests do not require a key.
- CV Reviewer previously used `Path(__file__).resolve().parents[3]` for `.env`, assuming this project lived under an `ironhack-workspace` directory. It now loads the optional root `.env`, matching Mock Interview. `python-dotenv` does not override process environment variables by default, so hosting-provider secrets take precedence.
- CV Reviewer initializes `OpenAI()` and uses the hard-coded model `gpt-4o-mini`; Mock Interview is instead configurable through `OPENAI_MODEL`. No model behavior changed.
- The frontend uses `VITE_API_BASE_URL`, falling back to `http://127.0.0.1:8000`. Vite variables are public build-time values; `OPENAI_API_KEY` must never have a `VITE_` prefix.
- `.gitignore` excludes `.env` and `.env.*` while explicitly allowing `.env.example`.

The change to `cv_reviewer.py` does not alter request fields, response schemas, endpoints, OpenAI prompts, or model selection.

## D. Dependency findings

`backend/requirements.txt` declares FastAPI, Uvicorn, OpenAI, pypdf, python-dotenv, and python-multipart for production. It also contains test tooling: pytest and httpx (used by FastAPI/Starlette's `TestClient`). No dependency changes were needed.

- Pydantic and Starlette are imported directly but arrive through the pinned FastAPI dependency chain. They were installed in the validated environment; redundant pins were not added.
- `pytest` and `httpx` are development/test dependencies mixed into runtime requirements. Splitting production and development requirements is a future cleanup, not a current blocker.
- The validated environment reported Python 3.12.14 and passed `pip check`. The repository does not declare a Python version policy or Node `engines` field.
- The local environment contained `python-dotenv` 1.2.4 while the requirements file pins 1.2.2. `pip check` reported no conflict; no upgrade was made during this audit.

## E. Validation results

| Command | Result | Notes |
| --- | --- | --- |
| `python -m pytest -q backend/test_review_cv_api.py tests/test_interview.py` | **22 passed** | Offline tests only; no OpenAI request occurred. |
| `python -m pytest -q backend/test_review_cv_api.py backend/test_cv_processing.py backend/test_pdf_processing.py tests/test_interview.py` | **26 passed** | Current deterministic suite matches the reported test count. |
| `cd frontend && npm run lint` | **Passed** | Checks the existing React source. |
| `cd frontend && npm run build` | **Passed** | Vite production build completed; generated `dist/` remains ignored. |
| Environment portability smoke check | **Passed** | Verified host-supplied `OPENAI_API_KEY` and `OPENAI_MODEL` are retained on module import; no API request occurred. |
| `git diff --check` | **Passed** | Final diff has no whitespace errors. |

`backend/test_cv_ai.py` is intentionally excluded: when directly executed, it invokes a real OpenAI request. `backend/test_cv_schema_manual.py` is a manual script with no pytest test function and is not collected by the deterministic suite.

## F. Remaining blockers

### Caio review or approval

- Review the local diff and decide whether to commit the documentation/configuration contribution.
- Confirm the intended Python and Node runtime versions for the deployment target.
- Decide whether to keep the split model behavior (`OPENAI_MODEL` for Mock Interview and a hard-coded CV Reviewer model) or make it configurable in a separately tested change.

### Requires coordination with Diogo

- Update `backend/app.py` CORS origins when the deployed frontend URL is known. This shared integration file was intentionally not changed.
- Coordinate any change to shared API paths, UI modules, or Job Discovery/Job-Fit work; none was changed in this audit.

### Deployment owner responsibilities

- Provision `OPENAI_API_KEY` as a backend-host secret.
- Configure the final `VITE_API_BASE_URL` at frontend build time.
- Select hosting, HTTPS, production process startup, upload/request-body limits, and deployment automation.
- Validate the application against the selected production platform before release.

## G. Git status

The audit began from clean checkout `test/final-integration`. After fetching, `origin/integration` advanced from `3c805e4` to `e79d060`; the dedicated local branch `docs/deployment-readiness` was created from `origin/integration` at `e79d060`.

Changes remain local and uncommitted. Nothing was pushed, merged, submitted as a pull request, or deployed.

## H. Suggested next actions

1. Review the final local diff and validation output.
2. Coordinate the production frontend URL and CORS change with Diogo.
3. Select host runtime versions and build/deploy commands, then test a staging deployment with backend secrets configured.
4. After approval, commit the scoped documentation/configuration files on this branch and open a pull request through the agreed team workflow.
