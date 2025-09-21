<?php
/**
 * Development Server for WordPress Custom Auth Pages
 * Run this with: php -S localhost:8000 dev-server.php
 */

// Handle static files (CSS, JS, images)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static assets directly
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/', $uri)) {
    $file_path = __DIR__ . $uri;
    if (file_exists($file_path)) {
        $mime_types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml'
        ];
        
        $extension = pathinfo($file_path, PATHINFO_EXTENSION);
        $mime_type = $mime_types[$extension] ?? 'application/octet-stream';
        
        header('Content-Type: ' . $mime_type);
        header('Content-Length: ' . filesize($file_path));
        readfile($file_path);
        exit;
    } else {
        http_response_code(404);
        echo 'File not found: ' . $uri;
        exit;
    }
}

// Set up basic WordPress-like environment for development
define('ABSPATH', __DIR__ . '/');
define('WP_DEBUG', true);

// Mock WordPress functions for development
function get_bloginfo($show = '') {
    switch ($show) {
        case 'name':
            return 'موقعي الإلكتروني';
        case 'charset':
            return 'UTF-8';
        default:
            return '';
    }
}

function bloginfo($show = '') {
    echo get_bloginfo($show);
}

function home_url($path = '') {
    return 'http://localhost:8000' . $path;
}

function get_stylesheet_directory_uri() {
    return 'http://localhost:8000';
}

function wp_login_url($redirect = '') {
    return home_url('/login/');
}

function wp_registration_url() {
    return home_url('/register/');
}

function wp_lostpassword_url($redirect = '') {
    return home_url('/lost-password/');
}

function wp_logout_url($redirect = '') {
    return home_url('/logout/');
}

function wp_nonce_field($action, $name, $referer = true, $echo = true) {
    $nonce = wp_create_nonce($action);
    $field = '<input type="hidden" id="' . $name . '" name="' . $name . '" value="' . $nonce . '" />';
    if ($echo) {
        echo $field;
    }
    return $field;
}

function wp_create_nonce($action) {
    return 'dev-nonce-' . $action;
}

function esc_url($url) {
    return htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
}

function esc_attr($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

function esc_html($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

function esc_textarea($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

function body_class($class = '') {
    echo 'class="' . $class . '"';
}

function wp_head() {
    echo '<meta name="generator" content="WordPress Development Server" />';
    
    // Load page-specific CSS
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $cache_buster = '?v=' . time();
    if (strpos($path, '/register') !== false || $path === '/' || $path === '') {
        echo '<link rel="stylesheet" href="assets/css/custom-register.css' . $cache_buster . '">';
    } else {
        echo '<link rel="stylesheet" href="assets/css/custom-login.css' . $cache_buster . '">';
    }
}

function wp_footer() {
    // Load page-specific JavaScript
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $cache_buster = '?v=' . time();
    if (strpos($path, '/register') !== false || $path === '/' || $path === '') {
        echo '<script src="assets/js/custom-register.js' . $cache_buster . '"></script>';
    } else {
        echo '<script src="assets/js/custom-login.js' . $cache_buster . '"></script>';
    }
    echo '<!-- WordPress Development Server -->';
}

// User functions
function wp_get_current_user() {
    return (object) [
        'ID' => 0,
        'user_login' => '',
        'user_email' => '',
        'display_name' => '',
        'user_firstname' => '',
        'user_lastname' => ''
    ];
}

function is_user_logged_in() {
    return false;
}

function wp_redirect($location) {
    header('Location: ' . $location);
    exit;
}

// Template functions
function get_the_title($post = 0) {
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($path, '/register') !== false || $path === '/' || $path === '') {
        return 'انضم إلينا';
    }
    return 'تسجيل الدخول';
}

function language_attributes($doctype = 'html') {
    return 'lang="ar" dir="rtl"';
}

// AJAX functions
function wp_ajax_nopriv_() {
    return true;
}

function wp_ajax_() {
    return true;
}

// Handle routing
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Remove query string
$path = strtok($path, '?');

// Handle static assets (CSS, JS, images)
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico)$/', $path)) {
    $file_path = __DIR__ . $path;
    if (file_exists($file_path)) {
        // Set appropriate content type
        if (preg_match('/\.css$/', $path)) {
            header('Content-Type: text/css');
        } elseif (preg_match('/\.js$/', $path)) {
            header('Content-Type: application/javascript');
        } elseif (preg_match('/\.(png|jpg|jpeg|gif|svg|ico)$/', $path)) {
            $mime_type = mime_content_type($file_path);
            header('Content-Type: ' . $mime_type);
        }
        
        // Serve the file
        readfile($file_path);
        exit;
    } else {
        // File not found
        http_response_code(404);
        echo 'File not found: ' . $path;
        exit;
    }
}

// Route to appropriate template
switch ($path) {
    case '/login/':
    case '/login':
        include 'page-templates/login.php';
        break;
        
    case '/register/':
    case '/register':
        include 'page-templates/register.php';
        break;
        
    case '/':
    case '':
        // Default to register page
        include 'page-templates/register.php';
        break;
        
    default:
        // 404 - redirect to register
        header('Location: /register/');
        exit;
}
?>
