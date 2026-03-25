import cors from "cors";
import express from "express";
import { examsRouter } from "./exams.router.js";
import { questionsRouter } from "./questions.router.js";
import { testsRouter } from "./tests.router.js";

export const app = express();

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/questions", questionsRouter);
app.use("/tests", testsRouter);
app.use("/exams", examsRouter);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});
