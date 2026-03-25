Feature: Test management
  As a teacher
  I want to create tests from existing questions
  So that each test has a defined answer type

  Background:
    Given the API is running
    And at least 2 questions exist

  Scenario Outline: Create a test with identifier mode
    When I create a test named "Midterm A" with identifier mode "<mode>" using available questions
    Then the test is created successfully
    And the test identifier mode is "<mode>"

    Examples:
      | mode          |
      | LETTERS       |
      | POWERS_OF_TWO |

  Scenario: Reject a test without question ids
    When I create a test named "Invalid test" with identifier mode "LETTERS" and no question ids
    Then the request is rejected with validation error "At least 1 question is required"

  Scenario: Delete an existing test
    Given a test exists named "Disposable Test"
    When I delete that test
    Then the test is removed successfully
