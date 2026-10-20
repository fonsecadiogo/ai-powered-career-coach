
import { useState } from "react";
import { reviewCV } from "../services/api";

export default function CVReviewer() {
  // Store the form values in React state.
  const [role, setRole] = useState("");
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  // Store request status and the AI analysis result.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    // Prevent the browser from reloading the page.
    event.preventDefault();

    setError("");
    setResult(null);

    // Require a target role.
    if (!role.trim()) {
      setError("Please enter the target job role.");
      return;
    }

    // Require exactly one CV input.
    if (!cvFile && !cvText.trim()) {
      setError("Please upload a PDF or paste your CV text.");
      return;
    }

    if (cvFile && cvText.trim()) {
      setError("Please provide either a PDF or CV text, not both.");
      return;
    }

    // Validate the uploaded PDF before contacting the backend.
    if (cvFile) {
      if (!cvFile.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }

      if (cvFile.size > 5 * 1024 * 1024) {
        setError("The PDF must be 5 MB or smaller.");
        return;
      }
    }

    setLoading(true);

    try {
      // Call the shared API service rather than using fetch here.
      const review = await reviewCV({
        role: role.trim(),
        cvText: cvText.trim(),
        cvFile,
        jobDescription,
      });

      setResult(review);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      // Always clear the loading indicator.
      setLoading(false);
    }
  }

  return (
    <section className="cv-reviewer">
      <h2>CV Reviewer</h2>
      <p>
        Analyze your CV for a target role and receive
        personalized AI-powered feedback.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="cv-role">Target job role</label>
          <input
            id="cv-role"
            type="text"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Junior AI Engineer"
            required
          />
        </div>

        <div>
          <label htmlFor="cv-file">Upload CV (PDF)</label>
          <input
            id="cv-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              setCvFile(event.target.files[0] || null);
            }}
          />
        </div>

        <div>
          <label htmlFor="cv-text">Or paste your CV text</label>
          <textarea
            id="cv-text"
            value={cvText}
            onChange={(event) => setCvText(event.target.value)}
            rows={8}
            placeholder="Paste your CV here..."
          />
        </div>

        <div>
          <label htmlFor="job-description">
            Job description (optional)
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            rows={5}
            placeholder="Paste the job description here..."
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing CV..." : "Analyze CV"}
        </button>
      </form>

      {error && (
        <p role="alert" className="cv-error">
          {error}
        </p>
      )}

      {result && (
        <section className="cv-results" aria-live="polite">
          <h3>CV Analysis Results</h3>

          <p>
            <strong>Overall score:</strong> {result.score}/100
          </p>

          <h4>Strengths</h4>
          <ul>
            {result.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h4>Weaknesses</h4>
          <ul>
            {result.weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h4>Suggestions</h4>
          <ul>
            {result.suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
