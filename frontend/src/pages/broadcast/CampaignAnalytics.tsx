import React, { useState, useEffect } from 'react';
import { useDateFormat } from '../../hooks/useDateFormat';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  sentAt: string;
  recipientCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  unsubscribedCount: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  unsubscribeRate: number;
  revenue?: number;
  conversions?: number;
}

interface AnalyticsData {
  totalCampaigns: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalRevenue: number;
  bestPerformingTime: string;
  campaignMetrics: CampaignMetrics[];
  timeSeriesData: {
    date: string;
    campaigns: number;
    opens: number;
    clicks: number;
    revenue: number;
  }[];
}

const CampaignAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [loading, setLoading] = useState(true);
  const { formatDate } = useDateFormat();

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalCampaigns: 15,
        totalRecipients: 8750,
        averageOpenRate: 58.3,
        averageClickRate: 11.2,
        totalRevenue: 45600,
        bestPerformingTime: '10:00 صباحاً',
        campaignMetrics: [
          {
            campaignId: '1',
            campaignName: 'عرض الجمعة البيضاء',
            sentAt: '2024-01-15T10:00:00Z',
            recipientCount: 1250,
            deliveredCount: 1235,
            openedCount: 847,
            clickedCount: 156,
            repliedCount: 23,
            unsubscribedCount: 5,
            deliveryRate: 98.8,
            openRate: 68.6,
            clickRate: 12.5,
            replyRate: 1.8,
            unsubscribeRate: 0.4,
            revenue: 15600,
            conversions: 45,
          },
          {
            campaignId: '2',
            campaignName: 'إطلاق منتج جديد',
            sentAt: '2024-01-10T09:00:00Z',
            recipientCount: 2100,
            deliveredCount: 2087,
            openedCount: 1439,
            clickedCount: 258,
            repliedCount: 41,
            unsubscribedCount: 8,
            deliveryRate: 99.4,
            openRate: 68.5,
            clickRate: 12.3,
            replyRate: 2.0,
            unsubscribeRate: 0.4,
            revenue: 22400,
            conversions: 67,
          },
          {
            campaignId: '3',
            campaignName: 'تذكير بالعربة المتروكة',
            sentAt: '2024-01-12T15:30:00Z',
            recipientCount: 450,
            deliveredCount: 445,
            openedCount: 201,
            clickedCount: 39,
            repliedCount: 7,
            unsubscribedCount: 2,
            deliveryRate: 98.9,
            openRate: 45.2,
            clickRate: 8.7,
            replyRate: 1.6,
            unsubscribeRate: 0.4,
            revenue: 7600,
            conversions: 18,
          },
        ],
        timeSeriesData: [
          { date: '2024-01-08', campaigns: 1, opens: 234, clicks: 45, revenue: 3200 },
          { date: '2024-01-09', campaigns: 0, opens: 0, clicks: 0, revenue: 0 },
          { date: '2024-01-10', campaigns: 1, opens: 1439, clicks: 258, revenue: 22400 },
          { date: '2024-01-11', campaigns: 0, opens: 0, clicks: 0, revenue: 0 },
          { date: '2024-01-12', campaigns: 1, opens: 201, clicks: 39, revenue: 7600 },
          { date: '2024-01-13', campaigns: 0, opens: 0, clicks: 0, revenue: 0 },
          { date: '2024-01-14', campaigns: 0, opens: 0, clicks: 0, revenue: 0 },
          { date: '2024-01-15', campaigns: 1, opens: 847, clicks: 156, revenue: 15600 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (rate: number, type: 'open' | 'click' | 'reply') => {
    const thresholds = {
      open: { good: 50, excellent: 70 },
      click: { good: 8, excellent: 15 },
      reply: { good: 1, excellent: 3 },
    };

    const threshold = thresholds[type];
    if (rate >= threshold.excellent) return 'text-green-600 bg-green-100';
    if (rate >= threshold.good) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد بيانات</h3>
        <p className="mt-1 text-sm text-gray-500">لم يتم العثور على بيانات إحصائية</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          إحصائيات الحملات
        </h3>
        <div className="flex items-center space-x-2 space-x-reverse">
          <label className="text-sm text-gray-500">الفترة:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d')}
            className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="7d">آخر 7 أيام</option>
            <option value="30d">آخر 30 يوم</option>
            <option value="90d">آخر 90 يوم</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي الحملات
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {analyticsData.totalCampaigns}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي المستلمين
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {analyticsData.totalRecipients.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    متوسط معدل الفتح
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {analyticsData.averageOpenRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    إجمالي الإيرادات
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCurrency(analyticsData.totalRevenue)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            رؤى الأداء
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {analyticsData.bestPerformingTime}
              </div>
              <div className="text-sm text-gray-500">أفضل وقت للإرسال</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.averageClickRate}%
              </div>
              <div className="text-sm text-gray-500">متوسط معدل النقر</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.campaignMetrics.reduce((sum, c) => sum + (c.conversions || 0), 0)}
              </div>
              <div className="text-sm text-gray-500">إجمالي التحويلات</div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            أداء الحملات
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            تفاصيل أداء كل حملة على حدة
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الحملة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  المستلمون
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  معدل التسليم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  معدل الفتح
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  معدل النقر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإيرادات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  التحويلات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.campaignMetrics.map((campaign) => (
                <tr key={campaign.campaignId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {campaign.campaignName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(campaign.sentAt)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {campaign.recipientCount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      campaign.deliveryRate >= 98 ? 'text-green-800 bg-green-100' : 
                      campaign.deliveryRate >= 95 ? 'text-yellow-800 bg-yellow-100' : 
                      'text-red-800 bg-red-100'
                    }`}>
                      {campaign.deliveryRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(campaign.openRate, 'open')}`}>
                      {campaign.openRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPerformanceColor(campaign.clickRate, 'click')}`}>
                      {campaign.clickRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {campaign.revenue ? formatCurrency(campaign.revenue) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {campaign.conversions || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Series Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            اتجاهات الأداء
          </h3>
          <div className="text-center py-12">
            <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              الرسوم البيانية قيد التطوير
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              ستتوفر الرسوم البيانية التفاعلية قريباً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
