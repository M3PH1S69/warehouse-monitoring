<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed"));
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getUsers($db);
        break;
    case 'POST':
        createUser($db);
        break;
    case 'PUT':
        updateUser($db);
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteUser($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "User ID is required"));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getUsers($db) {
    try {
        $query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $users = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = $row;
        }
        
        http_response_code(200);
        echo json_encode($users);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching users: " . $e->getMessage()));
    }
}

function createUser($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
        try {
            $query = "INSERT INTO users (name, email, password, role) VALUES (:name, :email, :password, :role)";
            $stmt = $db->prepare($query);
            
            $name = htmlspecialchars(strip_tags($data->name));
            $email = htmlspecialchars(strip_tags($data->email));
            $password = md5($data->password); // In production, use password_hash
            $role = isset($data->role) ? $data->role : 'view_only';
            
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":password", $password);
            $stmt->bindParam(":role", $role);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "User created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create user"));
            }
        } catch(Exception $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(array("message" => "Email already exists"));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error creating user: " . $e->getMessage()));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Name, email, and password are required"));
    }
}

function updateUser($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        try {
            if (!empty($data->password)) {
                $query = "UPDATE users SET name = :name, email = :email, password = :password, role = :role WHERE id = :id";
                $password = md5($data->password);
            } else {
                $query = "UPDATE users SET name = :name, email = :email, role = :role WHERE id = :id";
            }
            
            $stmt = $db->prepare($query);
            
            $id = $data->id;
            $name = htmlspecialchars(strip_tags($data->name));
            $email = htmlspecialchars(strip_tags($data->email));
            $role = $data->role;
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":role", $role);
            
            if (!empty($data->password)) {
                $stmt->bindParam(":password", $password);
            }
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "User updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update user"));
            }
        } catch(Exception $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(array("message" => "Email already exists"));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error updating user: " . $e->getMessage()));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "User ID is required"));
    }
}

function deleteUser($db, $id) {
    try {
        $query = "DELETE FROM users WHERE id = :id";
        $stmt = $db->prepare($query);
        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "User deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete user"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error deleting user: " . $e->getMessage()));
    }
}
?>