import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Providers
import AppProviders from './providers/AppProviders';

// Layout components
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';

// Import pages directly
import Dashboard from './pages/dashboard/Dashboard';
import Login from './pages/auth/Login';
import SimpleLogin from './pages/auth/SimpleLogin';


import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Import pages
import CustomerList from './pages/customers/CustomerList';
import ConversationsSimple from './pages/conversations/ConversationsSimple';
import ConversationsImprovedFixed from './pages/conversations/ConversationsImprovedFixed';
import ConversationsDashboard from './pages/conversations/ConversationsDashboard';
import ConversationsTest from './pages/conversations/ConversationsTest';
import ConversationsSimpleTest from './pages/conversations/ConversationsSimpleTest';
import MessengerChat from './pages/conversations/MessengerChat-final';
import Products from './pages/products/Products';
import ProductNew from './pages/products/ProductNew';
import ProductView from './pages/products/ProductView';
import ProductEdit from './pages/products/ProductEdit';
import ProductEditNew from './pages/products/ProductEditNew';
import ProductEditTest from './pages/products/ProductEditTest';
import Categories from './pages/categories/Categories';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import CompanySettings from './pages/settings/CompanySettings';
import FacebookSettings from './pages/settings/FacebookSettings';
import Profile from './pages/profile/Profile';
import Orders from './pages/orders/Orders';
import OrdersEnhanced from './pages/orders/OrdersEnhanced';
import OrderDetails from './pages/orders/OrderDetails';
import OrderStats from './pages/orders/OrderStats';
import Opportunities from './pages/opportunities/Opportunities';
import Inventory from './pages/inventory/Inventory';
import Coupons from './pages/coupons/Coupons';
import Appointments from './pages/appointments/Appointments';
import OrderDemo from './pages/OrderDemo';
import Tasks from './pages/tasks/Tasks';
import AdvancedReports from './pages/reports/AdvancedReports';




// AI Management
import AIManagement from './pages/ai/AIManagement';

// Continuous Learning System - REMOVED



import { BroadcastDashboard } from './pages/broadcast';
import Reminders from './pages/Reminders';
import NotificationSettings from './pages/NotificationSettings';
import MonitoringDashboard from './pages/MonitoringDashboard';
import AlertSettings from './pages/AlertSettings';
import ReportsPage from './pages/ReportsPage';
import QualityTestPage from './pages/QualityTestPage';
import QualityDashboard from './pages/QualityDashboard';
import AdvancedQualityDashboard from './pages/AdvancedQualityDashboard';
import AIQualityDashboard from './pages/AIQualityDashboard';
import SuccessAnalytics from './pages/SuccessAnalytics';
import PatternManagement from './pages/PatternManagement';
import CompaniesManagement from './pages/CompaniesManagement';
import UsersManagement from './pages/UsersManagement';
import RolesManagement from './pages/RolesManagement';
import CompanyDashboard from './pages/CompanyDashboard';

// Super Admin
import SuperAdminLogin from './pages/SuperAdminLogin';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminCompanies from './pages/SuperAdminCompanies';
import SuperAdminReports from './pages/SuperAdminReports';
import SuperAdminPlans from './pages/SuperAdminPlans';
import SuperAdminSubscriptions from './pages/SuperAdminSubscriptions';
import SuperAdminInvoices from './pages/SuperAdminInvoices';
import SuperAdminPayments from './pages/SuperAdminPayments';
import SuperAdminSystemManagement from './pages/SuperAdminSystemManagement';
import PaymentPage from './pages/PaymentPage';
import WalletManagement from './pages/WalletManagement';
import CustomerInvoices from './pages/CustomerInvoices';
import CustomerPayments from './pages/CustomerPayments';
import CustomerSubscription from './pages/CustomerSubscription';
import SubscriptionRenewalPayment from './pages/SubscriptionRenewalPayment';

