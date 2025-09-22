<?php
/**
 * Simplified Functions.php - Focus on WooCommerce Integration
 * Removed unnecessary external API integrations
 */

// =============================================================================
// CUSTOM PAGE TEMPLATES
// =============================================================================

// Add custom page templates
function add_custom_page_templates($templates) {
    $templates['page-templates/login.php'] = 'Custom Login';
    $templates['page-templates/register.php'] = 'Custom Register';
    $templates['page-templates/enhanced-account.php'] = 'Enhanced Account (Client Portal + WooCommerce)';
    return $templates;
}
add_filter('theme_page_templates', 'add_custom_page_templates');

// Load custom page templates
function load_custom_page_template($template) {
    global $post;
    
    if ($post) {
        $page_template = get_post_meta($post->ID, '_wp_page_template', true);
        
        if ($page_template && $page_template !== 'default') {
            $template_path = get_stylesheet_directory() . '/' . $page_template;
            if (file_exists($template_path)) {
                return $template_path;
            }
        }
    }
    
    return $template;
}
add_filter('page_template', 'load_custom_page_template');

// =============================================================================
// ASSET ENQUEUING
// =============================================================================

// Enqueue custom styles and scripts
function enqueue_custom_auth_assets() {
    $current_page = get_post_field('post_name', get_the_ID());
    
    // Login page assets
    if (is_page('login') || $current_page === 'login') {
        wp_enqueue_style('custom-login-css', get_stylesheet_directory_uri() . '/assets/css/custom-login.css', array(), '1.0.0');
        wp_enqueue_script('unified-auth-js', get_stylesheet_directory_uri() . '/assets/js/unified-auth.js', array('jquery'), '1.0.0', true);
        wp_enqueue_script('custom-login-js', get_stylesheet_directory_uri() . '/assets/js/custom-login.js', array('jquery', 'unified-auth-js'), '1.0.0', true);
    }
    
    // Register page assets
    if (is_page('register') || $current_page === 'register') {
        wp_enqueue_style('custom-register-css', get_stylesheet_directory_uri() . '/assets/css/custom-register.css', array(), '1.0.0');
        wp_enqueue_script('unified-auth-js', get_stylesheet_directory_uri() . '/assets/js/unified-auth.js', array('jquery'), '1.0.0', true);
        wp_enqueue_script('custom-register-js', get_stylesheet_directory_uri() . '/assets/js/custom-register.js', array('jquery', 'unified-auth-js'), '1.0.0', true);
    }
    
    // Enhanced account page assets
    if (is_page('enhanced-account') || $current_page === 'enhanced-account') {
        wp_enqueue_style('enhanced-account-css', get_stylesheet_directory_uri() . '/assets/css/enhanced-account.css', array(), '1.0.0');
        wp_enqueue_style('custom-client-css', get_stylesheet_directory_uri() . '/assets/css/custom-client.css', array(), '1.0.0');
        wp_enqueue_style('styles-css', get_stylesheet_directory_uri() . '/assets/css/styles.css', array(), '1.0.0');
        wp_enqueue_script('enhanced-account-js', get_stylesheet_directory_uri() . '/assets/js/enhanced-account.js', array('jquery'), '1.0.0', true);
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_auth_assets');

// =============================================================================
// UNIFIED NAVIGATION SYSTEM
// =============================================================================

function add_unified_navigation_meta() {
    echo '<!-- Unified Navigation System -->' . "\n";
    echo '<meta name="unified-system" content="login-register-account">' . "\n";
    echo '<meta name="system-pages" content="' . home_url('/login/') . ',' . home_url('/register/') . ',' . home_url('/enhanced-account/') . '">' . "\n";
}

// Add navigation links to all pages
function add_unified_navigation_links() {
    $current_page = get_post_field('post_name', get_the_ID());
    
    if (in_array($current_page, ['login', 'register', 'enhanced-account'])) {
        echo '<div class="unified-nav-links" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">';
        echo '<div class="btn-group" role="group">';
        
        if ($current_page !== 'login') {
            echo '<a href="' . home_url('/login/') . '" class="btn btn-sm btn-outline-primary">';
            echo '<i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول';
            echo '</a>';
        }
        
        if ($current_page !== 'register') {
            echo '<a href="' . home_url('/register/') . '" class="btn btn-sm btn-outline-success">';
            echo '<i class="fas fa-user-plus me-1"></i> إنشاء حساب';
            echo '</a>';
        }
        
        if (is_user_logged_in() && $current_page !== 'enhanced-account') {
            echo '<a href="' . home_url('/enhanced-account/') . '" class="btn btn-sm btn-outline-info">';
            echo '<i class="fas fa-user-circle me-1"></i> حسابي';
            echo '</a>';
        }
        
        echo '</div>';
        echo '</div>';
    }
}
add_action('wp_footer', 'add_unified_navigation_links');

// =============================================================================
// UNIFIED AUTHENTICATION SYSTEM (COMPLEX)
// =============================================================================

// Custom login form handler with unified authentication
function handle_custom_login() {
    // Debug: Log all POST data to see what's being submitted
    if (!empty($_POST)) {
        error_log("Login handler - POST data: " . print_r($_POST, true));
    }
    
    if (isset($_POST['wp-submit']) && $_POST['wp-submit'] == 'تسجيل الدخول') {
        // Verify nonce
        if (!wp_verify_nonce($_POST['login_nonce_field'], 'login_nonce')) {
            error_log("Login failed: Invalid nonce");
            wp_redirect(add_query_arg('login', 'invalid_nonce', home_url('/login/')));
            exit;
        }
        
        $username = sanitize_text_field($_POST['user_login']);
        $password = $_POST['user_pass'];
        $remember = isset($_POST['rememberme']);
        
        // Log login attempt
        error_log("Login attempt for username: " . $username);
        
        if (empty($username) || empty($password)) {
            error_log("Login failed: Empty username or password");
            wp_redirect(add_query_arg('login', 'empty', home_url('/login/')));
            exit;
        }
        
        // Try unified authentication
        error_log("About to call perform_unified_login...");
        $result = perform_unified_login($username, $password);
        error_log("perform_unified_login returned: " . print_r($result, true));
        
        if ($result['success']) {
            error_log("Login successful for user: " . $username . " (source: " . $result['source'] . ")");
            
            // Authenticate with Laapak API and get the remote token
            $remote_auth_result = authenticate_with_laapak_api($username, $password);
            if ($remote_auth_result['success']) {
                error_log("Laapak API authentication successful, storing remote token");
                // Store the remote token in user meta for use in enhanced-account
                update_user_meta($result['user_id'], 'laapak_client_token', $remote_auth_result['token']);
                update_user_meta($result['user_id'], 'laapak_client_info', $remote_auth_result['client']);
                error_log("Remote token stored: " . substr($remote_auth_result['token'], 0, 50) . "...");
            } else {
                error_log("Laapak API authentication failed: " . $remote_auth_result['message']);
                // Continue with WordPress login even if Laapak auth fails
            }
            
            // Set current user and auth cookie
            wp_set_current_user($result['user_id']);
            wp_set_auth_cookie($result['user_id'], $remember);
            
            // Redirect to account page
            error_log("Redirecting to enhanced account page...");
            wp_redirect(home_url('/enhanced-account/'));
            exit;
        } else {
            error_log("Login failed for user: " . $username . " - " . $result['message']);
            error_log("Redirecting to login page with error...");
            wp_redirect(add_query_arg('login', 'failed', home_url('/login/')));
            exit;
        }
    }
}
add_action('init', 'handle_custom_login', 1); // Run early to catch before WordPress auth

// Prevent WordPress from automatically handling login redirects for our custom form
add_action('wp_login_failed', function($username) {
    // If this is our custom login form, don't let WordPress handle the redirect
    if (isset($_POST['wp-submit']) && $_POST['wp-submit'] == 'تسجيل الدخول') {
        error_log("WordPress login failed, but this is our custom form - letting our handler continue");
        // Remove any automatic redirects
        remove_action('wp_login_failed', 'wp_login_failed_handler');
    }
});

// Custom registration form handler with unified authentication
function handle_custom_registration() {
    if (isset($_POST['wp-submit']) && $_POST['wp-submit'] == 'إنشاء الحساب') {
        $username = sanitize_text_field($_POST['user_login']);
        $email = sanitize_email($_POST['user_email']);
        $password = $_POST['user_pass'];
        $first_name = sanitize_text_field($_POST['first_name']);
        $last_name = sanitize_text_field($_POST['last_name']);
        
        if (empty($username) || empty($email) || empty($password)) {
            wp_redirect(add_query_arg('register', 'empty', home_url('/register/')));
            exit;
        }
        
        // Try unified registration
        $result = perform_unified_registration($username, $email, $password, $first_name, $last_name);
        
        if ($result['success']) {
            // Set current user and auth cookie
            wp_set_current_user($result['user_id']);
            wp_set_auth_cookie($result['user_id'], true);
            
            // Redirect to account page
            wp_redirect(home_url('/enhanced-account/'));
            exit;
        } else {
            wp_redirect(add_query_arg('register', 'failed', home_url('/register/')));
            exit;
        }
    }
}
add_action('init', 'handle_custom_registration');

// Unified login function
function perform_unified_login($username, $password) {
    error_log("=== PERFORMING UNIFIED LOGIN ===");
    error_log("Username: " . $username);
    
    // Step 1: Try direct WordPress authentication manually
    error_log("Step 1: Trying WordPress authentication...");
    
    // Try to find user by username or email
    $user = null;
    if (is_email($username)) {
        $user = get_user_by('email', $username);
    } else {
        $user = get_user_by('login', $username);
    }
    
    if ($user) {
        // Verify password
        if (wp_check_password($password, $user->user_pass, $user->ID)) {
            error_log("Step 1 SUCCESS: WordPress user found - ID: " . $user->ID);
            return array(
                'success' => true,
                'user_id' => $user->ID,
                'source' => 'wordpress'
            );
        } else {
            error_log("Step 1 FAILED: WordPress password incorrect");
        }
    } else {
        error_log("Step 1 FAILED: WordPress user not found");
    }
    
    // Step 2: Check external API if direct login failed
    error_log("Step 2: Checking external API...");
    $phone = $username; // Assume username is phone number
    
    // Only check API if username looks like a phone number
    if (preg_match('/^[\d\s\-\+\(\)]+$/', $phone)) {
        error_log("Phone number format valid, checking API...");
        $api_result = check_laapak_user_api($phone);
        
        if ($api_result['found']) {
            error_log("Step 2 SUCCESS: User found in external API");
            // User found in external API, create local user
            $user_data = $api_result['client'];
            $user_id = create_user_from_laapak_data($user_data, $password);
            
            if ($user_id) {
                error_log("User created successfully from external data - ID: " . $user_id);
                return array(
                    'success' => true,
                    'user_id' => $user_id,
                    'source' => 'external_to_local'
                );
            } else {
                error_log("Failed to create user from external data");
            }
        } else {
            error_log("Step 2 FAILED: User not found in external API");
        }
    } else {
        error_log("Username doesn't match phone number format, skipping API check");
    }
    
    error_log("=== UNIFIED LOGIN FAILED ===");
    return array(
        'success' => false,
        'message' => 'User not found in any system'
    );
}

// Unified registration function
function perform_unified_registration($username, $email, $password, $first_name, $last_name) {
    // Check if user already exists
    if (username_exists($username) || email_exists($email)) {
        return array(
            'success' => false,
            'message' => 'User already exists'
        );
    }
    
    // Create WordPress user
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        return array(
            'success' => false,
            'message' => 'Failed to create user'
        );
    }
    
    // Update user meta
    wp_update_user(array(
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name
    ));
    
    // TODO: Also register in external API if needed
    
    return array(
        'success' => true,
        'user_id' => $user_id,
        'source' => 'new_user'
    );
}

// =============================================================================
// EXTERNAL API INTEGRATIONS (LAAPAK API)
// =============================================================================

// Authenticate with Laapak API and get client token
function authenticate_with_laapak_api($phone, $password) {
    $api_url = 'https://reports.laapak.com/api/auth/client/login';
    
    // Log API attempt for debugging
    error_log("Laapak API: Attempting to authenticate client with phone: " . $phone);
    
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode(array(
            'phone' => $phone,
            'password' => $password
        )),
        'timeout' => 30
    ));
    
    if (is_wp_error($response)) {
        error_log("Laapak API: Authentication error - " . $response->get_error_message());
        return array('success' => false, 'error' => $response->get_error_message());
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    error_log("Laapak API: Authentication response code: " . $status_code);
    error_log("Laapak API: Authentication response body: " . $body);
    
    if ($status_code === 200) {
        $data = json_decode($body, true);
        if (isset($data['token']) && isset($data['client'])) {
            error_log("Laapak API: Client authentication successful");
            
            // Enhanced token debugging
            $token = $data['token'];
            error_log("Laapak API: Token length: " . strlen($token));
            error_log("Laapak API: Token preview: " . substr($token, 0, 50) . "...");
            
            // Check JWT format
            $token_parts = explode('.', $token);
            error_log("Laapak API: Token parts count: " . count($token_parts));
            
            if (count($token_parts) !== 3) {
                error_log("Laapak API: WARNING - Token is not a valid JWT format (expected 3 parts, got " . count($token_parts) . ")");
            } else {
                error_log("Laapak API: Token appears to be valid JWT format");
                
                // Try to decode payload for additional info
                try {
                    $payload = json_decode(base64_decode($token_parts[1]), true);
                    if ($payload && isset($payload['exp'])) {
                        $expiry = date('Y-m-d H:i:s', $payload['exp']);
                        error_log("Laapak API: Token expires at: " . $expiry);
                    }
                } catch (Exception $e) {
                    error_log("Laapak API: Could not decode token payload: " . $e->getMessage());
                }
            }
            
            return array(
                'success' => true,
                'token' => $token,
                'client' => $data['client']
            );
        } else {
            error_log("Laapak API: Authentication response missing token or client data");
            return array('success' => false, 'error' => 'Invalid authentication response');
        }
    } else {
        error_log("Laapak API: Authentication HTTP error - " . $status_code);
        return array('success' => false, 'error' => 'Authentication failed with status: ' . $status_code);
    }
}

