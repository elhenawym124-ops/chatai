import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuthSimple';
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';

interface NotificationItem {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success' | 'test';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  silent?: boolean;
  customerId?: string;
  errorType?: string;
  metadata?: any;
}

const Notifications: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // الحصول على الـ token من localStorage مباشرة
  const getToken = () => localStorage.getItem('accessToken');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    console.log('🔍 [NotificationsPage] Fetching notifications...');
    console.log('🔍 [NotificationsPage] User:', user?.email);
    console.log('🔍 [NotificationsPage] IsAuthenticated:', isAuthenticated);

    if (!user || !isAuthenticated) {
      console.log('🔐 [NotificationsPage] User not authenticated, stopping');
      setLoading(false);
      return;
    }

    const token = getToken();
    console.log('🔍 [NotificationsPage] Token exists:', !!token);
    console.log('🔍 [NotificationsPage] Token preview:', token ? token.substring(0, 20) + '...' : 'null');

    if (!token) {
      console.log('🔐 [NotificationsPage] No token found');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 [NotificationsPage] Making API request...');
      const response = await fetch('http://localhost:3001/api/v1/notifications/recent?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔍 [NotificationsPage] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [NotificationsPage] Notifications received:', data.notifications?.length || 0);
        console.log('📋 [NotificationsPage] Notifications data:', data);
        setNotifications(data.notifications || []);
      } else {
        console.error('❌ [NotificationsPage] Failed to fetch notifications:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ [NotificationsPage] Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/v1/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'test':
        return <BellSolidIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'test':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' || 
      (filter === 'read' && notification.isRead) || 
      (filter === 'unread' && !notification.isRead);
    
    const matchesTypeFilter = typeFilter === 'all' || notification.type === typeFilter;
    
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <BellSolidIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-gray-600">
                  إجمالي الإشعارات: {notifications.length} | غير مقروءة: {unreadCount}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 space-x-reverse"
              >
                <CheckIcon className="h-5 w-5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Read Status Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm font-medium text-gray-700">الحالة:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                <option value="unread">غير مقروءة</option>
                <option value="read">مقروءة</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2 space-x-reverse">
              <label className="text-sm font-medium text-gray-700">النوع:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">الكل</option>
                <option value="info">معلومات</option>
                <option value="success">نجاح</option>
                <option value="warning">تحذير</option>
                <option value="error">خطأ</option>
                <option value="test">تجريبي</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <BellIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إشعارات</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات متاحة'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50 transition-colors duration-200 ${
                    !notification.isRead ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 space-x-reverse mb-2">
                            <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(notification.type)}`}>
                              {notification.type === 'test' ? 'تجريبي' : 
                               notification.type === 'success' ? 'نجاح' :
                               notification.type === 'error' ? 'خطأ' :
                               notification.type === 'warning' ? 'تحذير' : 'معلومات'}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-500">
                            <span>
                              {new Date(notification.timestamp).toLocaleString('ar-EG')}
                            </span>
                            {notification.isRead && (
                              <span className="flex items-center space-x-1 space-x-reverse">
                                <CheckIcon className="h-4 w-4" />
                                <span>مقروء</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 space-x-reverse mr-4">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                              title="تحديد كمقروء"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                            title="حذف الإشعار"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
