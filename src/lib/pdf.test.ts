// @vitest-environment jsdom
import { afterEach, describe, expect, test, vi } from 'vitest';
import { generatePdf } from './pdf';
import { layoutCompleto } from '@/fixtures/layoutCompleto';
import { quotationQ012345 } from '@/fixtures/quotation';
import { tokenCatalog } from '@/fixtures/tokenCatalog';

afterEach(() => vi.unstubAllGlobals());

describe('generatePdf (PDF-1)', () => {
  test('faz POST multipart ao endpoint do Gotenberg com os 2 arquivos e o waitForExpression', async () => {
    const fetchMock = vi.fn(
      async (_url: RequestInfo | URL, _init?: RequestInit) =>
        ({ ok: true, blob: async () => new Blob(['%PDF']) }) as Response,
    );
    vi.stubGlobal('fetch', fetchMock);

    const blob = await generatePdf(quotationQ012345, layoutCompleto, tokenCatalog);
    expect(blob).toBeInstanceOf(Blob);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/forms\/chromium\/convert\/html$/);
    expect(init?.method).toBe('POST');
    const form = init!.body as FormData;
    expect(form.getAll('files')).toHaveLength(2);
    expect(form.get('waitForExpression')).toBe('window.QS_PAGED_DONE === true');
    expect(form.get('preferCssPageSize')).toBe('true');
  });

  test('lança erro amigável quando o Gotenberg responde não-ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 502 }) as Response));
    await expect(generatePdf(quotationQ012345, layoutCompleto, tokenCatalog)).rejects.toThrow(/Gotenberg/);
  });
});
