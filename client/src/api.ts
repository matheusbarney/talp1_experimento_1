import type { Question, QuestionPayload, Test, TestPayload } from "./types";

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
