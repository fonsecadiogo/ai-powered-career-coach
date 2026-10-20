function HeroSection({ compact = false }) {
  return (
    <section
      className={`atena-hero ${compact ? "atena-hero--compact" : ""}`}
      aria-label="Meet Atena, your AI interviewer"
    >
      <div className="atena-hero__content">
        <span className="atena-hero__eyebrow">
          YOUR PERSONAL AI CAREER COACH
        </span>

        <h1>Hello, I'm Atena.</h1>

        {!compact && (
          <>
            <p className="atena-hero__description">
              I will be your AI-powered interview companion.
              I will help you practice professional interviews,
              review your performance, and build confidence
              for real job opportunities.
            </p>

            <p className="atena-hero__hint">
              Choose a mode below to start:
              Mock Interview or CV Reviewer.
            </p>
          </>
        )}

        {compact && (
          <p className="atena-hero__compact-message">
            Your interview is in progress. Let's make it count!
          </p>
        )}
      </div>

      <div className="atena-hero__visual">
        <div className="atena-avatar">
          <img
            src="/atena.png"
            alt="Atena, your futuristic AI interview companion"
          />
        </div>

        <div className="atena-status">
          <span className="atena-status__dot" />
          Atena AI Assistant
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
