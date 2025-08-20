#!/bin/bash

# Restore Script for Communication Platform
# This script restores from encrypted backups

set -e

# Configuration
BACKUP_DIR="/backup/output"
TEMP_DIR="/tmp/restore-$(date +%Y%m%d-%H%M%S)"

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

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS] BACKUP_FILE"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -d, --database-only     Restore database only"
    echo "  -f, --files-only        Restore files only"
    echo "  -c, --configs-only      Restore configurations only"
    echo "  -r, --redis-only        Restore Redis only"
    echo "  --dry-run              Show what would be restored without actually doing it"
    echo ""
    echo "Examples:"
    echo "  $0 /backup/communication-platform-backup-20231201-120000.tar.gz.enc"
    echo "  $0 --database-only /backup/communication-platform-backup-20231201-120000.tar.gz.enc"
    echo "  $0 --dry-run /backup/communication-platform-backup-20231201-120000.tar.gz.enc"
}

# Parse command line arguments
parse_args() {
    RESTORE_DATABASE=true
    RESTORE_FILES=true
    RESTORE_CONFIGS=true
    RESTORE_REDIS=true
    DRY_RUN=false
    BACKUP_FILE=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                usage
                exit 0
                ;;
            -d|--database-only)
                RESTORE_DATABASE=true
                RESTORE_FILES=false
                RESTORE_CONFIGS=false
                RESTORE_REDIS=false
                shift
                ;;
            -f|--files-only)
                RESTORE_DATABASE=false
                RESTORE_FILES=true
                RESTORE_CONFIGS=false
                RESTORE_REDIS=false
                shift
                ;;
            -c|--configs-only)
                RESTORE_DATABASE=false
                RESTORE_FILES=false
                RESTORE_CONFIGS=true
                RESTORE_REDIS=false
                shift
                ;;
            -r|--redis-only)
                RESTORE_DATABASE=false
                RESTORE_FILES=false
                RESTORE_CONFIGS=false
                RESTORE_REDIS=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            -*)
                error "Unknown option: $1"
                ;;
            *)
                BACKUP_FILE="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$BACKUP_FILE" ]]; then
        error "Backup file is required"
    fi

    if [[ ! -f "$BACKUP_FILE" ]]; then
        error "Backup file does not exist: $BACKUP_FILE"
    fi
}

# Check dependencies
check_dependencies() {
    local deps=("mysql" "redis-cli" "tar" "gzip")
    
    if [[ "$BACKUP_FILE" == *.enc ]]; then
        deps+=("openssl")
    fi
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "Required dependency '$dep' is not installed"
        fi
    done
    
    log "All dependencies are available"
}

# Create directories
create_directories() {
    mkdir -p "$TEMP_DIR"
    log "Created temporary directory: $TEMP_DIR"
}

# Decrypt backup if needed
decrypt_backup() {
    local backup_file="$1"
    
    if [[ "$backup_file" == *.enc ]]; then
        if [[ -z "$ENCRYPTION_KEY" ]]; then
            error "Backup is encrypted but no encryption key provided"
        fi
        
        log "Decrypting backup..."
        local decrypted_file="${backup_file%.enc}"
        local temp_decrypted="$TEMP_DIR/$(basename "$decrypted_file")"
        
        openssl enc -aes-256-cbc -d -in "$backup_file" -out "$temp_decrypted" -k "$ENCRYPTION_KEY"
        
        if [[ $? -eq 0 ]]; then
            log "Backup decrypted successfully"
            echo "$temp_decrypted"
        else
            error "Failed to decrypt backup"
        fi
    else
        echo "$backup_file"
    fi
}

# Extract backup
extract_backup() {
    local backup_file="$1"
    local extract_dir="$TEMP_DIR/extracted"
    
    mkdir -p "$extract_dir"
    
    log "Extracting backup..."
    
    if [[ "$backup_file" == *.tar.gz ]]; then
        tar -xzf "$backup_file" -C "$extract_dir"
    elif [[ "$backup_file" == *.tar ]]; then
        tar -xf "$backup_file" -C "$extract_dir"
    else
        error "Unsupported backup format"
    fi
    
    log "Backup extracted to: $extract_dir"
    echo "$extract_dir"
}

# List backup contents
list_backup_contents() {
    local extract_dir="$1"
    
    log "Backup contents:"
    find "$extract_dir" -type f | while read -r file; do
        local relative_path="${file#$extract_dir/}"
        local size=$(du -h "$file" | cut -f1)
        echo "  $relative_path ($size)"
    done
}

