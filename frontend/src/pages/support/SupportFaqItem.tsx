import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/types/support1.1";

type SupportFaqItemProps = {
    faq: FaqItem;
    index: number;
    isOpen: boolean;
    onToggle: (index: number) => void;
};

export default function SupportFaqItem({ faq, index, isOpen, onToggle }: SupportFaqItemProps) {
    return (
        <div className={`faq-item ${isOpen ? "active" : ""}`}>
            <button onClick={() => onToggle(index)} className="faq-question-btn">
                <span className="faq-question-text">{faq.question}</span>
                <div className="faq-icon-wrapper">
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>
            <div className="faq-answer-wrapper">
                <div className="faq-answer-inner">
                    <div className="faq-answer-content">
                        <div className="faq-divider"></div>
                        <p className="faq-answer-text">{faq.answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
