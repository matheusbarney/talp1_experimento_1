import type { FormEvent } from "react";
import type { Option } from "../types";
import { OptionEditor } from "./OptionEditor";

type FormState = {
  description: string;
  options: Option[];
};

type QuestionFormProps = {
  isEditing: boolean;
  form: FormState;
  saving: boolean;
  error: string | null;
  feedback: string | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDescriptionChange: (description: string) => void;
  onAddOption: () => void;
  onUpdateOption: (index: number, changes: Partial<Option>) => void;
  onRemoveOption: (index: number) => void;
};

export function QuestionForm({
  isEditing,
  form,
  saving,
  error,
  feedback,
  onClose,
  onSubmit,
  onDescriptionChange,
  onAddOption,
  onUpdateOption,
  onRemoveOption
}: QuestionFormProps) {
  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <h2>{isEditing ? "Edit question" : "Create question"}</h2>
        <button className="secondary" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="question-form">
        <label>
          Question description
          <textarea
            value={form.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={3}
            placeholder="Type the question description"
          />
        </label>

        <div className="options-header">
          <h3>Options</h3>
          <button className="secondary" type="button" onClick={onAddOption}>
            Add option
          </button>
        </div>

        <div className="options-list">
          {form.options.map((option, index) => (
            <OptionEditor
              key={`option-${index}`}
              option={option}
              index={index}
              disableRemove={form.options.length <= 2}
              onChange={onUpdateOption}
              onRemove={onRemoveOption}
            />
          ))}
        </div>

        {error ? <p className="alert error">{error}</p> : null}
        {feedback ? <p className="alert success">{feedback}</p> : null}

        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditing ? "Save changes" : "Create question"}
        </button>
      </form>
    </section>
  );
}
