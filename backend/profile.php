<?php
/**
 * KICKZONE — User Profile API
 *
 * GET  /backend/profile.php?user_id=X   → get user profile + stats
 * POST /backend/profile.php             → update profile (name, phone)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET — fetch profile + stats ──────────────────────
if ($method === 'GET') {
    $user_id = intval($_GET['user_id'] ?? 0);

    if ($user_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing user_id.']);
        exit;
    }

    $db = getDB();

    // User info
    $ustmt = $db->prepare('SELECT id, full_name, email, phone, created_at FROM users WHERE id = ?');
    $ustmt->bind_param('i', $user_id);
    $ustmt->execute();
    $user = $ustmt->get_result()->fetch_assoc();
    $ustmt->close();

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found.']);
        $db->close();
        exit;
    }

    // Booking stats
    $sstmt = $db->prepare(
        'SELECT
           COUNT(*) AS total_bookings,
           COALESCE(SUM(CASE WHEN status = "confirmed" THEN 1 ELSE 0 END), 0) AS confirmed,
           COALESCE(SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END), 0) AS cancelled,
           COALESCE(SUM(CASE WHEN status = "confirmed" THEN total_price ELSE 0 END), 0) AS total_spent
         FROM bookings WHERE user_id = ?'
    );
    $sstmt->bind_param('i', $user_id);
    $sstmt->execute();
    $stats = $sstmt->get_result()->fetch_assoc();
    $sstmt->close();
    $db->close();

    echo json_encode([
        'success' => true,
        'user'    => $user,
        'stats'   => $stats,
    ]);
    exit;
}

// ── POST — update profile ────────────────────────────
if ($method === 'POST') {
    $raw     = json_decode(file_get_contents('php://input'), true) ?? [];
    $user_id  = intval($raw['user_id']   ?? $_POST['user_id']   ?? 0);
    $full_name = trim($raw['full_name']  ?? $_POST['full_name'] ?? '');
    $phone    = trim($raw['phone']       ?? $_POST['phone']     ?? '');

    if ($user_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing user_id.']);
        exit;
    }

    if (strlen($full_name) < 3) {
        echo json_encode(['success' => false, 'message' => 'Name must be at least 3 characters.']);
        exit;
    }

    $db = getDB();

    $stmt = $db->prepare('UPDATE users SET full_name = ?, phone = ? WHERE id = ?');
    $stmt->bind_param('ssi', $full_name, $phone, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows >= 0) { // 0 means no change but still success
        echo json_encode([
            'success' => true,
            'message' => 'Profile updated.',
            'user'    => ['id' => $user_id, 'name' => $full_name, 'email' => null],
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Update failed. Please try again.']);
    }

    $stmt->close();
    $db->close();
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
