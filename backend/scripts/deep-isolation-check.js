#!/usr/bin/env node

// Deep Company Isolation Security Check
// Advanced security analysis for multi-tenant applications

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting DEEP Company Isolation Security Check...');
console.log('====================================================');

// Create reports directory
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Advanced statistics
let totalIssues = 0;
let criticalIssues = 0;
let highIssues = 0;
let mediumIssues = 0;
let lowIssues = 0;
let checkedFiles = 0;
let codeLines = 0;

// All issues found with detailed analysis
const allIssues = [];
const fileAnalysis = {};
const securityMetrics = {
    isolationCoverage: 0,
    riskScore: 0,
    complianceLevel: 0
};

// Function to recursively find files with more extensions
function findFiles(dir, extensions = ['.js', '.ts', '.jsx', '.tsx', '.json']) {
    const files = [];
    
    function traverse(currentDir) {
        try {
            const items = fs.readdirSync(currentDir);
            
            for (const item of items) {
                const fullPath = path.join(currentDir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && 
                    !['node_modules', 'dist', 'build', 'coverage'].includes(item)) {
                    traverse(fullPath);
                } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            console.warn(`Warning: Cannot read directory ${currentDir}`);
        }
    }
    
    traverse(dir);
    return files;
}

// Advanced pattern analysis with context
function analyzeFileDeep(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        const relativePath = path.relative(process.cwd(), filePath);
        
        codeLines += lines.length;
        
        // Initialize file analysis
        fileAnalysis[relativePath] = {
            totalLines: lines.length,
            issues: [],
            riskLevel: 'LOW',
            isolationScore: 100,
            patterns: {
                prismaQueries: 0,
                apiRoutes: 0,
                authChecks: 0,
                companyFilters: 0
            }
        };
        
        // Advanced security patterns
        const advancedPatterns = [
            // CRITICAL - Data Exposure Risks
            {
                regex: /prisma\.\w+\.findMany\(\s*\)/,
                description: 'Prisma findMany without any filters - CRITICAL DATA EXPOSURE',
                severity: 'CRITICAL',
                category: 'DATA_EXPOSURE',
                impact: 'HIGH',
                cwe: 'CWE-200'
            },
            {
                regex: /prisma\.\w+\.findFirst\(\s*\)/,
                description: 'Prisma findFirst without filters - CRITICAL DATA EXPOSURE',
                severity: 'CRITICAL',
                category: 'DATA_EXPOSURE',
                impact: 'HIGH',
                cwe: 'CWE-200'
            },
            {
                regex: /prisma\.\w+\.(updateMany|deleteMany)\(\s*\{[^}]*\}\s*\)/,
                description: 'Bulk operation potentially without company isolation',
                severity: 'CRITICAL',
                category: 'DATA_INTEGRITY',
                impact: 'HIGH',
                cwe: 'CWE-284'
            },
            {
                regex: /\$queryRaw|\$executeRaw/,
                description: 'Raw SQL query without company isolation verification',
                severity: 'CRITICAL',
                category: 'SQL_INJECTION',
                impact: 'HIGH',
                cwe: 'CWE-89'
            },
            
            // HIGH - Authentication & Authorization
            {
                regex: /router\.(get|post|put|delete|patch)\([^,]+,\s*(?!.*auth|.*requireAuth|.*authenticate|.*companyIsolation)/,
                description: 'API route without authentication middleware',
                severity: 'HIGH',
                category: 'AUTHENTICATION',
                impact: 'HIGH',
                cwe: 'CWE-306'
            },
            {
                regex: /req\.user\s*=\s*[^;]+/,
                description: 'Manual user assignment - potential authentication bypass',
                severity: 'HIGH',
                category: 'AUTHENTICATION',
                impact: 'HIGH',
                cwe: 'CWE-287'
            },
            {
                regex: /companyId:\s*["'][a-zA-Z0-9]{20,}["']/,
                description: 'Hardcoded company ID - security risk',
                severity: 'HIGH',
                category: 'HARDCODED_SECRETS',
                impact: 'MEDIUM',
                cwe: 'CWE-798'
            },
            
            // MEDIUM - Potential Issues
            {
                regex: /where:\s*\{[^}]*(?!.*companyId)[^}]*\}/,
                description: 'Where clause potentially missing companyId filter',
                severity: 'MEDIUM',
                category: 'ISOLATION',
                impact: 'MEDIUM',
                cwe: 'CWE-284'
            },
            {
                regex: /include:\s*\{[^}]+\}/,
                description: 'Prisma include without isolation verification',
                severity: 'MEDIUM',
                category: 'DATA_EXPOSURE',
                impact: 'MEDIUM',
                cwe: 'CWE-200'
            },
            {
                regex: /OR:\s*\[[^\]]+\]/,
                description: 'OR condition in query - verify all branches have company isolation',
                severity: 'MEDIUM',
                category: 'ISOLATION',
                impact: 'MEDIUM',
                cwe: 'CWE-284'
            },
            
            // LOW - Best Practices
            {
                regex: /console\.log\([^)]*(?:user|company|auth|token)[^)]*\)/,
                description: 'Logging sensitive authentication data',
                severity: 'LOW',
                category: 'INFORMATION_DISCLOSURE',
                impact: 'LOW',
                cwe: 'CWE-532'
            },
            {
                regex: /\.env\.|process\.env\./,
                description: 'Environment variable usage - verify no secrets in logs',
                severity: 'LOW',
                category: 'CONFIGURATION',
                impact: 'LOW',
                cwe: 'CWE-209'
            }
        ];
        
        // Analyze each line with context
        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            const trimmedLine = line.trim();
            
            // Skip comments and empty lines
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || 
                trimmedLine.startsWith('*') || trimmedLine === '') {
                return;
            }
            
            advancedPatterns.forEach(pattern => {
                if (pattern.regex.test(line)) {
                    // Get context (previous and next lines)
                    const context = {
                        before: lines.slice(Math.max(0, index - 2), index).join('\n'),
                        current: line,
                        after: lines.slice(index + 1, Math.min(lines.length, index + 3)).join('\n')
                    };
                    
                    // Check for mitigation patterns in context
                    const fullContext = context.before + context.current + context.after;
                    const hasMitigation = checkMitigation(fullContext, pattern);
                    
                    const issue = {
                        file: relativePath,
                        line: lineNumber,
                        content: trimmedLine,
                        description: pattern.description,
                        severity: hasMitigation ? downgradeSeverity(pattern.severity) : pattern.severity,
                        category: pattern.category,
                        impact: pattern.impact,
                        cwe: pattern.cwe,
                        context: context,
                        mitigation: hasMitigation,
                        riskScore: calculateRiskScore(pattern, hasMitigation)
                    };
                    
                    allIssues.push(issue);
                    fileAnalysis[relativePath].issues.push(issue);
                    
                    // Update counters
                    totalIssues++;
                    switch (issue.severity) {
                        case 'CRITICAL': criticalIssues++; break;
                        case 'HIGH': highIssues++; break;
                        case 'MEDIUM': mediumIssues++; break;
                        case 'LOW': lowIssues++; break;
                    }
                }
            });
            
            // Count positive patterns
            if (/companyId/.test(line)) fileAnalysis[relativePath].patterns.companyFilters++;
            if (/prisma\.\w+\./.test(line)) fileAnalysis[relativePath].patterns.prismaQueries++;
            if (/router\.(get|post|put|delete)/.test(line)) fileAnalysis[relativePath].patterns.apiRoutes++;
            if (/auth|authenticate|requireAuth/.test(line)) fileAnalysis[relativePath].patterns.authChecks++;
        });
        
        // Calculate file risk level
        const fileIssues = fileAnalysis[relativePath].issues;
        const criticalCount = fileIssues.filter(i => i.severity === 'CRITICAL').length;
        const highCount = fileIssues.filter(i => i.severity === 'HIGH').length;
        
        if (criticalCount > 0) {
            fileAnalysis[relativePath].riskLevel = 'CRITICAL';
            fileAnalysis[relativePath].isolationScore = Math.max(0, 100 - (criticalCount * 30) - (highCount * 15));
        } else if (highCount > 2) {
            fileAnalysis[relativePath].riskLevel = 'HIGH';
            fileAnalysis[relativePath].isolationScore = Math.max(20, 100 - (highCount * 20));
        } else if (fileIssues.length > 5) {
            fileAnalysis[relativePath].riskLevel = 'MEDIUM';
            fileAnalysis[relativePath].isolationScore = Math.max(40, 100 - (fileIssues.length * 5));
        }
        
    } catch (error) {
        console.warn(`Warning: Cannot analyze file ${filePath}: ${error.message}`);
    }
}

