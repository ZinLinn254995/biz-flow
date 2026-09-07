import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  WalletCards,
  BriefcaseBusiness,
  Package,
  AlertTriangle,
  ShoppingCart,
  Receipt,
  ArrowRight,
} from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { useBusinesses } from '@/hooks/business';
import { useSales } from '@/hooks/sales';
import { useBusinessExpenses } from '@/hooks/businessExpenses';
import { useInventoryItems } from '@/hooks/inventory';
import { usePersonalIncomeRecords, usePersonalExpenses } from '@/hooks/personalFinance';
import {
  computeBusinessSummary,
  computePersonalSummary,
  formatMoney,
  formatTotals,
  type CurrencyTotals,
} from '@/services/calculations/financialCalculations';
import type { EntityId } from '@/types/common/base';

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function TotalsDisplay({ totals, emptyText }: { totals: CurrencyTotals; emptyText: string }) {
  if (totals.size === 0) return <span className="text-sm text-gray-400">{emptyText}</span>;
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {Array.from(totals.entries()).map(([currency, amount]) => (
        <span key={currency} className="text-lg font-semibold text-gray-900">
          {formatMoney(amount, currency)}
        </span>
      ))}
    </div>
  );
}

function DashboardPage() {
  const businessesQuery = useBusinesses();
  const salesQuery = useSales();
  const expensesQuery = useBusinessExpenses();
  const inventoryQuery = useInventoryItems();
  const incomeQuery = usePersonalIncomeRecords();
  const personalExpenseQuery = usePersonalExpenses();

  const businessNameMap = useMemo(() => {
    const map = new Map<EntityId, string>();
    if (businessesQuery.data) {
      for (const biz of businessesQuery.data) {
        map.set(biz.id, biz.name);
      }
    }
    return map;
  }, [businessesQuery.data]);

  const businessSummary = useMemo(
    () => computeBusinessSummary(salesQuery.data ?? [], expensesQuery.data ?? []),
    [salesQuery.data, expensesQuery.data],
  );

  const personalSummary = useMemo(
    () => computePersonalSummary(incomeQuery.data ?? [], personalExpenseQuery.data ?? []),
    [incomeQuery.data, personalExpenseQuery.data],
  );

  const lowStockCount = useMemo(() => {
    if (!inventoryQuery.data) return 0;
    return inventoryQuery.data.filter(
      (item) => item.stockStatus === 'low_stock' || item.stockStatus === 'out_of_stock',
    ).length;
  }, [inventoryQuery.data]);

  const recentSales = useMemo(() => {
    if (!salesQuery.data) return [];
    return [...salesQuery.data]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 5);
  }, [salesQuery.data]);

  const recentExpenses = useMemo(() => {
    if (!expensesQuery.data) return [];
    return [...expensesQuery.data]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 5);
  }, [expensesQuery.data]);

  const recentIncome = useMemo(() => {
    if (!incomeQuery.data) return [];
    return [...incomeQuery.data]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 3);
  }, [incomeQuery.data]);

  const recentPersonalExpenses = useMemo(() => {
    if (!personalExpenseQuery.data) return [];
    return [...personalExpenseQuery.data]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 3);
  }, [personalExpenseQuery.data]);

  const isLoading =
    businessesQuery.isLoading ||
    salesQuery.isLoading ||
    expensesQuery.isLoading ||
    inventoryQuery.isLoading ||
    incomeQuery.isLoading ||
    personalExpenseQuery.isLoading;

  return (
    <PageContainer title="Dashboard" subtitle="Overview of your business and personal finances.">
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-gray-500">Loading dashboard…</span>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Business Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                  <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Business Sales</span>
              </div>
              <TotalsDisplay totals={businessSummary.salesTotals} emptyText="No sales recorded" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                  <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Business Expenses</span>
              </div>
              <TotalsDisplay totals={businessSummary.expenseTotals} emptyText="No expenses recorded" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                  <WalletCards className="w-4 h-4 text-gray-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Net Business Result</span>
              </div>
              <TotalsDisplay totals={businessSummary.netResult} emptyText="No data" />
            </div>
          </div>

          {/* Personal Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                  <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Personal Income</span>
              </div>
              <TotalsDisplay totals={personalSummary.incomeTotals} emptyText="No income recorded" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                  <TrendingDown className="w-4 h-4 text-red-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Personal Expenses</span>
              </div>
              <TotalsDisplay totals={personalSummary.expenseTotals} emptyText="No expenses recorded" />
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100">
                  <WalletCards className="w-4 h-4 text-gray-600" strokeWidth={2} />
                </div>
                <span className="text-sm font-medium text-gray-500">Personal Balance</span>
              </div>
              <TotalsDisplay totals={personalSummary.balance} emptyText="No data" />
            </div>
          </div>

          {/* Counts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50">
                <BriefcaseBusiness className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Businesses</p>
                <p className="text-lg font-semibold text-gray-900">{businessesQuery.data?.length ?? 0}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-50">
                <Package className="w-5 h-5 text-purple-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventory Items</p>
                <p className="text-lg font-semibold text-gray-900">{inventoryQuery.data?.length ?? 0}</p>
              </div>
            </div>

            {lowStockCount > 0 && (
              <div className="bg-white border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50">
                  <AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Low / Out of Stock</p>
                  <p className="text-lg font-semibold text-amber-600">{lowStockCount}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Sales */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  Recent Sales
                </h3>
                <Link to="/sales" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </Link>
              </div>
              {recentSales.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No sales yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentSales.map((sale) => (
                    <li key={sale.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-gray-900 truncate">
                          {businessNameMap.get(sale.businessId) ?? 'Unknown'} · {formatDate(sale.date)}
                        </p>
                        <p className="text-xs text-gray-400">{sale.items.length} item(s) · {sale.paymentStatus}</p>
                      </div>
                      <span className="text-gray-900 font-medium shrink-0">
                        {formatMoney(sale.totalAmount.amountMinor, sale.totalAmount.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Business Expenses */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  Recent Expenses
                </h3>
                <Link to="/business-expenses" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </Link>
              </div>
              {recentExpenses.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No expenses yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentExpenses.map((exp) => (
                    <li key={exp.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-gray-900 truncate">{exp.title}</p>
                        <p className="text-xs text-gray-400">
                          {businessNameMap.get(exp.businessId) ?? 'Unknown'} · {formatDate(exp.date)}
                        </p>
                      </div>
                      <span className="text-red-600 font-medium shrink-0">
                        {formatMoney(exp.amount.amountMinor, exp.amount.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Personal Income */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  Recent Personal Income
                </h3>
                <Link to="/personal" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </Link>
              </div>
              {recentIncome.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No income yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentIncome.map((inc) => (
                    <li key={inc.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-gray-900 truncate">{inc.source}</p>
                        <p className="text-xs text-gray-400">{formatDate(inc.date)}</p>
                      </div>
                      <span className="text-green-600 font-medium shrink-0">
                        {formatMoney(inc.amount.amountMinor, inc.amount.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Recent Personal Expenses */}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  Recent Personal Expenses
                </h3>
                <Link to="/personal" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" strokeWidth={2} />
                </Link>
              </div>
              {recentPersonalExpenses.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No expenses yet</p>
              ) : (
                <ul className="space-y-2">
                  {recentPersonalExpenses.map((exp) => (
                    <li key={exp.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="text-gray-900 truncate">{exp.title}</p>
                        <p className="text-xs text-gray-400">{formatDate(exp.date)}</p>
                      </div>
                      <span className="text-red-600 font-medium shrink-0">
                        {formatMoney(exp.amount.amountMinor, exp.amount.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
}

export default DashboardPage;
