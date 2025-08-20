#!/usr/bin/env node

// Show comprehensive summary of deep isolation analysis

const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '..', 'reports', 'deep-isolation-analysis.json');

if (!fs.existsSync(reportPath)) {
    console.log('❌ No deep isolation analysis found. Run: npm run security:isolation-deep');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('🔒 DEEP ISOLATION SECURITY ANALYSIS SUMMARY');
console.log('===========================================');
console.log(`📅 Analysis Date: ${new Date(report.metadata.timestamp).toLocaleString()}`);
console.log(`🔬 Scan Type: ${report.metadata.scanType} v${report.metadata.version}`);
console.log('');

console.log('📊 COMPREHENSIVE STATISTICS:');
console.log('============================');
console.log(`📁 Files Analyzed: ${report.summary.filesScanned}`);
console.log(`📝 Lines of Code: ${report.summary.codeLines.toLocaleString()}`);
console.log(`📊 Total Issues: ${report.summary.totalIssues}`);
console.log('');

console.log('🚨 SEVERITY BREAKDOWN:');
console.log('======================');
console.log(`🔴 CRITICAL: ${report.summary.criticalIssues} (${Math.round((report.summary.criticalIssues / report.summary.totalIssues) * 100)}%)`);
console.log(`🟠 HIGH:     ${report.summary.highIssues} (${Math.round((report.summary.highIssues / report.summary.totalIssues) * 100)}%)`);
console.log(`🟡 MEDIUM:   ${report.summary.mediumIssues} (${Math.round((report.summary.mediumIssues / report.summary.totalIssues) * 100)}%)`);
console.log(`🔵 LOW:      ${report.summary.lowIssues} (${Math.round((report.summary.lowIssues / report.summary.totalIssues) * 100)}%)`);
console.log('');

console.log('📊 SECURITY METRICS:');
console.log('====================');
const isolationIcon = report.metrics.isolationCoverage >= 80 ? '✅' : report.metrics.isolationCoverage >= 60 ? '⚠️' : '❌';
const riskIcon = report.metrics.riskScore <= 20 ? '✅' : report.metrics.riskScore <= 50 ? '⚠️' : '❌';
const complianceIcon = report.metrics.complianceLevel >= 80 ? '✅' : report.metrics.complianceLevel >= 60 ? '⚠️' : '❌';

console.log(`${isolationIcon} Isolation Coverage: ${report.metrics.isolationCoverage}% (Target: 90%+)`);
console.log(`${riskIcon} Risk Score: ${report.metrics.riskScore}% (Target: <20%)`);
console.log(`${complianceIcon} Compliance Level: ${report.metrics.complianceLevel}% (Target: 90%+)`);
console.log('');

// Group issues by category
const issuesByCategory = {};
report.issues.forEach(issue => {
    if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }
    issuesByCategory[issue.category].total++;
    issuesByCategory[issue.category][issue.severity.toLowerCase()]++;
});

console.log('📋 ISSUES BY CATEGORY:');
console.log('======================');
Object.entries(issuesByCategory)
    .sort(([,a], [,b]) => (b.critical * 10 + b.high * 5) - (a.critical * 10 + a.high * 5))
    .forEach(([category, counts]) => {
        const criticalIcon = counts.critical > 0 ? '🔴' : '';
        const highIcon = counts.high > 0 ? '🟠' : '';
        console.log(`${criticalIcon}${highIcon} ${category}: ${counts.total} issues`);
        console.log(`   🔴 ${counts.critical} | 🟠 ${counts.high} | 🟡 ${counts.medium} | 🔵 ${counts.low}`);
    });

console.log('');

// Show top critical issues by category
console.log('🚨 TOP CRITICAL ISSUES BY CATEGORY:');
console.log('===================================');

const criticalByCategory = {};
report.issues
    .filter(issue => issue.severity === 'CRITICAL')
    .forEach(issue => {
        if (!criticalByCategory[issue.category]) {
            criticalByCategory[issue.category] = [];
        }
        criticalByCategory[issue.category].push(issue);
    });

