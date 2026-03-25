import { Router } from "express";
import multer from "multer";
import { z, ZodError } from "zod";
import { evaluateExams, generateRandomStudentAnswers } from "./exams.service.js";
const upload = multer({ storage: multer.memoryStorage() });
const evaluationModeSchema = z.enum(["STRINGENT", "LIBERAL"]);
const randomStudentCountSchema = z
    .number({ invalid_type_error: "studentCount must be a number" })
    .int("studentCount must be an integer")
    .min(1, "studentCount must be at least 1")
    .max(10000, "studentCount must be at most 10000");
export const examsRouter = Router();
examsRouter.post("/evaluate", upload.fields([
    { name: "answerSheet", maxCount: 1 },
    { name: "studentAnswers", maxCount: 1 }
]), (req, res, next) => {
    try {
        const files = req.files;
        const answerSheet = files?.answerSheet?.[0];
        const studentAnswers = files?.studentAnswers?.[0];
        if (!answerSheet || !studentAnswers) {
            return res.status(400).json({
                message: "Both answerSheet and studentAnswers CSV files are required"
            });
        }
        const mode = evaluationModeSchema.parse(String(req.body.mode ?? "STRINGENT").trim().toUpperCase());
        const report = evaluateExams(answerSheet.buffer, studentAnswers.buffer, mode);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${report.fileName}"`);
        res.send(report.content);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
        }
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});
examsRouter.post("/generate-random-answers", upload.single("answerSheet"), (req, res, next) => {
    try {
        const answerSheet = req.file;
        if (!answerSheet) {
            return res.status(400).json({ message: "answerSheet CSV file is required" });
        }
        const parsedCount = randomStudentCountSchema.parse(Number(req.body.studentCount));
        const randomAnswers = generateRandomStudentAnswers(answerSheet.buffer, parsedCount);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${randomAnswers.fileName}"`);
        res.send(randomAnswers.content);
    }
    catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
        }
        if (error instanceof Error) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});
