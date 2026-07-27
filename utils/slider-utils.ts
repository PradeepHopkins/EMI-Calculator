import { Locator } from '@playwright/test';

export async function readNumericInputValue(input: Locator): Promise<number> {
  const value = await input.inputValue();
  const numeric = Number(value.replace(/,/g, '').trim());

  if (Number.isNaN(numeric)) {
    throw new Error(`Expected numeric input value, received "${value}".`);
  }

  return numeric;
}

export async function adjustSliderToTargetValue(
  sliderHandle: Locator,
  valueInput: Locator,
  targetValue: number,
  maxSteps = 500,
): Promise<void> {
  await sliderHandle.click();

  for (let step = 0; step < maxSteps; step += 1) {
    const current = await readNumericInputValue(valueInput);

    if (current === targetValue) {
      return;
    }

    const key = current < targetValue ? 'ArrowRight' : 'ArrowLeft';
    await sliderHandle.press(key);
  }

  const finalValue = await readNumericInputValue(valueInput);
  throw new Error(`Could not set slider to ${targetValue}. Current value is ${finalValue}.`);
}