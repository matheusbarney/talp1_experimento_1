import { z } from "zod";
const alternativeSchema = z.object({
    description: z.string().trim().min(1, "Alternative description is required"),
    isCorrect: z.boolean()
});
export const questionBodySchema = z
    .object({
    description: z.string().trim().min(1, "Question description is required"),
    alternatives: z.array(alternativeSchema).min(2, "At least 2 alternatives are required")
})
    .refine((data) => data.alternatives.some((item) => item.isCorrect), {
    message: "At least one alternative must be marked as correct",
    path: ["alternatives"]
});
