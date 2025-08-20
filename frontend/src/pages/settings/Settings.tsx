import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuthSimple';
import CompanySettings from './CompanySettings';
import {
  Cog6ToothIcon,
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  CreditCardIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface SettingsTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs: SettingsTab[] = [
    {
      id: 'profile',
      name: 'الملف الشخصي',
      icon: UserIcon,
      component: ProfileSettings,
    },
    {
      id: 'company',
      name: 'إعدادات الشركة',
      icon: BuildingOfficeIcon,
      component: CompanySettings,
    },
    {
      id: 'notifications',
      name: 'الإشعارات',
      icon: BellIcon,
      component: NotificationSettings,
    },
    {
      id: 'security',
      name: 'الأمان',
      icon: ShieldCheckIcon,
      component: SecuritySettings,
    },
    {
      id: 'appearance',
      name: 'المظهر',
      icon: PaintBrushIcon,
      component: AppearanceSettings,
    },
    {
      id: 'integrations',
      name: 'التكاملات',
      icon: GlobeAltIcon,
      component: IntegrationSettings,
    },
    {
      id: 'billing',
      name: 'الفواتير',
      icon: CreditCardIcon,
      component: BillingSettings,
    },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Cog6ToothIcon className="h-8 w-8 text-indigo-600 mr-3" />
          الإعدادات
        </h1>
        <p className="mt-2 text-gray-600">إدارة إعدادات الحساب والنظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">الإعدادات</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-4 py-3 text-right hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center ${
                      activeTab === tab.id ? 'bg-indigo-50 border-r-4 border-indigo-500 text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow rounded-lg">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Settings Component
const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    timezone: 'Asia/Riyadh',
    language: 'ar',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">الملف الشخصي</h2>
        <p className="text-sm text-gray-600 mt-1">إدارة معلوماتك الشخصية</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الأول
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الأخير
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رقم الهاتف
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="+966501234567"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المنطقة الزمنية
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({...formData, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Asia/Riyadh">الرياض (GMT+3)</option>
              <option value="Asia/Dubai">دبي (GMT+4)</option>
              <option value="Africa/Cairo">القاهرة (GMT+2)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اللغة
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({...formData, language: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
};

// Notification Settings Component
const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newMessages: true,
    newOrders: true,
    lowStock: true,
    systemAlerts: true,
  });

  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">إعدادات الإشعارات</h2>
        <p className="text-sm text-gray-600 mt-1">تخصيص تفضيلات الإشعارات</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">قنوات الإشعارات</h3>
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'إشعارات البريد الإلكتروني' },
              { key: 'pushNotifications', label: 'الإشعارات الفورية' },
              { key: 'smsNotifications', label: 'الرسائل النصية' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">أنواع الإشعارات</h3>
          <div className="space-y-4">
            {[
              { key: 'newMessages', label: 'رسائل جديدة' },
              { key: 'newOrders', label: 'طلبات جديدة' },
              { key: 'lowStock', label: 'تنبيهات المخزون' },
              { key: 'systemAlerts', label: 'تنبيهات النظام' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[item.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Security Settings Component
const SecuritySettings: React.FC = () => {
  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">إعدادات الأمان</h2>
        <p className="text-sm text-gray-600 mt-1">إدارة كلمة المرور والأمان</p>
      </div>

      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <ShieldCheckIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">تحديث كلمة المرور</h3>
              <p className="text-sm text-yellow-700 mt-1">
                يُنصح بتحديث كلمة المرور بانتظام لضمان أمان حسابك
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الحالية
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور الجديدة
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور الجديدة
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            تحديث كلمة المرور
          </button>
        </form>
      </div>
    </div>
  );
};

// Appearance Settings Component
const AppearanceSettings: React.FC = () => {
  const [theme, setTheme] = useState('light');

  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">إعدادات المظهر</h2>
        <p className="text-sm text-gray-600 mt-1">تخصيص مظهر المنصة</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">المظهر</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: 'light', label: 'فاتح', preview: 'bg-white border-2' },
              { value: 'dark', label: 'داكن', preview: 'bg-gray-900 border-2' },
              { value: 'auto', label: 'تلقائي', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`p-4 rounded-lg border-2 ${
                  theme === option.value ? 'border-indigo-500' : 'border-gray-200'
                }`}
              >
                <div className={`h-16 rounded ${option.preview} mb-2`}></div>
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Integration Settings Component (بدون AI)
const IntegrationSettings: React.FC = () => {
  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">التكاملات</h2>
        <p className="text-sm text-gray-600 mt-1">إدارة التكاملات مع الخدمات الخارجية</p>
      </div>

      {/* Facebook Integration */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white text-lg">📘</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Facebook Messenger</h3>
            <p className="text-sm text-gray-600">ربط صفحات الفيسبوك لاستقبال الرسائل</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">حالة الاتصال: <span className="text-green-600 font-medium">متصل</span></p>
            <p className="text-xs text-gray-500 mt-1">آخر نشاط: منذ 5 دقائق</p>
          </div>
          <a
            href="/settings/facebook"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            إدارة الإعدادات
          </a>
        </div>
      </div>

      {/* Other Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">التكاملات الأخرى</h3>
        {[
          { name: 'WhatsApp Business', status: 'غير متصل', color: 'red', link: '#', icon: '💬' },
          { name: 'Google Analytics', status: 'متصل', color: 'green', link: '#', icon: '📊' },
          { name: 'Stripe Payments', status: 'غير متصل', color: 'red', link: '#', icon: '💳' },
          { name: 'Telegram Bot', status: 'غير متصل', color: 'red', link: '#', icon: '✈️' },
        ].map((integration) => (
          <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">{integration.icon}</span>
              <div>
                <h4 className="font-medium text-gray-900">{integration.name}</h4>
                <p className={`text-sm ${integration.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                  {integration.status}
                </p>
              </div>
            </div>
            <a
              href={integration.link}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-block"
            >
              {integration.status === 'متصل' ? 'إعدادات' : 'ربط'}
            </a>
          </div>
        ))}
      </div>

      {/* Integration Note */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex">
          <span className="text-yellow-400 text-lg mr-2">💡</span>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">ملاحظة مهمة</h4>
            <p className="text-sm text-yellow-700 mt-1">
              تم إزالة تكامل الذكاء الصناعي من النظام. النظام يعمل الآن بالردود اليدوية فقط.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Billing Settings Component
const BillingSettings: React.FC = () => {
  return (
    <div className="px-6 py-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">الفواتير والدفع</h2>
        <p className="text-sm text-gray-600 mt-1">إدارة الفواتير وطرق الدفع</p>
      </div>

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CreditCardIcon className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">الاشتراك النشط</h3>
              <p className="text-sm text-green-700 mt-1">
                باقة متقدم - 299 ريال/شهر - تجديد في 15 فبراير 2024
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">الفواتير الأخيرة</h3>
          <div className="space-y-2">
            {[
              { date: '2024-01-15', amount: '299 ريال', status: 'مدفوع' },
              { date: '2023-12-15', amount: '299 ريال', status: 'مدفوع' },
              { date: '2023-11-15', amount: '299 ريال', status: 'مدفوع' },
            ].map((invoice, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <span className="font-medium">{invoice.date}</span>
                  <span className="text-gray-600 mr-4">{invoice.amount}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-600 text-sm mr-4">{invoice.status}</span>
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                    تحميل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
