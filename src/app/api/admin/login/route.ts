import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHmac, randomBytes } from 'crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней
const LOGIN_RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX = 5;

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function signToken(token: string, secret: string): string {
    return createHmac('sha256', secret).update(token).digest('hex');
}

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        const limit = checkRateLimit(`admin-login:${ip}`, LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW);
        if (limit.limited) {
            return NextResponse.json(
                { error: 'Слишком много попыток входа. Попробуйте позже.' },
                {
                    status: 429,
                    headers: { 'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString() },
                }
            );
        }

        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const sessionSecret = getSessionSecret();

        if (!adminPassword || !sessionSecret || password !== adminPassword) {
            return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
        }

        // Генерируем безопасный токен сессии вместо хранения пароля
        const sessionToken = randomBytes(32).toString('hex');
        const signedToken = signToken(sessionToken, sessionSecret);

        const cookieStore = await cookies();
        cookieStore.set('admin_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/',
        });
        // Храним подпись токена для валидации в proxy
        cookieStore.set('admin_session_hash', signedToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/',
        });

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
