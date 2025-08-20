#!/bin/bash
# سكريبت استعادة النسخ الاحتياطية
echo "🔄 استعادة النسخ الاحتياطية..."

cp "E:\new chat bot\test-chat\x\backend\src\index.ts.backup.1755423385681" "E:\new chat bot\test-chat\x\backend\src\index.ts"
cp "E:\new chat bot\test-chat\x\backend\src\routes\adminAnalyticsRoutes.js.backup.1755423385688" "E:\new chat bot\test-chat\x\backend\src\routes\adminAnalyticsRoutes.js"
cp "E:\new chat bot\test-chat\x\backend\src\routes\notifications.js.backup.1755423385692" "E:\new chat bot\test-chat\x\backend\src\routes\notifications.js"
cp "E:\new chat bot\test-chat\x\backend\src\routes\productRoutes.js.backup.1755423385695" "E:\new chat bot\test-chat\x\backend\src\routes\productRoutes.js"
cp "E:\new chat bot\test-chat\x\backend\src\routes\walletPayment.js.backup.1755423385699" "E:\new chat bot\test-chat\x\backend\src\routes\walletPayment.js"

echo "✅ تم استعادة جميع الملفات"
