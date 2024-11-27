import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';

export async function getQuestions(board: string, year: string | number) {
    try {
        const questionsDir = path.join(process.cwd(), 'public', board, year.toString(), 'questions');
        const questionDirs = await readdir(questionsDir);

        const questions = [];
        for (const questionDir of questionDirs) {
            const detailsPath = path.join(questionsDir, questionDir, 'details.json');
            try {
                const detailsRaw = await readFile(detailsPath, 'utf-8');
                const details = JSON.parse(detailsRaw);
                questions.push(details);
            } catch (error) {
                console.error(`Error reading question ${questionDir}:`, error);
            }
        }

        // Ordena as questões pelo índice
        return questions.sort((a, b) => a.index - b.index);
    } catch (error) {
        console.error(`Error reading questions for ${board} ${year}:`, error);
        return [];
    }
}

export async function getQuestion(board: string, year: string | number, questionNumber: string | number) {
    try {
        const questionPath = path.join(
            process.cwd(),
            'public',
            board,
            year.toString(),
            'questions',
            questionNumber.toString(),
            'details.json'
        );

        const detailsRaw = await readFile(questionPath, 'utf-8');
        return JSON.parse(detailsRaw);
    } catch (error) {
        console.error(`Error reading question ${questionNumber}:`, error);
        return null;
    }
}
