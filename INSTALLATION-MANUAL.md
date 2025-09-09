# Warehouse Monitoring System - Installation Manual

## Complete Setup Guide for Ubuntu Server + Nginx

This comprehensive manual provides step-by-step instructions for installing and configuring the Warehouse Monitoring System on Ubuntu Server with Nginx, PHP, and MySQL.

---

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Pre-Installation Checklist](#pre-installation-checklist)
3. [Automated Installation](#automated-installation)
4. [Manual Installation](#manual-installation)
5. [Post-Installation Configuration](#post-installation-configuration)
6. [SSL/TLS Setup](#ssltls-setup)
7. [Security Hardening](#security-hardening)
8. [Backup Configuration](#backup-configuration)
9. [Monitoring Setup](#monitoring-setup)
10. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **OS**: Ubuntu Server 20.04 LTS or 22.04 LTS
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum, 50GB recommended
- **CPU**: 2 cores minimum
- **Network**: Internet connection for package installation

### Recommended Requirements
- **OS**: Ubuntu Server 22.04 LTS
- **RAM**: 8GB or more
- **Storage**: 100GB SSD
- **CPU**: 4 cores or more
- **Network**: Dedicated network interface

### Software Stack
- **Web Server**: Nginx 1.18+
- **PHP**: PHP 8.3 with FPM
- **Database**: MySQL 8.0+
- **Node.js**: 18.x LTS
- **Additional**: PHPMyAdmin, Certbot, Fail2ban

---

## Pre-Installation Checklist

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git unzip software-properties-common

# Check system information
lsb_release -a
free -h
df -h
```

### 2. Network Configuration
```bash
# Check network connectivity
ping -c 4 google.com

# Configure firewall (if needed)
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 3. User Setup
```bash
# Create application user (optional)
sudo adduser warehouse-admin
sudo usermod -aG sudo warehouse-admin

# Switch to application user
su - warehouse-admin
```

---

## Automated Installation

### Option 1: Quick Installation (Recommended)

1. **Download the application**:
```bash
# Clone or download the application
git clone <repository-url> /tmp/warehouse-monitoring
cd /tmp/warehouse-monitoring

# Or extract from uploaded files
cd /workspace/uploads/warehouse-monitoring
```

2. **Run the automated installer**:
```bash
# Make installer executable
sudo chmod +x deployment/install-ubuntu.sh

# Run the installer
sudo ./deployment/install-ubuntu.sh
```

3. **Follow the installation prompts**:
   - The script will automatically install all dependencies
   - Configure services and security settings
   - Set up the database and import schema
   - Create necessary users and permissions

4. **Save the generated credentials**:
   - Credentials are saved to `/root/warehouse-monitoring-credentials.txt`
   - **Important**: Secure this file immediately after installation

### Installation Script Features
- ✅ Automatic dependency installation
- ✅ Security configuration
- ✅ Database setup and optimization
- ✅ SSL/TLS preparation
- ✅ Backup system setup
- ✅ Health monitoring
- ✅ Log rotation configuration
- ✅ Firewall configuration

---

## Manual Installation

### Step 1: Install System Dependencies

```bash
# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install web server and PHP
sudo apt install -y nginx php8.3 php8.3-fpm php8.3-mysql php8.3-cli \
    php8.3-curl php8.3-json php8.3-mbstring php8.3-xml php8.3-zip \
    php8.3-gd php8.3-intl php8.3-bcmath

# Install database server
sudo apt install -y mysql-server mysql-client phpmyadmin

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Install additional tools
sudo apt install -y certbot python3-certbot-nginx fail2ban ufw htop
```

### Step 2: Configure MySQL

```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with secure password
CREATE USER 'warehouse_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON warehouse_db.* TO 'warehouse_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### Step 3: Configure PHP

```bash
# Edit PHP configuration
sudo nano /etc/php/8.3/fpm/php.ini
```

Update the following settings:
```ini
; Security settings
cgi.fix_pathinfo=0
expose_php=Off

; Performance settings
memory_limit = 256M
max_execution_time = 300
max_input_time = 300
max_input_vars = 3000

; File upload settings
upload_max_filesize = 64M
post_max_size = 64M

; Error handling
display_errors = Off
log_errors = On
error_log = /var/log/php/error.log

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

### Step 4: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/warehouse-monitoring
sudo chown -R www-data:www-data /var/www/warehouse-monitoring

# Copy application files
sudo cp -r /path/to/source/* /var/www/warehouse-monitoring/

# Set permissions
sudo chown -R www-data:www-data /var/www/warehouse-monitoring
sudo chmod -R 755 /var/www/warehouse-monitoring
sudo chmod -R 644 /var/www/warehouse-monitoring/backend/config/
```

### Step 5: Build Frontend

```bash
cd /var/www/warehouse-monitoring

# Install dependencies
sudo -u www-data npm install --production

# Build application
sudo -u www-data npm run build
```

### Step 6: Configure Nginx

```bash
# Copy enhanced Nginx configuration
sudo cp deployment/nginx/warehouse-monitoring-enhanced.conf /etc/nginx/sites-available/warehouse-monitoring

# Copy security headers configuration
sudo cp deployment/nginx/security-headers.conf /etc/nginx/conf.d/

# Enable site
sudo ln -sf /etc/nginx/sites-available/warehouse-monitoring /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 7: Configure PHP-FPM

```bash
# Copy PHP-FPM pool configuration
sudo cp deployment/php/php-fpm-pool.conf /etc/php/8.3/fpm/pool.d/warehouse-monitoring.conf

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

### Step 8: Import Database Schema

```bash
# Import database schema
mysql -u warehouse_user -p warehouse_db < database/warehouse_monitoring.sql
```

### Step 9: Configure Application

```bash
# Update database configuration
sudo nano /var/www/warehouse-monitoring/backend/config/database.php
```

Update the database credentials:
```php
private $host = 'localhost';
private $db_name = 'warehouse_db';
private $username = 'warehouse_user';
private $password = 'your_secure_password';
```

---

## Post-Installation Configuration

### 1. Verify Installation

```bash
# Check service status
sudo systemctl status nginx php8.3-fpm mysql

# Test web access
curl -I http://localhost

# Check application health
curl http://localhost/health
```

### 2. Configure Environment Variables

```bash
# Copy production environment file
sudo cp .env.production /var/www/warehouse-monitoring/.env

# Update environment variables
sudo nano /var/www/warehouse-monitoring/.env
```

### 3. Set Up Systemd Service

```bash
# Copy systemd service file
sudo cp deployment/systemd/warehouse-monitoring.service /etc/systemd/system/

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable warehouse-monitoring
sudo systemctl start warehouse-monitoring
```

### 4. Configure Log Rotation

```bash
# Set up log rotation
sudo cp deployment/logrotate/warehouse-monitoring /etc/logrotate.d/

# Test log rotation
sudo logrotate -d /etc/logrotate.d/warehouse-monitoring
```

---

## SSL/TLS Setup

### Option 1: Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

### Option 2: Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/warehouse-monitoring.key \
    -out /etc/ssl/certs/warehouse-monitoring.crt

# Update Nginx configuration
sudo nano /etc/nginx/sites-available/warehouse-monitoring
```

### Option 3: Commercial Certificate

```bash
# Generate CSR
sudo openssl req -new -newkey rsa:2048 -nodes \
    -keyout /etc/ssl/private/warehouse-monitoring.key \
    -out /etc/ssl/certs/warehouse-monitoring.csr

# Install certificate files
sudo cp your-certificate.crt /etc/ssl/certs/warehouse-monitoring.crt
sudo cp your-private.key /etc/ssl/private/warehouse-monitoring.key
sudo cp ca-bundle.crt /etc/ssl/certs/warehouse-monitoring-ca.crt
```

---

## Security Hardening

### 1. Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw --force enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Limit SSH access
sudo ufw limit ssh

# Check firewall status
sudo ufw status verbose
```

### 2. Fail2ban Configuration

```bash
# Configure Fail2ban for Nginx
sudo nano /etc/fail2ban/jail.local
```

Add the following configuration:
```ini
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/warehouse-monitoring.error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/warehouse-monitoring.error.log
maxretry = 10

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/warehouse-monitoring.access.log
maxretry = 2
```

### 3. System Security

```bash
# Update system packages regularly
sudo apt update && sudo apt upgrade -y

# Configure automatic security updates
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Secure shared memory
echo 'tmpfs /run/shm tmpfs defaults,noexec,nosuid 0 0' | sudo tee -a /etc/fstab

# Disable unused services
sudo systemctl disable bluetooth
sudo systemctl disable cups
```

---

## Backup Configuration

### 1. Automated Backup Setup

```bash
# Make backup script executable
sudo chmod +x /opt/warehouse-monitoring/scripts/backup.sh

# Set up daily backup cron job
sudo crontab -e
```

Add the following line:
```bash
0 2 * * * /opt/warehouse-monitoring/scripts/backup.sh
```

### 2. Remote Backup Configuration

```bash
# Configure remote backup (optional)
sudo nano /opt/warehouse-monitoring/scripts/backup.sh

# Uncomment and configure remote backup options:
# - rsync for remote server backup
# - AWS S3 for cloud backup
# - Google Cloud Storage
```

### 3. Backup Restoration

```bash
# Restore database from backup
mysql -u warehouse_user -p warehouse_db < /opt/warehouse-monitoring/backups/backup_file.sql

# Restore application files
sudo tar -xzf /opt/warehouse-monitoring/backups/backup_file.tar.gz -C /var/www/
```

---

## Monitoring Setup

### 1. Health Check Configuration

```bash
# Make health check script executable
sudo chmod +x /opt/warehouse-monitoring/scripts/health-check.sh

# Set up health check cron job
sudo crontab -e
```

Add the following line:
```bash
*/5 * * * * /opt/warehouse-monitoring/scripts/health-check.sh
```

### 2. Log Monitoring

```bash
# Monitor application logs
sudo tail -f /var/log/nginx/warehouse-monitoring.access.log
sudo tail -f /var/log/nginx/warehouse-monitoring.error.log
sudo tail -f /var/log/php8.3-fpm.log

# Monitor system logs
sudo journalctl -u nginx -f
sudo journalctl -u php8.3-fpm -f
sudo journalctl -u mysql -f
```

### 3. Performance Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop
iotop
nethogs

# Check disk usage
df -h
du -sh /var/www/warehouse-monitoring/*
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. 502 Bad Gateway Error
```bash
# Check PHP-FPM status
sudo systemctl status php8.3-fpm

# Check PHP-FPM logs
sudo tail -f /var/log/php8.3-fpm.log

# Restart PHP-FPM
sudo systemctl restart php8.3-fpm
```

#### 2. Database Connection Error
```bash
# Check MySQL status
sudo systemctl status mysql

# Test database connection
mysql -u warehouse_user -p warehouse_db

# Check database configuration
sudo nano /var/www/warehouse-monitoring/backend/config/database.php
```

#### 3. Permission Denied Errors
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/warehouse-monitoring
sudo chmod -R 755 /var/www/warehouse-monitoring
sudo chmod -R 644 /var/www/warehouse-monitoring/backend/config/
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

#### 5. High Memory Usage
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize PHP-FPM
sudo nano /etc/php/8.3/fpm/pool.d/warehouse-monitoring.conf

# Restart services
sudo systemctl restart php8.3-fpm nginx
```

### Log File Locations

- **Nginx Access Log**: `/var/log/nginx/warehouse-monitoring.access.log`
- **Nginx Error Log**: `/var/log/nginx/warehouse-monitoring.error.log`
- **PHP-FPM Log**: `/var/log/php8.3-fpm.log`
- **MySQL Error Log**: `/var/log/mysql/error.log`
- **Application Log**: `/var/log/warehouse-monitoring-health.log`
- **Installation Log**: `/var/log/warehouse-monitoring-install.log`

### Support and Maintenance

#### Regular Maintenance Tasks
1. **Weekly**: Check system updates and security patches
2. **Monthly**: Review log files and clean up old logs
3. **Quarterly**: Update SSL certificates and review security settings
4. **Annually**: Full system backup and disaster recovery testing

#### Getting Help
- Check the troubleshooting section in this manual
- Review log files for error messages
- Contact system administrator or technical support
- Consult Ubuntu and Nginx documentation

---

## Conclusion

This installation manual provides comprehensive instructions for setting up the Warehouse Monitoring System on Ubuntu Server with Nginx. Follow the steps carefully and ensure all security measures are properly configured for production use.

For additional support or questions, refer to the troubleshooting section or contact the system administrator.

**Important Security Reminders:**
- Change all default passwords immediately after installation
- Keep the system updated with security patches
- Regularly monitor log files for suspicious activity
- Implement proper backup and disaster recovery procedures
- Use SSL/TLS certificates for production environments

---

**Document Version**: 2.0.0  
**Last Updated**: 2025-09-09  
**Compatible with**: Ubuntu Server 20.04+, 22.04+