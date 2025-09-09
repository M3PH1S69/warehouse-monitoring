# Troubleshooting Guide - Warehouse Monitoring System

## Common Issues and Solutions

### 1. 502 Bad Gateway Error

**Symptoms**: Nginx returns 502 Bad Gateway when accessing the application

**Causes & Solutions**:
- **PHP-FPM not running**:
  ```bash
  sudo systemctl status php8.3-fpm
  sudo systemctl start php8.3-fpm
  sudo systemctl restart nginx
  ```

- **Wrong PHP-FPM socket path**:
  Check which PHP version is installed:
  ```bash
  php -v
  ls /var/run/php/
  ```
  
  Update Nginx config accordingly:
  ```bash
  sudo nano /etc/nginx/sites-available/warehouse-monitoring.conf
  # Change fastcgi_pass to correct socket path
  # Example: unix:/var/run/php/php8.2-fpm.sock
  sudo nginx -t
  sudo systemctl reload nginx
  ```

### 2. Database Connection Error

**Symptoms**: API returns "Database connection failed"

**Solutions**:
- **Check MySQL service**:
  ```bash
  sudo systemctl status mysql
  sudo systemctl start mysql
  ```

- **Verify database credentials**:
  ```bash
  mysql -u warehouse_user -p warehouse_db
  # If fails, recreate user:
  sudo mysql -u root -p
  ```
  ```sql
  CREATE USER 'warehouse_user'@'localhost' IDENTIFIED BY 'warehouse_password';
  GRANT ALL PRIVILEGES ON warehouse_db.* TO 'warehouse_user'@'localhost';
  FLUSH PRIVILEGES;
  ```

- **Check database exists**:
  ```bash
  mysql -u root -p -e "SHOW DATABASES;"
  # If warehouse_db missing:
  mysql -u root -p < database/warehouse_monitoring.sql
  ```

### 3. API Endpoints Not Working

**Symptoms**: Frontend can't connect to API, CORS errors

**Solutions**:
- **Check Nginx API routing**:
  ```bash
  sudo nano /etc/nginx/sites-available/warehouse-monitoring.conf
  # Ensure /api/ location block is correctly configured
  sudo nginx -t
  sudo systemctl reload nginx
  ```

- **Verify PHP files exist**:
  ```bash
  ls -la /var/www/warehouse-monitoring/backend/api/
  # Should show: auth.php, categories.php, devices.php, transactions.php, users.php
  ```

- **Check PHP file permissions**:
  ```bash
  sudo chown -R www-data:www-data /var/www/warehouse-monitoring/backend/
  sudo chmod -R 755 /var/www/warehouse-monitoring/backend/
  ```

### 4. Frontend Build Issues

**Symptoms**: npm run build fails, missing dependencies

**Solutions**:
- **Install dependencies**:
  ```bash
  cd /var/www/warehouse-monitoring
  sudo npm install
  ```

- **Clear npm cache if needed**:
  ```bash
  sudo npm cache clean --force
  sudo rm -rf node_modules package-lock.json
  sudo npm install
  ```

- **Build the application**:
  ```bash
  sudo npm run build
  sudo chown -R www-data:www-data dist/
  ```

### 5. PHPMyAdmin Access Issues

**Symptoms**: Can't access PHPMyAdmin at /phpmyadmin

**Solutions**:
- **Check PHPMyAdmin installation**:
  ```bash
  sudo apt install phpmyadmin
  # During installation, select 'apache2' then 'Yes' to configure database
  ```

- **Create symbolic link**:
  ```bash
  sudo ln -s /usr/share/phpmyadmin /var/www/warehouse-monitoring/phpmyadmin
  ```

- **Alternative: Direct access**:
  ```bash
  # Edit Nginx config to point to correct PHPMyAdmin path
  sudo nano /etc/nginx/sites-available/warehouse-monitoring.conf
  ```

### 6. Permission Denied Errors

**Symptoms**: 403 Forbidden errors, file access issues

