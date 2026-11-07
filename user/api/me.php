<?php
// Returns the logged-in user's information (used by the Account page)
header("Content-Type: application/json; charset=UTF-8");
session_start();
require_once "db.php";

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Not logged in."]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT first_name, last_name, age, gender, email, phone_number,
                account_type, cv_path
         FROM users WHERE user_id = :id LIMIT 1"
    );
    $stmt->execute([":id" => $_SESSION["user_id"]]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Account not found."]);
        exit;
    }

    // Tell the page if a CV exists, but never send the file path
    $user["has_cv"] = !empty($user["cv_path"]);
    unset($user["cv_path"]);

    echo json_encode(["success" => true, "user" => $user]);

} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong."]);
}