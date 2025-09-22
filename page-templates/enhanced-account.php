<?php
/**
 * Enhanced Account Page Template
 * 
 * Uses the exact same UI as client-portal but adds WooCommerce features
 * Maintains the same look, feel, and structure
 */

// Prevent direct access
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
    $address = sanitize_textarea_field($_POST['address']);
    
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
            update_user_meta($current_user->ID, 'billing_address', $address);
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
$user_address = get_user_meta($current_user->ID, 'billing_address', true);
$user_registered = $current_user->user_registered;

// Get WooCommerce orders if WooCommerce is active
$orders = array();
if (class_exists('WooCommerce')) {
    $orders = wc_get_orders(array(
        'customer' => $current_user->ID,
        'limit' => 10,
        'orderby' => 'date',
        'order' => 'DESC'
    ));
}

// Get WooCommerce subscriptions if WooCommerce Subscriptions is active
$subscriptions = array();
if (class_exists('WC_Subscriptions')) {
    $subscriptions = wcs_get_users_subscriptions($current_user->ID);
}
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?> dir="rtl">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>حسابي - <?php bloginfo('name'); ?></title>
    <meta name="description" content="إدارة حسابك في <?php bloginfo('name'); ?> - تقارير، فواتير، طلبات، ومعلومات شخصية">
    <meta name="keywords" content="حسابي, تقارير, فواتير, طلبات, <?php bloginfo('name'); ?>">
    <meta name="author" content="<?php bloginfo('name'); ?>">
    <meta name="robots" content="noindex, nofollow">
    
    <!-- Favicon -->
    <link rel="icon" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/logos/cropped-Logo-mark.png.png" type="image/png">
    <link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/logos/cropped-Logo-mark.png.png" type="image/png">
    
    <!-- Bootstrap RTL CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css">
    
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="<?php echo get_stylesheet_directory_uri(); ?>/assets/css/custom-client.css?v=<?php echo time(); ?>">
    
    <!-- Theme color for browser -->
    <meta name="theme-color" content="#0a3622">
    
    <!-- API Configuration -->
    <meta name="wp-nonce" content="<?php echo wp_create_nonce('wp_rest'); ?>">
    <meta name="user-id" content="<?php echo $current_user->ID; ?>">
    <meta name="api-base-url" content="https://reports.laapak.com/api/external">
    <meta name="client-token" content="<?php 
        // Generate client token for logged-in users
        if (is_user_logged_in()) {
            $user_id = get_current_user_id();
            $token_data = array(
                'user_id' => $user_id,
                'timestamp' => time(),
                'domain' => $_SERVER['HTTP_HOST'] ?? 'localhost'
            );
            $token_string = base64_encode(json_encode($token_data));
            $signature = hash_hmac('sha256', $token_string, wp_salt('auth'));
            echo $token_string . '.' . $signature;
        }
    ?>">
    <script>
        // Set client token if available in localStorage or generate new one
        document.addEventListener('DOMContentLoaded', function() {
            let clientToken = localStorage.getItem('clientToken') || sessionStorage.getItem('clientToken');
            if (!clientToken) {
                // Get token from meta tag
                clientToken = document.querySelector('meta[name="client-token"]').content;
                if (clientToken) {
                    localStorage.setItem('clientToken', clientToken);
                }
            }
        });
    </script>

    <style>
        .client-nav {
            border-radius: 10px;
            overflow: hidden;
        }
        .client-nav .nav-link {
            color: #495057;
            padding: 12px 15px;
            border-radius: 0;
            transition: all 0.3s ease;
        }
        .client-nav .nav-link.active {
            background-color: #007553;
            color: white;
        }
        .client-nav .nav-link:hover:not(.active) {
            background-color: #f8f9fa;
        }
        .report-card {
            border: none;
            border-radius: 10px;
            overflow: hidden;
            transition: transform 0.3s ease;
        }
        .report-card:hover {
            transform: translateY(-5px);
        }
        .warranty-badge {
            font-size: 0.85rem;
        }
        .warranty-active {
            background-color: #d1e7dd;
            color: #0a3622;
        }
        .warranty-expired {
            background-color: #f8d7da;
            color: #842029;
        }
        .warranty-progress {
            height: 6px;
            border-radius: 3px;
        }
        .maintenance-badge {
            font-weight: bold;
            padding: 8px 12px;
            border-radius: 20px;
        }
        .logout-link {
            color: #dc3545;
            text-decoration: none;
            transition: color 0.2s ease;
        }
        .logout-link:hover {
            color: #bd2130;
        }
        .order-badge {
            font-size: 0.85rem;
            padding: 6px 12px;
            border-radius: 50px;
        }
        .order-completed {
            background-color: #d1e7dd;
            color: #0a3622;
        }
        .order-processing {
            background-color: #cce5ff;
            color: #004085;
        }
        .order-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .loading-spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007553;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    
    <?php wp_head(); ?>
