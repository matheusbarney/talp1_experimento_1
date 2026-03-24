import { z } from "zod";

const optionSchema = z.object({
  description: z.string().trim().min(1, "Option description is required"),
  isCorrect: z.boolean()
});

export const questionBodySchema = z
  .object({
    description: z.string().trim().min(1, "Question description is required"),
    options: z.array(optionSchema).min(2, "At least 2 options are required")
  })
  .refine((data) => data.options.some((item) => item.isCorrect), {
    message: "At least one option must be marked as correct",
    path: ["options"]
  });

export type QuestionBody = z.infer<typeof questionBodySchema>;

const identifierModeSchema = z.enum(["LETTERS", "POWERS_OF_TWO"]);

export const testBodySchema = z.object({
  description: z.string().trim().min(1, "Test description is required"),
  identifierMode: identifierModeSchema,
  questionIds: z
    .array(z.number().int().positive("Question id must be a positive integer"))
    .min(1, "At least 1 question is required")
    .refine((questionIds) => new Set(questionIds).size === questionIds.length, {
      message: "Question ids must be unique"
    })
});

export type TestBody = z.infer<typeof testBodySchema>;