// Check for mitigation patterns in context
function checkMitigation(context, pattern) {
    const mitigationPatterns = {
        'DATA_EXPOSURE': [/companyId/, /where.*company/, /req\.user\.companyId/],
        'AUTHENTICATION': [/authenticate/, /requireAuth/, /verifyToken/, /checkAuth/],
        'SQL_INJECTION': [/companyId/, /WHERE.*company_id/],
        'ISOLATION': [/companyId/, /req\.user\.companyId/, /company.*filter/]
    };
    
    const patterns = mitigationPatterns[pattern.category] || [];
    return patterns.some(mitPattern => mitPattern.test(context));
}

// Downgrade severity if mitigation is found
function downgradeSeverity(severity) {
    const downgrade = {
        'CRITICAL': 'HIGH',
        'HIGH': 'MEDIUM',
        'MEDIUM': 'LOW',
        'LOW': 'LOW'
    };
    return downgrade[severity] || severity;
}

// Calculate risk score for an issue
function calculateRiskScore(pattern, hasMitigation) {
    const baseScores = {
        'CRITICAL': 10,
        'HIGH': 7,
        'MEDIUM': 4,
        'LOW': 1
    };
    
    let score = baseScores[pattern.severity] || 1;
    if (hasMitigation) score = Math.ceil(score * 0.3);
    
    return score;
}

