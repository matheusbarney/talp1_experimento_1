import type {
  EvaluationMode,
  GenerateExamsPayload,
  Question,
  QuestionPayload,
  Test,
  TestPayload
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(body.message ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function fetchQuestions() {
  return request<Question[]>("/questions");
}

export function createQuestion(payload: QuestionPayload) {
  return request<Question>("/questions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateQuestion(id: number, payload: QuestionPayload) {
  return request<Question>(`/questions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteQuestion(id: number) {
  return request<void>(`/questions/${id}`, {
    method: "DELETE"
  });
}

export function fetchTests() {
  return request<Test[]>("/tests");
}

export function createTest(payload: TestPayload) {
  return request<Test>("/tests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateTest(id: number, payload: TestPayload) {
  return request<Test>(`/tests/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}

export function deleteTest(id: number) {
  return request<void>(`/tests/${id}`, {
    method: "DELETE"
  });
}

export async function generateTestExams(testId: number, payload: GenerateExamsPayload) {
  const response = await fetch(`${API_URL}/tests/${testId}/generate-exams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(body.message ?? "Request failed");
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^\"]+)"?/i);
  const fileName = match ? match[1] : `test-${testId}-exams.zip`;
  const blob = await response.blob();

  return { fileName, blob };
}

export async function evaluateExamAnswers(
  answerSheetFile: File,
  studentAnswersFile: File,
  mode: EvaluationMode
) {
  const formData = new FormData();
  formData.append("answerSheet", answerSheetFile);
  formData.append("studentAnswers", studentAnswersFile);
  formData.append("mode", mode);

  const response = await fetch(`${API_URL}/exams/evaluate`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(body.message ?? "Request failed");
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^\"]+)"?/i);
  const fileName = match ? match[1] : "classroom_score_report.csv";
  const blob = await response.blob();

  return { fileName, blob };
}

export async function generateRandomStudentAnswersCsv(answerSheetFile: File, studentCount: number) {
  const formData = new FormData();
  formData.append("answerSheet", answerSheetFile);
  formData.append("studentCount", String(studentCount));

  const response = await fetch(`${API_URL}/exams/generate-random-answers`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(body.message ?? "Request failed");
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const match = disposition.match(/filename="?([^\"]+)"?/i);
  const fileName = match ? match[1] : "random_student_answers.csv";
  const blob = await response.blob();

  return { fileName, blob };
}
