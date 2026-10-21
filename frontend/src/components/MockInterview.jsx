import { useState } from "react";
import {
  startInterview,
  submitInterviewAnswer,
  finishInterview,
} from "../services/api";

export default function MockInterview() {
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [session, setSession] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentTurn = session?.turns?.find(
    (turn) => turn.answer === null
  );

  const answeredCount =
    session?.turns?.filter((turn) => turn.answer !== null).length ?? 0;

  const handleStart = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await startInterview(role, jobDescription);
      setSession(result);
      setEvaluation(null);
      setAnswer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (event) => {
    event.preventDefault();

    if (!answer.trim()) return;

    setError("");
    setLoading(true);

    try {
      const result = await submitInterviewAnswer(
        session,
        answer.trim()
      );

      setSession(result);
      setAnswer("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await finishInterview(session);
      setSession(result.session);
      setEvaluation(result.evaluation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSession(null);
    setEvaluation(null);
    setAnswer("");
    setError("");
  };

  return (
    <section className="mock-interview">
      <h2>AI Mock Interview</h2>
      <p>
        Practice a professional interview with 15 adaptive
        questions and receive personalized feedback.
      </p>

      {error && <p role="alert" className="error">{error}</p>}

      {!session && (
        <form onSubmit={handleStart}>
          <label htmlFor="interview-role">Target Role</label>
          <input
            id="interview-role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="Junior AI Engineer"
            required
            maxLength={120}
          />

          <label htmlFor="job-description">
            Job Description (Optional)
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) =>
              setJobDescription(event.target.value)
            }
            placeholder="Paste the job requirements here..."
            maxLength={5000}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Starting..." : "Start Interview"}
          </button>
        </form>
      )}

      {session && !evaluation && (
        <div className="interview-session">
          <p>
            Progress: {answeredCount} / 15 questions answered
          </p>
          <progress value={answeredCount} max={15} />

          {currentTurn && (
            <form onSubmit={handleAnswer}>
              <h3>Question {answeredCount + 1}</h3>
              <p>{currentTurn.question.question}</p>

              <label htmlFor="candidate-answer">
                Your Answer
              </label>
              <textarea
                id="candidate-answer"
                value={answer}
                onChange={(event) =>
                  setAnswer(event.target.value)
                }
                placeholder="Type your answer..."
                required
                maxLength={5000}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Processing..." : "Submit Answer"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={handleFinish}
            disabled={loading || answeredCount === 0}
          >
            Finish Interview
          </button>
        </div>
      )}

      {evaluation && (
        <div className="interview-results">
          <h3>Interview Assessment</h3>
          <p>
            Overall Score: {evaluation.overall_score}/100
          </p>
          <p>
            Questions Answered: {evaluation.answered_questions}
            /{evaluation.planned_questions}
          </p>

          <p>{evaluation.assessment.summary}</p>

          <h4>Strengths</h4>
          <ul>
            {evaluation.assessment.strengths.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h4>Areas for Improvement</h4>
          <ul>
            {evaluation.assessment.weaknesses.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <h4>Recommendations</h4>
          <ul>
            {evaluation.assessment.suggestions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>

          <p>{evaluation.disclaimer}</p>

          <button type="button" onClick={handleReset}>
            Start New Interview
          </button>
        </div>
      )}
    </section>
  );
}
