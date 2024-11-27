import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/api/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await logger(request);

        const publicDir = path.join(process.cwd(), 'public');
        const items = await readdir(publicDir, { withFileTypes: true });

        // Filtra apenas os diretórios e exclui arquivos como exams.json e broken-image.svg
        const boards = items
            .filter(item => item.isDirectory())
            .map(item => ({
                name: item.name,
                url: `/v1/boards/${item.name.toLowerCase()}`,
            }));

        return NextResponse.json({ boards });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
