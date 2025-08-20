import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useAuth } from '../../hooks/useAuthSimple';
import {
  ArrowLeftIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  city?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  paymentMethod: string;
  items: Array<{
    id: string;
    productId?: string;
    productName: string;
    productColor?: string;
    productSize?: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  confidence?: number;
  extractionMethod?: string;
  conversationId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: string;
    notes?: string;
    createdAt: string;
    updatedBy?: string;
  }>;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { formatDate } = useDateFormat();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    if (!id) return;

    // انتظار انتهاء تحميل المصادقة
    if (authLoading) {
      console.log('⏳ Waiting for auth to load...');
      return;
    }

    // التحقق من المصادقة
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login...');
      window.location.href = '/auth/login';
      return;
    }

    console.log('✅ User authenticated, fetching order details...');
    fetchOrderDetails();
  }, [id, authLoading, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/v1/orders-enhanced/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setOrder(data.data);
      } else {
        console.error('فشل في جلب تفاصيل الطلب:', data.message);
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الطلب:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async () => {
    if (!newStatus || !order) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:3001/api/v1/orders-enhanced/${order.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: statusNotes || `تم تحديث الحالة إلى ${getStatusText(newStatus)}`
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchOrderDetails(); // إعادة تحميل البيانات
        setShowStatusModal(false);
        setNewStatus('');
        setStatusNotes('');
      } else {
        alert('فشل في تحديث حالة الطلب');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الطلب:', error);
      alert('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'في الانتظار',
      'CONFIRMED': 'مؤكد',
      'PROCESSING': 'قيد المعالجة',
      'SHIPPED': 'تم الشحن',
      'DELIVERED': 'تم التسليم',
      'CANCELLED': 'ملغي'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'PENDING': <ClockIcon className="h-5 w-5" />,
      'CONFIRMED': <CheckCircleIcon className="h-5 w-5" />,
      'PROCESSING': <PencilIcon className="h-5 w-5" />,
      'SHIPPED': <TruckIcon className="h-5 w-5" />,
      'DELIVERED': <CheckCircleIcon className="h-5 w-5" />,
      'CANCELLED': <XCircleIcon className="h-5 w-5" />
    };
    return iconMap[status] || <InformationCircleIcon className="h-5 w-5" />;
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence?: number) => {
    if (!confidence) return <InformationCircleIcon className="h-4 w-4" />;
    if (confidence >= 0.8) return <StarIcon className="h-4 w-4" />;
    return <ExclamationTriangleIcon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">الطلب غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على الطلب المطلوب</p>
          <Link
            to="/orders/enhanced"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeftIcon className="h-4 w-4 ml-2" />
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/orders/enhanced')}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <ShoppingBagIcon className="h-8 w-8 text-indigo-600 ml-3" />
                تفاصيل الطلب {order.orderNumber}
              </h1>
              <p className="mt-2 text-gray-600">
                تم الإنشاء في {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PencilIcon className="h-4 w-4 ml-2" />
              تحديث الحالة
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <PrinterIcon className="h-4 w-4 ml-2" />
              طباعة
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">حالة الطلب</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="mr-2">{getStatusText(order.status)}</span>
                </span>
                {order.extractionMethod && (
                  <span className="mr-3 text-sm text-gray-500">
                    {order.extractionMethod === 'ai_enhanced' ? '🤖 ذكاء اصطناعي محسن' :
                     order.extractionMethod === 'ai_data_collection' ? '🤖 جمع بيانات ذكي' :
                     order.extractionMethod === 'ai_basic' ? '🤖 ذكاء اصطناعي أساسي' :
                     order.extractionMethod === 'manual' ? '✋ يدوي' : order.extractionMethod}
                  </span>
                )}
              </div>
              
              {order.confidence && (
                <div className={`flex items-center ${getConfidenceColor(order.confidence)}`}>
                  {getConfidenceIcon(order.confidence)}
                  <span className="mr-1 text-sm font-medium">
                    {(order.confidence * 100).toFixed(1)}% ثقة
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">المنتجات</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.productName}</h4>
                    <div className="mt-1 text-sm text-gray-500 space-x-4 space-x-reverse">
                      {item.productColor && <span>اللون: {item.productColor}</span>}
                      {item.productSize && <span>المقاس: {item.productSize}</span>}
                      <span>الكمية: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {formatPrice(item.total, order.currency)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatPrice(item.price, order.currency)} × {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-medium">{formatPrice(order.subtotal, order.currency)}</span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الضرائب:</span>
                    <span className="font-medium">{formatPrice(order.tax, order.currency)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">الشحن:</span>
                    <span className="font-medium">{formatPrice(order.shipping, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>الإجمالي:</span>
                  <span>{formatPrice(order.total, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تاريخ الحالات</h3>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3 space-x-reverse">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(history.status)}`}>
                      {getStatusIcon(history.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getStatusText(history.status)}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(history.createdAt)}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="mt-1 text-sm text-gray-600">{history.notes}</p>
                      )}
                      {history.updatedBy && (
                        <p className="mt-1 text-xs text-gray-500">بواسطة: {history.updatedBy}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Customer Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 ml-2" />
              معلومات العميل
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">الاسم</label>
                <p className="mt-1 text-sm text-gray-900">{order.customerName || 'غير محدد'}</p>
              </div>

              {order.customerPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">رقم الهاتف</label>
                  <div className="mt-1 flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 ml-2" />
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      {order.customerPhone}
                    </a>
                  </div>
                </div>
              )}

              {order.customerEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500">البريد الإلكتروني</label>
                  <p className="mt-1 text-sm text-gray-900">{order.customerEmail}</p>
                </div>
              )}

              {order.customerAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-500">العنوان</label>
                  <div className="mt-1 flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 ml-2 mt-0.5" />
                    <div className="text-sm text-gray-900">
                      <p>{order.customerAddress}</p>
                      {order.city && <p className="text-gray-600">{order.city}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="h-5 w-5 text-gray-400 ml-2" />
              معلومات الدفع
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">حالة الدفع</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'PAID' ? 'مدفوع' :
                     order.paymentStatus === 'FAILED' ? 'فشل' : 'في الانتظار'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">طريقة الدفع</label>
                <p className="mt-1 text-sm text-gray-900">{order.paymentMethod || 'غير محدد'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">المبلغ الإجمالي</label>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {formatPrice(order.total, order.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Conversation Link */}
          {order.conversationId && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-400 ml-2" />
                المحادثة
              </h3>
              <button
                onClick={() => {
                  const url = `/conversations-improved?conversationId=${order.conversationId}`;
                  console.log('🔗 Opening conversation from order details:', url);
                  console.log('📋 Conversation ID:', order.conversationId);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 cursor-pointer"
                title="عرض المحادثة الأصلية (نافذة جديدة)"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 ml-2" />
                عرض المحادثة الأصلية
              </button>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">ملاحظات</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">تحديث حالة الطلب</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة الجديدة
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">اختر الحالة</option>
                  <option value="PENDING">في الانتظار</option>
                  <option value="CONFIRMED">مؤكد</option>
                  <option value="PROCESSING">قيد المعالجة</option>
                  <option value="SHIPPED">تم الشحن</option>
                  <option value="DELIVERED">تم التسليم</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="أضف ملاحظات حول تحديث الحالة..."
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus('');
                    setStatusNotes('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  إلغاء
                </button>
                <button
                  onClick={updateOrderStatus}
                  disabled={!newStatus || updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'جاري التحديث...' : 'تحديث الحالة'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
