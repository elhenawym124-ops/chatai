#!/bin/bash

# Script لفحص مشاكل العزل (Isolation) باستخدام Semgrep
# Company Isolation Security Check Script

echo "🔍 Starting Company Isolation Security Check..."
echo "================================================"

# التحقق من وجود Semgrep
if ! command -v semgrep &> /dev/null; then
    echo "❌ Semgrep not found. Installing..."
    pip install semgrep
fi

# إنشاء مجلد للتقارير
mkdir -p reports

# تشغيل فحص العزل الأساسي
echo "📊 Running basic isolation checks..."
semgrep --config=.semgrep/isolation-rules.yml \
    --output=reports/isolation-basic.json \
    --json \
    --verbose \
    src/

# تشغيل فحص العزل المتقدم
echo "🔬 Running advanced isolation checks..."
semgrep --config=.semgrep/advanced-isolation-rules.yml \
    --output=reports/isolation-advanced.json \
    --json \
    --verbose \
    src/

# تشغيل فحص أمان عام
echo "🛡️ Running general security checks..."
semgrep --config=auto \
    --output=reports/security-general.json \
    --json \
    --severity=ERROR \
    --severity=WARNING \
    src/

# دمج النتائج وإنشاء تقرير HTML
echo "📋 Generating combined report..."
cat > reports/isolation-report.html << 'EOF'
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تقرير فحص العزل الأمني</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .success { color: #28a745; }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
        }
        .finding {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 15px 0;
            border-radius: 0 5px 5px 0;
        }
        .finding.error {
            border-left-color: #dc3545;
            background: #fff5f5;
        }
        .finding.warning {
            border-left-color: #ffc107;
            background: #fffbf0;
        }
        .code {
            background: #f1f3f4;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            overflow-x: auto;
        }
        .file-path {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔒 تقرير فحص العزل الأمني</h1>
            <p>فحص شامل لمشاكل العزل في النظام متعدد المستأجرين</p>
            <p>تاريخ الفحص: $(date)</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number error" id="error-count">0</div>
                <div>أخطاء حرجة</div>
            </div>
            <div class="stat-card">
                <div class="stat-number warning" id="warning-count">0</div>
                <div>تحذيرات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number info" id="info-count">0</div>
                <div>معلومات</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success" id="files-scanned">0</div>
                <div>ملفات تم فحصها</div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>🎯 ملخص النتائج</h2>
                <div id="summary">
                    <p>يتم تحديث النتائج تلقائياً...</p>
                </div>
            </div>
            
            <div class="section">
                <h2>🔍 مشاكل العزل المكتشفة</h2>
                <div id="findings">
                    <p>يتم تحميل النتائج...</p>
                </div>
            </div>
            
            <div class="section">
                <h2>📊 توصيات الإصلاح</h2>
                <div id="recommendations">
                    <ul>
                        <li>تأكد من إضافة <code>companyId</code> في جميع استعلامات Prisma</li>
                        <li>استخدم middleware للتحقق من العزل في جميع API routes</li>
                        <li>تجنب استخدام <code>findMany()</code> بدون فلترة</li>
                        <li>استخدم <code>req.user.companyId</code> من authentication context</li>
                        <li>تجنب hardcoding company IDs في الكود</li>
                        <li>تأكد من عزل البيانات في العمليات المتقدمة مثل transactions</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // سيتم إضافة JavaScript لتحميل النتائج من JSON files
        console.log('تقرير العزل الأمني جاهز');
    </script>
</body>
</html>
EOF

# عرض ملخص النتائج
echo ""
echo "📋 Summary of Isolation Check Results:"
echo "======================================"

# عد النتائج من الملفات
if [ -f "reports/isolation-basic.json" ]; then
    BASIC_ERRORS=$(jq '[.results[] | select(.extra.severity == "ERROR")] | length' reports/isolation-basic.json 2>/dev/null || echo "0")
    BASIC_WARNINGS=$(jq '[.results[] | select(.extra.severity == "WARNING")] | length' reports/isolation-basic.json 2>/dev/null || echo "0")
    echo "🔍 Basic Isolation Check:"
    echo "   - Errors: $BASIC_ERRORS"
    echo "   - Warnings: $BASIC_WARNINGS"
fi

if [ -f "reports/isolation-advanced.json" ]; then
    ADVANCED_ERRORS=$(jq '[.results[] | select(.extra.severity == "ERROR")] | length' reports/isolation-advanced.json 2>/dev/null || echo "0")
    ADVANCED_WARNINGS=$(jq '[.results[] | select(.extra.severity == "WARNING")] | length' reports/isolation-advanced.json 2>/dev/null || echo "0")
    echo "🔬 Advanced Isolation Check:"
    echo "   - Errors: $ADVANCED_ERRORS"
    echo "   - Warnings: $ADVANCED_WARNINGS"
fi

echo ""
echo "📁 Reports generated in: reports/"
echo "   - isolation-basic.json"
echo "   - isolation-advanced.json"
echo "   - security-general.json"
echo "   - isolation-report.html"
echo ""
echo "🌐 Open reports/isolation-report.html in browser for detailed view"
echo ""

# إظهار أهم النتائج
echo "🚨 Top Critical Issues Found:"
echo "============================"
if [ -f "reports/isolation-basic.json" ]; then
    jq -r '.results[] | select(.extra.severity == "ERROR") | "❌ \(.extra.message) in \(.path):\(.start.line)"' reports/isolation-basic.json 2>/dev/null | head -10
fi

echo ""
echo "⚠️  Top Warnings Found:"
echo "======================"
if [ -f "reports/isolation-basic.json" ]; then
    jq -r '.results[] | select(.extra.severity == "WARNING") | "⚠️  \(.extra.message) in \(.path):\(.start.line)"' reports/isolation-basic.json 2>/dev/null | head -10
fi

echo ""
echo "✅ Isolation security check completed!"
