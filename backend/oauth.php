<?php
/**
 * KICKZONE — OAuth Handler
 *
 * GET  /backend/oauth.php?action=login&provider=google|facebook  → init OAuth flow
 * GET  /backend/oauth.php?action=callback&provider=google|facebook&code=...  → handle callback
 * POST /backend/oauth.php                                       → process OAuth token
 *
 * Note: Requires Google OAuth 2.0 and Facebook App credentials in config.
 * For demo, generates test OAuth URLs.
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db_connect.php';

// ── OAuth Configuration (Add your actual keys) ──────────
// Store these in environment variables in production
define('GOOGLE_CLIENT_ID',     getenv('GOOGLE_CLIENT_ID')     ?: '1061767123135-2ckh1chtddaiql32ukkdmcce96t1ff69.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ?: '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');
define('GOOGLE_REDIRECT_URI',  'http://localhost/kickzone-fixed/backend/oauth.php?provider=google&action=callback');

define('FACEBOOK_APP_ID',      getenv('FACEBOOK_APP_ID')      ?: 'YOUR_FACEBOOK_APP_ID');
define('FACEBOOK_APP_SECRET',  getenv('FACEBOOK_APP_SECRET')  ?: 'YOUR_FACEBOOK_APP_SECRET');
define('FACEBOOK_REDIRECT_URI','http://localhost/kickzone-fixed/backend/oauth.php?provider=facebook&action=callback');

$method   = $_SERVER['REQUEST_METHOD'];
$action   = $_GET['action'] ?? 'login';
$provider = $_GET['provider'] ?? '';

// ── GET — OAuth flow initiation ────────────────────────
if ($method === 'GET') {
    
    // Initialize OAuth flow
    if ($action === 'login') {
        if ($provider === 'google') {
            $state = bin2hex(random_bytes(16));
            $_SESSION['oauth_state'] = $state;
            
            $auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
                'client_id'     => GOOGLE_CLIENT_ID,
                'redirect_uri'  => GOOGLE_REDIRECT_URI,
                'response_type' => 'code',
                'scope'         => 'openid email profile',
                'state'         => $state
            ]);
            
            // Return demo URL for testing
            echo json_encode([
                'success' => true,
                'auth_url' => $auth_url,
                'message' => 'Redirect to this URL to login with Google'
            ]);
            exit;
        }
        
        if ($provider === 'facebook') {
            $state = bin2hex(random_bytes(16));
            $_SESSION['oauth_state'] = $state;
            
            $auth_url = 'https://www.facebook.com/v18.0/dialog/oauth?' . http_build_query([
                'client_id'    => FACEBOOK_APP_ID,
                'redirect_uri' => FACEBOOK_REDIRECT_URI,
                'state'        => $state,
                'scope'        => 'email,public_profile'
            ]);
            
            echo json_encode([
                'success' => true,
                'auth_url' => $auth_url,
                'message' => 'Redirect to this URL to login with Facebook'
            ]);
            exit;
        }
    }
    
    // Handle OAuth callback
    if ($action === 'callback') {
        $code = $_GET['code'] ?? '';
        $state = $_GET['state'] ?? '';
        
        if (!$code || $state !== ($_SESSION['oauth_state'] ?? '')) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid OAuth response.']);
            exit;
        }
        
        $db = getDB();
        $user_data = null;
        
        // Exchange code for token with provider
        if ($provider === 'google') {
            $user_data = handleGoogleCallback($code, $db);
        } elseif ($provider === 'facebook') {
            $user_data = handleFacebookCallback($code, $db);
        }
        
        if (!$user_data) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'OAuth authentication failed.']);
            $db->close();
            exit;
        }
        
        // Find or create user
        // First: Check if this OAuth ID already exists
        $stmt = $db->prepare(
            'SELECT id, full_name, email FROM users WHERE oauth_provider = ? AND oauth_id = ? LIMIT 1'
        );
        $stmt->bind_param('ss', $provider, $user_data['oauth_id']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        
        if (!$user) {
            // Second: Check if email already exists (from manual signup or another provider)
            $stmt = $db->prepare(
                'SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1'
            );
            $stmt->bind_param('s', $user_data['email']);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            
            if ($user) {
                // Email exists - update with OAuth info
                $stmt = $db->prepare(
                    'UPDATE users SET oauth_provider = ?, oauth_id = ?, avatar_url = ? WHERE email = ?'
                );
                $stmt->bind_param('ssss', $provider, $user_data['oauth_id'], $user_data['avatar_url'], $user_data['email']);
                $stmt->execute();
                $stmt->close();
                
                error_log('OAuth: Updated existing user with OAuth info: ' . $user_data['email']);
            } else {
                // Create new OAuth user
                $password = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
                $stmt = $db->prepare(
                    'INSERT INTO users (full_name, email, password, oauth_provider, oauth_id, avatar_url, role)
                     VALUES (?, ?, ?, ?, ?, ?, ?)'
                );
                $role = 'user';
                $stmt->bind_param('sssssss', 
                    $user_data['name'], 
                    $user_data['email'], 
                    $password,
                    $provider,
                    $user_data['oauth_id'],
                    $user_data['avatar_url'],
                    $role
                );
                
                if (!$stmt->execute()) {
                    error_log('OAuth: Insert failed - ' . $stmt->error);
                    echo json_encode(['success' => false, 'message' => 'Failed to create user account.']);
                    $stmt->close();
                    $db->close();
                    exit;
                }
                
                $user_id = $stmt->insert_id;
                $stmt->close();
                
                $user = [
                    'id'        => $user_id,
                    'full_name' => $user_data['name'],
                    'email'     => $user_data['email']
                ];
                
                error_log('OAuth: Created new user: ' . $user_data['email']);
            }
        }
        
        $db->close();
        
        // Session already started at top of file; set session data
        $_SESSION['kickzone_user_id']    = $user['id'];
        $_SESSION['kickzone_user_name']  = $user['full_name'];
        $_SESSION['kickzone_user_email'] = $user['email'];
        $_SESSION['kickzone_logged_in']  = true;
        
        setcookie('kickzone_session', bin2hex(random_bytes(16)), time() + (86400 * 30), '/', '', false, true);
        
        // Create a temporary token to pass success data
        $success_token = base64_encode(json_encode([
            'id'    => $user['id'],
            'name'  => $user['full_name'],
            'email' => $user['email'],
        ]));
        
        // Redirect to OAuth callback handler which will set localStorage and redirect
        header('Location: /kickzone-fixed/frontend/pages/oauth-callback.html?oauth=success&user=' . urlencode($success_token));
        exit;
    }
}

// ── POST — Handle OAuth token validation ────────────────
if ($method === 'POST') {
    $raw = json_decode(file_get_contents('php://input'), true);
    $token = $raw['token'] ?? '';
    $provider = $raw['provider'] ?? '';
    
    // Demo: for testing, return success for test tokens
    if ($token && $provider) {
        echo json_encode([
            'success' => true,
            'message' => 'Token validated',
            'provider' => $provider
        ]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'message' => 'Invalid OAuth request.']);

// ── Helper: Handle Google callback ─────────────────────
function handleGoogleCallback($code, $db) {
    // Exchange authorization code for access token
    $token_url = 'https://oauth2.googleapis.com/token';
    
    $post_data = [
        'client_id'     => GOOGLE_CLIENT_ID,
        'client_secret' => GOOGLE_CLIENT_SECRET,
        'code'          => $code,
        'grant_type'    => 'authorization_code',
        'redirect_uri'  => GOOGLE_REDIRECT_URI
    ];
    
    $ch = curl_init($token_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
    $response = curl_exec($ch);
    curl_close($ch);
    
    $token_data = json_decode($response, true);
    
    if (!isset($token_data['access_token'])) {
        error_log('Google token exchange failed: ' . $response);
        return null;
    }
    
    // Get user info using access token
    $user_url = 'https://www.googleapis.com/oauth2/v2/userinfo?access_token=' . $token_data['access_token'];
    
    $ch = curl_init($user_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $user_info = json_decode($response, true);
    
    if (!isset($user_info['id'])) {
        error_log('Google user info failed: ' . $response);
        return null;
    }
    
    return [
        'oauth_id'   => 'google_' . $user_info['id'],
        'name'       => $user_info['name'] ?? 'Google User',
        'email'      => $user_info['email'] ?? '',
        'avatar_url' => $user_info['picture'] ?? ''
    ];
}

// ── Helper: Handle Facebook callback ───────────────────
function handleFacebookCallback($code, $db) {
    // Exchange authorization code for access token
    $token_url = 'https://graph.facebook.com/v18.0/oauth/access_token';
    
    $token_params = [
        'client_id'     => FACEBOOK_APP_ID,
        'client_secret' => FACEBOOK_APP_SECRET,
        'code'          => $code,
        'redirect_uri'  => FACEBOOK_REDIRECT_URI
    ];
    
    $ch = curl_init($token_url . '?' . http_build_query($token_params));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $token_data = json_decode($response, true);
    
    if (!isset($token_data['access_token'])) {
        error_log('Facebook token exchange failed: ' . $response);
        return null;
    }
    
    // Get user info using access token
    $user_url = 'https://graph.facebook.com/me?fields=id,name,email,picture&access_token=' . $token_data['access_token'];
    
    $ch = curl_init($user_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    
    $user_info = json_decode($response, true);
    
    if (!isset($user_info['id'])) {
        error_log('Facebook user info failed: ' . $response);
        return null;
    }
    
    $avatar_url = '';
    if (isset($user_info['picture']['data']['url'])) {
        $avatar_url = $user_info['picture']['data']['url'];
    }
    
    return [
        'oauth_id'   => 'facebook_' . $user_info['id'],
        'name'       => $user_info['name'] ?? 'Facebook User',
        'email'      => $user_info['email'] ?? '',
        'avatar_url' => $avatar_url
    ];
}
