-- إضافة حقل التحكم في التقييم الذكي
-- Add quality evaluation control field

-- إضافة العمود الجديد
ALTER TABLE ai_settings 
ADD COLUMN qualityEvaluationEnabled BOOLEAN DEFAULT TRUE;

-- تحديث الإعدادات الموجودة لتفعيل التقييم افتراضياً
UPDATE ai_settings 
SET qualityEvaluationEnabled = TRUE 
WHERE qualityEvaluationEnabled IS NULL;

-- التأكد من أن العمود لا يقبل NULL
ALTER TABLE ai_settings 
MODIFY COLUMN qualityEvaluationEnabled BOOLEAN NOT NULL DEFAULT TRUE;

-- عرض النتيجة
SELECT id, companyId, qualityEvaluationEnabled, createdAt, updatedAt 
FROM ai_settings 
LIMIT 5;
