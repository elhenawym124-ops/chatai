# Communication Platform - Makefile
# مساعد لإدارة المشروع وتشغيل المهام الشائعة

.PHONY: help install dev build test lint clean docker db docs

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

## Help - عرض قائمة الأوامر المتاحة
help:
	@echo "$(BLUE)Communication Platform - أوامر المشروع$(RESET)"
	@echo ""
	@echo "$(GREEN)أوامر التطوير:$(RESET)"
	@echo "  $(YELLOW)install$(RESET)     - تثبيت جميع التبعيات"
	@echo "  $(YELLOW)dev$(RESET)         - تشغيل الخوادم في وضع التطوير"
	@echo "  $(YELLOW)build$(RESET)       - بناء المشروع للإنتاج"
	@echo "  $(YELLOW)test$(RESET)        - تشغيل جميع الاختبارات"
	@echo "  $(YELLOW)lint$(RESET)        - فحص جودة الكود"
	@echo "  $(YELLOW)format$(RESET)      - تنسيق الكود"
	@echo "  $(YELLOW)clean$(RESET)       - تنظيف ملفات البناء"
	@echo ""
	@echo "$(GREEN)أوامر قاعدة البيانات:$(RESET)"
	@echo "  $(YELLOW)db-setup$(RESET)    - إعداد قاعدة البيانات"
	@echo "  $(YELLOW)db-migrate$(RESET)  - تشغيل migrations"
	@echo "  $(YELLOW)db-seed$(RESET)     - إضافة بيانات أولية"
	@echo "  $(YELLOW)db-reset$(RESET)    - إعادة تعيين قاعدة البيانات"
	@echo "  $(YELLOW)db-studio$(RESET)   - فتح Prisma Studio"
	@echo ""
	@echo "$(GREEN)أوامر Docker:$(RESET)"
	@echo "  $(YELLOW)docker-up$(RESET)   - تشغيل الحاويات"
	@echo "  $(YELLOW)docker-down$(RESET) - إيقاف الحاويات"
	@echo "  $(YELLOW)docker-build$(RESET)- بناء الحاويات"
	@echo "  $(YELLOW)docker-logs$(RESET) - عرض سجلات الحاويات"
	@echo ""
	@echo "$(GREEN)أوامر التوثيق:$(RESET)"
	@echo "  $(YELLOW)docs-serve$(RESET)  - تشغيل خادم التوثيق"
	@echo "  $(YELLOW)docs-build$(RESET)  - بناء التوثيق"
	@echo ""

## Install - تثبيت جميع التبعيات
install:
	@echo "$(BLUE)تثبيت التبعيات...$(RESET)"
	npm install
	@echo "$(BLUE)تثبيت تبعيات Backend...$(RESET)"
	cd backend && npm install
	@echo "$(BLUE)تثبيت تبعيات Frontend...$(RESET)"
	cd frontend && npm install
	@echo "$(BLUE)تثبيت تبعيات Shared...$(RESET)"
	cd shared && npm install
	@echo "$(GREEN)✅ تم تثبيت جميع التبعيات بنجاح$(RESET)"

## Development - تشغيل الخوادم في وضع التطوير
dev:
	@echo "$(BLUE)تشغيل الخوادم في وضع التطوير...$(RESET)"
	npm run dev

## Build - بناء المشروع للإنتاج
build:
	@echo "$(BLUE)بناء المشروع للإنتاج...$(RESET)"
	npm run build
	@echo "$(GREEN)✅ تم بناء المشروع بنجاح$(RESET)"

## Test - تشغيل جميع الاختبارات
test:
	@echo "$(BLUE)تشغيل الاختبارات...$(RESET)"
	npm run test

## Test Coverage - تشغيل الاختبارات مع تقرير التغطية
test-coverage:
	@echo "$(BLUE)تشغيل الاختبارات مع تقرير التغطية...$(RESET)"
	cd backend && npm run test:coverage
	cd frontend && npm run test:coverage

## Lint - فحص جودة الكود
lint:
	@echo "$(BLUE)فحص جودة الكود...$(RESET)"
	npm run lint

## Lint Fix - إصلاح مشاكل جودة الكود
lint-fix:
	@echo "$(BLUE)إصلاح مشاكل جودة الكود...$(RESET)"
	npm run lint:fix

## Format - تنسيق الكود
format:
	@echo "$(BLUE)تنسيق الكود...$(RESET)"
	npm run format

