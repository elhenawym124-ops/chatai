#!/usr/bin/env node

// Show summary of isolation check results

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'reports', 'isolation-check.json');

if (!fs.existsSync(reportPath)) {
    console.log('❌ No isolation check report found. Run: npm run security:isolation-basic');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('🔒 COMPANY ISOLATION SECURITY SUMMARY');
console.log('=====================================');
console.log(`📅 Scan Date: ${new Date(report.timestamp).toLocaleString()}`);
console.log(`📁 Files Scanned: ${report.filesScanned}`);
console.log(`📊 Total Issues: ${report.totalIssues}`);
console.log(`🚨 Critical Issues: ${report.criticalIssues}`);
console.log(`⚠️  Warning Issues: ${report.warningIssues}`);
console.log('');

// Group issues by type
const issuesByType = {};
report.issues.forEach(issue => {
    if (!issuesByType[issue.description]) {
        issuesByType[issue.description] = [];
    }
    issuesByType[issue.description].push(issue);
});

console.log('📋 ISSUES BY TYPE:');
console.log('==================');

Object.entries(issuesByType)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 10)
    .forEach(([type, issues]) => {
        const severity = issues[0].severity;
        const icon = severity === 'CRITICAL' ? '🚨' : severity === 'WARNING' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${type}: ${issues.length} occurrences`);
    });

console.log('');

// Show top critical issues
const criticalIssues = report.issues.filter(issue => issue.severity === 'CRITICAL');
if (criticalIssues.length > 0) {
    console.log('🚨 TOP CRITICAL ISSUES:');
    console.log('=======================');
    
    criticalIssues.slice(0, 5).forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.description}`);
        console.log(`   📁 ${issue.file}:${issue.line}`);
        console.log(`   💻 ${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}`);
        console.log('');
    });
    
    if (criticalIssues.length > 5) {
        console.log(`   ... and ${criticalIssues.length - 5} more critical issues`);
        console.log('');
    }
}

// Show files with most issues
const fileIssues = {};
report.issues.forEach(issue => {
    if (!fileIssues[issue.file]) {
        fileIssues[issue.file] = { critical: 0, warning: 0, total: 0 };
    }
    fileIssues[issue.file].total++;
    if (issue.severity === 'CRITICAL') {
        fileIssues[issue.file].critical++;
    } else {
        fileIssues[issue.file].warning++;
    }
});

console.log('📁 FILES WITH MOST ISSUES:');
console.log('===========================');

Object.entries(fileIssues)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 10)
    .forEach(([file, counts]) => {
        console.log(`📄 ${file}`);
        console.log(`   🚨 Critical: ${counts.critical}, ⚠️  Warning: ${counts.warning}, Total: ${counts.total}`);
    });

console.log('');

// Recommendations
console.log('💡 IMMEDIATE ACTIONS NEEDED:');
console.log('=============================');

if (criticalIssues.length > 0) {
    console.log('🚨 URGENT: Fix critical issues immediately!');
    console.log('   - Review all Prisma queries without companyId filters');
    console.log('   - Check raw SQL queries for company isolation');
    console.log('   - Verify bulk operations have proper filtering');
    console.log('');
}

console.log('📋 NEXT STEPS:');
console.log('===============');
console.log('1. 🔍 Review the detailed HTML report: reports/isolation-report.html');
console.log('2. 🛠️  Fix critical issues first, then warnings');
console.log('3. 🧪 Test fixes thoroughly in development environment');
console.log('4. 🔄 Re-run security check: npm run security:isolation-basic');
console.log('5. 📚 Review isolation best practices in .semgrep/README.md');
console.log('');

if (report.criticalIssues > 0) {
    console.log('❌ SECURITY RISK: Critical isolation issues found!');
    console.log('   Please fix immediately before deploying to production.');
} else {
    console.log('✅ No critical isolation issues found!');
    console.log('   Review warnings and continue monitoring.');
}

console.log('');
console.log('🔗 For detailed analysis, open: reports/isolation-report.html');
