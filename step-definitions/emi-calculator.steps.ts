import { createBdd, test } from 'playwright-bdd';
import { EmiCalculatorPage } from '../pages/emi-calculator.page';
import { expect } from '@playwright/test';

const { Given, When, Then } = createBdd(test);

let pageObject: EmiCalculatorPage;

Given('the EMI calculator application URL is launched', async ({ page }) => {
  pageObject = new EmiCalculatorPage(page);
  await pageObject.openApplication();
});

When('I navigate to the Home Loan tab', async () => {
  await pageObject.navigateToHomeLoanTab();
  await expect(pageObject.getHomeLoanTab()).toBeVisible();
});
