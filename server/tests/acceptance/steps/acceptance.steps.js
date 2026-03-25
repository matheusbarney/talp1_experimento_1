import { Given, Then, When } from "@cucumber/cucumber";
import assert from "node:assert/strict";

const API_URL = process.env.ACCEPTANCE_API_URL ?? "http://localhost:4000";

const state = {
  lastResponse: null,
  lastBody: null
};

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

function pending(stepName) {
  throw new Error(`Step not implemented yet: ${stepName}`);
}

Given("the API is running", async () => {
  const response = await fetch(`${API_URL}/health`);
  assert.equal(response.status, 200, "Expected GET /health to return 200");
  const body = await safeJson(response);
  assert.equal(body?.ok, true, "Expected /health response body to contain { ok: true }");
});

Given("at least {int} questions exist", () => {
  pending("at least {int} questions exist");
});

Given("a question exists with description {string}", () => {
  pending("a question exists with description {string}");
});

Given("a test exists named {string}", () => {
  pending("a test exists named {string}");
});

Given("a test exists with at least {int} questions and identifier mode {string}", () => {
  pending("a test exists with at least {int} questions and identifier mode {string}");
});

Given("an answer sheet csv exists for at least {int} exam", () => {
  pending("an answer sheet csv exists for at least {int} exam");
});

Given("a student answers csv exists for that answer sheet", () => {
  pending("a student answers csv exists for that answer sheet");
});

Given("an answer sheet csv without Q1_OPTIONS exists", () => {
  pending("an answer sheet csv without Q1_OPTIONS exists");
});

When("I create a question with description {string} and options:", async (description, dataTable) => {
  const options = dataTable.hashes().map((row) => ({
    description: row.description,
    isCorrect: parseBooleanFlag(row.isCorrect)
  }));

  const payload = { description, options };

  const response = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  state.lastResponse = response;
  state.lastBody = await safeJson(response);
});

When("I update the question description to {string}", () => {
  pending("I update the question description to {string}");
});

When("I delete that question", () => {
  pending("I delete that question");
});

When("I create a test named {string} with identifier mode {string} using available questions", () => {
  pending("I create a test named {string} with identifier mode {string} using available questions");
});

When("I create a test named {string} with identifier mode {string} and no question ids", () => {
  pending("I create a test named {string} with identifier mode {string} and no question ids");
});

When("I delete that test", () => {
  pending("I delete that test");
});

When("I generate {int} exam copies for that test with header:", () => {
  pending("I generate {int} exam copies for that test with header:");
});

When("I generate {int} exam copy for that test with header:", () => {
  pending("I generate {int} exam copy for that test with header:");
});

When("I evaluate exams with mode {string}", () => {
  pending("I evaluate exams with mode {string}");
});

When("I generate random student answers with student count {int}", () => {
  pending("I generate random student answers with student count {int}");
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
  pending("the question is updated successfully");
});

Then("the question is removed successfully", () => {
  pending("the question is removed successfully");
});

Then("the test is created successfully", () => {
  pending("the test is created successfully");
});

Then("the test identifier mode is {string}", () => {
  pending("the test identifier mode is {string}");
});

Then("the test is removed successfully", () => {
  pending("the test is removed successfully");
});

Then("the response is a zip file", () => {
  pending("the response is a zip file");
});

Then("the zip contains {int} exam pdf files", () => {
  pending("the zip contains {int} exam pdf files");
});

Then("the zip contains an answer sheet csv file", () => {
  pending("the zip contains an answer sheet csv file");
});

Then("the answer sheet csv has columns {string}, {string}, and {string}", () => {
  pending("the answer sheet csv has columns {string}, {string}, and {string}");
});

Then("the response is a classroom score report csv", () => {
  pending("the response is a classroom score report csv");
});

Then("the report includes columns {string}, {string}, {string}, {string}, and {string}", () => {
  pending("the report includes columns {string}, {string}, {string}, {string}, and {string}");
});

Then("the response is a student answers csv", () => {
  pending("the response is a student answers csv");
});

Then("the csv includes columns {string}, {string}, {string}, and {string}", () => {
  pending("the csv includes columns {string}, {string}, {string}, and {string}");
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

Then("the request fails with message {string}", () => {
  pending("the request fails with message {string}");
});
