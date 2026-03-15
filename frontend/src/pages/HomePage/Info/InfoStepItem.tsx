export type InfoStep = {
    nr: string;
    title: string;
    desc: string;
};

type InfoStepItemProps = {
    step: InfoStep;
    isActive: boolean;
};

export default function InfoStepItem({ step, isActive }: InfoStepItemProps) {
    return (
        <div className={`step-item ${isActive ? "active-step" : ""}`}>
            <div className="step-number">{step.nr}</div>
            <div className="step-details">
                <h5>{step.title}</h5>
                <p>{step.desc}</p>
            </div>
        </div>
    );
}
