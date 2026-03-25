import { prisma } from "./db.js";
const testInclude = {
    testQuestions: {
        orderBy: {
            position: "asc"
        },
        include: {
            question: {
                include: {
                    options: {
                        orderBy: {
                            id: "asc"
                        }
                    }
                }
            }
        }
    }
};
async function assertAllQuestionsExist(questionIds) {
    const count = await prisma.question.count({
        where: {
            id: {
                in: questionIds
            }
        }
    });
    if (count !== questionIds.length) {
        throw new Error("One or more selected questions do not exist");
    }
}
export async function listTests() {
    return prisma.test.findMany({
        include: testInclude,
        orderBy: {
            id: "desc"
        }
    });
}
export async function getTestById(id) {
    return prisma.test.findUnique({
        where: { id },
        include: testInclude
    });
}
export async function createTest(data) {
    await assertAllQuestionsExist(data.questionIds);
    return prisma.test.create({
        data: {
            description: data.description,
            identifierMode: data.identifierMode,
            testQuestions: {
                create: data.questionIds.map((questionId, index) => ({
                    questionId,
                    position: index + 1
                }))
            }
        },
        include: testInclude
    });
}
export async function updateTest(id, data) {
    await assertAllQuestionsExist(data.questionIds);
    const [, updated] = await prisma.$transaction([
        prisma.testQuestion.deleteMany({ where: { testId: id } }),
        prisma.test.update({
            where: { id },
            data: {
                description: data.description,
                identifierMode: data.identifierMode,
                testQuestions: {
                    create: data.questionIds.map((questionId, index) => ({
                        questionId,
                        position: index + 1
                    }))
                }
            },
            include: testInclude
        })
    ]);
    return updated;
}
export async function deleteTest(id) {
    await prisma.test.delete({ where: { id } });
}
