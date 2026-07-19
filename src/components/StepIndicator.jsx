const steps = ["Platos", "Bebidas", "Postres", "Resumen"];

export default function StepIndicator({ currentStep, setCurrentStep }) {
  return (
    <nav className="steps" aria-label="Pasos del pedido">
      {steps.map((step, index) => (
        <button
          type="button"
          key={step}
          className={currentStep === index ? "active" : ""}
          onClick={() => setCurrentStep(index)}
        >
          <span>{index + 1}</span>
          {step}
        </button>
      ))}
    </nav>
  );
}
