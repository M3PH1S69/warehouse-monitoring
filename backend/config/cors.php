<?php
class CorsHandler {
    private $allowedOrigins;
    private $allowedMethods;
    private $allowedHeaders;
    private $maxAge;

    public function __construct() {
        // Configure allowed origins
        $this->allowedOrigins = [
            'http://localhost:3000',
            'http://localhost',
            'https://localhost',
            $_SERVER['HTTP_HOST'] ?? 'localhost'
        ];
        
        $this->allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
        $this->allowedHeaders = [
            'Accept',
            'Authorization',
            'Cache-Control',
            'Content-Type',
            'DNT',
            'If-Modified-Since',
            'Keep-Alive',
            'Origin',
            'User-Agent',
            'X-Requested-With'
        ];
        $this->maxAge = 86400; // 24 hours
    }

    public function handleCors() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Check if origin is allowed
        if ($this->isOriginAllowed($origin)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: ' . implode(', ', $this->allowedMethods));
        header('Access-Control-Allow-Headers: ' . implode(', ', $this->allowedHeaders));
        header('Access-Control-Max-Age: ' . $this->maxAge);
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit();
        }
    }

    private function isOriginAllowed($origin) {
        if (empty($origin)) {
            return false;
        }
        
        return in_array($origin, $this->allowedOrigins) || 
               $this->isDomainAllowed($origin);
    }

    private function isDomainAllowed($origin) {
        // Allow localhost and local network addresses in development
        if ($_ENV['APP_ENV'] === 'development') {
            return preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.)/', $origin);
        }
        
        return false;
    }

    public function addAllowedOrigin($origin) {
        if (!in_array($origin, $this->allowedOrigins)) {
            $this->allowedOrigins[] = $origin;
        }
    }
}

// Initialize CORS handler
$corsHandler = new CorsHandler();
$corsHandler->handleCors();
?>