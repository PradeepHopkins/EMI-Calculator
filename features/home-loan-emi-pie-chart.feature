Feature: Home Loan EMI EMI Pie Chart Validation

  As a user
  I want to validate the EMI amount and pie chart Home Loan
  So that I can confirm the values shown by the application

  Scenario Outline: Validate Home Loan EMI amount and pie chart for multiple scenarios
    Given the EMI calculator application URL is launched for Home Loan
    When I navigate to the Home Loan tab
    And I enter a home loan amount of "<homeLoanAmount>"
    And I enter an interest rate of "<interestRate>"
    And I enter a tenure of "<tenureYears> years"
    Then the displayed EMI should match my calculated EMI
    And the pie chart values should be greater than zero

    Examples:
      | scenario   | homeLoanAmount | interestRate | tenureYears |
      | Scenario A | 25L            | 10%          | 10          |
      | Scenario B | 50L            | 7.5%         | 15          |