// Check Laapak user via API
function check_laapak_user_api($phone) {
    $api_url = 'https://reports.laapak.com/api/external/clients/lookup?phone=' . urlencode($phone);
    $api_key = 'laapak-api-key-2024';
    
    // Log API attempt for debugging
    error_log("Laapak API: Attempting to check user with phone: " . $phone);
    
    $response = wp_remote_get($api_url, array(
        'headers' => array(
            'x-api-key' => $api_key,
            'Content-Type' => 'application/json'
        ),
        'timeout' => 30
    ));
    
    if (is_wp_error($response)) {
        error_log("Laapak API: Error - " . $response->get_error_message());
        return array('found' => false, 'error' => $response->get_error_message());
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    error_log("Laapak API: Response code: " . $status_code);
    error_log("Laapak API: Response body: " . $body);
    
    if ($status_code === 200) {
        $data = json_decode($body, true);
        if (isset($data['client'])) {
            error_log("Laapak API: User found in external system");
            return array(
                'found' => true,
                'client' => $data['client']
            );
        } else {
            error_log("Laapak API: User not found in external system");
        }
    } else {
        error_log("Laapak API: HTTP error - " . $status_code);
    }
    
    return array('found' => false);
}

// Register user in Laapak API
function register_user_in_laapak_api($user_id, $first_name, $last_name, $email, $phone) {
    $api_url = 'https://reports.laapak.com/api/external/clients/register';
    $api_key = 'laapak-api-key-2024';
    
    // Prepare user data for API
    $user_data = array(
        'name' => $first_name . ' ' . $last_name,
        'email' => $email,
        'phone' => $phone,
        'source' => 'wordpress_registration',
        'user_id' => $user_id
    );
    
    // Log API attempt for debugging
    error_log("Laapak API: Attempting to register user with email: " . $email);
    
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'x-api-key' => $api_key,
            'Content-Type' => 'application/json'
        ),
        'body' => json_encode($user_data),
        'timeout' => 30
    ));
    
    if (is_wp_error($response)) {
        error_log("Laapak API: Error - " . $response->get_error_message());
        return array('success' => false, 'error' => $response->get_error_message());
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    error_log("Laapak API: Response code: " . $status_code);
    error_log("Laapak API: Response body: " . $body);
    
    if ($status_code === 200 || $status_code === 201) {
        $data = json_decode($body, true);
        error_log("Laapak API: User registered successfully in external system");
        return array(
            'success' => true,
            'client_id' => $data['client_id'] ?? null,
            'data' => $data
        );
    } else {
        error_log("Laapak API: HTTP error - " . $status_code);
        return array('success' => false, 'error' => 'API registration failed with status: ' . $status_code);
    }
}

