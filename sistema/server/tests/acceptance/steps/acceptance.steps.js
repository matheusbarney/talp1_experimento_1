import { Before, Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";
import JSZip from "jszip";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const API_URL = process.env.ACCEPTANCE_API_URL ?? "http://localhost:4000";

const state = {
  lastResponse: null,
  lastBody: null,
  lastText: null,
  lastHeaders: {},
  currentQuestion: null,
  currentTest: null,
  availableQuestionIds: [],
  lastZip: null,
  answerSheetCsv: null,
  activeAnswerSheetCsv: null,
  studentAnswersCsv: null
};

Before(() => {
  state.lastResponse = null;
  state.lastBody = null;
  state.lastText = null;
  state.lastHeaders = {};
  state.currentQuestion = null;
  state.currentTest = null;
  state.availableQuestionIds = [];
  state.lastZip = null;
  state.answerSheetCsv = null;
  state.activeAnswerSheetCsv = null;
  state.studentAnswersCsv = null;
});

function parseBooleanFlag(value) {
  return String(value).trim().toLowerCase() === "true";
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readCsvRows(csvText) {
  return parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

function getCsvHeaders(csvText) {
  const rows = readCsvRows(csvText);
  return rows.length > 0 ? Object.keys(rows[0]) : [];
}

async function createQuestion(description) {
  const payload = {
    description,
    options: [
      { description: "Option 1", isCorrect: true },
      { description: "Option 2", isCorrect: false },
      { description: "Option 3", isCorrect: false }
    ]
  };

  const response = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await safeJson(response);

  assert.equal(response.status, 201, `Expected question creation to return 201, got ${response.status}`);
  return body;
}

async function ensureMinimumQuestions(count) {
  const listResponse = await fetch(`${API_URL}/questions`);
  assert.equal(listResponse.status, 200, "Expected GET /questions to return 200");
  const listBody = await safeJson(listResponse);
  const questions = Array.isArray(listBody) ? listBody : [];

  while (questions.length < count) {
    const created = await createQuestion(`Acceptance Question ${Date.now()}-${questions.length + 1}`);
    questions.push(created);
  }

  state.availableQuestionIds = questions.map((question) => question.id);
}

async function createTest(name, identifierMode, questionIds) {
  const payload = {
    description: name,
    identifierMode,
    questionIds
  };

  const response = await fetch(`${API_URL}/tests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const body = await safeJson(response);

  state.lastResponse = response;
  state.lastBody = body;
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());

  return body;
}

async function generateExamPackage(testId, count, headerRow) {
  const payload = {
    count,
    startNumber: 1,
    header: {
      title: headerRow.title,
      className: headerRow.className,
      teacher: headerRow.teacher,
      date: headerRow.date,
      additionalInfo: headerRow.additionalInfo || undefined
    }
  };

  const response = await fetch(`${API_URL}/tests/${testId}/generate-exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const zipBuffer = Buffer.from(await response.arrayBuffer());
  const zip = await JSZip.loadAsync(zipBuffer);

  state.lastResponse = response;
  state.lastBody = null;
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());
  state.lastZip = zip;

  const answerSheetFile = zip.file("answer_sheet.csv");
  if (answerSheetFile) {
    const csv = await answerSheetFile.async("string");
    state.answerSheetCsv = csv;
    state.activeAnswerSheetCsv = csv;
  }
}

async function postForm(path, formData) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData
  });

  state.lastResponse = response;
  state.lastHeaders = Object.fromEntries(response.headers.entries());

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    state.lastBody = await safeJson(response);
    state.lastText = null;
  } else {
    state.lastBody = null;
    state.lastText = await response.text();
  }
}

Given("the API is running", async () => {
  const response = await fetch(`${API_URL}/health`);
  assert.equal(response.status, 200, "Expected GET /health to return 200");
  const body = await safeJson(response);
  assert.equal(body?.ok, true, "Expected /health response body to contain { ok: true }");
});

