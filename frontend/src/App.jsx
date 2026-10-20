import { useState } from "react";

import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import ModeTabs from "./components/ModeTabs";
import MockInterview from "./components/MockInterview";
import CVReviewer from "./components/CVReviewer";
import JobDiscovery from "./components/JobDiscovery";
import JobFitAnalysis from "./components/JobFitAnalysis";

import "./App.css";

function App() {
  const [activeModule, setActiveModule] = useState("interview");

  return (
    <div className="app">
      <Header />

      <div className="app-container">
        <HeroSection compact={false} />

        <ModeTabs
          activeModule={activeModule}
          onChange={setActiveModule}
        />


        <main className="app-main">
          {activeModule === "interview" && <MockInterview />}
          {activeModule === "cv" && <CVReviewer />}
          {activeModule === "jobs" && <JobDiscovery />}
          {activeModule === "job-fit" && <JobFitAnalysis />}
        </main>

      </div>

      <footer className="app-footer">
        Built with React, FastAPI and OpenAI
      </footer>
    </div>
  );
}

export default App;
