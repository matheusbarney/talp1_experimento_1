import type { Question } from "../types";
import { ClipLoader } from "react-spinners";
import { useEffect, useMemo, useState } from "react";

type QuestionListProps = {
  questions: Question[];
  loading: boolean;
  onEdit: (question: Question) => void;
  onDelete: (questionId: number) => void;
};

export function QuestionList({
  questions,
  loading,
  onEdit,
  onDelete
}: QuestionListProps) {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(questions.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedQuestions = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return questions.slice(start, start + pageSize);
  }, [questions, safePage]);

  return (
    <aside className="panel list-panel">
      <div className="panel-header">
        <h2>Questions</h2>
        <span className="pill">{questions.length}</span>
      </div>

      {loading ? (
        <p className="muted loading-inline">
          <ClipLoader size={14} color="#0f766e" />
          Loading questions...
        </p>
      ) : null}
      {!loading && questions.length === 0 ? <p className="muted">No questions yet. Create your first one.</p> : null}

      <ul className="question-list list-scroll-viewport">
        {pagedQuestions.map((question) => (
          <li key={question.id} className="question-item">
            <div className="question-item-content">
              <strong>{question.description}</strong>
              <small>{question.options.length} options</small>
            </div>
            <div className="question-item-actions">
              <button className="secondary" onClick={() => onEdit(question)}>
                Edit
              </button>
              <button className="danger" onClick={() => onDelete(question.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="pagination-row list-pagination-row">
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
    </aside>
  );
}
