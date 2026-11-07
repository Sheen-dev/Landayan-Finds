<?php

header("Content-Type: application/json; charset=UTF-8");

session_start();

require_once "db.php";

function respond($status, $message) {
    http_response_code($status);

    echo json_encode([
        "success" => $status >= 200 && $status < 300,
        "message" => $message
    ]);

    exit;
}

// Only accept POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, "Invalid request method.");
}

// Read login information
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(400, "Invalid request data.");
}

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

// Validate required fields
if ($email === "" || $password === "") {
    respond(400, "Please enter your email and password.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, "Please enter a valid email address.");
}

try {

    // Find the account
    $sql = "SELECT
                user_id,
                first_name,
                last_name,
                email,
                password_hash,
                account_type
            FROM users
            WHERE email = :email
            LIMIT 1";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ":email" => $email
    ]);

    $user = $stmt->fetch();

    // Verify account and password
    if (!$user || !password_verify($password, $user["password_hash"])) {
        respond(401, "Incorrect email or password.");
    }

    // Prevent session fixation
    session_regenerate_id(true);

    // Save account information in the session
    $_SESSION["user_id"] = $user["user_id"];
    $_SESSION["user_name"] = $user["first_name"] . " " . $user["last_name"];
    $_SESSION["user_email"] = $user["email"];
    $_SESSION["account_type"] = $user["account_type"];

    respond(200, "Login successful.");

} catch (PDOException $e) {

    error_log($e->getMessage());

    respond(500, "Something went wrong while logging in.");
}