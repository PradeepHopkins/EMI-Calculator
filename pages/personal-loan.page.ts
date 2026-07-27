import { Locator, Page } from '@playwright/test';

export class PersonalLoanPage {
  constructor(private page: Page) { }

  async openApplication(): Promise<void> {
    await this.page.goto(process.env.BASE_URL!);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToPersonalLoanTab(): Promise<void> {
    await this.page.getByRole('link', { name: 'Personal Loan', exact: true }).click();
  }

  personalLoanTab(): Locator {
    return this.page.locator('#personal-loan');
  }

  personalLoanAmount(): Locator {
    return this.page.getByRole('textbox', { name: 'Personal Loan Amount' });
  }

  async enterPersonalLoanAmount(value: string): Promise<void> {
    await this.personalLoanAmount().fill(value);
  }

  interestRate(): Locator {
    return this.page.getByRole('textbox', { name: 'Interest Rate' });
  }

  async enterInterestRate(value: string): Promise<void> {
    await this.interestRate().fill(value);
  }

  loanTenure(): Locator {
    return this.page.getByRole('textbox', { name: 'Loan Tenure' });
  }

  async enterLoanTenure(value: string): Promise<void> {
    await this.loanTenure().fill(value);
  }

  getBarChartContainer(): Locator {
    return this.page.locator('#emibarchart');
  }

  async modifyScheduleMonth(monthText: string): Promise<void> {
    const control = this.page.locator('text=Schedule showing EMI payments starting from').locator('..').locator('select').first();
    if (await control.count()) {
      await control.selectOption({ label: monthText });
    }
  }

  async getBarChartBarCount(): Promise<number> {
    return await this.getBarChartContainer().locator('rect').count();
  }

  async getTooltipValuesFromBar(): Promise<string[]> {
    const bar = this.getBarChartContainer().locator('rect').first();
    await bar.hover();
    const tooltipText = await this.page.locator('text').filter({ hasText: /₹|[0-9]/ }).first().innerText();
    return tooltipText.split(/\s+/).filter(Boolean);
  }
}
