export type Role = 'admin' | 'user';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface FaqCategory {
    id: string;
    title: string;
    icon: any;
}

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}