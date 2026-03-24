import { useEffect, useState, type FormEvent } from "react";
import "./App.css";
import {
  createQuestion,
  createTest,
  deleteQuestion,
  deleteTest,
  fetchQuestions,
  fetchTests,
  generateTestExams,
  updateQuestion,
  updateTest
} from "./api";
import type {
  GenerateExamsPayload,
  IdentifierMode,
  Option,
  Question,
  QuestionPayload,
  Test,
  TestPayload
} from "./types";
import { QuestionForm } from "./components/QuestionForm";
import { QuestionList } from "./components/QuestionList";
import { ExamGenerationForm } from "./components/ExamGenerationForm";
import { TestForm } from "./components/TestForm";
import { TestList } from "./components/TestList";

const initialOptions: Option[] = [
  { description: "", isCorrect: false },
  { description: "", isCorrect: false }
];

type FormState = {
  description: string;
  options: Option[];
};

type TestFormState = {
  description: string;
  identifierMode: IdentifierMode;
  questionIds: number[];
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

const emptyForm: FormState = {
  description: "",
  options: initialOptions
};

const emptyTestForm: TestFormState = {
  description: "",
  identifierMode: "LETTERS",
  questionIds: []
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

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [testForm, setTestForm] = useState<TestFormState>(emptyTestForm);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [selectedGenerationTest, setSelectedGenerationTest] = useState<Test | null>(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [generationForm, setGenerationForm] = useState<GenerationFormState>(buildDefaultGenerationForm);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [loadingTests, setLoadingTests] = useState(true);
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [savingTest, setSavingTest] = useState(false);
  const [savingGeneration, setSavingGeneration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isEditingQuestion = selectedQuestionId !== null;
  const isEditingTest = selectedTestId !== null;

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoadingQuestions(true);
    setLoadingTests(true);
    setError(null);

    try {
      const [questionsData, testsData] = await Promise.all([fetchQuestions(), fetchTests()]);
      setQuestions(questionsData);
      setTests(testsData);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load data";
      setError(message);
    } finally {
      setLoadingQuestions(false);
      setLoadingTests(false);
    }
  }

  async function refreshTests() {
    setLoadingTests(true);

    try {
      const testData = await fetchTests();
      setTests(testData);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Failed to load tests";
      setError(message);
    } finally {
      setLoadingTests(false);
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

  function resetTestForm() {
    setTestForm(emptyTestForm);
    setSelectedTestId(null);
  }

  function openCreateModal() {
    resetForm();
    setError(null);
    setFeedback(null);
    setIsQuestionModalOpen(true);
  }

  function openEditModal(question: Question) {
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
    setIsQuestionModalOpen(true);
  }

  function closeQuestionModal() {
    setIsQuestionModalOpen(false);
    resetForm();
  }

  function openCreateTestModal() {
    resetTestForm();
    setError(null);
    setFeedback(null);
    setIsTestModalOpen(true);
  }

  function openEditTestModal(test: Test) {
    setSelectedTestId(test.id);
    setTestForm({
      description: test.description,
      identifierMode: test.identifierMode,
      questionIds: test.testQuestions.map((item) => item.questionId)
    });
    setFeedback(null);
    setError(null);
    setIsTestModalOpen(true);
  }

  function closeTestModal() {
    setIsTestModalOpen(false);
    resetTestForm();
  }

  function openGenerateModal(test: Test) {
    setSelectedGenerationTest(test);
    setGenerationForm(buildDefaultGenerationForm());
    setError(null);
    setFeedback(null);
    setIsGenerationModalOpen(true);
  }

  function closeGenerateModal() {
    setIsGenerationModalOpen(false);
    setSelectedGenerationTest(null);
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
    setSavingQuestion(true);
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

      closeQuestionModal();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not save question";
      setError(message);
    } finally {
      setSavingQuestion(false);
    }
  }

  function toggleQuestionSelection(questionId: number) {
    setTestForm((prev) => {
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

  function validateTestForm(payload: TestPayload) {
    if (!payload.description.trim()) {
      throw new Error("Test description is required");
    }

    if (payload.questionIds.length < 1) {
      throw new Error("At least 1 question is required");
    }
  }

  async function submitTestForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingTest(true);
    setError(null);
    setFeedback(null);

    const payload: TestPayload = {
      description: testForm.description.trim(),
      identifierMode: testForm.identifierMode,
      questionIds: testForm.questionIds
    };

    try {
      validateTestForm(payload);

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
        closeQuestionModal();
      }

      await refreshTests();

      setFeedback("Question deleted successfully");
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not delete question";
      setError(message);
    }
  }

  async function handleDeleteTest(testId: number) {
    if (!window.confirm("Delete this test permanently?")) {
      return;
    }

    setError(null);
    setFeedback(null);

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

  function validateGenerationForm(payload: GenerateExamsPayload) {
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

  async function submitGenerationForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedGenerationTest) {
      setError("Select a test first");
      return;
    }

    setSavingGeneration(true);
    setError(null);
    setFeedback(null);

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
      validateGenerationForm(payload);
      const result = await generateTestExams(selectedGenerationTest.id, payload);

      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = result.fileName;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setFeedback("Exam package generated successfully");
      closeGenerateModal();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Could not generate exam package";
      setError(message);
    } finally {
      setSavingGeneration(false);
    }
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Closed Questions Manager</h1>
        <p>Manage questions and build tests from selected questions.</p>
      </header>

      {feedback ? <p className="alert success page-feedback">{feedback}</p> : null}
      {error && !isQuestionModalOpen && !isTestModalOpen && !isGenerationModalOpen ? (
        <p className="alert error page-feedback">{error}</p>
      ) : null}

      <section className="layout-two-columns">
        <div className="column">
          <section className="toolbar">
            <button className="primary" onClick={openCreateModal}>
              Add Question
            </button>
          </section>
          <QuestionList
            questions={questions}
            loading={loadingQuestions}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        </div>

        <div className="column">
          <section className="toolbar">
            <button className="primary" onClick={openCreateTestModal}>
              Add Test
            </button>
          </section>
          <TestList
            tests={tests}
            loading={loadingTests}
            onEdit={openEditTestModal}
            onDelete={handleDeleteTest}
            onGenerate={openGenerateModal}
          />
        </div>
      </section>

      {isQuestionModalOpen ? (
        <div
          className="modal-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && closeQuestionModal()}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={isEditingQuestion ? "Edit question" : "Add question"}
          >
            <QuestionForm
              isEditing={isEditingQuestion}
              form={form}
              saving={savingQuestion}
              error={error}
              feedback={null}
              onClose={closeQuestionModal}
              onSubmit={submitForm}
              onDescriptionChange={(description) => setForm((prev) => ({ ...prev, description }))}
              onAddOption={addOption}
              onUpdateOption={updateOption}
              onRemoveOption={removeOption}
            />
          </div>
        </div>
      ) : null}

      {isTestModalOpen ? (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeTestModal()}>
          <div className="modal-card" role="dialog" aria-modal="true" aria-label={isEditingTest ? "Edit test" : "Add test"}>
            <TestForm
              isEditing={isEditingTest}
              form={testForm}
              questions={questions}
              saving={savingTest}
              error={error}
              onClose={closeTestModal}
              onSubmit={submitTestForm}
              onDescriptionChange={(description) => setTestForm((prev) => ({ ...prev, description }))}
              onIdentifierModeChange={(identifierMode) =>
                setTestForm((prev) => ({
                  ...prev,
                  identifierMode
                }))
              }
              onToggleQuestion={toggleQuestionSelection}
            />
          </div>
        </div>
      ) : null}

      {isGenerationModalOpen && selectedGenerationTest ? (
        <div
          className="modal-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && closeGenerateModal()}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Generate exam PDFs">
            <ExamGenerationForm
              testName={selectedGenerationTest.description}
              saving={savingGeneration}
              error={error}
              form={generationForm}
              onClose={closeGenerateModal}
              onSubmit={submitGenerationForm}
              onChange={(changes) => setGenerationForm((prev) => ({ ...prev, ...changes }))}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
