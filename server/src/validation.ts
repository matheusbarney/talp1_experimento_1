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
