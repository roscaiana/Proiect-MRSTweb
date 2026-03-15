import type { AdminTest } from "../types";

type AdminTestRowProps = {
    test: AdminTest;
    onEdit: (testId: string) => void;
    onDelete: (test: AdminTest) => void;
};

export default function AdminTestRow({ test, onEdit, onDelete }: AdminTestRowProps) {
    return (
        <tr>
            <td>
                <strong>{test.title}</strong>
                <p>{test.description}</p>
            </td>
            <td>{test.questions.length}</td>
            <td>{test.durationMinutes} min</td>
            <td>{test.passingScore}%</td>
            <td>
                <div className="admin-actions-row">
                    <button className="admin-text-btn" type="button" onClick={() => onEdit(test.id)}>
                        Editează
                    </button>
                    <button className="admin-text-btn danger" type="button" onClick={() => onDelete(test)}>
                        Șterge
                    </button>
                </div>
            </td>
        </tr>
    );
}
