-- إضافة حقل useAdvancedTools إلى جدول ai_settings
ALTER TABLE ai_settings 
ADD COLUMN useAdvancedTools BOOLEAN DEFAULT FALSE AFTER memorySettings;
