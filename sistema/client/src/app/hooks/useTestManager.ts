import { useCallback, useState, type FormEvent } from "react";
import { createTest, deleteTest, fetchTests, updateTest } from "../../api";
import type { IdentifierMode, Test, TestPayload } from "../../types";

type UseTestManagerParams = {
  setError: (message: string | null) => void;
  setFeedback: (message: string | null) => void;
  clearMessages: () => void;
};

type TestFormState = {
  description: string;
  identifierMode: IdentifierMode;
  questionIds: number[];
};

const emptyTestForm: TestFormState = {
  description: "",
  identifierMode: "LETTERS",
  questionIds: []
};

function validateTestPayload(payload: TestPayload) {
  if (!payload.description.trim()) {
    throw new Error("Test description is required");
  }

  if (payload.questionIds.length < 1) {
    throw new Error("At least 1 question is required");
  }
}

export function useTestManager({ setError, setFeedback, clearMessages }: UseTestManagerParams) {
  const [tests, setTests] = useState<Test[]>([]);
  const [loadingTests, setLoadingTests] = useState(true);
  const [savingTest, setSavingTest] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [form, setForm] = useState<TestFormState>(emptyTestForm);

  const isEditingTest = selectedTestId !== null;

  const loadTests = useCallback(async () => {
    setLoadingTests(true);

    try {
      const data = await fetchTests();
      setTests(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load tests";
      setError(message);
    } finally {
      setLoadingTests(false);
    }
  }, [setError]);

  function resetForm() {
    setForm(emptyTestForm);
    setSelectedTestId(null);
  }

  function openCreateTestModal() {
    resetForm();
    clearMessages();
    setIsTestModalOpen(true);
  }

  function openEditTestModal(test: Test) {
    setSelectedTestId(test.id);
    setForm({
      description: test.description,
      identifierMode: test.identifierMode,
      questionIds: test.testQuestions.map((item) => item.questionId)
    });
    clearMessages();
    setIsTestModalOpen(true);
  }

  function closeTestModal() {
    setIsTestModalOpen(false);
    resetForm();
  }

  function setTestDescription(description: string) {
    setForm((prev) => ({ ...prev, description }));
  }

  function setIdentifierMode(identifierMode: IdentifierMode) {
    setForm((prev) => ({ ...prev, identifierMode }));
  }

  function toggleQuestionSelection(questionId: number) {
    setForm((prev) => {
      const alreadySelected = prev.questionIds.includes(questionId);

      if (alreadySelected) {
        return {
          ...prev,
          questionIds: prev.questionIds.filter((id) => id !== questionId)
        };
      }

      return {
        ...prev,
        questionIds: [...prev.questionIds, questionId]
      };
    });
  }

  async function submitTestForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTest(true);
    clearMessages();

    const payload: TestPayload = {
      description: form.description.trim(),
      identifierMode: form.identifierMode,
      questionIds: form.questionIds
    };

    try {
      validateTestPayload(payload);

      if (selectedTestId === null) {
        const created = await createTest(payload);
        setTests((prev) => [created, ...prev]);
        setFeedback("Test added successfully");
      } else {
        const updated = await updateTest(selectedTestId, payload);
        setTests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setFeedback("Test updated successfully");
      }

      closeTestModal();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not save test";
      setError(message);
    } finally {
      setSavingTest(false);
    }
  }

  async function handleDeleteTest(testId: number) {
    if (!window.confirm("Delete this test permanently?")) {
      return;
    }

    clearMessages();

    try {
      await deleteTest(testId);
      setTests((prev) => prev.filter((test) => test.id !== testId));

      if (selectedTestId === testId) {
        closeTestModal();
      }

      setFeedback("Test deleted successfully");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not delete test";
      setError(message);
    }
  }

  return {
    tests,
    form,
    loadingTests,
    savingTest,
    isTestModalOpen,
    isEditingTest,
    loadTests,
    openCreateTestModal,
    openEditTestModal,
    closeTestModal,
    setTestDescription,
    setIdentifierMode,
    toggleQuestionSelection,
    submitTestForm,
    handleDeleteTest
  };
}
