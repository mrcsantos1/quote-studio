// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { markersToSpans, spansToMarkers } from './tokens';

describe('conversão storage ↔ editor de tokens (TOK-3)', () => {
  test('markersToSpans: {{token}} → <span data-token>', () => {
    const out = markersToSpans('Preço {{token:SAP:netPrice}}.');
    expect(out).toContain('data-token="SAP:netPrice"');
    expect(out).not.toContain('{{token');
  });

  test('spansToMarkers: <span data-token> → {{token}}', () => {
    const out = spansToMarkers('Preço <span data-token="SAP:netPrice" class="qs-token">R$ 1,00</span>.');
    expect(out).toBe('Preço {{token:SAP:netPrice}}.');
  });

  test('round-trip preserva os tokens', () => {
    const original = 'A {{token:SAP:netPrice}} e {{token:Q4P:deliveryWeeks}} B';
    expect(spansToMarkers(markersToSpans(original))).toBe(original);
  });
});
