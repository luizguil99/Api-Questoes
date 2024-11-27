import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { logger } from '@/lib/api/logger';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string[] } },
) {
    try {
        await logger(request);

        const { slug } = params;
        const publicDir = path.join(process.cwd(), 'public');

        // Ajusta o case da banca (Enem, Fuvest)
        let [banca, ...rest] = slug;
        if (banca.toLowerCase() === 'enem') {
            banca = 'Enem';
        } else if (banca.toLowerCase() === 'fuvest') {
            banca = 'Fuvest';
        }

        // /v1/boards/Enem - Lista anos da banca
        if (slug.length === 1) {
            const bancaDir = path.join(publicDir, banca);

            try {
                const items = await readdir(bancaDir, { withFileTypes: true });
                const years = items
                    .filter(item => item.isDirectory())
                    .map(item => ({
                        year: item.name,
                        url: `/v1/boards/${banca}/${item.name}`,
                    }));

                return NextResponse.json({
                    banca,
                    years,
                });
            } catch (error) {
                return NextResponse.json(
                    { error: 'Banca não encontrada' },
                    { status: 404 },
                );
            }
        }

        // /v1/boards/Enem/2022 - Lista questões do ano
        if (slug.length === 2) {
            const [, ano] = slug;
            const questionsDir = path.join(publicDir, banca, ano, 'questions');

            try {
                const items = await readdir(questionsDir, {
                    withFileTypes: true,
                });
                const questions = items
                    .filter(item => item.isDirectory())
                    .map(item => ({
                        number: item.name,
                        url: `/v1/boards/${banca}/${ano}/${item.name}`,
                    }));

                return NextResponse.json({
                    banca,
                    ano,
                    total_questions: questions.length,
                    questions,
                });
            } catch (error) {
                return NextResponse.json(
                    { error: 'Ano não encontrado' },
                    { status: 404 },
                );
            }
        }

        // /v1/boards/Enem/2022/1 - Retorna questão específica
        if (slug.length === 3) {
            const [, ano, numero] = slug;

            // Tenta buscar a questão
            const questionDir = path.join(
                publicDir,
                banca,
                ano,
                'questions',
                numero,
            );
            try {
                // Lê o details.json da questão
                const detailsPath = path.join(questionDir, 'details.json');
                const detailsData = await readFile(detailsPath, 'utf-8');
                const details = JSON.parse(detailsData);

                // Lista arquivos de imagem na pasta
                const files = await readdir(questionDir);
                const images = files
                    .filter(
                        file =>
                            file !== 'details.json' &&
                            (file.endsWith('.jpg') || file.endsWith('.png')),
                    )
                    .map(
                        file => `/${banca}/${ano}/questions/${numero}/${file}`,
                    );

                return NextResponse.json({
                    ...details,
                    images,
                });
            } catch (error) {
                return NextResponse.json(
                    { error: 'Questão não encontrada' },
                    { status: 404 },
                );
            }
        }

        return NextResponse.json({ error: 'Rota inválida' }, { status: 404 });
    } catch (error) {
        return handleAndReturnErrorResponse(error);
    }
}
