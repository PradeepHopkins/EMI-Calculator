import { Locator, Page } from '@playwright/test';
import { adjustSliderToTargetValue, readNumericInputValue } from '../utils/slider-utils';
import { getFirstMondayOfNextMonth, setDatePickerValue } from '../utils/personal-loan-utils';

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

  private personalLoanAmountSliderHandle(): Locator {
    return this.page.locator('#loanamountslider .ui-slider-handle');
  }

  async setPersonalLoanAmountUsingSlider(value: number): Promise<void> {
    await adjustSliderToTargetValue(this.personalLoanAmountSliderHandle(), this.personalLoanAmount(), value);
  }

  interestRate(): Locator {
    return this.page.getByRole('textbox', { name: 'Interest Rate' });
  }

  private interestRateSliderHandle(): Locator {
    return this.page.locator('#loaninterestslider .ui-slider-handle');
  }

  async setInterestRateUsingSlider(value: number): Promise<void> {
    await adjustSliderToTargetValue(this.interestRateSliderHandle(), this.interestRate(), value);
  }

  loanTenure(): Locator {
    return this.page.getByRole('textbox', { name: 'Loan Tenure' });
  }

  private loanTenureSliderHandle(): Locator {
    return this.page.locator('#loantermslider .ui-slider-handle');
  }

  async setLoanTenureUsingSlider(value: number): Promise<void> {
    await adjustSliderToTargetValue(this.loanTenureSliderHandle(), this.loanTenure(), value);
  }

  getBarChartContainer(): Locator {
    return this.page.locator('#emibarchart');
  }

  async modifyScheduleToNextMonthFirstMonday(): Promise<void> {
    const targetDate = getFirstMondayOfNextMonth();

    await this.page.locator('#startmonthyear + .input-group-append .input-group-text').click();
    await setDatePickerValue(this.page, '#startmonthyear', targetDate);
  }

  async getScheduleMonthValue(): Promise<string> {
    return (await this.page.locator('#startmonthyear').inputValue()).trim();
  }

  async getBarChartBarCount(): Promise<number> {
    return await this.page.locator('#emibarchart .highcharts-series rect.highcharts-point').count();
  }

  async getTooltipValuesFromBar(): Promise<string[]> {
    const bar = this.page.locator('#emibarchart .highcharts-series rect.highcharts-point').first();
    await bar.hover();
    const tooltip = this.page.locator('.highcharts-tooltip text').first();
    await tooltip.waitFor({ state: 'visible' });
    const tooltipText = (await tooltip.textContent())?.trim() ?? '';

    const numericTokens = tooltipText.match(/₹\s?[\d,]+|\b\d{4}\b|\d+(?:\.\d+)?/g) ?? [];
    return numericTokens.map((token) => token.trim()).filter(Boolean);
  }

  async getPersonalLoanAmountNumericValue(): Promise<number> {
    return readNumericInputValue(this.personalLoanAmount());
  }

  async getInterestRateNumericValue(): Promise<number> {
    return readNumericInputValue(this.interestRate());
  }

  async getLoanTenureNumericValue(): Promise<number> {
    return readNumericInputValue(this.loanTenure());
  }
}
