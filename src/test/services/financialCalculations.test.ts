import { describe, it, expect } from 'vitest';
import {
  computeIncomeTotal,
  computeExpenseTotal,
  computeBalance,
  computeBusinessSummary,
  computePersonalSummary,
  formatMoney,
  formatTotals,
} from '@/services/calculations/financialCalculations';
import type { Sale } from '@/types/domain/sale';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';
import type { EntityId } from '@/types/common/base';

function mkId(s: string): EntityId {
  return s as EntityId;
}

const usdIncome = { amount: { amountMinor: 50000, currency: 'USD' } };
const eurIncome = { amount: { amountMinor: 10000, currency: 'EUR' } };
const usdExpense = { amount: { amountMinor: 15000, currency: 'USD' } };
const eurExpense = { amount: { amountMinor: 5000, currency: 'EUR' } };

describe('financialCalculations — income totals', () => {
  it('sums income by currency', () => {
    const totals = computeIncomeTotal([usdIncome, eurIncome, { amount: { amountMinor: 20000, currency: 'USD' } }]);
    expect(totals.get('USD')).toBe(70000);
    expect(totals.get('EUR')).toBe(10000);
  });

  it('returns empty map for no records', () => {
    expect(computeIncomeTotal([]).size).toBe(0);
  });
});

describe('financialCalculations — expense totals', () => {
  it('sums expenses by currency', () => {
    const totals = computeExpenseTotal([usdExpense, eurExpense]);
    expect(totals.get('USD')).toBe(15000);
    expect(totals.get('EUR')).toBe(5000);
  });
});

describe('financialCalculations — balance', () => {
  it('computes balance per currency', () => {
    const income = computeIncomeTotal([usdIncome, eurIncome]);
    const expenses = computeExpenseTotal([usdExpense, eurExpense]);
    const balance = computeBalance(income, expenses);
    expect(balance.get('USD')).toBe(35000);
    expect(balance.get('EUR')).toBe(5000);
  });

  it('handles currencies only in one side', () => {
    const income = computeIncomeTotal([usdIncome]);
    const expenses = computeExpenseTotal([eurExpense]);
    const balance = computeBalance(income, expenses);
    expect(balance.get('USD')).toBe(50000);
    expect(balance.get('EUR')).toBe(-5000);
  });
});

describe('financialCalculations — business summary', () => {
  const sales: Sale[] = [
    { id: mkId('s1'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', businessId: mkId('b1'), date: '2026-01-01', items: [], totalAmount: { amountMinor: 100000, currency: 'USD' }, paymentStatus: 'paid' },
    { id: mkId('s2'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', businessId: mkId('b1'), date: '2026-01-02', items: [], totalAmount: { amountMinor: 50000, currency: 'EUR' }, paymentStatus: 'paid' },
  ];
  const expenses: BusinessExpense[] = [
    { id: mkId('e1'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', businessId: mkId('b1'), title: 'Rent', date: '2026-01-01', amount: { amountMinor: 30000, currency: 'USD' } },
    { id: mkId('e2'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', businessId: mkId('b1'), title: 'Supplies', date: '2026-01-01', amount: { amountMinor: 10000, currency: 'EUR' } },
  ];

  it('computes sales totals', () => {
    const summary = computeBusinessSummary(sales, expenses);
    expect(summary.salesTotals.get('USD')).toBe(100000);
    expect(summary.salesTotals.get('EUR')).toBe(50000);
  });

  it('computes expense totals', () => {
    const summary = computeBusinessSummary(sales, expenses);
    expect(summary.expenseTotals.get('USD')).toBe(30000);
    expect(summary.expenseTotals.get('EUR')).toBe(10000);
  });

  it('computes net result per currency', () => {
    const summary = computeBusinessSummary(sales, expenses);
    expect(summary.netResult.get('USD')).toBe(70000);
    expect(summary.netResult.get('EUR')).toBe(40000);
  });
});

describe('financialCalculations — personal summary', () => {
  const incomes: PersonalIncome[] = [
    { id: mkId('i1'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', source: 'Salary', date: '2026-01-01', amount: { amountMinor: 50000, currency: 'USD' } },
  ];
  const expenses: PersonalExpense[] = [
    { id: mkId('x1'), createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', title: 'Rent', date: '2026-01-01', amount: { amountMinor: 20000, currency: 'USD' } },
  ];

  it('computes personal income total', () => {
    const summary = computePersonalSummary(incomes, expenses);
    expect(summary.incomeTotals.get('USD')).toBe(50000);
  });

  it('computes personal expense total', () => {
    const summary = computePersonalSummary(incomes, expenses);
    expect(summary.expenseTotals.get('USD')).toBe(20000);
  });

  it('computes personal balance', () => {
    const summary = computePersonalSummary(incomes, expenses);
    expect(summary.balance.get('USD')).toBe(30000);
  });
});

describe('financialCalculations — multi-currency safety', () => {
  it('never combines different currencies', () => {
    const income = computeIncomeTotal([
      { amount: { amountMinor: 10000, currency: 'USD' } },
      { amount: { amountMinor: 20000, currency: 'THB' } },
      { amount: { amountMinor: 5000, currency: 'MMK' } },
    ]);
    expect(income.size).toBe(3);
    expect(income.get('USD')).toBe(10000);
    expect(income.get('THB')).toBe(20000);
    expect(income.get('MMK')).toBe(5000);
  });
});

describe('financialCalculations — integer precision', () => {
  it('preserves integer minor units', () => {
    const totals = computeIncomeTotal([
      { amount: { amountMinor: 12345, currency: 'USD' } },
      { amount: { amountMinor: 67890, currency: 'USD' } },
    ]);
    expect(totals.get('USD')).toBe(80235);
    expect(Number.isInteger(totals.get('USD'))).toBe(true);
  });
});

describe('financialCalculations — formatting', () => {
  it('formats money from minor units', () => {
    expect(formatMoney(50000, 'USD')).toBe('USD 500.00');
    expect(formatMoney(0, 'EUR')).toBe('EUR 0.00');
  });

  it('formats totals as string', () => {
    const totals = computeIncomeTotal([usdIncome, eurIncome]);
    expect(formatTotals(totals)).toBe('USD 500.00, EUR 100.00');
  });

  it('returns dash for empty totals', () => {
    expect(formatTotals(new Map())).toBe('—');
  });
});
