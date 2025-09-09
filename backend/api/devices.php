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
        getDevices($db);
        break;
    case 'POST':
        createDevice($db);
        break;
    case 'PUT':
        updateDevice($db);
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteDevice($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Device ID is required"));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getDevices($db) {
    try {
        $query = "SELECT d.*, c.name as category_name FROM devices d 
                  LEFT JOIN categories c ON d.category_id = c.id 
                  ORDER BY d.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();

        $devices = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $devices[] = $row;
        }

        http_response_code(200);
        echo json_encode($devices);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching devices: " . $e->getMessage()));
    }
}

function createDevice($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name) && !empty($data->category_id) && !empty($data->brand)) {
        try {
            $query = "INSERT INTO devices (id, name, category_id, brand, quantity, status, condition, description) 
                      VALUES (:id, :name, :category_id, :brand, :quantity, :status, :condition, :description)";
            $stmt = $db->prepare($query);
            
            $id = htmlspecialchars(strip_tags($data->id));
            $name = htmlspecialchars(strip_tags($data->name));
            $category_id = (int)$data->category_id;
            $brand = htmlspecialchars(strip_tags($data->brand));
            $quantity = isset($data->quantity) ? (int)$data->quantity : 0;
            $status = isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'In Stock';
            $condition = isset($data->condition) ? htmlspecialchars(strip_tags($data->condition)) : 'Normal';
            $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":brand", $brand);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":condition", $condition);
            $stmt->bindParam(":description", $description);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Device created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create device"));
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(array("message" => "Error creating device: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Device ID is required"));
    }
}

function updateDevice($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id)) {
        try {
            $query = "UPDATE devices SET 
                      name = :name, 
                      category_id = :category_id, 
                      brand = :brand, 
                      quantity = :quantity, 
                      status = :status, 
                      condition = :condition, 
                      description = :description 
                      WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $id = htmlspecialchars(strip_tags($data->id));
            $name = htmlspecialchars(strip_tags($data->name));
            $category_id = (int)$data->category_id;
            $brand = htmlspecialchars(strip_tags($data->brand));
            $quantity = isset($data->quantity) ? (int)$data->quantity : 0;
            $status = isset($data->status) ? htmlspecialchars(strip_tags($data->status)) : 'In Stock';
            $condition = isset($data->condition) ? htmlspecialchars(strip_tags($data->condition)) : 'Normal';
            $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;

            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            $stmt->bindParam(":category_id", $category_id);
            $stmt->bindParam(":brand", $brand);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":status", $status);
            $stmt->bindParam(":condition", $condition);
            $stmt->bindParam(":description", $description);

            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Device updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update device"));
            }
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(array("message" => "Error updating device: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Device ID is required"));
    }
}

function deleteDevice($db, $id) {
    try {
        $query = "DELETE FROM devices WHERE id = :id";
        $stmt = $db->prepare($query);
        $id = htmlspecialchars(strip_tags($id));
        $stmt->bindParam(":id", $id);
        
        if($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Device deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete device"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error deleting device: " . $e->getMessage()));
    }
}
?>