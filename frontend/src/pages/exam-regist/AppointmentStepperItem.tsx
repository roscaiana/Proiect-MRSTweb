type AppointmentStepperItemProps = {
    label: string;
    index: number;
    currentStep: number;
};

export default function AppointmentStepperItem({
    label,
    index,
    currentStep,
}: AppointmentStepperItemProps) {
    const stepNumber = index + 1;

    return (
        <div className={`step-item ${currentStep > stepNumber ? "done" : ""} ${currentStep === stepNumber ? "active" : ""}`}>
            <span className="step-index">{stepNumber}</span>
            <span className="step-label">{label}</span>
        </div>
    );
}