console.log('🔍 Performing deep security analysis...');

// Find and analyze all files
const srcDir = path.join(__dirname, '..', 'src');
if (fs.existsSync(srcDir)) {
    const files = findFiles(srcDir);
    checkedFiles = files.length;
    
    console.log(`📁 Found ${files.length} files to analyze`);
    console.log('🔬 Performing deep pattern analysis...');
    
    files.forEach((file, index) => {
        if (index % 20 === 0) {
            console.log(`   Progress: ${Math.round((index / files.length) * 100)}%`);
        }
        analyzeFileDeep(file);
    });
} else {
    console.log('❌ src directory not found');
}

// Calculate security metrics
const totalRiskScore = allIssues.reduce((sum, issue) => sum + issue.riskScore, 0);
const maxPossibleRisk = checkedFiles * 50; // Theoretical maximum
securityMetrics.riskScore = Math.round((totalRiskScore / maxPossibleRisk) * 100);
securityMetrics.isolationCoverage = Math.round(
    (Object.values(fileAnalysis).reduce((sum, file) => sum + file.isolationScore, 0) / 
     Object.keys(fileAnalysis).length) || 0
);
securityMetrics.complianceLevel = Math.max(0, 100 - securityMetrics.riskScore);

console.log('📊 Generating comprehensive report...');

// Generate comprehensive report
const report = {
    metadata: {
        timestamp: new Date().toISOString(),
        scanType: 'DEEP_ISOLATION_ANALYSIS',
        version: '2.0.0'
    },
    summary: {
        filesScanned: checkedFiles,
        codeLines: codeLines,
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues
    },
    metrics: securityMetrics,
    issues: allIssues,
    fileAnalysis: fileAnalysis,
    recommendations: generateRecommendations()
};

