
import { useState } from "react";
import MockInterview from "./components/MockInterview";
import "./App.css";

function App() {
  const [activeModule, setActiveModule] = useState("interview");

  return (
    <div className="app">
      <header className="app-header">
        <h1>AI-Powered Career Coach</h1>
        <p>Your AI-powered career development assistant</p>
      </header>

      <nav aria-label="Main navigation">
        <button
          type="button"
          onClick={() => setActiveModule("interview")}
          aria-pressed={activeModule === "interview"}
        >
          Mock Interview
        </button>

        <button
          type="button"
          onClick={() => setActiveModule("cv")}
          aria-pressed={activeModule === "cv"}
        >
          CV Reviewer
        </button>
      </nav>

      <main>
        {activeModule === "interview" ? (
          <MockInterview />
        ) : (
          <section>
            <h2>CV Reviewer</h2>
            <p>This feature is currently under development.</p>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;