**Solutions**:
```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/warehouse-monitoring

# Set correct permissions
sudo find /var/www/warehouse-monitoring -type d -exec chmod 755 {} \;
sudo find /var/www/warehouse-monitoring -type f -exec chmod 644 {} \;

# Make sure Nginx can read files
sudo chmod -R 755 /var/www/warehouse-monitoring/dist/
```

### 7. SSL/HTTPS Issues (Production)

**Symptoms**: Mixed content warnings, insecure connection

**Solutions**:
- **Install Let's Encrypt certificate**:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d your-domain.com
  ```

- **Force HTTPS redirect**:
  ```bash
  sudo nano /etc/nginx/sites-available/warehouse-monitoring.conf
  # Add redirect in HTTP server block:
  # return 301 https://$server_name$request_uri;
  ```

### 8. Log Analysis

**Check logs for detailed error information**:

```bash
# Nginx error logs
sudo tail -f /var/log/nginx/warehouse-monitoring.error.log

# Nginx access logs
sudo tail -f /var/log/nginx/warehouse-monitoring.access.log

# PHP-FPM logs
sudo tail -f /var/log/php8.3-fpm.log

# MySQL logs
sudo tail -f /var/log/mysql/error.log

# System logs
sudo journalctl -u nginx -f
sudo journalctl -u php8.3-fpm -f
sudo journalctl -u mysql -f
```

### 9. Performance Issues

**Symptoms**: Slow loading, high resource usage

**Solutions**:
- **Enable PHP OPcache**:
  ```bash
  sudo nano /etc/php/8.1/fpm/php.ini
  # Uncomment and set:
  # opcache.enable=1
  # opcache.memory_consumption=128
  sudo systemctl restart php8.3-fpm
  ```

- **Optimize MySQL**:
  ```bash
  sudo mysql_secure_installation
  sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
  # Add optimizations based on your server specs
  ```

### 10. Backup and Recovery

**Create regular backups**:
```bash
# Database backup
mysqldump -u warehouse_user -p warehouse_db > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf warehouse-app-backup-$(date +%Y%m%d).tar.gz /var/www/warehouse-monitoring

# Automated backup script
sudo crontab -e
# Add: 0 2 * * * /path/to/backup-script.sh
```

## Quick Health Check Script

Create a health check script:

```bash
#!/bin/bash
echo "=== Warehouse Monitoring System Health Check ==="

# Check services
echo "Checking services..."
systemctl is-active --quiet nginx && echo "✓ Nginx: Running" || echo "✗ Nginx: Not running"
systemctl is-active --quiet php8.3-fpm && echo "✓ PHP-FPM: Running" || echo "✗ PHP-FPM: Not running"
systemctl is-active --quiet mysql && echo "✓ MySQL: Running" || echo "✗ MySQL: Not running"

# Check database connection
echo "Checking database connection..."
mysql -u warehouse_user -pwarehouse_password -e "SELECT 1;" warehouse_db &>/dev/null && echo "✓ Database: Connected" || echo "✗ Database: Connection failed"

# Check application files
echo "Checking application files..."
[ -f "/var/www/warehouse-monitoring/dist/index.html" ] && echo "✓ Frontend: Built" || echo "✗ Frontend: Not built"
[ -f "/var/www/warehouse-monitoring/backend/api/auth.php" ] && echo "✓ Backend: API files exist" || echo "✗ Backend: API files missing"

# Check permissions
echo "Checking permissions..."
[ "$(stat -c %U /var/www/warehouse-monitoring)" = "www-data" ] && echo "✓ Permissions: Correct owner" || echo "✗ Permissions: Wrong owner"

echo "=== Health Check Complete ==="
```

Save as `/usr/local/bin/warehouse-health-check.sh` and make executable:
```bash
sudo chmod +x /usr/local/bin/warehouse-health-check.sh
```

## Getting Help

If you continue to experience issues:

1. Run the health check script
2. Check the relevant log files
3. Verify all configuration files match the provided templates
4. Ensure all dependencies are installed with correct versions
5. Consider starting fresh with the automated installation script

For additional support, check the project documentation or create an issue with:
- Error messages from logs
- System information (OS version, PHP version, etc.)
- Steps to reproduce the issue