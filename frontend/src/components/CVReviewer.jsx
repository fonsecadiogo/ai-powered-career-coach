
import { useRef, useState } from "react";
import { reviewCV } from "../services/api";
import DemoScenarioSelector from "./DemoScenarioSelector";

export default function CVReviewer() {
  // ============================================================
  // 1. FORM STATE
  // ============================================================

  // Store the values entered by the user.
  const [role, setRole] = useState("");
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

  // ============================================================
  // 2. APPLICATION STATE
  // ============================================================

  // Track whether the AI request is processing.
  const [loading, setLoading] = useState(false);

  // Store validation errors or backend errors.
  const [error, setError] = useState("");

  // Store the CV analysis returned by FastAPI.
  const [result, setResult] = useState(null);

  // ============================================================
  // 3. FILE INPUT REFERENCE
  // ============================================================

  // useRef gives us access to the actual HTML file input.
  // This allows us to clear the selected file without
  // refreshing the browser page.
  const fileInputRef = useRef(null);

  // ============================================================
  // 4. REMOVE PDF FUNCTION
  // ============================================================

  function handleRemoveFile() {
    // Remove the uploaded PDF from React state.
    setCvFile(null);

    // Clear the browser's file input.
    // This also allows selecting the same PDF again.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Clear any previous validation error.
    setError("");
  }

  // ============================================================
  // 5. LOAD DEMO SCENARIO
  // ============================================================

  function handleLoadDemo(scenario) {
    // Remove any previously uploaded PDF from React state.
    setCvFile(null);

    // Clear the actual browser file selector.
    // This prevents submitting a PDF and demo CV text together.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Populate the form using the selected fictional candidate.
    setRole(scenario.role);
    setCvText(scenario.cv);
    setJobDescription(scenario.jobDescription);
    setSelectedScenarioId(scenario.id);

    // Clear previous errors and analysis results.
    // Each scenario should start with a clean result.
    setError("");
    setResult(null);
  }

  // ============================================================
  // 6. FORM SUBMISSION
  // ============================================================

  async function handleSubmit(event) {
    // Prevent the browser from reloading the page.
    event.preventDefault();

    // Reset previous errors and analysis results.
    setError("");
    setResult(null);

    // ----------------------------------------------------------
    // Validate the target role.
    // ----------------------------------------------------------

    if (!role.trim()) {
      setError("Please enter the target job role.");
      return;
    }

    // ----------------------------------------------------------
    // Require exactly one CV input.
    // ----------------------------------------------------------

    // The user must upload a PDF or paste CV text.
    if (!cvFile && !cvText.trim()) {
      setError("Please upload a PDF or paste your CV text.");
      return;
    }

    // Avoid sending both PDF and text simultaneously.
    if (cvFile && cvText.trim()) {
      setError("Please provide either a PDF or CV text, not both.");
      return;
    }

    // ----------------------------------------------------------
    // Validate the uploaded PDF.
    // ----------------------------------------------------------

    if (cvFile) {
      // Check the file extension.
      if (!cvFile.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }

      // Maximum PDF size: 5 MiB.
      if (cvFile.size > 5 * 1024 * 1024) {
        setError("The PDF must be 5 MB or smaller.");
        return;
      }
    }

    // ----------------------------------------------------------
    // Send the request to the backend.
    // ----------------------------------------------------------

    setLoading(true);

    try {
      // Use the existing API service.
      // The backend handles PDF extraction and AI evaluation.
      const review = await reviewCV({
        role: role.trim(),
        cvText: cvText.trim(),
        cvFile,
        jobDescription,
      });

      // Store the response from FastAPI.
      // Updating state causes React to render the results.
      setResult(review);
    } catch (requestError) {
      // Display an error if the request fails.
      setError(
        requestError.message || "Unable to analyze the CV."
      );
    } finally {
      // Re-enable the form whether the request succeeds or fails.
      setLoading(false);
    }
  }

  // ============================================================
  // 7. USER INTERFACE
  // ============================================================

  return (
    <section className="cv-reviewer">
      {/* Page title */}
      <h2>CV Reviewer</h2>

      {/* Page description */}
      <p>
        Analyze your CV for a target role and receive
        personalized AI-powered feedback.
      </p>

      {/* ======================================================
          DEMO SCENARIO SELECTOR
          ====================================================== */}

      <DemoScenarioSelector
        onSelect={handleLoadDemo}
        disabled={loading}
        selectedId={selectedScenarioId}
      />

      {/* ======================================================
          CV REVIEW FORM
          ====================================================== */}

      <form onSubmit={handleSubmit}>
        {/* TARGET JOB ROLE */}

        <div>
          <label htmlFor="cv-role">
            Target job role
          </label>

          <input
            id="cv-role"
            type="text"
            value={role}
            onChange={(event) => {
              // Update the target role as the user types.
              setRole(event.target.value);
            }}
            placeholder="e.g. Junior AI Engineer"
            required
          />
        </div>

        {/* ====================================================
            PDF UPLOAD
            ==================================================== */}

        <div>
          <label htmlFor="cv-file">
            Upload CV (PDF)
          </label>

          {/* Align the file selector and Remove button. */}
          <div className="cv-upload-row">
            <input
              id="cv-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              disabled={loading}
              onChange={(event) => {
                // Save the selected PDF in React state.
                setCvFile(event.target.files[0] || null);
              }}
            />

            {/* Show the remove button only when a PDF exists. */}
            {cvFile && (
              <button
                type="button"
                className="cv-remove-file"
                onClick={handleRemoveFile}
                disabled={loading}
                aria-label={`Remove ${cvFile.name}`}
                title="Remove selected PDF"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ====================================================
            ALTERNATIVE CV TEXT INPUT
            ==================================================== */}

        <div>
          <label htmlFor="cv-text">
            Or paste your CV text
          </label>

          <textarea
            id="cv-text"
            value={cvText}
            onChange={(event) => {
              // Store the CV text entered by the user.
              setCvText(event.target.value);
            }}
            rows={8}
            placeholder="Paste your CV here..."
          />
        </div>

        {/* ====================================================
            OPTIONAL JOB DESCRIPTION
            ==================================================== */}

        <div>
          <label htmlFor="job-description">
            Job description (optional)
          </label>

          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => {
              // Update the job description.
              setJobDescription(event.target.value);
            }}
            rows={5}
            placeholder="Paste the job description here..."
          />
        </div>

        {/* ====================================================
            ANALYZE CV BUTTON
            ==================================================== */}

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Analyzing CV..." : "Analyze CV"}
        </button>
      </form>

      {/* ======================================================
          ERROR DISPLAY
          ====================================================== */}

      {error && (
        <p
          role="alert"
          className="cv-error"
        >
          {error}
        </p>
      )}

      {/* ======================================================
          CV ANALYSIS RESULTS
          ====================================================== */}

      {result && (
        <section
          className="cv-results"
          aria-live="polite"
        >
          <h3>CV Analysis Results</h3>

          {/* OVERALL SCORE */}

          <p>
            <strong>Overall score:</strong>{" "}
            {result.score}/100
          </p>

          {/* STRENGTHS */}

          <h4>Strengths</h4>

          <ul>
            {result.strengths.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

          {/* WEAKNESSES */}

          <h4>Weaknesses</h4>

          <ul>
            {result.weaknesses.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>

          {/* IMPROVEMENT SUGGESTIONS */}

          <h4>Suggestions</h4>

          <ul>
            {result.suggestions.map((item, index) => (
              <li key={index}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
