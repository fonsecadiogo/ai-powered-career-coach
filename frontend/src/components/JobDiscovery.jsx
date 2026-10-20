import { useState } from "react";
import { searchJobs } from "../services/api";

export default function JobDiscovery() {
  const [query, setQuery] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(event) {
    event.preventDefault();

    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setError("Please enter at least 2 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setJobs([]);
    setSearched(false);

    try {
      const result = await searchJobs(searchTerm);
      setJobs(result.jobs ?? []);
      setSearched(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="job-discovery">
      <h2>Job Discovery</h2>

      <p>
        Discover real remote job opportunities based on
        your career interests.
      </p>

      <form onSubmit={handleSearch} className="jobs-search-form">
        <label htmlFor="job-query">Job title or keywords</label>

        <input
          id="job-query"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Junior AI Engineer"
          maxLength={120}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Jobs"}
        </button>
      </form>

      {error && (
        <p role="alert" className="jobs-error">
          {error}
        </p>
      )}

      {searched && (
        <div className="jobs-results" aria-live="polite">
          <h3>{jobs.length} opportunities found</h3>

          {jobs.length === 0 && (
            <p>No opportunities found. Try different keywords.</p>
          )}

          <div className="jobs-list">
            {jobs.map((job, index) => (
              <article
                className="job-card"
                key={`${job.apply_url || job.title}-${index}`}
              >
                <h4>{job.title}</h4>

                <p className="job-company">
                  {job.company || "Company not specified"}
                </p>

                <p>
                  <strong>Remote eligibility:</strong>{" "}
                  {job.locations?.length
                    ? job.locations.join(", ")
                    : "Not specified"}
                </p>

                <p>
                  <strong>Seniority:</strong>{" "}
                  {Array.isArray(job.seniority)
                    ? job.seniority.join(", ") || "Not specified"
                    : job.seniority || "Not specified"}
                </p>

                {job.summary && (
                  <p className="job-summary">{job.summary}</p>
                )}

                {job.apply_url?.startsWith("https://") && (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="job-apply-link"
                  >
                    View Job / Apply ↗
                  </a>
                )}
              </article>
            ))}
          </div>

          <p className="jobs-attribution">
            Job listings provided by{" "}
            <a
              href="https://himalayas.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Himalayas
            </a>
            . Check each listing for eligibility and availability.
          </p>
        </div>
      )}
    </section>
  );
}
