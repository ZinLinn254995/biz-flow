import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import DashboardPage from '@/pages/DashboardPage';
import BusinessPage from '@/pages/BusinessPage';
import InventoryPage from '@/pages/InventoryPage';
import SalesPage from '@/pages/SalesPage';
import CustomersPage from '@/pages/CustomersPage';
import BusinessExpensesPage from '@/pages/BusinessExpensesPage';
import PersonalFinancePage from '@/pages/PersonalFinancePage';
import CategoriesPage from '@/pages/CategoriesPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/business" element={<BusinessPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/business-expenses" element={<BusinessExpensesPage />} />
        <Route path="/personal" element={<PersonalFinancePage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
