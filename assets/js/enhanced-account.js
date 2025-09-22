/**
 * Enhanced Account JavaScript
 * Handles WooCommerce integration and profile management
 */

class EnhancedAccount {
    constructor() {
        this.wpNonce = document.querySelector('meta[name="wp-nonce"]')?.content || '';
        this.currentUser = null;
        
        this.init();
    }

    init() {
        console.log('🚀 Enhanced Account initialized');
        this.setupEventListeners();
        this.loadUserData();
        this.initializeTabs();
    }

    setupEventListeners() {
        // Tab switching
        const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetTab = e.target.getAttribute('data-bs-target');
                this.handleTabSwitch(targetTab);
            });
        });

        // Profile form submission
        const profileForm = document.querySelector('form[action=""]');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                this.handleProfileUpdate(e);
            });
        }

        // Password change form
        const passwordForm = document.querySelector('form[action=""]');
        if (passwordForm && passwordForm.querySelector('input[name="change_password"]')) {
            passwordForm.addEventListener('submit', (e) => {
                this.handlePasswordChange(e);
            });
        }
    }

    initializeTabs() {
        // Initialize Bootstrap tabs
        const triggerTabList = document.querySelectorAll('#clientTabs button');
        triggerTabList.forEach(triggerEl => {
            const tabTrigger = new bootstrap.Tab(triggerEl);
            triggerEl.addEventListener('click', event => {
                event.preventDefault();
                tabTrigger.show();
            });
        });
    }

    handleTabSwitch(targetTab) {
        console.log('🔄 Switching to tab:', targetTab);
        
        switch(targetTab) {
            case '#orders':
                this.loadWooCommerceOrders();
                break;
            case '#subscriptions':
                this.loadWooCommerceSubscriptions();
                break;
            case '#profile':
                this.loadProfileData();
                break;
            case '#reports':
            case '#warranty':
            case '#maintenance':
            case '#invoices':
                // These tabs are handled by PHP/WordPress - no JavaScript needed
                console.log('Tab handled by server-side rendering');
                break;
        }
    }

    async loadUserData() {
        try {
            // Get current user data from WordPress
            const response = await fetch('/wp-json/wp/v2/users/me', {
                headers: {
                    'X-WP-Nonce': this.wpNonce
                }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                console.log('✅ User data loaded:', this.currentUser);
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
        }
    }

    // WooCommerce Orders Implementation
    async loadWooCommerceOrders() {
        console.log('🛒 Loading WooCommerce orders...');
        
        const ordersContainer = document.getElementById('ordersList');
        if (!ordersContainer) return;

        try {
            // Show loading state
            this.showLoadingState(ordersContainer, 'جاري تحميل الطلبات...');

            // Try WooCommerce REST API first with explicit customer filter
            let response = await fetch('/wp-json/wc/v3/orders?per_page=10&orderby=date&order=desc&status=any&customer=' + (this.currentUser ? this.currentUser.id : ''), {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': this.wpNonce,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });

            console.log('WooCommerce API Response Status:', response.status);
            console.log('Request URL:', '/wp-json/wc/v3/orders?per_page=10&orderby=date&order=desc&status=any&customer=' + (this.currentUser ? this.currentUser.id : ''));

            if (response.ok) {
                const orders = await response.json();
                console.log('Orders loaded via WooCommerce API:', orders);
                console.log('Number of orders returned:', orders.length);
                this.displayWooCommerceOrders(orders, ordersContainer);
            } else if (response.status === 403) {
                // Handle 403 Forbidden - try our custom endpoint
                console.warn('WooCommerce API access denied - trying custom endpoint');
                
                response = await fetch('/wp-json/laapak/v1/orders?per_page=10&orderby=date&order=desc', {
                    method: 'GET',
                    headers: {
                        'X-WP-Nonce': this.wpNonce,
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    const orders = await response.json();
                    console.log('Orders loaded via custom endpoint:', orders);
                    this.displayWooCommerceOrders(orders, ordersContainer);
                } else {
                    console.error('Custom endpoint also failed:', response.status);
                    this.showWooCommerceFallback(ordersContainer);
                }
            } else {
                const errorText = await response.text();
                console.error('WooCommerce API Error:', response.status, errorText);
                this.showErrorMessage(ordersContainer, `فشل في تحميل الطلبات (${response.status})`);
            }
        } catch (error) {
            console.error('❌ Error loading orders:', error);
            this.showWooCommerceFallback(ordersContainer);
        }
    }

    showWooCommerceFallback(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                <h5 class="text-muted">لا يمكن تحميل الطلبات حالياً</h5>
                <p class="text-muted">يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني</p>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    displayWooCommerceOrders(orders, container) {
        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد طلبات حالياً</h5>
                    <p class="text-muted">لم تقم بأي طلبات بعد</p>
                    <a href="/shop/" class="btn btn-primary">تسوق الآن</a>
                </div>
            `;
            return;
        }

        const ordersHTML = orders.map(order => {
            const statusClass = this.getOrderStatusClass(order.status);
            const statusText = this.getOrderStatusText(order.status);
            const orderDate = new Date(order.date_created).toLocaleDateString('ar-SA');
            
            // Handle different order structures from WooCommerce API vs custom endpoint
            const orderNumber = order.number || order.id;
            const orderTotal = order.total || order.total_formatted || 'غير محدد';
            const orderCurrency = order.currency || '';
            const orderAddress = this.formatAddress(order.billing);
            
            // Handle links safely
            let viewOrderUrl = '#';
            if (order.links && order.links.length > 0) {
                viewOrderUrl = order.links[0].href;
            } else if (order.id) {
                // Fallback to WordPress order view URL
                viewOrderUrl = `/my-account/view-order/${order.id}/`;
            }
            
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-primary text-white rounded-circle p-2 me-3">
                                    <i class="fas fa-shopping-cart"></i>
                                </div>
                                <h6 class="card-title text-primary mb-0">طلب #${orderNumber}</h6>
                            </div>
                            <h6 class="card-title">${orderTotal} ${orderCurrency}</h6>
                            <p class="card-text text-muted small">التاريخ: ${orderDate}</p>
                            <p class="card-text text-muted small">العنوان: ${orderAddress}</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="badge bg-${statusClass} rounded-pill px-3">
                                    ${statusText}
                                </span>
                                <a href="${viewOrderUrl}" class="btn btn-outline-primary btn-sm">عرض الطلب</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = ordersHTML;
    }

    // WooCommerce Subscriptions (if WooCommerce Subscriptions is active)
    async loadWooCommerceSubscriptions() {
        console.log('🔄 Loading WooCommerce subscriptions...');
        
        const subscriptionsContainer = document.getElementById('subscriptionsList');
        if (!subscriptionsContainer) return;

        try {
            this.showLoadingState(subscriptionsContainer, 'جاري تحميل الاشتراكات...');

            // Check if WooCommerce Subscriptions is available
            const response = await fetch('/wp-json/wc/v3/subscriptions?per_page=10&orderby=date&order=desc', {
                headers: {
                    'X-WP-Nonce': this.wpNonce,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const subscriptions = await response.json();
                this.displayWooCommerceSubscriptions(subscriptions, subscriptionsContainer);
            } else {
                this.showErrorMessage(subscriptionsContainer, 'لا توجد اشتراكات أو WooCommerce Subscriptions غير مفعل');
            }
        } catch (error) {
            console.error('❌ Error loading subscriptions:', error);
            this.showErrorMessage(subscriptionsContainer, 'حدث خطأ في تحميل الاشتراكات');
        }
    }

    displayWooCommerceSubscriptions(subscriptions, container) {
        if (!subscriptions || subscriptions.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-sync-alt fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد اشتراكات حالياً</h5>
                </div>
            `;
            return;
        }

        const subscriptionsHTML = subscriptions.map(subscription => {
            const statusClass = this.getOrderStatusClass(subscription.status);
            const statusText = this.getOrderStatusText(subscription.status);
            const subscriptionDate = new Date(subscription.date_created).toLocaleDateString('ar-SA');
            
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body p-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="bg-warning text-white rounded-circle p-2 me-3">
                                    <i class="fas fa-sync-alt"></i>
                                </div>
                                <h6 class="card-title text-warning mb-0">اشتراك #${subscription.number}</h6>
                            </div>
                            <h6 class="card-title">${subscription.total} ${subscription.currency}</h6>
                            <p class="card-text text-muted small">التاريخ: ${subscriptionDate}</p>
                            <p class="card-text text-muted small">المدة: ${subscription.billing_period || 'غير محدد'}</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="badge bg-${statusClass} rounded-pill px-3">
                                    ${statusText}
                                </span>
                                <a href="${subscription.links[0].href}" class="btn btn-outline-warning btn-sm">عرض الاشتراك</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = subscriptionsHTML;
    }

    getOrderStatusClass(status) {
        const statusMap = {
            'completed': 'success',
            'processing': 'warning',
            'pending': 'info',
            'cancelled': 'danger',
            'refunded': 'secondary'
        };
        return statusMap[status] || 'info';
    }

    getOrderStatusText(status) {
        const statusMap = {
            'completed': 'مكتمل',
            'processing': 'قيد المعالجة',
            'pending': 'في الانتظار',
            'cancelled': 'ملغي',
            'refunded': 'مسترد'
        };
        return statusMap[status] || status;
    }

    formatAddress(billing) {
        if (!billing) return 'غير محدد';
        const parts = [billing.address_1, billing.address_2, billing.city, billing.state, billing.postcode].filter(Boolean);
        return parts.join(', ') || 'غير محدد';
    }

    // Profile Tab Implementation
    loadProfileData() {
        console.log('👤 Loading profile data...');
        // Profile data is already loaded in PHP, just ensure form is ready
        this.setupProfileValidation();
    }

    setupProfileValidation() {
        const profileForm = document.querySelector('form[action=""]');
        if (!profileForm) return;

        // Add real-time validation
        const inputs = profileForm.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Email validation
        const emailInput = document.getElementById('email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput);
            });
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        
        if (!value) {
            this.showFieldError(field, 'هذا الحقل مطلوب');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    validateEmail(emailField) {
        const email = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            this.showFieldError(emailField, 'البريد الإلكتروني غير صحيح');
            return false;
        }

        this.clearFieldError(emailField);
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('is-invalid');
        const errorDiv = field.parentNode.querySelector('.invalid-feedback');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleProfileUpdate(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Validate all fields
        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required], textarea[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        if (!isValid) {
            this.showNotification('يرجى تصحيح الأخطاء قبل المتابعة', 'error');
            return;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري الحفظ...';
            submitBtn.disabled = true;

            // Submit form normally (WordPress will handle the processing)
            form.submit();
            
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            this.showNotification('حدث خطأ في تحديث الملف الشخصي', 'error');
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        const currentPassword = formData.get('current_password');
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('confirm_password');

        // Validate passwords
        if (newPassword !== confirmPassword) {
            this.showNotification('كلمة المرور الجديدة وتأكيدها غير متطابقتين', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري التغيير...';
            submitBtn.disabled = true;

            // Submit form normally (WordPress will handle the processing)
            form.submit();
            
        } catch (error) {
            console.error('❌ Error changing password:', error);
            this.showNotification('حدث خطأ في تغيير كلمة المرور', 'error');
        }
    }


    // Utility methods
    showLoadingState(container, message) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="loading-spinner"></div>
                <p class="mt-3 text-muted">${message}</p>
            </div>
        `;
    }

    showErrorMessage(container, message) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="text-danger">${message}</h5>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';

        const notification = document.createElement('div');
        notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedAccount = new EnhancedAccount();
});

// Export for global access
window.EnhancedAccount = EnhancedAccount;
