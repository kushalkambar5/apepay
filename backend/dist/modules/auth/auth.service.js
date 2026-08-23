import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db, users, merchants } from '../../db';
import { env } from '../../config/env';
import { UnauthorizedError, ConflictError } from '../../lib/errors';
export class AuthService {
    async register(params) {
        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, params.email.toLowerCase()))
            .limit(1);
        if (existingUser.length > 0) {
            throw new ConflictError('User with this email already exists.');
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(params.password, salt);
        // Create user and merchant inside a transaction
        return await db.transaction(async (tx) => {
            const [newUser] = await tx
                .insert(users)
                .values({
                email: params.email.toLowerCase(),
                passwordHash,
                name: params.name || '',
            })
                .returning();
            const [newMerchant] = await tx
                .insert(merchants)
                .values({
                userId: newUser.id,
                businessName: params.businessName || 'My Business',
                status: 'active',
            })
                .returning();
            const token = jwt.sign({ userId: newUser.id, merchantId: newMerchant.id }, env.JWT_SECRET, { expiresIn: '7d' });
            return {
                token,
                user: { id: newUser.id, email: newUser.email, name: newUser.name },
                merchant: newMerchant,
            };
        });
    }
    async login(params) {
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, params.email.toLowerCase()))
            .limit(1);
        if (!user || !user.passwordHash) {
            throw new UnauthorizedError('Invalid email or password.');
        }
        const isMatch = await bcrypt.compare(params.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password.');
        }
        const [merchant] = await db
            .select()
            .from(merchants)
            .where(eq(merchants.userId, user.id))
            .limit(1);
        const token = jwt.sign({ userId: user.id, merchantId: merchant?.id }, env.JWT_SECRET, { expiresIn: '7d' });
        return {
            token,
            user: { id: user.id, email: user.email, name: user.name },
            merchant,
        };
    }
}
export const authService = new AuthService();
