#!/usr/bin/env node

// Script to systematically fix critical security issues

const fs = require('fs');
const path = require('path');

console.log('🔧 CRITICAL SECURITY ISSUES FIXER');
console.log('==================================');

// Load the latest security report
const reportPath = path.join(__dirname, '..', 'reports', 'isolation-check.json');
if (!fs.existsSync(reportPath)) {
    console.log('❌ No security report found. Run: npm run security:isolation-basic');
    process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const criticalIssues = report.issues.filter(issue => issue.severity === 'CRITICAL');

console.log(`📊 Found ${criticalIssues.length} critical issues to fix`);
console.log('');

// Group issues by file and type
const issuesByFile = {};
const issuesByType = {};

criticalIssues.forEach(issue => {
    // Group by file
    if (!issuesByFile[issue.file]) {
        issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
    
    // Group by type
    if (!issuesByType[issue.description]) {
        issuesByType[issue.description] = [];
    }
    issuesByType[issue.description].push(issue);
});

console.log('📋 CRITICAL ISSUES BY TYPE:');
console.log('===========================');
Object.entries(issuesByType)
    .sort(([,a], [,b]) => b.length - a.length)
    .forEach(([type, issues]) => {
        console.log(`🔴 ${type}: ${issues.length} occurrences`);
    });

console.log('');
console.log('📁 CRITICAL ISSUES BY FILE:');
console.log('============================');
Object.entries(issuesByFile)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 10)
    .forEach(([file, issues]) => {
        console.log(`📄 ${file}: ${issues.length} critical issues`);
        issues.slice(0, 3).forEach(issue => {
            console.log(`   Line ${issue.line}: ${issue.content.substring(0, 60)}...`);
        });
        if (issues.length > 3) {
            console.log(`   ... and ${issues.length - 3} more issues`);
        }
        console.log('');
    });

// Generate fix recommendations
console.log('💡 AUTOMATED FIX RECOMMENDATIONS:');
console.log('==================================');

// 1. Safe raw SQL queries (connection tests)
const safeRawQueries = criticalIssues.filter(issue => 
    issue.description.includes('Raw SQL query') && 
    (issue.content.includes('SELECT 1') || issue.content.includes('connection_test') || issue.content.includes('health_check'))
);

if (safeRawQueries.length > 0) {
    console.log(`🟢 ${safeRawQueries.length} Raw SQL queries are actually SAFE (connection tests)`);
    console.log('   These can be marked as safe with comments');
    console.log('');
}

// 2. Prisma queries without filters
const prismaNoFilters = criticalIssues.filter(issue => 
    issue.description.includes('findMany without any filters') || 
    issue.description.includes('findFirst without filters')
);

if (prismaNoFilters.length > 0) {
    console.log(`🔴 ${prismaNoFilters.length} Prisma queries need company isolation`);
    console.log('   URGENT: Add companyId filters to these queries');
    prismaNoFilters.slice(0, 5).forEach(issue => {
        console.log(`   📄 ${issue.file}:${issue.line}`);
    });
    console.log('');
}

// 3. Raw SQL with parameters
const rawSqlWithParams = criticalIssues.filter(issue => 
    issue.description.includes('Raw SQL query') && 
    !issue.content.includes('SELECT 1') &&
    !issue.content.includes('connection_test')
);

if (rawSqlWithParams.length > 0) {
    console.log(`🔴 ${rawSqlWithParams.length} Raw SQL queries need conversion to Prisma ORM`);
    console.log('   URGENT: Convert these to use Prisma ORM for better security');
    rawSqlWithParams.slice(0, 5).forEach(issue => {
        console.log(`   📄 ${issue.file}:${issue.line}`);
    });
    console.log('');
}

// Generate specific fix instructions
console.log('🛠️  SPECIFIC FIX INSTRUCTIONS:');
console.log('===============================');

console.log('1. 🔧 Fix Prisma queries without company isolation:');
console.log('   Replace:');
console.log('   ❌ await prisma.model.findMany()');
console.log('   ✅ await prisma.model.findMany({ where: { companyId: req.user.companyId } })');
console.log('');

console.log('2. 🔧 Convert Raw SQL to Prisma ORM:');
console.log('   Replace:');
console.log('   ❌ await prisma.$queryRaw`SELECT * FROM table WHERE id = ${id}`');
console.log('   ✅ await prisma.table.findMany({ where: { id: id } })');
console.log('');

console.log('3. 🔧 Mark safe queries with comments:');
console.log('   Add comments to connection test queries:');
console.log('   ✅ // Safe: Connection test query - no user data involved');
console.log('   ✅ await prisma.$queryRaw`SELECT 1 as connection_test`;');
console.log('');

// Priority files to fix first
const priorityFiles = Object.entries(issuesByFile)
    .sort(([,a], [,b]) => b.length - a.length)
    .slice(0, 5)
    .map(([file]) => file);

console.log('🎯 PRIORITY FILES TO FIX FIRST:');
console.log('===============================');
priorityFiles.forEach((file, index) => {
    const issues = issuesByFile[file];
    console.log(`${index + 1}. 📄 ${file} (${issues.length} critical issues)`);
});

console.log('');
console.log('🔄 NEXT STEPS:');
console.log('==============');
console.log('1. Fix priority files one by one');
console.log('2. Run security check after each file: npm run security:isolation-basic');
console.log('3. Verify fixes don\'t break functionality');
console.log('4. Continue until all critical issues are resolved');
console.log('');

// Save detailed fix plan
const fixPlan = {
    timestamp: new Date().toISOString(),
    totalCriticalIssues: criticalIssues.length,
    issuesByType: Object.fromEntries(
        Object.entries(issuesByType).map(([type, issues]) => [type, issues.length])
    ),
    priorityFiles: priorityFiles.map(file => ({
        file,
        issueCount: issuesByFile[file].length,
        issues: issuesByFile[file].map(issue => ({
            line: issue.line,
            description: issue.description,
            content: issue.content.substring(0, 100)
        }))
    })),
    recommendations: {
        safeQueries: safeRawQueries.length,
        prismaNoFilters: prismaNoFilters.length,
        rawSqlWithParams: rawSqlWithParams.length
    }
};

fs.writeFileSync(
    path.join(__dirname, '..', 'reports', 'critical-fix-plan.json'),
    JSON.stringify(fixPlan, null, 2)
);

console.log('📋 Detailed fix plan saved to: reports/critical-fix-plan.json');
console.log('🚀 Ready to start fixing critical issues!');

process.exit(0);
