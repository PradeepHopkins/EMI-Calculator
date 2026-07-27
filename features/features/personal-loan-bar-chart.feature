Feature: Personal Loan EMI Bar Chart Validation

  As a user
  I want to validate the EMI bar chart for Personal Loan
  So that I can confirm the chart is rendered with visible bar data

  Scenario: Validate the EMI bar chart for Personal Loan
    Given the EMI calculator application URL is launched for personal loan
    When I navigate to the Personal Loan tab
    And I set the personal loan amount to "10L"
    And I set the personal loan interest rate to "12%"
    And I set the personal loan tenure to "5 years"
    And I set the repayment schedule start date to the first Monday of the next month
    Then the bar chart should be visible
    And the bar chart should contain at least 2 bars
    And I can retrieve the tooltip values from a bar