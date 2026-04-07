import { describe, it, expect } from 'vitest';
import { contactSchema } from '../schemas/contactSchema';

describe('contactSchema', () => {
    it('accepts valid contact payload', () => {
        const result = contactSchema.safeParse({
            name: 'Maria Ionescu',
            email: 'maria@example.com',
            subject: 'Suport',
            message: 'Am nevoie de ajutor pentru cont.',
        });

        expect(result.success).toBe(true);
    });

    it('rejects short messages', () => {
        const result = contactSchema.safeParse({
            name: 'Maria Ionescu',
            email: 'maria@example.com',
            subject: 'Suport',
            message: 'Scurt',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Mesajul trebuie să de minim 10 caractere');
        }
    });
});
