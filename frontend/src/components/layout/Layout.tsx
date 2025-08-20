import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuthSimple';
import NotificationDropdown from '../notifications/NotificationDropdown';
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="w-64 h-screen bg-white dark:bg-gray-800 shadow-lg flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              منصة التواصل
            </h1>
          </div>
          <nav className="flex-1 mt-8 overflow-y-auto sidebar-scroll">
            <div className="px-4 space-y-2">
              {/* القسم الرئيسي */}
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📊</span>
                لوحة التحكم
              </Link>
              <Link
                to="/conversations"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">💬</span>
                المحادثات
              </Link>
              <Link
                to="/conversations-improved"
                className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <span className="ml-3">🚀</span>
                المحادثات المحسنة
              </Link>
              <Link
                to="/conversations-dashboard"
                className="flex items-center px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <span className="ml-3">📊</span>
                لوحة المحادثات
              </Link>

              {/* قسم إدارة العملاء */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  👥 إدارة العملاء
                </h3>
              </div>

              <Link
                to="/customers"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">👤</span>
                العملاء
              </Link>
              <a
                href="/opportunities"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">💼</span>
                الفرص التجارية
              </a>
              <a
                href="/appointments"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📅</span>
                المواعيد والتقويم
              </a>
              <a
                href="/tasks"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">✅</span>
                المهام والمشاريع
              </a>

              {/* قسم التسويق والإعلانات */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  📢 التسويق والإعلانات
                </h3>
              </div>

              <Link
                to="/broadcast"
                className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <span className="ml-3">📡</span>
                لوحة البرودكاست
              </Link>

              {/* قسم التجارة الإلكترونية */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🛒 التجارة الإلكترونية
                </h3>
              </div>

              <a
                href="/products"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🛍️</span>
                المنتجات
              </a>
              <a
                href="/categories"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🏷️</span>
                فئات المنتجات
              </a>
              <a
                href="/orders"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📦</span>
                الطلبات
              </a>
              <a
                href="/orders/enhanced"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🚀</span>
                الطلبات المحسنة
              </a>
              <a
                href="/inventory"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📋</span>
                إدارة المخزون
              </a>
              <a
                href="/coupons"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🎫</span>
                الكوبونات والخصومات
              </a>

              {/* قسم الفواتير والمدفوعات */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  💳 الفواتير والمدفوعات
                </h3>
              </div>

              <Link
                to="/invoices"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🧾</span>
                فواتيري
              </Link>
              <Link
                to="/payments"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">💰</span>
                مدفوعاتي
              </Link>
              <Link
                to="/subscription"
                className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <span className="ml-3">📋</span>
                اشتراكي
              </Link>

              {/* قسم التحليلات */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  📈 التحليلات
                </h3>
              </div>

              <a
                href="/analytics"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📊</span>
                التحليلات المتقدمة
              </a>

              {/* 🗑️ تم حذف قسم الذكاء الصناعي كاملاً */}
              {/* قسم الأدوات والإدارة */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🛠️ الأدوات والإدارة
                </h3>
              </div>

              <a
                href="/reminders"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🔔</span>
                التذكيرات
              </a>
              <a
                href="/notification-settings"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📢</span>
                إعدادات الإشعارات
              </a>
              <a
                href="/reports"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📊</span>
                التقارير
              </a>

              {/* قسم الذكاء الصناعي */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🤖 الذكاء الصناعي
                </h3>
              </div>

              <Link
                to="/ai-management"
                className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <span className="ml-3">🧠</span>
                إدارة AI Agent
              </Link>

              {/* قسم التعلم المستمر */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🧠 التعلم المستمر
                </h3>
              </div>

              {/* Continuous Learning Links - REMOVED */}

              <Link
                to="/learning/settings"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">⚙️</span>
                إعدادات التعلم
              </Link>

              <Link
                to="/learning/reports"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📊</span>
                التقارير التفصيلية
              </Link>

              <Link
                to="/success-analytics"
                className="flex items-center px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <span className="ml-3">🎯</span>
                تحليلات أنماط النجاح
              </Link>

              <Link
                to="/pattern-management"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🔧</span>
                إدارة الأنماط
              </Link>

              {/* قسم الإدارة المتقدمة */}
              <div className="mt-6 mb-2">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  🎛️ الإدارة المتقدمة
                </h3>
              </div>

              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
              >
                <span className="ml-3">🎛️</span>
                لوحة التحكم الإدارية
              </Link>

              <Link
                to="/admin/ai-management"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">🤖</span>
                إدارة الذكاء الاصطناعي
              </Link>

              {/* Learning Control Link - REMOVED */}

              <Link
                to="/monitoring"
                className="flex items-center px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <span className="ml-3">📊</span>
                مراقبة النظام
              </Link>

              <Link
                to="/alert-settings"
                className="flex items-center px-4 py-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <span className="ml-3">🔔</span>
                إعدادات التنبيهات
              </Link>

              <Link
                to="/reports"
                className="flex items-center px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <span className="ml-3">📊</span>
                التقارير والتحليلات
              </Link>

              <Link
                to="/quality"
                className="flex items-center px-4 py-2 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-800"
              >
                <span className="ml-3">👍</span>
                جودة الردود
              </Link>
              <Link
                to="/quality-advanced"
                className="flex items-center px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800"
              >
                <span className="ml-3">📊</span>
                لوحة الجودة المتقدمة
              </Link>
              <Link
                to="/ai-quality"
                className="flex items-center px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <span className="ml-3">🤖</span>
                التقييم الذكي
              </Link>

              <Link
                to="/admin/performance-monitor"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📈</span>
                مراقبة الأداء
              </Link>

              {/* لوحة التحكم الرئيسية */}
              <Link
                to="/company-dashboard"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">📊</span>
                لوحة التحكم
              </Link>

              {/* قسم الإدارة - يظهر للمديرين فقط */}
              {user?.role === 'SUPER_ADMIN' && (
                <>
                  <div className="mt-6 mb-2">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      🏛️ إدارة النظام
                    </h3>
                  </div>

                  <Link
                    to="/companies"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <span className="ml-3">🏢</span>
                    إدارة الشركات
                  </Link>
                </>
              )}

              {/* قسم إدارة الشركة - يظهر لمديري الشركات */}
              {(user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <>
                  <div className="mt-6 mb-2">
                    <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      👥 إدارة الشركة
                    </h3>
                  </div>

                  <Link
                    to="/users"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <span className="ml-3">👤</span>
                    إدارة المستخدمين
                  </Link>

                  <Link
                    to="/roles"
                    className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <span className="ml-3">🔐</span>
                    إدارة الأدوار والصلاحيات
                  </Link>
                </>
              )}

              <a
                href="/settings"
                className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <span className="ml-3">⚙️</span>
                الإعدادات
              </a>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  مرحباً بك
                </h2>
                <div className="flex items-center space-x-4 space-x-reverse">
                  {/* Notifications */}
                  <NotificationDropdown />

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      className="flex items-center space-x-2 space-x-reverse text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-2"
                    >
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-700">
                          {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="hidden md:block text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</div>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileMenuOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">
                            <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">{user?.company?.name}</div>
                          </div>

                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <UserCircleIcon className="h-4 w-4 ml-2" />
                            الملف الشخصي
                          </Link>

                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <Cog6ToothIcon className="h-4 w-4 ml-2" />
                            الإعدادات
                          </Link>

                          <div className="border-t border-gray-100 dark:border-gray-700">
                            <button
                              onClick={handleLogout}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <ArrowRightOnRectangleIcon className="h-4 w-4 ml-2" />
                              تسجيل الخروج
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Overlay for dropdown */}
          {isProfileMenuOpen && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsProfileMenuOpen(false)}
            />
          )}

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
