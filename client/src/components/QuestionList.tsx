import type { Question } from "../types";

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
  return (
    <aside className="panel list-panel">
      <div className="panel-header">
        <h2>Questions</h2>
        <span className="pill">{questions.length}</span>
      </div>

      {loading ? <p className="muted">Loading questions...</p> : null}
      {!loading && questions.length === 0 ? <p className="muted">No questions yet. Create your first one.</p> : null}

      <ul className="question-list">
        {questions.map((question) => (
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
    </aside>
  );
}
