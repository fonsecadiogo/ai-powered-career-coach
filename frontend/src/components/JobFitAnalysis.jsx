import { useState } from "react";
import { analyzeJobFit } from "../services/api";

export default function JobFitAnalysis() {
  const [cvText, setCvText] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!cvFile && !cvText.trim()) {
      setError("Please upload a PDF or paste your CV text.");
      return;
    }

    if (cvFile && cvText.trim()) {
      setError("Please provide either a PDF or CV text, not both.");
      return;
    }

    if (!jobDescription.trim()) {
      setError("Please enter the job description.");
      return;
    }

    if (cvText.trim().length > 20000) {
      setError("CV text must be 20,000 characters or fewer.");
      return;
    }

    if (jobDescription.trim().length > 12000) {
      setError(
        "Job description must be 12,000 characters or fewer."
      );
      return;
    }

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
      const analysis = await analyzeJobFit({
        cvText,
        cvFile,
        jobDescription,
      });

      setResult(analysis);
    } catch (requestError) {
      setError(
        requestError.message || "Unable to analyze job compatibility."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="job-fit">
      <h2>Job-Fit Analysis</h2>

      <p>
        Compare your CV with a job description and discover
        your matching skills, gaps, and opportunities for growth.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fit-cv-file">
            Upload CV (PDF)
          </label>

          <input
            id="fit-cv-file"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) =>
              setCvFile(event.target.files[0] || null)
            }
          />
        </div>

        <div>
          <label htmlFor="fit-cv-text">
            Or paste your CV text
          </label>

          <textarea
            id="fit-cv-text"
            value={cvText}
            onChange={(event) => setCvText(event.target.value)}
            rows={8}
            maxLength={20000}
            placeholder="Paste your CV here..."
          />
        </div>

        <div>
          <label htmlFor="fit-job-description">
            Job description
          </label>

          <textarea
            id="fit-job-description"
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            rows={7}
            maxLength={12000}
            placeholder="Paste the job requirements here..."
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing compatibility..." : "Analyze Job Fit"}
        </button>
      </form>

      {error && (
        <p role="alert" className="job-fit-error">
          {error}
        </p>
      )}

      {result && (
        <section className="job-fit-results" aria-live="polite">
          <h3>Job-Fit Assessment</h3>

          <p>
            <strong>Compatibility Score:</strong>{" "}
            {result.score}/100
          </p>

          <p>{result.summary}</p>

          <h4>Matching Skills</h4>
          <ul>
            {result.matching_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h4>Requirements Not Demonstrated</h4>
          <ul>
            {result.missing_skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h4>Strengths</h4>
          <ul>
            {result.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h4>Recommendations</h4>
          <ul>
            {result.recommendations.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <p className="job-fit-disclaimer">
            AI-generated compatibility estimate based on the
            provided documents. Not a hiring decision.
          </p>
        </section>
      )}
    </section>
  );
}
