import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

interface DashboardData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    conversionRate: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
  };
  salesTrends: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  customerAnalytics: {
    newCustomers: Array<{
      date: string;
      newCustomers: number;
      returningCustomers: number;
    }>;
    customerSegments: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    topCustomers: Array<{
      name: string;
      orders: number;
      revenue: number;
    }>;
  };
  productPerformance: {
    topProducts: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
    categoryPerformance: Array<{
      name: string;
      sales: number;
      revenue: number;
    }>;
    inventoryAlerts: Array<{
      product: string;
      stock: number;
      status: string;
    }>;
  };
  conversionFunnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
  recentActivities: Array<{
    type: string;
    message: string;
    time: string;
    amount?: number;
  }>;
  kpis: Array<{
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    trend: string;
    changePercent: number;
    category: string;
  }>;
}

interface RealTimeData {
  currentVisitors: number;
  activeConversations: number;
  todayRevenue: number;
  todayOrders: number;
  conversionRate: string;
  averageOrderValue: number;
  topPages: Array<{
    page: string;
    visitors: number;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    amount: number;
    time: string;
  }>;
  systemHealth: {
    serverStatus: string;
    responseTime: number;
    uptime: string;
    errorRate: string;
  };
}

const AdvancedReports: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'customers' | 'products' | 'conversations' | 'realtime'>('overview');
  const [dateRange, setDateRange] = useState('last_30_days');

  useEffect(() => {
    fetchDashboardData();
    fetchRealTimeData();
    
    // Update real-time data every 30 seconds
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/v1/analytics/dashboard?dateRange=${dateRange}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRealTimeData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/analytics/realtime');
      const data = await response.json();
      
      if (data.success) {
        setRealTimeData(data.data);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  const generateReport = async (type: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/v1/analytics/reports/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dateTo: new Date(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('تم إنشاء التقرير بنجاح');
        // يمكن إضافة منطق لعرض التقرير أو تحميله
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('فشل في إنشاء التقرير');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-SA').format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpIcon className="h-4 w-4 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 text-red-500" />
    );
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
              التقارير والتحليلات المتقدمة
            </h1>
            <p className="mt-2 text-gray-600">تحليلات شاملة وتقارير تفاعلية لأداء الأعمال</p>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="last_7_days">آخر 7 أيام</option>
              <option value="last_30_days">آخر 30 يوم</option>
              <option value="last_90_days">آخر 90 يوم</option>
              <option value="last_year">آخر سنة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 space-x-reverse">
            {[
              { id: 'overview', name: 'نظرة عامة', icon: ChartBarIcon },
              { id: 'sales', name: 'المبيعات', icon: CurrencyDollarIcon },
              { id: 'customers', name: 'العملاء', icon: UserGroupIcon },
              { id: 'products', name: 'المنتجات', icon: ShoppingBagIcon },
              { id: 'conversations', name: 'المحادثات', icon: ChatBubbleLeftRightIcon },
              { id: 'realtime', name: 'الوقت الفعلي', icon: ClockIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData.kpis.slice(0, 4).map((kpi) => (
              <div key={kpi.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatNumber(kpi.value)} {kpi.unit}
                    </p>
                  </div>
                  <div className={`flex items-center ${getTrendColor(kpi.trend)}`}>
                    {getTrendIcon(kpi.trend)}
                    <span className="text-sm font-medium mr-1">
                      {Math.abs(kpi.changePercent)}%
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>الهدف: {formatNumber(kpi.target)} {kpi.unit}</span>
                    <span>{Math.round((kpi.value / kpi.target) * 100)}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min((kpi.value / kpi.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Trends */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">اتجاهات المبيعات</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                <p className="text-gray-500">رسم بياني للمبيعات (يتطلب مكتبة رسوم بيانية)</p>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">شرائح العملاء</h3>
              <div className="space-y-4">
                {dashboardData.customerAnalytics.customerSegments.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-indigo-500' : 
                        index === 1 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{segment.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{segment.count}</p>
                      <p className="text-xs text-gray-500">{segment.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">قمع التحويل</h3>
            <div className="space-y-4">
              {dashboardData.conversionFunnel.map((stage, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm font-medium text-gray-900">{stage.stage}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-indigo-600 h-4 rounded-full flex items-center justify-center"
                        style={{ width: `${stage.percentage}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {stage.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium text-gray-900">
                    {formatNumber(stage.count)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">الأنشطة الأخيرة</h3>
            <div className="space-y-4">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      activity.type === 'order' ? 'bg-green-500' :
                      activity.type === 'customer' ? 'bg-blue-500' :
                      activity.type === 'product' ? 'bg-yellow-500' : 'bg-indigo-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">{activity.message}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    {activity.amount && (
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Real-time Tab */}
      {activeTab === 'realtime' && realTimeData && (
        <div className="space-y-8">
          {/* Real-time Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-blue-500" />
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">الزوار الحاليون</p>
                  <p className="text-2xl font-semibold text-gray-900">{realTimeData.currentVisitors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-500" />
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">المحادثات النشطة</p>
                  <p className="text-2xl font-semibold text-gray-900">{realTimeData.activeConversations}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-yellow-500" />
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">إيرادات اليوم</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(realTimeData.todayRevenue)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingBagIcon className="h-8 w-8 text-purple-500" />
                <div className="mr-4">
                  <p className="text-sm font-medium text-gray-600">طلبات اليوم</p>
                  <p className="text-2xl font-semibold text-gray-900">{realTimeData.todayOrders}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Data */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Pages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">أكثر الصفحات زيارة</h3>
              <div className="space-y-4">
                {realTimeData.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-900">{page.page}</span>
                    <span className="text-sm font-medium text-gray-900">{page.visitors} زائر</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">الطلبات الأخيرة</h3>
              <div className="space-y-4">
                {realTimeData.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-500">منذ {order.time}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">حالة النظام</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">حالة الخادم</p>
                <p className={`text-lg font-semibold ${
                  realTimeData.systemHealth.serverStatus === 'healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {realTimeData.systemHealth.serverStatus === 'healthy' ? 'سليم' : 'خطأ'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">وقت الاستجابة</p>
                <p className="text-lg font-semibold text-gray-900">
                  {realTimeData.systemHealth.responseTime}ms
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">وقت التشغيل</p>
                <p className="text-lg font-semibold text-gray-900">
                  {realTimeData.systemHealth.uptime}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">معدل الأخطاء</p>
                <p className="text-lg font-semibold text-gray-900">
                  {realTimeData.systemHealth.errorRate}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">إنشاء التقارير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'sales', name: 'تقرير المبيعات', icon: CurrencyDollarIcon },
            { type: 'customers', name: 'تقرير العملاء', icon: UserGroupIcon },
            { type: 'products', name: 'تقرير المنتجات', icon: ShoppingBagIcon },
            { type: 'conversations', name: 'تقرير المحادثات', icon: ChatBubbleLeftRightIcon },
          ].map((report) => (
            <button
              key={report.type}
              onClick={() => generateReport(report.type)}
              className="flex items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <report.icon className="h-6 w-6 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-900">{report.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedReports;
