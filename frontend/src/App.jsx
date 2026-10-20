
import { useState } from "react";

// Import the shared interface components.
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ModeTabs from "./components/ModeTabs";

// Import both functional modules.
import MockInterview from "./components/MockInterview";
import CVReviewer from "./components/CVReviewer";

// Import the shared application styles.
import "./App.css";

function App() {
  // Track which module the user has selected.
  const [activeModule, setActiveModule] = useState("interview");

  return (
    <div className="app">
      <Header />

      <div className="app-container">
        <HeroSection compact={false} />

        {/* Allow users to switch between the two modules. */}
        <ModeTabs
          activeModule={activeModule}
          onChange={setActiveModule}
        />

        <main className="app-main">
          {/* Render the selected module. */}
          {activeModule === "interview" ? (
            <MockInterview />
          ) : (
            <CVReviewer />
          )}
        </main>
      </div>

      <footer className="app-footer">
        Built with React, FastAPI and OpenAI
      </footer>
    </div>
  );
}

export default App;
