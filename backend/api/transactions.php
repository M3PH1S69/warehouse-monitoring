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
        getTransactions($db);
        break;
    case 'POST':
        createTransaction($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(array("message" => "Method not allowed"));
        break;
}

function getTransactions($db) {
    try {
        $query = "SELECT t.*, d.name as device_name, c.name as category_name 
                  FROM transactions t 
                  LEFT JOIN devices d ON t.device_id = d.id 
                  LEFT JOIN categories c ON d.category_id = c.id 
                  ORDER BY t.transaction_date DESC, t.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        $transactions = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Parse JSON registration_numbers if exists
            if ($row['registration_numbers']) {
                $row['registration_numbers'] = json_decode($row['registration_numbers']);
            }
            $transactions[] = $row;
        }
        
        http_response_code(200);
        echo json_encode($transactions);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(array("message" => "Error fetching transactions: " . $e->getMessage()));
    }
}

function createTransaction($db) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!empty($data->id) && !empty($data->device_id) && !empty($data->type) && !empty($data->quantity) && !empty($data->transaction_date) && !empty($data->user_name)) {
        try {
            $query = "INSERT INTO transactions (id, device_id, type, quantity, transaction_date, user_name, destination, recipient, source, sender, registration_numbers)
                      VALUES (:id, :device_id, :type, :quantity, :transaction_date, :user_name, :destination, :recipient, :source, :sender, :registration_numbers)";
            $stmt = $db->prepare($query);

            $id = htmlspecialchars(strip_tags($data->id));
            $device_id = htmlspecialchars(strip_tags($data->device_id));
            $type = htmlspecialchars(strip_tags($data->type));
            $quantity = (int)$data->quantity;
            $transaction_date = htmlspecialchars(strip_tags($data->transaction_date));
            $user_name = htmlspecialchars(strip_tags($data->user_name));
            $destination = isset($data->destination) ? htmlspecialchars(strip_tags($data->destination)) : null;
            $recipient = isset($data->recipient) ? htmlspecialchars(strip_tags($data->recipient)) : null;
            $source = isset($data->source) ? htmlspecialchars(strip_tags($data->source)) : null;
            $sender = isset($data->sender) ? htmlspecialchars(strip_tags($data->sender)) : null;
            $registration_numbers = isset($data->registration_numbers) ? json_encode($data->registration_numbers) : null;

            $stmt->bindParam(":id", $id);
            $stmt->bindParam(":device_id", $device_id);
            $stmt->bindParam(":type", $type);
            $stmt->bindParam(":quantity", $quantity);
            $stmt->bindParam(":transaction_date", $transaction_date);
            $stmt->bindParam(":user_name", $user_name);
            $stmt->bindParam(":destination", $destination);
            $stmt->bindParam(":recipient", $recipient);
            $stmt->bindParam(":source", $source);
            $stmt->bindParam(":sender", $sender);
            $stmt->bindParam(":registration_numbers", $registration_numbers);

            if (!$stmt->execute()) {
                throw new Exception("Failed to insert transaction");
            }

            // Update quantity di tabel devices
            $updateQuery = $type === 'in'
                ? "UPDATE devices SET quantity = quantity + :quantity WHERE id = :device_id"
                : "UPDATE devices SET quantity = quantity - :quantity WHERE id = :device_id";

            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->bindParam(":quantity", $quantity);
            $updateStmt->bindParam(":device_id", $device_id);
            $updateStmt->execute();

            http_response_code(201);
            echo json_encode(array("message" => "Transaction created successfully"));
        } catch(Exception $e) {
            http_response_code(500);
            echo json_encode(array("message" => "Error creating transaction: " . $e->getMessage()));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Incomplete data. id, device_id, type, quantity, transaction_date, user_name are required"));
    }
}
?>