export type Option = {
  id?: number;
  description: string;
  isCorrect: boolean;
};

export type Question = {
  id: number;
  description: string;
  options: Option[];
  createdAt: string;
  updatedAt: string;
};

export type QuestionPayload = {
  description: string;
  options: Option[];
};
