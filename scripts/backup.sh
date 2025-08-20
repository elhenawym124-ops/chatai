#!/bin/bash

# Automated Backup Script for Communication Platform
# This script creates encrypted backups of database, files, and configurations

set -e

# Configuration
BACKUP_DIR="/backup/output"
TEMP_DIR="/tmp/backup-$(date +%Y%m%d-%H%M%S)"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Database configuration
DB_HOST=${DB_HOST:-"mysql"}
DB_PORT=${DB_PORT:-"3306"}
DB_NAME=${DB_NAME:-"communication_platform"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-""}

# Redis configuration
REDIS_HOST=${REDIS_HOST:-"redis"}
REDIS_PORT=${REDIS_PORT:-"6379"}
REDIS_PASSWORD=${REDIS_PASSWORD:-""}

# Encryption configuration
ENCRYPTION_KEY=${BACKUP_ENCRYPTION_KEY:-""}
COMPRESSION=${BACKUP_COMPRESSION:-"true"}

# S3 configuration for remote backup
S3_BUCKET=${S3_BACKUP_BUCKET:-""}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-""}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-""}

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
    cleanup
    exit 1
}

# Cleanup function
cleanup() {
    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        log "Cleaned up temporary directory"
    fi
}

# Create directories
create_directories() {
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_DIR"
    log "Created backup directories"
}

# Check dependencies
check_dependencies() {
    local deps=("mysqldump" "redis-cli" "tar" "gzip")
    
    if [[ -n "$ENCRYPTION_KEY" ]]; then
        deps+=("openssl")
    fi
    
    if [[ -n "$S3_BUCKET" ]]; then
        deps+=("aws")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Required dependency '$dep' is not installed"
        fi
    done
    
    log "All dependencies are available"
}

# Backup MySQL database
backup_mysql() {
    log "Starting MySQL backup..."
    
    local mysql_backup_file="$TEMP_DIR/mysql-$DATE.sql"
    
    # Create MySQL backup
    mysqldump \
        --host="$DB_HOST" \
        --port="$DB_PORT" \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --add-drop-database \
        --databases "$DB_NAME" > "$mysql_backup_file"
    
    if [[ $? -eq 0 ]]; then
        log "MySQL backup completed: $(du -h "$mysql_backup_file" | cut -f1)"
    else
        error "MySQL backup failed"
    fi
}

# Backup Redis data
backup_redis() {
    log "Starting Redis backup..."
    
    local redis_backup_file="$TEMP_DIR/redis-$DATE.rdb"
    
    # Create Redis backup
    if [[ -n "$REDIS_PASSWORD" ]]; then
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" --rdb "$redis_backup_file"
    else
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" --rdb "$redis_backup_file"
    fi
    
    if [[ $? -eq 0 ]]; then
        log "Redis backup completed: $(du -h "$redis_backup_file" | cut -f1)"
    else
        error "Redis backup failed"
    fi
}

# Backup application files
backup_files() {
    log "Starting file backup..."
    
    local files_backup_file="$TEMP_DIR/files-$DATE.tar"
    
    # Directories to backup
    local backup_dirs=(
        "/app/uploads"
        "/app/logs"
        "/etc/nginx/sites-available"
        "/etc/nginx/ssl"
    )
    
    # Create file backup
    tar -cf "$files_backup_file" "${backup_dirs[@]}" 2>/dev/null || true
    
    if [[ -f "$files_backup_file" ]]; then
        log "File backup completed: $(du -h "$files_backup_file" | cut -f1)"
    else
        warn "File backup may be incomplete"
    fi
}

# Backup configuration files
backup_configs() {
    log "Starting configuration backup..."
    
    local config_backup_file="$TEMP_DIR/configs-$DATE.tar"
    
    # Configuration files to backup
    local config_files=(
        "/opt/communication-platform/docker-compose.production.yml"
        "/opt/communication-platform/.env.production"
        "/opt/communication-platform/monitoring"
        "/opt/communication-platform/scripts"
    )
    
    # Create configuration backup
    tar -cf "$config_backup_file" "${config_files[@]}" 2>/dev/null || true
    
    if [[ -f "$config_backup_file" ]]; then
        log "Configuration backup completed: $(du -h "$config_backup_file" | cut -f1)"
    else
        warn "Configuration backup may be incomplete"
    fi
}

# Create system info snapshot
create_system_info() {
    log "Creating system information snapshot..."
    
    local system_info_file="$TEMP_DIR/system-info-$DATE.txt"
    
    {
        echo "=== System Information ==="
        echo "Date: $(date)"
        echo "Hostname: $(hostname)"
        echo "Uptime: $(uptime)"
        echo "Disk Usage: $(df -h)"
        echo "Memory Usage: $(free -h)"
        echo "Docker Images: $(docker images)"
        echo "Docker Containers: $(docker ps -a)"
        echo "Docker Volumes: $(docker volume ls)"
        echo "Network Interfaces: $(ip addr show)"
        echo "=== End System Information ==="
    } > "$system_info_file"
    
    log "System information snapshot created"
}

