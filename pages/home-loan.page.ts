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

  homeLoanTab(): Locator {
    return this.page.locator('#home-loan');
  }

  homeLoanAmount(): Locator {
    return this.page.getByRole('textbox', { name: 'Home Loan Amount' });
  }

  async enterHomeLoanAmount(value: string): Promise<void> {
    await this.homeLoanAmount().fill(value);
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
}
