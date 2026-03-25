Feature: Exam package generation
  As a teacher
  I want to generate exam copies and answer keys
  So that I can distribute unique exams and still grade correctly

  Background:
    Given the API is running
    And a test exists with at least 2 questions and identifier mode "LETTERS"

  Scenario: Generate a zip package with PDFs and answer sheet
    When I generate 3 exam copies for that test with header:
      | title      | className | teacher     | date       | additionalInfo |
      | Midterm 1  | Math 101  | Prof. Silva | 2026-03-25 | No calculators |
    Then the response is a zip file
    And the zip contains 3 exam pdf files
    And the zip contains an answer sheet csv file

  Scenario: Answer sheet includes option metadata for evaluation
    When I generate 1 exam copy for that test with header:
      | title     | className | teacher     | date       | additionalInfo |
      | Quiz 1    | Math 101  | Prof. Silva | 2026-03-25 |                |
    Then the answer sheet csv has columns "ExamNumber", "Q1", and "Q1_OPTIONS"
