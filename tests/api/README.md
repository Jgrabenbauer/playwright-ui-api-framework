# API Tests

Place your API test specifications in this directory.

## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('API Endpoint', () => {
  test('should return expected response', async ({ request }) => {
    const response = await request.get('/endpoint');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    // Your assertions here
  });
});
```

## Naming Convention
- Use descriptive names: `auth.spec.ts`, `booking.spec.ts`
- Group related endpoints in describe blocks
- Test both success and error scenarios

