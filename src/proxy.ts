import { NextRequest, NextResponse } from 'next/server';

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
}

function toHex(buffer: ArrayBuffer) {
    return Array.from(new Uint8Array(buffer))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function timingSafeEqual(a: string, b: string) {
    if (a.length !== b.length) return false;

    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return mismatch === 0;
}

async function signToken(token: string, secret: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(token));
    return toHex(signature);
}

function redirectToLogin(request: NextRequest) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Пропускаем страницу логина и API логина
    if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
        return NextResponse.next();
    }

    // Защищаем все /admin/* и /api/admin/*
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
        const session = request.cookies.get('admin_session');
        const sessionHash = request.cookies.get('admin_session_hash');
        const sessionSecret = getSessionSecret();

        // Проверяем наличие обоих куков (токен + хеш)
        if (!session?.value || !sessionHash?.value || !sessionSecret) {
            return redirectToLogin(request);
        }

        // Минимальная валидация: оба кука должны быть непустыми и токен должен быть достаточно длинным
        if (session.value.length < 32) {
            return redirectToLogin(request);
        }

        const expectedSignature = await signToken(session.value, sessionSecret);
        if (!timingSafeEqual(expectedSignature, sessionHash.value)) {
            return redirectToLogin(request);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
