# CLAUDE.md

This file defines strict rules, principles, and limitations for Claude Code when working with this codebase.

## 🚫 CRITICAL LIMITATIONS - NEVER VIOLATE THESE

### Database Operations
- **NEVER** delete any records from the database directly
- **NEVER** run DELETE, DROP, or TRUNCATE SQL commands
- **NEVER** modify database schemas without explicit approval
- **NEVER** access production databases directly
- **ALWAYS** use soft deletes (set deleted_at or is_deleted flags)
- **ALWAYS** create backups before any data migration
- **ONLY** read operations are allowed for debugging

### API & Security
- **NEVER** expose API keys, secrets, or credentials in code
- **NEVER** commit sensitive data to version control
- **NEVER** disable authentication or authorization checks
- **NEVER** log sensitive user information (passwords, tokens, PII)
- **NEVER** use eval() or execute dynamic code from user input
- **ALWAYS** validate and sanitize all inputs
- **ALWAYS** use parameterized queries to prevent SQL injection

### File System Operations
- **NEVER** delete user-uploaded files without explicit confirmation
- **NEVER** modify system files or configurations
- **NEVER** execute shell commands with user input
- **ALWAYS** validate file types and sizes before processing
- **ALWAYS** use virus scanning for uploaded files
- **ONLY** write to designated temp and upload directories

### Production Environment
- **NEVER** deploy directly to production
- **NEVER** run untested code in production
- **NEVER** disable error handling in production
- **NEVER** expose debug information to end users
- **ALWAYS** test in development/staging first
- **ALWAYS** have rollback plans

## 📋 GENERAL CODING RULES

### 1. Research & Understanding Phase
**BEFORE writing any code:**
- **ALWAYS** read and understand existing code first
- **ALWAYS** search for similar implementations in the codebase
- **ALWAYS** check for existing utilities or helpers
- **ALWAYS** understand the data flow and architecture
- **NEVER** assume - verify by reading the actual code

