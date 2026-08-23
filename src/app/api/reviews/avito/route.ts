import { NextResponse } from 'next/server';
import { dbReviews } from '@/lib/data/avito_reviews';

export async function GET() {
    try {
        // Возвращаем все распарсенные и отформатированные отзывы
        // Мы уже отфильтровали только ПК-сборки на 5 звезд
        return NextResponse.json({
            status: 'success',
            source: 'local_db',
            data: dbReviews
        });
    } catch (error) {
        console.error('API /reviews/avito Exception:', error);
        return NextResponse.json({
            status: 'error',
            message: 'Ошибка при получении отзывов.',
            data: []
        }, { status: 200 });
    }
}
