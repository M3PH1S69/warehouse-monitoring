<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    private $options;

    public function __construct() {
        // Load configuration from environment or default values
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'warehouse_db';
        $this->username = $_ENV['DB_USER'] ?? 'aty';
        $this->password = $_ENV['DB_PASS'] ?? 'ServerATY@12';
        
        // PDO options for security and performance
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_PERSISTENT => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
    }

    public function getConnection() {
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, $this->options);
            
            // Set additional MySQL session variables for security
            $this->conn->exec("SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO'");
            $this->conn->exec("SET SESSION time_zone = '+00:00'");
            
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            
            // Don't expose database details in production
            if ($_ENV['APP_ENV'] === 'development') {
                http_response_code(500);
                echo json_encode([
                    "message" => "Database connection failed",
                    "error" => $exception->getMessage()
                ]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Internal server error"]);
            }
            exit();
        }

        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }

    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    public function commit() {
        return $this->conn->commit();
    }

    public function rollback() {
        return $this->conn->rollback();
    }

    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }

    // Health check method
    public function healthCheck() {
        try {
            $stmt = $this->conn->query("SELECT 1");
            return $stmt !== false;
        } catch (PDOException $e) {
            error_log("Database health check failed: " . $e->getMessage());
            return false;
        }
    }
}
?>