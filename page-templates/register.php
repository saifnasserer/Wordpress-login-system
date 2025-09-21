<?php
/**
 * Custom Registration Page Template
 * 
 * This template creates a custom registration page while maintaining
 * WordPress core functionality and form processing.
 */

// Prevent direct access (skip in dev environment)
if (!defined('ABSPATH') && !defined('WP_DEBUG')) {
    exit;
}

// Get current user
$current_user = wp_get_current_user();

// Redirect if already logged in
if (is_user_logged_in()) {
    wp_redirect(home_url());
    exit;
}

// Handle registration errors
$registration_error = '';
$registration_success = '';

if (isset($_GET['registration'])) {
    if ($_GET['registration'] == 'success') {
        $registration_success = 'Registration successful! Please check your email to activate your account.';
    } elseif ($_GET['registration'] == 'error') {
        $error_message = isset($_GET['message']) ? $_GET['message'] : 'Registration failed. Please try again.';
        $registration_error = $error_message;
    }
}

// Handle registration on the same page
if (isset($_POST['wp-submit']) && $_POST['wp-submit'] == 'إنشاء الحساب') {
    // Verify nonce
    if (!wp_verify_nonce($_POST['register_nonce_field'], 'register_nonce')) {
        $registration_error = 'فشل التحقق من الأمان. يرجى المحاولة مرة أخرى.';
    } else {
        // Get form data
        $full_name = sanitize_text_field($_POST['full_name']);
        $email = sanitize_email($_POST['user_email']);
        $password = $_POST['user_pass'];
        $phone = sanitize_text_field($_POST['phone']);
        
        // Split full name into first and last name
        $name_parts = explode(' ', trim($full_name), 2);
        $first_name = $name_parts[0];
        $last_name = isset($name_parts[1]) ? $name_parts[1] : '';
        
        // Generate username from email (safer for Arabic names)
        $email_parts = explode('@', $email);
        $username = sanitize_user($email_parts[0]);
        
        // If username is empty or exists, generate a safe one
        if (empty($username) || username_exists($username)) {
            $username = 'user_' . wp_generate_password(8, false);
        }
        
        // If username still exists, add numbers
        $original_username = $username;
        $counter = 1;
        while (username_exists($username)) {
            $username = $original_username . $counter;
            $counter++;
        }
        
        // Final fallback - ensure we have a valid username
        if (empty($username) || strlen($username) < 3) {
            $username = 'user_' . time();
        }
    
    // Basic validation
    $errors = array();
    
    if (empty($full_name)) {
        $errors[] = 'الاسم الكامل مطلوب';
    }
    
    if (empty($phone)) {
        $errors[] = 'رقم الهاتف مطلوب';
    }
    
    if (empty($email)) {
        $errors[] = 'البريد الإلكتروني مطلوب';
    } elseif (!is_email($email)) {
        $errors[] = 'البريد الإلكتروني غير صحيح';
    } elseif (email_exists($email)) {
        $errors[] = 'البريد الإلكتروني موجود بالفعل';
    }
    
    if (empty($password)) {
        $errors[] = 'كلمة المرور مطلوبة';
    } elseif (strlen($password) < 6) {
        $errors[] = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    // If no errors, create user
    if (empty($errors)) {
        // Debug: Log the username being created
        error_log('Creating user with username: ' . $username);
        
        $user_id = wp_create_user($username, $password, $email);
        
        if (!is_wp_error($user_id)) {
            // Update user meta with names and phone
            update_user_meta($user_id, 'first_name', $first_name);
            update_user_meta($user_id, 'last_name', $last_name);
            update_user_meta($user_id, 'phone', $phone);
            
            // Auto-login the user
            wp_set_current_user($user_id);
            wp_set_auth_cookie($user_id, true); // Remember user
            
            // Send welcome email
            wp_new_user_notification($user_id, null, 'user');
            
            // Redirect to home page or dashboard
            wp_redirect(home_url());
            exit;
        } else {
            // Show detailed error for debugging
            $error_message = $user_id->get_error_message();
            error_log('User creation failed: ' . $error_message);
            $registration_error = 'فشل في إنشاء الحساب: ' . $error_message;
        }
    } else {
        $registration_error = implode('، ', $errors);
    }
    }
}
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>إنشاء حساب جديد - <?php bloginfo('name'); ?></title>
    <meta name="description" content="انضم إلى <?php bloginfo('name'); ?> - أنشئ حسابك الجديد بسهولة وأمان مع واجهة تسجيل بسيطة وسريعة">
    <meta name="keywords" content="إنشاء حساب, تسجيل جديد, انضمام, <?php bloginfo('name'); ?>">
    <meta name="author" content="<?php bloginfo('name'); ?>">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="إنشاء حساب جديد - <?php bloginfo('name'); ?>">
    <meta property="og:description" content="انضم إلى <?php bloginfo('name'); ?> - أنشئ حسابك الجديد بسهولة وأمان مع واجهة تسجيل بسيطة وسريعة">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo home_url('/register/'); ?>">
    <meta property="og:site_name" content="<?php bloginfo('name'); ?>">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="إنشاء حساب جديد - <?php bloginfo('name'); ?>">
    <meta name="twitter:description" content="انضم إلى <?php bloginfo('name'); ?> - أنشئ حسابك الجديد بسهولة وأمان مع واجهة تسجيل بسيطة وسريعة">
    <link rel="canonical" href="<?php echo home_url('/register/'); ?>">
    <link rel="alternate" hreflang="ar" href="<?php echo home_url('/register/'); ?>">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "إنشاء حساب جديد - <?php bloginfo('name'); ?>",
        "description": "انضم إلى <?php bloginfo('name'); ?> - أنشئ حسابك الجديد بسهولة وأمان مع واجهة تسجيل بسيطة وسريعة",
        "url": "<?php echo home_url('/register/'); ?>",
        "inLanguage": "ar",
        "isPartOf": {
            "@type": "WebSite",
            "name": "<?php bloginfo('name'); ?>",
            "url": "<?php echo home_url(); ?>"
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "الرئيسية",
                    "item": "<?php echo home_url(); ?>"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "إنشاء حساب جديد",
                    "item": "<?php echo home_url('/register/'); ?>"
                }
            ]
        }
    }
    </script>
    
    <?php wp_head(); ?>
    
    <!-- Force load custom register assets -->
    <link rel="stylesheet" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/css/custom-register.css?v=<?php echo time(); ?>">
    <script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/custom-register.js?v=<?php echo time(); ?>"></script>
    <script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/unified-auth.js?v=<?php echo time(); ?>"></script>
    
    <!-- API Configuration -->
    <meta name="wp-nonce" content="<?php echo wp_create_nonce('wp_rest'); ?>">
    <meta name="api-base-url" content="https://reports.laapak.com">
