import type { FormEvent } from "react";
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
  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <h2>{isEditing ? "Edit test" : "Create test"}</h2>
        <button className="secondary" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="question-form">
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
          <div className="question-pick-list">
            {questions.map((question) => {
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
        )}

        {error ? <p className="alert error">{error}</p> : null}

        <button className="primary" type="submit" disabled={saving || questions.length === 0}>
          {saving ? "Saving..." : isEditing ? "Save changes" : "Create test"}
        </button>
      </form>
    </section>
  );
}
