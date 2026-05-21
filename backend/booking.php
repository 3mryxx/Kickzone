<?php
/**
 * KICKZONE — Bookings API
 *
 * GET  /backend/booking.php              → list bookings for logged-in user (user_id via query param)
 * POST /backend/booking.php             → create a new booking
 * DELETE /backend/booking.php?id=X      → cancel a booking
 *
 * Auth: user_id is passed as JSON/FormData field (stored in localStorage client-side).
 * For a production app you'd use server sessions, but this matches the project's pattern.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET — fetch bookings for a user ─────────────────
if ($method === 'GET') {
    $user_id = intval($_GET['user_id'] ?? 0);

    if ($user_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing user_id.']);
        exit;
    }

    $db = getDB();

    $stmt = $db->prepare(
        'SELECT b.id, b.date, b.start_time, b.end_time, b.total_price, b.status, b.created_at,
                f.name AS field_name, f.location, f.governorate, f.sport_type, f.image_url, f.price_hour
         FROM bookings b
         JOIN fields f ON f.id = b.field_id
         WHERE b.user_id = ?
         ORDER BY b.date DESC, b.start_time DESC'
    );
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $db->close();

    echo json_encode(['success' => true, 'bookings' => $rows]);
    exit;
}

// ── POST — create a booking ───────────────────────────
if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true);

    // Accept both JSON body and FormData
    $user_id    = intval($raw['user_id']    ?? $_POST['user_id']    ?? 0);
    $field_id   = intval($raw['field_id']   ?? $_POST['field_id']   ?? 0);
    $date       = trim($raw['date']         ?? $_POST['date']       ?? '');
    $start_time = trim($raw['start_time']   ?? $_POST['start_time'] ?? '');
    $end_time   = trim($raw['end_time']     ?? $_POST['end_time']   ?? '');

    // ── Basic validation ─────────────────────────────
    if ($user_id < 1 || $field_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid user or field.']);
        exit;
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        echo json_encode(['success' => false, 'message' => 'Invalid date format (YYYY-MM-DD).']);
        exit;
    }

    // Date must not be in the past
    $today = date('Y-m-d');
    if ($date < $today) {
        echo json_encode(['success' => false, 'message' => 'Cannot book a date in the past.']);
        exit;
    }

    if (!preg_match('/^\d{2}:\d{2}$/', $start_time) || !preg_match('/^\d{2}:\d{2}$/', $end_time)) {
        echo json_encode(['success' => false, 'message' => 'Invalid time format (HH:MM).']);
        exit;
    }

    if ($start_time >= $end_time) {
        echo json_encode(['success' => false, 'message' => 'End time must be after start time.']);
        exit;
    }

    // Booking must be at least 1 hour
    $start_mins = (int)substr($start_time, 0, 2) * 60 + (int)substr($start_time, 3, 2);
    $end_mins   = (int)substr($end_time,   0, 2) * 60 + (int)substr($end_time,   3, 2);
    $duration_h = ($end_mins - $start_mins) / 60;

    if ($duration_h < 1) {
        echo json_encode(['success' => false, 'message' => 'Minimum booking duration is 1 hour.']);
        exit;
    }

    $db = getDB();

    // ── Fetch field price ────────────────────────────
    $fstmt = $db->prepare('SELECT id, price_hour FROM fields WHERE id = ?');
    $fstmt->bind_param('i', $field_id);
    $fstmt->execute();
    $field = $fstmt->get_result()->fetch_assoc();
    $fstmt->close();

    if (!$field) {
        echo json_encode(['success' => false, 'message' => 'Field not found.']);
        $db->close();
        exit;
    }

    $total_price = round($field['price_hour'] * $duration_h, 2);

    // ── Check for time slot conflicts ────────────────
    $conflict = $db->prepare(
        'SELECT id FROM bookings
         WHERE field_id = ? AND date = ?
           AND status != "cancelled"
           AND start_time < ? AND end_time > ?
         LIMIT 1'
    );
    $conflict->bind_param('isss', $field_id, $date, $end_time, $start_time);
    $conflict->execute();
    $conflict->store_result();

    if ($conflict->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'This time slot is already booked. Please choose another.']);
        $conflict->close();
        $db->close();
        exit;
    }
    $conflict->close();

    // ── Insert booking ───────────────────────────────
    $ins = $db->prepare(
        'INSERT INTO bookings (user_id, field_id, date, start_time, end_time, total_price, status)
         VALUES (?, ?, ?, ?, ?, ?, "confirmed")'
    );
    $ins->bind_param('iisssd', $user_id, $field_id, $date, $start_time, $end_time, $total_price);

    if ($ins->execute()) {
        $booking_id = $db->insert_id;
        echo json_encode([
            'success'     => true,
            'message'     => 'Booking confirmed!',
            'booking_id'  => $booking_id,
            'total_price' => $total_price,
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Booking failed. Please try again.']);
    }

    $ins->close();
    $db->close();
    exit;
}

// ── DELETE — cancel a booking ────────────────────────
if ($method === 'DELETE') {
    $raw     = json_decode(file_get_contents('php://input'), true);
    $id      = intval($raw['id']      ?? $_GET['id']      ?? 0);
    $user_id = intval($raw['user_id'] ?? $_GET['user_id'] ?? 0);

    if ($id < 1 || $user_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing booking id or user_id.']);
        exit;
    }

    $db = getDB();

    // Only the owner can cancel; only future bookings can be cancelled
    $stmt = $db->prepare(
        'UPDATE bookings SET status = "cancelled"
         WHERE id = ? AND user_id = ? AND status = "confirmed" AND date >= CURDATE()'
    );
    $stmt->bind_param('ii', $id, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        echo json_encode(['success' => true, 'message' => 'Booking cancelled.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Booking could not be cancelled. It may already be past or cancelled.']);
    }

    $stmt->close();
    $db->close();
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
