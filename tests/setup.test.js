// Simple test to verify Jest setup
describe('Test Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to environment variables', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.JWT_SECRET).toBeDefined();
  });

  it('should have access to test database pool', () => {
    expect(global.testPool).toBeDefined();
  });
});