# Compress backup
compress_backup() {
    if [[ "$COMPRESSION" == "true" ]]; then
        log "Compressing backup..."
        
        local archive_name="communication-platform-backup-$DATE.tar.gz"
        local archive_path="$TEMP_DIR/$archive_name"
        
        tar -czf "$archive_path" -C "$TEMP_DIR" \
            --exclude="$archive_name" \
            .
        
        # Remove individual files after compression
        find "$TEMP_DIR" -type f ! -name "$archive_name" -delete
        
        log "Backup compressed: $(du -h "$archive_path" | cut -f1)"
        echo "$archive_path"
    else
        echo "$TEMP_DIR"
    fi
}

# Encrypt backup
encrypt_backup() {
    local backup_path="$1"
    
    if [[ -n "$ENCRYPTION_KEY" ]]; then
        log "Encrypting backup..."
        
        if [[ -f "$backup_path" ]]; then
            # Encrypt single file
            openssl enc -aes-256-cbc -salt -in "$backup_path" -out "$backup_path.enc" -k "$ENCRYPTION_KEY"
            rm "$backup_path"
            echo "$backup_path.enc"
        else
            # Encrypt directory
            local encrypted_archive="$backup_path.tar.gz.enc"
            tar -czf - -C "$backup_path" . | openssl enc -aes-256-cbc -salt -out "$encrypted_archive" -k "$ENCRYPTION_KEY"
            rm -rf "$backup_path"
            echo "$encrypted_archive"
        fi
        
        log "Backup encrypted"
    else
        echo "$backup_path"
    fi
}

# Move backup to final location
finalize_backup() {
    local backup_path="$1"
    local final_name="communication-platform-backup-$DATE"
    
    if [[ -f "$backup_path" ]]; then
        # Single file
        local extension="${backup_path##*.}"
        mv "$backup_path" "$BACKUP_DIR/$final_name.$extension"
        echo "$BACKUP_DIR/$final_name.$extension"
    else
        # Directory
        mv "$backup_path" "$BACKUP_DIR/$final_name"
        echo "$BACKUP_DIR/$final_name"
    fi
}

# Upload to S3
upload_to_s3() {
    local backup_file="$1"
    
    if [[ -n "$S3_BUCKET" && -n "$AWS_ACCESS_KEY_ID" && -n "$AWS_SECRET_ACCESS_KEY" ]]; then
        log "Uploading backup to S3..."
        
        export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
        export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
        
        aws s3 cp "$backup_file" "s3://$S3_BUCKET/backups/$(basename "$backup_file")"
        
        if [[ $? -eq 0 ]]; then
            log "Backup uploaded to S3 successfully"
        else
            warn "Failed to upload backup to S3"
        fi
    fi
}

# Clean old backups
cleanup_old_backups() {
    log "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    # Clean local backups
    find "$BACKUP_DIR" -name "communication-platform-backup-*" -type f -mtime +$RETENTION_DAYS -delete
    
    # Clean S3 backups if configured
    if [[ -n "$S3_BUCKET" && -n "$AWS_ACCESS_KEY_ID" && -n "$AWS_SECRET_ACCESS_KEY" ]]; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
        aws s3 ls "s3://$S3_BUCKET/backups/" | while read -r line; do
            local file_date=$(echo "$line" | awk '{print $4}' | grep -o '[0-9]\{8\}' | head -1)
            if [[ "$file_date" < "$cutoff_date" ]]; then
                local file_name=$(echo "$line" | awk '{print $4}')
                aws s3 rm "s3://$S3_BUCKET/backups/$file_name"
                log "Deleted old S3 backup: $file_name"
            fi
        done
    fi
    
    log "Old backup cleanup completed"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"
    
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local emoji="✅"
        if [[ "$status" != "success" ]]; then
            emoji="❌"
        fi
        
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji Backup $status: $message\"}" \
            2>/dev/null || true
    fi
}

# Main backup function
main() {
    log "Starting backup process..."
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Check dependencies
    check_dependencies
    
    # Create directories
    create_directories
    
    # Perform backups
    backup_mysql
    backup_redis
    backup_files
    backup_configs
    create_system_info
    
    # Process backup
    local backup_path
    backup_path=$(compress_backup)
    backup_path=$(encrypt_backup "$backup_path")
    backup_path=$(finalize_backup "$backup_path")
    
    # Upload to remote storage
    upload_to_s3 "$backup_path"
    
    # Cleanup old backups
    cleanup_old_backups
    
    # Calculate backup size
    local backup_size
    if [[ -f "$backup_path" ]]; then
        backup_size=$(du -h "$backup_path" | cut -f1)
    else
        backup_size=$(du -sh "$backup_path" | cut -f1)
    fi
    
    log "Backup process completed successfully!"
    log "Backup location: $backup_path"
    log "Backup size: $backup_size"
    
    # Send success notification
    send_notification "success" "Backup completed successfully (Size: $backup_size)"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
