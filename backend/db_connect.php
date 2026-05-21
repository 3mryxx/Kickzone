<?php
/**
 * KICKZONE — Database Connection
 * ================================
 * Configure your XAMPP MySQL credentials below.
 * This file is required by all backend scripts.
 */

define('DB_HOST', 'localhost');
define('DB_USER', 'root');       // default XAMPP user
define('DB_PASS', '');           // default XAMPP password (empty)
define('DB_NAME', 'kickzone');

function getDB(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed. Please try again later.',
        ]);
        exit;
    }

    $conn->set_charset('utf8mb4');
    return $conn;
}
