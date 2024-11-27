import { NextRequest, NextResponse } from 'next/server';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/api/logger';
import { getQuestions } from '@/lib/api/questions/get-questions';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { board: string; year: string } }
) {
    try {
        await logger(request);

        const { board, year } = params;
        const formattedBoard = board.charAt(0).toUpperCase() + board.slice(1).toLowerCase();
        
        const questions = await getQuestions(formattedBoard, year);

        if (!questions || questions.length === 0) {
            return NextResponse.json(
                { error: 'Questions not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            board: formattedBoard,
            year,
            questions
        });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
