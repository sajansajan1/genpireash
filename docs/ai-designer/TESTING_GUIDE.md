# Progressive Generation Workflow - Testing Guide

Quick reference for running and maintaining the test suite.

---

## Quick Start

### 1. Install Dependencies
\`\`\`bash
pnpm install
\`\`\`

### 2. Run All Tests
\`\`\`bash
pnpm test
\`\`\`

### 3. Run with Coverage
\`\`\`bash
pnpm test:coverage
\`\`\`

---

## Test Commands

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode (re-runs on file changes) |
| `pnpm test:coverage` | Generate coverage report |
| `pnpm test:progressive` | Run only progressive workflow tests |

### Advanced Commands

\`\`\`bash
# Run specific test file
pnpm test progressive-generation-workflow.test.ts

# Run tests matching a pattern
pnpm test --testNamePattern="approval"

# Run tests in a specific directory
pnpm test app/actions/__tests__

# Update snapshots (if using snapshot tests)
pnpm test -u

# Run tests with verbose output
pnpm test --verbose

# Run tests in CI mode (no watch)
pnpm test --ci
\`\`\`

---

## Test Structure

\`\`\`
Genpire/
├── app/
│   └── actions/
│       └── __tests__/
│           └── progressive-generation-workflow.test.ts  (Server actions)
├── modules/
│   └── ai-designer/
│       ├── components/
│       │   ├── FrontViewApproval/
│       │   │   └── __tests__/
│       │   │       └── index.test.tsx                   (Component tests)
│       │   └── ProgressiveViewsGeneration/
│       │       └── __tests__/
│       │           └── index.test.tsx                   (Component tests)
│       └── hooks/
│           └── __tests__/
│               └── useProgressiveGeneration.test.ts     (Hook tests)
├── jest.config.js                                       (Jest configuration)
├── jest.setup.js                                        (Test setup)
└── package.json                                         (Test scripts)
\`\`\`

---

## Writing New Tests

### Test File Naming
- Place tests in `__tests__/` directory next to the code
- Name test files: `[filename].test.ts` or `[filename].test.tsx`
- Use descriptive test names: `should do something when condition`

### Example Test Structure

\`\`\`typescript
/**
 * Description of what this test file covers
 */

import { functionToTest } from '../file-to-test';

// Mock dependencies
jest.mock('@/lib/dependency');

describe('Feature Name', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup
  });

  describe('Happy path scenarios', () => {
    it('should do something successfully', async () => {
      // Arrange
      const input = { ... };

      // Act
      const result = await functionToTest(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('Error scenarios', () => {
    it('should handle error gracefully', async () => {
      // Test error handling
    });
  });

  describe('Edge cases', () => {
    it('should handle edge case', async () => {
      // Test edge cases
    });
  });
});
\`\`\`

---

## Testing Best Practices

### 1. Test Organization
- Group related tests with `describe` blocks
- Use clear, descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- One assertion per test when possible

### 2. Mocking
\`\`\`typescript
// Mock external dependencies
jest.mock('@/lib/external-service');

// Mock implementation
mockService.method.mockResolvedValue({ data: 'test' });

// Verify mock calls
expect(mockService.method).toHaveBeenCalledWith(expectedArgs);
expect(mockService.method).toHaveBeenCalledTimes(1);
\`\`\`

### 3. Async Testing
\`\`\`typescript
// Use async/await
it('should handle async operation', async () => {
  const result = await asyncFunction();
  expect(result).toBeDefined();
});

// Use waitFor for delayed effects
await waitFor(() => {
  expect(element).toBeInTheDocument();
});

// Use act for state updates
await act(async () => {
  await updateState();
});
\`\`\`

### 4. Component Testing
\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should render and interact', async () => {
  const user = userEvent.setup();

  render(<Component prop="value" />);

  // Query elements
  const button = screen.getByRole('button', { name: /click me/i });

  // Simulate user interaction
  await user.click(button);

  // Assert changes
  expect(screen.getByText('Clicked')).toBeInTheDocument();
});
\`\`\`

### 5. Hook Testing
\`\`\`typescript
import { renderHook, act } from '@testing-library/react';

it('should update hook state', () => {
  const { result } = renderHook(() => useCustomHook());

  act(() => {
    result.current.updateValue('new value');
  });

  expect(result.current.value).toBe('new value');
});
\`\`\`

---

## Coverage Goals

### Minimum Coverage Targets
- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

### Ideal Coverage Targets
- **Critical paths**: 90%+
- **Error handling**: 85%+
- **UI components**: 80%+
- **Business logic**: 90%+

### What to Test
✅ **DO test**:
- Critical business logic
- Error handling paths
- User interactions
- State transitions
- API integrations
- Edge cases

❌ **DON'T test**:
- Third-party libraries
- Trivial getters/setters
- Generated code
- Constants

---

## Debugging Tests

### Failed Tests
\`\`\`bash
# Run only failed tests
pnpm test --onlyFailures

# Run with verbose output
pnpm test --verbose

# Run single test
pnpm test -t "specific test name"
\`\`\`

### Debug in VS Code
1. Set breakpoints in test file
2. Run "Jest: Debug Current File" from command palette
3. Step through code

### Console Logging
\`\`\`typescript
it('should debug test', () => {
  console.log('Debug info:', variable);
  screen.debug(); // Print DOM tree
});
\`\`\`

---

## Common Issues & Solutions

### Issue: Tests Timeout
**Solution**: Increase timeout
\`\`\`typescript
it('should handle slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
\`\`\`

### Issue: Mock Not Working
**Solution**: Check mock path and clear between tests
\`\`\`typescript
jest.mock('@/correct/path'); // Ensure correct path

beforeEach(() => {
  jest.clearAllMocks(); // Clear mock state
});
\`\`\`

### Issue: Component Not Rendering
**Solution**: Check for missing providers
\`\`\`typescript
const { result } = renderHook(() => useHook(), {
  wrapper: ({ children }) => (
    <Provider>
      {children}
    </Provider>
  ),
});
\`\`\`

### Issue: Async State Not Updating
**Solution**: Use act and waitFor
\`\`\`typescript
await act(async () => {
  await updateState();
});

await waitFor(() => {
  expect(state).toBe('updated');
});
\`\`\`

---

## CI/CD Integration

### GitHub Actions Example
\`\`\`yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
\`\`\`

### Pre-commit Hook
\`\`\`bash
# .husky/pre-commit
#!/bin/sh
pnpm test --bail --findRelatedTests
\`\`\`

---

## Test Maintenance

### When to Update Tests

1. **Code changes**: Update tests when modifying implementation
2. **Bug fixes**: Add regression tests
3. **New features**: Add comprehensive tests
4. **Refactoring**: Ensure tests still pass
5. **API changes**: Update mocks

### Regular Maintenance

- [ ] Run tests before every commit
- [ ] Review coverage reports weekly
- [ ] Fix flaky tests immediately
- [ ] Update mocks when APIs change
- [ ] Keep test execution time under 10 seconds

### Test Health Metrics

Monitor these metrics:
- Test pass rate (should be 100%)
- Coverage percentage (should not decrease)
- Execution time (should be fast)
- Flakiness rate (should be 0%)

---

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

### Internal Docs
- [Test Summary](./TEST_SUMMARY.md) - Comprehensive test overview
- [Implementation Plan](./FASTER_INTERACTIVE_WORKFLOW_PLAN.md) - Feature specification

### Useful Commands Cheatsheet

\`\`\`bash
# Run specific tests
pnpm test progressive               # Tests matching "progressive"
pnpm test FrontViewApproval         # Component tests
pnpm test useProgressiveGeneration  # Hook tests

# Coverage
pnpm test:coverage                  # Full coverage report
open coverage/lcov-report/index.html # View HTML report

# Watch mode
pnpm test:watch                     # Interactive watch mode

# Debugging
pnpm test --verbose                 # Verbose output
pnpm test --detectOpenHandles       # Find open handles
pnpm test --logHeapUsage           # Memory usage
\`\`\`

---

## Getting Help

### Internal
- Review [TEST_SUMMARY.md](./TEST_SUMMARY.md) for detailed coverage
- Check existing test files for patterns
- Ask team members for code review

### External
- [Stack Overflow - Jest](https://stackoverflow.com/questions/tagged/jestjs)
- [Testing Library Discord](https://discord.gg/testing-library)
- [Jest GitHub Discussions](https://github.com/facebook/jest/discussions)

---

**Last Updated**: November 14, 2025
**Maintained by**: Development Team
