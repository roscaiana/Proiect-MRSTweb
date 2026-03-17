type AppointmentStepperItemProps = {
    label: string;
    index: number;
    activeTab: number;
    highestUnlockedTab: number;
    onTabClick: (stepNumber: number) => void;
};

export default function AppointmentStepperItem({
    label,
    index,
    activeTab,
    highestUnlockedTab,
    onTabClick,
}: AppointmentStepperItemProps) {
    const stepNumber = index + 1;
    const isActive = activeTab === stepNumber;
    const isDone = highestUnlockedTab > stepNumber;
    const isLocked = stepNumber > highestUnlockedTab;

    return (
        <button
            type="button"
            className={`step-item ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
            onClick={() => onTabClick(stepNumber)}
            disabled={isLocked}
            aria-current={isActive ? "step" : undefined}
        >
            <span className="step-index">{stepNumber}</span>
            <span className="step-label">{label}</span>
        </button>
    );
}