**Research checklist:**
\`\`\`
1. Search for similar features/functions
2. Read related files completely
3. Understand database schemas
4. Check API documentation
5. Review error handling patterns
6. Identify reusable components
\`\`\`

### 2. Planning Phase
**BEFORE implementing:**
- **ALWAYS** plan the implementation approach
- **ALWAYS** identify potential impacts
- **ALWAYS** consider edge cases
- **ALWAYS** plan error handling
- **DOCUMENT** the approach before coding

### 3. Implementation Rules

#### Code Quality Standards
\`\`\`typescript
// ALWAYS follow these patterns:

// ✅ GOOD: Explicit error handling
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  logger.error('Operation failed:', error);
  return { success: false, error: error.message };
}

// ❌ BAD: No error handling
const result = await riskyOperation();
return result;

// ✅ GOOD: Input validation
function processUser(userId: string) {
  if (!userId || !isValidUUID(userId)) {
    throw new Error('Invalid user ID');
  }
  // Process...
}

// ❌ BAD: No validation
function processUser(userId: any) {
  // Process directly...
}
\`\`\`

#### Naming Conventions
- **Functions**: camelCase, descriptive verbs (getUserById, calculateTotal)
- **Variables**: camelCase, meaningful names (userProfile, not data or obj)
- **Constants**: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- **Classes**: PascalCase (UserService, ProductController)
- **Files**: kebab-case (user-service.ts, product-controller.ts)

#### Code Structure
- **Maximum function length**: 50 lines
- **Maximum file length**: 300 lines
- **Maximum complexity**: Cyclomatic complexity < 10
- **Single Responsibility**: Each function does ONE thing
- **DRY**: Don't repeat yourself - extract common code

### 4. Testing Requirements

**MANDATORY tests for:**
- All new functions and features
- Bug fixes (test the fix)
- API endpoints
- Database operations
- Authentication/Authorization
- Error handling paths

\`\`\`typescript
// Every function needs tests:
describe('functionName', () => {
  it('should handle normal case', () => {});
  it('should handle edge cases', () => {});
  it('should handle errors', () => {});
  it('should validate inputs', () => {});
});
\`\`\`

### 5. Documentation Standards

**ALWAYS document:**
- Complex algorithms
- API endpoints (request/response format)
- Database schema changes
- Configuration changes
- Breaking changes
- Workarounds or hacks (with TODO for fixing)

\`\`\`typescript
/**
 * Calculates discount based on user tier and purchase amount
 * @param userId - User's unique identifier
 * @param amount - Purchase amount in cents
 * @returns Discount percentage (0-100)
 * @throws {InvalidUserError} If user doesn't exist
 * @throws {InvalidAmountError} If amount is negative
 */
function calculateDiscount(userId: string, amount: number): number {
  // Implementation
}
\`\`\`

## 🔍 WHEN TO SEARCH & RESEARCH

### Must Search Before:
1. **Creating new files** - Check if similar functionality exists
2. **Adding dependencies** - Look for existing packages first
3. **Implementing features** - Search for similar patterns
4. **Writing utilities** - Check shared libraries
5. **Adding API endpoints** - Review existing endpoints
6. **Database queries** - Look for existing queries/models

### Search Commands Priority:
\`\`\`bash
# 1. First: Search for similar functionality
grep -r "functionName" --include="*.ts" --include="*.tsx"

# 2. Second: Check imports and dependencies
grep -r "import.*package" --include="*.ts"

# 3. Third: Look for patterns
grep -r "pattern" --include="*.ts" -A 5 -B 5

# 4. Fourth: Check for TODOs and FIXMEs
grep -r "TODO\|FIXME" --include="*.ts"
\`\`\`

## ⚠️ SPECIFIC RESTRICTIONS

### AI/ML Operations
- **NEVER** train models on user data without consent
- **NEVER** store AI-generated content without attribution
- **ALWAYS** validate AI outputs before using
- **ALWAYS** have human review for critical decisions
- **IMPLEMENT** rate limiting for AI API calls

### Payment Processing
- **NEVER** store credit card numbers
- **NEVER** log payment information
- **ALWAYS** use certified payment gateways
- **ALWAYS** implement PCI compliance
- **ALWAYS** use idempotency keys

### User Data
- **NEVER** share user data without consent
- **NEVER** use real user data in development
- **ALWAYS** anonymize data for analytics
- **ALWAYS** implement data retention policies
- **ALWAYS** allow users to delete their data

## ✅ REQUIRED PRACTICES

### Before Submitting Code

**Checklist:**
- [ ] Code compiles without warnings
- [ ] All tests pass
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] No TODO comments without tickets
- [ ] Security scan passed
- [ ] Performance impact assessed
- [ ] Documentation updated
- [ ] Error messages are user-friendly

### Performance Guidelines
- **Response time**: < 200ms for API calls
- **Page load**: < 3 seconds
- **Database queries**: Use indexes, avoid N+1
-ающи **Memory**: No memory leaks, clean up resources
- **Caching**: Implement where appropriate

### Git Commit Rules
\`\`\`bash
# Format: <type>(<scope>): <subject>

feat(auth): add two-factor authentication
fix(payment): resolve checkout timeout issue
docs(api): update endpoint documentation
refactor(user): simplify profile update logic
test(product): add unit tests for price calculation
perf(search): optimize database queries
\`\`\`

## 🛡️ SECURITY PROTOCOLS

### Input Validation
\`\`\`typescript
// ALWAYS validate everything
const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  role: z.enum(['user', 'admin'])
});

// NEVER trust user input
const validated = schema.parse(userInput);
\`\`\`

### Authentication & Authorization
- **ALWAYS** verify JWT tokens
- **ALWAYS** check permissions before actions
- **NEVER** rely on client-side security
- **IMPLEMENT** rate limiting
- **USE** HTTPS everywhere

## 🚨 EMERGENCY PROTOCOLS

### If You Accidentally:

1. **Delete production data**:
   - STOP immediately
   - Do NOT attempt to fix yourself
   - Alert senior developer
   - Document exactly what happened

2. **Expose sensitive data**:
   - Rotate affected credentials immediately
   - Update security logs
   - Notify security team
   - Document incident

3. **Break production**:
   - Initiate rollback immediately
   - Document the issue
   - Create hotfix branch
   - Test fix thoroughly before redeploying

## 📝 FINAL NOTES

### Remember:
- **Quality > Speed**: Better to be correct than fast
- **Ask > Assume**: When unsure, ask for clarification
- **Test > Hope**: Always test your changes
- **Simple > Clever**: Write readable, maintainable code
- **Secure > Convenient**: Security is non-negotiable

### Hierarchy of Concerns:
1. **Security** - Protect user data and system integrity
2. **Correctness** - Code must work as intended
3. **Performance** - Optimize after correctness
4. **Features** - New features after stability

### Code Review Focus:
1. Security vulnerabilities
2. Data integrity issues
3. Performance problems
4. Code quality
5. Test coverage
6. Documentation

---

**These rules are NON-NEGOTIABLE. Violating critical limitations may result in severe consequences including data loss, security breaches, or system failures.**

Last Updated: 2025-08-28
Version: 1.0
