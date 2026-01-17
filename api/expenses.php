<?php
require_once 'db_connect.php';

$database = new Database();
$db = $database->getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get all expenses or by month
    if (isset($_GET['month'])) {
        getExpensesByMonth($db, $_GET['month']);
    } else {
        getAllExpenses($db);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Create new expense
    $data = json_decode(file_get_contents("php://input"));
    createExpense($db, $data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update expense
    $data = json_decode(file_get_contents("php://input"));
    updateExpense($db, $data);
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete expense
    if (isset($_GET['id'])) {
        deleteExpense($db, $_GET['id']);
    }
}

function getAllExpenses($db) {
    $query = "SELECT * FROM expenses ORDER BY month, entry_no";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $expenses = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $expenses[] = $row;
    }
    
    echo json_encode($expenses);
}

function getExpensesByMonth($db, $month) {
    $query = "SELECT * FROM expenses WHERE month = ? ORDER BY entry_no";
    $stmt = $db->prepare($query);
    $stmt->execute([$month]);
    
    $expenses = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $expenses[] = $row;
    }
    
    echo json_encode($expenses);
}

function createExpense($db, $data) {
    $query = "INSERT INTO expenses (month, entry_no, name, expense_date, purpose, pcs, amount, source) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->month, 
        $data->entry_no, 
        $data->name, 
        $data->expense_date, 
        $data->purpose, 
        $data->pcs, 
        $data->amount, 
        $data->source
    ])) {
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Expense created"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to create expense"]);
    }
}

function updateExpense($db, $data) {
    $query = "UPDATE expenses SET 
              month = ?, entry_no = ?, name = ?, expense_date = ?, 
              purpose = ?, pcs = ?, amount = ?, source = ?, 
              updated_at = NOW() 
              WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([
        $data->month, $data->entry_no, $data->name, $data->expense_date,
        $data->purpose, $data->pcs, $data->amount, $data->source, $data->id
    ])) {
        echo json_encode(["success" => true, "message" => "Expense updated"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update expense"]);
    }
}

function deleteExpense($db, $id) {
    $query = "DELETE FROM expenses WHERE id = ?";
    $stmt = $db->prepare($query);
    
    if ($stmt->execute([$id])) {
        echo json_encode(["success" => true, "message" => "Expense deleted"]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete expense"]);
    }
}
?>
