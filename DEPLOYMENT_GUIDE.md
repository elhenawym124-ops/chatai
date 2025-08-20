# 🚀 دليل النشر النهائي - منصة التواصل التجارية

## 📋 **متطلبات النشر**

### **متطلبات الخادم:**
- **نظام التشغيل**: Ubuntu 20.04 LTS أو أحدث
- **المعالج**: 4 cores أو أكثر
- **الذاكرة**: 8GB RAM أو أكثر
- **التخزين**: 100GB SSD أو أكثر
- **الشبكة**: اتصال إنترنت مستقر

### **البرامج المطلوبة:**
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Nginx
- Certbot (للـ SSL)

---

## 🔧 **خطوات النشر**

### **1. إعداد الخادم:**

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# تثبيت Nginx و Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# إعادة تسجيل الدخول لتفعيل مجموعة Docker
newgrp docker
```

### **2. استنساخ المشروع:**

```bash
# إنشاء مجلد المشروع
sudo mkdir -p /opt/communication-platform
sudo chown $USER:$USER /opt/communication-platform
cd /opt/communication-platform

# استنساخ المشروع
git clone https://github.com/your-username/communication-platform.git .

# إعداد الصلاحيات
chmod +x scripts/*.sh
```

### **3. إعداد متغيرات البيئة:**

```bash
# نسخ ملف البيئة
cp .env.production.example .env.production

# تحرير متغيرات البيئة
nano .env.production
```

**متغيرات مهمة يجب تعديلها:**
```env
# قاعدة البيانات
DB_NAME=communication_platform_prod
DB_USER=comm_user
DB_PASSWORD=your_secure_password_here
MYSQL_ROOT_PASSWORD=your_root_password_here

# الأمان
JWT_SECRET=your_very_long_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# النطاق
DOMAIN_NAME=your-domain.com
SSL_EMAIL=admin@your-domain.com

# البريد الإلكتروني
EMAIL_HOST=smtp.your-provider.com
EMAIL_USER=your-email@your-domain.com
EMAIL_PASSWORD=your_email_password

# الذكاء الاصطناعي
GEMINI_API_KEY=your_gemini_api_key_here
```

### **4. إعداد SSL:**

```bash
# تشغيل سكريبت إعداد SSL
sudo ./scripts/setup-ssl.sh
```

### **5. بناء ونشر التطبيق:**

```bash
# بناء الصور
docker-compose -f docker-compose.production.yml build

# تشغيل النظام
docker-compose -f docker-compose.production.yml up -d

# التحقق من حالة الخدمات
docker-compose -f docker-compose.production.yml ps
```

### **6. إعداد النسخ الاحتياطي:**

```bash
# إعداد النسخ الاحتياطي التلقائي
sudo crontab -e

# إضافة السطر التالي للنسخ الاحتياطي اليومي في الساعة 2 صباحاً
0 2 * * * /opt/communication-platform/scripts/backup.sh
```

---

## 🔍 **التحقق من النشر**

### **1. فحص الخدمات:**

```bash
# فحص حالة Docker
docker-compose -f docker-compose.production.yml ps

# فحص السجلات
docker-compose -f docker-compose.production.yml logs -f

# فحص استخدام الموارد
docker stats
```

### **2. اختبار الوصول:**

```bash
# اختبار HTTP
curl -I http://your-domain.com/health

# اختبار HTTPS
curl -I https://your-domain.com/health

# اختبار API
curl -I https://your-domain.com/api/v1/health
```

### **3. مراقبة الأداء:**

- **Grafana**: `https://your-domain.com:3000`
- **Prometheus**: `https://your-domain.com:9090`
- **Elasticsearch**: `https://your-domain.com:9200`

---

## 📊 **المراقبة والصيانة**

### **1. مراقبة السجلات:**

```bash
# سجلات التطبيق
docker-compose logs backend

# سجلات قاعدة البيانات
docker-compose logs mysql

# سجلات Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **2. النسخ الاحتياطي:**

```bash
# إنشاء نسخة احتياطية يدوية
./scripts/backup.sh

# استعادة من نسخة احتياطية
./scripts/restore.sh /backup/communication-platform-backup-YYYYMMDD-HHMMSS.tar.gz.enc
```

### **3. التحديثات:**

```bash
# سحب آخر التحديثات
git pull origin main

# إعادة بناء ونشر
docker-compose -f docker-compose.production.yml build
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔒 **الأمان**

### **1. جدار الحماية:**

```bash
# تفعيل UFW
sudo ufw enable

# السماح بالمنافذ المطلوبة
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS

# منع المنافذ الأخرى
sudo ufw deny 3306   # MySQL
sudo ufw deny 6379   # Redis
```

### **2. تحديثات الأمان:**

```bash
# تحديثات تلقائية
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### **3. مراقبة الأمان:**

```bash
# فحص محاولات الدخول الفاشلة
sudo grep "Failed password" /var/log/auth.log

# مراقبة الاتصالات
sudo netstat -tulpn
```

---

## 🚨 **استكشاف الأخطاء**

### **مشاكل شائعة وحلولها:**

#### **1. فشل في بدء الخدمات:**
```bash
# فحص السجلات
docker-compose logs [service-name]

# إعادة تشغيل الخدمة
docker-compose restart [service-name]
```

#### **2. مشاكل قاعدة البيانات:**
```bash
# فحص اتصال قاعدة البيانات
docker exec -it mysql mysql -u root -p

# إعادة تشغيل قاعدة البيانات
docker-compose restart mysql
```

#### **3. مشاكل SSL:**
```bash
# تجديد شهادة SSL
sudo certbot renew

# فحص صحة الشهادة
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

#### **4. مشاكل الأداء:**
```bash
# فحص استخدام الموارد
htop
df -h
free -h

# تنظيف Docker
docker system prune -a
```

---

## 📞 **الدعم والمساعدة**

### **معلومات مهمة:**
- **المنافذ المستخدمة**: 80, 443, 3001, 3306, 6379, 9090, 3000
- **مجلدات مهمة**: `/opt/communication-platform`, `/backup`, `/var/log/nginx`
- **ملفات التكوين**: `.env.production`, `docker-compose.production.yml`

### **أوامر مفيدة:**
```bash
# حالة النظام
./scripts/system-status.sh

# تنظيف النظام
./scripts/cleanup.sh

# إعادة تشغيل كامل
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

---

## ✅ **قائمة التحقق النهائية**

- [ ] تم تثبيت جميع المتطلبات
- [ ] تم إعداد متغيرات البيئة
- [ ] تم إعداد SSL بنجاح
- [ ] جميع الخدمات تعمل بشكل صحيح
- [ ] تم اختبار الوصول للموقع
- [ ] تم إعداد النسخ الاحتياطي
- [ ] تم تكوين المراقبة
- [ ] تم إعداد جدار الحماية
- [ ] تم اختبار استعادة النسخ الاحتياطي

**🎉 تهانينا! تم نشر منصة التواصل التجارية بنجاح!**
