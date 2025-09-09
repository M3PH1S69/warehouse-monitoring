#!/bin/bash

# Nginx Configuration Setup Script for Warehouse Monitoring System
# This script sets up Nginx configuration files

set -e

echo "=========================================="
echo "Setting up Nginx Configuration"
echo "=========================================="

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)" 
   exit 1
fi

# Backup existing configurations
echo "Creating backup of existing configurations..."
if [ -f "/etc/nginx/nginx.conf" ]; then
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Backed up existing nginx.conf"
fi

if [ -f "/etc/nginx/sites-available/warehouse-monitoring" ]; then
    cp /etc/nginx/sites-available/warehouse-monitoring /etc/nginx/sites-available/warehouse-monitoring.backup.$(date +%Y%m%d_%H%M%S)
    echo "✓ Backed up existing site configuration"
fi

# Copy main nginx.conf
echo "Installing main nginx.conf..."
cp /var/www/warehouse-monitoring/deployment/nginx/nginx.conf /etc/nginx/nginx.conf
echo "✓ Installed /etc/nginx/nginx.conf"

# Copy site configuration
echo "Installing site configuration..."
cp /var/www/warehouse-monitoring/deployment/nginx/sites-available/warehouse-monitoring /etc/nginx/sites-available/warehouse-monitoring
echo "✓ Installed /etc/nginx/sites-available/warehouse-monitoring"

# Copy custom fastcgi_params if needed
if [ -f "/var/www/warehouse-monitoring/deployment/nginx/fastcgi_params" ]; then
    cp /var/www/warehouse-monitoring/deployment/nginx/fastcgi_params /etc/nginx/fastcgi_params.warehouse
    echo "✓ Installed custom FastCGI parameters"
fi

# Detect PHP version and update configuration
echo "Detecting PHP version..."
PHP_VERSION=$(php -v | head -n1 | cut -d' ' -f2 | cut -d'.' -f1,2)
PHP_SOCKET="/var/run/php/php${PHP_VERSION}-fpm.sock"

if [ -S "$PHP_SOCKET" ]; then
    echo "✓ Found PHP ${PHP_VERSION} at ${PHP_SOCKET}"
    sed -i "s|unix:/var/run/php/php8.3-fpm.sock|unix:${PHP_SOCKET}|g" /etc/nginx/sites-available/warehouse-monitoring
    echo "✓ Updated PHP-FPM socket path in configuration"
else
    echo "⚠ Warning: PHP-FPM socket not found at ${PHP_SOCKET}"
    echo "  Please manually update the socket path in /etc/nginx/sites-available/warehouse-monitoring"
    echo "  Available sockets:"
    ls -la /var/run/php/ 2>/dev/null || echo "  No PHP sockets found"
fi

# Enable the site
echo "Enabling warehouse-monitoring site..."
if [ -L "/etc/nginx/sites-enabled/warehouse-monitoring" ]; then
    rm /etc/nginx/sites-enabled/warehouse-monitoring
fi
ln -s /etc/nginx/sites-available/warehouse-monitoring /etc/nginx/sites-enabled/warehouse-monitoring
echo "✓ Enabled warehouse-monitoring site"

# Disable default site if exists
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    rm -rf /etc/nginx/sites-enabled/default
    echo "✓ Disabled default site"
fi

# Create log directory if not exists
mkdir -p /var/log/nginx
chown www-data:adm /var/log/nginx
echo "✓ Ensured log directory exists"

# Test nginx configuration
echo "Testing Nginx configuration..."
if nginx -t; then
    echo "✓ Nginx configuration test passed"
else
    echo "✗ Nginx configuration test failed"
    echo "Please check the configuration and try again"
    exit 1
fi

# Reload nginx
echo "Reloading Nginx..."
systemctl reload nginx
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx reloaded successfully"
else
    echo "✗ Failed to reload Nginx"
    systemctl status nginx
    exit 1
fi

# Display configuration summary
echo
echo "=========================================="
echo "Nginx Configuration Summary"
echo "=========================================="
echo "Main config: /etc/nginx/nginx.conf"
echo "Site config: /etc/nginx/sites-available/warehouse-monitoring"
echo "Enabled sites:"
ls -la /etc/nginx/sites-enabled/
echo
echo "PHP-FPM socket: ${PHP_SOCKET}"
echo "Document root: /var/www/warehouse-monitoring/dist"
echo "API backend: /var/www/warehouse-monitoring/backend/api"
echo
echo "Log files:"
echo "- Access: /var/log/nginx/warehouse-monitoring.access.log"
echo "- Error: /var/log/nginx/warehouse-monitoring.error.log"
echo
echo "✓ Nginx configuration setup completed successfully!"
echo
echo "You can now access your application at:"
echo "- http://$(hostname -I | awk '{print $1}')/"
echo "- http://localhost/ (if accessing locally)"
echo
echo "PHPMyAdmin (if installed):"
echo "- http://$(hostname -I | awk '{print $1}')/phpmyadmin"
echo "=========================================="

# Optional: Show nginx status
echo "Current Nginx status:"
systemctl status nginx --no-pager -l
