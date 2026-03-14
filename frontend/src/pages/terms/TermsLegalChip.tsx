type TermsLegalChipProps = {
    reference: string;
};

export default function TermsLegalChip({ reference }: TermsLegalChipProps) {
    return <span className="terms-legal-chip">{reference}</span>;
}
