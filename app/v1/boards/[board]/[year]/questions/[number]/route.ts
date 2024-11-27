import { NextRequest, NextResponse } from 'next/server';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/api/logger';
import { getQuestion } from '@/lib/api/questions/get-questions';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { board: string; year: string; number: string } }
) {
    try {
        await logger(request);

        const { board, year, number } = params;
        const formattedBoard = board.charAt(0).toUpperCase() + board.slice(1).toLowerCase();
        
        const question = await getQuestion(formattedBoard, year, number);

        if (!question) {
            return NextResponse.json(
                { error: 'Question not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(question);
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
