import { Page } from '@playwright/test';

export function getFirstMondayOfNextMonth(referenceDate = new Date()): Date {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const firstDayOfNextMonth = new Date(year, month + 1, 1);
  const offsetToMonday = (8 - firstDayOfNextMonth.getDay()) % 7;

  return new Date(year, month + 1, 1 + offsetToMonday);
}

export async function setDatePickerValue(page: Page, selector: string, targetDate: Date): Promise<void> {
  await page.evaluate(({ datePickerSelector, targetIso }) => {
    const jq = (window as unknown as { jQuery?: ((selectorText: string) => any) }).jQuery;

    if (!jq) {
      throw new Error('jQuery is not available on page.');
    }

    const picker = jq(datePickerSelector);
    const date = new Date(targetIso);

    picker.datepicker('setDate', date);
    picker.trigger('changeDate');
    jq('#loanstartdate').val(picker.val()).trigger('change');
    picker.blur();
  }, { datePickerSelector: selector, targetIso: targetDate.toISOString() });
}
