# سكريبت تشغيل الخادم الأمامي بشكل مستقر
Write-Host "🚀 تشغيل الخادم الأمامي بشكل مستقر..." -ForegroundColor Green
Write-Host ""

# الانتقال لمجلد الواجهة الأمامية
$frontendPath = "e:\new chat bot\test-chat\test-chat - Copy (7)\frontend"
Set-Location $frontendPath

Write-Host "📁 المجلد الحالي: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# فحص وإيقاف العمليات على المنفذ 3000
Write-Host "🔍 فحص المنفذ 3000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "⚠️ المنفذ 3000 مُستخدم، سيتم إيقاف العمليات..." -ForegroundColor Yellow
    $processes | ForEach-Object {
        $processId = $_.OwningProcess
        try {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "✅ تم إيقاف العملية $processId" -ForegroundColor Green
        } catch {
            Write-Host "⚠️ لم يتم إيقاف العملية $processId" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
}

Write-Host "✅ المنفذ 3000 متاح الآن" -ForegroundColor Green
Write-Host ""

# تنظيف cache
Write-Host "🧹 تنظيف cache..." -ForegroundColor Yellow
if (Test-Path "node_modules\.cache") {
    Remove-Item "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "🚀 بدء تشغيل الخادم الأمامي..." -ForegroundColor Green
Write-Host "⚠️ لا تغلق هذه النافذة!" -ForegroundColor Red
Write-Host "🌐 الرابط: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# تشغيل الخادم مع معالجة الأخطاء
try {
    # تشغيل npm run dev
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru -WorkingDirectory $frontendPath
    
    # انتظار حتى يتوقف الخادم
    $process.WaitForExit()
    
    Write-Host ""
    Write-Host "❌ الخادم توقف!" -ForegroundColor Red
    
} catch {
    Write-Host "❌ خطأ في تشغيل الخادم: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "اضغط أي مفتاح للخروج..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
