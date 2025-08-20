#!/usr/bin/env node

// Run all security checks and generate comprehensive report

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 COMPREHENSIVE SECURITY ANALYSIS SUITE');
console.log('========================================');
console.log('Running all available security checks...');
console.log('');

const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
}

// Function to run a command and capture output
function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 Running: ${command} ${args.join(' ')}`);
        
        const process = spawn(command, args, {
            cwd: path.join(__dirname, '..'),
            stdio: ['inherit', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        process.on('close', (code) => {
            resolve({
                code,
                stdout,
                stderr,
                success: code === 0
            });
        });
        
        process.on('error', (error) => {
            reject(error);
        });
    });
}

// Main execution
async function runAllChecks() {
    const results = {};
    const startTime = Date.now();
    
    console.log('📊 Step 1: Basic Isolation Check');
    console.log('================================');
    try {
        const basicResult = await runCommand('node', ['scripts/check-isolation-basic.js']);
        results.basic = {
            success: basicResult.success,
            output: basicResult.stdout,
            error: basicResult.stderr
        };
        console.log(basicResult.success ? '✅ Basic check completed' : '❌ Basic check failed');
    } catch (error) {
        console.log('❌ Basic check error:', error.message);
        results.basic = { success: false, error: error.message };
    }
    
    console.log('');
    console.log('🔬 Step 2: Deep Isolation Analysis');
    console.log('==================================');
    try {
        const deepResult = await runCommand('node', ['scripts/deep-isolation-check.js']);
        results.deep = {
            success: deepResult.success,
            output: deepResult.stdout,
            error: deepResult.stderr
        };
        console.log(deepResult.success ? '✅ Deep analysis completed' : '❌ Deep analysis failed');
    } catch (error) {
        console.log('❌ Deep analysis error:', error.message);
        results.deep = { success: false, error: error.message };
    }
    
    console.log('');
    console.log('📋 Step 3: Generating Summary Reports');
    console.log('=====================================');
    
    // Load and analyze results
    const summaryData = {
        timestamp: new Date().toISOString(),
        executionTime: Date.now() - startTime,
        checks: results,
        summary: {}
    };
    
    // Try to load basic report
    try {
        const basicReportPath = path.join(reportsDir, 'isolation-check.json');
        if (fs.existsSync(basicReportPath)) {
            const basicReport = JSON.parse(fs.readFileSync(basicReportPath, 'utf8'));
            summaryData.summary.basic = {
                filesScanned: basicReport.filesScanned,
                totalIssues: basicReport.totalIssues,
                criticalIssues: basicReport.criticalIssues,
                warningIssues: basicReport.warningIssues
            };
        }
    } catch (error) {
        console.log('⚠️  Could not load basic report');
    }
    
    // Try to load deep report
    try {
        const deepReportPath = path.join(reportsDir, 'deep-isolation-analysis.json');
        if (fs.existsSync(deepReportPath)) {
            const deepReport = JSON.parse(fs.readFileSync(deepReportPath, 'utf8'));
            summaryData.summary.deep = {
                filesScanned: deepReport.summary.filesScanned,
                codeLines: deepReport.summary.codeLines,
                totalIssues: deepReport.summary.totalIssues,
                criticalIssues: deepReport.summary.criticalIssues,
                highIssues: deepReport.summary.highIssues,
                mediumIssues: deepReport.summary.mediumIssues,
                lowIssues: deepReport.summary.lowIssues,
                metrics: deepReport.metrics
            };
        }
    } catch (error) {
        console.log('⚠️  Could not load deep report');
    }
    
    // Save comprehensive summary
    fs.writeFileSync(
        path.join(reportsDir, 'comprehensive-security-summary.json'),
        JSON.stringify(summaryData, null, 2)
    );
    
    console.log('');
    console.log('📊 COMPREHENSIVE SECURITY ANALYSIS RESULTS');
    console.log('==========================================');
    console.log(`⏱️  Total execution time: ${Math.round(summaryData.executionTime / 1000)} seconds`);
    console.log('');
    
    // Display results
    if (summaryData.summary.deep) {
        const deep = summaryData.summary.deep;
        console.log('🔬 DEEP ANALYSIS RESULTS:');
        console.log('=========================');
        console.log(`📁 Files Analyzed: ${deep.filesScanned}`);
        console.log(`📝 Lines of Code: ${deep.codeLines?.toLocaleString() || 'N/A'}`);
        console.log(`📊 Total Issues: ${deep.totalIssues}`);
        console.log(`🔴 Critical: ${deep.criticalIssues}`);
        console.log(`🟠 High: ${deep.highIssues}`);
        console.log(`🟡 Medium: ${deep.mediumIssues}`);
        console.log(`🔵 Low: ${deep.lowIssues}`);
        console.log('');
        
        if (deep.metrics) {
            console.log('📈 SECURITY METRICS:');
            console.log('====================');
            console.log(`🛡️  Isolation Coverage: ${deep.metrics.isolationCoverage}%`);
            console.log(`⚠️  Risk Score: ${deep.metrics.riskScore}%`);
            console.log(`✅ Compliance Level: ${deep.metrics.complianceLevel}%`);
            console.log('');
        }
    } else if (summaryData.summary.basic) {
        const basic = summaryData.summary.basic;
        console.log('📊 BASIC ANALYSIS RESULTS:');
        console.log('==========================');
        console.log(`📁 Files Scanned: ${basic.filesScanned}`);
        console.log(`📊 Total Issues: ${basic.totalIssues}`);
        console.log(`🔴 Critical: ${basic.criticalIssues}`);
        console.log(`⚠️  Warnings: ${basic.warningIssues}`);
        console.log('');
    }
    
    console.log('📁 GENERATED REPORTS:');
    console.log('=====================');
    
    const reportFiles = [
        'isolation-check.json',
        'isolation-report.html',
        'deep-isolation-analysis.json',
        'deep-isolation-report.html',
        'comprehensive-security-summary.json'
    ];
    
    reportFiles.forEach(file => {
        const filePath = path.join(reportsDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const size = (stats.size / 1024).toFixed(1);
            console.log(`✅ ${file} (${size} KB)`);
        } else {
            console.log(`❌ ${file} (not found)`);
        }
    });
    
    console.log('');
    console.log('🔗 QUICK ACCESS:');
    console.log('================');
    console.log('📊 Basic Report: reports/isolation-report.html');
    console.log('🔬 Deep Analysis: reports/deep-isolation-report.html');
    console.log('📋 Summary Data: reports/comprehensive-security-summary.json');
    console.log('');
    
    // Final assessment
    const criticalIssues = summaryData.summary.deep?.criticalIssues || summaryData.summary.basic?.criticalIssues || 0;
    const highIssues = summaryData.summary.deep?.highIssues || 0;
    
    console.log('🎯 SECURITY ASSESSMENT:');
    console.log('=======================');
    
    if (criticalIssues > 0) {
        console.log('❌ CRITICAL SECURITY VULNERABILITIES DETECTED!');
        console.log(`   Found ${criticalIssues} critical issues requiring immediate attention`);
        console.log('   🚨 Production deployment is NOT RECOMMENDED');
        console.log('   📋 Review: reports/deep-isolation-report.html');
        return 2; // Critical exit code
    } else if (highIssues > 10) {
        console.log('⚠️  HIGH SECURITY RISKS DETECTED!');
        console.log(`   Found ${highIssues} high-risk issues`);
        console.log('   🟠 Address within 24 hours');
        console.log('   📋 Review: reports/deep-isolation-report.html');
        return 1; // Warning exit code
    } else {
        console.log('✅ SECURITY POSTURE IS ACCEPTABLE');
        console.log('   Continue monitoring and address remaining issues');
        console.log('   📋 Review: reports/deep-isolation-report.html');
        return 0; // Success exit code
    }
}

// Run the comprehensive check
runAllChecks()
    .then(exitCode => {
        console.log('');
        console.log('🏁 Comprehensive security analysis completed!');
        process.exit(exitCode);
    })
    .catch(error => {
        console.error('❌ Error running comprehensive security check:', error);
        process.exit(3);
    });
