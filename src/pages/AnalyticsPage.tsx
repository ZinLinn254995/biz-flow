import { useMemo } from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, CircleDollarSign } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useSales } from '@/hooks/sales';
import { useBusinessExpenses } from '@/hooks/businessExpenses';
import { usePersonalIncomeRecords, usePersonalExpenses } from '@/hooks/personalFinance';
import { formatMoney, type CurrencyTotals } from '@/services/calculations/financialCalculations';

interface MonthlyPoint {
  label: string;
  income: number;
  expenses: number;
}

function monthKey(date: string): string {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? '' : `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, { month: 'short' });
}

function totalForCurrency(totals: CurrencyTotals, currency: string): number {
  return totals.get(currency) ?? 0;
}

function TotalsList({ totals, emptyText }: { totals: CurrencyTotals; emptyText: string }) {
  if (totals.size === 0) return <p className="text-sm text-gray-400">{emptyText}</p>;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {Array.from(totals.entries()).map(([currency, amount]) => (
        <span key={currency} className="text-xl font-semibold text-gray-900">{formatMoney(amount, currency)}</span>
      ))}
    </div>
  );
}

function MetricCard({ label, icon, value, tone }: { label: string; icon: React.ReactNode; value: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>{icon}</span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      {value}
    </div>
  );
}

function AnalyticsPage() {
  const salesQuery = useSales();
  const businessExpensesQuery = useBusinessExpenses();
  const incomeQuery = usePersonalIncomeRecords();
  const personalExpensesQuery = usePersonalExpenses();

  const isLoading = salesQuery.isLoading || businessExpensesQuery.isLoading || incomeQuery.isLoading || personalExpensesQuery.isLoading;

  const analytics = useMemo(() => {
    const sales = salesQuery.data ?? [];
    const businessExpenses = businessExpensesQuery.data ?? [];
    const income = incomeQuery.data ?? [];
    const personalExpenses = personalExpensesQuery.data ?? [];
    const incomeTotals: CurrencyTotals = new Map();
    const expenseTotals: CurrencyTotals = new Map();
    const monthly = new Map<string, MonthlyPoint>();

    const add = (totals: CurrencyTotals, currency: string, amount: number) => totals.set(currency, (totals.get(currency) ?? 0) + amount);
    const addMonth = (date: string, kind: 'income' | 'expenses', amount: number) => {
      const key = monthKey(date);
      if (!key) return;
      const point = monthly.get(key) ?? { label: monthLabel(key), income: 0, expenses: 0 };
      point[kind] += amount;
      monthly.set(key, point);
    };

    for (const sale of sales) {
      add(incomeTotals, sale.totalAmount.currency, sale.totalAmount.amountMinor);
      addMonth(sale.date, 'income', sale.totalAmount.amountMinor);
    }
    for (const record of income) {
      add(incomeTotals, record.amount.currency, record.amount.amountMinor);
      addMonth(record.date, 'income', record.amount.amountMinor);
    }
    for (const expense of [...businessExpenses, ...personalExpenses]) {
      add(expenseTotals, expense.amount.currency, expense.amount.amountMinor);
      addMonth(expense.date, 'expenses', expense.amount.amountMinor);
    }

    const monthlyPoints = Array.from(monthly.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([, point]) => point);
    const currencies = Array.from(new Set([...incomeTotals.keys(), ...expenseTotals.keys()]));
    return { incomeTotals, expenseTotals, monthlyPoints, currencies };
  }, [salesQuery.data, businessExpensesQuery.data, incomeQuery.data, personalExpensesQuery.data]);

  const maxMonthlyValue = Math.max(1, ...analytics.monthlyPoints.flatMap((point) => [point.income, point.expenses]));

  return (
    <PageContainer title="Analytics" subtitle="Understand the money moving through your business and personal finances.">
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500">Loading analytics…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard label="Total inflow" icon={<ArrowUpRight className="h-4 w-4 text-green-600" />} tone="bg-green-50" value={<TotalsList totals={analytics.incomeTotals} emptyText="No income recorded" />} />
            <MetricCard label="Total outflow" icon={<ArrowDownRight className="h-4 w-4 text-red-600" />} tone="bg-red-50" value={<TotalsList totals={analytics.expenseTotals} emptyText="No expenses recorded" />} />
            <MetricCard label="Tracked currencies" icon={<CircleDollarSign className="h-4 w-4 text-blue-600" />} tone="bg-blue-50" value={<p className="text-xl font-semibold text-gray-900">{analytics.currencies.length}</p>} />
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6" aria-labelledby="monthly-trend-heading">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 id="monthly-trend-heading" className="flex items-center gap-2 text-base font-semibold text-gray-900"><BarChart3 className="h-4 w-4 text-gray-400" /> Monthly activity</h2>
                <p className="mt-1 text-sm text-gray-500">Income and expenses across the last six active months.</p>
              </div>
              <CalendarDays className="h-5 w-5 text-gray-300" aria-hidden="true" />
            </div>
            {analytics.monthlyPoints.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">Add transactions to see your monthly trend.</p>
            ) : (
              <div className="flex h-64 items-end gap-2 sm:gap-5" role="img" aria-label="Monthly income and expense comparison chart">
                {analytics.monthlyPoints.map((point) => (
                  <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <div className="flex h-48 w-full max-w-14 items-end justify-center gap-1">
                      <div className="w-1/2 rounded-t bg-blue-500" style={{ height: `${Math.max(4, (point.income / maxMonthlyValue) * 100)}%` }} title={`${point.label} income`} />
                      <div className="w-1/2 rounded-t bg-red-400" style={{ height: `${Math.max(4, (point.expenses / maxMonthlyValue) * 100)}%` }} title={`${point.label} expenses`} />
                    </div>
                    <span className="text-xs text-gray-500">{point.label}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 flex justify-center gap-5 text-xs text-gray-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-blue-500" />Income</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-red-400" />Expenses</span></div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6" aria-labelledby="currency-heading">
            <h2 id="currency-heading" className="mb-4 text-base font-semibold text-gray-900">Net position by currency</h2>
            {analytics.currencies.length === 0 ? <p className="text-sm text-gray-400">No financial data available yet.</p> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{analytics.currencies.map((currency) => { const net = totalForCurrency(analytics.incomeTotals, currency) - totalForCurrency(analytics.expenseTotals, currency); return <div key={currency} className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-medium uppercase tracking-wide text-gray-500">{currency}</p><p className={`mt-1 text-lg font-semibold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>{formatMoney(net, currency)}</p><p className="mt-1 text-xs text-gray-500">Income minus expenses</p></div>; })}</div>}
          </section>
        </>
      )}
    </PageContainer>
  );
}

export default AnalyticsPage;
