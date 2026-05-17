import { rateLimit } from './rate-limit';

describe('rateLimit Utility', () => {
  beforeAll(() => {
    // Intercept standard time functions so we can manipulate Date.now()
    jest.useFakeTimers();
  });

  afterAll(() => {
    // Restore real time after our tests run
    jest.useRealTimers();
  });

  it('should allow requests under the defined limit', () => {
    // 2 requests allowed per 10 seconds
    const result1 = rateLimit('test-user-1', 2, 10000);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(1);

    const result2 = rateLimit('test-user-1', 2, 10000);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(0);
  });

  it('should block requests over the defined limit', () => {
    // Max 1 request allowed
    rateLimit('test-user-2', 1, 10000);
    
    const blockedResult = rateLimit('test-user-2', 1, 10000);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });

  it('should reset the limit after the time window expires', () => {
    rateLimit('test-user-3', 1, 1000); // 1 request per 1 second
    
    const blockedResult = rateLimit('test-user-3', 1, 1000);
    expect(blockedResult.success).toBe(false);

    // Fast-forward time by 1001 milliseconds to simulate time passing
    jest.advanceTimersByTime(1001);

    const allowedResult = rateLimit('test-user-3', 1, 1000);
    expect(allowedResult.success).toBe(true);
    expect(allowedResult.remaining).toBe(0);
  });
});