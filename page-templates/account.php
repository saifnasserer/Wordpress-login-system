<?php
/**
 * Custom Account Page Template
 * 
 * This template creates a custom account page while maintaining
 * WordPress core functionality and user management.
 */

// Prevent direct access (skip in dev environment)
if (!defined('ABSPATH') && !defined('WP_DEBUG')) {
    exit;
}

// Get current user
$current_user = wp_get_current_user();

// Redirect if not logged in
if (!is_user_logged_in()) {
    wp_redirect(home_url('/login/'));
    exit;
}

// Handle form submissions
$update_success = '';
$update_error = '';

// Handle profile update
if (isset($_POST['update_profile']) && wp_verify_nonce($_POST['profile_nonce'], 'update_profile')) {
    $first_name = sanitize_text_field($_POST['first_name']);
    $last_name = sanitize_text_field($_POST['last_name']);
    $email = sanitize_email($_POST['email']);
    $phone = sanitize_text_field($_POST['phone']);
    
    $errors = array();
    
    if (empty($first_name)) {
        $errors[] = 'الاسم الأول مطلوب';
    }
    
    if (empty($last_name)) {
        $errors[] = 'الاسم الأخير مطلوب';
    }
    
    if (empty($email)) {
        $errors[] = 'البريد الإلكتروني مطلوب';
    } elseif (!is_email($email)) {
        $errors[] = 'البريد الإلكتروني غير صحيح';
    } elseif ($email !== $current_user->user_email && email_exists($email)) {
        $errors[] = 'البريد الإلكتروني موجود بالفعل';
    }
    
    if (empty($phone)) {
        $errors[] = 'رقم الهاتف مطلوب';
    }
    
    if (empty($errors)) {
        // Update user data
        $user_data = array(
            'ID' => $current_user->ID,
            'first_name' => $first_name,
            'last_name' => $last_name,
            'user_email' => $email
        );
        
        $result = wp_update_user($user_data);
        
        if (!is_wp_error($result)) {
            update_user_meta($current_user->ID, 'phone', $phone);
            $update_success = 'تم تحديث الملف الشخصي بنجاح';
        } else {
            $update_error = 'فشل في تحديث الملف الشخصي: ' . $result->get_error_message();
        }
    } else {
        $update_error = implode('، ', $errors);
    }
}

// Handle password change
if (isset($_POST['change_password']) && wp_verify_nonce($_POST['password_nonce'], 'change_password')) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];
    
    $errors = array();
    
    if (empty($current_password)) {
        $errors[] = 'كلمة المرور الحالية مطلوبة';
    } elseif (!wp_check_password($current_password, $current_user->user_pass, $current_user->ID)) {
        $errors[] = 'كلمة المرور الحالية غير صحيحة';
    }
    
    if (empty($new_password)) {
        $errors[] = 'كلمة المرور الجديدة مطلوبة';
    } elseif (strlen($new_password) < 6) {
        $errors[] = 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل';
    }
    
    if ($new_password !== $confirm_password) {
        $errors[] = 'كلمة المرور الجديدة وتأكيدها غير متطابقتين';
    }
    
    if (empty($errors)) {
        wp_set_password($new_password, $current_user->ID);
        $update_success = 'تم تغيير كلمة المرور بنجاح';
    } else {
        $update_error = implode('، ', $errors);
    }
}

// Get user data
$user_phone = get_user_meta($current_user->ID, 'phone', true);
$user_registered = $current_user->user_registered;
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>حسابي - <?php bloginfo('name'); ?></title>
    <meta name="description" content="إدارة حسابك في <?php bloginfo('name'); ?> - عرض وتحديث معلوماتك الشخصية وإعدادات الحساب">
    <meta name="keywords" content="حسابي, ملف شخصي, إعدادات, <?php bloginfo('name'); ?>">
    <meta name="author" content="<?php bloginfo('name'); ?>">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="حسابي - <?php bloginfo('name'); ?>">
    <meta property="og:description" content="إدارة حسابك في <?php bloginfo('name'); ?> - عرض وتحديث معلوماتك الشخصية وإعدادات الحساب">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo home_url('/account/'); ?>">
    <meta property="og:site_name" content="<?php bloginfo('name'); ?>">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="حسابي - <?php bloginfo('name'); ?>">
    <meta name="twitter:description" content="إدارة حسابك في <?php bloginfo('name'); ?> - عرض وتحديث معلوماتك الشخصية وإعدادات الحساب">
    <link rel="canonical" href="<?php echo home_url('/account/'); ?>">
    <link rel="alternate" hreflang="ar" href="<?php echo home_url('/account/'); ?>">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "حسابي - <?php bloginfo('name'); ?>",
        "description": "إدارة حسابك في <?php bloginfo('name'); ?> - عرض وتحديث معلوماتك الشخصية وإعدادات الحساب",
        "url": "<?php echo home_url('/account/'); ?>",
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
                    "name": "حسابي",
                    "item": "<?php echo home_url('/account/'); ?>"
                }
            ]
        }
    }
    </script>
    
    <?php wp_head(); ?>
    
    <!-- Force load custom account assets -->
    <link rel="stylesheet" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/css/custom-account.css?v=<?php echo time(); ?>">
    <script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/custom-account.js?v=<?php echo time(); ?>"></script>
