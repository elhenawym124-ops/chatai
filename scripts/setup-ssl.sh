#!/bin/bash

# SSL Setup Script for Communication Platform
# This script sets up SSL certificates using Let's Encrypt

set -e

# Configuration
DOMAIN_NAME=${DOMAIN_NAME:-"your-domain.com"}
EMAIL=${SSL_EMAIL:-"admin@your-domain.com"}
NGINX_CONF_DIR="/etc/nginx"
SSL_DIR="/etc/nginx/ssl"
CERTBOT_DIR="/etc/letsencrypt"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Install required packages
install_dependencies() {
    log "Installing required packages..."
    
    # Update package list
    apt-get update
    
    # Install certbot and nginx plugin
    apt-get install -y certbot python3-certbot-nginx
    
    # Install nginx if not already installed
    if ! command -v nginx &> /dev/null; then
        apt-get install -y nginx
    fi
    
    log "Dependencies installed successfully"
}

# Create SSL directory
create_ssl_directory() {
    log "Creating SSL directory..."
    mkdir -p "$SSL_DIR"
    chmod 755 "$SSL_DIR"
}

# Generate DH parameters for enhanced security
generate_dhparam() {
    log "Generating DH parameters (this may take a while)..."
    
    if [[ ! -f "$SSL_DIR/dhparam.pem" ]]; then
        openssl dhparam -out "$SSL_DIR/dhparam.pem" 2048
        log "DH parameters generated"
    else
        log "DH parameters already exist"
    fi
}

# Create initial nginx configuration for HTTP
create_initial_nginx_config() {
    log "Creating initial nginx configuration..."
    
    cat > "$NGINX_CONF_DIR/sites-available/communication-platform" << EOF
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

    # Enable the site
    ln -sf "$NGINX_CONF_DIR/sites-available/communication-platform" "$NGINX_CONF_DIR/sites-enabled/"
    
    # Remove default nginx site
    rm -f "$NGINX_CONF_DIR/sites-enabled/default"
    
    # Test nginx configuration
    nginx -t || error "Nginx configuration test failed"
    
    # Reload nginx
    systemctl reload nginx
    
    log "Initial nginx configuration created"
}

# Obtain SSL certificate
obtain_ssl_certificate() {
    log "Obtaining SSL certificate from Let's Encrypt..."
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Obtain certificate using standalone mode
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" \
        -d "$DOMAIN_NAME" \
        -d "www.$DOMAIN_NAME"
    
    if [[ $? -eq 0 ]]; then
        log "SSL certificate obtained successfully"
    else
        error "Failed to obtain SSL certificate"
    fi
    
    # Start nginx again
    systemctl start nginx
}

# Create production nginx configuration with SSL
create_ssl_nginx_config() {
    log "Creating SSL nginx configuration..."
    
    cat > "$NGINX_CONF_DIR/sites-available/communication-platform" << EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=1r/s;

# Upstream backend servers
upstream backend {
    least_conn;
    server backend:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    # SSL Configuration
    ssl_certificate $CERTBOT_DIR/live/$DOMAIN_NAME/fullchain.pem;
    ssl_certificate_key $CERTBOT_DIR/live/$DOMAIN_NAME/privkey.pem;
    ssl_trusted_certificate $CERTBOT_DIR/live/$DOMAIN_NAME/chain.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_dhparam $SSL_DIR/dhparam.pem;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: https:;" always;
    
    # Hide nginx version
    server_tokens off;
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html index.htm;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Client settings
    client_max_body_size 50M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
    
    # API proxy to backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Login endpoint with stricter rate limiting
    location /api/v1/auth/login {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files with long-term caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        
        # CORS for fonts
        location ~* \\.(woff|woff2|ttf|eot)\$ {
            add_header Access-Control-Allow-Origin *;
        }
    }
    
    # HTML files with no caching
    location ~* \\.html\$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }
    
    # React Router support
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Deny access to backup files
    location ~ ~\$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Error pages
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

    # Test nginx configuration
    nginx -t || error "SSL nginx configuration test failed"
    
    # Reload nginx
    systemctl reload nginx
    
    log "SSL nginx configuration created and loaded"
}

# Setup automatic certificate renewal
setup_auto_renewal() {
    log "Setting up automatic certificate renewal..."
    
    # Create renewal script
    cat > "/usr/local/bin/renew-ssl.sh" << EOF
#!/bin/bash
certbot renew --quiet --nginx
systemctl reload nginx
EOF
    
    chmod +x "/usr/local/bin/renew-ssl.sh"
    
    # Add cron job for automatic renewal
    (crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -
    
    log "Automatic certificate renewal configured"
}

# Test SSL configuration
test_ssl_config() {
    log "Testing SSL configuration..."
    
    # Test SSL certificate
    echo | openssl s_client -servername "$DOMAIN_NAME" -connect "$DOMAIN_NAME:443" 2>/dev/null | openssl x509 -noout -dates
    
    # Test HTTP to HTTPS redirect
    curl -I "http://$DOMAIN_NAME" | grep -q "301\|302" && log "HTTP redirect working" || warn "HTTP redirect may not be working"
    
    # Test HTTPS
    curl -I "https://$DOMAIN_NAME/health" | grep -q "200" && log "HTTPS working" || warn "HTTPS may not be working"
    
    log "SSL configuration test completed"
}

# Main function
main() {
    log "Starting SSL setup for $DOMAIN_NAME"
    
    check_root
    install_dependencies
    create_ssl_directory
    generate_dhparam
    create_initial_nginx_config
    obtain_ssl_certificate
    create_ssl_nginx_config
    setup_auto_renewal
    test_ssl_config
    
    log "SSL setup completed successfully!"
    log "Your site should now be accessible at https://$DOMAIN_NAME"
    log "Certificate will be automatically renewed every 3 months"
}

# Run main function
main "$@"
