<?php

header("Content-Type: application/json");

session_set_cookie_params([
    "lifetime" => 0,
    "path" => "/",
    "secure" => !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off",
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

require_once __DIR__ . "/db.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$adminUsername = trim($data["username"] ?? "");
$adminPassword = $data["password"] ?? "";

if ($adminUsername === "" || $adminPassword === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter your username and password."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare(
        "SELECT admin_id, username, password_hash
         FROM admins
         WHERE username = :username
         LIMIT 1"
    );

    $stmt->execute([
        "username" => $adminUsername
    ]);

    $admin = $stmt->fetch();

    if (!$admin || !password_verify($adminPassword, $admin["password_hash"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Incorrect username or password."
        ]);
        exit;
    }

    session_regenerate_id(true);

    $_SESSION["admin_id"] = $admin["admin_id"];
    $_SESSION["admin_username"] = $admin["username"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful."
    ]);

} catch (PDOException $e) {
    error_log("Admin login error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Unable to process login. Please try again."
    ]);
}