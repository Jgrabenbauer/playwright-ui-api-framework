# UI Tests

Place your UI test specifications in this directory.

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/');
    // Your test code here
  });
});
```

## Naming Convention
- Use descriptive names: `login.spec.ts`, `checkout.spec.ts`
- Group related tests in describe blocks
- Keep tests focused and independent

