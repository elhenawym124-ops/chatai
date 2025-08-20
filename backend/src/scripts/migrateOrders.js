const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateOrdersFromFiles() {
    console.log('🚀 بدء نقل الطلبات من الملفات إلى قاعدة البيانات...');
    
    const ordersDir = path.join(__dirname, '../../orders');
    
    if (!fs.existsSync(ordersDir)) {
        console.log('❌ مجلد الطلبات غير موجود');
        return;
    }
    
    const files = fs.readdirSync(ordersDir).filter(file => file.endsWith('.json'));
    console.log(`📁 تم العثور على ${files.length} ملف طلب`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
        try {
            const filePath = path.join(ordersDir, file);
            const orderData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            // تحقق من وجود الطلب في قاعدة البيانات
            const existingOrder = await prisma.order.findUnique({
                where: { orderNumber: orderData.orderNumber }
            });
            
            if (existingOrder) {
                console.log(`⏭️  تم تخطي الطلب ${orderData.orderNumber} - موجود بالفعل`);
                skippedCount++;
                continue;
            }
            
            // البحث عن العميل أو إنشاؤه
            let customer = await prisma.customer.findFirst({
                where: { 
                    OR: [
                        { name: orderData.customerName },
                        { phone: orderData.customerPhone || '' }
                    ]
                }
            });
            
            if (!customer) {
                // إنشاء عميل جديد
                customer = await prisma.customer.create({
                    data: {
                        name: orderData.customerName || 'عميل غير محدد',
                        phone: orderData.customerPhone || '',
                        email: orderData.customerEmail || '',
                        companyId: 'cmdt8nrjq003vufuss47dqc45' // Company ID الافتراضي
                    }
                });
            }
            
            // إنشاء الطلب في قاعدة البيانات
            const newOrder = await prisma.order.create({
                data: {
                    orderNumber: orderData.orderNumber,
                    customerId: customer.id,
                    total: orderData.total || 0,
                    subtotal: orderData.subtotal || 0,
                    tax: orderData.tax || 0,
                    shipping: orderData.shipping || 0,
                    status: orderData.status || 'pending',
                    paymentStatus: orderData.paymentStatus || 'pending',
                    paymentMethod: orderData.paymentMethod || 'cash_on_delivery',
                    shippingAddress: orderData.shippingAddress || {},
                    trackingNumber: orderData.trackingNumber,
                    notes: orderData.notes || '',
                    createdAt: new Date(orderData.createdAt || Date.now()),
                    updatedAt: new Date(orderData.updatedAt || Date.now()),
                    
                    // إضافة معلومات النظام المحسن
                    extractionMethod: 'file_migration',
                    confidence: 0.8,
                    sourceType: 'migrated',
                    conversationId: orderData.items?.[0]?.metadata?.conversationId || null
                }
            });
            
            // إضافة عناصر الطلب
            if (orderData.items && orderData.items.length > 0) {
                for (const item of orderData.items) {
                    await prisma.orderItem.create({
                        data: {
                            orderId: newOrder.id,
                            productName: item.name || 'منتج غير محدد',
                            productColor: item.metadata?.color || '',
                            productSize: item.metadata?.size || '',
                            price: item.price || 0,
                            quantity: item.quantity || 1,
                            total: item.total || (item.price * item.quantity) || 0
                        }
                    });
                }
            }
            
            console.log(`✅ تم نقل الطلب ${orderData.orderNumber} بنجاح`);
            migratedCount++;
            
        } catch (error) {
            console.error(`❌ خطأ في نقل الطلب ${file}:`, error.message);
            errorCount++;
        }
    }
    
    console.log('\n📊 ملخص النقل:');
    console.log(`✅ تم نقل: ${migratedCount} طلب`);
    console.log(`⏭️  تم تخطي: ${skippedCount} طلب`);
    console.log(`❌ أخطاء: ${errorCount} طلب`);
    
    await prisma.$disconnect();
}

// تشغيل النقل
if (require.main === module) {
    migrateOrdersFromFiles()
        .then(() => {
            console.log('🎉 انتهى نقل الطلبات بنجاح!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ خطأ في نقل الطلبات:', error);
            process.exit(1);
        });
}

module.exports = { migrateOrdersFromFiles };
