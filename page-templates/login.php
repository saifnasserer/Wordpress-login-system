<?php
/**
 * Custom Login Page Template
 * 
 * This template creates a custom login page while maintaining
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

// Handle login errors
$login_error = '';
if (isset($_GET['login']) && $_GET['login'] == 'failed') {
    $login_error = 'Invalid username or password. Please try again.';
}

// Get the login URL
$login_url = wp_login_url();
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>تسجيل الدخول - <?php bloginfo('name'); ?></title>
    <meta name="description" content="سجل دخولك إلى حسابك في <?php bloginfo('name'); ?> - واجهة تسجيل دخول آمنة وسهلة الاستخدام">
    <meta name="keywords" content="تسجيل الدخول, حساب, مستخدم, <?php bloginfo('name'); ?>">
    <meta name="author" content="<?php bloginfo('name'); ?>">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="تسجيل الدخول - <?php bloginfo('name'); ?>">
    <meta property="og:description" content="سجل دخولك إلى حسابك في <?php bloginfo('name'); ?> - واجهة تسجيل دخول آمنة وسهلة الاستخدام">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo home_url('/login/'); ?>">
    <meta property="og:site_name" content="<?php bloginfo('name'); ?>">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="تسجيل الدخول - <?php bloginfo('name'); ?>">
    <meta name="twitter:description" content="سجل دخولك إلى حسابك في <?php bloginfo('name'); ?> - واجهة تسجيل دخول آمنة وسهلة الاستخدام">
    <link rel="canonical" href="<?php echo home_url('/login/'); ?>">
    <link rel="alternate" hreflang="ar" href="<?php echo home_url('/login/'); ?>">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "تسجيل الدخول - <?php bloginfo('name'); ?>",
        "description": "سجل دخولك إلى حسابك في <?php bloginfo('name'); ?> - واجهة تسجيل دخول آمنة وسهلة الاستخدام",
        "url": "<?php echo home_url('/login/'); ?>",
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
                    "name": "تسجيل الدخول",
                    "item": "<?php echo home_url('/login/'); ?>"
                }
            ]
        }
    }
    </script>
    
    <?php wp_head(); ?>
    
    <!-- Force load custom login assets -->
    <link rel="stylesheet" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/css/custom-login.css?v=<?php echo time(); ?>">
    <script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/custom-login.js?v=<?php echo time(); ?>"></script>
</head>
<body <?php body_class('custom-login-page'); ?>>

<div class="login-container">
    <div class="login-wrapper">
        <div class="login-header">
            <h1 class="login-title">تسجيل الدخول</h1>
        </div>

        <div class="login-form-container">
            <?php if ($login_error): ?>
                <div class="login-error">
                    <span class="error-icon">⚠️</span>
                    <span class="error-message">اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.</span>
                </div>
            <?php endif; ?>

            <form name="loginform" id="loginform" action="<?php echo esc_url($login_url); ?>" method="post" class="custom-login-form">
                <?php wp_nonce_field('login_nonce', 'login_nonce_field'); ?>
                
                <div class="form-group">
                    <!-- <label for="user_login" class="form-label">البريد الإلكتروني أو اسم المستخدم</label> -->
                    <input type="text" 
                           name="log" 
                           id="user_login" 
                           class="form-input" 
                           value="<?php echo isset($_POST['log']) ? esc_attr($_POST['log']) : ''; ?>" 
                           placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                           size="20" 
                           required>
                </div>

                <div class="form-group">
                    <!-- <label for="user_pass" class="form-label">كلمة المرور</label> -->
                    <input type="password" 
                           name="pwd" 
                           id="user_pass" 
                           class="form-input" 
                           placeholder="أدخل كلمة المرور"
                           size="20" 
                           required>
                </div>
<!-- 
                <div class="form-group remember-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="rememberme" id="rememberme" value="forever" checked>
                        <span class="checkmark"></span>
                        تذكرني
                    </label>
                </div> -->
                
                <div class="legal-text">
                    <p>بالمتابعة، أنت توافق على <a href="<?php echo home_url('/terms/'); ?>">شروط الاستخدام</a> و <a href="<?php echo home_url('/privacy/'); ?>">سياسة الخصوصية</a></p>
                </div>

                <div class="form-group">
                    <input type="submit" name="wp-submit" id="wp-submit" class="login-button" value="تسجيل الدخول">
                    <input type="hidden" name="redirect_to" value="<?php echo esc_url(home_url()); ?>">
                </div>
            </form>

            <div class="login-footer">
                <div class="login-links">
                    <a href="<?php echo wp_lostpassword_url(); ?>" class="forgot-password-link">
                        نسيت كلمة المرور؟
                    </a>
                </div>
                
                <div class="register-link">
                    <p>ليس لديك حساب؟ 
                        <a href="<?php echo home_url('/register/'); ?>" class="register-link-text">
                            سجل هنا
                        </a>
                    </p>
                </div>
            </div>
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
<div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
    <p>Signing you in...</p>
</div>

<?php wp_footer(); ?>
</body>
</html>
