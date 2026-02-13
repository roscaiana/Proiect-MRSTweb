export type FaqCategory = {
    id: string;
    title: string;
    icon: any;
};

export type FaqItem = {
    category: string;   
    question: string;
    answer: string;
};