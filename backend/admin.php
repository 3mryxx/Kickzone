<?php
/**
 * KICKZONE — Admin API
 *
 * GET /backend/admin.php?action=dashboard              → dashboard stats
 * GET /backend/admin.php?action=users&limit=50         → list all users
 * GET /backend/admin.php?action=bookings&limit=50      → list all bookings
 * GET /backend/admin.php?action=payments&limit=50      → list all payments
 * GET /backend/admin.php?action=fields                 → list all fields
 * POST /backend/admin.php                              → create/update admin actions
 *
 * Auth: Requires user_id with admin role
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
$action = $_GET['action'] ?? '';
$user_id = intval($_GET['user_id'] ?? $_POST['user_id'] ?? 0);

// ── Helper: Check if user is admin ─────────────────────
function isAdmin($user_id, $db) {
    if ($user_id < 1) return false;
    
    $stmt = $db->prepare('SELECT role FROM users WHERE id = ?');
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    return $result && $result['role'] === 'admin';
}

// ── GET — fetch admin data ─────────────────────────────
if ($method === 'GET') {
    $db = getDB();
    
    // Verify admin
    if (!isAdmin($user_id, $db)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
        $db->close();
        exit;
    }
    
    $limit = intval($_GET['limit'] ?? 50);
    $offset = intval($_GET['offset'] ?? 0);
    $limit = min($limit, 500); // Cap at 500
    
    // Dashboard stats
    if ($action === 'dashboard') {
        // Total users
        $result = $db->query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
        $total_users = $result->fetch_assoc()['count'];
        
        // Total bookings
        $result = $db->query('SELECT COUNT(*) as count FROM bookings');
        $total_bookings = $result->fetch_assoc()['count'];
        
        // Total revenue
        $result = $db->query('SELECT SUM(amount) as total FROM payments WHERE payment_status = "completed"');
        $total_revenue = $result->fetch_assoc()['total'] ?? 0;
        
        // Pending payments
        $result = $db->query('SELECT COUNT(*) as count FROM payments WHERE payment_status = "pending"');
        $pending_payments = $result->fetch_assoc()['count'];
        
        // Recent bookings
        $stmt = $db->prepare(
            'SELECT b.id, b.date, b.start_time, b.end_time, b.total_price, b.status,
                    u.full_name as user_name, f.name as field_name
             FROM bookings b
             JOIN users u ON u.id = b.user_id
             JOIN fields f ON f.id = b.field_id
             ORDER BY b.created_at DESC
             LIMIT 10'
        );
        $stmt->execute();
        $recent_bookings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        echo json_encode([
            'success' => true,
            'dashboard' => [
                'total_users'      => $total_users,
                'total_bookings'   => $total_bookings,
                'total_revenue'    => floatval($total_revenue),
                'pending_payments' => $pending_payments,
                'recent_bookings'  => $recent_bookings
            ]
        ]);
        $db->close();
        exit;
    }
    
    // List users
    if ($action === 'users') {
        $stmt = $db->prepare(
            'SELECT id, full_name, email, phone, role, created_at 
             FROM users 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?'
        );
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $users = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        // Total count
        $result = $db->query('SELECT COUNT(*) as count FROM users');
        $total = $result->fetch_assoc()['count'];
        
        echo json_encode([
            'success' => true,
            'users'   => $users,
            'total'   => $total,
            'limit'   => $limit,
            'offset'  => $offset
        ]);
        $db->close();
        exit;
    }
    
    // List bookings
    if ($action === 'bookings') {
        $stmt = $db->prepare(
            'SELECT b.id, b.date, b.start_time, b.end_time, b.total_price, b.status, b.created_at,
                    u.full_name as user_name, u.email as user_email, 
                    f.name as field_name, f.location
             FROM bookings b
             JOIN users u ON u.id = b.user_id
             JOIN fields f ON f.id = b.field_id
             ORDER BY b.created_at DESC 
             LIMIT ? OFFSET ?'
        );
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $bookings = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        $result = $db->query('SELECT COUNT(*) as count FROM bookings');
        $total = $result->fetch_assoc()['count'];
        
        echo json_encode([
            'success' => true,
            'bookings' => $bookings,
            'total'    => $total,
            'limit'    => $limit,
            'offset'   => $offset
        ]);
        $db->close();
        exit;
    }
    
    // List payments
    if ($action === 'payments') {
        $stmt = $db->prepare(
            'SELECT p.id, p.booking_id, p.amount, p.payment_method, p.payment_status, 
                    p.reference_code, p.created_at,
                    u.full_name as user_name, u.email, 
                    f.name as field_name
             FROM payments p
             JOIN bookings b ON b.id = p.booking_id
             JOIN users u ON u.id = b.user_id
             JOIN fields f ON f.id = b.field_id
             ORDER BY p.created_at DESC 
             LIMIT ? OFFSET ?'
        );
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $payments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        $result = $db->query('SELECT COUNT(*) as count FROM payments');
        $total = $result->fetch_assoc()['count'];
        
        echo json_encode([
            'success' => true,
            'payments' => $payments,
            'total'    => $total,
            'limit'    => $limit,
            'offset'   => $offset
        ]);
        $db->close();
        exit;
    }
    
    // List fields
    if ($action === 'fields') {
        $stmt = $db->prepare(
            'SELECT id, name, location, governorate, sport_type, price_hour, rating, created_at 
             FROM fields 
             ORDER BY created_at DESC 
             LIMIT ? OFFSET ?'
        );
        $stmt->bind_param('ii', $limit, $offset);
        $stmt->execute();
        $fields = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        
        $result = $db->query('SELECT COUNT(*) as count FROM fields');
        $total = $result->fetch_assoc()['count'];
        
        echo json_encode([
            'success' => true,
            'fields'  => $fields,
            'total'   => $total,
            'limit'   => $limit,
            'offset'  => $offset
        ]);
        $db->close();
        exit;
    }
    
    $db->close();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    exit;
}

// ── POST — Admin actions ────────────────────────────────
if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true);
    $action = $raw['action'] ?? '';
    
    $db = getDB();
    
    // Verify admin
    if (!isAdmin($user_id, $db)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Admin access required.']);
        $db->close();
        exit;
    }
    
    // Cancel booking
    if ($action === 'cancel_booking') {
        $booking_id = intval($raw['booking_id'] ?? 0);
        
        $stmt = $db->prepare('UPDATE bookings SET status = ? WHERE id = ?');
        $new_status = 'cancelled';
        $stmt->bind_param('si', $new_status, $booking_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Booking cancelled.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to cancel booking.']);
        }
        $stmt->close();
        $db->close();
        exit;
    }
    
    // Refund payment
    if ($action === 'refund_payment') {
        $payment_id = intval($raw['payment_id'] ?? 0);
        
        $stmt = $db->prepare('UPDATE payments SET payment_status = ? WHERE id = ?');
        $new_status = 'refunded';
        $stmt->bind_param('si', $new_status, $payment_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Payment refunded.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to refund payment.']);
        }
        $stmt->close();
        $db->close();
        exit;
    }
    
    // Create new field
    if ($action === 'create_field') {
        $name = trim($raw['name'] ?? '');
        $location = trim($raw['location'] ?? '');
        $governorate = trim($raw['governorate'] ?? '');
        $sport_type = trim($raw['sport_type'] ?? 'Football');
        $price_hour = floatval($raw['price_hour'] ?? 0);
        $rating = floatval($raw['rating'] ?? 4.5);
        $image_url = trim($raw['image_url'] ?? '');
        
        if (!$name || !$location || !$governorate || $price_hour <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid field data.']);
            $db->close();
            exit;
        }
        
        $stmt = $db->prepare(
            'INSERT INTO fields (name, location, governorate, sport_type, price_hour, rating, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->bind_param('ssssids', $name, $location, $governorate, $sport_type, $price_hour, $rating, $image_url);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Field created.',
                'field_id' => $stmt->insert_id
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create field.']);
        }
        $stmt->close();
        $db->close();
        exit;
    }
    
    $db->close();
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action.']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
