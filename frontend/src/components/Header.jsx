function Header() {
  return (
    <header className="site-header">
      <div className="site-brand">
        <div className="brand-symbol" aria-hidden="true">
          ✦
        </div>

        <div className="brand-copy">
          <span className="brand-name">AI-Powered Career Coach</span>
          <span className="brand-subtitle">
            Your next career move starts here
          </span>
        </div>
      </div>

      <div className="header-status">
        <span className="status-dot" aria-hidden="true" />
        Powered by AI
      </div>
    </header>
  );
}

export default Header;