const App: React.FC = () => {
  // Mock authentication state for now
  const isAuthenticated = true; // Set to true for development
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <AppProviders>
      <div className="App">
        <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<AuthLayout><SimpleLogin /></AuthLayout>} />
        <Route path="/auth/login-old" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/auth/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/auth/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
        <Route path="/auth/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />

        {/* Super Admin Routes */}
        <Route path="/super-admin/login" element={<SuperAdminLogin />} />
        <Route path="/super-admin/dashboard" element={<SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout>} />
        <Route path="/super-admin/companies" element={<SuperAdminLayout><SuperAdminCompanies /></SuperAdminLayout>} />
        <Route path="/super-admin/reports" element={<SuperAdminLayout><SuperAdminReports /></SuperAdminLayout>} />
        <Route path="/super-admin/plans" element={<SuperAdminLayout><SuperAdminPlans /></SuperAdminLayout>} />
        <Route path="/super-admin/subscriptions" element={<SuperAdminLayout><SuperAdminSubscriptions /></SuperAdminLayout>} />
        <Route path="/super-admin/invoices" element={<SuperAdminLayout><SuperAdminInvoices /></SuperAdminLayout>} />
        <Route path="/super-admin/payments" element={<SuperAdminLayout><SuperAdminPayments /></SuperAdminLayout>} />
        <Route path="/super-admin/system-management" element={<SuperAdminLayout><SuperAdminSystemManagement /></SuperAdminLayout>} />
        <Route path="/super-admin/wallet-management" element={<SuperAdminLayout><WalletManagement /></SuperAdminLayout>} />

        {/* Public Payment Routes */}
        <Route path="/payment/:invoiceId" element={<PaymentPage />} />
        <Route path="/payment/subscription-renewal" element={<SubscriptionRenewalPayment />} />

        {/* Protected Routes */}
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/customers" element={<Layout><CustomerList /></Layout>} />
            <Route path="/conversations" element={<Layout><ConversationsSimple /></Layout>} />
            <Route path="/conversations-improved" element={<Layout><ConversationsImprovedFixed /></Layout>} />
            <Route path="/conversations-dashboard" element={<Layout><ConversationsDashboard /></Layout>} />
            <Route path="/conversations-test" element={<Layout><ConversationsTest /></Layout>} />
            <Route path="/conversations-simple-test" element={<Layout><ConversationsSimpleTest /></Layout>} />
            <Route path="/messenger-chat" element={<Layout><MessengerChat /></Layout>} />
            <Route path="/products" element={<Layout><Products /></Layout>} />
            <Route path="/products/new" element={<Layout><ProductNew /></Layout>} />
            <Route path="/products/:id" element={<Layout><ProductView /></Layout>} />
            <Route path="/products/:id/edit" element={<Layout><ProductEditNew /></Layout>} />
            <Route path="/products/:id/edit-test" element={<Layout><ProductEditTest /></Layout>} />
            <Route path="/products/:id/edit-old" element={<Layout><ProductEdit /></Layout>} />
            <Route path="/categories" element={<Layout><Categories /></Layout>} />
            <Route path="/orders" element={<Layout><Orders /></Layout>} />
            <Route path="/orders/enhanced" element={<Layout><OrdersEnhanced /></Layout>} />
            <Route path="/orders/enhanced/:id" element={<Layout><OrderDetails /></Layout>} />
            <Route path="/orders/stats" element={<Layout><OrderStats /></Layout>} />
            <Route path="/order-demo" element={<Layout><OrderDemo /></Layout>} />
            <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
            <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
            <Route path="/coupons" element={<Layout><Coupons /></Layout>} />
            <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
            <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="/analytics" element={<Layout><AdvancedReports /></Layout>} />

            {/* AI Management */}
            <Route path="/ai-management" element={<Layout><AIManagement /></Layout>} />

            {/* Customer Billing */}
            <Route path="/invoices" element={<Layout><CustomerInvoices /></Layout>} />
            <Route path="/payments" element={<Layout><CustomerPayments /></Layout>} />
            <Route path="/subscription" element={<Layout><CustomerSubscription /></Layout>} />

            {/* Continuous Learning System - REMOVED */}



            <Route path="/broadcast" element={<Layout><BroadcastDashboard /></Layout>} />
            <Route path="/reminders" element={<Layout><Reminders /></Layout>} />
            <Route path="/notification-settings" element={<Layout><NotificationSettings /></Layout>} />
            <Route path="/monitoring" element={<Layout><MonitoringDashboard /></Layout>} />
            <Route path="/alert-settings" element={<Layout><AlertSettings /></Layout>} />
            <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
            <Route path="/quality-test" element={<Layout><QualityTestPage /></Layout>} />
            <Route path="/quality" element={<Layout><QualityDashboard /></Layout>} />
            <Route path="/quality-advanced" element={<Layout><AdvancedQualityDashboard /></Layout>} />
            <Route path="/ai-quality" element={<Layout><AIQualityDashboard /></Layout>} />
            <Route path="/success-analytics" element={<Layout><SuccessAnalytics /></Layout>} />
            <Route path="/pattern-management" element={<Layout><PatternManagement /></Layout>} />
            <Route path="/companies" element={<Layout><CompaniesManagement /></Layout>} />
            <Route path="/users" element={<Layout><UsersManagement /></Layout>} />
            <Route path="/roles" element={<Layout><RolesManagement /></Layout>} />
            <Route path="/company-dashboard" element={<Layout><CompanyDashboard /></Layout>} />
            <Route path="/profile" element={<Layout><Profile /></Layout>} />
            <Route path="/settings" element={<Layout><Settings /></Layout>} />
            <Route path="/settings/company" element={<Layout><CompanySettings /></Layout>} />
            <Route path="/settings/facebook" element={<Layout><FacebookSettings /></Layout>} />
            {/* 🗑️ تم حذف جميع routes الخاصة بـ Gemini والذكاء الصناعي */}
          </>
        ) : (
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        )}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth/login"} replace />} />
        </Routes>
      </div>
    </AppProviders>
  );
};

export default App;
