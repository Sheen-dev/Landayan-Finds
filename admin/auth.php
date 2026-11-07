<?php

session_set_cookie_params([
    "lifetime" => 0,
    "path" => "/",
    "secure" => !empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off",
    "httponly" => true,
    "samesite" => "Lax"
]);

session_start();

// Check if an administrator is logged in.
if (!isset($_SESSION["admin_id"])) {
    header("Location: login.html");
    exit;
}