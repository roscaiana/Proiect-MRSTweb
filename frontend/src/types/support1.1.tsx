import type { LucideIcon } from "lucide-react";

export type FaqCategory = {
    id: string;
    title: string;
    icon: LucideIcon;
};

export type FaqItem = {
    category: string;
    question: string;
    answer: string;
};
