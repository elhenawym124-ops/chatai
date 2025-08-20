import React, { useState, useEffect } from 'react';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useCurrency } from '../../hooks/useCurrency';
import {
  ChartBarIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface ReportData {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'customers' | 'conversations' | 'products' | 'performance';
  period: string;
  data: any[];
  lastUpdated: string;
}

const Reports: React.FC = () => {
    const { formatDate } = useDateFormat();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Mock reports data
      const mockReports: ReportData[] = [
        {
          id: '1',
          name: 'تقرير المبيعات الشهري',
          description: 'تحليل شامل للمبيعات والإيرادات خلال الشهر الماضي',
          type: 'sales',
          period: 'monthly',
          data: [
            { date: '2024-01-01', sales: 15000, orders: 45, avgOrder: 333 },
            { date: '2024-01-02', sales: 18000, orders: 52, avgOrder: 346 },
            { date: '2024-01-03', sales: 22000, orders: 61, avgOrder: 361 },
            { date: '2024-01-04', sales: 19000, orders: 48, avgOrder: 396 },
            { date: '2024-01-05', sales: 25000, orders: 67, avgOrder: 373 },
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'تقرير العملاء الجدد',
          description: 'إحصائيات العملاء الجدد ومعدلات التحويل',
          type: 'customers',
          period: 'weekly',
          data: [
            { week: 'الأسبوع 1', newCustomers: 23, conversions: 15, rate: 65.2 },
            { week: 'الأسبوع 2', newCustomers: 31, conversions: 22, rate: 71.0 },
            { week: 'الأسبوع 3', newCustomers: 28, conversions: 19, rate: 67.9 },
            { week: 'الأسبوع 4', newCustomers: 35, conversions: 26, rate: 74.3 },
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'تقرير المحادثات',
          description: 'تحليل أداء المحادثات وأوقات الاستجابة',
          type: 'conversations',
          period: 'daily',
          data: [
            { date: 'اليوم', conversations: 156, responses: 142, avgTime: '2.5 دقيقة' },
            { date: 'أمس', conversations: 134, responses: 128, avgTime: '3.1 دقيقة' },
            { date: 'قبل يومين', conversations: 178, responses: 165, avgTime: '2.8 دقيقة' },
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'تقرير أداء المنتجات',
          description: 'أفضل المنتجات مبيعاً وتحليل المخزون',
          type: 'products',
          period: 'monthly',
          data: [
            { product: 'لابتوب Dell XPS', sales: 45, revenue: 202500, stock: 15 },
            { product: 'iPhone 15 Pro', sales: 32, revenue: 134400, stock: 8 },
            { product: 'سماعات AirPods', sales: 67, revenue: 100500, stock: 23 },
            { product: 'ساعة Apple Watch', sales: 28, revenue: 84000, stock: 12 },
          ],
          lastUpdated: new Date().toISOString()
        },
        {
          id: '5',
          name: 'تقرير الأداء العام',
          description: 'مؤشرات الأداء الرئيسية للمنصة',
          type: 'performance',
          period: 'monthly',
          data: [
            { metric: 'معدل الاستجابة', value: '94.5%', change: '+2.3%' },
            { metric: 'رضا العملاء', value: '4.7/5', change: '+0.2' },
            { metric: 'معدل التحويل', value: '68.9%', change: '+5.1%' },
            { metric: 'متوسط قيمة الطلب', value: formatPrice(375), change: '+12.5%' },
          ],
          lastUpdated: new Date().toISOString()
        }
      ];

      setReports(mockReports);
      if (!selectedReport) {
        setSelectedReport(mockReports[0]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    if (!selectedReport) return;
    
    // Mock export functionality
    alert(`تم تصدير التقرير "${selectedReport.name}" بصيغة ${format.toUpperCase()}`);
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'sales':
        return <ChartBarIcon className="h-5 w-5 text-green-600" />;
      case 'customers':
        return <DocumentChartBarIcon className="h-5 w-5 text-blue-600" />;
      case 'conversations':
        return <ChartBarIcon className="h-5 w-5 text-purple-600" />;
      case 'products':
        return <DocumentChartBarIcon className="h-5 w-5 text-orange-600" />;
      case 'performance':
        return <ChartBarIcon className="h-5 w-5 text-indigo-600" />;
      default:
        return <DocumentChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'sales':
        return 'bg-green-100 text-green-800';
      case 'customers':
        return 'bg-blue-100 text-blue-800';
      case 'conversations':
        return 'bg-purple-100 text-purple-800';
      case 'products':
        return 'bg-orange-100 text-orange-800';
      case 'performance':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderReportData = (report: ReportData) => {
    switch (report.type) {
      case 'sales':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطلبات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">متوسط الطلب</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(row.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(row.sales)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(row.avgOrder)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'customers':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.data.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{item.week}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">عملاء جدد:</span>
                    <span className="font-medium">{item.newCustomers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">تحويلات:</span>
                    <span className="font-medium">{item.conversions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">معدل التحويل:</span>
                    <span className="font-medium text-green-600">{item.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'products':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المنتج</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبيعات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المخزون</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.data.map((row, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.sales} قطعة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatPrice(row.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.stock} قطعة
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return (
          <div className="text-center py-8 text-gray-500">
            لا توجد بيانات متاحة لهذا التقرير
          </div>
        );
    }
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
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <DocumentChartBarIcon className="h-8 w-8 text-indigo-600 mr-3" />
          التقارير والإحصائيات
        </h1>
        <p className="mt-2 text-gray-600">تحليل شامل لأداء المنصة والمبيعات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Reports List */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">التقارير المتاحة</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full px-4 py-4 text-right hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    selectedReport?.id === report.id ? 'bg-indigo-50 border-r-4 border-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {report.description}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${getReportTypeColor(report.type)}`}>
                        {report.period === 'daily' && 'يومي'}
                        {report.period === 'weekly' && 'أسبوعي'}
                        {report.period === 'monthly' && 'شهري'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          {selectedReport && (
            <div className="bg-white shadow rounded-lg">
              {/* Report Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedReport.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      آخر تحديث: {formatDate(selectedReport.lastUpdated)}
                    </p>
                  </div>
                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => exportReport('pdf')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      تصدير PDF
                    </button>
                    <button
                      onClick={() => exportReport('excel')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      تصدير Excel
                    </button>
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div className="px-6 py-6">
                {renderReportData(selectedReport)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
