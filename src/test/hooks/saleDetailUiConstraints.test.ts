import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const saleDetailUiFiles = [
  'src/pages/SaleDetailPage.tsx',
  'src/components/sales/SaleReceipt.tsx',
];

describe('Sale detail UI architectural constraints', () => {
  it('does not access persistence or concrete services directly', () => {
    for (const file of saleDetailUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf-8');
      expect(content).not.toMatch(/@\/db|@\/types\/repositories|@\/services\//);
      expect(content).not.toMatch(/Dexie|SalesService|fetch\(|XMLHttpRequest|WebSocket/);
    }
  });

  it('uses existing hooks and keeps the receipt read-only', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/pages/SaleDetailPage.tsx'), 'utf-8');
    const receipt = readFileSync(resolve(process.cwd(), 'src/components/sales/SaleReceipt.tsx'), 'utf-8');

    expect(page).toContain("@/hooks/sales");
    expect(page).toContain('useSale');
    expect(receipt).toContain('onPrint');
    expect(receipt).not.toContain('onEdit');
    expect(receipt).not.toContain('onDelete');
  });
});