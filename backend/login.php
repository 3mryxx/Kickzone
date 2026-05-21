<?php
/**
 * KICKZONE — User Login
 * POST /backend/login.php
 * Expected fields: email, password
 * 
 * M2/M3: Uses PHP sessions + cookies for web connectivity
 */

session_start(); // Start PHP session
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/db_connect.php';

// Debug logging
error_log('Login attempt - POST data: ' . print_r($_POST, true));

$email    = trim($_POST['email']    ?? '');
$password = $_POST['password']      ?? '';

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 1) {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials.']);
    exit;
}

$db = getDB();

$stmt = $db->prepare(
    'SELECT id, full_name, email, password FROM users WHERE email = ? LIMIT 1'
);
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$user   = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    error_log('User not found: ' . $email);
    echo json_encode(['success' => false, 'message' => 'Incorrect email or password.']);
    $db->close();
    exit;
}

if (!password_verify($password, $user['password'])) {
    error_log('Password mismatch for user: ' . $email);
    echo json_encode(['success' => false, 'message' => 'Incorrect email or password.']);
    $db->close();
    exit;
}

// Success — store in PHP session (server-side)
$_SESSION['kickzone_user_id']    = $user['id'];
$_SESSION['kickzone_user_name']  = $user['full_name'];
$_SESSION['kickzone_user_email'] = $user['email'];
$_SESSION['kickzone_logged_in']  = true;

error_log('Login successful for: ' . $email);

// Set a persistent cookie (30 days) for "remember me" functionality
$sessionToken = bin2hex(random_bytes(16));
setcookie(
    'kickzone_session',
    $sessionToken,
    time() + (86400 * 30),
    '/',
    '',
    false, // set true in production (HTTPS)
    true   // HttpOnly - prevents XSS access
);

// Return safe user object (never send password hash)
echo json_encode([
    'success' => true,
    'message' => 'Login successful.',
    'user'    => [
        'id'    => $user['id'],
        'name'  => $user['full_name'],
        'email' => $user['email'],
    ],
]);

$db->close();
?>