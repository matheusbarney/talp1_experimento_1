// @ts-nocheck
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const existing = await prisma.question.count();
    if (existing > 0) {
        return;
    }
    const questionOne = await prisma.question.create({
        data: {
            description: "Which planet is known as the Red Planet?",
            options: {
                create: [
                    { description: "Earth", isCorrect: false },
                    { description: "Mars", isCorrect: true },
                    { description: "Venus", isCorrect: false },
                    { description: "Jupiter", isCorrect: false }
                ]
            }
        }
    });
    const questionTwo = await prisma.question.create({
        data: {
            description: "What is 2 + 2?",
            options: {
                create: [
                    { description: "3", isCorrect: false },
                    { description: "4", isCorrect: true },
                    { description: "5", isCorrect: false }
                ]
            }
        }
    });
    await prisma.test.create({
        data: {
            description: "Science and Math Basics",
            identifierMode: "LETTERS",
            testQuestions: {
                create: [
                    { questionId: questionOne.id, position: 1 },
                    { questionId: questionTwo.id, position: 2 }
                ]
            }
        }
    });
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
