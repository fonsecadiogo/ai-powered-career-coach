# Deployment Readiness Audit

**Project:** AI-Powered Career Coach (Atena)
**Branch:** `docs/deployment-readiness`
**Current audited HEAD:** `76357cc` (local merge of `origin/integration`)
**Scope:** Caio's documentation, configuration review, deterministic validation, and deployment handoff.

## A. Executive summary

The integrated MVP now exposes Mock Interview, CV Reviewer, Job Discovery, and Job-Fit Analysis. The local documentation has been updated to match the implementation at `76357cc`. The deterministic backend suite and frontend checks were independently executed without making paid OpenAI requests.

The project is suitable for local development and review, but it is not production-ready. Hosting, production CORS, runtime selection, HTTPS, secret provisioning, upstream jobs-provider reliability, and deployment monitoring remain open responsibilities.

## B. Audit history and integration update

### Original documentation audit

The first audit was based on `e79d060` (`Fix legacy CV tests and pytest collection`). At that point, the deterministic CV and Mock Interview suite passed **26 tests**. It identified the CV Reviewer's machine-specific `.env` lookup and changed it to an optional project-root `.env`, while leaving application behavior and shared integration untouched.

### New integrated features

Diogo's `6e22786` (`Add Job Discovery and Job-Fit Analysis`) added the jobs and job-fit backend routes, schemas, tests, and React modules. The local branch then integrated that revision through `76357cc` (`Merge origin/integration into docs/deployment-readiness`). This audit updates the README and findings for that four-feature state; it does not modify Diogo's feature code.

## C. Files changed in this local continuation

| File | Reason |
| --- | --- |
| `README.md` | Documents all four implemented modules, actual API contracts, setup, validation, and limitations. |
| `docs/DEPLOYMENT_READINESS_AUDIT.md` | Preserves the original audit history and records the integrated-feature review and current handoff. |

No backend implementation, React component, test, dependency, environment-example, deployment, or GitHub file was modified in this continuation.

## D. Inspected configuration and implementation findings

### Environment variables

- Mock Interview loads the optional project-root `.env` and reads `OPENAI_MODEL`, defaulting to `gpt-4.1-mini`.
- CV Reviewer loads the optional project-root `.env` and currently uses `gpt-4o-mini` directly.
- Job-Fit Analysis loads the optional project-root `.env` and currently uses `gpt-4o-mini` directly.
- Job Discovery has no secret or application-specific environment variable; it calls the Himalayas endpoint directly.
- `python-dotenv` does not override existing process variables by default, so host-provided values take precedence over a local file.
- `VITE_API_BASE_URL` is public build-time configuration and defaults to `http://127.0.0.1:8000`. No frontend secret exposure was found.
- `.gitignore` excludes real `.env` files while allowing the example files.

No new critical configuration defect was found within Caio's authorized scope, so no application code was changed.

### Dependencies

`backend/requirements.txt` includes FastAPI, Uvicorn, OpenAI, pypdf, python-dotenv, python-multipart, pytest, and httpx. The new Job Discovery code uses the already-declared `httpx`; Job-Fit reuses existing OpenAI, PDF, and multipart dependencies. No dependency change was necessary.

The requirements file mixes runtime and test dependencies, and the repository does not declare Python or Node runtime versions. These are deployment-policy follow-ups, not reasons to alter the current MVP dependencies.

### Job Discovery contract

`GET /jobs/search` accepts required query `q` (2–120 characters) and optional `country`. It calls `https://himalayas.app/jobs/api/search` with `q`, `sort=recent`, and `country` when supplied. It normalizes provider records to title, company, summary, seniority, employment type, locations, publication date, description, and application URL, then ranks by title-term matches. Upstream HTTP failures become 502. The tests mock `httpx.get`, so they validate mapping/ranking/error behavior but not live availability, provider uptime, or schema stability.

### Job-Fit contract

`POST /job-fit` accepts multipart form data with required `job_description` (maximum 12,000 characters) and exactly one of `cv_text` (maximum 20,000 characters) or `cv_file` (PDF, maximum 5 MiB). Invalid or ambiguous input is 400; oversized PDFs are 413; extraction/provider failures are returned as 400/502 as applicable. The response contains a bounded score, summary, matching skills, missing skills, strengths, and recommendations. The endpoint calls OpenAI and returns an estimate, not an employment guarantee. Tests patch the analyzer and exercise the validation/API contract without provider calls.

## E. Independently executed validation

The following explicit commands were run with the existing environment and no package installation or upgrade:

| Check | Result |
| --- | --- |
| `python -m pytest -q backend/test_review_cv_api.py backend/test_cv_processing.py backend/test_pdf_processing.py tests/test_interview.py tests/test_jobs.py tests/test_job_fit.py` | **34 passed** |
| `cd frontend && npm run lint` | **Passed** |
| `cd frontend && npm run build` | **Passed**; Vite production bundle generated successfully |
| `python -m pip check` | **Passed**; no broken requirements |
| `git diff --check` | **Passed** after the documentation edits |
| Offline environment/API-contract checks | **Passed**; no live OpenAI or jobs-provider call made |

`backend/test_cv_ai.py` and other manual OpenAI integration scripts were intentionally not executed. The Job Discovery tests mock the external provider, so the 34 passing tests do not establish real-time listing availability.

## F. Production deployment considerations

These items remain open and were documented without implementing them:

- **CORS:** `backend/app.py` allows only local Vite origins on ports 5173–5175. Add the final hosted frontend origin through coordination with Diogo before release.
- **Secrets:** provision `OPENAI_API_KEY` in the backend host environment; never put it in a Vite variable or tracked file.
- **Frontend API URL:** set `VITE_API_BASE_URL` to the final HTTPS backend origin before the production frontend build.
- **Runtimes:** select and test supported Python and Node versions; neither is declared by the repository.
- **Hosting and transport:** choose backend/frontend hosting, production process startup, HTTPS, and observability. No deployment URL is claimed here.
- **Uploads:** configure the total reverse-proxy/request-body limit above 5 MiB so Job-Fit and CV Reviewer can accept a PDF of up to 5 MiB plus multipart form overhead and other fields; a total limit of exactly 5 MiB is insufficient.
- **External jobs provider:** account for Himalayas timeout, availability, rate limits, schema changes, and stale or withdrawn listings. The application does not persist or guarantee listings.
- **Error handling:** current provider failures are mapped to 502 and AI failures to safe 502 responses, but production logging, retries, rate limits, and monitoring still need a deployment decision.
- **Model consistency:** Mock Interview honors `OPENAI_MODEL`; CV Reviewer and Job-Fit Analysis use `gpt-4o-mini`. This is verified current behavior, not an accidental documentation assumption.

## G. Handoff to Diogo

1. Confirm the production frontend origin and update CORS in `backend/app.py` as part of deployment coordination.
2. Provision the backend OpenAI secret and set the frontend public API origin in the chosen hosting platforms.
3. Validate Himalayas behavior and request/upload limits in staging; mocked tests cannot replace that check.
4. Choose runtime/process-manager settings and add deployment monitoring before presenting the application as hosted.

## H. Git and scope status

The branch is `docs/deployment-readiness`, based on the existing local integration merge. This continuation leaves only `README.md` and this audit report modified, unstaged, and uncommitted. No commit, push, additional merge, PR update, deployment, or collaborator message was performed.
