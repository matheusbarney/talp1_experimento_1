import cors from "cors";
import express from "express";
import { questionsRouter } from "./questions.router.js";
export const app = express();
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json());
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.use("/questions", questionsRouter);
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});