// Generate recommendations based on findings
function generateRecommendations() {
    const recommendations = [];

    if (criticalIssues > 0) {
        recommendations.push({
            priority: 'URGENT',
            category: 'CRITICAL_FIXES',
            title: 'Fix Critical Security Issues Immediately',
            description: `Found ${criticalIssues} critical security issues that could lead to data breaches.`,
            actions: [
                'Review all Prisma queries without companyId filters',
                'Add company isolation to bulk operations',
                'Secure raw SQL queries with proper filtering',
                'Implement authentication middleware on unprotected routes'
            ]
        });
    }

    if (highIssues > 5) {
        recommendations.push({
            priority: 'HIGH',
            category: 'AUTHENTICATION',
            title: 'Strengthen Authentication & Authorization',
            description: `Found ${highIssues} high-risk authentication issues.`,
            actions: [
                'Add authentication middleware to all API routes',
                'Remove hardcoded company IDs',
                'Implement proper user context validation',
                'Add role-based access control'
            ]
        });
    }

    if (securityMetrics.isolationCoverage < 70) {
        recommendations.push({
            priority: 'MEDIUM',
            category: 'ISOLATION_IMPROVEMENT',
            title: 'Improve Company Isolation Coverage',
            description: `Current isolation coverage is ${securityMetrics.isolationCoverage}%. Target: 90%+`,
            actions: [
                'Add companyId filters to all multi-tenant queries',
                'Implement company isolation middleware',
                'Review and secure include/join operations',
                'Add automated isolation testing'
            ]
        });
    }

    return recommendations;
}

// Save detailed JSON report
fs.writeFileSync(
    path.join(reportsDir, 'deep-isolation-analysis.json'),
    JSON.stringify(report, null, 2)
);

// Generate advanced HTML report
const htmlReport = generateAdvancedHTMLReport(report);
fs.writeFileSync(path.join(reportsDir, 'deep-isolation-report.html'), htmlReport);

// Display comprehensive results
console.log('\n🔒 DEEP ISOLATION SECURITY ANALYSIS RESULTS');
console.log('===========================================');
console.log(`📅 Scan Date: ${new Date().toLocaleString()}`);
console.log(`📁 Files Analyzed: ${checkedFiles}`);
console.log(`📝 Lines of Code: ${codeLines.toLocaleString()}`);
console.log(`📊 Total Issues: ${totalIssues}`);
console.log('');

console.log('🚨 SEVERITY BREAKDOWN:');
console.log('======================');
console.log(`🔴 CRITICAL: ${criticalIssues} (Immediate action required)`);
console.log(`🟠 HIGH:     ${highIssues} (Fix within 24 hours)`);
console.log(`🟡 MEDIUM:   ${mediumIssues} (Fix within 1 week)`);
console.log(`🔵 LOW:      ${lowIssues} (Fix when convenient)`);
console.log('');

console.log('📊 SECURITY METRICS:');
console.log('====================');
console.log(`🛡️  Isolation Coverage: ${securityMetrics.isolationCoverage}%`);
console.log(`⚠️  Risk Score: ${securityMetrics.riskScore}%`);
console.log(`✅ Compliance Level: ${securityMetrics.complianceLevel}%`);
console.log('');

