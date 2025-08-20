import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import {
  ChartBarIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuthSimple';

interface DashboardStats {
  totalCustomers: number;
  totalConversations: number;
  totalProducts: number;
  totalRevenue: number;
  newCustomersToday: number;
  activeConversations: number;
  pendingOrders: number;
  lowStockProducts: number;
  responseTime: string;
  conversionRate: number;
  customerSatisfaction: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'message' | 'order' | 'customer' | 'product';
  title: string;
  description: string;
  time: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 1247,
    totalConversations: 3456,
    totalProducts: 89,
    totalRevenue: 125430,
    newCustomersToday: 23,
    activeConversations: 45,
    pendingOrders: 12,
    lowStockProducts: 5,
    responseTime: '2.3 دقيقة',
    conversionRate: 3.2,
    customerSatisfaction: 4.7,
    monthlyGrowth: 12.5,
  });

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'message',
      title: 'رسالة جديدة من أحمد محمد',
      description: 'استفسار عن المنتج الجديد',
      time: 'منذ 5 دقائق',
      status: 'info',
    },
    {
      id: '2',
      type: 'order',
      title: 'طلب جديد #1234',
      description: `طلب بقيمة ${formatPrice(450)}`,
      time: 'منذ 15 دقيقة',
      status: 'success',
    },
    {
      id: '3',
      type: 'customer',
      title: 'عميل جديد: سارة أحمد',
      description: 'انضم عبر Facebook Messenger',
      time: 'منذ 30 دقيقة',
      status: 'success',
    },
    {
      id: '4',
      type: 'product',
      title: 'تنبيه مخزون منخفض',
      description: 'المنتج "جهاز لابتوب" متبقي 3 قطع',
      time: 'منذ ساعة',
      status: 'warning',
    },
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    link?: string;
  }> = ({ title, value, icon, trend, color, link }) => {
    const cardContent = (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {trend !== undefined && (
              <div className="flex items-center mt-2">
                {trend > 0 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(trend)}%
                </span>
                <span className="text-sm text-gray-500 mr-1">من الشهر الماضي</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    );

    return link ? (
      <Link to={link} className="block">
        {cardContent}
      </Link>
    ) : (
      cardContent
    );
  };

  const ActivityIcon: React.FC<{ type: string; status: string }> = ({ type, status }) => {
    const iconClass = "h-5 w-5";
    
    if (type === 'message') return <ChatBubbleLeftRightIcon className={iconClass} />;
    if (type === 'order') return <ShoppingBagIcon className={iconClass} />;
    if (type === 'customer') return <UsersIcon className={iconClass} />;
    if (type === 'product') return <ExclamationTriangleIcon className={iconClass} />;
    
    return <CheckCircleIcon className={iconClass} />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              مرحباً، {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-indigo-100 mt-1">
              إليك نظرة سريعة على أداء منصتك اليوم
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-sm text-indigo-100">الشركة</p>
              <p className="font-semibold">{user?.company?.name}</p>
              <p className="text-xs text-indigo-200 mt-1">باقة {user?.company?.plan}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalCustomers.toLocaleString()}
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          trend={stats.monthlyGrowth}
          color="bg-blue-500"
          link="/customers"
        />
        <StatCard
          title="المحادثات النشطة"
          value={stats.activeConversations}
          icon={<ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />}
          color="bg-green-500"
          link="/conversations"
        />
        <StatCard
          title="إجمالي المنتجات"
          value={stats.totalProducts}
          icon={<ShoppingBagIcon className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          link="/products"
        />
        <StatCard
          title="الإيرادات الشهرية"
          value={formatPrice(stats.totalRevenue)}
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          trend={8.2}
          color="bg-yellow-500"
          link="/reports"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">مقاييس الأداء</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">متوسط وقت الاستجابة</span>
              <span className="font-semibold text-gray-900">{stats.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل التحويل</span>
              <span className="font-semibold text-green-600">{stats.conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">رضا العملاء</span>
              <span className="font-semibold text-yellow-600">{stats.customerSatisfaction}/5</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">التنبيهات</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">مخزون منخفض</p>
                <p className="text-xs text-yellow-600">{stats.lowStockProducts} منتجات</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">طلبات معلقة</p>
                <p className="text-xs text-blue-600">{stats.pendingOrders} طلب</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات اليوم</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">عملاء جدد</span>
              <span className="font-semibold text-green-600">+{stats.newCustomersToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">محادثات جديدة</span>
              <span className="font-semibold text-blue-600">+67</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">مبيعات اليوم</span>
              <span className="font-semibold text-purple-600">{formatPrice(12450)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">النشاطات الأخيرة</h3>
            <Link
              to="/activities"
              className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center"
            >
              عرض الكل
              <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 space-x-reverse">
                <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                  <ActivityIcon type={activity.type} status={activity.status} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/customers/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <UsersIcon className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">إضافة عميل</span>
          </Link>
          <Link
            to="/products/new"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ShoppingBagIcon className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">إضافة منتج</span>
          </Link>
          <Link
            to="/conversations"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">المحادثات</span>
          </Link>
          <Link
            to="/reports"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <ChartBarIcon className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">التقارير</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
