import type { Test } from "../types";

type TestListProps = {
  tests: Test[];
  loading: boolean;
  onEdit: (test: Test) => void;
  onDelete: (testId: number) => void;
};

function formatIdentifierMode(mode: Test["identifierMode"]) {
  return mode === "LETTERS" ? "Letters (A, B, C...)" : "Powers of two (1, 2, 4, 8...)";
}

export function TestList({ tests, loading, onEdit, onDelete }: TestListProps) {
  return (
    <aside className="panel list-panel">
      <div className="panel-header">
        <h2>Tests</h2>
        <span className="pill">{tests.length}</span>
      </div>

      {loading ? <p className="muted">Loading tests...</p> : null}
      {!loading && tests.length === 0 ? <p className="muted">No tests yet. Create your first one.</p> : null}

      <ul className="question-list">
        {tests.map((test) => (
          <li key={test.id} className="question-item">
            <div className="question-item-content">
              <strong>{test.description}</strong>
              <small>
                {test.testQuestions.length} questions • {formatIdentifierMode(test.identifierMode)}
              </small>
            </div>
            <div className="question-item-actions">
              <button className="secondary" onClick={() => onEdit(test)}>
                Edit
              </button>
              <button className="danger" onClick={() => onDelete(test.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
