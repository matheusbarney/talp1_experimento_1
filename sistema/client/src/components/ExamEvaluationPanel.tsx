import type { ChangeEvent, FormEvent } from "react";
import { ClipLoader } from "react-spinners";
import type { EvaluationMode } from "../types";

type ExamEvaluationPanelProps = {
  mode: EvaluationMode;
  answerSheetFileName: string | null;
  studentAnswersFileName: string | null;
  randomAnswerSheetFileName: string | null;
  randomStudentCount: number;
  runningEvaluation: boolean;
  runningRandomGenerator: boolean;
  onModeChange: (mode: EvaluationMode) => void;
  onAnswerSheetChange: (file: File | null) => void;
  onStudentAnswersChange: (file: File | null) => void;
  onRandomAnswerSheetChange: (file: File | null) => void;
  onRandomStudentCountChange: (count: number) => void;
  onEvaluate: (event: FormEvent<HTMLFormElement>) => void;
  onGenerateRandomAnswers: (event: FormEvent<HTMLFormElement>) => void;
};

function pickFirstFile(event: ChangeEvent<HTMLInputElement>) {
  return event.target.files?.[0] ?? null;
}

export function ExamEvaluationPanel({
  mode,
  answerSheetFileName,
  studentAnswersFileName,
  randomAnswerSheetFileName,
  randomStudentCount,
  runningEvaluation,
  runningRandomGenerator,
  onModeChange,
  onAnswerSheetChange,
  onStudentAnswersChange,
  onRandomAnswerSheetChange,
  onRandomStudentCountChange,
  onEvaluate,
  onGenerateRandomAnswers
}: ExamEvaluationPanelProps) {
  return (
    <section className="panel tools-panel">
      <div className="panel-header">
        <h2>Exam Evaluation & Testing</h2>
      </div>

      <div className="tools-grid">
        <form className="question-form" onSubmit={onEvaluate}>
          <h3>Evaluate Exams</h3>

          <label>
            Evaluation mode
            <select value={mode} onChange={(event) => onModeChange(event.target.value as EvaluationMode)}>
              <option value="STRINGENT">Stringent (all-or-nothing per question)</option>
              <option value="LIBERAL">Liberal (proportional per option match)</option>
            </select>
          </label>

          <label>
            Answer sheet CSV
            <input type="file" accept=".csv,text/csv" onChange={(event) => onAnswerSheetChange(pickFirstFile(event))} />
          </label>
          <small className="muted">{answerSheetFileName ?? "No file selected"}</small>

          <label>
            Student answers CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => onStudentAnswersChange(pickFirstFile(event))}
            />
          </label>
          <small className="muted">{studentAnswersFileName ?? "No file selected"}</small>

          <button className="primary" type="submit" disabled={runningEvaluation}>
            {runningEvaluation ? <ClipLoader color="#ffffff" size={16} /> : null}
            {runningEvaluation ? "Evaluating..." : "Generate Classroom Score Report CSV"}
          </button>
        </form>

        <form className="question-form" onSubmit={onGenerateRandomAnswers}>
          <h3>Testing Helper</h3>

          <p className="muted">
            Generate a random student-answers CSV from any answer sheet to test the evaluation flow.
          </p>

          <label>
            Answer sheet CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => onRandomAnswerSheetChange(pickFirstFile(event))}
            />
          </label>
          <small className="muted">{randomAnswerSheetFileName ?? "No file selected"}</small>

          <label>
            Number of random students
            <input
              type="number"
              min={1}
              max={10000}
              value={randomStudentCount}
              onChange={(event) => onRandomStudentCountChange(Number(event.target.value) || 0)}
            />
          </label>

          <button className="primary" type="submit" disabled={runningRandomGenerator}>
            {runningRandomGenerator ? <ClipLoader color="#ffffff" size={16} /> : null}
            {runningRandomGenerator ? "Generating..." : "Generate Random Student Answers CSV"}
          </button>
        </form>
      </div>
    </section>
  );
}
