import { useMemo, useState, type FormEvent } from "react";
import { ClipLoader } from "react-spinners";
import type { IdentifierMode, Question } from "../types";

type TestFormState = {
  description: string;
  identifierMode: IdentifierMode;
  questionIds: number[];
};

type TestFormProps = {
  isEditing: boolean;
  form: TestFormState;
  questions: Question[];
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDescriptionChange: (description: string) => void;
  onIdentifierModeChange: (mode: IdentifierMode) => void;
  onToggleQuestion: (questionId: number) => void;
};

export function TestForm({
  isEditing,
  form,
  questions,
  saving,
  error,
  onClose,
  onSubmit,
  onDescriptionChange,
  onIdentifierModeChange,
  onToggleQuestion
}: TestFormProps) {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, safePage]);

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <h2>{isEditing ? "Edit test" : "Create test"}</h2>
        <button className="secondary" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="question-form modal-form-scroll">
        <label>
          Test description
          <textarea
            value={form.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            placeholder="Type the test description"
          />
        </label>

        <label>
          Question identifier style
          <select
            value={form.identifierMode}
            onChange={(event) => onIdentifierModeChange(event.target.value as IdentifierMode)}
          >
            <option value="LETTERS">Letters (A, B, C...)</option>
            <option value="POWERS_OF_TWO">Powers of two (1, 2, 4, 8, 16...)</option>
          </select>
        </label>

        <div className="options-header">
          <h3>Included questions</h3>
          <span className="pill">{form.questionIds.length}</span>
        </div>

        {questions.length === 0 ? (
          <p className="muted">Create questions first, then you can include them in a test.</p>
        ) : (
          <>
          <div className="question-pick-list">
            {pagedQuestions.map((question) => {
              const isChecked = form.questionIds.includes(question.id);
              return (
                <label className="question-pick-item" key={question.id}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleQuestion(question.id)}
                  />
                  <span>{question.description}</span>
                </label>
              );
            })}
          </div>
          {totalPages > 1 ? (
            <div className="pagination-row">
              <button
                className="secondary"
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={safePage === 1}
              >
                Previous
              </button>
              <span className="pill">Page {safePage} / {totalPages}</span>
              <button
                className="secondary"
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safePage === totalPages}
              >
                Next
              </button>
            </div>
          ) : null}
          </>
        )}

        {error ? <p className="visually-hidden">{error}</p> : null}

        <button className="primary" type="submit" disabled={saving || questions.length === 0}>
          {saving ? <ClipLoader color="#ffffff" size={16} /> : null}
          {saving ? "Saving..." : isEditing ? "Save changes" : "Create test"}
        </button>
      </form>
    </section>
  );
}
