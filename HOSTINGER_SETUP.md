# Hostinger WordPress Setup - Simple Steps

## Step 1: Access Your WordPress Files

### 1.1 Login to Hostinger
1. Go to **hostinger.com** and login
2. Go to **hPanel** (your control panel)
3. Find your WordPress site and click **Manage**

### 1.2 Access File Manager
1. In hPanel, click **File Manager**
2. Navigate to: `public_html/wp-content/themes/`
3. Find your **active child theme** folder (usually named like `your-theme-child`)

## Step 2: Upload Files to Your Child Theme

### 2.1 Create Folders
In your child theme folder, create these folders:
- `page-templates`
- `assets`
- `assets/css`
- `assets/js`
- `assets/logos`

### 2.2 Upload Template Files
Upload these files to your child theme:

**To `page-templates/` folder:**
- `login.php`
- `register.php`

**To `assets/css/` folder:**
- `custom-login.css`
- `custom-register.css`

**To `assets/js/` folder:**
- `custom-login.js`
- `custom-register.js`

**To `assets/logos/` folder:**
- `logo.png`

## Step 3: Update functions.php

### 3.1 Edit functions.php
1. In File Manager, go to your child theme folder
2. Find `functions.php` file
3. Click **Edit**
4. Scroll to the **BOTTOM** of the file
5. Add this code at the very end:

```php
// =============================================================================
// CUSTOM AUTH PAGES
// =============================================================================

// Custom page templates
function add_custom_page_templates($templates) {
    $templates['page-templates/login.php'] = 'Custom Login';
    $templates['page-templates/register.php'] = 'Custom Register';
    return $templates;
}
add_filter('theme_page_templates', 'add_custom_page_templates');

// Enqueue custom styles and scripts
function enqueue_custom_auth_assets() {
    if (is_page('login')) {
        wp_enqueue_style('custom-login-css', get_stylesheet_directory_uri() . '/assets/css/custom-login.css', array(), '1.0.0');
        wp_enqueue_script('custom-login-js', get_stylesheet_directory_uri() . '/assets/js/custom-login.js', array('jquery'), '1.0.0', true);
    }
    
    if (is_page('register')) {
        wp_enqueue_style('custom-register-css', get_stylesheet_directory_uri() . '/assets/css/custom-register.css', array(), '1.0.0');
        wp_enqueue_script('custom-register-js', get_stylesheet_directory_uri() . '/assets/js/custom-register.js', array('jquery'), '1.0.0', true);
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_auth_assets');

// Redirect default WordPress login
function redirect_wp_login() {
    if (isset($_GET['action']) && $_GET['action'] == 'register') {
        wp_redirect(home_url('/register/'));
        exit();
    }
    wp_redirect(home_url('/login/'));
    exit();
}
add_action('login_init', 'redirect_wp_login');

// Handle form submissions
function handle_custom_login() {
    if (isset($_POST['custom_login_submit'])) {
        $username = sanitize_user($_POST['log']);
        $password = $_POST['pwd'];
        $remember = isset($_POST['rememberme']) ? true : false;
        
        $user = wp_authenticate($username, $password);
        
        if (!is_wp_error($user)) {
            wp_set_current_user($user->ID);
            wp_set_auth_cookie($user->ID, $remember);
            wp_redirect(home_url());
            exit();
        } else {
            wp_redirect(home_url('/login/?login=failed'));
            exit();
        }
    }
}
add_action('init', 'handle_custom_login');

// Handle registration
function handle_custom_registration() {
    if (isset($_POST['wp-submit']) && $_POST['wp-submit'] == 'إنشاء الحساب') {
        $username = sanitize_user($_POST['user_login']);
        $email = sanitize_email($_POST['user_email']);
        $password = $_POST['user_pass'];
        $phone = sanitize_text_field($_POST['phone']);
        
        // Validate passwords match
        if ($password !== $_POST['user_pass_confirm']) {
            wp_redirect(home_url('/register/?registration=error&message=password_mismatch'));
            exit();
        }
        
        // Create user
        $user_id = wp_create_user($username, $password, $email);
        
        if (!is_wp_error($user_id)) {
            // Add phone number as user meta
            update_user_meta($user_id, 'phone', $phone);
            
            wp_redirect(home_url('/login/?registration=success'));
            exit();
        } else {
            wp_redirect(home_url('/register/?registration=error'));
            exit();
        }
    }
}
add_action('init', 'handle_custom_registration');
```

6. Click **Save Changes**

## Step 4: Create Pages in WordPress Admin

### 4.1 Login to WordPress Admin
1. Go to your website: `yoursite.com/wp-admin`
2. Login with your admin credentials

### 4.2 Create Login Page
1. Go to **Pages > Add New**
2. Title: `Login`
3. Slug: `login` (important!)
4. In **Page Attributes**, select **Custom Login** template
5. Click **Publish**

### 4.3 Create Register Page
1. Go to **Pages > Add New**
2. Title: `Register`
3. Slug: `register` (important!)
4. In **Page Attributes**, select **Custom Register** template
5. Click **Publish**

## Step 5: Test Your Pages

### 5.1 Test Login Page
- Go to: `yoursite.com/login/`
- Should show custom login form

### 5.2 Test Register Page
- Go to: `yoursite.com/register/`
- Should show custom registration form

### 5.3 Test Redirects
- Go to: `yoursite.com/wp-login.php`
- Should redirect to your custom login page

## Troubleshooting

### If Pages Don't Show Custom Design:
1. **Clear Cache**: In hPanel, go to **Cache** and clear all cache
2. **Check File Permissions**: Make sure files are uploaded correctly
3. **Check functions.php**: Make sure code was added without errors

### If Templates Don't Appear:
1. **Check File Names**: Make sure files are named exactly as shown
2. **Check Folder Structure**: Make sure folders are in the right place
3. **Check functions.php**: Make sure the code was added correctly

### If CSS/JS Don't Load:
1. **Check File Paths**: Make sure files are in the correct folders
2. **Clear Browser Cache**: Hard refresh (Ctrl+F5)
3. **Check Console**: Open browser developer tools for errors

## That's It! 🎉

Your custom login and registration pages should now be working on your Hostinger WordPress site.
