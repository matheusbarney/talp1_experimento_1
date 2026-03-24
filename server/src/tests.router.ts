import { Router } from "express";
import { ZodError } from "zod";
import { generateExamsBodySchema, testBodySchema } from "./validation.js";
import { createTest, deleteTest, getTestById, listTests, updateTest } from "./tests.service.js";
import { generateExamsPackage } from "./exam-export.service.js";

export const testsRouter = Router();

testsRouter.get("/", async (_req, res, next) => {
  try {
    const tests = await listTests();
    res.json(tests);
  } catch (error) {
    next(error);
  }
});

testsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid test id" });
    }

    const test = await getTestById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.json(test);
  } catch (error) {
    next(error);
  }
});

testsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = testBodySchema.parse(req.body);
    const test = await createTest(parsed);
    res.status(201).json(test);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    if (error instanceof Error && error.message === "One or more selected questions do not exist") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
});

testsRouter.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid test id" });
    }

    const exists = await getTestById(id);
    if (!exists) {
      return res.status(404).json({ message: "Test not found" });
    }

    const parsed = testBodySchema.parse(req.body);
    const updated = await updateTest(id, parsed);
    res.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    if (error instanceof Error && error.message === "One or more selected questions do not exist") {
      return res.status(400).json({ message: error.message });
    }

    next(error);
  }
});

testsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid test id" });
    }

    const exists = await getTestById(id);
    if (!exists) {
      return res.status(404).json({ message: "Test not found" });
    }

    await deleteTest(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

testsRouter.post("/:id/generate-exams", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid test id" });
    }

    const payload = generateExamsBodySchema.parse(req.body);
    const result = await generateExamsPackage(id, payload);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
    res.send(result.buffer);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.flatten() });
    }

    if (error instanceof Error && (error.message === "Test not found" || error.message === "Test has no questions")) {
      return res.status(404).json({ message: error.message });
    }

    next(error);
  }
});
