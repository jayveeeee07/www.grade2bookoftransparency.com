<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$host = "127.0.0.1";
$username = "root";
$password = "";
$database = "pangkat_dalawa";

try {
    $conn = new PDO("mysql:host=$host;dbname=$database", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo json_encode([
        "status" => "success",
        "message" => "MySQL database connected on 127.0.0.1",
        "server" => "127.0.0.1",
        "database" => $database,
        "timestamp" => date('Y-m-d H:i:s')
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $e->getMessage(),
        "server" => "127.0.0.1",
        "help" => "Check: 1) XAMPP MySQL is running 2) Database 'pangkat_dalawa' exists"
    ]);
}
?>
