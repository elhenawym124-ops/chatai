# PowerShell Script للكشف عن مشاكل العزل
# Company Isolation Security Check - Simple Version

Write-Host "🔍 Starting Company Isolation Security Check..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# إنشاء مجلد للتقارير
if (!(Test-Path "reports")) {
    New-Item -ItemType Directory -Path "reports"
}

# متغيرات للإحصائيات
$totalIssues = 0
$criticalIssues = 0
$warningIssues = 0
$checkedFiles = 0

# دالة للبحث عن patterns
function Find-Pattern {
    param(
        [string]$Pattern,
        [string]$Description,
        [string]$Severity,
        [string[]]$Extensions = @("*.js", "*.ts")
    )
    
    Write-Host "🔍 Checking: $Description" -ForegroundColor Yellow
    
    $issues = @()
    foreach ($ext in $Extensions) {
        $files = Get-ChildItem -Path "src" -Filter $ext -Recurse
        foreach ($file in $files) {
            $lineNumber = 1
            $content = Get-Content $file.FullName
            foreach ($line in $content) {
                if ($line -match $Pattern) {
                    $issues += [PSCustomObject]@{
                        File = $file.FullName.Replace((Get-Location).Path + "\", "")
                        Line = $lineNumber
                        Content = $line.Trim()
                        Description = $Description
                        Severity = $Severity
                    }
                    
                    if ($Severity -eq "CRITICAL") {
                        $script:criticalIssues++
                    } else {
                        $script:warningIssues++
                    }
                    $script:totalIssues++
                }
                $lineNumber++
            }
        }
    }
    
    return $issues
}

Write-Host ""
Write-Host "🔍 Running Isolation Checks..." -ForegroundColor Green

# فحص 1: Prisma findMany بدون companyId
$issues1 = Find-Pattern -Pattern "prisma\.\w+\.findMany\(\s*\{[^}]*\}\s*\)" -Description "Prisma findMany without companyId filter" -Severity "CRITICAL"

# فحص 2: Prisma findMany بدون parameters
$issues2 = Find-Pattern -Pattern "prisma\.\w+\.findMany\(\s*\)" -Description "Prisma findMany without any filters" -Severity "CRITICAL"

# فحص 3: Prisma queries مع where لكن بدون companyId
$issues3 = Find-Pattern -Pattern "where:\s*\{[^}]*\}" -Description "Prisma where clause potentially missing companyId" -Severity "WARNING"

# فحص 4: API routes بدون middleware
$issues4 = Find-Pattern -Pattern "router\.(get|post|put|delete)\(" -Description "API route potentially missing isolation middleware" -Severity "WARNING"

# فحص 5: hardcoded company IDs
$issues5 = Find-Pattern -Pattern "companyId:\s*['\"][a-zA-Z0-9]{20,}['\"]" -Description "Hardcoded company ID found" -Severity "WARNING"

# فحص 6: Raw SQL queries
$issues6 = Find-Pattern -Pattern "\$queryRaw|\$executeRaw" -Description "Raw SQL query without company isolation" -Severity "CRITICAL"

# فحص 7: updateMany/deleteMany بدون where
$issues7 = Find-Pattern -Pattern "prisma\.\w+\.(updateMany|deleteMany)\(" -Description "Bulk operation without proper filtering" -Severity "CRITICAL"

# دمج جميع النتائج
$allIssues = $issues1 + $issues2 + $issues3 + $issues4 + $issues5 + $issues6 + $issues7

# حساب عدد الملفات المفحوصة
$checkedFiles = (Get-ChildItem -Path "src" -Include "*.js", "*.ts" -Recurse).Count

Write-Host ""
Write-Host "📊 Scan Results:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "Files Scanned: $checkedFiles" -ForegroundColor White
Write-Host "Total Issues: $totalIssues" -ForegroundColor White
Write-Host "Critical Issues: $criticalIssues" -ForegroundColor Red
Write-Host "Warning Issues: $warningIssues" -ForegroundColor Yellow

# إنشاء تقرير JSON
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    filesScanned = $checkedFiles
    totalIssues = $totalIssues
    criticalIssues = $criticalIssues
    warningIssues = $warningIssues
    issues = $allIssues
}

$report | ConvertTo-Json -Depth 10 | Out-File -FilePath "reports/isolation-check.json" -Encoding UTF8

Write-Host ""
Write-Host "🚨 Critical Issues Found:" -ForegroundColor Red
Write-Host "=========================" -ForegroundColor Red

$criticalFound = $false
foreach ($issue in $allIssues | Where-Object { $_.Severity -eq "CRITICAL" }) {
    $criticalFound = $true
    Write-Host "❌ $($issue.Description)" -ForegroundColor Red
    Write-Host "   File: $($issue.File):$($issue.Line)" -ForegroundColor Gray
    Write-Host "   Code: $($issue.Content)" -ForegroundColor Gray
    Write-Host ""
}

if (-not $criticalFound) {
    Write-Host "✅ No critical issues found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  Warning Issues Found:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

$warningFound = $false
foreach ($issue in $allIssues | Where-Object { $_.Severity -eq "WARNING" } | Select-Object -First 10) {
    $warningFound = $true
    Write-Host "⚠️  $($issue.Description)" -ForegroundColor Yellow
    Write-Host "   File: $($issue.File):$($issue.Line)" -ForegroundColor Gray
    Write-Host "   Code: $($issue.Content)" -ForegroundColor Gray
    Write-Host ""
}

if (-not $warningFound) {
    Write-Host "✅ No warning issues found!" -ForegroundColor Green
}

# إنشاء تقرير HTML مبسط
$htmlReport = @"
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير فحص العزل الأمني</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; direction: rtl; }
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
        <h1>🔒 تقرير فحص العزل الأمني</h1>
        <p>تاريخ الفحص: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
    </div>
    
    <div class="stats">
        <div class="stat">
            <div class="success" style="font-size: 2em;">$checkedFiles</div>
            <div>ملفات تم فحصها</div>
        </div>
        <div class="stat">
            <div style="font-size: 2em;">$totalIssues</div>
            <div>إجمالي المشاكل</div>
        </div>
        <div class="stat">
            <div class="critical" style="font-size: 2em;">$criticalIssues</div>
            <div>مشاكل حرجة</div>
        </div>
        <div class="stat">
            <div class="warning" style="font-size: 2em;">$warningIssues</div>
            <div>تحذيرات</div>
        </div>
    </div>
    
    <h2>🚨 المشاكل المكتشفة</h2>
"@

foreach ($issue in $allIssues) {
    $cssClass = if ($issue.Severity -eq "CRITICAL") { "critical" } else { "warning" }
    $htmlReport += @"
    <div class="issue $cssClass">
        <h3>$($issue.Description)</h3>
        <p><strong>الملف:</strong> $($issue.File):$($issue.Line)</p>
        <div class="code">$($issue.Content)</div>
    </div>
"@
}

$htmlReport += @"
    
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
"@

$htmlReport | Out-File -FilePath "reports/isolation-report.html" -Encoding UTF8

Write-Host ""
Write-Host "📁 Reports generated:" -ForegroundColor Cyan
Write-Host "   - reports/isolation-check.json" -ForegroundColor White
Write-Host "   - reports/isolation-report.html" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Open reports/isolation-report.html in browser for detailed view" -ForegroundColor Cyan

if ($criticalIssues -gt 0) {
    Write-Host ""
    Write-Host "❌ CRITICAL ISSUES FOUND! Please fix immediately." -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ No critical isolation issues found!" -ForegroundColor Green
    exit 0
}
