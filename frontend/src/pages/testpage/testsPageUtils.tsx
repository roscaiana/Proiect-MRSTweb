import React from 'react';
import type { Question, QuizMode } from '../../types/quiz';

export const normalizeText = (value: string): string => {
    if (!value) return '';
    return value
        .replace(/\u0219|\u0218/g, 's')
        .replace(/\u021b|\u021a/g, 't')
        .replace(/\u0103|\u0102/g, 'a')
        .replace(/\u00e2|\u00c2/g, 'a')
        .replace(/\u00ee|\u00ce/g, 'i')
        .replace(/\u00c2/g, '')
        .replace(/\uFFFD/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const fmt = (s: number): string => {
    const v = Math.max(0, s);
    return `${Math.floor(v / 60).toString().padStart(2, '0')}:${(v % 60).toString().padStart(2, '0')}`;
};

export const modeLabel = (mode: QuizMode): string => (mode === 'training' ? 'Antrenament' : 'Examen');

export const renderCategoryIcon = (categoryId: string) => {
    if (categoryId === 'legislative-basics') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
        );
    }
    if (categoryId === 'procedures') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="3" width="10" height="4" rx="1" />
                <path d="M6 6h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
                <path d="M9 11h6M9 15h6" />
            </svg>
        );
    }
    if (categoryId === 'ethics') {
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18" />
                <path d="M5 7h14" />
                <path d="M7 7l-3 5a3 3 0 0 0 6 0L7 7z" />
                <path d="M17 7l-3 5a3 3 0 0 0 6 0l-3-5z" />
                <path d="M8 21h8" />
            </svg>
        );
    }
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="12" rx="2" />
            <path d="M8 21h8" />
            <path d="M10 17v4M14 17v4" />
        </svg>
    );
};

export const difficultyLabel = (difficulty: string): string => {
    if (difficulty === 'beginner') return 'Incepator';
    if (difficulty === 'intermediate') return 'Intermediar';
    return 'Avansat';
};

const categoryFallbackById: Record<string, { chapterId: string; chapterTitle: string }> = {
    'legislative-basics': { chapterId: 'legislatie', chapterTitle: 'Legislatie' },
    procedures: { chapterId: 'proceduri', chapterTitle: 'Proceduri' },
    ethics: { chapterId: 'etica', chapterTitle: 'Etica si integritate' },
    technology: { chapterId: 'tehnologie', chapterTitle: 'Tehnologie electorala' },
};

const topicByKeyword: Array<{ chapterId: string; chapterTitle: string; test: RegExp }> = [
    { chapterId: 'legislatie', chapterTitle: 'Legislatie', test: /lege|legisl|constit|mandat|candidat|prag/i },
    { chapterId: 'proceduri', chapterTitle: 'Proceduri', test: /secti|vot|buletin|numar|proces|program/i },
    { chapterId: 'etica', chapterTitle: 'Etica si integritate', test: /etic|integrit|impartial|neutral|conflict/i },
    { chapterId: 'tehnologie', chapterTitle: 'Tehnologie electorala', test: /sistem|electronic|tehnolog|cibern|date/i },
];

export const inferChapter = (q: Question, categoryId: string, fallbackTitle: string) => {
    if (q.chapterId && q.chapterTitle) {
        return { chapterId: normalizeText(q.chapterId), chapterTitle: normalizeText(q.chapterTitle) };
    }
    const text = normalizeText(`${q.text} ${q.options.join(' ')}`).toLowerCase();
    const byKeyword = topicByKeyword.find((x) => x.test.test(text));
    if (byKeyword) return { chapterId: byKeyword.chapterId, chapterTitle: byKeyword.chapterTitle };
    return categoryFallbackById[categoryId] || { chapterId: categoryId, chapterTitle: fallbackTitle || 'General' };
};
