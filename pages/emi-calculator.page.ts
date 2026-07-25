import { Page } from '@playwright/test';

export class EmiCalculatorPage {
  constructor(private page: Page) { }

  async openApplication() {
    await this.page.goto(process.env.BASE_URL!);
  }

  async navigateToHomeLoanTab() {
    await this.page.getByRole('link', { name: 'Home Loan', exact: true }).click();
  }

  getHomeLoanTab() {
    return this.page.locator('#home-loan');;
  }

  async enterLoanAmount(value: string) {
    await this.page.locator('#loanamount').fill(value);
  }
}
