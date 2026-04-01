import type { FieldPath, UseFormRegister } from "react-hook-form";
import type { TestFormValues } from "../../../schemas/adminSchemas";

type TestFormOptionFieldProps = {
    optionIndex: number;
    name: FieldPath<TestFormValues>;
    register: UseFormRegister<TestFormValues>;
    errorMessage?: string;
};

export default function TestFormOptionField({ optionIndex, name, register, errorMessage }: TestFormOptionFieldProps) {
    return (
        <label className="admin-field">
            <span>Optiunea {optionIndex + 1}</span>
            <input type="text" {...register(name)} />
            {errorMessage && <span className="admin-field-error" role="alert">{errorMessage}</span>}
        </label>
    );
}
