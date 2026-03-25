import { prisma } from "./db.js";
const questionInclude = {
    alternatives: {
        orderBy: {
            id: "asc"
        }
    }
};
export async function listQuestions() {
    return prisma.question.findMany({
        include: questionInclude,
        orderBy: {
            id: "desc"
        }
    });
}
export async function getQuestionById(id) {
    return prisma.question.findUnique({
        where: { id },
        include: questionInclude
    });
}
export async function createQuestion(data) {
    return prisma.question.create({
        data: {
            description: data.description,
            alternatives: {
                create: data.alternatives
            }
        },
        include: questionInclude
    });
}
export async function updateQuestion(id, data) {
    return prisma.$transaction(async (tx) => {
        await tx.alternative.deleteMany({ where: { questionId: id } });
        return tx.question.update({
            where: { id },
            data: {
                description: data.description,
                alternatives: {
                    create: data.alternatives
                }
            },
            include: questionInclude
        });
    });
}
export async function deleteQuestion(id) {
    await prisma.question.delete({ where: { id } });
}
