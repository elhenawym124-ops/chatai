/**
 * Advanced APIs Testing Script
 * 
 * This script tests AI, automation, and advanced feature APIs
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class AdvancedAPIChecker {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      ai: {},
      automation: {},
      advanced: {},
      summary: {
        totalEndpoints: 0,
        workingEndpoints: 0,
        failedEndpoints: 0,
        overallStatus: 'unknown'
      },
      issues: []
    };
  }

  /**
   * Run complete advanced API check
   */
  async runAdvancedAPICheck() {
    console.log('🤖 بدء فحص APIs المتقدمة...\n');

    try {
      // Test AI endpoints
      await this.testAIEndpoints();
      
      // Test automation endpoints
      await this.testAutomationEndpoints();
      
      // Test advanced feature endpoints
      await this.testAdvancedEndpoints();
      
      // Generate report
      this.generateAdvancedAPIReport();

    } catch (error) {
      console.error('❌ خطأ في فحص APIs المتقدمة:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Advanced API check failed: ${error.message}`
      });
    }
  }

  /**
   * Test AI endpoints
   */
  async testAIEndpoints() {
    console.log('🧠 فحص نقاط الذكاء الاصطناعي...');
    
    const aiEndpoints = [
      { path: '/api/v1/ai/sentiment', name: 'Sentiment Analysis', method: 'POST', data: { text: 'I love this product!' } },
      { path: '/api/v1/ai/intent', name: 'Intent Recognition', method: 'POST', data: { message: 'I want to buy a phone' } },
      { path: '/api/v1/ai/recommendations', name: 'Product Recommendations', method: 'POST', data: { customerId: 1, context: 'purchase_history' } },
      { path: '/api/v1/ai/response', name: 'Smart Response', method: 'POST', data: { message: 'Hello, I need help', context: 'customer_support' } },
      { path: '/api/v1/ai/categorize', name: 'Message Categorization', method: 'POST', data: { message: 'I have a complaint about my order' } },
      { path: '/api/v1/ai/translate', name: 'Translation', method: 'POST', data: { text: 'Hello world', targetLanguage: 'ar' } },
      { path: '/api/v1/ai/summarize', name: 'Text Summarization', method: 'POST', data: { text: 'Long conversation text here...' } },
      { path: '/api/v1/ai/models', name: 'AI Models', method: 'GET' },
      { path: '/api/v1/ai/training', name: 'Model Training', method: 'GET' },
      { path: '/api/v1/ai/prompts', name: 'AI Prompts', method: 'GET' }
    ];
    
    for (const endpoint of aiEndpoints) {
      await this.testEndpoint('ai', endpoint);
    }
    
    console.log();
  }

  /**
   * Test automation endpoints
   */
  async testAutomationEndpoints() {
    console.log('🔄 فحص نقاط الأتمتة...');
    
    const automationEndpoints = [
      { path: '/api/v1/automation/rules', name: 'Automation Rules', method: 'GET' },
      { path: '/api/v1/automation/escalation', name: 'Escalation Rules', method: 'GET' },
      { path: '/api/v1/automation/follow-up', name: 'Follow-up Automation', method: 'GET' },
      { path: '/api/v1/automation/distribution', name: 'Conversation Distribution', method: 'GET' },
      { path: '/api/v1/automation/campaigns', name: 'Campaign Automation', method: 'GET' },
      { path: '/api/v1/automation/scenarios', name: 'Automation Scenarios', method: 'GET' },
      { path: '/api/v1/automation/triggers', name: 'Automation Triggers', method: 'GET' },
      { path: '/api/v1/automation/workflows', name: 'Automation Workflows', method: 'GET' },
      { path: '/api/v1/automation/schedule', name: 'Scheduled Tasks', method: 'GET' },
      { path: '/api/v1/automation/execute', name: 'Execute Automation', method: 'POST', data: { ruleId: 1, context: {} } }
    ];
    
    for (const endpoint of automationEndpoints) {
      await this.testEndpoint('automation', endpoint);
    }
    
    console.log();
  }

  /**
   * Test advanced feature endpoints
   */
  async testAdvancedEndpoints() {
    console.log('⚡ فحص الميزات المتقدمة...');
    
    const advancedEndpoints = [
      { path: '/api/v1/notifications', name: 'Notifications', method: 'GET' },
      { path: '/api/v1/notifications/send', name: 'Send Notification', method: 'POST', data: { type: 'email', recipient: 'test@example.com', message: 'Test' } },
      { path: '/api/v1/integrations', name: 'Integrations', method: 'GET' },
      { path: '/api/v1/webhooks', name: 'Webhooks', method: 'GET' },
      { path: '/api/v1/templates', name: 'Message Templates', method: 'GET' },
      { path: '/api/v1/media/upload', name: 'Media Upload', method: 'POST' },
      { path: '/api/v1/search', name: 'Global Search', method: 'GET', params: { q: 'test' } },
      { path: '/api/v1/backup', name: 'Backup System', method: 'GET' },
      { path: '/api/v1/logs', name: 'System Logs', method: 'GET' },
      { path: '/api/v1/performance', name: 'Performance Metrics', method: 'GET' },
      { path: '/api/v1/security', name: 'Security Status', method: 'GET' },
      { path: '/api/v1/system/info', name: 'System Information', method: 'GET' }
    ];
    
    for (const endpoint of advancedEndpoints) {
      await this.testEndpoint('advanced', endpoint);
    }
    
    console.log();
  }

  /**
   * Test individual endpoint
   */
  async testEndpoint(category, endpoint) {
    const url = `${this.baseURL}${endpoint.path}`;
    const startTime = Date.now();
    
    try {
      // Prepare request config
      const config = {
        method: endpoint.method,
        url,
        timeout: 15000,
        validateStatus: () => true // Accept any status code
      };
      
      // Add data for POST requests
      if (endpoint.data) {
        config.data = endpoint.data;
      }
      
      // Add query parameters
      if (endpoint.params) {
        config.params = endpoint.params;
      }
      
      // Make request
      const response = await axios(config);
      const responseTime = Date.now() - startTime;
      
      // Determine success
      const isSuccess = response.status < 500;
      
      // Store result
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        statusCode: response.status,
        responseTime,
        dataSize: JSON.stringify(response.data).length,
        hasData: response.data && Object.keys(response.data).length > 0,
        success: isSuccess
      };
      
      this.results[category][endpoint.name] = result;
      this.results.summary.totalEndpoints++;
      
      if (result.success) {
        this.results.summary.workingEndpoints++;
        const dataNote = result.hasData ? ` 📊 (${result.dataSize} bytes)` : ' 📭';
        console.log(`  ✅ ${endpoint.name}: ${response.status} (${responseTime}ms)${dataNote}`);
      } else {
        this.results.summary.failedEndpoints++;
        console.log(`  ❌ ${endpoint.name}: ${response.status} (${responseTime}ms)`);
        this.results.issues.push({
          type: 'HIGH',
          message: `${endpoint.name} API failed with status ${response.status}`
        });
      }
      
      return result;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const result = {
        name: endpoint.name,
        path: endpoint.path,
        method: endpoint.method,
        status: 'ERROR',
        statusCode: null,
        responseTime,
        error: error.message,
        success: false
      };
      
      this.results[category][endpoint.name] = result;
      this.results.summary.totalEndpoints++;
      this.results.summary.failedEndpoints++;
      
      console.log(`  ❌ ${endpoint.name}: خطأ - ${error.message}`);
      this.results.issues.push({
        type: 'HIGH',
        message: `${endpoint.name} API error: ${error.message}`
      });
      
      return result;
    }
  }

  /**
   * Generate advanced API report
   */
  generateAdvancedAPIReport() {
    console.log('\n📋 تقرير فحص APIs المتقدمة');
    console.log('=' * 50);
    
    // Calculate overall status
    const successRate = (this.results.summary.workingEndpoints / this.results.summary.totalEndpoints) * 100;
    this.results.summary.overallStatus = successRate >= 80 ? 'GOOD' : successRate >= 60 ? 'FAIR' : 'POOR';
    
    // Summary
    console.log('\n📊 الملخص:');
    console.log(`  إجمالي النقاط المختبرة: ${this.results.summary.totalEndpoints}`);
    console.log(`  النقاط العاملة: ${this.results.summary.workingEndpoints}`);
    console.log(`  النقاط الفاشلة: ${this.results.summary.failedEndpoints}`);
    console.log(`  معدل النجاح: ${successRate.toFixed(1)}%`);
    console.log(`  الحالة العامة: ${this.results.summary.overallStatus}`);
    
    // Category breakdown
    console.log('\n📋 تفصيل حسب الفئة:');
    const categories = ['ai', 'automation', 'advanced'];
    
    categories.forEach(category => {
      const endpoints = Object.values(this.results[category]);
      const working = endpoints.filter(e => e.success).length;
      const total = endpoints.length;
      
      if (total > 0) {
        const categoryRate = (working / total) * 100;
        const status = categoryRate === 100 ? '✅' : categoryRate >= 80 ? '⚠️' : '❌';
        console.log(`  ${status} ${category}: ${working}/${total} (${categoryRate.toFixed(1)}%)`);
      }
    });
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في APIs المتقدمة');
    }
    
    // Save results to file
    this.saveAdvancedAPIReport();
  }

  /**
   * Save advanced API report to file
   */
  saveAdvancedAPIReport() {
    const reportPath = path.join(__dirname, '../reports/api-advanced-check-report.json');
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      summary: {
        status: this.results.summary.overallStatus,
        successRate: (this.results.summary.workingEndpoints / this.results.summary.totalEndpoints) * 100,
        totalEndpoints: this.results.summary.totalEndpoints,
        workingEndpoints: this.results.summary.workingEndpoints,
        failedEndpoints: this.results.summary.failedEndpoints,
        totalIssues: this.results.issues.length
      }
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 تم حفظ التقرير في: ${reportPath}`);
  }
}

// Export for use in other scripts
module.exports = AdvancedAPIChecker;

// Run if called directly
if (require.main === module) {
  const checker = new AdvancedAPIChecker();
  checker.runAdvancedAPICheck().catch(console.error);
}
