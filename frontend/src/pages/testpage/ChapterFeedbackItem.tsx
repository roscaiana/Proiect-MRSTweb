type ChapterFeedbackItemProps = {
    chapterId: string;
    chapterTitle: string;
    accuracy: number;
};

export default function ChapterFeedbackItem({ chapterId, chapterTitle, accuracy }: ChapterFeedbackItemProps) {
    return (
        <li key={chapterId}>
            <span>{chapterTitle}</span>
            <strong>{accuracy}%</strong>
        </li>
    );
}
