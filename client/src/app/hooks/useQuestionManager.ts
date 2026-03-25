import { useCallback, useState, type FormEvent } from "react";
import { createQuestion, deleteQuestion, fetchQuestions, updateQuestion } from "../../api";
import type { Option, Question, QuestionPayload } from "../../types";

type UseQuestionManagerParams = {
  setError: (message: string | null) => void;
  setFeedback: (message: string | null) => void;
  clearMessages: () => void;
  refreshTests: () => Promise<void>;
};

type QuestionFormState = {
  description: string;
  options: Option[];
};

const emptyQuestionForm: QuestionFormState = {
  description: "",
  options: [
    { description: "", isCorrect: false },
    { description: "", isCorrect: false }
  ]
};

function validateQuestionPayload(payload: QuestionPayload) {
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

export function useQuestionManager({
  setError,
  setFeedback,
  clearMessages,
  refreshTests
}: UseQuestionManagerParams) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionFormState>(emptyQuestionForm);

  const isEditingQuestion = selectedQuestionId !== null;

  const loadQuestions = useCallback(async () => {
    setLoadingQuestions(true);

    try {
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load questions";
      setError(message);
    } finally {
      setLoadingQuestions(false);
    }
  }, [setError]);

  function resetForm() {
    setForm(emptyQuestionForm);
    setSelectedQuestionId(null);
  }

  function openCreateQuestionModal() {
    resetForm();
    clearMessages();
    setIsQuestionModalOpen(true);
  }

  function openEditQuestionModal(question: Question) {
    setSelectedQuestionId(question.id);
    setForm({
      description: question.description,
      options: question.options.map((item) => ({
        description: item.description,
        isCorrect: item.isCorrect
      }))
    });
    clearMessages();
    setIsQuestionModalOpen(true);
  }

  function closeQuestionModal() {
    setIsQuestionModalOpen(false);
    resetForm();
  }

  function setQuestionDescription(description: string) {
    setForm((prev) => ({ ...prev, description }));
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

  async function submitQuestionForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingQuestion(true);
    clearMessages();

    const payload: QuestionPayload = {
      description: form.description.trim(),
      options: form.options.map((item) => ({
        description: item.description.trim(),
        isCorrect: item.isCorrect
      }))
    };

    try {
      validateQuestionPayload(payload);

      if (selectedQuestionId === null) {
        const created = await createQuestion(payload);
        setQuestions((prev) => [created, ...prev]);
        setFeedback("Question added successfully");
      } else {
        const updated = await updateQuestion(selectedQuestionId, payload);
        setQuestions((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setFeedback("Question updated successfully");
      }

      closeQuestionModal();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not save question";
      setError(message);
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleDeleteQuestion(questionId: number) {
    if (!window.confirm("Delete this question permanently?")) {
      return;
    }

    clearMessages();

    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((question) => question.id !== questionId));

      if (selectedQuestionId === questionId) {
        closeQuestionModal();
      }

      await refreshTests();
      setFeedback("Question deleted successfully");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not delete question";
      setError(message);
    }
  }

  return {
    questions,
    form,
    loadingQuestions,
    savingQuestion,
    isQuestionModalOpen,
    isEditingQuestion,
    loadQuestions,
    openCreateQuestionModal,
    openEditQuestionModal,
    closeQuestionModal,
    setQuestionDescription,
    addOption,
    updateOption,
    removeOption,
    submitQuestionForm,
    handleDeleteQuestion
  };
}
