/**
 * Reports APIs Testing Script
 * 
 * This script tests all reports and analytics API endpoints
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class ReportsAPIChecker {
  constructor() {
    this.baseURL = 'http://localhost:3001';
    this.results = {
      reports: {},
      analytics: {},
      dashboard: {},
      exports: {},
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
   * Run complete reports API check
   */
  async runReportsAPICheck() {
    console.log('📊 بدء فحص APIs التقارير...\n');

    try {
      // Test dashboard endpoints
      await this.testDashboardEndpoints();
      
      // Test reports endpoints
      await this.testReportsEndpoints();
      
      // Test analytics endpoints
      await this.testAnalyticsEndpoints();
      
      // Test export endpoints
      await this.testExportEndpoints();
      
      // Generate report
      this.generateReportsAPIReport();

    } catch (error) {
      console.error('❌ خطأ في فحص APIs التقارير:', error);
      this.results.issues.push({
        type: 'CRITICAL',
        message: `Reports API check failed: ${error.message}`
      });
    }
  }

  /**
   * Test dashboard endpoints
   */
  async testDashboardEndpoints() {
    console.log('📈 فحص نقاط لوحة التحكم...');
    
    const dashboardEndpoints = [
      { path: '/api/v1/dashboard', name: 'Dashboard Overview', method: 'GET' },
      { path: '/api/v1/dashboard/stats', name: 'Dashboard Stats', method: 'GET' },
      { path: '/api/v1/dashboard/metrics', name: 'Dashboard Metrics', method: 'GET' },
      { path: '/api/v1/dashboard/recent-activity', name: 'Recent Activity', method: 'GET' },
      { path: '/api/v1/dashboard/notifications', name: 'Dashboard Notifications', method: 'GET' },
      { path: '/api/v1/dashboard/quick-stats', name: 'Quick Stats', method: 'GET' },
      { path: '/api/v1/dashboard/performance', name: 'Performance Metrics', method: 'GET' }
    ];
    
    for (const endpoint of dashboardEndpoints) {
      await this.testEndpoint('dashboard', endpoint);
    }
    
    console.log();
  }

  /**
   * Test reports endpoints
   */
  async testReportsEndpoints() {
    console.log('📋 فحص نقاط التقارير...');
    
    const reportsEndpoints = [
      { path: '/api/v1/reports', name: 'All Reports', method: 'GET' },
      { path: '/api/v1/reports/sales', name: 'Sales Report', method: 'GET' },
      { path: '/api/v1/reports/customers', name: 'Customer Report', method: 'GET' },
      { path: '/api/v1/reports/conversations', name: 'Conversations Report', method: 'GET' },
      { path: '/api/v1/reports/products', name: 'Products Report', method: 'GET' },
      { path: '/api/v1/reports/performance', name: 'Performance Report', method: 'GET' },
      { path: '/api/v1/reports/revenue', name: 'Revenue Report', method: 'GET' },
      { path: '/api/v1/reports/conversion', name: 'Conversion Report', method: 'GET' },
      { path: '/api/v1/reports/engagement', name: 'Engagement Report', method: 'GET' },
      { path: '/api/v1/reports/trends', name: 'Trends Report', method: 'GET' },
      { path: '/api/v1/reports/custom', name: 'Custom Reports', method: 'GET' },
      { path: '/api/v1/reports/scheduled', name: 'Scheduled Reports', method: 'GET' }
    ];
    
    for (const endpoint of reportsEndpoints) {
      await this.testEndpoint('reports', endpoint);
    }
    
    console.log();
  }

  /**
   * Test analytics endpoints
   */
  async testAnalyticsEndpoints() {
    console.log('📊 فحص نقاط التحليلات...');
    
    const analyticsEndpoints = [
      { path: '/api/v1/analytics', name: 'Analytics Overview', method: 'GET' },
      { path: '/api/v1/analytics/sentiment', name: 'Sentiment Analysis', method: 'GET' },
      { path: '/api/v1/analytics/behavior', name: 'Customer Behavior', method: 'GET' },
      { path: '/api/v1/analytics/patterns', name: 'Usage Patterns', method: 'GET' },
      { path: '/api/v1/analytics/predictions', name: 'Predictions', method: 'GET' },
      { path: '/api/v1/analytics/insights', name: 'Business Insights', method: 'GET' },
      { path: '/api/v1/analytics/kpi', name: 'KPI Analytics', method: 'GET' },
      { path: '/api/v1/analytics/cohort', name: 'Cohort Analysis', method: 'GET' },
      { path: '/api/v1/analytics/funnel', name: 'Funnel Analysis', method: 'GET' },
      { path: '/api/v1/analytics/retention', name: 'Retention Analysis', method: 'GET' },
      { path: '/api/v1/analytics/segmentation', name: 'Customer Segmentation', method: 'GET' },
      { path: '/api/v1/analytics/real-time', name: 'Real-time Analytics', method: 'GET' }
    ];
    
    for (const endpoint of analyticsEndpoints) {
      await this.testEndpoint('analytics', endpoint);
    }
    
    console.log();
  }

  /**
   * Test export endpoints
   */
  async testExportEndpoints() {
    console.log('📤 فحص نقاط التصدير...');
    
    const exportEndpoints = [
      { path: '/api/v1/exports/reports/pdf', name: 'Export PDF', method: 'POST', data: { reportType: 'sales', dateRange: '30d' } },
      { path: '/api/v1/exports/reports/excel', name: 'Export Excel', method: 'POST', data: { reportType: 'customers', dateRange: '30d' } },
      { path: '/api/v1/exports/reports/csv', name: 'Export CSV', method: 'POST', data: { reportType: 'conversations', dateRange: '30d' } },
      { path: '/api/v1/exports/data/customers', name: 'Export Customers Data', method: 'GET' },
      { path: '/api/v1/exports/data/conversations', name: 'Export Conversations Data', method: 'GET' },
      { path: '/api/v1/exports/data/products', name: 'Export Products Data', method: 'GET' },
      { path: '/api/v1/exports/analytics', name: 'Export Analytics', method: 'POST', data: { type: 'sentiment', format: 'json' } },
      { path: '/api/v1/exports/scheduled', name: 'Scheduled Exports', method: 'GET' },
      { path: '/api/v1/exports/history', name: 'Export History', method: 'GET' }
    ];
    
    for (const endpoint of exportEndpoints) {
      await this.testEndpoint('exports', endpoint);
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
        timeout: 15000, // Longer timeout for reports
        validateStatus: () => true // Accept any status code
      };
      
      // Add data for POST requests
      if (endpoint.data) {
        config.data = endpoint.data;
      }
      
      // Add query parameters for date ranges
      if (endpoint.method === 'GET' && category === 'reports') {
        config.params = {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          limit: 100
        };
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
   * Generate reports API report
   */
  generateReportsAPIReport() {
    console.log('\n📋 تقرير فحص APIs التقارير');
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
    const categories = ['dashboard', 'reports', 'analytics', 'exports'];
    
    categories.forEach(category => {
      const endpoints = Object.values(this.results[category]);
      const working = endpoints.filter(e => e.success).length;
      const total = endpoints.length;
      
      if (total > 0) {
        const categoryRate = (working / total) * 100;
        const status = categoryRate === 100 ? '✅' : categoryRate >= 80 ? '⚠️' : '❌';
        console.log(`  ${status} ${category}: ${working}/${total} (${categoryRate.toFixed(1)}%)`);
        
        // Show data availability for reports
        if (category === 'reports' || category === 'analytics') {
          const withData = endpoints.filter(e => e.hasData).length;
          console.log(`    📊 نقاط تحتوي على بيانات: ${withData}/${total}`);
        }
      }
    });
    
    // Performance analysis
    console.log('\n⚡ تحليل الأداء:');
    const allEndpoints = Object.values(this.results).flatMap(category => 
      typeof category === 'object' && !Array.isArray(category) && !category.totalEndpoints ? 
      Object.values(category) : []
    );
    
    if (allEndpoints.length > 0) {
      const avgResponseTime = allEndpoints.reduce((sum, e) => sum + (e.responseTime || 0), 0) / allEndpoints.length;
      const slowEndpoints = allEndpoints.filter(e => e.responseTime > 5000);
      
      console.log(`  متوسط زمن الاستجابة: ${avgResponseTime.toFixed(0)}ms`);
      console.log(`  النقاط البطيئة (>5s): ${slowEndpoints.length}`);
      
      if (slowEndpoints.length > 0) {
        console.log('  النقاط البطيئة:');
        slowEndpoints.forEach(e => {
          console.log(`    ⏱️ ${e.name}: ${e.responseTime}ms`);
        });
      }
    }
    
    // Issues
    if (this.results.issues.length > 0) {
      console.log('\n⚠️ المشاكل المكتشفة:');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. [${issue.type}] ${issue.message}`);
      });
    } else {
      console.log('\n✅ لم يتم اكتشاف مشاكل في APIs التقارير');
    }
    
    // Recommendations
    console.log('\n💡 التوصيات:');
    if (this.results.summary.overallStatus === 'GOOD') {
      console.log('  🎉 APIs التقارير تعمل بشكل ممتاز');
    } else {
      console.log('  🔧 مراجعة النقاط الفاشلة وإصلاحها');
      console.log('  📊 التأكد من توفر البيانات للتقارير');
    }
    
    const slowEndpoints = Object.values(this.results).flatMap(category => 
      typeof category === 'object' && !Array.isArray(category) && !category.totalEndpoints ? 
      Object.values(category).filter(e => e.responseTime > 3000) : []
    );
    
    if (slowEndpoints.length > 0) {
      console.log('  ⚡ تحسين أداء النقاط البطيئة');
    }
    
    // Save results to file
    this.saveReportsAPIReport();
  }

  /**
   * Save reports API report to file
   */
  saveReportsAPIReport() {
    const reportPath = path.join(__dirname, '../reports/api-reports-check-report.json');
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
module.exports = ReportsAPIChecker;

// Run if called directly
if (require.main === module) {
  const checker = new ReportsAPIChecker();
  checker.runReportsAPICheck().catch(console.error);
}
