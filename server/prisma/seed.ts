// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.question.count();
  if (existing > 0) {
    return;
  }

  await prisma.question.create({
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

  await prisma.question.create({
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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
