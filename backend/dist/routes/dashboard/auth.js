import { z } from 'zod';
import { authService } from '../../modules/auth/auth.service';
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
    businessName: z.string().optional(),
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export async function dashboardAuthRoutes(fastify) {
    fastify.post('/register', async (request, reply) => {
        const body = registerSchema.parse(request.body);
        const result = await authService.register(body);
        reply.status(201).send(result);
    });
    fastify.post('/login', async (request, reply) => {
        const body = loginSchema.parse(request.body);
        const result = await authService.login(body);
        reply.send(result);
    });
}
