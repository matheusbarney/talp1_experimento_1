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

export type IdentifierMode = "LETTERS" | "POWERS_OF_TWO";

export type TestQuestion = {
  id: number;
  position: number;
  questionId: number;
  question: Question;
};

export type Test = {
  id: number;
  description: string;
  identifierMode: IdentifierMode;
  testQuestions: TestQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type TestPayload = {
  description: string;
  identifierMode: IdentifierMode;
  questionIds: number[];
};
