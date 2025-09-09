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
        getCategories($db);
        break;
    case 'POST':
        createCategory($db);
        break;
    case 'PUT':
        updateCategory($db);
        break;
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteCategory($db, $_GET['id']);
        } else {
            http_response_code(400);
            echo json_encode(array("message" => "Category ID is required"));
        }
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getCategories($db) {
    try {
        $query = "SELECT * FROM categories ORDER BY name ASC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $categories = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $categories[] = $row;
        }
        http_response_code(200);
        echo json_encode($categories);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching categories: " . $e->getMessage()));
    }
}
function createCategory($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->name)) {
        try {
            $query = "INSERT INTO categories (name) VALUES (:name)";
            $stmt = $db->prepare($query);
            
            $name = htmlspecialchars(strip_tags($data->name));
            $stmt->bindParam(":name", $name);
            
            if($stmt->execute()) {
                http_response_code(201);
                echo json_encode(array("message" => "Category created successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to create category"));
            }
        } catch(Exception $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(array("message" => "Category name already exists"));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error creating category: " . $e->getMessage()));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Category name is required"));
    }
}

function updateCategory($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->name)) {
        try {
            $query = "UPDATE categories SET name = :name WHERE id = :id";
            $stmt = $db->prepare($query);
            
            $id = $data->id;
            $name = htmlspecialchars(strip_tags($data->name));
            
            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":name", $name);
            
            if($stmt->execute()) {
                http_response_code(200);
                echo json_encode(array("message" => "Category updated successfully"));
            } else {
                http_response_code(503);
                echo json_encode(array("message" => "Unable to update category"));
            }
        } catch(Exception $e) {
            if ($e->getCode() == 23000) {
                http_response_code(409);
                echo json_encode(array("message" => "Category name already exists"));
            } else {
                http_response_code(500);
                echo json_encode(array("message" => "Error updating category: " . $e->getMessage()));
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Category ID and name are required"));
    }
}

function deleteCategory($db, $id) {
    try {
        // Check if category is being used by devices
        $checkQuery = "SELECT COUNT(*) as count FROM devices WHERE category_id = :id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(":id", $id);
        $checkStmt->execute();
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
        if ($result && (int)$result['count'] > 0) {
            http_response_code(409);
            echo json_encode(array("message" => "Cannot delete category in use by devices"));
            return;
        }

        $query = "DELETE FROM categories WHERE id = :id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Category deleted successfully"));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to delete category"));
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error deleting category: " . $e->getMessage()));
    }
}
?>