import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { ExamSchema } from '@/lib/zod/schemas/exams';

export async function getExams(board?: string) {
    try {
        if (!board) {
            // Se nenhuma banca for especificada, retorna todas as bancas disponíveis
            const publicDir = path.join(process.cwd(), 'public');
            const items = await readdir(publicDir, { withFileTypes: true });
            const boards = items.filter(item => item.isDirectory());
            
            let allExams = [];
            for (const boardDir of boards) {
                const boardExams = await getBoardExams(boardDir.name);
                allExams = [...allExams, ...boardExams];
            }
            
            return allExams;
        }

        return await getBoardExams(board);
    } catch (error) {
        console.error('Error getting exams:', error);
        return [];
    }
}

async function getBoardExams(board: string) {
    try {
        const boardDir = path.join(process.cwd(), 'public', board);
        const years = await readdir(boardDir);
        
        const exams = [];
        for (const year of years) {
            const detailsPath = path.join(boardDir, year, 'details.json');
            try {
                const detailsRaw = await readFile(detailsPath, 'utf-8');
                const details = JSON.parse(detailsRaw);
                exams.push(ExamSchema.parse(details));
            } catch (error) {
                console.error(`Error reading details for ${board} ${year}:`, error);
            }
        }
        
        return exams;
    } catch (error) {
        console.error(`Error reading board ${board}:`, error);
        return [];
    }
}
