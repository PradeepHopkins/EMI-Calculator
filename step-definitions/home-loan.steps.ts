import { createBdd, test } from 'playwright-bdd';
import { EmiCalculatorPage } from '../pages/home-loan.page';
import { expect } from '@playwright/test';
import { calculateEmi, parseInterestRate, parseLoanAmount, parseTenureYears } from '../utils/emi-utils';

const { Given, When, Then } = createBdd(test);

let pageObject: EmiCalculatorPage;
let currentScenario: { principal: number; interestRate: number; tenureYears: number } | undefined;

Given('the EMI calculator application URL is launched for Home Loan', async ({ page }) => {
  pageObject = new EmiCalculatorPage(page);
  await pageObject.openApplication();
});

When('I navigate to the Home Loan tab', async () => {
  await pageObject.navigateToHomeLoanTab();
  await expect(pageObject.homeLoanTab()).toBeVisible();
});

When('I enter a home loan amount of {string}', async ({}, amountText: string) => {
  const loanAmount = parseLoanAmount(amountText);
  currentScenario = { principal: loanAmount, interestRate: currentScenario?.interestRate ?? 0, tenureYears: currentScenario?.tenureYears ?? 0 };
  await pageObject.enterHomeLoanAmount(String(loanAmount));
  await expect(pageObject.homeLoanAmount()).toHaveValue(String(loanAmount));
});

When('I enter an interest rate of {string}', async ({}, rateText: string) => {
  const interestRate = parseInterestRate(rateText);
  currentScenario = { principal: currentScenario?.principal ?? 0, interestRate, tenureYears: currentScenario?.tenureYears ?? 0 };
  await pageObject.enterInterestRate(String(interestRate));
  await expect(pageObject.interestRate()).toHaveValue(String(interestRate));
});

When('I enter a tenure of {string}', async ({}, tenureText: string) => {
  const loanTenure = parseTenureYears(tenureText);
  currentScenario = { principal: currentScenario?.principal ?? 0, interestRate: currentScenario?.interestRate ?? 0, tenureYears: loanTenure };
  await pageObject.enterLoanTenure(String(loanTenure));
  await expect(pageObject.loanTenure()).toHaveValue(String(loanTenure));
});

Then('the displayed EMI should match my calculated EMI', async () => {
  if (!currentScenario) {
    throw new Error('Scenario details were not populated before EMI validation');
  }

  const actualEmi = await pageObject.getDisplayedEmiAmount();
  const expectedEmi = Math.round(calculateEmi(currentScenario.principal, currentScenario.interestRate, currentScenario.tenureYears));

  expect(actualEmi, `Expected EMI ${expectedEmi}, but found ${actualEmi}`).toBeGreaterThan(0);
  expect(Math.abs(actualEmi - expectedEmi)).toBeLessThanOrEqual(1);
});

Then('the pie chart values should be greater than zero', async () => {
  await expect(pageObject.pieChartContainer()).toBeVisible();

  const pieChartValues = await pageObject.getPieChartValues();
  expect(pieChartValues.length).toBeGreaterThanOrEqual(2);

  for (const value of pieChartValues) {
    expect(value).toBeGreaterThan(0);
  }
});

