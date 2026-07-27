import { expect, test } from '@playwright/test';

type Case = {
  name: string;
  payload: Record<string, unknown>;
  expectedInvalidReason: string;
};

const endpoint = 'https://jsonplaceholder.typicode.com/posts';

const longTitle = 'X'.repeat(10000);
const unsupportedSpecialChars = '!@#$%^&*()_+{}|:"<>?`~[]\\;\',./';

const cases: Case[] = [
  {
    name: 'excessively long title',
    payload: {
      title: longTitle,
      body: 'boundary check for very long title',
      userId: 1,
    },
    expectedInvalidReason: 'title length exceeds common limits',
  },
  {
    name: 'unsupported special characters in title',
    payload: {
      title: unsupportedSpecialChars,
      body: 'special character validation check',
      userId: 1,
    },
    expectedInvalidReason: 'title has unsupported characters',
  },
  {
    name: 'missing required userId field',
    payload: {
      title: 'missing userId',
      body: 'required field validation check',
    },
    expectedInvalidReason: 'required field userId is missing',
  },
];

test.describe('POST /posts invalid and boundary input handling', () => {
  for (const scenario of cases) {
    test(`handles ${scenario.name} without server-side failure`, async ({ request }) => {
      const response = await request.post(endpoint, { data: scenario.payload });

      expect(response.status(), `${scenario.name} returned a server error.`).toBeLessThan(500);

      const status = response.status();
      expect([201, 400, 401, 403, 404, 409, 415, 422]).toContain(status);

      const body = await response.json();
      expect(body).toBeTruthy();

      if (status >= 400) {
        const responseText = JSON.stringify(body).toLowerCase();
        expect(responseText, `Expected an error message for: ${scenario.expectedInvalidReason}`).toMatch(
          /error|invalid|required|missing|unprocessable|bad request/,
        );
      }

      if (status === 201) {
        // Mock API behavior: request usually succeeds and echoes payload.
        expect(body).toMatchObject(scenario.payload);
      }
    });
  }
});
