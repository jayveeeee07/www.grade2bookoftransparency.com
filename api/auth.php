<?php
require_once 'db_connect.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->action)) {
        switch($data->action) {
            case 'login':
                loginUser($db, $data);
                break;
            case 'register':
                registerUser($db, $data);
                break;
            case 'logout':
                logoutUser();
                break;
        }
    }
}

function loginUser($db, $data) {
    if (!isset($data->username) || !isset($data->password)) {
        http_response_code(400);
        echo json_encode(["message" => "Username and password required"]);
        return;
    }
    
    $query = "SELECT * FROM users WHERE username = ? AND is_active = 1";
    $stmt = $db->prepare($query);
    $stmt->execute([$data->username]);
    
    if ($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // For simplicity, using plain text comparison
        // In production, use password_hash() and password_verify()
        if ($user['password'] === $data->password) {
            // Update last login
            $updateQuery = "UPDATE users SET last_login = NOW() WHERE id = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$user['id']]);
            
            // Remove password from response
            unset($user['password']);
            
            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Login successful",
                "user" => $user
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Invalid password"]);
        }
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found"]);
    }
}

function registerUser($db, $data) {
    if (!isset($data->username) || !isset($data->password) || !isset($data->full_name)) {
        http_response_code(400);
        echo json_encode(["message" => "All fields required"]);
        return;
    }
    
    // Check if username exists
    $checkQuery = "SELECT id FROM users WHERE username = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute([$data->username]);
    
    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Username already exists"]);
        return;
    }
    
    // Insert new user
    $query = "INSERT INTO users (username, password, role, full_name) 
              VALUES (?, ?, 'member', ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$data->username, $data->password, $data->full_name])) {
        http_response_code(201);
        echo json_encode([
            "success" => true,
            "message" => "User registered successfully",
            "user_id" => $db->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Registration failed"]);
    }
}

function logoutUser() {
    // Clear any session data if using sessions
    echo json_encode(["success" => true, "message" => "Logged out"]);
}
?>