// Create user from Laapak data
function create_user_from_laapak_data($laapak_user, $password) {
    $username = $laapak_user['phone'];
    $email = !empty($laapak_user['email']) ? $laapak_user['email'] : $laapak_user['phone'] . '@laapak.com';
    
    // Check if user already exists
    if (username_exists($username) || email_exists($email)) {
        return false;
    }
    
    // Create WordPress user
    $user_id = wp_create_user($username, $password, $email);
    
    if (is_wp_error($user_id)) {
        return false;
    }
    
    // Update user meta
    wp_update_user(array(
        'ID' => $user_id,
        'first_name' => $laapak_user['name'] ?? '',
        'last_name' => ''
    ));
    
    // Add custom meta
    update_user_meta($user_id, 'phone', $laapak_user['phone']);
    update_user_meta($user_id, 'laapak_user_id', $laapak_user['id']);
    
    return $user_id;
}

// =============================================================================
// CORS AND API TOKEN HANDLING
// =============================================================================

// Add CORS headers for API requests
function add_cors_headers() {
    // Only add CORS headers for API requests
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        $allowed_origins = array(
            'https://reports.laapak.com',
            'https://slategrey-cod-346409.hostingersite.com',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001'
        );
        
        $origin = $_SERVER['HTTP_ORIGIN'];
        if (in_array($origin, $allowed_origins)) {
            header("Access-Control-Allow-Origin: $origin");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, x-auth-token, x-api-key');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
add_action('init', 'add_cors_headers');

// Generate client token for logged-in users
function generate_client_token($user_id) {
    // Create a unique token based on user ID and current time
    $token_data = array(
        'user_id' => $user_id,
        'timestamp' => time(),
        'domain' => $_SERVER['HTTP_HOST'] ?? 'localhost'
    );
    
    $token_string = base64_encode(json_encode($token_data));
    $signature = hash_hmac('sha256', $token_string, wp_salt('auth'));
    
    return $token_string . '.' . $signature;
}

// Verify client token
function verify_client_token($token) {
    if (empty($token)) {
        return false;
    }
    
    $parts = explode('.', $token);
    if (count($parts) !== 2) {
        return false;
    }
    
    list($token_string, $signature) = $parts;
    
    // Verify signature
    $expected_signature = hash_hmac('sha256', $token_string, wp_salt('auth'));
    if (!hash_equals($expected_signature, $signature)) {
        return false;
    }
    
    // Decode token data
    $token_data = json_decode(base64_decode($token_string), true);
    if (!$token_data || !isset($token_data['user_id'])) {
        return false;
    }
    
    // Check if token is not too old (24 hours)
    if (time() - $token_data['timestamp'] > 86400) {
        return false;
    }
    
    return $token_data;
}

// Add client token to page meta for enhanced account page
function add_client_token_meta() {
    $current_page = get_post_field('post_name', get_the_ID());
    
    if (is_page('enhanced-account') || $current_page === 'enhanced-account') {
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $client_token = generate_client_token($user_id);
            
            echo '<meta name="client-token" content="' . esc_attr($client_token) . '">' . "\n";
            echo '<script>localStorage.setItem("clientToken", "' . esc_js($client_token) . '");</script>' . "\n";
        }
    }
}
add_action('wp_head', 'add_client_token_meta', 5);

// =============================================================================
// WOOCOMMERCE REST API CONFIGURATION
// =============================================================================

// WooCommerce REST API Permissions - Fixed to return only user's orders
add_filter('woocommerce_rest_check_permissions', function($permission, $context, $object_id, $post_type) {
    if (is_user_logged_in()) {
        return true;
    }
    return $permission;
}, 10, 4);

// Force WooCommerce to only return orders for the current user
add_filter('woocommerce_rest_orders_prepare_object_query', function($query_args, $request) {
    if (is_user_logged_in()) {
        $query_args['customer'] = get_current_user_id();
        // Also add meta query to ensure we only get orders for this user
        $query_args['meta_query'] = array(
            array(
                'key' => '_customer_user',
                'value' => get_current_user_id(),
                'compare' => '='
            )
        );
    }
    return $query_args;
}, 10, 2);

// Additional filter to ensure orders are filtered by customer
add_filter('woocommerce_rest_orders_query', function($args, $request) {
    if (is_user_logged_in()) {
        $args['customer'] = get_current_user_id();
        $args['meta_query'] = array(
            array(
                'key' => '_customer_user',
                'value' => get_current_user_id(),
                'compare' => '='
            )
        );
    }
    return $args;
}, 10, 2);

// Override WooCommerce REST API permissions for orders
add_filter('woocommerce_rest_orders_get_items_permissions_check', function($permission, $request) {
    if (is_user_logged_in()) {
        return true;
    }
    return $permission;
}, 10, 2);

// Allow WooCommerce REST API access for authenticated users
add_action('rest_api_init', function() {
    if (is_user_logged_in()) {
        add_filter('woocommerce_rest_check_permissions', '__return_true', 10, 4);
    }
});

// Force WooCommerce REST API to only return current user's orders
add_action('rest_api_init', function() {
    // Override the WooCommerce orders endpoint to filter by current user
    add_filter('woocommerce_rest_orders_prepare_object_query', function($query_args, $request) {
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $query_args['customer'] = $user_id;
            $query_args['meta_query'] = array(
                array(
                    'key' => '_customer_user',
                    'value' => $user_id,
                    'compare' => '='
                )
            );
            
            // Log the query for debugging
            error_log("WooCommerce Orders Query - User ID: " . $user_id);
            error_log("WooCommerce Orders Query Args: " . print_r($query_args, true));
        }
        return $query_args;
    }, 10, 2);
    
    // Additional filter to ensure orders are properly filtered
    add_filter('woocommerce_rest_orders_query', function($args, $request) {
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $args['customer'] = $user_id;
            $args['meta_query'] = array(
                array(
                    'key' => '_customer_user',
                    'value' => $user_id,
                    'compare' => '='
                )
            );
            
            error_log("WooCommerce REST Orders Query - User ID: " . $user_id);
            error_log("WooCommerce REST Orders Args: " . print_r($args, true));
        }
        return $args;
    }, 10, 2);
});

