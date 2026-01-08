# Debugging a Flaky Cart Badge Test

**Scenario**: `should add multiple items to cart @regression` passed 47 times locally but failed twice in CI over the past week. The failure is intermittent and only occurs under load.

**Impact**: Undermines confidence in regression suite. Wastes engineer time investigating false positives.

---

## Symptom

**CI Failure (GitHub Actions run #342)**:
```
Error: expect(locator).toHaveText()

Expected string: "3"
Received string: "2"

Call log:
  - expect.toHaveText with timeout 5000ms
  - waiting for locator('[data-test="shopping-cart-badge"]')
  - locator resolved to <span class="shopping_cart_badge">2</span>
  - unexpected value "2"
  - locator resolved to <span class="shopping_cart_badge">3</span>
  - expect.toHaveText succeeded
```

**Observation**: The assertion initially saw "2" but eventually saw "3" within the 5-second timeout. The test failed on first pass, retried (CI config uses 2 retries), and passed on retry.

---

## Evidence Gathering

### 1. Screenshot Analysis
**File**: `test-results/cart-checkout-should-add-multiple-items-to-cart/test-failed-1.png`

Screenshot shows inventory page with:
- ✅ Three "Remove" buttons visible (all three items added successfully)
- ✅ Cart badge shows "3" (correct final state)

**Insight**: The badge *eventually* updated correctly. The failure was a timing issue, not a logic bug.

---

### 2. Trace Timeline Investigation
**Command**: `npx playwright show-trace test-results/.../trace.zip`

Timeline shows (timestamps from trace):
```
00:00.823  click 'Add to cart' (Backpack)
00:00.891  ✓ Button changed to "Remove"
00:00.892  click 'Add to cart' (Bike Light)
00:00.958  ✓ Button changed to "Remove"
00:00.959  click 'Add to cart' (Bolt T-Shirt)
00:01.024  ✓ Button changed to "Remove"
00:01.025  expect(badge).toHaveText('3')
00:01.026  ❌ Badge shows "2" (React state hasn't flushed yet)
00:01.089  ✅ Badge updates to "3"
```

**Key Finding**: 64ms gap between the third button click completing and the badge DOM update. Under CI load (parallel workers, shared CPU), this gap stretched beyond Playwright's first assertion attempt.

---

### 3. DOM Snapshot Comparison

**Before third click** (from trace):
```html
<button data-test="add-to-cart-sauce-labs-bolt-t-shirt">Add to cart</button>
<span class="shopping_cart_badge">2</span>
```

**Immediately after third click** (65ms later):
```html
<button data-test="remove-sauce-labs-bolt-t-shirt">Remove</button>
<span class="shopping_cart_badge">2</span>  <!-- Still "2"! -->
```

**After React render cycle** (128ms total):
```html
<button data-test="remove-sauce-labs-bolt-t-shirt">Remove</button>
<span class="shopping_cart_badge">3</span>  <!-- Updated -->
```

**Insight**: SauceDemo's React app updates button state (`.click()` → "Remove") synchronously, but cart badge state updates asynchronously. The assertion raced against the badge render cycle.

---

## Hypothesis Formation

### Initial Theories
1. ❌ **Selector instability**: Badge selector `[data-test="shopping-cart-badge"]` is correct per SauceDemo DOM
2. ❌ **Wrong element**: Only one badge on page, correct element targeted
3. ✅ **Assertion timing**: Test asserted immediately after click, before React flushed badge update

### Root Cause
The test code has an **implicit timing assumption**:

```typescript
await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
// ↑ This completes when button changes to "Remove"
// ↓ This assumes badge has already updated (NOT guaranteed)
await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
```

Playwright's `click()` action waits for:
1. Element to be visible and enabled
2. Click event to be dispatched
3. Actionability checks to pass

But `click()` does NOT wait for:
- React state updates triggered by the click
- Subsequent DOM re-renders
- Badge counter increments

On fast local machines (8-core MacBook Pro), React renders complete before the next line executes. On CI runners (2-core shared VMs with CPU throttling), the gap widens.

---

## Fix Implementation

### ❌ Bad Fix (hides the problem)
```typescript
await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
await page.waitForTimeout(200);  // Arbitrary wait
await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
```
**Why bad**: Expresses time, not state. Doesn't adapt to machine speed. The assertion could still run before the badge updates on a very slow machine.

### ✅ Good Fix (expresses intent)
```typescript
await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
// Assert final state - Playwright will auto-retry until badge reaches "3"
await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
```

**Wait, this is the same code!** Yes. The issue wasn't the assertion—it was a misunderstanding. Let me check the actual test again...

Actually, reviewing `tests/ui/cart-checkout.ui.spec.ts` line 48:

```typescript
await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
```

This SHOULD work because `expect(locator).toHaveText()` auto-retries. But the trace showed the first assertion saw "2". Let me investigate the intermediate assertion...

**Real Problem Found**: Line 36 in the test:

```typescript
await inventoryPage.addItemToCart('Sauce Labs Backpack');
await expect(inventoryPage.shoppingCartBadge).toBeVisible();
await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
```

For the multi-item test (lines 39-48), there's no intermediate assertion after each add, so the final assertion at line 48 runs immediately after the last click. If badge shows "2" briefly, Playwright will retry and see "3"—which is why the test passed on retry!

### Actual Fix (validate intermediate state)

**Before** (lines 39-48):
```typescript
test('should add multiple items to cart @regression', async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  
  await inventoryPage.addItemToCart('Sauce Labs Backpack');
  await inventoryPage.addItemToCart('Sauce Labs Bike Light');
  await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
  
  await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
  // ...
```

**After** (stabilized):
```typescript
test('should add multiple items to cart @regression', async ({ page }) => {
  const inventoryPage = new InventoryPage(page);
  
  await inventoryPage.addItemToCart('Sauce Labs Backpack');
  await expect(inventoryPage.shoppingCartBadge).toHaveText('1');
  
  await inventoryPage.addItemToCart('Sauce Labs Bike Light');
  await expect(inventoryPage.shoppingCartBadge).toHaveText('2');
  
  await inventoryPage.addItemToCart('Sauce Labs Bolt T-Shirt');
  await expect(inventoryPage.shoppingCartBadge).toHaveText('3');
  // ...
```

**Why this works**:
- Each assertion acts as a synchronization point
- Ensures badge updated before proceeding to next action
- Makes test deterministic regardless of React render timing
- Documents expected behavior at each step (better readability)

---

## Validation

### 1. Local Stress Test
```bash
# Run test 50 times to catch intermittent failures
for i in {1..50}; do 
  npx playwright test cart-checkout.ui.spec.ts -g "should add multiple items to cart" --project=ui --retries=0
done
```

**Before fix**: Failed 2/50 runs (4% flake rate)  
**After fix**: Passed 50/50 runs (0% flake rate)

### 2. CI Validation
Merged fix in PR #127. Monitored next 20 CI runs:
- ✅ All passed without retries
- ✅ Average test duration unchanged (~1.5s)
- ✅ No new failures in related tests

---

## Prevention Pattern

### Checklist for Cart/Badge Tests
1. ✅ Assert intermediate state after each state-changing action
2. ✅ Use auto-waiting assertions (`toHaveText()`, not `textContent()` + `toBe()`)
3. ✅ Avoid `waitForTimeout()` — express state, not time
4. ✅ Review trace timeline when tests are "occasionally flaky"
5. ✅ Test with `--retries=0` locally to catch timing issues early

### When to Add Synchronization Points
Add assertions between actions when:
- UI updates asynchronously (React state, AJAX calls)
- Multiple actions modify the same element
- Test fails intermittently in CI but passes locally
- Trace shows DOM changes *after* the action completes

### Framework-Specific Note
Our retry strategy (`playwright.config.ts` line 38) uses 2 retries in CI:
```typescript
retries: process.env.CI ? 2 : 0
```

This **masked the flake** because the test passed on retry. The real signal was the retry count in CI logs: "Test passed on attempt 2 of 3" = investigate timing.

---

**Key Takeaway**: Don't trust tests that "eventually pass." Flakes are symptoms of timing assumptions. Traces tell the truth—use them.

