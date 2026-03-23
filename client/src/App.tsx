import { useEffect, useMemo, useState, type FormEvent } from "react";
import "./App.css";
import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from "./api";
import type { Option, Question, QuestionPayload } from "./types";
import { QuestionForm } from "./components/QuestionForm";
import { QuestionList } from "./components/QuestionList";

const initialOptions: Option[] = [
  { description: "", isCorrect: false },
  { description: "", isCorrect: false }
];

type FormState = {
  description: string;
  options: Option[];
};

const emptyForm: FormState = {
  description: "",
  options: initialOptions
};

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEditing = selectedQuestionId !== null;

  const selectedQuestion = useMemo(
    () => questions.find((question) => question.id === selectedQuestionId) ?? null,
    [questions, selectedQuestionId]
  );

  useEffect(() => {
    void loadQuestions();
  }, []);

  async function loadQuestions() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load questions";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({
      description: "",
      options: [
        { description: "", isCorrect: false },
        { description: "", isCorrect: false }
      ]
    });
    setSelectedQuestionId(null);
  }

  function selectForEdit(question: Question) {
    setSelectedQuestionId(question.id);
    setForm({
      description: question.description,
      options: question.options.map((item) => ({
        description: item.description,
        isCorrect: item.isCorrect
      }))
    });
    setFeedback(null);
    setError(null);
  }

  function updateOption(index: number, changes: Partial<Option>) {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option, currentIndex) =>
        index === currentIndex ? { ...option, ...changes } : option
      )
    }));
  }

  function addOption() {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { description: "", isCorrect: false }]
    }));
  }

  function removeOption(index: number) {
    setForm((prev) => {
      if (prev.options.length <= 2) {
        return prev;
      }

      return {
        ...prev,
        options: prev.options.filter((_, currentIndex) => currentIndex !== index)
      };
    });
  }

  function validateForm(payload: QuestionPayload) {
    if (!payload.description.trim()) {
      throw new Error("Question description is required");
    }

    if (payload.options.length < 2) {
      throw new Error("At least 2 options are required");
    }

    if (payload.options.some((item) => !item.description.trim())) {
      throw new Error("All options need a description");
    }

    if (!payload.options.some((item) => item.isCorrect)) {
      throw new Error("At least one option must be correct");
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setFeedback(null);

    const payload: QuestionPayload = {
      description: form.description.trim(),
      options: form.options.map((item) => ({
        description: item.description.trim(),
        isCorrect: item.isCorrect
      }))
    };

    try {
      validateForm(payload);

      if (selectedQuestionId === null) {
        const created = await createQuestion(payload);
        setQuestions((prev) => [created, ...prev]);
        setFeedback("Question added successfully");
      } else {
        const updated = await updateQuestion(selectedQuestionId, payload);
        setQuestions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setFeedback("Question updated successfully");
      }

      resetForm();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not save question";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(questionId: number) {
    if (!window.confirm("Delete this question permanently?")) {
      return;
    }

    setError(null);
    setFeedback(null);

    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((question) => question.id !== questionId));

      if (selectedQuestionId === questionId) {
        resetForm();
      }

      setFeedback("Question deleted successfully");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not delete question";
      setError(message);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Closed Questions Manager</h1>
        <p>Manage question descriptions and options in one place.</p>
      </header>

      <section className="layout">
        <QuestionList
          questions={questions}
          loading={loading}
          selectedQuestionId={selectedQuestion?.id ?? null}
          onSelect={selectForEdit}
          onDelete={handleDelete}
        />

        <QuestionForm
          isEditing={isEditing}
          form={form}
          saving={saving}
          error={error}
          feedback={feedback}
          onReset={resetForm}
          onSubmit={submitForm}
          onDescriptionChange={(description) => setForm((prev) => ({ ...prev, description }))}
          onAddOption={addOption}
          onUpdateOption={updateOption}
          onRemoveOption={removeOption}
        />
      </section>
    </main>
  );
}

export default App;