# Restore MySQL database
restore_mysql() {
    local extract_dir="$1"
    
    if [[ "$RESTORE_DATABASE" != "true" ]]; then
        return
    fi
    
    local mysql_file=$(find "$extract_dir" -name "mysql-*.sql" | head -1)
    
    if [[ -z "$mysql_file" ]]; then
        warn "No MySQL backup file found"
        return
    fi
    
    log "Restoring MySQL database..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would restore MySQL from: $mysql_file"
        return
    fi
    
    # Create database if it doesn't exist
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"
    
    # Restore database
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$mysql_file"
    
    if [[ $? -eq 0 ]]; then
        log "MySQL database restored successfully"
    else
        error "Failed to restore MySQL database"
    fi
}

# Restore Redis data
restore_redis() {
    local extract_dir="$1"
    
    if [[ "$RESTORE_REDIS" != "true" ]]; then
        return
    fi
    
    local redis_file=$(find "$extract_dir" -name "redis-*.rdb" | head -1)
    
    if [[ -z "$redis_file" ]]; then
        warn "No Redis backup file found"
        return
    fi
    
    log "Restoring Redis data..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would restore Redis from: $redis_file"
        return
    fi
    
    # Stop Redis temporarily
    if [[ -n "$REDIS_PASSWORD" ]]; then
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" SHUTDOWN NOSAVE || true
    else
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" SHUTDOWN NOSAVE || true
    fi
    
    # Copy RDB file
    docker cp "$redis_file" redis:/data/dump.rdb
    
    # Start Redis
    docker start redis
    
    # Wait for Redis to start
    sleep 5
    
    if [[ -n "$REDIS_PASSWORD" ]]; then
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping
    else
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping
    fi
    
    if [[ $? -eq 0 ]]; then
        log "Redis data restored successfully"
    else
        error "Failed to restore Redis data"
    fi
}

# Restore files
restore_files() {
    local extract_dir="$1"
    
    if [[ "$RESTORE_FILES" != "true" ]]; then
        return
    fi
    
    local files_archive=$(find "$extract_dir" -name "files-*.tar" | head -1)
    
    if [[ -z "$files_archive" ]]; then
        warn "No files backup found"
        return
    fi
    
    log "Restoring files..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would restore files from: $files_archive"
        tar -tf "$files_archive" | head -10
        return
    fi
    
    # Extract files to root
    tar -xf "$files_archive" -C /
    
    if [[ $? -eq 0 ]]; then
        log "Files restored successfully"
    else
        error "Failed to restore files"
    fi
}

# Restore configurations
restore_configs() {
    local extract_dir="$1"
    
    if [[ "$RESTORE_CONFIGS" != "true" ]]; then
        return
    fi
    
    local configs_archive=$(find "$extract_dir" -name "configs-*.tar" | head -1)
    
    if [[ -z "$configs_archive" ]]; then
        warn "No configuration backup found"
        return
    fi
    
    log "Restoring configurations..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "[DRY RUN] Would restore configurations from: $configs_archive"
        tar -tf "$configs_archive" | head -10
        return
    fi
    
    # Extract configurations to root
    tar -xf "$configs_archive" -C /
    
    if [[ $? -eq 0 ]]; then
        log "Configurations restored successfully"
    else
        error "Failed to restore configurations"
    fi
}

# Verify restoration
verify_restoration() {
    if [[ "$DRY_RUN" == "true" ]]; then
        return
    fi
    
    log "Verifying restoration..."
    
    # Check database
    if [[ "$RESTORE_DATABASE" == "true" ]]; then
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SHOW TABLES;" > /dev/null
        if [[ $? -eq 0 ]]; then
            log "Database verification: OK"
        else
            warn "Database verification: FAILED"
        fi
    fi
    
    # Check Redis
    if [[ "$RESTORE_REDIS" == "true" ]]; then
        if [[ -n "$REDIS_PASSWORD" ]]; then
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" -a "$REDIS_PASSWORD" ping > /dev/null
        else
            redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping > /dev/null
        fi
        
        if [[ $? -eq 0 ]]; then
            log "Redis verification: OK"
        else
            warn "Redis verification: FAILED"
        fi
    fi
    
    log "Verification completed"
}

# Main restore function
main() {
    log "Starting restore process..."
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Parse arguments
    parse_args "$@"
    
    # Check dependencies
    check_dependencies
    
    # Create directories
    create_directories
    
    # Process backup
    local processed_backup
    processed_backup=$(decrypt_backup "$BACKUP_FILE")
    
    local extract_dir
    extract_dir=$(extract_backup "$processed_backup")
    
    # Show contents
    list_backup_contents "$extract_dir"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "DRY RUN - No actual restoration will be performed"
    fi
    
    # Perform restoration
    restore_mysql "$extract_dir"
    restore_redis "$extract_dir"
    restore_files "$extract_dir"
    restore_configs "$extract_dir"
    
    # Verify restoration
    verify_restoration
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "Dry run completed successfully!"
    else
        log "Restore process completed successfully!"
    fi
}

# Run main function
main "$@"
