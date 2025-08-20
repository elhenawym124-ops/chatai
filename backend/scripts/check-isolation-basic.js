#!/usr/bin/env node

// Basic Company Isolation Security Check
// JavaScript version for cross-platform compatibility

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Company Isolation Security Check...');
console.log('================================================');

// Create reports directory
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Statistics
let totalIssues = 0;
let criticalIssues = 0;
let warningIssues = 0;
let checkedFiles = 0;

// All issues found
const allIssues = [];

// Function to recursively find files
function findFiles(dir, extensions = ['.js', '.ts']) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                traverse(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

// Function to check patterns in file
function checkFile(filePath, patterns) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const relativePath = path.relative(process.cwd(), filePath);
    
    patterns.forEach(({ regex, description, severity }) => {
        lines.forEach((line, index) => {
            if (regex.test(line)) {
                const issue = {
                    file: relativePath,
                    line: index + 1,
                    content: line.trim(),
                    description,
                    severity
                };
                
                allIssues.push(issue);
                totalIssues++;
                
                if (severity === 'CRITICAL') {
                    criticalIssues++;
                } else {
                    warningIssues++;
                }
            }
        });
    });
}

// Define security patterns to check
const securityPatterns = [
    {
        regex: /prisma\.\w+\.findMany\(\s*\)/,
        description: 'Prisma findMany without any filters',
        severity: 'CRITICAL'
    },
    {
        regex: /prisma\.\w+\.findMany\(\s*\{[^}]*\}\s*\)/,
        description: 'Prisma findMany potentially without companyId filter',
        severity: 'WARNING'
    },
    {
        regex: /prisma\.\w+\.findFirst\(\s*\)/,
        description: 'Prisma findFirst without any filters',
        severity: 'CRITICAL'
    },
    {
        regex: /prisma\.\w+\.(updateMany|deleteMany)\(/,
        description: 'Bulk operation without proper filtering',
        severity: 'CRITICAL'
    },
    {
        regex: /\$queryRaw|\$executeRaw/,
        description: 'Raw SQL query without company isolation',
        severity: 'CRITICAL'
    },
    {
        regex: /companyId:\s*["'][a-zA-Z0-9]{20,}["']/,
        description: 'Hardcoded company ID found',
        severity: 'WARNING'
    },
    {
        regex: /router\.(get|post|put|delete)\(/,
        description: 'API route potentially missing isolation middleware',
        severity: 'WARNING'
    },
    {
        regex: /where:\s*\{[^}]*\}/,
        description: 'Where clause potentially missing companyId',
        severity: 'INFO'
    }
];

console.log('🔍 Scanning files...');

// Find and check all JavaScript/TypeScript files in src directory
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
    const files = findFiles(srcDir);
    checkedFiles = files.length;
    
    console.log(`📁 Found ${files.length} files to check`);
    
    files.forEach(file => {
        checkFile(file, securityPatterns);
    });
} else {
    console.log('❌ src directory not found');
}

// Generate report
const report = {
    timestamp: new Date().toISOString(),
    filesScanned: checkedFiles,
    totalIssues,
    criticalIssues,
    warningIssues,
    issues: allIssues
};

// Save JSON report
fs.writeFileSync(
    path.join(reportsDir, 'isolation-check.json'),
    JSON.stringify(report, null, 2)
);

// Display results
console.log('\n📊 Scan Results:');
console.log('================');
console.log(`Files Scanned: ${checkedFiles}`);
console.log(`Total Issues: ${totalIssues}`);
console.log(`Critical Issues: ${criticalIssues}`);
console.log(`Warning Issues: ${warningIssues}`);

// Show critical issues
console.log('\n🚨 Critical Issues Found:');
console.log('=========================');

const criticalFound = allIssues.filter(issue => issue.severity === 'CRITICAL');
if (criticalFound.length > 0) {
    criticalFound.forEach(issue => {
        console.log(`❌ ${issue.description}`);
        console.log(`   File: ${issue.file}:${issue.line}`);
        console.log(`   Code: ${issue.content}`);
        console.log('');
    });
} else {
    console.log('✅ No critical issues found!');
}

// Show warnings (limited to first 10)
console.log('\n⚠️  Warning Issues Found:');
console.log('=========================');

const warningFound = allIssues.filter(issue => issue.severity === 'WARNING').slice(0, 10);
if (warningFound.length > 0) {
    warningFound.forEach(issue => {
        console.log(`⚠️  ${issue.description}`);
        console.log(`   File: ${issue.file}:${issue.line}`);
        console.log(`   Code: ${issue.content}`);
        console.log('');
    });
} else {
    console.log('✅ No warning issues found!');
}

// Generate simple HTML report
const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Isolation Security Report</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; }
        .header { background: #667eea; color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .critical { color: #dc3545; font-weight: bold; }
        .warning { color: #ffc107; font-weight: bold; }
        .success { color: #28a745; font-weight: bold; }
        .issue { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .issue.critical { border-left-color: #dc3545; background: #fff5f5; }
        .issue.warning { border-left-color: #ffc107; background: #fffbf0; }
        .code { background: #f1f3f4; padding: 10px; border-radius: 5px; font-family: monospace; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Company Isolation Security Report</h1>
        <p>Scan Date: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="success" style="font-size: 2em;">${checkedFiles}</div>
            <div>Files Scanned</div>
        </div>
        <div class="stat">
            <div style="font-size: 2em;">${totalIssues}</div>
            <div>Total Issues</div>
        </div>
        <div class="stat">
            <div class="critical" style="font-size: 2em;">${criticalIssues}</div>
            <div>Critical Issues</div>
        </div>
        <div class="stat">
            <div class="warning" style="font-size: 2em;">${warningIssues}</div>
            <div>Warnings</div>
        </div>
    </div>
    
    <h2>🚨 Issues Found</h2>
    ${allIssues.map(issue => `
    <div class="issue ${issue.severity.toLowerCase()}">
        <h3>${issue.description}</h3>
        <p><strong>File:</strong> ${issue.file}:${issue.line}</p>
        <div class="code">${issue.content}</div>
    </div>
    `).join('')}
    
    <h2>📋 Recommendations</h2>
    <ul>
        <li>Add companyId filter to all Prisma queries</li>
        <li>Use middleware for company isolation in all API routes</li>
        <li>Avoid using findMany() without filtering</li>
        <li>Use req.user.companyId from authentication context</li>
        <li>Avoid hardcoding company IDs in code</li>
    </ul>
</body>
</html>
`;

fs.writeFileSync(path.join(reportsDir, 'isolation-report.html'), htmlReport);

console.log('\n📁 Reports generated:');
console.log('   - reports/isolation-check.json');
console.log('   - reports/isolation-report.html');
console.log('\n🌐 Open reports/isolation-report.html in browser for detailed view');

if (criticalIssues > 0) {
    console.log('\n❌ CRITICAL ISSUES FOUND! Please fix immediately.');
    process.exit(1);
} else {
    console.log('\n✅ No critical isolation issues found!');
    process.exit(0);
}
