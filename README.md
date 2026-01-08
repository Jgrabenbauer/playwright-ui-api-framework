# Playwright UI + API Test Automation Framework

[![Playwright Tests](https://github.com/USERNAME/REPO/actions/workflows/playwright.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/playwright.yml)

Production-grade test automation framework built with Playwright and TypeScript. Demonstrates locator-first Page Objects, domain-driven API clients, and CI-ready execution strategies.

> **CI Status**: Replace `USERNAME/REPO` in the badge above with your GitHub username and repository name once pushed to GitHub. CI history begins at first push.

## Architecture

**Page Objects**: Locator-first with domain methods (`login()`, `addToCart()`) instead of generic wrappers. Uses Playwright's native auto-waiting without custom synchronization.

**API Clients**: Thin typed wrappers around `APIRequestContext`. One method per endpoint with explicit request/response models.

## Test Targets

**UI**: https://www.saucedemo.com - Authentication, cart, checkout  
**API**: https://restful-booker.herokuapp.com - CRUD, auth, health

## Installation

```bash
git clone <repository-url>
cd playwright-ui-api-framework
npm install
```

Browsers install automatically via postinstall hook.

### Environment Configuration

Environment variables override defaults in `playwright.config.ts`:

- `UI_BASE_URL` - Web UI base (default: `https://www.saucedemo.com`)
- `API_BASE_URL` - API base (default: `https://restful-booker.herokuapp.com`)
- `BOOKER_USER` / `BOOKER_PASS` - API credentials (default: `admin` / `password123`)
- `CI` - Enables retries and JUnit reporting

Optional: `cp .env.example .env` for local overrides.

## Running Tests

```bash
# Fast feedback - critical path
npm run test:smoke

# Selective execution
npm run test:api          # API tests only
npm run test:ui           # UI tests only
npm run test:all          # Full suite

# By tag
npm run test:smoke        # 30-60 seconds
npm run test:regression   # 10-15 minutes

# Development
npm run test:headed       # Visible browser
npm run test:debug        # Playwright Inspector
npm run report            # View HTML report
```

Reports, screenshots, and videos captured in `playwright-report/` and `test-results/`.

## Continuous Integration

**Workflow Configuration**: `.github/workflows/playwright.yml` is configured to run on push to `main`/`master`/`develop`, pull requests, and manual `workflow_dispatch`.

**Execution Strategy**:
- **API tests** run first (fast feedback, no browser overhead, ~1-2 minutes)
- **UI tests** run second (browser-dependent, ~3-5 minutes)
- **Test results** published with JUnit summary and downloadable artifacts

**Artifact Retention**:
- HTML reports and test results: 30 days
- Failure videos: 7 days

**Fork-Friendly**: Workflow includes permissions and fork detection to prevent failures on external pull requests.

### Observability

```typescript
trace: 'on-first-retry',        // Full timeline only when needed
screenshot: 'only-on-failure',  // Visual state at failure
video: 'retain-on-failure',     // Full reproduction
```

**Debug Workflow**:
1. **HTML Report**: `npm run report` - See which tests failed, duration, stack traces
2. **Screenshot**: Visual state at failure moment
3. **Video**: Full test reproduction
4. **Trace**: Complete timeline with network/console/DOM - `npx playwright show-trace test-results/.../trace.zip`

### Retry Configuration

```typescript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

**2 retries in CI**: Covers transient network failures, rate limiting, resource contention.  
**0 retries locally**: Forces immediate investigation, prevents masking issues.  
**Sequential execution in CI**: Respects public API rate limits.

## Intentional Omissions

This framework demonstrates core test automation competency without over-engineering for theoretical scale. Each omission is a deliberate architectural decision.

**Real OAuth/SSO Integration**  
Demo applications with simple auth sufficiently demonstrate login flows and session management. The patterns (waiting for redirects, storing tokens, managing sessions) transfer directly to OAuth/SAML without adding external dependencies to a portfolio project.

**Database Seeding and Schema Migrations**  
API-driven test data creation proves the same skills (idempotency, cleanup, parallel safety) without coupling tests to database implementation details. Direct DB access creates maintenance burden when schemas evolve.

**Multi-Environment Configuration Management**  
Single-environment implementation with env var overrides demonstrates the pattern. Adding dev/staging/prod configs would be repetitive without teaching new concepts.

**Service Virtualization (Mocks/Stubs)**  
Testing against real services validates true integration behavior. Mocks hide integration issues (schema drift, rate limiting, auth flows) and require maintenance parallel to actual APIs. This framework prioritizes real integration validation.

**Performance and Load Testing**  
Different problem domain requiring specialized tools (k6, Artillery, JMeter). Functional tests prioritize correctness over throughput. Mixing concerns dilutes both.

**Visual Regression Testing**  
Functional assertions (text content, element presence, workflows) validate behavior without pixel-level brittleness. Visual testing requires specialized infrastructure (screenshot storage, diff algorithms, baseline management) and adds significant maintenance overhead for a framework demonstrating functional testing patterns.

**Custom Logging/Observability Platforms**  
`console.log` captured in traces. External observability platforms valuable at enterprise scale (1000+ tests across multiple teams), but Playwright's native HTML reports, traces, and artifacts provide sufficient debugging information for this framework's scope.

**Deployment Pipeline Integration**  
GitHub Actions workflow demonstrates CI/CD awareness. Additional integrations (Slack notifications, Jira ticket creation, deployment gates) would showcase DevOps tooling rather than test automation architecture.

**Speculative Scaling Patterns**  
No sharding configuration, no dynamic worker allocation, no test result caching. These patterns address problems that don't exist at 12 tests. Build what you need when you need it.

## Design Philosophy

Readability over cleverness. Playwright-native patterns. Type safety. Test independence. Minimal abstraction. Intentional design.

---

**Framework Version**: 1.0.0  
**Playwright Version**: 1.48.0  
**Node Version**: 20+  
**Last Updated**: January 2025
