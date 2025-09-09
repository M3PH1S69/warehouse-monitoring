#!/bin/bash

# Warehouse Monitoring System - Installation Script
# For Ubuntu Server 20.04+ with Nginx + PHP + MySQL + PHPMyAdmin

set -e

echo "=========================================="
echo "Warehouse Monitoring System Installer"
echo "=========================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "Installing required packages..."
apt install -y nginx php php-fpm php-mysql php-cli php-curl php-json php-mbstring php-xml php-zip mysql-server phpmyadmin nodejs npm curl wget unzip

# Enable and start services
echo "Enabling and starting services..."
systemctl enable nginx php8.3-fpm mysql
systemctl start nginx php8.3-fpm mysql

# Secure MySQL installation
echo "Configuring MySQL..."
mysql_secure_installation

# Create application directory
echo "Setting up application directory..."
mkdir -p /var/www/warehouse-monitoring
chown -R www-data:www-data /var/www/warehouse-monitoring

# Install Node.js dependencies and build
echo "Installing Node.js dependencies..."
npm install

echo "Building React application..."
npm run build

# Set proper permissions
echo "Setting file permissions..."
chown -R www-data:www-data /var/www/warehouse-monitoring
chmod -R 755 /var/www/warehouse-monitoring
chmod -R 644 /var/www/warehouse-monitoring/backend/config/

# Configure Nginx
echo "Configuring Nginx..."
cp /var/www/warehouse-monitoring/deployment/nginx/warehouse-monitoring.conf /etc/nginx/sites-available/warehouse-monitoring
ln -sf /etc/nginx/sites-available/warehouse-monitoring /etc/nginx/sites-enabled/warehouse-monitoring
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Restart services
echo "Restarting services..."
systemctl restart nginx php8.3-fpm

# Import database schema
echo "Importing database schema..."
mysql -u aty -pserveraty warehouse_db < /var/www/warehouse-monitoring/database/warehouse_monitoring.sql

# Configure PHP
echo "Configuring PHP..."
sed -i 's/;cgi.fix_pathinfo=1/cgi.fix_pathinfo=0/' /etc/php/8.3/fpm/php.ini
sed -i 's/upload_max_filesize = 2M/upload_max_filesize = 64M/' /etc/php/8.3/fpm/php.ini
sed -i 's/post_max_size = 8M/post_max_size = 64M/' /etc/php/8.3/fpm/php.ini
sed -i 's/max_execution_time = 30/max_execution_time = 300/' /etc/php/8.3/fpm/php.ini

# Restart PHP-FPM
systemctl restart php8.3-fpm

# Configure firewall (if ufw is enabled)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 'Nginx Full'
    ufw allow ssh
fi

echo "=========================================="
echo "Installation completed successfully!"
echo "=========================================="
echo
echo "Access your application at:"
echo "- Web App: http://$(hostname -I | awk '{print $1}')/"
echo "- PHPMyAdmin: http://$(hostname -I | awk '{print $1}')/phpmyadmin"
echo
echo "Default login credentials:"
echo "- aty: adhitya.gemeleonard@lintasarta.co.id / GudangGaram12"
echo "- view: view@warehouse.co.id / P4ssword"
echo
echo "Database credentials:"
echo "- Database: warehouse_db"
echo "- Username: aty"
echo "- Password: serveraty"
echo
echo "IMPORTANT: Change default passwords after first login!"
echo "=========================================="

# Check service status
echo "Service Status:"
systemctl is-active --quiet nginx && echo "✓ Nginx: Running" || echo "✗ Nginx: Not running"
systemctl is-active --quiet php8.3-fpm && echo "✓ PHP-FPM: Running" || echo "✗ PHP-FPM: Not running"
systemctl is-active --quiet mysql && echo "✓ MySQL: Running" || echo "✗ MySQL: Not running"

echo
echo "Installation log saved to: /var/log/warehouse-monitoring-install.log"
