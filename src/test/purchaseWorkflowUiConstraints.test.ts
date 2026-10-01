import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const purchaseUiFiles = [
  'src/pages/PurchasesPage.tsx',
  'src/pages/PurchaseDetailPage.tsx',
  'src/components/purchases/PurchaseCard.tsx',
  'src/components/purchases/PurchaseForm.tsx',
  'src/components/purchases/DeletePurchaseDialog.tsx',
];

describe('Purchase workflow UI architectural constraints', () => {
  it('does not access persistence or concrete services directly', () => {
    for (const file of purchaseUiFiles) {
      const content = readFileSync(resolve(process.cwd(), file), 'utf8');
      expect(content).not.toMatch(/@\/db|@\/types\/repositories|@\/services\//);
      expect(content).not.toMatch(/Dexie|PurchaseService|fetch\(|XMLHttpRequest|WebSocket/);
    }
  });

  it('uses purchase hooks for the workflow and keeps stock operations out of UI', () => {
    const page = readFileSync(resolve(process.cwd(), 'src/pages/PurchasesPage.tsx'), 'utf8');
    expect(page).toContain("@/hooks/purchases");
    expect(page).toContain('useCreatePurchase');
    expect(page).toContain('useUpdatePurchase');
    expect(page).toContain('useDeletePurchase');
    expect(page).not.toContain('inventoryRepository');
  });
});