</head>
<body <?php body_class('custom-register-page'); ?>>

<div class="register-container">
    <div class="register-wrapper">
        <div class="register-header">
            <h1 class="register-title">إنشاء حساب جديد</h1>
            <div class="login-link">
                    <p>لديك حساب بالفعل؟ 
                        <a href="<?php echo home_url('/login/'); ?>" class="login-link-text">
                            سجل الدخول هنا
                        </a>
                    </p>
                    <p class="mt-2">
                        <a href="<?php echo home_url('/enhanced-account/'); ?>">
                            <i class="fas fa-user-circle me-1"></i>
                            عرض الحساب (للمستخدمين المسجلين)
                        </a>
                    </p>
                </div>
        </div>


        <div class="register-form-container">
            <?php if ($registration_error): ?>
                <div class="register-error">
                    <span class="error-icon">⚠️</span>
                    <?php echo esc_html($registration_error); ?>
                </div>
            <?php endif; ?>

            <?php if ($registration_success): ?>
                <div class="register-success">
                    <span class="success-icon">✅</span>
                    <?php echo esc_html($registration_success); ?>
                </div>
            <?php endif; ?>

            <form name="registerform" id="registerform" action="" method="post" class="custom-register-form">
                <?php wp_nonce_field('register_nonce', 'register_nonce_field'); ?>
                
                <div class="form-group">
                    <!-- <label for="full_name" class="form-label">الاسم الكامل *</label> -->
                    <input type="text" 
                           name="full_name" 
                           id="full_name" 
                           class="form-input" 
                           placeholder="أدخل اسمك الكامل"
                           value="<?php echo isset($_POST['full_name']) ? esc_attr($_POST['full_name']) : ''; ?>" 
                           required>
                </div>

                <div class="form-group">
                    <!-- <label for="user_email" class="form-label">البريد الإلكتروني *</label> -->
                    <input type="email" 
                           name="user_email" 
                           id="user_email" 
                           class="form-input" 
                           placeholder="أدخل بريدك الإلكتروني"
                           value="<?php echo isset($_POST['user_email']) ? esc_attr($_POST['user_email']) : ''; ?>" 
                           required>
                </div>

                <div class="form-group">
                    <!-- <label for="phone" class="form-label">رقم الهاتف *</label> -->
                    <input type="tel" 
                           name="phone" 
                           id="phone" 
                           class="form-input" 
                           placeholder="أدخل رقم هاتفك"
                           value="<?php echo isset($_POST['phone']) ? esc_attr($_POST['phone']) : ''; ?>" 
                           required>
                </div>

                <div class="form-group">
                    <!-- <label for="user_pass" class="form-label">كلمة المرور *</label> -->
                    <input type="password" 
                           name="user_pass" 
                           id="user_pass" 
                           class="form-input" 
                           placeholder="أدخل كلمة المرور"
                           required>
                </div>


                <div class="form-group terms-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="terms_agreement" id="terms_agreement" required>
                        <span class="checkmark"></span>
                        أوافق على <a href="<?php echo home_url('/terms/'); ?>" target="_blank">شروط الخدمة</a> و <a href="<?php echo home_url('/privacy/'); ?>" target="_blank">سياسة الخصوصية</a>
                    </label>
                </div>

                <div class="form-submit">
                    <input type="submit" name="wp-submit" id="wp-submit" class="nav-button submit-button" value="إنشاء الحساب">
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Subtle Footer -->
<footer class="login-page-footer">
    <div class="footer-content">
        <div class="footer-logo">
            <img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/logos/logo.png" alt="Logo" class="footer-logo-image" onerror="this.style.display='none'">
        </div>
        <div class="footer-links">
            <a href="<?php echo home_url('/privacy/'); ?>" class="footer-link">سياسة الخصوصية</a>
            <a href="<?php echo home_url('/terms/'); ?>" class="footer-link">شروط الاستخدام</a>
            <a href="<?php echo home_url('/contact/'); ?>" class="footer-link">اتصل بنا</a>
        </div>
    </div>
</footer>

<!-- Loading overlay -->
<!-- <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
    <p>Creating your account...</p>
</div> -->

<?php wp_footer(); ?>
</body>
</html>