// Show top critical issues with context
if (criticalIssues > 0) {
    console.log('🚨 TOP CRITICAL ISSUES:');
    console.log('=======================');

    allIssues
        .filter(issue => issue.severity === 'CRITICAL')
        .slice(0, 5)
        .forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.description}`);
            console.log(`   📁 ${issue.file}:${issue.line}`);
            console.log(`   💻 ${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}`);
            console.log(`   🏷️  Category: ${issue.category} | CWE: ${issue.cwe}`);
            console.log(`   🛡️  Mitigation: ${issue.mitigation ? 'Partial' : 'None'}`);
            console.log('');
        });
}

// Show files with highest risk
console.log('📁 HIGHEST RISK FILES:');
console.log('======================');

Object.entries(fileAnalysis)
    .filter(([, analysis]) => analysis.riskLevel !== 'LOW')
    .sort(([, a], [, b]) => a.isolationScore - b.isolationScore)
    .slice(0, 10)
    .forEach(([file, analysis]) => {
        const riskIcon = {
            'CRITICAL': '🔴',
            'HIGH': '🟠',
            'MEDIUM': '🟡',
            'LOW': '🔵'
        }[analysis.riskLevel];

        console.log(`${riskIcon} ${file}`);
        console.log(`   Risk Level: ${analysis.riskLevel} | Isolation Score: ${analysis.isolationScore}%`);
        console.log(`   Issues: ${analysis.issues.length} | Lines: ${analysis.totalLines}`);
    });

console.log('');

// Show recommendations
console.log('💡 PRIORITY RECOMMENDATIONS:');
console.log('=============================');

report.recommendations.forEach((rec, index) => {
    const priorityIcon = {
        'URGENT': '🚨',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🔵'
    }[rec.priority];

    console.log(`${priorityIcon} ${rec.title}`);
    console.log(`   ${rec.description}`);
    console.log('   Actions:');
    rec.actions.forEach(action => console.log(`   • ${action}`));
    console.log('');
});

console.log('📁 REPORTS GENERATED:');
console.log('=====================');
console.log('   📊 deep-isolation-analysis.json (Detailed data)');
console.log('   🌐 deep-isolation-report.html (Interactive report)');
console.log('');

// Generate HTML report function
function generateAdvancedHTMLReport(report) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deep Isolation Security Analysis</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; }
        .critical { color: #dc3545; }
        .high { color: #fd7e14; }
        .medium { color: #ffc107; }
        .low { color: #20c997; }
        .success { color: #28a745; }
        .section { background: white; margin-bottom: 30px; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .section-header { background: #f8f9fa; padding: 20px; border-bottom: 1px solid #dee2e6; }
        .section-content { padding: 20px; }
        .issue-card { border-left: 4px solid #667eea; background: #f8f9fa; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0; }
        .issue-card.critical { border-left-color: #dc3545; background: #fff5f5; }
        .issue-card.high { border-left-color: #fd7e14; background: #fff8f0; }
        .issue-card.medium { border-left-color: #ffc107; background: #fffbf0; }
        .code { background: #f1f3f4; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; margin: 10px 0; overflow-x: auto; }
        .file-path { color: #6c757d; font-size: 0.9em; margin-bottom: 8px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-right: 8px; }
        .badge.critical { background: #dc3545; color: white; }
        .badge.high { background: #fd7e14; color: white; }
        .badge.medium { background: #ffc107; color: black; }
        .badge.low { background: #20c997; color: white; }
        .progress-bar { width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; transition: width 0.3s ease; }
        .tabs { display: flex; border-bottom: 1px solid #dee2e6; }
        .tab { padding: 15px 25px; cursor: pointer; border-bottom: 3px solid transparent; }
        .tab.active { border-bottom-color: #667eea; background: #f8f9fa; }
        .tab-content { display: none; padding: 20px; }
        .tab-content.active { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 Deep Isolation Security Analysis</h1>
            <p>Comprehensive Multi-Tenant Security Assessment</p>
            <p>Generated: ${new Date(report.metadata.timestamp).toLocaleString()}</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value success">${report.summary.filesScanned}</div>
                <div>Files Analyzed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.codeLines.toLocaleString()}</div>
                <div>Lines of Code</div>
            </div>
            <div class="metric-card">
                <div class="metric-value critical">${report.summary.criticalIssues}</div>
                <div>Critical Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${report.metrics.isolationCoverage >= 80 ? 'success' : report.metrics.isolationCoverage >= 60 ? 'medium' : 'critical'}">${report.metrics.isolationCoverage}%</div>
                <div>Isolation Coverage</div>
            </div>
        </div>

        <div class="section">
            <div class="section-header">
                <h2>📊 Security Metrics Dashboard</h2>
            </div>
            <div class="section-content">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div>
                        <h4>Isolation Coverage</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${report.metrics.isolationCoverage}%; background: ${report.metrics.isolationCoverage >= 80 ? '#28a745' : report.metrics.isolationCoverage >= 60 ? '#ffc107' : '#dc3545'};"></div>
                        </div>
                        <small>${report.metrics.isolationCoverage}% - Target: 90%+</small>
                    </div>
                    <div>
                        <h4>Risk Score</h4>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${report.metrics.riskScore}%; background: ${report.metrics.riskScore <= 20 ? '#28a745' : report.metrics.riskScore <= 50 ? '#ffc107' : '#dc3545'};"></div>
                        </div>
                        <small>${report.metrics.riskScore}% - Target: <20%</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="tabs">
                <div class="tab active" onclick="showTab('critical-issues')">Critical Issues (${report.summary.criticalIssues})</div>
                <div class="tab" onclick="showTab('all-issues')">All Issues (${report.summary.totalIssues})</div>
                <div class="tab" onclick="showTab('file-analysis')">File Analysis</div>
                <div class="tab" onclick="showTab('recommendations')">Recommendations</div>
            </div>

            <div id="critical-issues" class="tab-content active">
                <h3>🚨 Critical Security Issues</h3>
                ${report.issues.filter(issue => issue.severity === 'CRITICAL').map(issue => `
                <div class="issue-card critical">
                    <div class="file-path">📁 ${issue.file}:${issue.line}</div>
                    <h4>${issue.description}</h4>
                    <div style="margin: 10px 0;">
                        <span class="badge critical">${issue.severity}</span>
                        <span class="badge" style="background: #6c757d; color: white;">${issue.category}</span>
                        <span class="badge" style="background: #17a2b8; color: white;">${issue.cwe}</span>
                        ${issue.mitigation ? '<span class="badge" style="background: #28a745; color: white;">Partial Mitigation</span>' : ''}
                    </div>
                    <div class="code">${issue.content}</div>
                    <small><strong>Risk Score:</strong> ${issue.riskScore}/10</small>
                </div>
                `).join('')}
            </div>

            <div id="all-issues" class="tab-content">
                <h3>📋 All Security Issues</h3>
                ${report.issues.slice(0, 50).map(issue => `
                <div class="issue-card ${issue.severity.toLowerCase()}">
                    <div class="file-path">📁 ${issue.file}:${issue.line}</div>
                    <h4>${issue.description}</h4>
                    <div style="margin: 10px 0;">
                        <span class="badge ${issue.severity.toLowerCase()}">${issue.severity}</span>
                        <span class="badge" style="background: #6c757d; color: white;">${issue.category}</span>
                    </div>
                    <div class="code">${issue.content}</div>
                </div>
                `).join('')}
                ${report.issues.length > 50 ? `<p><em>... and ${report.issues.length - 50} more issues</em></p>` : ''}
            </div>

            <div id="file-analysis" class="tab-content">
                <h3>📁 File Risk Analysis</h3>
                ${Object.entries(report.fileAnalysis)
                    .filter(([, analysis]) => analysis.issues.length > 0)
                    .sort(([, a], [, b]) => a.isolationScore - b.isolationScore)
                    .slice(0, 20)
                    .map(([file, analysis]) => `
                <div class="issue-card ${analysis.riskLevel.toLowerCase()}">
                    <h4>📄 ${file}</h4>
                    <div style="margin: 10px 0;">
                        <span class="badge ${analysis.riskLevel.toLowerCase()}">${analysis.riskLevel}</span>
                        <span>Isolation Score: ${analysis.isolationScore}%</span>
                        <span>Issues: ${analysis.issues.length}</span>
                        <span>Lines: ${analysis.totalLines}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px;">
                        <small>Prisma Queries: ${analysis.patterns.prismaQueries}</small>
                        <small>API Routes: ${analysis.patterns.apiRoutes}</small>
                        <small>Auth Checks: ${analysis.patterns.authChecks}</small>
                        <small>Company Filters: ${analysis.patterns.companyFilters}</small>
                    </div>
                </div>
                `).join('')}
            </div>

            <div id="recommendations" class="tab-content">
                <h3>💡 Security Recommendations</h3>
                ${report.recommendations.map(rec => `
                <div class="issue-card">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <h5>Action Items:</h5>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
                `).join('')}
            </div>
        </div>
    </div>

    <script>
        function showTab(tabId) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Remove active class from all tabs
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });

            // Show selected tab content
            document.getElementById(tabId).classList.add('active');

            // Add active class to clicked tab
            event.target.classList.add('active');
        }
    </script>
</body>
</html>`;
}

// Final assessment
if (criticalIssues > 0) {
    console.log('❌ CRITICAL SECURITY RISKS DETECTED!');
    console.log('   Immediate action required to prevent data breaches.');
    console.log('   🔗 Review detailed report: reports/deep-isolation-report.html');
    process.exit(1);
} else if (highIssues > 5) {
    console.log('⚠️  HIGH SECURITY RISKS DETECTED!');
    console.log('   Address these issues within 24 hours.');
    console.log('   🔗 Review detailed report: reports/deep-isolation-report.html');
    process.exit(1);
} else {
    console.log('✅ No critical security risks detected!');
    console.log('   Continue monitoring and address remaining issues.');
    console.log('   🔗 Review detailed report: reports/deep-isolation-report.html');
    process.exit(0);
}