</head>
<body <?php body_class('bg-light'); ?>>
    <!-- WordPress Theme Header -->
    <?php get_header(); ?>
    <!-- Success/Error Messages -->
    <?php if ($update_success): ?>
        <div class="container mt-3">
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                <?php echo esc_html($update_success); ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </div>
    <?php endif; ?>

    <?php if ($update_error): ?>
        <div class="container mt-3">
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <?php echo esc_html($update_error); ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        </div>
    <?php endif; ?>

    <!-- Main Content -->
    <div class="container-fluid py-4" style="min-height: 100vh;">
        <!-- Navigation Breadcrumb -->
        <div class="row mb-3">
            <div class="col-12">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item">
                            <a href="<?php echo home_url(); ?>" class="text-decoration-none">
                                <i class="fas fa-home me-1"></i> الرئيسية
                            </a>
                        </li>
                        <li class="breadcrumb-item">
                            <a href="<?php echo home_url('/login/'); ?>" class="text-decoration-none">
                                <i class="fas fa-sign-in-alt me-1"></i> تسجيل الدخول
                            </a>
                        </li>
                        <li class="breadcrumb-item active" aria-current="page">
                            <i class="fas fa-user-circle me-1"></i> حسابي
                        </li>
                    </ol>
                </nav>
            </div>
        </div>

        <!-- Welcome Message -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-0">مرحباً <?php echo esc_html($current_user->first_name . ' ' . $current_user->last_name); ?>،</h5>
                                <p class="text-muted mb-0">يمكنك متابعة تفاصيل الصيانة والضمان والفواتير والطلبات من هنا.</p>
                            </div>
                            <div class="d-flex gap-2">
                                <a href="<?php echo wp_logout_url(home_url('/login/')); ?>" class="btn btn-outline-danger">
                                    <i class="fas fa-sign-out-alt me-2"></i>
                                    تسجيل الخروج
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="row mb-4">
            <div class="col-12">
                <ul class="nav client-nav shadow-sm bg-white" id="clientTabs" role="tablist">
                    <li class="nav-item">
                        <a class="nav-link active" id="orders-tab" data-bs-toggle="tab" data-bs-target="#orders" role="tab">
                            <i class="fas fa-shopping-cart me-2"></i> الطلبات
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="reports-tab" data-bs-toggle="tab" data-bs-target="#reports" role="tab">
                            <i class="fas fa-laptop-medical me-2"></i> تقارير لابك
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="warranty-tab" data-bs-toggle="tab" data-bs-target="#warranty" role="tab">
                            <i class="fas fa-shield-alt me-2"></i> تفاصيل الضمان
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="maintenance-tab" data-bs-toggle="tab" data-bs-target="#maintenance" role="tab">
                            <i class="fas fa-tools me-2"></i> مواعيد الصيانة الدورية
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="invoices-tab" data-bs-toggle="tab" data-bs-target="#invoices" role="tab">
                            <i class="fas fa-dollar-sign me-2"></i> الفواتير
                        </a>
                    </li>
                    <?php if (!empty($subscriptions)): ?>
                    <li class="nav-item">
                        <a class="nav-link" id="subscriptions-tab" data-bs-toggle="tab" data-bs-target="#subscriptions" role="tab">
                            <i class="fas fa-sync-alt me-2"></i> الاشتراكات
                        </a>
                    </li>
                    <?php endif; ?>
                    <li class="nav-item">
                        <a class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" role="tab">
                            <i class="fas fa-user me-2"></i> الملف الشخصي
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content" id="clientTabContent">
            <!-- Reports Tab -->
            <div class="tab-pane fade" id="reports" role="tabpanel">
                <div class="row" id="reportsList">
                    <!-- Loading indicator -->
                    <div class="col-12 text-center py-5" id="reportsLoading">
                        <div class="loading-spinner"></div>
                        <p class="mt-3 text-muted">جاري تحميل التقارير...</p>
                    </div>
                    
                    <!-- Reports will be loaded here by JavaScript -->
                    <div class="col-12 text-center py-5" id="noReportsMessage" style="display: none;">
                        <i class="fas fa-laptop-medical fa-3x mb-3 text-muted"></i>
                        <h5 class="text-muted">لا توجد تقارير صيانة حالياً</h5>
                    </div>
                </div>
            </div>

            <!-- Warranty Tab -->
            <div class="tab-pane fade" id="warranty" role="tabpanel">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body p-4">
                                <h5 class="card-title mb-3"><i class="fas fa-info-circle text-primary me-2"></i> معلومات الضمان</h5>
                                <p class="card-text text-muted mb-4">تقدم <?php bloginfo('name'); ?> ثلاثة أنواع من الضمانات لعملائها:</p>
                                <div class="row">
                                    <div class="col-md-4 mb-3">
                                        <div class="card h-100 border-0 shadow-sm">
                                            <div class="card-body p-4">
                                                <div class="d-flex align-items-center mb-3">
                                                    <div class="bg-success text-white rounded-circle p-2 me-3">
                                                        <i class="fas fa-cog"></i>
                                                    </div>
                                                    <h6 class="card-title text-success mb-0">ضمان عيوب الصناعة</h6>
                                                </div>
                                                <p class="card-text text-muted small">ضمان لمدة 6 أشهر ضد عيوب الصناعة منذ تاريخ إنشاء التقرير</p>
                                                <div class="mt-3">
                                                    <span class="badge bg-success rounded-pill px-3">6 أشهر</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="card h-100 border-0 shadow-sm">
                                            <div class="card-body p-4">
                                                <div class="d-flex align-items-center mb-3">
                                                    <div class="bg-warning text-white rounded-circle p-2 me-3">
                                                        <i class="fas fa-exchange-alt"></i>
                                                    </div>
                                                    <h6 class="card-title text-warning mb-0">ضمان الاستبدال</h6>
                                                </div>
                                                <p class="card-text text-muted small">ضمان استبدال لمدة 14 يوم من تاريخ استلام الجهاز</p>
                                                <div class="mt-3">
                                                    <span class="badge bg-warning rounded-pill px-3">14 يوم</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4 mb-3">
                                        <div class="card h-100 border-0 shadow-sm">
                                            <div class="card-body p-4">
                                                <div class="d-flex align-items-center mb-3">
                                                    <div class="bg-info text-white rounded-circle p-2 me-3">
                                                        <i class="fas fa-tools"></i>
                                                    </div>
                                                    <h6 class="card-title text-info mb-0">ضمان الصيانة الدورية</h6>
                                                </div>
                                                <p class="card-text text-muted small">ضمان صيانة دورية لمدة سنة كاملة (مرة كل 6 أشهر)</p>
                                                <div class="mt-3">
                                                    <span class="badge bg-info rounded-pill px-3">سنة كاملة</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row" id="warrantyList">
                    <!-- Loading indicator -->
                    <div class="col-12 text-center py-5" id="warrantyLoading">
                        <div class="loading-spinner"></div>
                        <p class="mt-3 text-muted">جاري تحميل تفاصيل الضمان...</p>
                    </div>
                    
                    <!-- Warranty cards will be loaded here by JavaScript -->
                </div>
            </div>

            <!-- Maintenance Tab -->
            <div class="tab-pane fade" id="maintenance" role="tabpanel">
                <div class="row mb-4">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title"><i class="fas fa-calendar-check text-primary me-2"></i> مواعيد الصيانة الدورية</h5>
                                <p class="card-text">تتم الصيانة الدورية مرة كل 6 أشهر من تاريخ إنشاء التقرير ولمدة سنة كاملة.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mb-5">
                    <div class="col-12">
                        <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                            <div class="card-header bg-success text-white p-4">
                                <h5 class="card-title mb-0 d-flex align-items-center">
                                    <i class="fas fa-tools me-3 fa-lg"></i> 
                                    <span>مراحل الصيانة الدورية في <?php bloginfo('name'); ?></span>
                                </h5>
                            </div>
                            <div class="card-body p-0">
                                <!-- Timeline style maintenance steps -->
                                <div class="maintenance-timeline p-4">
                                    <div class="timeline-item d-flex mb-4">
                                        <div class="timeline-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-temperature-high"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">استبدال المعجون الحراري</h5>
                                            <p class="text-muted">باستخدام نوع عالي الجودة ومناسب لطبيعة الجهاز لضمان أفضل تبريد ممكن.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item d-flex mb-4">
                                        <div class="timeline-icon bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-fan"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">إزالة الأكسدة من نظام التبريد</h5>
                                            <p class="text-muted">لتحسين نقل الحرارة بكفاءة، حيث تؤثر الأكسدة على كفاءة التبريد بنسبة قد تصل إلى 40%.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item d-flex mb-4">
                                        <div class="timeline-icon bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-tachometer-alt"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">فحص سرعة مراوح التبريد</h5>
                                            <p class="text-muted">وفي حالة تأثرها بالأتربة، يتم تنظيفها وإعادتها لحالتها الطبيعية لضمان التهوية المثالية.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item d-flex mb-4">
                                        <div class="timeline-icon bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-microchip"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">تنظيف اللوحة الأم بالكامل</h5>
                                            <p class="text-muted">شاملاً تنظيف جميع الفلاتات والوصلات بدقة لضمان استقرار الأداء.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item d-flex mb-4">
                                        <div class="timeline-icon bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-search"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">إجراء فحص شامل لكل مكونات الجهاز</h5>
                                            <p class="text-muted">لاكتشاف أي أعطال محتملة مبكرًا واتخاذ الإجراءات الوقائية اللازمة.</p>
                                        </div>
                                    </div>
                                    
                                    <div class="timeline-item d-flex">
                                        <div class="timeline-icon bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 50px; height: 50px; min-width: 50px; z-index: 1;">
                                            <i class="fas fa-spray-can"></i>
                                        </div>
                                        <div class="timeline-content ms-3 ps-3 border-start border-3 border-light" style="margin-top: 10px;">
                                            <h5 class="fw-bold">تنظيف خارجي كامل للجهاز</h5>
                                            <p class="text-muted mb-0">لإعادة مظهره كالجديد تمامًا، مما يعزز من تجربة الاستخدام والانطباع العام.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row" id="maintenanceList">
                    <!-- Loading indicator -->
                    <div class="col-12 text-center py-5" id="maintenanceLoading">
                        <div class="loading-spinner"></div>
                        <p class="mt-3 text-muted">جاري تحميل مواعيد الصيانة...</p>
                    </div>
                    
                    <!-- Maintenance cards will be loaded here by JavaScript -->
                </div>
            </div>

            <!-- Invoices Tab -->
            <div class="tab-pane fade" id="invoices" role="tabpanel">
                <div class="row" id="invoicesList">
                    <!-- Loading indicator -->
                    <div class="col-12 text-center py-5" id="invoicesLoading">
                        <div class="loading-spinner"></div>
                        <p class="mt-3 text-muted">جاري تحميل الفواتير...</p>
                    </div>
                    
                    <!-- Invoices will be loaded here by JavaScript -->
                    <div class="col-12 text-center py-5" id="noInvoicesMessage" style="display: none;">
                        <i class="fas fa-dollar-sign fa-3x mb-3 text-muted"></i>
                        <h5 class="text-muted">لا توجد فواتير حالياً</h5>
                    </div>
                </div>
            </div>

            <!-- Orders Tab (WooCommerce) -->
            <div class="tab-pane fade show active" id="orders" role="tabpanel">
                <div class="row" id="ordersList">
                    <?php if (!empty($orders)): ?>
                        <?php foreach ($orders as $order): ?>
                            <div class="col-md-6 col-lg-4 mb-4">
                                <div class="card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="bg-primary text-white rounded-circle p-2 me-3">
                                                <i class="fas fa-shopping-cart"></i>
                                            </div>
                                            <h6 class="card-title text-primary mb-0">طلب #<?php echo $order->get_order_number(); ?></h6>
                                        </div>
                                        <h6 class="card-title"><?php echo $order->get_formatted_order_total(); ?></h6>
                                        <p class="card-text text-muted small">التاريخ: <?php echo $order->get_date_created()->date('Y/m/d'); ?></p>
                                        <p class="card-text text-muted small">العنوان: <?php echo $order->get_formatted_billing_address(); ?></p>
                                        <div class="d-flex justify-content-between align-items-center mt-3">
                                            <span class="badge bg-<?php echo $order->get_status() === 'completed' ? 'success' : ($order->get_status() === 'processing' ? 'warning' : 'info'); ?> rounded-pill px-3">
                                                <?php echo wc_get_order_status_name($order->get_status()); ?>
                                            </span>
                                            <a href="<?php echo $order->get_view_order_url(); ?>" class="btn btn-outline-primary btn-sm">عرض الطلب</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    <?php else: ?>
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                            <h5 class="text-muted">لا توجد طلبات حالياً</h5>
                            <p class="text-muted">لم تقم بأي طلبات بعد</p>
                            <a href="<?php echo wc_get_page_permalink('shop'); ?>" class="btn btn-primary">تسوق الآن</a>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Subscriptions Tab (WooCommerce Subscriptions) -->
            <?php if (!empty($subscriptions)): ?>
            <div class="tab-pane fade" id="subscriptions" role="tabpanel">
                <div class="row" id="subscriptionsList">
                    <?php foreach ($subscriptions as $subscription): ?>
                        <div class="col-md-6 col-lg-4 mb-4">
                            <div class="card report-card shadow-sm">
                                <div class="card-header bg-warning text-white">
                                    <h6 class="card-title mb-0">
                                        <i class="fas fa-sync-alt me-2"></i>
                                        اشتراك #<?php echo $subscription->get_id(); ?>
                                    </h6>
                                </div>
                                <div class="card-body">
                                    <h6 class="card-title"><?php echo $subscription->get_formatted_order_total(); ?></h6>
                                    <p class="card-text text-muted">المدة: <?php echo $subscription->get_billing_period(); ?></p>
                                    <p class="card-text text-muted">التاريخ: <?php echo $subscription->get_date_created()->date('Y/m/d'); ?></p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="order-badge order-<?php echo $subscription->get_status(); ?>">
                                            <?php echo wc_get_order_status_name($subscription->get_status()); ?>
                                        </span>
                                        <a href="<?php echo $subscription->get_view_order_url(); ?>" class="btn btn-outline-primary btn-sm">عرض الاشتراك</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>

            <!-- Profile Tab -->
            <div class="tab-pane fade" id="profile" role="tabpanel">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-primary text-white">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-user me-2"></i>
                                    الملف الشخصي
                                </h5>
                            </div>
                            <div class="card-body">
                                <form method="post" action="">
                                    <?php wp_nonce_field('update_profile', 'profile_nonce'); ?>
                                    
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="first_name" class="form-label">الاسم الأول</label>
                                                <input type="text" 
                                                       name="first_name" 
                                                       id="first_name" 
                                                       class="form-control" 
                                                       value="<?php echo esc_attr($current_user->first_name); ?>" 
                                                       required>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label for="last_name" class="form-label">الاسم الأخير</label>
                                                <input type="text" 
                                                       name="last_name" 
                                                       id="last_name" 
                                                       class="form-control" 
                                                       value="<?php echo esc_attr($current_user->last_name); ?>" 
                                                       required>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <label for="email" class="form-label">البريد الإلكتروني</label>
                                        <input type="email" 
                                               name="email" 
                                               id="email" 
                                               class="form-control" 
                                               value="<?php echo esc_attr($current_user->user_email); ?>" 
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="phone" class="form-label">رقم الهاتف</label>
                                        <input type="tel" 
                                               name="phone" 
                                               id="phone" 
                                               class="form-control" 
                                               value="<?php echo esc_attr($user_phone); ?>" 
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="address" class="form-label">العنوان</label>
                                        <textarea name="address" 
                                                  id="address" 
                                                  class="form-control" 
                                                  rows="3"><?php echo esc_textarea($user_address); ?></textarea>
                                    </div>

                                    <div class="d-grid">
                                        <button type="submit" name="update_profile" class="btn btn-primary">
                                            <i class="fas fa-save me-2"></i>
                                            حفظ التغييرات
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-secondary text-white">
                                <h5 class="card-title mb-0">
                                    <i class="fas fa-key me-2"></i>
                                    تغيير كلمة المرور
                                </h5>
                            </div>
                            <div class="card-body">
                                <form method="post" action="">
                                    <?php wp_nonce_field('change_password', 'password_nonce'); ?>
                                    
                                    <div class="mb-3">
                                        <label for="current_password" class="form-label">كلمة المرور الحالية</label>
                                        <input type="password" 
                                               name="current_password" 
                                               id="current_password" 
                                               class="form-control" 
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="new_password" class="form-label">كلمة المرور الجديدة</label>
                                        <input type="password" 
                                               name="new_password" 
                                               id="new_password" 
                                               class="form-control" 
                                               required>
                                    </div>

                                    <div class="mb-3">
                                        <label for="confirm_password" class="form-label">تأكيد كلمة المرور الجديدة</label>
                                        <input type="password" 
                                               name="confirm_password" 
                                               id="confirm_password" 
                                               class="form-control" 
                                               required>
                                    </div>

                                    <div class="d-grid">
                                        <button type="submit" name="change_password" class="btn btn-secondary">
                                            <i class="fas fa-key me-2"></i>
                                            تغيير كلمة المرور
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Report Modal -->
    <div class="modal fade" id="reportModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-laptop-medical me-2"></i> تفاصيل التقرير</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" id="reportModalContent">
                    <!-- Report content will be loaded here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    <button type="button" class="btn btn-primary" id="printReportBtn">
                        <i class="fas fa-print me-2"></i> طباعة التقرير
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Invoice Modal -->
    <div class="modal fade" id="invoiceModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title"><i class="fas fa-file-invoice me-2"></i> تفاصيل الفاتورة</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4" id="invoiceModalContent">
                    <!-- Invoice content will be loaded here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                    <button type="button" class="btn btn-primary" id="printInvoiceBtn">
                        <i class="fas fa-print me-2"></i> طباعة الفاتورة
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS Bundle with Popper -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Enhanced Account JavaScript -->
    <script src="<?php echo get_stylesheet_directory_uri(); ?>/assets/js/enhanced-account.js?v=<?php echo time(); ?>"></script>
    
    <!-- Custom JavaScript -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-hide alerts
            setTimeout(function() {
                const alerts = document.querySelectorAll('.alert');
                alerts.forEach(alert => {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                });
            }, 5000);
            
            // Print report functionality
            const printReportBtn = document.getElementById('printReportBtn');
            if (printReportBtn) {
                printReportBtn.addEventListener('click', function() {
                    const originalContent = document.body.innerHTML;
                    const reportContent = document.getElementById('reportModalContent').innerHTML;
                    document.body.innerHTML = `
                        <div class="container p-4">
                            ${reportContent}
                        </div>
                    `;
                    window.print();
                    document.body.innerHTML = originalContent;
                    location.reload();
                });
            }
            
            // Print invoice functionality
            const printInvoiceBtn = document.getElementById('printInvoiceBtn');
            if (printInvoiceBtn) {
                printInvoiceBtn.addEventListener('click', function() {
                    const originalContent = document.body.innerHTML;
                    const invoiceContent = document.getElementById('invoiceModalContent').innerHTML;
                    document.body.innerHTML = `
                        <div class="container p-4">
                            ${invoiceContent}
                        </div>
                    `;
                    window.print();
                    document.body.innerHTML = originalContent;
                    location.reload();
                });
            }
        });
    </script>

    <!-- WordPress Theme Footer -->
    <?php get_footer(); ?>
    
    <?php wp_footer(); ?>
</body>
</html>