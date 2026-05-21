<?php
/**
 * KICKZONE — User Registration
 * POST /backend/registration.php
 * Expected fields: full_name, email, password, confirm, phone (optional)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/db_connect.php';

// ── Input sanitization ──────────────────────────────
$full_name = trim($_POST['full_name'] ?? '');
$email     = trim($_POST['email']     ?? '');
$password  = $_POST['password']       ?? '';
$confirm   = $_POST['confirm']        ?? '';
$phone     = trim($_POST['phone']     ?? '');

// ── Validation ───────────────────────────────────────
if (strlen($full_name) < 3) {
    echo json_encode(['success' => false, 'message' => 'Name must be at least 3 characters.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
    exit;
}

if ($password !== $confirm) {
    echo json_encode(['success' => false, 'message' => 'Passwords do not match.']);
    exit;
}

$db = getDB();

// ── Check email uniqueness ───────────────────────────
$stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'This email address is already registered.']);
    $stmt->close();
    $db->close();
    exit;
}
$stmt->close();

// ── Insert ───────────────────────────────────────────
$hash = password_hash($password, PASSWORD_BCRYPT);

$ins = $db->prepare(
    'INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)'
);
$ins->bind_param('ssss', $full_name, $email, $phone, $hash);

if ($ins->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully.',
        'user'    => [
            'id'   => $db->insert_id,
            'name' => $full_name,
            'email'=> $email,
        ],
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed. Please try again.']);
}

$ins->close();
$db->close();
