type TestFormOptionFieldProps = {
    optionIndex: number;
    value: string;
    onChange: (value: string) => void;
};

export default function TestFormOptionField({ optionIndex, value, onChange }: TestFormOptionFieldProps) {
    return (
        <label className="admin-field">
            <span>Opțiunea {optionIndex + 1}</span>
            <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}
    