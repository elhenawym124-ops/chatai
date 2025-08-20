import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ShoppingCartIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  description?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  conversationId: string;
  onOrderCreated: (orderData: any) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  conversationId,
  onOrderCreated
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<OrderItem[]>([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // تحميل المنتجات
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/products?companyId=1&limit=100');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0],
          stock: product.stock || 0,
          description: product.description
        })));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء طلب من المحادثة
  const createOrderFromConversation = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      setCreatingOrder(true);
      
      const orderData = {
        customerId,
        conversationId,
        products: selectedProducts,
        shippingAddress: shippingAddress.trim() || undefined,
        notes: orderNotes.trim() || undefined
      };
      
      const response = await fetch('/api/v1/ai/create-order-from-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOrderSuccess(true);
        onOrderCreated(data.data);
        
        setTimeout(() => {
          setOrderSuccess(false);
          handleClose();
        }, 2000);
      } else {
        alert('فشل في إنشاء الطلب: ' + (data.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('فشل في إنشاء الطلب');
    } finally {
      setCreatingOrder(false);
    }
  };

  // إضافة منتج للطلب
  const addProductToOrder = (product: Product) => {
    const existingItem = selectedProducts.find(item => item.productId === product.id);
    
    if (existingItem) {
      setSelectedProducts(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      setSelectedProducts(prev => [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price,
        total: product.price
      }]);
    }
  };

  // إزالة منتج من الطلب
  const removeProductFromOrder = (productId: string) => {
    setSelectedProducts(prev => prev.filter(item => item.productId !== productId));
  };

  // تحديث كمية المنتج
  const updateProductQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeProductFromOrder(productId);
      return;
    }
    
    setSelectedProducts(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity, total: quantity * item.price }
        : item
    ));
  };

  // حساب إجمالي الطلب
  const calculateOrderTotal = () => {
    return selectedProducts.reduce((total, item) => total + item.total, 0);
  };

  // إغلاق المودال وإعادة تعيين البيانات
  const handleClose = () => {
    setSelectedProducts([]);
    setOrderNotes('');
    setShippingAddress('');
    setOrderSuccess(false);
    onClose();
  };

  // تحميل المنتجات عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCartIcon className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">إنشاء طلب جديد</h2>
            <span className="text-sm text-gray-500">للعميل: {customerName}</span>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[70vh]">
          {/* قائمة المنتجات */}
          <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">اختر المنتجات</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <ArrowPathIcon className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">جاري تحميل المنتجات...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-lg font-semibold text-green-600">{product.price} جنيه</span>
                          <span className="text-sm text-gray-500">المخزون: {product.stock}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addProductToOrder(product)}
                        disabled={product.stock === 0}
                        className="ml-4 p-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* تفاصيل الطلب */}
          <div className="w-1/2 p-6 overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تفاصيل الطلب</h3>
            
            {/* المنتجات المختارة */}
            <div className="space-y-3 mb-6">
              {selectedProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">لم يتم اختيار أي منتجات بعد</p>
              ) : (
                selectedProducts.map((item) => (
                  <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">{item.price} جنيه × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateProductQuantity(item.productId, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateProductQuantity(item.productId, item.quantity + 1)}
                            className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-semibold text-green-600 w-20 text-right">{item.total} جنيه</span>
                        <button
                          onClick={() => removeProductFromOrder(item.productId)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* عنوان الشحن */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الشحن (اختياري)
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="أدخل عنوان الشحن..."
              />
            </div>

            {/* ملاحظات */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ملاحظات إضافية (اختياري)
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="أي ملاحظات خاصة بالطلب..."
              />
            </div>

            {/* الإجمالي */}
            {selectedProducts.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>الإجمالي:</span>
                  <span className="text-green-600">{calculateOrderTotal()} جنيه</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            إلغاء
          </button>
          
          {orderSuccess ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              <span>تم إنشاء الطلب بنجاح!</span>
            </div>
          ) : (
            <button
              onClick={createOrderFromConversation}
              disabled={selectedProducts.length === 0 || creatingOrder}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {creatingOrder ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <ShoppingCartIcon className="h-4 w-4" />
                  إنشاء الطلب ({selectedProducts.length} منتج)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
