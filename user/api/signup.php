<?php

header("Content-Type: application/json; charset=UTF-8");

require_once "db.php";

function respond($status, $message) {
    http_response_code($status);

    echo json_encode([
        "success" => $status >= 200 && $status < 300,
        "message" => $message
    ]);

    exit;
}

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respond(405, "Invalid request method.");
}

// Read JSON sent by the signup page
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    respond(400, "Invalid request data.");
}

// Get and clean form values
$firstName = trim($data["first_name"] ?? "");
$lastName = trim($data["last_name"] ?? "");
$age = filter_var($data["age"] ?? null, FILTER_VALIDATE_INT);
$gender = trim($data["gender"] ?? "");
$email = trim($data["email"] ?? "");
$phoneNumber = trim($data["phone_number"] ?? "");
$password = $data["password"] ?? "";
$confirmPassword = $data["confirm_password"] ?? "";
$accountType = trim($data["account_type"] ?? "");

// Check required fields
if (
    $firstName === "" ||
    $lastName === "" ||
    $age === false ||
    $gender === "" ||
    $email === "" ||
    $phoneNumber === "" ||
    $password === "" ||
    $confirmPassword === "" ||
    $accountType === ""
) {
    respond(400, "Please complete all required fields.");
}

// Validate age
if ($age < 15 || $age > 100) {
    respond(400, "Age must be between 15 and 100.");
}

// Validate gender
$allowedGenders = [
    "Male",
    "Female",
    "Prefer not to say"
];

if (!in_array($gender, $allowedGenders, true)) {
    respond(400, "Please select a valid gender.");
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, "Please enter a valid email address.");
}

// Validate phone number length
if (strlen($phoneNumber) > 30) {
    respond(400, "Phone number is too long.");
}

// Validate password
if (strlen($password) < 8) {
    respond(400, "Password must contain at least 8 characters.");
}

if (strlen($password) > 4096) {
    respond(400, "Password is too long.");
}

// Confirm passwords
if ($password !== $confirmPassword) {
    respond(400, "Passwords do not match.");
}

// Validate account type
$allowedAccountTypes = [
    "job_seeker",
    "business_owner"
];

if (!in_array($accountType, $allowedAccountTypes, true)) {
    respond(400, "Please select a valid account type.");
}

// Hash the password before saving it
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

try {

    $sql = "INSERT INTO users (
        first_name,
        last_name,
        age,
        gender,
        email,
        phone_number,
        password_hash,
        account_type
    ) VALUES (
        :first_name,
        :last_name,
        :age,
        :gender,
        :email,
        :phone_number,
        :password_hash,
        :account_type
    )";

    $stmt = $pdo->prepare($sql);

    $stmt->execute([
        ":first_name" => $firstName,
        ":last_name" => $lastName,
        ":age" => $age,
        ":gender" => $gender,
        ":email" => $email,
        ":phone_number" => $phoneNumber,
        ":password_hash" => $passwordHash,
        ":account_type" => $accountType
    ]);

    respond(201, "Your account has been created successfully.");

} catch (PDOException $e) {

    // Duplicate email
    if ($e->getCode() === "23000") {
        respond(409, "This email address is already registered.");
    }

    error_log($e->getMessage());

    respond(500, "Something went wrong while creating your account.");
}