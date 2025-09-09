<?php
class SecurityHandler {
    private $rateLimits;
    private $blockedIPs;
    private $sessionTimeout;

    public function __construct() {
        $this->rateLimits = [
            'api' => ['requests' => 100, 'window' => 3600], // 100 requests per hour
            'auth' => ['requests' => 5, 'window' => 300]     // 5 login attempts per 5 minutes
        ];
        
        $this->blockedIPs = [];
        $this->sessionTimeout = 3600; // 1 hour
        
        $this->initSession();
    }

    private function initSession() {
        // Secure session configuration
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.gc_maxlifetime', $this->sessionTimeout);
        
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Regenerate session ID periodically
        if (!isset($_SESSION['last_regeneration'])) {
            $_SESSION['last_regeneration'] = time();
        } elseif (time() - $_SESSION['last_regeneration'] > 300) {
            session_regenerate_id(true);
            $_SESSION['last_regeneration'] = time();
        }
    }

    public function validateInput($data, $type = 'general') {
        if (is_array($data)) {
            return array_map([$this, 'sanitizeString'], $data);
        }
        
        switch ($type) {
            case 'email':
                return filter_var($data, FILTER_VALIDATE_EMAIL);
            case 'int':
                return filter_var($data, FILTER_VALIDATE_INT);
            case 'float':
                return filter_var($data, FILTER_VALIDATE_FLOAT);
            case 'url':
                return filter_var($data, FILTER_VALIDATE_URL);
            default:
                return $this->sanitizeString($data);
        }
    }

    private function sanitizeString($string) {
        // Remove null bytes and control characters
        $string = str_replace(["\0", "\x0B"], '', $string);
        
        // Trim whitespace
        $string = trim($string);
        
        // Convert special characters to HTML entities
        return htmlspecialchars($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public function checkRateLimit($identifier, $type = 'api') {
        if (!isset($this->rateLimits[$type])) {
            return true;
        }
        
        $limit = $this->rateLimits[$type];
        $key = "rate_limit_{$type}_{$identifier}";
        
        // Use file-based storage for simplicity (consider Redis for production)
        $file = sys_get_temp_dir() . "/{$key}.json";
        
        $data = [];
        if (file_exists($file)) {
            $data = json_decode(file_get_contents($file), true) ?: [];
        }
        
        $now = time();
        $windowStart = $now - $limit['window'];
        
        // Clean old entries
        $data = array_filter($data, function($timestamp) use ($windowStart) {
            return $timestamp > $windowStart;
        });
        
        // Check if limit exceeded
        if (count($data) >= $limit['requests']) {
            return false;
        }
        
        // Add current request
        $data[] = $now;
        file_put_contents($file, json_encode($data));
        
        return true;
    }

    public function validateCSRF($token) {
        return isset($_SESSION['csrf_token']) && 
               hash_equals($_SESSION['csrf_token'], $token);
    }

    public function generateCSRF() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }

    public function isBlocked($ip) {
        return in_array($ip, $this->blockedIPs);
    }

    public function blockIP($ip, $duration = 3600) {
        // In production, implement proper IP blocking mechanism
        $this->blockedIPs[] = $ip;
        
        // Log the blocking
        error_log("IP blocked: $ip for $duration seconds");
    }

    public function validateJWT($token) {
        // Implement JWT validation if using JWT tokens
        // This is a placeholder for JWT implementation
        return false;
    }

    public function hashPassword($password) {
        // Use password_hash instead of MD5 for production
        if ($_ENV['APP_ENV'] === 'production') {
            return password_hash($password, PASSWORD_ARGON2ID);
        } else {
            // Keep MD5 for compatibility with existing data
            return md5($password);
        }
    }

    public function verifyPassword($password, $hash) {
        // Handle both new and legacy password formats
        if (strlen($hash) === 32) {
            // Legacy MD5 hash
            return md5($password) === $hash;
        } else {
            // New password_hash format
            return password_verify($password, $hash);
        }
    }

    public function logSecurityEvent($event, $details = []) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'event' => $event,
            'details' => $details
        ];
        
        error_log("Security Event: " . json_encode($logEntry));
    }
}

// Initialize security handler
$security = new SecurityHandler();

// Check if IP is blocked
$clientIP = $_SERVER['REMOTE_ADDR'] ?? '';
if ($security->isBlocked($clientIP)) {
    http_response_code(403);
    echo json_encode(['message' => 'Access denied']);
    exit();
}
?>