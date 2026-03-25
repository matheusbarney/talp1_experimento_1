import { useState, type FormEvent } from "react";
import { evaluateExamAnswers, generateRandomStudentAnswersCsv } from "../../api";
import type { EvaluationMode } from "../../types";
import { downloadBlob } from "../utils/download";

type UseExamEvaluationParams = {
  setError: (message: string | null) => void;
  setFeedback: (message: string | null) => void;
  clearMessages: () => void;
};

export function useExamEvaluation({ setError, setFeedback, clearMessages }: UseExamEvaluationParams) {
  const [evaluationMode, setEvaluationMode] = useState<EvaluationMode>("STRINGENT");
  const [evaluationAnswerSheetFile, setEvaluationAnswerSheetFile] = useState<File | null>(null);
  const [evaluationStudentAnswersFile, setEvaluationStudentAnswersFile] = useState<File | null>(null);
  const [randomAnswerSheetFile, setRandomAnswerSheetFile] = useState<File | null>(null);
  const [randomStudentCount, setRandomStudentCount] = useState(25);
  const [runningEvaluation, setRunningEvaluation] = useState(false);
  const [runningRandomGenerator, setRunningRandomGenerator] = useState(false);

  async function handleEvaluateExams(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!evaluationAnswerSheetFile || !evaluationStudentAnswersFile) {
      setError("Select both answer sheet and student answers CSV files");
      return;
    }

    setRunningEvaluation(true);
    clearMessages();

    try {
      const result = await evaluateExamAnswers(
        evaluationAnswerSheetFile,
        evaluationStudentAnswersFile,
        evaluationMode
      );
      downloadBlob(result.fileName, result.blob);
      setFeedback("Classroom score report generated successfully");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not evaluate exams";
      setError(message);
    } finally {
      setRunningEvaluation(false);
    }
  }

  async function handleGenerateRandomAnswers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!randomAnswerSheetFile) {
      setError("Select an answer sheet CSV file to generate random answers");
      return;
    }

    if (randomStudentCount < 1 || randomStudentCount > 10000) {
      setError("Random student count must be between 1 and 10000");
      return;
    }

    setRunningRandomGenerator(true);
    clearMessages();

    try {
      const result = await generateRandomStudentAnswersCsv(randomAnswerSheetFile, randomStudentCount);
      downloadBlob(result.fileName, result.blob);
      setFeedback("Random student answers CSV generated successfully");
    } catch (requestError) {
      const message =
        requestError instanceof Error ? requestError.message : "Could not generate random student answers";
      setError(message);
    } finally {
      setRunningRandomGenerator(false);
    }
  }

  return {
    evaluationMode,
    evaluationAnswerSheetFile,
    evaluationStudentAnswersFile,
    randomAnswerSheetFile,
    randomStudentCount,
    runningEvaluation,
    runningRandomGenerator,
    setEvaluationMode,
    setEvaluationAnswerSheetFile,
    setEvaluationStudentAnswersFile,
    setRandomAnswerSheetFile,
    setRandomStudentCount,
    handleEvaluateExams,
    handleGenerateRandomAnswers
  };
}
