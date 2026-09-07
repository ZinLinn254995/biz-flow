import type { Money } from '@/types/common/base';
import type { Sale } from '@/types/domain/sale';
import type { BusinessExpense } from '@/types/domain/businessExpense';
import type { PersonalIncome, PersonalExpense } from '@/types/domain/personalFinance';

export type CurrencyTotals = Map<string, number>;

export interface FinancialSummary {
  incomeTotals: CurrencyTotals;
  expenseTotals: CurrencyTotals;
  balance: CurrencyTotals;
}

export interface BusinessSummary {
  salesTotals: CurrencyTotals;
  expenseTotals: CurrencyTotals;
  netResult: CurrencyTotals;
}

export interface PersonalSummary {
  incomeTotals: CurrencyTotals;
  expenseTotals: CurrencyTotals;
  balance: CurrencyTotals;
}

function sumMoney(records: { amount: Money }[]): CurrencyTotals {
  const totals: CurrencyTotals = new Map();
  for (const rec of records) {
    const key = rec.amount.currency;
    totals.set(key, (totals.get(key) ?? 0) + rec.amount.amountMinor);
  }
  return totals;
}

function sumSales(sales: Sale[]): CurrencyTotals {
  const totals: CurrencyTotals = new Map();
  for (const sale of sales) {
    const key = sale.totalAmount.currency;
    totals.set(key, (totals.get(key) ?? 0) + sale.totalAmount.amountMinor);
  }
  return totals;
}

function subtractTotals(a: CurrencyTotals, b: CurrencyTotals): CurrencyTotals {
  const result: CurrencyTotals = new Map();
  const currencies = new Set<string>([...a.keys(), ...b.keys()]);
  for (const currency of currencies) {
    result.set(currency, (a.get(currency) ?? 0) - (b.get(currency) ?? 0));
  }
  return result;
}

export function computeIncomeTotal(records: { amount: Money }[]): CurrencyTotals {
  return sumMoney(records);
}

export function computeExpenseTotal(records: { amount: Money }[]): CurrencyTotals {
  return sumMoney(records);
}

export function computeBalance(income: CurrencyTotals, expenses: CurrencyTotals): CurrencyTotals {
  return subtractTotals(income, expenses);
}

export function computeBusinessSummary(sales: Sale[], expenses: BusinessExpense[]): BusinessSummary {
  const salesTotals = sumSales(sales);
  const expenseTotals = sumMoney(expenses);
  const netResult = subtractTotals(salesTotals, expenseTotals);
  return { salesTotals, expenseTotals, netResult };
}

export function computePersonalSummary(
  incomes: PersonalIncome[],
  expenses: PersonalExpense[],
): PersonalSummary {
  const incomeTotals = sumMoney(incomes);
  const expenseTotals = sumMoney(expenses);
  const balance = subtractTotals(incomeTotals, expenseTotals);
  return { incomeTotals, expenseTotals, balance };
}

export function formatMoney(amountMinor: number, currency: string): string {
  return `${currency} ${(amountMinor / 100).toFixed(2)}`;
}

export function formatTotals(totals: CurrencyTotals): string {
  if (totals.size === 0) return '—';
  return Array.from(totals.entries())
    .map(([currency, amount]) => formatMoney(amount, currency))
    .join(', ');
}
