import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

describe('authSchemas', () => {
    it('accepts valid login credentials', () => {
        const result = loginSchema.safeParse({
            email: 'user@example.com',
            password: 'secret123',
        });

        expect(result.success).toBe(true);
    });

    it('rejects invalid login credentials', () => {
        const result = loginSchema.safeParse({
            email: '',
            password: 'secret123',
        });

        expect(result.success).toBe(false);
    });

    it('rejects mismatched register passwords', () => {
        const result = registerSchema.safeParse({
            fullName: 'Ion Popescu',
            email: 'ion.popescu@example.com',
            password: 'parola123',
            confirmPassword: 'parola321',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Parolele nu coincid');
        }
    });
});
