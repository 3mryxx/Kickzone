<?php
/**
 * KICKZONE — Payments API
 *
 * POST /backend/payment.php           → process payment for a booking
 * GET  /backend/payment.php?booking_id=X  → get payment status
 * 
 * Payment Methods: card, wallet, cash
 * Note: This is a demo implementation. In production, integrate with Stripe, PayPal, or similar.
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

// ── Helper: Generate unique reference code ─────────────
function generateReferenceCode() {
    return 'PAY-' . strtoupper(substr(md5(uniqid() . time()), 0, 8));
}

// ── GET — check payment status ──────────────────────────
if ($method === 'GET') {
    $booking_id = intval($_GET['booking_id'] ?? 0);
    
    if ($booking_id < 1) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing booking_id.']);
        exit;
    }
    
    $db = getDB();
    
    $stmt = $db->prepare(
        'SELECT p.id, p.booking_id, p.amount, p.payment_method, p.payment_status, 
                p.reference_code, p.created_at, b.status as booking_status
         FROM payments p
         JOIN bookings b ON b.id = p.booking_id
         WHERE p.booking_id = ?'
    );
    $stmt->bind_param('i', $booking_id);
    $stmt->execute();
    $payment = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();
    
    if (!$payment) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Payment not found.']);
        exit;
    }
    
    echo json_encode(['success' => true, 'payment' => $payment]);
    exit;
}

// ── POST — process payment ─────────────────────────────
if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true);
    
    $booking_id    = intval($raw['booking_id']    ?? $_POST['booking_id']    ?? 0);
    $user_id       = intval($raw['user_id']       ?? $_POST['user_id']       ?? 0);
    $payment_method = trim($raw['payment_method'] ?? $_POST['payment_method'] ?? '');
    $amount        = floatval($raw['amount']      ?? $_POST['amount']        ?? 0);
    $card_number   = trim($raw['card_number']     ?? $_POST['card_number']   ?? '');
    $card_cvv      = trim($raw['card_cvv']        ?? $_POST['card_cvv']      ?? '');
    $card_exp      = trim($raw['card_exp']        ?? $_POST['card_exp']      ?? '');
    
    // ── Basic validation ─────────────────────────────
    if ($booking_id < 1 || $user_id < 1 || $amount <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid booking, user, or amount.']);
        exit;
    }
    
    $valid_methods = ['card', 'wallet', 'cash'];
    if (!in_array($payment_method, $valid_methods)) {
        echo json_encode(['success' => false, 'message' => 'Invalid payment method.']);
        exit;
    }
    
    $db = getDB();
    
    // Verify booking exists and belongs to user
    $stmt = $db->prepare('SELECT id, total_price FROM bookings WHERE id = ? AND user_id = ?');
    $stmt->bind_param('ii', $booking_id, $user_id);
    $stmt->execute();
    $booking = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    
    if (!$booking) {
        echo json_encode(['success' => false, 'message' => 'Booking not found.']);
        $db->close();
        exit;
    }
    
    // Verify amount matches booking total
    if (abs($amount - $booking['total_price']) > 0.01) {
        echo json_encode(['success' => false, 'message' => 'Amount mismatch.']);
        $db->close();
        exit;
    }
    
    // Card payment validation
    if ($payment_method === 'card') {
        // Basic demo validation (in production, use a real payment gateway)
        if (!preg_match('/^\d{16}$/', str_replace(' ', '', $card_number))) {
            echo json_encode(['success' => false, 'message' => 'Invalid card number.']);
            $db->close();
            exit;
        }
        if (!preg_match('/^\d{3}$/', $card_cvv)) {
            echo json_encode(['success' => false, 'message' => 'Invalid CVV.']);
            $db->close();
            exit;
        }
        if (!preg_match('/^\d{2}\/\d{2}$/', $card_exp)) {
            echo json_encode(['success' => false, 'message' => 'Invalid expiry date (MM/YY).']);
            $db->close();
            exit;
        }
    }
    
    // Generate reference code
    $reference_code = generateReferenceCode();
    
    // In a real system, you'd call payment gateway here
    // For now, we'll simulate success
    $payment_status = 'completed'; // 'pending' in real system after gateway call
    $transaction_id = 'TXN-' . time();
    
    // Insert payment record
    $stmt = $db->prepare(
        'INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_status, transaction_id, reference_code)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('iidssss', $booking_id, $user_id, $amount, $payment_method, $payment_status, $transaction_id, $reference_code);
    
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Payment creation failed.']);
        $stmt->close();
        $db->close();
        exit;
    }
    
    $payment_id = $stmt->insert_id;
    $stmt->close();
    
    // Update booking status to confirmed
    $new_status = 'confirmed';
    $stmt = $db->prepare('UPDATE bookings SET status = ? WHERE id = ?');
    $stmt->bind_param('si', $new_status, $booking_id);
    $stmt->execute();
    $stmt->close();
    
    $db->close();
    
    echo json_encode([
        'success' => true,
        'message' => 'Payment processed successfully.',
        'payment' => [
            'id'              => $payment_id,
            'booking_id'      => $booking_id,
            'amount'          => $amount,
            'payment_method'  => $payment_method,
            'payment_status'  => $payment_status,
            'reference_code'  => $reference_code,
            'transaction_id'  => $transaction_id
        ]
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