// =============================================================================
// CUSTOM REST API ENDPOINTS
// =============================================================================

add_action('rest_api_init', function() {
    // Test endpoint
    register_rest_route('laapak/v1', '/test', array(
        'methods' => 'GET',
        'callback' => function($request) {
            return array('success' => true, 'message' => 'Proxy endpoints are working!', 'timestamp' => time());
        },
        'permission_callback' => '__return_true'
    ));
    
    // Custom WooCommerce Orders endpoint (fallback)
    register_rest_route('laapak/v1', '/orders', array(
        'methods' => 'GET',
        'callback' => function($request) {
            if (!is_user_logged_in()) {
                return new WP_Error('unauthorized', 'User not logged in', array('status' => 401));
            }
            
            $user_id = get_current_user_id();
            $per_page = $request->get_param('per_page') ?: 10;
            $orderby = $request->get_param('orderby') ?: 'date';
            $order = $request->get_param('order') ?: 'DESC';
            
            // Get orders for current user
            $orders = wc_get_orders(array(
                'customer' => $user_id,
                'limit' => $per_page,
                'orderby' => $orderby,
                'order' => $order,
                'status' => 'any'
            ));
            
            $formatted_orders = array();
            foreach ($orders as $order) {
                $formatted_orders[] = array(
                    'id' => $order->get_id(),
                    'number' => $order->get_order_number(),
                    'status' => $order->get_status(),
                    'total' => $order->get_formatted_order_total(),
                    'currency' => $order->get_currency(),
                    'date_created' => $order->get_date_created()->format('c'),
                    'billing' => array(
                        'first_name' => $order->get_billing_first_name(),
                        'last_name' => $order->get_billing_last_name(),
                        'address_1' => $order->get_billing_address_1(),
                        'address_2' => $order->get_billing_address_2(),
                        'city' => $order->get_billing_city(),
                        'state' => $order->get_billing_state(),
                        'postcode' => $order->get_billing_postcode(),
                        'country' => $order->get_billing_country()
                    ),
                    'links' => array(
                        array('href' => $order->get_view_order_url())
                    )
                );
            }
            
            return $formatted_orders;
        },
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
    
    // Client reports endpoint - Proxy to external API
    register_rest_route('laapak/v1', '/client/reports', array(
        'methods' => 'GET',
        'callback' => function($request) {
            // Get auth token from request headers (optional for now)
            $auth_token = $request->get_header('x-auth-token');
            
            // Make request to external API
            $response = wp_remote_get('https://reports.laapak.com/api/external/clients/104/reports', array(
                'headers' => array(
                    'x-api-key' => 'laapak-api-key-2024',
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', 'Failed to fetch data from external API', array('status' => 500));
            }
            
            $body = wp_remote_retrieve_body($response);
            return json_decode($body, true);
        },
        'permission_callback' => '__return_true' // We handle auth in the callback
    ));
    
    // Client invoices endpoint - Proxy to external API
    register_rest_route('laapak/v1', '/client/invoices', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $auth_token = $request->get_header('x-auth-token');
            
            $response = wp_remote_get('https://reports.laapak.com/api/external/clients/104/invoices', array(
                'headers' => array(
                    'x-api-key' => 'laapak-api-key-2024',
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', 'Failed to fetch data from external API', array('status' => 500));
            }
            
            $body = wp_remote_retrieve_body($response);
            return json_decode($body, true);
        },
        'permission_callback' => '__return_true'
    ));
    
    // Client warranty endpoint - Proxy to external API
    register_rest_route('laapak/v1', '/client/warranty', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $auth_token = $request->get_header('x-auth-token');
            
            $response = wp_remote_get('https://reports.laapak.com/api/external/clients/104/warranty', array(
                'headers' => array(
                    'x-api-key' => 'laapak-api-key-2024',
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', 'Failed to fetch data from external API', array('status' => 500));
            }
            
            $body = wp_remote_retrieve_body($response);
            return json_decode($body, true);
        },
        'permission_callback' => '__return_true'
    ));
    
    // Client maintenance endpoint - Proxy to external API
    register_rest_route('laapak/v1', '/client/maintenance', array(
        'methods' => 'GET',
        'callback' => function($request) {
            $auth_token = $request->get_header('x-auth-token');
            
            $response = wp_remote_get('https://reports.laapak.com/api/external/clients/104/maintenance', array(
                'headers' => array(
                    'x-api-key' => 'laapak-api-key-2024',
                    'Content-Type' => 'application/json'
                ),
                'timeout' => 30
            ));
            
            if (is_wp_error($response)) {
                return new WP_Error('api_error', 'Failed to fetch data from external API', array('status' => 500));
            }
            
            $body = wp_remote_retrieve_body($response);
            return json_decode($body, true);
        },
        'permission_callback' => '__return_true'
    ));
});