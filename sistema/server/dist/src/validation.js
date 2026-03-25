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
const identifierModeSchema = z.enum(["LETTERS", "POWERS_OF_TWO"]);
const examHeaderSchema = z.object({
    title: z.string().trim().min(1, "Exam title is required"),
    className: z.string().trim().min(1, "Class name is required"),
    teacher: z.string().trim().min(1, "Teacher name is required"),
    date: z.string().trim().min(1, "Date is required"),
    additionalInfo: z.string().trim().max(240, "Additional info is too long").optional()
});
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
export const generateExamsBodySchema = z.object({
    count: z.number().int().min(1, "At least 1 exam is required").max(500, "The maximum is 500 exams"),
    startNumber: z.number().int().min(1, "Start number must be positive").default(1),
    header: examHeaderSchema
});