Given("at least {int} questions exist", async (count) => {
  await ensureMinimumQuestions(count);
});

Given("a question exists with description {string}", async (description) => {
  const created = await createQuestion(description);
  state.currentQuestion = created;
});

Given("a test exists named {string}", async (name) => {
  await ensureMinimumQuestions(2);
  const created = await createTest(name, "LETTERS", state.availableQuestionIds.slice(0, 2));
  assert.equal(state.lastResponse.status, 201, "Expected test creation to return 201");
  state.currentTest = created;
});

Given("a test exists with at least {int} questions and identifier mode {string}", async (count, mode) => {
  await ensureMinimumQuestions(count);
  const created = await createTest(
    `Acceptance Test ${Date.now()}`,
    mode,
    state.availableQuestionIds.slice(0, count)
  );
  assert.equal(state.lastResponse.status, 201, "Expected test creation to return 201");
  state.currentTest = created;
});

Given("an answer sheet csv exists for at least {int} exam", async (examCount) => {
  await ensureMinimumQuestions(2);
  const created = await createTest(
    `Acceptance Eval ${Date.now()}`,
    "LETTERS",
    state.availableQuestionIds.slice(0, 2)
  );
  assert.equal(state.lastResponse.status, 201, "Expected test creation to return 201");
  state.currentTest = created;

  await generateExamPackage(created.id, examCount, {
    title: "Acceptance Exam",
    className: "Class A",
    teacher: "Teacher A",
    date: "2026-03-25",
    additionalInfo: ""
  });

  assert.ok(state.answerSheetCsv, "Expected generated answer sheet csv");
});

Given("a student answers csv exists for that answer sheet", async () => {
  assert.ok(state.activeAnswerSheetCsv, "Expected active answer sheet csv");

  const rows = readCsvRows(state.activeAnswerSheetCsv);
  assert.ok(rows.length > 0, "Expected at least one row in answer sheet");

  const first = rows[0];
  const questionHeaders = Object.keys(first).filter((header) => /^Q\d+$/.test(header));

  const studentRow = {
    StudentName: "Acceptance Student",
    CPF: "12345678901",
    ExamNumber: first.ExamNumber,
    ...Object.fromEntries(questionHeaders.map((header) => [header, first[header] || ""]))
  };

  state.studentAnswersCsv = stringify([studentRow], {
    header: true,
    columns: ["StudentName", "CPF", "ExamNumber", ...questionHeaders]
  });
});

Given("an answer sheet csv without Q1_OPTIONS exists", () => {
  assert.ok(state.answerSheetCsv, "Expected answer sheet csv before removing options columns");

  const rows = readCsvRows(state.answerSheetCsv);
  const headers = Object.keys(rows[0]);
  const keptHeaders = headers.filter((header) => !header.endsWith("_OPTIONS"));
  const simplifiedRows = rows.map((row) =>
    Object.fromEntries(keptHeaders.map((header) => [header, row[header]]))
  );

  state.activeAnswerSheetCsv = stringify(simplifiedRows, {
    header: true,
    columns: keptHeaders
  });
});

When("I create a question with description {string} and options:", async (description, dataTable) => {
  const options = dataTable.hashes().map((row) => ({
    description: row.description,
    isCorrect: parseBooleanFlag(row.isCorrect)
  }));

  const payload = { description, options };

  const response = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  state.lastResponse = response;
  state.lastBody = await safeJson(response);
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());
});

