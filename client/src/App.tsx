import { useEffect } from "react";
import "./App.css";
import { QuestionForm } from "./components/QuestionForm";
import { QuestionList } from "./components/QuestionList";
import { ExamEvaluationPanel } from "./components/ExamEvaluationPanel";
import { ExamGenerationForm } from "./components/ExamGenerationForm";
import { TestForm } from "./components/TestForm";
import { TestList } from "./components/TestList";
import { useAppMessages } from "./app/hooks/useAppMessages";
import { useExamEvaluation } from "./app/hooks/useExamEvaluation";
import { useExamGeneration } from "./app/hooks/useExamGeneration";
import { useQuestionManager } from "./app/hooks/useQuestionManager";
import { useTestManager } from "./app/hooks/useTestManager";

function App() {
  const { error, feedback, setError, setFeedback, clearMessages } = useAppMessages();

  const tests = useTestManager({
    setError,
    setFeedback,
    clearMessages
  });

  const questions = useQuestionManager({
    setError,
    setFeedback,
    clearMessages,
    refreshTests: tests.loadTests
  });

  const examGeneration = useExamGeneration({
    setError,
    setFeedback,
    clearMessages
  });

  const examEvaluation = useExamEvaluation({
    setError,
    setFeedback,
    clearMessages
  });

  useEffect(() => {
    clearMessages();
    void Promise.all([questions.loadQuestions(), tests.loadTests()]);
  }, [clearMessages, questions.loadQuestions, tests.loadTests]);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Closed Questions Manager</h1>
        <p>Manage questions and build tests from selected questions.</p>
      </header>

      {feedback ? <p className="alert success page-feedback">{feedback}</p> : null}
      {error && !questions.isQuestionModalOpen && !tests.isTestModalOpen && !examGeneration.isGenerationModalOpen ? (
        <p className="alert error page-feedback">{error}</p>
      ) : null}

      <section className="layout-two-columns">
        <div className="column">
          <section className="toolbar">
            <button className="primary" onClick={questions.openCreateQuestionModal}>
              Add Question
            </button>
          </section>
          <QuestionList
            questions={questions.questions}
            loading={questions.loadingQuestions}
            onEdit={questions.openEditQuestionModal}
            onDelete={questions.handleDeleteQuestion}
          />
        </div>

        <div className="column">
          <section className="toolbar">
            <button className="primary" onClick={tests.openCreateTestModal}>
              Add Test
            </button>
          </section>
          <TestList
            tests={tests.tests}
            loading={tests.loadingTests}
            onEdit={tests.openEditTestModal}
            onDelete={tests.handleDeleteTest}
            onGenerate={examGeneration.openGenerateModal}
          />
        </div>
      </section>

      <section className="tools-section">
        <ExamEvaluationPanel
          mode={examEvaluation.evaluationMode}
          answerSheetFileName={examEvaluation.evaluationAnswerSheetFile?.name ?? null}
          studentAnswersFileName={examEvaluation.evaluationStudentAnswersFile?.name ?? null}
          randomAnswerSheetFileName={examEvaluation.randomAnswerSheetFile?.name ?? null}
          randomStudentCount={examEvaluation.randomStudentCount}
          runningEvaluation={examEvaluation.runningEvaluation}
          runningRandomGenerator={examEvaluation.runningRandomGenerator}
          onModeChange={examEvaluation.setEvaluationMode}
          onAnswerSheetChange={examEvaluation.setEvaluationAnswerSheetFile}
          onStudentAnswersChange={examEvaluation.setEvaluationStudentAnswersFile}
          onRandomAnswerSheetChange={examEvaluation.setRandomAnswerSheetFile}
          onRandomStudentCountChange={examEvaluation.setRandomStudentCount}
          onEvaluate={examEvaluation.handleEvaluateExams}
          onGenerateRandomAnswers={examEvaluation.handleGenerateRandomAnswers}
        />
      </section>

      {questions.isQuestionModalOpen ? (
        <div
          className="modal-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && questions.closeQuestionModal()}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={questions.isEditingQuestion ? "Edit question" : "Add question"}
          >
            <QuestionForm
              isEditing={questions.isEditingQuestion}
              form={questions.form}
              saving={questions.savingQuestion}
              error={error}
              feedback={null}
              onClose={questions.closeQuestionModal}
              onSubmit={questions.submitQuestionForm}
              onDescriptionChange={questions.setQuestionDescription}
              onAddOption={questions.addOption}
              onUpdateOption={questions.updateOption}
              onRemoveOption={questions.removeOption}
            />
          </div>
        </div>
      ) : null}

      {tests.isTestModalOpen ? (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && tests.closeTestModal()}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={tests.isEditingTest ? "Edit test" : "Add test"}
          >
            <TestForm
              isEditing={tests.isEditingTest}
              form={tests.form}
              questions={questions.questions}
              saving={tests.savingTest}
              error={error}
              onClose={tests.closeTestModal}
              onSubmit={tests.submitTestForm}
              onDescriptionChange={tests.setTestDescription}
              onIdentifierModeChange={tests.setIdentifierMode}
              onToggleQuestion={tests.toggleQuestionSelection}
            />
          </div>
        </div>
      ) : null}

      {examGeneration.isGenerationModalOpen && examGeneration.selectedGenerationTest ? (
        <div
          className="modal-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && examGeneration.closeGenerateModal()}
        >
          <div className="modal-card" role="dialog" aria-modal="true" aria-label="Generate exam PDFs">
            <ExamGenerationForm
              testName={examGeneration.selectedGenerationTest.description}
              saving={examGeneration.savingGeneration}
              error={error}
              form={examGeneration.generationForm}
              onClose={examGeneration.closeGenerateModal}
              onSubmit={examGeneration.submitGenerationForm}
              onChange={examGeneration.updateGenerationForm}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
