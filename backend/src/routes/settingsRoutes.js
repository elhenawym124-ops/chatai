const express = require('express');
const router = express.Router();
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const prisma = getSharedPrismaClient();

// Mock authentication middleware
const mockAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (token === 'mock-access-token' || token.includes('mock-signature')) {
    req.user = {
      id: 'dev-user',
      email: 'dev@example.com',
      role: 'COMPANY_ADMIN',
      companyId: 'cmd5c0c9y0000ymzdd7wtv7ib'
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid token'
  });
};

// Get company settings
router.get('/company', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const companyId = req.query.companyId || req.user?.companyId || 'cmd5c0c9y0000ymzdd7wtv7ib';

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Parse settings if they exist
    let settings = {};
    try {
      settings = company.settings ? JSON.parse(company.settings) : {};
    } catch (error) {
      console.log('Error parsing company settings:', error);
      settings = {};
    }

    // Default settings with safe values
    const defaultSettings = {
      currency: 'EGP',
      currencySymbol: 'جنيه',
      language: 'ar',
      timezone: 'Africa/Cairo',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'ar-EG',
      // Add safe defaults for frontend
      autoReply: false,
      workingHours: {
        start: '09:00',
        end: '18:00'
      },
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    };

    const finalSettings = { ...defaultSettings, ...settings };

    // Ensure all nested objects exist
    if (!finalSettings.workingHours) {
      finalSettings.workingHours = defaultSettings.workingHours;
    }
    if (!finalSettings.notifications) {
      finalSettings.notifications = defaultSettings.notifications;
    }

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        settings: finalSettings
      }
    });

  } catch (error) {
    console.error('Error fetching company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      details: error.message
    });
  }
});

// Update company settings
router.put('/company', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const companyId = req.body.companyId || req.user?.companyId || 'cmd5c0c9y0000ymzdd7wtv7ib';
    const newSettings = req.body.settings || {};

    console.log('Updating company settings:', companyId, newSettings);

    // Get current company
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        error: 'Company not found'
      });
    }

    // Parse existing settings
    let currentSettings = {};
    try {
      currentSettings = company.settings ? JSON.parse(company.settings) : {};
    } catch (error) {
      console.log('Error parsing existing settings, starting fresh');
      currentSettings = {};
    }

    // Merge settings
    const updatedSettings = { ...currentSettings, ...newSettings };

    // Update company
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        settings: JSON.stringify(updatedSettings)
      }
    });

    console.log('Company settings updated successfully');

    await prisma.$disconnect();

    res.json({
      success: true,
      data: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        settings: updatedSettings
      },
      message: 'تم تحديث الإعدادات بنجاح'
    });

  } catch (error) {
    console.error('Error updating company settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update settings',
      details: error.message
    });
  }
});

// Currency presets
router.get('/currencies', (req, res) => {
  const currencies = [
    {
      code: 'EGP',
      name: 'جنيه مصري',
      symbol: 'جنيه',
      symbolEn: 'EGP'
    },
    {
      code: 'SAR',
      name: 'ريال سعودي',
      symbol: 'ريال',
      symbolEn: 'SAR'
    },
    {
      code: 'AED',
      name: 'درهم إماراتي',
      symbol: 'درهم',
      symbolEn: 'AED'
    },
    {
      code: 'USD',
      name: 'دولار أمريكي',
      symbol: '$',
      symbolEn: 'USD'
    }
  ];

  res.json({
    success: true,
    data: currencies
  });
});