</head>
<body <?php body_class('custom-account-page'); ?>>

<div class="account-container">
    <div class="account-wrapper">
        <!-- Header -->
        <div class="account-header">
            <h1 class="account-title">حسابي</h1>
            <div class="user-welcome">
                <p>مرحباً، <?php echo esc_html($current_user->first_name . ' ' . $current_user->last_name); ?></p>
            </div>
        </div>

        <!-- Success/Error Messages -->
        <?php if ($update_success): ?>
            <div class="account-success">
                <span class="success-icon">✅</span>
                <span class="success-message"><?php echo esc_html($update_success); ?></span>
            </div>
        <?php endif; ?>

        <?php if ($update_error): ?>
            <div class="account-error">
                <span class="error-icon">⚠️</span>
                <span class="error-message"><?php echo esc_html($update_error); ?></span>
            </div>
        <?php endif; ?>

        <!-- Account Tabs -->
        <div class="account-tabs">
            <button class="tab-button active" data-tab="profile">الملف الشخصي</button>
            <button class="tab-button" data-tab="security">الأمان</button>
            <button class="tab-button" data-tab="activity">النشاط</button>
        </div>

        <!-- Profile Tab -->
        <div class="tab-content active" id="profile-tab">
            <div class="account-section">
                <h2 class="section-title">معلوماتي الشخصية</h2>
                
                <form class="account-form" method="post" action="">
                    <?php wp_nonce_field('update_profile', 'profile_nonce'); ?>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="first_name" class="form-label">الاسم الأول</label>
                            <input type="text" 
                                   name="first_name" 
                                   id="first_name" 
                                   class="form-input" 
                                   value="<?php echo esc_attr($current_user->first_name); ?>" 
                                   required>
                        </div>
                        
                        <div class="form-group">
                            <label for="last_name" class="form-label">الاسم الأخير</label>
                            <input type="text" 
                                   name="last_name" 
                                   id="last_name" 
                                   class="form-input" 
                                   value="<?php echo esc_attr($current_user->last_name); ?>" 
                                   required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="email" class="form-label">البريد الإلكتروني</label>
                        <input type="email" 
                               name="email" 
                               id="email" 
                               class="form-input" 
                               value="<?php echo esc_attr($current_user->user_email); ?>" 
                               required>
                    </div>

                    <div class="form-group">
                        <label for="phone" class="form-label">رقم الهاتف</label>
                        <input type="tel" 
                               name="phone" 
                               id="phone" 
                               class="form-input" 
                               value="<?php echo esc_attr($user_phone); ?>" 
                               required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">تاريخ الانضمام</label>
                        <div class="info-display">
                            <?php echo date('Y/m/d', strtotime($user_registered)); ?>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" name="update_profile" class="account-button primary">
                            حفظ التغييرات
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-content" id="security-tab">
            <div class="account-section">
                <h2 class="section-title">تغيير كلمة المرور</h2>
                
                <form class="account-form" method="post" action="">
                    <?php wp_nonce_field('change_password', 'password_nonce'); ?>
                    
                    <div class="form-group">
                        <label for="current_password" class="form-label">كلمة المرور الحالية</label>
                        <input type="password" 
                               name="current_password" 
                               id="current_password" 
                               class="form-input" 
                               required>
                    </div>

                    <div class="form-group">
                        <label for="new_password" class="form-label">كلمة المرور الجديدة</label>
                        <input type="password" 
                               name="new_password" 
                               id="new_password" 
                               class="form-input" 
                               required>
                    </div>

                    <div class="form-group">
                        <label for="confirm_password" class="form-label">تأكيد كلمة المرور الجديدة</label>
                        <input type="password" 
                               name="confirm_password" 
                               id="confirm_password" 
                               class="form-input" 
                               required>
                    </div>

                    <div class="form-actions">
                        <button type="submit" name="change_password" class="account-button primary">
                            تغيير كلمة المرور
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Activity Tab -->
        <div class="tab-content" id="activity-tab">
            <div class="account-section">
                <h2 class="section-title">نشاط الحساب</h2>
                
                <div class="activity-list">
                    <div class="activity-item">
                        <div class="activity-icon">👤</div>
                        <div class="activity-content">
                            <div class="activity-title">آخر تسجيل دخول</div>
                            <div class="activity-time">الآن</div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon">📅</div>
                        <div class="activity-content">
                            <div class="activity-title">تاريخ الانضمام</div>
                            <div class="activity-time"><?php echo date('Y/m/d', strtotime($user_registered)); ?></div>
                        </div>
                    </div>
                    
                    <div class="activity-item">
                        <div class="activity-icon">📧</div>
                        <div class="activity-content">
                            <div class="activity-title">البريد الإلكتروني</div>
                            <div class="activity-time"><?php echo esc_html($current_user->user_email); ?></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Account Actions -->
        <div class="account-actions">
            <div class="action-buttons">
                <a href="<?php echo home_url(); ?>" class="account-button secondary">
                    العودة للرئيسية
                </a>
                <a href="<?php echo wp_logout_url(home_url()); ?>" class="account-button danger">
                    تسجيل الخروج
                </a>
            </div>
        </div>
    </div>
</div>

<!-- Subtle Footer -->
<footer class="account-page-footer">
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

<?php wp_footer(); ?>
</body>
</html>
