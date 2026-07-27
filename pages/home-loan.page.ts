import { Locator, Page } from '@playwright/test';

export class EmiCalculatorPage {
  constructor(private page: Page) { }

  async openApplication(): Promise<void> {
    await this.page.goto(process.env.BASE_URL!);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async navigateToHomeLoanTab(): Promise<void> {
    await this.page.getByRole('link', { name: 'Home Loan', exact: true }).click();
  }

  async navigateToPersonalLoanTab(): Promise<void> {
    await this.page.getByRole('link', { name: 'Personal Loan', exact: true }).click();
  }

  homeLoanTab(): Locator {
    return this.page.locator('#home-loan');
  }

  personalLoanTab(): Locator {
    return this.page.locator('#personal-loan');
  }

  homeLoanAmount(): Locator {
    return this.page.getByRole('textbox', { name: 'Home Loan Amount' });
  }

  async enterHomeLoanAmount(value: string): Promise<void> {
    await this.homeLoanAmount().fill(value);
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

  pieChartContainer(): Locator {
    return this.page.locator('#emipiechart');
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
  async getDisplayedEmiAmount(): Promise<number> {
    const emiText = await this.page.locator('#emiamount').innerText();
    const match = emiText.match(/[\d,]+/);

    if (!match) {
      throw new Error(`EMI value not found in text: ${emiText}`);
    }

    return Number(match[0].replace(/,/g, ''));
  }

  async getPieChartValues(): Promise<number[]> {
    const chartValues = await this.pieChartContainer().evaluate((element) => {
      const svg = element.querySelector('svg');
      if (!svg) {
        return [] as number[];
      }

      const text = svg.textContent || '';
      return [...text.matchAll(/(\d+(?:\.\d+)?)%/g)].map((match) => Number(match[1]));
    });

    return chartValues;
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
