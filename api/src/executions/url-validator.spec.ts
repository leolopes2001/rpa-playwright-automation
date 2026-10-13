import { describe, expect, it } from 'vitest';
import { assertPublicUrl } from './url-validator.js';

describe('assertPublicUrl', () => {
  it('rejects localhost', async () => {
    await expect(assertPublicUrl('http://localhost:3000')).rejects.toThrow('locais');
  });

  it('rejects credentials embedded in the URL', async () => {
    await expect(assertPublicUrl('https://user:pass@example.com')).rejects.toThrow('credenciais');
  });
});