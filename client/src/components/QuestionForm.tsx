import { useMemo, useState, type FormEvent } from "react";
import { ClipLoader } from "react-spinners";
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
  const pageSize = 4;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(form.options.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedOptions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return form.options.slice(start, start + pageSize);
  }, [form.options, safePage]);

  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <h2>{isEditing ? "Edit question" : "Create question"}</h2>
        <button className="secondary" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <form onSubmit={onSubmit} className="question-form modal-form-scroll">
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
          {pagedOptions.map((option, index) => {
            const absoluteIndex = (safePage - 1) * pageSize + index;
            return (
            <OptionEditor
              key={`option-${absoluteIndex}`}
              option={option}
              index={absoluteIndex}
              disableRemove={form.options.length <= 2}
              onChange={onUpdateOption}
              onRemove={onRemoveOption}
            />
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

        {error ? <p className="visually-hidden">{error}</p> : null}
        {feedback ? <p className="visually-hidden">{feedback}</p> : null}

        <button className="primary" type="submit" disabled={saving}>
          {saving ? <ClipLoader color="#ffffff" size={16} /> : null}
          {saving ? "Saving..." : isEditing ? "Save changes" : "Create question"}
        </button>
      </form>
    </section>
  );
}
