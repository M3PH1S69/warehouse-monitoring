#!/bin/bash

# Warehouse Monitoring System - Backup Script
# Creates daily backups of database and application files

set -e

# Configuration
APP_NAME="warehouse-monitoring"
APP_DIR="/var/www/$APP_NAME"
BACKUP_DIR="/opt/warehouse-monitoring/backups"
DB_NAME="warehouse_db"
DB_USER="aty"
DB_PASS_FILE="ServerATY@12"
RETENTION_DAYS=30

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Get current date
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/warehouse_monitoring_backup_$DATE"

echo -e "${GREEN}Starting backup process...${NC}"

# Extract database password
DB_PASS=$(grep "Password:" "$DB_PASS_FILE" | head -1 | awk '{print $3}')

# Database backup
echo -e "${YELLOW}Backing up database...${NC}"
mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_FILE.sql"

# Application files backup
echo -e "${YELLOW}Backing up application files...${NC}"
tar -czf "$BACKUP_FILE.tar.gz" -C "/var/www" "$APP_NAME" --exclude="$APP_NAME/node_modules" --exclude="$APP_NAME/.git"

# Configuration backup
echo -e "${YELLOW}Backing up system configuration...${NC}"
mkdir -p "$BACKUP_FILE.config"
cp /etc/nginx/sites-available/$APP_NAME "$BACKUP_FILE.config/nginx.conf"
cp /etc/php/8.3/fpm/pool.d/warehouse-monitoring.conf "$BACKUP_FILE.config/php-fpm-pool.conf" 2>/dev/null || true
cp /root/warehouse-monitoring-credentials.txt "$BACKUP_FILE.config/credentials.txt"

# Create archive of config
tar -czf "$BACKUP_FILE.config.tar.gz" -C "$BACKUP_DIR" "$(basename "$BACKUP_FILE.config")"
rm -rf "$BACKUP_FILE.config"

# Cleanup old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
find "$BACKUP_DIR" -name "warehouse_monitoring_backup_*" -type f -mtime +$RETENTION_DAYS -delete

# Calculate backup sizes
DB_SIZE=$(du -h "$BACKUP_FILE.sql" | cut -f1)
APP_SIZE=$(du -h "$BACKUP_FILE.tar.gz" | cut -f1)
CONFIG_SIZE=$(du -h "$BACKUP_FILE.config.tar.gz" | cut -f1)

echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "Database backup: $BACKUP_FILE.sql ($DB_SIZE)"
echo -e "Application backup: $BACKUP_FILE.tar.gz ($APP_SIZE)"
echo -e "Configuration backup: $BACKUP_FILE.config.tar.gz ($CONFIG_SIZE)"

# Log backup completion
echo "$(date): Backup completed - DB: $DB_SIZE, App: $APP_SIZE, Config: $CONFIG_SIZE" >> /var/log/warehouse-monitoring-backup.log

# Optional: Upload to remote storage (uncomment and configure as needed)
# echo -e "${YELLOW}Uploading to remote storage...${NC}"
# rsync -avz "$BACKUP_FILE"* user@backup-server:/path/to/backups/
# aws s3 cp "$BACKUP_FILE.sql" s3://your-backup-bucket/database/
# aws s3 cp "$BACKUP_FILE.tar.gz" s3://your-backup-bucket/application/
