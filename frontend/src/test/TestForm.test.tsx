import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TestForm from '../features/admin/components/TestForm';

describe('TestForm', () => {
    it('afișează erori când formularul este gol', async () => {
        const user = userEvent.setup();
        render(<TestForm mode="create" onSubmit={vi.fn()} onCancel={vi.fn()} />);
        await user.click(screen.getByRole('button', { name: /Creeaza test/i }));
        expect(await screen.findByText(/Titlul testului este obligatoriu/i)).toBeInTheDocument();
        expect(await screen.findByText(/Întrebarea trebuie să aibă/i)).toBeInTheDocument();
    });

    it('trimite formularul cu date valide', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn();
        render(<TestForm mode="create" onSubmit={onSubmit} onCancel={vi.fn()} />);

        await user.type(screen.getByPlaceholderText(/Simulare/i), 'Test demo');
        await user.type(screen.getByLabelText(/Text intrebare/i), 'Care este răspunsul corect?');

        const optionInputs = screen.getAllByLabelText(/Optiunea/i);
        await user.type(optionInputs[0], 'Varianta 1');
        await user.type(optionInputs[1], 'Varianta 2');
        await user.type(optionInputs[2], 'Varianta 3');
        await user.type(optionInputs[3], 'Varianta 4');

        await user.click(screen.getByRole('button', { name: /Creeaza test/i }));

        expect(onSubmit).toHaveBeenCalled();
    });
});
