import { useState, type FormEvent } from "react";
import { generateTestExams } from "../../api";
import type { GenerateExamsPayload, Test } from "../../types";
import { downloadBlob } from "../utils/download";

type UseExamGenerationParams = {
  setError: (message: string | null) => void;
  setFeedback: (message: string | null) => void;
  clearMessages: () => void;
};

type GenerationFormState = {
  count: number;
  startNumber: number;
  title: string;
  className: string;
  teacher: string;
  date: string;
  additionalInfo: string;
};

function buildDefaultGenerationForm(): GenerationFormState {
  return {
    count: 1,
    startNumber: 1,
    title: "Exam",
    className: "",
    teacher: "",
    date: new Date().toLocaleDateString(),
    additionalInfo: ""
  };
}

function validateGenerationPayload(payload: GenerateExamsPayload) {
  if (payload.count < 1) {
    throw new Error("At least 1 exam PDF is required");
  }

  if (payload.count > 500) {
    throw new Error("The maximum amount is 500 exam PDFs at once");
  }

  if (payload.startNumber < 1) {
    throw new Error("The first exam number must be positive");
  }

  if (!payload.header.title.trim()) {
    throw new Error("Exam title is required");
  }

  if (!payload.header.className.trim()) {
    throw new Error("Class name is required");
  }

  if (!payload.header.teacher.trim()) {
    throw new Error("Teacher name is required");
  }

  if (!payload.header.date.trim()) {
    throw new Error("Date is required");
  }
}

export function useExamGeneration({ setError, setFeedback, clearMessages }: UseExamGenerationParams) {
  const [savingGeneration, setSavingGeneration] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [selectedGenerationTest, setSelectedGenerationTest] = useState<Test | null>(null);
  const [generationForm, setGenerationForm] = useState<GenerationFormState>(buildDefaultGenerationForm);

  function openGenerateModal(test: Test) {
    setSelectedGenerationTest(test);
    setGenerationForm(buildDefaultGenerationForm());
    clearMessages();
    setIsGenerationModalOpen(true);
  }

  function closeGenerateModal() {
    setIsGenerationModalOpen(false);
    setSelectedGenerationTest(null);
  }

  function updateGenerationForm(changes: Partial<GenerationFormState>) {
    setGenerationForm((prev) => ({ ...prev, ...changes }));
  }

  async function submitGenerationForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGenerationTest) {
      setError("Select a test first");
      return;
    }

    setSavingGeneration(true);
    clearMessages();

    const payload: GenerateExamsPayload = {
      count: generationForm.count,
      startNumber: generationForm.startNumber,
      header: {
        title: generationForm.title.trim(),
        className: generationForm.className.trim(),
        teacher: generationForm.teacher.trim(),
        date: generationForm.date.trim(),
        additionalInfo: generationForm.additionalInfo.trim() || undefined
      }
    };

    try {
      validateGenerationPayload(payload);
      const result = await generateTestExams(selectedGenerationTest.id, payload);
      downloadBlob(result.fileName, result.blob);
      setFeedback("Exam package generated successfully");
      closeGenerateModal();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not generate exam package";
      setError(message);
    } finally {
      setSavingGeneration(false);
    }
  }

  return {
    savingGeneration,
    isGenerationModalOpen,
    selectedGenerationTest,
    generationForm,
    openGenerateModal,
    closeGenerateModal,
    updateGenerationForm,
    submitGenerationForm
  };
}
