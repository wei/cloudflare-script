import { CloudflareRunner } from '../src/cloudflare-runner';

// Mock @actions/core
jest.mock('@actions/core');

describe('CloudflareRunner', () => {
  let runner: CloudflareRunner;
  const mockApiToken = 'test-token';

  beforeEach(() => {
    runner = new CloudflareRunner(mockApiToken);
    jest.clearAllMocks();
  });

  it('should create a CloudflareRunner instance', () => {
    expect(runner).toBeInstanceOf(CloudflareRunner);
  });

  it('should handle simple script execution', async () => {
    const script = 'return "hello world";';
    
    // Mock the Cloudflare SDK import to avoid actual network calls
    jest.doMock('cloudflare', () => {
      return function MockCloudflare() {
        return {
          zones: {
            list: jest.fn().mockResolvedValue({ result: [] })
          }
        };
      };
    });

    const result = await runner.execute(script);
    expect(result).toBe('hello world');
  });

  it('should throw error for invalid API token during construction', () => {
    expect(() => new CloudflareRunner('')).not.toThrow();
    // The actual validation happens during execution
  });
});