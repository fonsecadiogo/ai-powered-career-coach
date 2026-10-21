
import { useRef, useState } from "react";
import { analyzeJobFit } from "../services/api";
import DemoScenarioSelector from "./DemoScenarioSelector";

export default function JobFitAnalysis() {
  // ============================================================
  // 1. FORM STATE
  // ============================================================

  // Store the candidate's CV and the job description.
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selectedScenarioId, setSelectedScenarioId] = useState("");

  // ============================================================
  // 2. APPLICATION STATE
  // ============================================================

  // Track API requests, errors, and AI analysis results.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // ============================================================
  // 3. FILE INPUT REFERENCE
  // ============================================================

  // Reference to the browser's actual PDF input.
  // We use it to clear the selected file without a page reload.
  const fileInputRef = useRef(null);

  function handleLoadDemo(scenario) {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCvText(scenario.cv);
    setJobDescription(scenario.jobDescription);
    setSelectedScenarioId(scenario.id);
    setError("");
    setResult(null);
  }

  // ============================================================
  // 4. REMOVE PDF FUNCTION
  // ============================================================

  function handleRemoveFile() {
    // Remove the selected PDF from React state.
    setCvFile(null);

    // Clear the browser's file input.
    // This lets users select the same PDF again.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Clear previous validation errors.
    setError("");
  }

  // ============================================================
  // 5. FORM SUBMISSION AND VALIDATION
  // ============================================================

  async function handleSubmit(event) {
    // Prevent the browser from refreshing when submitting.
    event.preventDefault();

    // Clear old errors and results.
    setError("");
    setResult(null);

    // Require a CV as PDF or text.
    if (!cvFile && !cvText.trim()) {
      setError("Please upload a PDF or paste your CV text.");
      return;
    }

    // The API accepts exactly one CV input.
    if (cvFile && cvText.trim()) {
      setError("Please provide either a PDF or CV text, not both.");
      return;
    }

    // Job description is mandatory.
    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    // Validate CV text length.
    if (cvText.trim().length > 20000) {
      setError("CV text must be 20,000 characters or fewer.");
      return;
    }

    // Validate job description length.
    if (jobDescription.trim().length > 12000) {
      setError(
        "Job description must be 12,000 characters or fewer."
      );
      return;
    }

    // Validate PDF file extension and size.
    if (cvFile) {
      if (!cvFile.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }

      // Maximum permitted PDF size is 5 MiB.
      if (cvFile.size > 5 * 1024 * 1024) {
        setError("The PDF must be 5 MB or smaller.");
        return;
      }
    }

    // Mark the request as loading.
    setLoading(true);

    try {
      // Send the CV and job description to FastAPI.
      // The backend performs the AI compatibility assessment.
      const analysis = await analyzeJobFit({
        cvText,
        cvFile,
        jobDescription,
      });

      // Store the result so React can display it.
      setResult(analysis);
    } catch (requestError) {
      // Show an error if the API request fails.
      setError(
        requestError.message ||
          "Unable to analyze job compatibility."
      );
    } finally {
      // Re-enable the interface after the request.
      setLoading(false);
    }
  }

  // ============================================================
  // 6. USER INTERFACE
  // ============================================================

  return (
    <section className="job-fit">
      <h2>Job-Fit Analysis</h2>

      <p>
        Compare your CV with a job description and discover
        your matching skills, gaps, and opportunities for growth.
      </p>

      <DemoScenarioSelector
        onSelect={handleLoadDemo}
        disabled={loading}
        selectedId={selectedScenarioId}
      />

      {/* ======================================================
          JOB-FIT FORM
          ====================================================== */}

      <form onSubmit={handleSubmit}>
        {/* PDF UPLOAD */}

        <div>
          <label htmlFor="fit-cv-file">
            Upload CV (PDF)
          </label>

          {/* Keep the PDF input and removal button in one row. */}
          <div className="fit-upload-row">
            <input
              id="fit-cv-file"
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              disabled={loading}
              onChange={(event) => {
                // Store the first file selected by the user.
                setCvFile(event.target.files[0] || null);
              }}
            />

            {/* Only show the X button when a PDF is selected. */}
            {cvFile && (
              <button
                type="button"
                className="fit-remove-file"
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

        {/* ALTERNATIVE CV TEXT INPUT */}

        <div>
          <label htmlFor="fit-cv-text">
            Or paste your CV text
          </label>

          <textarea
            id="fit-cv-text"
            value={cvText}
            onChange={(event) => {
              // Update the CV text as the user types.
              setCvText(event.target.value);
            }}
            rows={8}
            maxLength={20000}
            placeholder="Paste your CV here..."
          />
        </div>

        {/* REQUIRED JOB DESCRIPTION */}

        <div>
          <label htmlFor="fit-job-description">
            Job description
          </label>

          <textarea
            id="fit-job-description"
            value={jobDescription}
            onChange={(event) => {
              // Update the job description.
              setJobDescription(event.target.value);
            }}
            rows={7}
            maxLength={12000}
            placeholder="Paste the job requirements here..."
            required
          />
        </div>

        {/* SUBMIT BUTTON */}

        <button type="submit" disabled={loading}>
          {loading
            ? "Analyzing compatibility..."
            : "Analyze Job Fit"}
        </button>
      </form>

      {/* ======================================================
          ERROR MESSAGES
          ====================================================== */}

      {error && (
        <p role="alert" className="job-fit-error">
          {error}
        </p>
      )}

      {/* ======================================================
          JOB-FIT ANALYSIS RESULTS
          ====================================================== */}

      {result && (
        <section
          className="job-fit-results"
          aria-live="polite"
        >
          <h3>Job-Fit Assessment</h3>

          {/* COMPATIBILITY SCORE */}

          <p>
            <strong>Compatibility Score:</strong>{" "}
            {result.score}/100
          </p>

          {/* OVERALL SUMMARY */}

          <p>{result.summary}</p>

          {/* MATCHING SKILLS */}

          <h4>Matching Skills</h4>

          <ul>
            {result.matching_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          {/* MISSING OR UNDOCUMENTED REQUIREMENTS */}

          <h4>Requirements Not Demonstrated</h4>

          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          {/* CANDIDATE STRENGTHS */}

          <h4>Strengths</h4>

          <ul>
            {result.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {/* ACTIONABLE RECOMMENDATIONS */}

          <h4>Recommendations</h4>

          <ul>
            {result.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          {/* EXPLANATION OF THE AI SCORE */}

          <p className="job-fit-disclaimer">
            AI-generated compatibility estimate based on the
            provided documents. Not a hiring decision.
          </p>
        </section>
      )}
    </section>
  );
}
