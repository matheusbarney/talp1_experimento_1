import { Router } from "express";
import { ZodError } from "zod";
import { createQuestion, deleteQuestion, getQuestionById, listQuestions, updateQuestion } from "./questions.service.js";
import { questionBodySchema } from "./validation.js";
export const questionsRouter = Router();
questionsRouter.get("/", async (_req, res, next) => {
    try {
        const questions = await listQuestions();
        res.json(questions);
    }
    catch (error) {
        next(error);
    }
});
questionsRouter.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid question id" });
        }
        const question = await getQuestionById(id);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }
        res.json(question);
    }
    catch (error) {
        next(error);
    }
});
questionsRouter.post("/", async (req, res, next) => {
    try {
        const parsed = questionBodySchema.parse(req.body);
        const question = await createQuestion(parsed);
        res.status(201).json(question);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
        }
        next(error);
    }
});
questionsRouter.put("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid question id" });
        }
        const exists = await getQuestionById(id);
        if (!exists) {
            return res.status(404).json({ message: "Question not found" });
        }
        const parsed = questionBodySchema.parse(req.body);
        const updated = await updateQuestion(id, parsed);
        res.json(updated);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
        }
        next(error);
    }
});
questionsRouter.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid question id" });
        }
        const exists = await getQuestionById(id);
        if (!exists) {
            return res.status(404).json({ message: "Question not found" });
        }
        await deleteQuestion(id);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
});
