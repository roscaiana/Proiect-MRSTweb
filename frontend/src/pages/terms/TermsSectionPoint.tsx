type TermsSectionPointProps = {
    point: string;
};

export default function TermsSectionPoint({ point }: TermsSectionPointProps) {
    return <li>{point}</li>;
}