// Get AI settings (with database fallback)
router.get('/ai', async (req, res) => {
  try {
    console.log('📥 [AI-SETTINGS] GET request received');

    // التحقق من وجود معلومات المستخدم والشركة
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب للوصول لإعدادات AI',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    const companyId = req.user.companyId;
    console.log('🏢 [AI-SETTINGS] Loading settings for company:', companyId);

    let settings = {
      qualityEvaluationEnabled: true,
      autoReplyEnabled: false,
      confidenceThreshold: 0.7,
      multimodalEnabled: true,
      ragEnabled: true,
      companyId // إضافة companyId للتحقق
    };

    // أولاً: محاولة قراءة من قاعدة البيانات
    try {

      const aiSettings = await prisma.aiSettings.findUnique({
        where: { companyId },
        select: {
          qualityEvaluationEnabled: true,
          autoReplyEnabled: true,
          confidenceThreshold: true,
          multimodalEnabled: true,
          ragEnabled: true,
          companyId: true // إضافة companyId للتحقق
        }
      });

      if (aiSettings) {
        settings = { ...settings, ...aiSettings };
        console.log('✅ [AI-SETTINGS] Loaded from database:', settings);

        res.json({
          success: true,
          data: settings
        });
        return;
      }
    } catch (dbError) {
      console.error(`❌ [AI-SETTINGS] Database error:`, dbError);
      console.log(`⚠️ [AI-SETTINGS] Database not available, using temporary system: ${dbError.message}`);
    }

    // النظام المؤقت: قراءة من ملف JSON (fallback)
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '../../temp_quality_settings.json');

    try {
      if (fs.existsSync(settingsPath)) {
        const fileContent = fs.readFileSync(settingsPath, 'utf8');
        const tempSettings = JSON.parse(fileContent);
        settings = { ...settings, ...tempSettings };
        console.log('✅ [AI-SETTINGS] Loaded from file:', settings);
      } else {
        console.log('🔧 [AI-SETTINGS] No settings file found, using defaults');
        // إنشاء الملف بالإعدادات الافتراضية
        const defaultSettings = {
          qualityEvaluationEnabled: true,
          autoReplyEnabled: false,
          confidenceThreshold: 0.7,
          multimodalEnabled: true,
          ragEnabled: true,
          createdAt: new Date().toISOString()
        };
        fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
        settings = { ...settings, ...defaultSettings };
        console.log('✅ [AI-SETTINGS] Created default settings file');
      }
    } catch (fileError) {
      console.error('❌ [AI-SETTINGS] File error:', fileError.message);
      console.log('🔧 [AI-SETTINGS] Using hardcoded defaults');
    }

    const response = {
      success: true,
      data: settings
    };

    console.log('📤 [AI-SETTINGS] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [AI-SETTINGS] Error fetching AI settings:', error.message);
    console.error('❌ [AI-SETTINGS] Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch AI settings',
      details: error.message
    });
  }
});

// Update AI settings (with database fallback)
router.put('/ai', async (req, res) => {
  try {
    console.log('📥 [AI-SETTINGS] Received update request:', req.body);

    // التحقق من وجود معلومات المستخدم والشركة
    if (!req.user || !req.user.companyId) {
      return res.status(403).json({
        success: false,
        message: 'معرف الشركة مطلوب لتحديث إعدادات AI',
        code: 'COMPANY_ID_REQUIRED'
      });
    }

    const companyId = req.user.companyId;
    console.log('🏢 [AI-SETTINGS] Updating settings for company:', companyId);

    const { qualityEvaluationEnabled, autoReplyEnabled, confidenceThreshold, multimodalEnabled, ragEnabled } = req.body;

    const updateData = {};
    if (qualityEvaluationEnabled !== undefined) updateData.qualityEvaluationEnabled = qualityEvaluationEnabled;
    if (autoReplyEnabled !== undefined) updateData.autoReplyEnabled = autoReplyEnabled;
    if (confidenceThreshold !== undefined) updateData.confidenceThreshold = confidenceThreshold;
    if (multimodalEnabled !== undefined) updateData.multimodalEnabled = multimodalEnabled;
    if (ragEnabled !== undefined) updateData.ragEnabled = ragEnabled;

    // أولاً: محاولة حفظ في قاعدة البيانات
    try {
      const aiSettings = await prisma.aiSettings.upsert({
        where: { companyId },
        update: updateData,
        create: {
          companyId,
          qualityEvaluationEnabled: qualityEvaluationEnabled !== false,
          autoReplyEnabled: autoReplyEnabled || false,
          confidenceThreshold: confidenceThreshold || 0.7,
          multimodalEnabled: multimodalEnabled !== false,
          ragEnabled: ragEnabled !== false
        }
      });

      console.log('✅ [AI-SETTINGS] Updated in database:', aiSettings);

      res.json({
        success: true,
        data: {
          ...updateData,
          updatedAt: new Date().toISOString()
        },
        message: 'AI settings updated successfully in database'
      });
      return;
    } catch (dbError) {
      console.log(`⚠️ [AI-SETTINGS] Database not available, using temporary system: ${dbError.message}`);
    }

    // النظام المؤقت: حفظ في ملف JSON (fallback)
    const fs = require('fs');
    const path = require('path');
    const settingsPath = path.join(__dirname, '../../temp_quality_settings.json');

    const settings = {
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    console.log('💾 [AI-SETTINGS] Writing to file:', settingsPath);
    console.log('📝 [AI-SETTINGS] Settings to save:', settings);

    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

    // Verify file was written
    if (fs.existsSync(settingsPath)) {
      const savedContent = fs.readFileSync(settingsPath, 'utf8');
      console.log('✅ [AI-SETTINGS] File saved successfully:', savedContent);
    }

    console.log(`✅ [AI-SETTINGS] Updated settings:`, settings);

    const response = {
      success: true,
      data: settings,
      message: 'AI settings updated successfully'
    };

    console.log('📤 [AI-SETTINGS] Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ [AI-SETTINGS] Error updating AI settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update AI settings'
    });
  }
});

module.exports = router;
