<?php
/**
 * KICKZONE — Fields API
 * GET /backend/fields.php              → list all fields
 * GET /backend/fields.php?gov=Cairo    → filter by governorate
 * GET /backend/fields.php?q=arena      → search by name/location
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/db_connect.php';

$db  = getDB();
$gov = trim($_GET['gov'] ?? '');
$q   = trim($_GET['q']   ?? '');

$sql    = 'SELECT * FROM fields WHERE 1=1';
$params = [];
$types  = '';

if ($gov !== '') {
    $sql    .= ' AND governorate = ?';
    $types  .= 's';
    $params[] = $gov;
}

if ($q !== '') {
    $like     = "%{$q}%";
    $sql     .= ' AND (name LIKE ? OR location LIKE ?)';
    $types   .= 'ss';
    $params[] = $like;
    $params[] = $like;
}

$sql .= ' ORDER BY rating DESC';

$stmt = $db->prepare($sql);
if ($types) {
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
$stmt->close();
$db->close();

echo json_encode(['success' => true, 'fields' => $rows]);
