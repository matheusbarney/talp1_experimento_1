import type { Question } from "../types";

type QuestionListProps = {
  questions: Question[];
  loading: boolean;
  selectedQuestionId: number | null;
  onSelect: (question: Question) => void;
  onDelete: (questionId: number) => void;
};

export function QuestionList({
  questions,
  loading,
  selectedQuestionId,
  onSelect,
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
          <li key={question.id} className={selectedQuestionId === question.id ? "question-item selected" : "question-item"}>
            <button className="question-item-content" onClick={() => onSelect(question)}>
              <strong>{question.description}</strong>
              <small>{question.options.length} options</small>
            </button>
            <button className="danger" onClick={() => onDelete(question.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