## Clean - تنظيف ملفات البناء
clean:
	@echo "$(BLUE)تنظيف ملفات البناء...$(RESET)"
	npm run clean
	@echo "$(GREEN)✅ تم تنظيف ملفات البناء$(RESET)"

## Database Setup - إعداد قاعدة البيانات
db-setup:
	@echo "$(BLUE)إعداد قاعدة البيانات...$(RESET)"
	cd backend && npx prisma generate
	cd backend && npx prisma migrate dev
	cd backend && npx prisma db seed
	@echo "$(GREEN)✅ تم إعداد قاعدة البيانات بنجاح$(RESET)"

## Database Migrate - تشغيل migrations
db-migrate:
	@echo "$(BLUE)تشغيل migrations...$(RESET)"
	cd backend && npx prisma migrate dev

## Database Seed - إضافة بيانات أولية
db-seed:
	@echo "$(BLUE)إضافة بيانات أولية...$(RESET)"
	cd backend && npx prisma db seed

## Database Reset - إعادة تعيين قاعدة البيانات
db-reset:
	@echo "$(YELLOW)⚠️  إعادة تعيين قاعدة البيانات (سيتم حذف جميع البيانات)$(RESET)"
	@read -p "هل أنت متأكد؟ (y/N): " confirm && [ "$$confirm" = "y" ]
	cd backend && npx prisma migrate reset

## Database Studio - فتح Prisma Studio
db-studio:
	@echo "$(BLUE)فتح Prisma Studio...$(RESET)"
	cd backend && npx prisma studio

## Docker Up - تشغيل الحاويات
docker-up:
	@echo "$(BLUE)تشغيل حاويات Docker...$(RESET)"
	docker-compose up -d
	@echo "$(GREEN)✅ تم تشغيل الحاويات بنجاح$(RESET)"

## Docker Down - إيقاف الحاويات
docker-down:
	@echo "$(BLUE)إيقاف حاويات Docker...$(RESET)"
	docker-compose down
	@echo "$(GREEN)✅ تم إيقاف الحاويات$(RESET)"

## Docker Build - بناء الحاويات
docker-build:
	@echo "$(BLUE)بناء حاويات Docker...$(RESET)"
	docker-compose build

## Docker Logs - عرض سجلات الحاويات
docker-logs:
	@echo "$(BLUE)عرض سجلات الحاويات...$(RESET)"
	docker-compose logs -f

## Documentation Serve - تشغيل خادم التوثيق
docs-serve:
	@echo "$(BLUE)تشغيل خادم التوثيق...$(RESET)"
	npm run docs:serve

## Documentation Build - بناء التوثيق
docs-build:
	@echo "$(BLUE)بناء التوثيق...$(RESET)"
	npm run docs:generate

## Security Audit - فحص الأمان
security:
	@echo "$(BLUE)فحص الأمان...$(RESET)"
	npm run security:audit

## Security Fix - إصلاح مشاكل الأمان
security-fix:
	@echo "$(BLUE)إصلاح مشاكل الأمان...$(RESET)"
	npm run security:fix

## Release - إنشاء إصدار جديد
release:
	@echo "$(BLUE)إنشاء إصدار جديد...$(RESET)"
	npm run release

## Setup - إعداد المشروع من الصفر
setup: install db-setup
	@echo "$(GREEN)✅ تم إعداد المشروع بنجاح$(RESET)"
	@echo "$(BLUE)يمكنك الآن تشغيل: make dev$(RESET)"

## Full Test - تشغيل جميع الاختبارات والفحوصات
full-test: lint test test-coverage
	@echo "$(GREEN)✅ تم تشغيل جميع الاختبارات والفحوصات بنجاح$(RESET)"

## Production Deploy - نشر الإنتاج
deploy: clean build test
	@echo "$(BLUE)نشر الإنتاج...$(RESET)"
	@echo "$(YELLOW)تأكد من تحديث متغيرات البيئة للإنتاج$(RESET)"
	# Add deployment commands here

## Check Status - فحص حالة النظام
status:
	@echo "$(BLUE)فحص حالة النظام...$(RESET)"
	@echo "Node.js: $$(node --version)"
	@echo "npm: $$(npm --version)"
	@echo "Docker: $$(docker --version 2>/dev/null || echo 'غير مثبت')"
	@echo "PostgreSQL: $$(psql --version 2>/dev/null || echo 'غير مثبت')"
	@echo "Redis: $$(redis-cli --version 2>/dev/null || echo 'غير مثبت')"
