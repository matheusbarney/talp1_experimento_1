import type { Test } from "../types";
import { ClipLoader } from "react-spinners";
import { useEffect, useMemo, useState } from "react";

type TestListProps = {
  tests: Test[];
  loading: boolean;
  onEdit: (test: Test) => void;
  onDelete: (testId: number) => void;
  onGenerate: (test: Test) => void;
};

function formatIdentifierMode(mode: Test["identifierMode"]) {
  return mode === "LETTERS" ? "Letters (A, B, C...)" : "Powers of two (1, 2, 4, 8...)";
}

export function TestList({ tests, loading, onEdit, onDelete, onGenerate }: TestListProps) {
  const pageSize = 6;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tests.length / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const pagedTests = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return tests.slice(start, start + pageSize);
  }, [tests, safePage]);

  return (
    <aside className="panel list-panel">
      <div className="panel-header">
        <h2>Tests</h2>
        <span className="pill">{tests.length}</span>
      </div>

      {loading ? (
        <p className="muted loading-inline">
          <ClipLoader size={14} color="#0f766e" />
          Loading tests...
        </p>
      ) : null}
      {!loading && tests.length === 0 ? <p className="muted">No tests yet. Create your first one.</p> : null}

      <ul className="question-list list-scroll-viewport">
        {pagedTests.map((test) => (
          <li key={test.id} className="question-item">
            <div className="question-item-content">
              <strong>{test.description}</strong>
              <small>
                {test.testQuestions.length} questions • {formatIdentifierMode(test.identifierMode)}
              </small>
            </div>
            <div className="question-item-actions">
              <button className="secondary" onClick={() => onGenerate(test)}>
                Generate
              </button>
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