Object.entries(criticalByCategory)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([category, issues]) => {
        console.log(`🔴 ${category}: ${issues.length} critical issues`);
        
        // Show top 3 issues in this category
        issues.slice(0, 3).forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue.file}:${issue.line}`);
            console.log(`      ${issue.description}`);
            console.log(`      Code: ${issue.content.substring(0, 60)}${issue.content.length > 60 ? '...' : ''}`);
            console.log(`      CWE: ${issue.cwe} | Risk: ${issue.riskScore}/10`);
        });
        
        if (issues.length > 3) {
            console.log(`   ... and ${issues.length - 3} more in this category`);
        }
        console.log('');
    });

// Show highest risk files
console.log('📁 HIGHEST RISK FILES:');
console.log('======================');

const fileRisks = Object.entries(report.fileAnalysis)
    .filter(([, analysis]) => analysis.issues.length > 0)
    .map(([file, analysis]) => ({
        file,
        ...analysis,
        totalRisk: analysis.issues.reduce((sum, issue) => sum + issue.riskScore, 0)
    }))
    .sort((a, b) => b.totalRisk - a.totalRisk)
    .slice(0, 10);

fileRisks.forEach((fileData, index) => {
    const riskIcon = {
        'CRITICAL': '🔴',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🔵'
    }[fileData.riskLevel];
    
    console.log(`${index + 1}. ${riskIcon} ${fileData.file}`);
    console.log(`   Risk Level: ${fileData.riskLevel} | Total Risk Score: ${fileData.totalRisk}`);
    console.log(`   Isolation Score: ${fileData.isolationScore}% | Issues: ${fileData.issues.length}`);
    console.log(`   Lines: ${fileData.totalLines} | Patterns: P:${fileData.patterns.prismaQueries} A:${fileData.patterns.apiRoutes} C:${fileData.patterns.companyFilters}`);
    console.log('');
});

// Show recommendations with priority
console.log('💡 PRIORITY RECOMMENDATIONS:');
console.log('=============================');

report.recommendations.forEach((rec, index) => {
    const priorityIcon = {
        'URGENT': '🚨',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🔵'
    }[rec.priority];
    
    console.log(`${priorityIcon} ${rec.priority}: ${rec.title}`);
    console.log(`   ${rec.description}`);
    console.log('   Immediate Actions:');
    rec.actions.slice(0, 3).forEach(action => console.log(`   • ${action}`));
    if (rec.actions.length > 3) {
        console.log(`   • ... and ${rec.actions.length - 3} more actions`);
    }
    console.log('');
});

// Security assessment
console.log('🎯 SECURITY ASSESSMENT:');
console.log('=======================');

if (report.summary.criticalIssues > 0) {
    console.log('❌ CRITICAL SECURITY VULNERABILITIES DETECTED!');
    console.log('   🚨 IMMEDIATE ACTION REQUIRED');
    console.log('   • Data breach risk is HIGH');
    console.log('   • Multi-tenant isolation is COMPROMISED');
    console.log('   • Production deployment is NOT RECOMMENDED');
} else if (report.summary.highIssues > 10) {
    console.log('⚠️  HIGH SECURITY RISKS DETECTED!');
    console.log('   🟠 ACTION REQUIRED WITHIN 24 HOURS');
    console.log('   • Security posture needs improvement');
    console.log('   • Monitor for potential exploitation');
} else if (report.metrics.isolationCoverage < 70) {
    console.log('⚠️  ISOLATION COVERAGE BELOW RECOMMENDED LEVEL');
    console.log('   🟡 IMPROVEMENT NEEDED');
    console.log('   • Enhance company isolation mechanisms');
    console.log('   • Review multi-tenant architecture');
} else {
    console.log('✅ SECURITY POSTURE IS ACCEPTABLE');
    console.log('   • Continue monitoring and improvement');
    console.log('   • Address remaining medium/low issues');
}

console.log('');

// Next steps
console.log('🔄 NEXT STEPS:');
console.log('==============');
console.log('1. 🌐 Review detailed interactive report: reports/deep-isolation-report.html');
console.log('2. 🔧 Address critical issues first, then high priority');
console.log('3. 🧪 Test all fixes in development environment');
console.log('4. 🔄 Re-run analysis: npm run security:isolation-deep');
console.log('5. 📊 Monitor security metrics improvement');
console.log('6. 🛡️  Implement automated security testing in CI/CD');
console.log('');

// Performance metrics
const analysisTime = new Date() - new Date(report.metadata.timestamp);
const issuesPerFile = (report.summary.totalIssues / report.summary.filesScanned).toFixed(2);
const issuesPerKLOC = ((report.summary.totalIssues / report.summary.codeLines) * 1000).toFixed(2);

console.log('📈 ANALYSIS METRICS:');
console.log('===================');
console.log(`⏱️  Analysis completed in: ${Math.round(analysisTime / 1000)} seconds ago`);
console.log(`📊 Issues per file: ${issuesPerFile}`);
console.log(`📊 Issues per 1000 lines: ${issuesPerKLOC}`);
console.log(`🔍 Coverage: ${((report.summary.filesScanned / 200) * 100).toFixed(1)}% of estimated codebase`);
console.log('');

console.log('🔗 DETAILED REPORTS:');
console.log('====================');
console.log('📊 JSON Data: reports/deep-isolation-analysis.json');
console.log('🌐 Interactive: reports/deep-isolation-report.html');
console.log('📋 Basic Report: reports/isolation-check.json');
console.log('');

// Final status
if (report.summary.criticalIssues > 0) {
    console.log('🚨 STATUS: CRITICAL - Immediate action required!');
    process.exit(2);
} else if (report.summary.highIssues > 10) {
    console.log('⚠️  STATUS: HIGH RISK - Address within 24 hours');
    process.exit(1);
} else {
    console.log('✅ STATUS: ACCEPTABLE - Continue monitoring');
    process.exit(0);
}