When("I update the question description to {string}", async (description) => {
  assert.ok(state.currentQuestion?.id, "Expected an existing question to update");

  const payload = {
    description,
    options: state.currentQuestion.options.map((option) => ({
      description: option.description,
      isCorrect: option.isCorrect
    }))
  };

  const response = await fetch(`${API_URL}/questions/${state.currentQuestion.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  state.lastResponse = response;
  state.lastBody = await safeJson(response);
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());
});

When("I delete that question", async () => {
  assert.ok(state.currentQuestion?.id, "Expected an existing question to delete");

  const response = await fetch(`${API_URL}/questions/${state.currentQuestion.id}`, {
    method: "DELETE"
  });

  state.lastResponse = response;
  state.lastBody = null;
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());
});

When("I create a test named {string} with identifier mode {string} using available questions", async (name, mode) => {
  await ensureMinimumQuestions(2);
  const created = await createTest(name, mode, state.availableQuestionIds.slice(0, 2));
  if (state.lastResponse.status === 201) {
    state.currentTest = created;
  }
});

When("I create a test named {string} with identifier mode {string} and no question ids", async (name, mode) => {
  await createTest(name, mode, []);
});

When("I delete that test", async () => {
  assert.ok(state.currentTest?.id, "Expected an existing test to delete");

  const response = await fetch(`${API_URL}/tests/${state.currentTest.id}`, {
    method: "DELETE"
  });

  state.lastResponse = response;
  state.lastBody = null;
  state.lastText = null;
  state.lastHeaders = Object.fromEntries(response.headers.entries());
});

When("I generate {int} exam copies for that test with header:", async (count, dataTable) => {
  assert.ok(state.currentTest?.id, "Expected an existing test for exam generation");
  const row = dataTable.hashes()[0];
  await generateExamPackage(state.currentTest.id, count, row);
});

When("I generate {int} exam copy for that test with header:", async (count, dataTable) => {
  assert.ok(state.currentTest?.id, "Expected an existing test for exam generation");
  const row = dataTable.hashes()[0];
  await generateExamPackage(state.currentTest.id, count, row);
});

When("I evaluate exams with mode {string}", async (mode) => {
  assert.ok(state.activeAnswerSheetCsv, "Expected active answer sheet csv");
  assert.ok(state.studentAnswersCsv, "Expected student answers csv");

  const formData = new FormData();
  formData.append("answerSheet", new Blob([state.activeAnswerSheetCsv], { type: "text/csv" }), "answer_sheet.csv");
  formData.append(
    "studentAnswers",
    new Blob([state.studentAnswersCsv], { type: "text/csv" }),
    "student_answers.csv"
  );
  formData.append("mode", mode);

  await postForm("/exams/evaluate", formData);
});

When("I generate random student answers with student count {int}", async (studentCount) => {
  assert.ok(state.activeAnswerSheetCsv, "Expected active answer sheet csv");

  const formData = new FormData();
  formData.append("answerSheet", new Blob([state.activeAnswerSheetCsv], { type: "text/csv" }), "answer_sheet.csv");
  formData.append("studentCount", String(studentCount));

  await postForm("/exams/generate-random-answers", formData);
  if (state.lastResponse.status === 200) {
    state.studentAnswersCsv = state.lastText;
  }
});

Then("the question is created successfully", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 201, "Expected POST /questions to return 201");
  assert.equal(typeof state.lastBody?.id, "number", "Expected created question to include numeric id");
});

Then("the created question has {int} options", (optionCount) => {
  assert.ok(state.lastBody, "Expected created question response body");
  assert.ok(Array.isArray(state.lastBody.options), "Expected created question to include options array");
  assert.equal(state.lastBody.options.length, optionCount);
});

Then("the question is updated successfully", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 200, "Expected PUT /questions/:id to return 200");
});

Then("the question is removed successfully", async () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 204, "Expected DELETE /questions/:id to return 204");

  const response = await fetch(`${API_URL}/questions/${state.currentQuestion.id}`);
  assert.equal(response.status, 404, "Expected deleted question to return 404 when fetched");
});

Then("the test is created successfully", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 201, "Expected POST /tests to return 201");
  assert.equal(typeof state.lastBody?.id, "number", "Expected created test to include numeric id");
});

Then("the test identifier mode is {string}", (expectedMode) => {
  assert.ok(state.lastBody, "Expected created test response body");
  assert.equal(state.lastBody.identifierMode, expectedMode);
});

Then("the test is removed successfully", async () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 204, "Expected DELETE /tests/:id to return 204");

  const response = await fetch(`${API_URL}/tests/${state.currentTest.id}`);
  assert.equal(response.status, 404, "Expected deleted test to return 404 when fetched");
});

Then("the response is a zip file", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 200, "Expected exam generation to return 200");
  const contentType = state.lastHeaders["content-type"] ?? "";
  assert.ok(contentType.includes("application/zip"), `Expected zip response, got '${contentType}'`);
});

Then("the zip contains {int} exam pdf files", (expectedCount) => {
  assert.ok(state.lastZip, "Expected generated zip package");
  const pdfNames = Object.keys(state.lastZip.files).filter((name) => name.endsWith(".pdf"));
  assert.equal(pdfNames.length, expectedCount);
});

Then("the zip contains an answer sheet csv file", () => {
  assert.ok(state.lastZip, "Expected generated zip package");
  assert.ok(state.lastZip.file("answer_sheet.csv"), "Expected answer_sheet.csv inside zip package");
});

Then("the answer sheet csv has columns {string}, {string}, and {string}", (columnA, columnB, columnC) => {
  assert.ok(state.answerSheetCsv, "Expected answer sheet csv content");
  const headers = getCsvHeaders(state.answerSheetCsv);
  assert.ok(headers.includes(columnA), `Expected column '${columnA}'`);
  assert.ok(headers.includes(columnB), `Expected column '${columnB}'`);
  assert.ok(headers.includes(columnC), `Expected column '${columnC}'`);
});

Then("the response is a classroom score report csv", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 200, "Expected exam evaluation to return 200");
  assert.ok(state.lastText, "Expected CSV response body");
});

Then("the report includes columns {string}, {string}, {string}, {string}, and {string}", (a, b, c, d, e) => {
  assert.ok(state.lastText, "Expected classroom score report CSV");
  const headers = getCsvHeaders(state.lastText);
  assert.ok(headers.includes(a), `Expected column '${a}'`);
  assert.ok(headers.includes(b), `Expected column '${b}'`);
  assert.ok(headers.includes(c), `Expected column '${c}'`);
  assert.ok(headers.includes(d), `Expected column '${d}'`);
  assert.ok(headers.includes(e), `Expected column '${e}'`);
});

Then("the response is a student answers csv", () => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 200, "Expected random student answers generation to return 200");
  assert.ok(state.lastText, "Expected CSV response body");
});

Then("the csv includes columns {string}, {string}, {string}, and {string}", (a, b, c, d) => {
  assert.ok(state.lastText, "Expected CSV text content");
  const headers = getCsvHeaders(state.lastText);
  assert.ok(headers.includes(a), `Expected column '${a}'`);
  assert.ok(headers.includes(b), `Expected column '${b}'`);
  assert.ok(headers.includes(c), `Expected column '${c}'`);
  assert.ok(headers.includes(d), `Expected column '${d}'`);
});

Then("the request is rejected with validation error {string}", (expectedMessage) => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 400, "Expected request to fail with status 400");

  const fieldErrors = state.lastBody?.errors?.fieldErrors ?? {};
  const formErrors = state.lastBody?.errors?.formErrors ?? [];

  const allMessages = [
    ...Object.values(fieldErrors).flatMap((value) => (Array.isArray(value) ? value : [])),
    ...formErrors
  ];

  assert.ok(
    allMessages.includes(expectedMessage),
    `Expected validation error '${expectedMessage}', got: ${JSON.stringify(allMessages)}`
  );
});

Then("the request fails with message {string}", (expectedMessage) => {
  assert.ok(state.lastResponse, "Expected a previous API response");
  assert.equal(state.lastResponse.status, 400, "Expected request to fail with status 400");
  assert.equal(state.lastBody?.message, expectedMessage);
});
