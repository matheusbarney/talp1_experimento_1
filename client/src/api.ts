import type { Question, QuestionPayload } from "./types";

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
