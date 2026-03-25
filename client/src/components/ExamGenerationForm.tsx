import type { FormEvent } from "react";
import { ClipLoader } from "react-spinners";

type GenerationFormState = {
  count: number;
  startNumber: number;
  title: string;
  className: string;
  teacher: string;
  date: string;
  additionalInfo: string;
};

type ExamGenerationFormProps = {
  testName: string;
  saving: boolean;
  error: string | null;
  form: GenerationFormState;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (changes: Partial<GenerationFormState>) => void;
};

export function ExamGenerationForm({
  testName,
  saving,
  error,
  form,
  onClose,
  onSubmit,
  onChange
}: ExamGenerationFormProps) {
  return (
    <section className="panel form-panel">
      <div className="panel-header">
        <h2>Generate Exams</h2>
        <button className="secondary" type="button" onClick={onClose}>
          Close
        </button>
      </div>

      <p className="muted">Test: {testName}</p>

      <form onSubmit={onSubmit} className="question-form modal-form-scroll">
        <label>
          Number of exam PDFs
          <input
            type="number"
            min={1}
            max={500}
            value={form.count}
            onChange={(event) => onChange({ count: Number(event.target.value) || 0 })}
          />
        </label>

        <label>
          First exam number
          <input
            type="number"
            min={1}
            value={form.startNumber}
            onChange={(event) => onChange({ startNumber: Number(event.target.value) || 0 })}
          />
        </label>

        <label>
          Exam title
          <input value={form.title} onChange={(event) => onChange({ title: event.target.value })} />
        </label>

        <label>
          Class name
          <input value={form.className} onChange={(event) => onChange({ className: event.target.value })} />
        </label>

        <label>
          Teacher
          <input value={form.teacher} onChange={(event) => onChange({ teacher: event.target.value })} />
        </label>

        <label>
          Date
          <input value={form.date} onChange={(event) => onChange({ date: event.target.value })} />
        </label>

        <label>
          Additional info (optional)
          <textarea
            rows={3}
            value={form.additionalInfo}
            onChange={(event) => onChange({ additionalInfo: event.target.value })}
          />
        </label>

        {error ? <p className="visually-hidden">{error}</p> : null}

        <button className="primary" type="submit" disabled={saving}>
          {saving ? <ClipLoader color="#ffffff" size={16} /> : null}
          {saving ? "Generating..." : "Generate PDFs + CSV"}
        </button>
      </form>
    </section>
  );
}
