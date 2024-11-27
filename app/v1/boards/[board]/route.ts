import { NextRequest, NextResponse } from 'next/server';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/api/logger';
import { getExams } from '@/lib/api/exams/get-exams';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { board: string } }
) {
    try {
        await logger(request);

        const { board } = params;
        // Primeira letra maiúscula para corresponder à estrutura do diretório
        const formattedBoard = board.charAt(0).toUpperCase() + board.slice(1).toLowerCase();
        const exams = await getExams(formattedBoard);

        if (!exams || exams.length === 0) {
            return NextResponse.json(
                { error: 'Board not found or has no exams' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            board: formattedBoard,
            exams
        });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
