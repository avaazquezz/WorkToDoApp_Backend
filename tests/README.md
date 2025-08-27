# Testing Documentation

This directory contains comprehensive tests for the WorkToDo backend application.

## Test Structure

```
tests/
├── helpers/           # Test utilities and helpers
│   ├── testDb.js     # Database setup and cleanup utilities
│   └── fixtures.js   # Test data fixtures
├── unit/             # Unit tests
│   ├── hash.test.js  # Hash utility tests
│   └── authController.test.js  # Auth controller tests
├── integration/      # Integration tests
│   ├── auth.test.js  # Auth routes tests
│   ├── projects.test.js  # Project routes tests
│   └── notes.test.js # Notes/ToDos routes tests
├── setup.js          # Global test setup
└── setup.test.js     # Setup verification tests
```

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Database

Tests use a separate test database (`worktodo_test`) to avoid affecting the development database. The test database is:
- Created automatically before tests run
- Cleaned between each test
- Dropped after all tests complete

### Database Configuration

Test database settings are in `.env.test`:
```
TEST_DB_HOST=localhost
TEST_DB_USER=root
TEST_DB_PASSWORD=1234
TEST_DB_NAME=worktodo_test
```

## Test Types

### Unit Tests
- Test individual functions and components in isolation
- Mock external dependencies (database, services)
- Fast execution
- High code coverage

### Integration Tests
- Test complete request/response cycles
- Use real database connections
- Test API endpoints end-to-end
- Verify database operations

## Test Utilities

### testDb.js
- Database setup and teardown
- Table creation
- Data cleanup between tests

### fixtures.js
- Consistent test data
- User, project, section, note, and todo factories
- Valid and invalid data examples

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Database is cleaned between tests
3. **Descriptive Names**: Test names clearly describe what they test
4. **Arrange-Act-Assert**: Tests follow clear structure
5. **Mock External Dependencies**: Unit tests mock database and external services
6. **Real Integration**: Integration tests use real database connections

## Coverage Goals

- **Unit Tests**: >90% coverage for utilities and controllers
- **Integration Tests**: Cover all API endpoints
- **Error Handling**: Test both success and failure scenarios
- **Edge Cases**: Test boundary conditions and invalid inputs

## Continuous Integration

Tests should be run in CI/CD pipeline:
```bash
# Install dependencies
npm ci

# Run tests with coverage
npm run test:coverage

# Upload coverage reports
# (configure based on your CI provider)
```
