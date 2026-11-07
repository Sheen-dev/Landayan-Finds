<?php
// Logs the user out by destroying the session
header("Content-Type: application/json; charset=UTF-8");
session_start();
$_SESSION = [];
session_destroy();
echo json_encode(["success" => true, "message" => "Logged out."]);