import { DEMO_SCENARIOS } from "../data/demoData";

export default function DemoScenarioSelector({
  onSelect,
  disabled = false,
  selectedId = "",
}) {
  return (
    <div className="demo-scenarios">
      <div className="demo-scenarios__options">
        {DEMO_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            className={`demo-scenario-button ${
              selectedId === scenario.id ? "demo-scenario-button--selected" : ""
            }`}
            onClick={() => onSelect(scenario)}
            disabled={disabled}
            aria-pressed={selectedId === scenario.id}
          >
            {scenario.label}
          </button>
        ))}
      </div>
    </div>
  );
}
