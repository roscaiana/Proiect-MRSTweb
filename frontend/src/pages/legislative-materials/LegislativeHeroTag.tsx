type LegislativeHeroTagProps = {
    tag: string;
};

export default function LegislativeHeroTag({ tag }: LegislativeHeroTagProps) {
    return <span className="hero-tag">{tag}</span>;
}
