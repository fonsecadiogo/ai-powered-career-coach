const modules = [
  {
    id: "interview",
    name: "Mock Interview",
    description: "Practice with Atena",
    available: true,
  },
  {
    id: "cv",
    name: "CV Reviewer",
    description: "Improve your CV",
    available: true,
  },
  {
    id: "jobs",
    name: "Job Discovery",
    description: "Find opportunities",
    available: true,
  },
  {
    id: "job-fit",
    name: "Job-Fit Analysis",
    description: "Discover your skills gap",
    available: true,
  },
];

function ModeTabs({ activeModule, onChange }) {
  return (
    <nav className="mode-tabs" aria-label="Career coaching modules">
      {modules.map((module) => (
        <button
          key={module.id}
          type="button"
          className={`mode-tab ${
            activeModule === module.id ? "mode-tab--active" : ""
          }`}
          onClick={() => onChange(module.id)}
          disabled={!module.available}
          aria-pressed={activeModule === module.id}
        >
          <span className="mode-tab__name">{module.name}</span>

          <span className="mode-tab__description">
            {module.available ? module.description : "Coming soon"}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default ModeTabs;
