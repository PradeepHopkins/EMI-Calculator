import { createBdd, test } from 'playwright-bdd';
import { expect } from '@playwright/test';
import { PersonalLoanPage } from '../pages/personal-loan.page';
import { parseInterestRate, parseLoanAmount, parseTenureYears } from '../utils/emi-utils';

const { Given, When, Then } = createBdd(test);

let personalLoanPageObject: PersonalLoanPage;

Given('the EMI calculator application URL is launched for personal loan', async ({ page }) => {
  personalLoanPageObject = new PersonalLoanPage(page);
  await personalLoanPageObject.openApplication();
});

When('I navigate to the Personal Loan tab', async () => {
  await personalLoanPageObject.navigateToPersonalLoanTab();
  await expect(personalLoanPageObject.personalLoanTab()).toBeVisible();
});

When('I set the personal loan amount to {string}', async ({}, amountText: string) => {
  const loanAmount = parseLoanAmount(amountText);
  await personalLoanPageObject.setPersonalLoanAmountUsingSlider(loanAmount);
  const actualAmount = await personalLoanPageObject.getPersonalLoanAmountNumericValue();
  expect(actualAmount).toBe(loanAmount);
});

When('I set the personal loan interest rate to {string}', async ({}, rateText: string) => {
  const interestRate = parseInterestRate(rateText);
  await personalLoanPageObject.setInterestRateUsingSlider(interestRate);
  const actualRate = await personalLoanPageObject.getInterestRateNumericValue();
  expect(actualRate).toBe(interestRate);
});

When('I set the personal loan tenure to {string}', async ({}, tenureText: string) => {
  const loanTenure = parseTenureYears(tenureText);
  await personalLoanPageObject.setLoanTenureUsingSlider(loanTenure);
  const actualTenure = await personalLoanPageObject.getLoanTenureNumericValue();
  expect(actualTenure).toBe(loanTenure);
});

When('I set the repayment schedule start date to the first Monday of the next month', async () => {
  await personalLoanPageObject.modifyScheduleToNextMonthFirstMonday();
  const scheduleValue = await personalLoanPageObject.getScheduleMonthValue();
  expect(scheduleValue).not.toEqual('');
});

Then('the bar chart should be visible', async () => {
  await expect(personalLoanPageObject.getBarChartContainer()).toBeVisible();
});

Then('the bar chart should contain at least 2 bars', async () => {
  const barCount = await personalLoanPageObject.getBarChartBarCount();
  expect(barCount).toBeGreaterThanOrEqual(2);
});

Then('I can retrieve the tooltip values from a bar', async () => {
  const tooltipValues = await personalLoanPageObject.getTooltipValuesFromBar();
  expect(tooltipValues.length).toBeGreaterThan(0);
});
