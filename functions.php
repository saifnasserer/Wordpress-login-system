

// =============================================================================
// CUSTOM PAGE TEMPLATES
// =============================================================================

// Add custom page templates
function add_custom_page_templates($templates) {
    $templates['page-templates/login.php'] = 'Custom Login';
    $templates['page-templates/register.php'] = 'Custom Register';
    $templates['page-templates/account.php'] = 'Custom Account';
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
// DIRECT CSS INJECTION (FALLBACK)
// =============================================================================

// Inject CSS directly into <head> for custom pages
function inject_custom_auth_css() {
    // Get current page slug
    $current_page = get_post_field('post_name', get_the_ID());
    
    // Login page CSS
    if (is_page('login') || $current_page === 'login') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/custom-login.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
    
    // Register page CSS
    if (is_page('register') || $current_page === 'register') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/custom-register.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
    
    // Account page CSS
    if (is_page('account') || $current_page === 'account') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/custom-account.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
    
    // Enhanced account page CSS
    if (is_page('enhanced-account') || $current_page === 'enhanced-account') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/enhanced-account.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
}
add_action('wp_head', 'inject_custom_auth_css', 1);

// =============================================================================
// ASSET ENQUEUING (PRIMARY METHOD)
// =============================================================================

// Enqueue custom styles and scripts
function enqueue_custom_auth_assets() {
    // Get current page slug
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
    
    // Account page assets
    if (is_page('account') || $current_page === 'account') {
        wp_enqueue_style('custom-account-css', get_stylesheet_directory_uri() . '/assets/css/custom-account.css', array(), '1.0.0');
        wp_enqueue_script('custom-account-js', get_stylesheet_directory_uri() . '/assets/js/custom-account.js', array('jquery'), '1.0.0', true);
    }
    
    // Enhanced account page assets
    if (is_page('enhanced-account') || $current_page === 'enhanced-account') {
        wp_enqueue_style('enhanced-account-css', get_stylesheet_directory_uri() . '/assets/css/enhanced-account.css', array(), '1.0.0');
        wp_enqueue_style('custom-client-css', get_stylesheet_directory_uri() . '/client-portal/css/custom-client.css', array(), '1.0.0');
        wp_enqueue_script('enhanced-account-js', get_stylesheet_directory_uri() . '/assets/js/enhanced-account.js', array('jquery'), '1.0.0', true);
        wp_enqueue_script('api-service-js', get_stylesheet_directory_uri() . '/client-portal/js/api-service.js', array('jquery'), '1.0.0', true);
    }
    
    // Add unified navigation to all pages
    add_action('wp_head', 'add_unified_navigation_meta');
}
add_action('wp_enqueue_scripts', 'enqueue_custom_auth_assets');

// =============================================================================
// UNIFIED NAVIGATION SYSTEM
// =============================================================================

function add_unified_navigation_meta() {
    // Add navigation meta for unified system
    echo '<!-- Unified Navigation System -->' . "\n";
    echo '<meta name="unified-system" content="login-register-account">' . "\n";
    echo '<meta name="system-pages" content="' . home_url('/login/') . ',' . home_url('/register/') . ',' . home_url('/enhanced-account/') . '">' . "\n";
}

// Add navigation links to all pages
function add_unified_navigation_links() {
    $current_page = get_post_field('post_name', get_the_ID());
    
    // Only add to our custom pages
    if (in_array($current_page, ['login', 'register', 'enhanced-account'])) {
        echo '<div class="unified-nav-links" style="position: fixed; top: 10px; right: 10px; z-index: 1000;">';
        echo '<div class="btn-group" role="group">';
        
        // Login link
        if ($current_page !== 'login') {
            echo '<a href="' . home_url('/login/') . '" class="btn btn-sm btn-outline-primary">';
            echo '<i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول';
            echo '</a>';
        }
        
        // Register link
        if ($current_page !== 'register') {
            echo '<a href="' . home_url('/register/') . '" class="btn btn-sm btn-outline-success">';
            echo '<i class="fas fa-user-plus me-1"></i> إنشاء حساب';
            echo '</a>';
        }
        
        // Account link (only if logged in)
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
// UNIFIED AUTHENTICATION SYSTEM (SERVER-SIDE)
// =============================================================================

// Custom login form handler with unified authentication
function handle_custom_login() {
    if (isset($_POST['custom_login_submit'])) {
        $username = sanitize_text_field($_POST['user_login']);
        $password = $_POST['user_pass'];
        $remember = isset($_POST['rememberme']);
        
        if (empty($username) || empty($password)) {
            wp_redirect(add_query_arg('login', 'empty', wp_login_url()));
            exit;
        }
        
        // Try unified authentication
        $result = perform_unified_login($username, $password);
        
        if ($result['success']) {
            // Set current user and auth cookie
            wp_set_current_user($result['user_id']);
            wp_set_auth_cookie($result['user_id'], $remember);
            
            // Redirect to account page
            wp_redirect(home_url('/enhanced-account/'));
            exit;
        } else {
            wp_redirect(add_query_arg('login', 'failed', wp_login_url()));
            exit;
        }
    }
}
add_action('init', 'handle_custom_login');

// Custom registration form handler with unified authentication
function handle_custom_registration() {
    if (isset($_POST['custom_register_submit'])) {
        $username = sanitize_text_field($_POST['user_login']);
        $email = sanitize_email($_POST['user_email']);
        $password = $_POST['user_pass'];
        $first_name = sanitize_text_field($_POST['first_name']);
        $last_name = sanitize_text_field($_POST['last_name']);
        
        if (empty($username) || empty($email) || empty($password)) {
            wp_redirect(add_query_arg('register', 'empty', wp_registration_url()));
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
            wp_redirect(add_query_arg('register', 'failed', wp_registration_url()));
            exit;
        }
    }
}
add_action('init', 'handle_custom_registration');

// Unified login function
function perform_unified_login($username, $password) {
    // Step 1: Try direct WordPress authentication
    $user = wp_authenticate($username, $password);
    
    if (!is_wp_error($user)) {
        return array(
            'success' => true,
            'user_id' => $user->ID,
            'source' => 'wordpress'
        );
    }
    
    // Step 2: Check external API if direct login failed
    $phone = $username; // Assume username is phone number
    $api_result = check_laapak_user_api($phone);
    
    if ($api_result['found']) {
        // User found in external API, create local user
        $user_data = $api_result['client'];
        $user_id = create_user_from_laapak_data($user_data, $password);
        
        if ($user_id) {
            return array(
                'success' => true,
                'user_id' => $user_id,
                'source' => 'external_to_local'
            );
        }
    }
    
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

// Check Laapak user via API
function check_laapak_user_api($phone) {
    $api_url = 'https://reports.laapak.com/api/external/clients/lookup?phone=' . urlencode($phone);
    $api_key = 'laapak-api-key-2024';
    
    $response = wp_remote_get($api_url, array(
        'headers' => array(
            'x-api-key' => $api_key,
            'Content-Type' => 'application/json'
        ),
        'timeout' => 30
    ));
    
    if (is_wp_error($response)) {
        return array('found' => false);
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    if ($status_code === 200) {
        $data = json_decode($body, true);
        if (isset($data['client'])) {
            return array(
                'found' => true,
                'client' => $data['client']
            );
        }
    }
    
    return array('found' => false);
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