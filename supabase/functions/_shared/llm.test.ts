import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getActiveProvider,
  getProviderConfig,
  validateJsonSchema,
  generateStructured,
  runToolLoop,
} from './llm';
import { handleLlmStatusRequest } from '../llm-status/index';

describe('FinTar Universal LLM Gateway (_shared/llm)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('correctly resolves default provider as gemini and overrides with env var', () => {
    delete process.env.LLM_PROVIDER;
    expect(getActiveProvider()).toBe('gemini');

    process.env.LLM_PROVIDER = 'mock';
    expect(getActiveProvider()).toBe('mock');

    process.env.LLM_PROVIDER = 'anthropic';
    expect(getActiveProvider()).toBe('anthropic');
  });

  it('validates JSON schemas accurately', () => {
    const schema = {
      type: 'object',
      required: ['title', 'amount'],
      properties: {
        title: { type: 'string' },
        amount: { type: 'number' },
      },
    };

    expect(validateJsonSchema({ title: 'Test', amount: 100 }, schema).valid).toBe(true);
    expect(validateJsonSchema({ title: 'Test' }, schema).valid).toBe(false);
    expect(validateJsonSchema('invalid string', schema).valid).toBe(false);
  });

  it('generates structured receipt OCR data using mock provider without any API key', async () => {
    process.env.LLM_PROVIDER = 'mock';

    const schema = {
      type: 'object',
      required: ['merchantName', 'items', 'total'],
    };

    const result = await generateStructured<any>(
      'Ekstrak struk belanja bahan baku berikut',
      schema,
      [{ data: 'base64sampledata', mimeType: 'image/jpeg' }],
      { provider: 'mock' }
    );

    expect(result).toBeDefined();
    expect(result.merchantName).toBe('Toko Bahan Kue Sejahtera');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.total).toBe(670000);
  });

  it('generates structured financial advice using mock provider', async () => {
    const schema = {
      type: 'object',
      required: ['title', 'summary', 'recommendations'],
    };

    const result = await generateStructured<any>(
      'Berikan rekomendasi optimasi cash flow dan plafon hutang untuk UMKM',
      schema,
      undefined,
      { provider: 'mock' }
    );

    expect(result).toBeDefined();
    expect(result.title).toContain('Viera Bakery');
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(result.healthyCap).toBe(330000);
  });

  it('runs tool calling loop deterministically with mock provider', async () => {
    const tools = [
      {
        name: 'check_balance',
        description: 'Check active bank/cash balance',
        parameters: { type: 'object' as const, properties: { accountId: { type: 'string' } } },
      },
    ];

    let toolExecuted = false;
    const executor = async (name: string) => {
      if (name === 'check_balance') {
        toolExecuted = true;
        return { balance: 1100000, currency: 'IDR' };
      }
      return {};
    };

    const messages = [{ role: 'user' as const, content: 'Tolong cek saldo kas saya saat ini' }];

    const result = await runToolLoop(messages, tools, executor, { provider: 'mock' });

    expect(toolExecuted).toBe(true);
    expect(result.response).toContain('1.100.000');
    expect(result.messages.length).toBeGreaterThanOrEqual(3);
  });

  it('llm-status function returns valid healthy status and never leaks secrets', async () => {
    process.env.LLM_PROVIDER = 'gemini';
    process.env.GEMINI_API_KEY = 'secret_key_12345_should_not_leak';

    const req = new Request('https://localhost/functions/v1/llm-status', { method: 'GET' });
    const response = await handleLlmStatusRequest(req);

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.status).toBe('healthy');
    expect(body.provider).toBe('gemini');
    expect(body.model).toBe('gemini-1.5-flash');
    expect(body.configured).toBe(true);

    // Verify secrets are NOT leaked in response
    const rawString = JSON.stringify(body);
    expect(rawString).not.toContain('secret_key_12345_should_not_leak');
  });
});
