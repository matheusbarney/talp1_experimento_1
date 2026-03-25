Feature: Exam evaluation and classroom report
  As a teacher
  I want to evaluate student answers from CSV files
  So that I can generate classroom score reports

  Background:
    Given the API is running
    And an answer sheet csv exists for at least 1 exam

  Scenario Outline: Evaluate exams by mode
    Given a student answers csv exists for that answer sheet
    When I evaluate exams with mode "<mode>"
    Then the response is a classroom score report csv
    And the report includes columns "StudentName", "CPF", "ExamNumber", "Mode", and "TotalPercent"

    Examples:
      | mode      |
      | STRINGENT |
      | LIBERAL   |

  Scenario: Generate random student answers for testing
    When I generate random student answers with student count 20
    Then the response is a student answers csv
    And the csv includes columns "StudentName", "CPF", "ExamNumber", and "Q1"

  Scenario: Liberal mode requires option metadata
    Given an answer sheet csv without Q1_OPTIONS exists
    And a student answers csv exists for that answer sheet
    When I evaluate exams with mode "LIBERAL"
    Then the request fails with message "Answer sheet is missing Q*_OPTIONS columns required for LIBERAL evaluation"
