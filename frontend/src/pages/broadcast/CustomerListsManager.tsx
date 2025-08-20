import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import {
  PlusIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { broadcastService, CustomerList } from '../../services/broadcastService';
import { useDateFormat } from '../../hooks/useDateFormat';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastActivity: string;
  totalSpent: number;
  location: string;
  status: 'active' | 'inactive';
}

const CustomerListsManager: React.FC = () => {
  const { formatPrice } = useCurrency();
  const { formatDate } = useDateFormat();
  const [customerLists, setCustomerLists] = useState<CustomerList[]>([]);
  const [selectedList, setSelectedList] = useState<CustomerList | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomerLists();
  }, []);

  const loadCustomerLists = async () => {
    try {
      setLoading(true);
      
      // Load customer lists from API
      const lists = await broadcastService.getCustomerLists();
      setCustomerLists(lists);
    } catch (error) {
      console.error('Error loading customer lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomersInList = async (listId: string) => {
    try {
      // Load customers from selected list via API
      const customers = await broadcastService.getCustomersInList(listId);
      setCustomers(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleViewList = (list: CustomerList) => {
    setSelectedList(list);
    loadCustomersInList(list.id);
  };

  const handleDeleteList = async (listId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه القائمة؟')) {
      try {
        // Mock API call - replace with actual implementation
        setCustomerLists(prev => prev.filter(list => list.id !== listId));
      } catch (error) {
        console.error('Error deleting list:', error);
      }
    }
  };

  const getCriteriaText = (criteria: CustomerList['criteria']) => {
    switch (criteria.type) {
      case 'all':
        return 'جميع العملاء المسجلين';
      case 'active':
        return `آخر نشاط خلال ${criteria.lastActivity}`;
      case 'inactive':
        return `غير نشط لأكثر من ${criteria.lastActivity}`;
      case 'high_value':
        return `إجمالي المشتريات > ${criteria.totalSpent?.min} ريال`;
      case 'cart_abandoners':
        return `عربة متروكة > ${criteria.lastActivity}`;
      case 'custom':
        return criteria.location ? `الموقع: ${criteria.location.join(', ')}` : 'شروط مخصصة';
      default:
        return 'غير محدد';
    }
  };

  const filteredLists = Array.isArray(customerLists) ? customerLists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedList ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                إدارة قوائم العملاء
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                إنشاء وإدارة قوائم العملاء للحملات المستهدفة
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              قائمة جديدة
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pr-10 border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="البحث في القوائم..."
            />
          </div>

          {/* Lists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLists.map((list) => (
              <div
                key={list.id}
                className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-6 w-6 text-indigo-500 ml-2" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {list.name}
                      </h3>
                    </div>
                    {list.isDefault && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        افتراضية
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {list.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{list.count.toLocaleString()} عميل</span>
                    <span>{list.updatedAt ? formatDate(list.updatedAt) : 'غير محدد'}</span>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    المعايير: {getCriteriaText(list.criteria)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleViewList(list)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeIcon className="h-4 w-4 ml-1" />
                      عرض
                    </button>
                    
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => {
                          setSelectedList(list);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {!list.isDefault && (
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredLists.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                لا توجد قوائم
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'لم يتم العثور على قوائم تطابق البحث' : 'ابدأ بإنشاء قائمة عملاء جديدة'}
              </p>
            </div>
          )}
        </>
      ) : (
        /* Customer List Details */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedList(null)}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                ←
              </button>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  {selectedList.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedList.count.toLocaleString()} عميل • {getCriteriaText(selectedList.criteria)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
                تصدير
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                <FunnelIcon className="h-4 w-4 ml-2" />
                تصفية
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      العميل
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      البريد الإلكتروني
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الهاتف
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      آخر نشاط
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      إجمالي المشتريات
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الموقع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {customer.name.charAt(0)}
                            </span>
                          </div>
                          <div className="mr-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(customer.lastActivity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatPrice(customer.totalSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {customer.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.status === 'active' 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-gray-800 bg-gray-100'
                        }`}>
                          {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal Placeholders */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">إنشاء قائمة جديدة</h3>
              <p className="text-sm text-gray-500 mt-2">هذه الميزة قيد التطوير</p>
              <div className="mt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">تعديل القائمة</h3>
              <p className="text-sm text-gray-500 mt-2">هذه الميزة قيد التطوير</p>
              <div className="mt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedList(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListsManager;
