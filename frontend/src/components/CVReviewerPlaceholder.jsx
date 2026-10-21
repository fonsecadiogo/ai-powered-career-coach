function CVReviewerPlaceholder() {
  return (
    <section
      className="cv-placeholder"
      aria-labelledby="cv-placeholder-title"
    >
      <div className="cv-placeholder__icon" aria-hidden="true">
        📄
      </div>

      <span className="cv-placeholder__eyebrow">
        AI-POWERED CV ANALYSIS
      </span>

      <h2 id="cv-placeholder-title">
        Make your CV stand out.
      </h2>

      <p className="cv-placeholder__description">
        Get personalized feedback on your CV, discover
        your strengths, identify areas for improvement,
        and prepare for your next career opportunity.
      </p>

      <div className="cv-placeholder__features">
        <span>CV Analysis</span>
        <span>Skills Assessment</span>
        <span>Actionable Feedback</span>
      </div>

      <p className="cv-placeholder__status" role="status">
        This feature is coming soon.
      </p>
    </section>
  );
}

export default CVReviewerPlaceholder;
