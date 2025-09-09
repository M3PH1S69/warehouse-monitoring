#!/bin/bash

# Warehouse Monitoring System - Health Check Script

set -e

# Configuration
APP_URL="http://localhost"
API_URL="$APP_URL/api"
LOG_FILE="/var/log/warehouse-monitoring-health.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check service status
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        echo -e "✓ $service: ${GREEN}Running${NC}"
        log_message "SUCCESS: $service is running"
        return 0
    else
        echo -e "✗ $service: ${RED}Not running${NC}"
        log_message "ERROR: $service is not running"
        return 1
    fi
}

# Function to check HTTP response
check_http() {
    local url=$1
    local expected_code=${2:-200}
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response_code" = "$expected_code" ]; then
        echo -e "✓ HTTP $url: ${GREEN}$response_code${NC}"
        log_message "SUCCESS: HTTP $url returned $response_code"
        return 0
    else
        echo -e "✗ HTTP $url: ${RED}$response_code${NC}"
        log_message "ERROR: HTTP $url returned $response_code (expected $expected_code)"
        return 1
    fi
}

# Function to check database connection
check_database() {
    local db_name="warehouse_db"
    local db_user="warehouse_user"
    local db_pass_file="/root/warehouse-monitoring-credentials.txt"
    
    if [ -f "$db_pass_file" ]; then
        local db_pass=$(grep "Password:" "$db_pass_file" | head -1 | awk '{print $3}')
        if mysql -u "$db_user" -p"$db_pass" -e "USE $db_name; SELECT 1;" &>/dev/null; then
            echo -e "✓ Database: ${GREEN}Connected${NC}"
            log_message "SUCCESS: Database connection successful"
            return 0
        else
            echo -e "✗ Database: ${RED}Connection failed${NC}"
            log_message "ERROR: Database connection failed"
            return 1
        fi
    else
        echo -e "✗ Database: ${RED}Credentials file not found${NC}"
        log_message "ERROR: Database credentials file not found"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    local threshold=90
    local usage=$(df /var/www/warehouse-monitoring | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt "$threshold" ]; then
        echo -e "✓ Disk Space: ${GREEN}${usage}% used${NC}"
        log_message "SUCCESS: Disk usage is ${usage}%"
        return 0
    else
        echo -e "✗ Disk Space: ${RED}${usage}% used (threshold: ${threshold}%)${NC}"
        log_message "WARNING: Disk usage is ${usage}% (threshold: ${threshold}%)"
        return 1
    fi
}

echo -e "${YELLOW}Warehouse Monitoring System - Health Check${NC}"
echo "================================================"

# Check services
echo -e "\n${YELLOW}Service Status:${NC}"
check_service "nginx"
check_service "php8.3-fpm"
check_service "mysql"

# Check HTTP endpoints
echo -e "\n${YELLOW}HTTP Endpoints:${NC}"
check_http "$APP_URL"
check_http "$APP_URL/health"

# Check database
echo -e "\n${YELLOW}Database:${NC}"
check_database

# Check system resources
echo -e "\n${YELLOW}System Resources:${NC}"
check_disk_space

# Check log files for errors
echo -e "\n${YELLOW}Recent Errors:${NC}"
error_count=$(tail -100 /var/log/nginx/warehouse-monitoring.error.log 2>/dev/null | wc -l || echo "0")
if [ "$error_count" -gt 0 ]; then
    echo -e "⚠ Found $error_count recent nginx errors"
    log_message "WARNING: Found $error_count recent nginx errors"
else
    echo -e "✓ No recent nginx errors"
fi

echo -e "\n${YELLOW}Health check completed at $(date)${NC}"
log_message "Health check completed"