import type { QuestionBody } from "./validation.js";
import { prisma } from "./db.js";

const questionInclude = {
  options: {
    orderBy: {
      id: "asc" as const
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

export async function getQuestionById(id: number) {
  return prisma.question.findUnique({
    where: { id },
    include: questionInclude
  });
}

export async function createQuestion(data: QuestionBody) {
  return prisma.question.create({
    data: {
      description: data.description,
      options: {
        create: data.options
      }
    },
    include: questionInclude
  });
}

export async function updateQuestion(id: number, data: QuestionBody) {
  return prisma.$transaction(async (tx: any) => {
    await tx.option.deleteMany({ where: { questionId: id } });

    return tx.question.update({
      where: { id },
      data: {
        description: data.description,
        options: {
          create: data.options
        }
      },
      include: questionInclude
    });
  });
}

export async function deleteQuestion(id: number) {
  await prisma.question.delete({ where: { id } });
}
