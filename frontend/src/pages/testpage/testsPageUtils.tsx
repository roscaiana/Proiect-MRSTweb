import React from 'react';
import type { Question, QuizMode } from '../../types/quiz';

export const normalizeText = (value: string): string => {
    if (!value) return '';

    let normalized = value;

    // Repair common mojibake sequences while preserving Romanian diacritics.
    const replacements: Array<[RegExp, string]> = [
        [/ÃŽ/g, 'Î'],
        [/Ã®/g, 'î'],
        [/Ã‚/g, 'Â'],
        [/Ã¢/g, 'â'],
        [/Ä‚/g, 'Ă'],
        [/Äƒ/g, 'ă'],
        [/È˜/g, 'Ș'],
        [/È™/g, 'ș'],
        [/Èš/g, 'Ț'],
        [/È›/g, 'ț'],
        [/Åž/g, 'Ș'],
        [/ÅŸ/g, 'ș'],
        [/Å¢/g, 'Ț'],
        [/Å£/g, 'ț'],
    ];

    replacements.forEach(([pattern, replacement]) => {
        normalized = normalized.replace(pattern, replacement);
    });

    return normalized
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
    if (difficulty === 'beginner') return 'Începător';
    if (difficulty === 'intermediate') return 'Intermediar';
    return 'Avansat';
};

const categoryFallbackById: Record<string, { chapterId: string; chapterTitle: string }> = {
    'legislative-basics': { chapterId: 'legislatie', chapterTitle: 'Legislație' },
    procedures: { chapterId: 'proceduri', chapterTitle: 'Proceduri' },
    ethics: { chapterId: 'etica', chapterTitle: 'Etică și integritate' },
    technology: { chapterId: 'tehnologie', chapterTitle: 'Tehnologie electorală' },
};

const topicByKeyword: Array<{ chapterId: string; chapterTitle: string; test: RegExp }> = [
    { chapterId: 'legislatie', chapterTitle: 'Legislație', test: /lege|legisl|constit|mandat|candidat|prag/i },
    { chapterId: 'proceduri', chapterTitle: 'Proceduri', test: /sec(ți|ti)|vot|buletin|num(ă|a)r|proces|program/i },
    { chapterId: 'etica', chapterTitle: 'Etică și integritate', test: /etic|integrit|impartial|neutral|conflict/i },
    { chapterId: 'tehnologie', chapterTitle: 'Tehnologie electorală', test: /sistem|electronic|tehnolog|cibern|date/i },
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
