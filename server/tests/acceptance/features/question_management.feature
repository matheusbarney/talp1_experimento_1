Feature: Question management
  As a teacher
  I want to manage closed questions
  So that I can build tests from a consistent question bank

  Background:
    Given the API is running

  Scenario: Create a valid question
    When I create a question with description "Which number is prime?" and options:
      | description | isCorrect |
      | 4           | false     |
      | 5           | true      |
      | 6           | false     |
    Then the question is created successfully
    And the created question has 3 options

  Scenario: Reject a question without a correct option
    When I create a question with description "Pick the right statement" and options:
      | description | isCorrect |
      | Option A    | false     |
      | Option B    | false     |
    Then the request is rejected with validation error "At least one option must be marked as correct"

  Scenario: Update an existing question
    Given a question exists with description "What is 2 + 2?"
    When I update the question description to "How much is 2 + 2?"
    Then the question is updated successfully

  Scenario: Delete an existing question
    Given a question exists with description "Temporary question"
    When I delete that question
    Then the question is removed successfully
