import { useEffect } from 'react';
import type { RefObject } from 'react';

type Options = {
    enabled: boolean;
    currentQuestionIndex: number | null;
    questionCount: number;
    refs: Array<RefObject<HTMLDivElement | null>>;
};

export const useQuestionGridAutoScroll = ({ enabled, currentQuestionIndex, questionCount, refs }: Options) => {
    useEffect(() => {
        if (!enabled || currentQuestionIndex === null) return;

        const scrollCurrentButtonIntoView = (container: HTMLDivElement | null) => {
            const currentButton = container?.querySelector<HTMLButtonElement>('.grid-btn.current');
            currentButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        };

        const rafId = window.requestAnimationFrame(() => {
            refs.forEach((ref) => scrollCurrentButtonIntoView(ref.current));
        });

        return () => window.cancelAnimationFrame(rafId);
    }, [enabled, currentQuestionIndex, questionCount, refs]);
};
