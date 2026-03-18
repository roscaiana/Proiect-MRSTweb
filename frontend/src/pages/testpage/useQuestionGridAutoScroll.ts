import { useEffect } from 'react';
import type { RefObject } from 'react';

type Options = {
    enabled: boolean;
    currentQuestionIndex: number | null;
    questionCount: number;
    buttonRefs: Array<RefObject<HTMLButtonElement | null>>;
};

export const useQuestionGridAutoScroll = ({ enabled, currentQuestionIndex, questionCount, buttonRefs }: Options) => {
    useEffect(() => {
        if (!enabled || currentQuestionIndex === null) return;

        const rafId = window.requestAnimationFrame(() => {
            buttonRefs.forEach((ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
        });

        return () => window.cancelAnimationFrame(rafId);
    }, [enabled, currentQuestionIndex, questionCount, buttonRefs]);
};
