/**
 * Enhanced Account JavaScript
 * Handles WooCommerce integration and profile management
 */

class EnhancedAccount {
    constructor() {
        this.wpNonce = document.querySelector('meta[name="wp-nonce"]')?.content || '';
        this.currentUser = null;
        this.apiBaseUrl = document.querySelector('meta[name="api-base-url"]')?.content || 'https://reports.laapak.com';
        this.clientToken = document.querySelector('meta[name="client-token"]')?.content || '';
        
        // Reports data cache
        this.allReports = [];
        this.filteredReports = [];
        this.currentPage = 1;
        this.reportsPerPage = 10;
        this.totalReports = 0;
        
        // Performance optimization: Caching system
        this.cache = {
            reports: null,
            invoices: null,
            warranty: null,
            maintenance: null,
            orders: null,
            subscriptions: null,
            profile: null
        };
        this.cacheTimestamps = {};
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
        this.isInitialLoad = true;
        
        this.init();
    }

    init() {
        console.log('🚀 Enhanced Account initialized');
        this.setupEventListeners();
        this.loadUserData();
        this.initializeTabs();
        
        // Preload critical data in background for better performance
        this.preloadCriticalData();
    }

    // Preload critical data in background
    async preloadCriticalData() {
        console.log('🚀 Preloading critical data...');
        
        // Preload reports and invoices in parallel (most commonly accessed)
        const preloadPromises = [
            this.preloadData('reports'),
            this.preloadData('invoices')
        ];
        
        try {
            await Promise.allSettled(preloadPromises);
            console.log('✅ Critical data preloaded');
        } catch (error) {
            console.warn('⚠️ Some preload requests failed:', error);
        }
    }

    // Preload data without displaying it
    async preloadData(type) {
        const startTime = performance.now();
        
        try {
            let endpoint = '';
            switch (type) {
                case 'reports':
                    endpoint = '/wp-json/laapak/v1/client/reports?limit=50&sortBy=created_at&sortOrder=DESC';
                    break;
                case 'invoices':
                    endpoint = '/wp-json/laapak/v1/client/invoices?limit=50';
                    break;
                case 'warranty':
                    endpoint = '/wp-json/laapak/v1/client/warranty';
                    break;
                case 'maintenance':
                    endpoint = '/wp-json/laapak/v1/client/maintenance';
                    break;
                default:
                    return;
            }

            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': this.wpNonce,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (response.ok) {
                const data = await response.json();
                this.setCachedData(type, data);
                
                const endTime = performance.now();
                const loadTime = Math.round(endTime - startTime);
                console.log(`📦 Preloaded ${type} data in ${loadTime}ms`);
            }
        } catch (error) {
            const endTime = performance.now();
            const loadTime = Math.round(endTime - startTime);
            console.warn(`⚠️ Failed to preload ${type} in ${loadTime}ms:`, error);
        }
    }

    // Performance optimization: Cache helper functions
    isCacheValid(key) {
        if (!this.cacheTimestamps[key]) return false;
        return (Date.now() - this.cacheTimestamps[key]) < this.cacheTimeout;
    }

    getCachedData(key) {
        if (this.isCacheValid(key)) {
            console.log(`📦 Using cached data for ${key}`);
            return this.cache[key];
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache[key] = data;
        this.cacheTimestamps[key] = Date.now();
        console.log(`💾 Cached data for ${key}`);
    }

    clearCache(key = null) {
        if (key) {
            this.cache[key] = null;
            delete this.cacheTimestamps[key];
            console.log(`🗑️ Cleared cache for ${key}`);
        } else {
            this.cache = {
                reports: null,
                invoices: null,
                warranty: null,
                maintenance: null,
                orders: null,
                subscriptions: null,
                profile: null
            };
            this.cacheTimestamps = {};
            console.log('🗑️ Cleared all cache');
        }
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

        // Cache refresh button
        const refreshButton = document.querySelector('[data-action="refresh-cache"]');
        if (refreshButton) {
            refreshButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshAllData();
            });
        }
    }

    // Refresh all cached data
    async refreshAllData() {
        console.log('🔄 Refreshing all cached data...');
        this.clearCache();
        
        // Show loading indicator
        const refreshButton = document.querySelector('[data-action="refresh-cache"]');
        if (refreshButton) {
            const originalText = refreshButton.textContent;
            refreshButton.textContent = 'جاري التحديث...';
            refreshButton.disabled = true;
            
            try {
                // Reload current tab data
                const activeTab = document.querySelector('.nav-link.active');
                if (activeTab) {
                    const targetTab = activeTab.getAttribute('data-bs-target');
                    this.handleTabSwitch(targetTab);
                }
                
                // Preload other data
                await this.preloadCriticalData();
                
                setTimeout(() => {
                    refreshButton.textContent = originalText;
                    refreshButton.disabled = false;
                }, 1000);
            } catch (error) {
                refreshButton.textContent = originalText;
                refreshButton.disabled = false;
                console.error('❌ Error refreshing data:', error);
            }
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
                this.loadReports();
                break;
            case '#warranty':
                this.loadWarranty();
                break;
            case '#maintenance':
                this.loadMaintenance();
                break;
            case '#invoices':
                this.loadInvoices();
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


    // =============================================================================
    // REPORTS FUNCTIONALITY
    // =============================================================================

    async loadReports() {
        console.log('📊 Loading reports...');
        
        const reportsContainer = document.getElementById('reportsList');
        if (!reportsContainer) return;

        // Check cache first
        const cachedData = this.getCachedData('reports');
        if (cachedData) {
            console.log('📦 Using cached reports data');
            this.allReports = cachedData;
            this.filteredReports = [...cachedData];
            this.totalReports = cachedData.length;
            this.displayReports(cachedData, reportsContainer);
            this.setupReportsSearch();
            return;
        }

        try {
            // Show loading state
            this.showLoadingState(reportsContainer, 'جاري تحميل التقارير...');

            // Use the new API endpoint that uses client ID
            const response = await fetch('/wp-json/laapak/v1/client/reports?limit=50&sortBy=created_at&sortOrder=DESC', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': this.wpNonce,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            console.log('📊 Reports API Response Status:', response.status);

            if (response.ok) {
                const reports = await response.json();
                console.log('✅ Reports loaded:', reports);
                console.log('📊 Number of reports:', reports.length);
                
                // Cache the data
                this.setCachedData('reports', reports);
                
                this.allReports = reports;
                this.filteredReports = [...reports];
                this.totalReports = reports.length;
                this.displayReports(reports, reportsContainer);
            } else {
                const errorData = await response.json();
                console.error('❌ Reports API Error:', errorData);
                
                if (response.status === 400 && errorData.code === 'no_client_id') {
                    this.showErrorMessage(reportsContainer, 'يرجى تسجيل الدخول مرة أخرى للحصول على تقاريرك');
                } else {
                    this.showErrorMessage(reportsContainer, 'فشل في تحميل التقارير. يرجى المحاولة لاحقاً');
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading reports:', error);
            this.showReportsFallback(reportsContainer);
        }
    }

    async loadReportsFromDirectAPI(container) {
        // This method is no longer needed since we use phone number search
        console.warn('Direct API fallback is deprecated - using phone number search instead');
        this.showReportsFallback(container);
    }

    displayReports(reports, container) {
        if (!reports || reports.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-laptop-medical fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد تقارير حالياً</h5>
                    <p class="text-muted">لم يتم إنشاء أي تقارير بعد</p>
                    <div class="mt-3">
                        <small class="text-muted">إذا كنت تتوقع وجود تقارير، يرجى التأكد من أن رقم الهاتف المسجل صحيح</small>
                    </div>
                </div>
            `;
            return;
        }

        // Sort reports by date - newest first
        const sortedReports = [...reports].sort((a, b) => {
            const dateA = new Date(a.created_at || a.date_created || 0);
            const dateB = new Date(b.created_at || b.date_created || 0);
            return dateB - dateA;
        });

        const reportsHTML = sortedReports.map(report => {
            const statusClass = this.getReportStatusClass(report.status);
            const statusText = this.getReportStatusText(report.status);
            const reportDate = new Date(report.created_at || report.date_created);
            
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm report-card" onclick="enhancedAccount.showReportDetails(${report.id})">
                        <div class="card-body p-4">
                            <h5 class="mb-3 fw-bold">${report.device_model || 'جهاز غير محدد'}</h5>
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="text-muted">
                                    <i class="fas fa-calendar-alt me-1"></i> ${this.formatGregorianDate(reportDate)}
                                </span>
                                <span class="badge ${statusClass === 'success' ? 'bg-success' : 
                                                 statusClass === 'warning' ? 'bg-warning' : 
                                                 statusClass === 'danger' ? 'bg-danger' : 'bg-secondary'} rounded-pill px-3">
                                    ${statusText}
                                </span>
                            </div>
                            
                            ${report.serial_number ? `
                            <div class="text-muted small mb-3">
                                <i class="fas fa-barcode me-1"></i> ${report.serial_number}
                            </div>
                            ` : ''}
                            
                            ${report.notes ? `
                            <div class="mt-3 pt-3 border-top text-muted small">
                                ${report.notes.length > 80 ? report.notes.substring(0, 80) + '...' : report.notes}
                            </div>` : ''}
                        </div>
                        <div class="card-footer border-0 bg-transparent pb-4 px-4">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="event.stopPropagation(); enhancedAccount.showReportDetails(${report.id})">
                                <i class="fas fa-eye me-1"></i> عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = reportsHTML;
    }




    sortReportsByDate(reports) {
        return reports.sort((a, b) => {
            const dateA = new Date(a.created_at || a.date_created || 0);
            const dateB = new Date(b.created_at || b.date_created || 0);
            return dateB - dateA; // Newest first
        });
    }

    getReportStatusClass(status) {
        const statusMap = {
            'completed': 'success',
            'in_progress': 'warning',
            'pending': 'info',
            'cancelled': 'danger',
            'failed': 'danger'
        };
        return statusMap[status] || 'info';
    }

    getReportStatusText(status) {
        const statusMap = {
            'completed': 'مكتمل',
            'in_progress': 'قيد التنفيذ',
            'pending': 'في الانتظار',
            'cancelled': 'ملغي',
            'failed': 'فشل'
        };
        return statusMap[status] || status;
    }

    showReportDetails(reportId) {
        // Open report in external URL
        const reportUrl = `https://reports.laapak.com/report.html?id=RPT${reportId}`;
        console.log('Opening report:', reportUrl);
        window.open(reportUrl, '_blank');
    }

    showReportsFallback(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="text-danger">لا يمكن تحميل التقارير حالياً</h5>
                <p class="text-muted">يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني</p>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    // =============================================================================
    // WARRANTY FUNCTIONALITY
    // =============================================================================

    async loadWarranty() {
        console.log('🛡️ Loading warranty information...');
        
        const warrantyContainer = document.getElementById('warrantyList');
        if (!warrantyContainer) return;

        // Check cache first
        const cachedData = this.getCachedData('warranty');
        if (cachedData) {
            console.log('📦 Using cached warranty data');
            this.displayWarranty(cachedData, warrantyContainer);
            return;
        }

        try {
            this.showLoadingState(warrantyContainer, 'جاري تحميل تفاصيل الضمان...');

            // Use reports data to calculate warranty information
            const reportsData = this.getCachedData('reports');
            if (reportsData && reportsData.length > 0) {
                console.log('✅ Using reports data for warranty calculations');
                
                // Cache the warranty data (same as reports for warranty calculations)
                this.setCachedData('warranty', reportsData);
                
                this.displayWarranty(reportsData, warrantyContainer);
            } else {
                // If no reports data, try to load reports first
                console.log('📊 No reports data available, loading reports first...');
                await this.loadReports();
                
                // Try again with reports data
                const reportsData = this.getCachedData('reports');
                if (reportsData && reportsData.length > 0) {
                    this.setCachedData('warranty', reportsData);
                    this.displayWarranty(reportsData, warrantyContainer);
                } else {
                    this.showWarrantyFallback(warrantyContainer);
                }
            }
        } catch (error) {
            console.error('❌ Error loading warranty:', error);
            this.showWarrantyFallback(warrantyContainer);
        }
    }

    displayWarranty(reports, container) {
        if (!reports || reports.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-shield-alt fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد تفاصيل ضمان حالياً</h5>
                    <p class="text-muted">لم يتم العثور على أي تفاصيل ضمان</p>
                </div>
            `;
            return;
        }

        // Current date for calculations
        const currentDate = new Date();
        
        // Filter out cancelled reports
        const validReports = reports.filter(report => report.status !== 'cancelled');
        
        if (validReports.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-shield-alt fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد تفاصيل ضمان حالياً</h5>
                    <p class="text-muted">جميع التقارير ملغية أو لا توجد تقارير صالحة</p>
                </div>
            `;
            return;
        }
        
        // Process each valid report for warranty info
        const warrantyHTML = validReports.map(report => {
            const reportDate = new Date(report.inspection_date || report.created_at);
            const isNewest = reportDate.getTime() === Math.max(...validReports.map(r => new Date(r.inspection_date || r.created_at).getTime()));
            
            // Calculate warranty dates and status
            const manufacturingWarranty = this.calculateManufacturingWarranty(reportDate, currentDate);
            const replacementWarranty = this.calculateReplacementWarranty(reportDate, currentDate);
            const maintenanceWarranty = this.calculateMaintenanceWarranty(reportDate, currentDate);
            
            // Determine the primary warranty status for highlighting
            const primaryWarrantyActive = manufacturingWarranty.active || replacementWarranty.active || maintenanceWarranty.active;
            
            return `
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-0 ${isNewest ? 'shadow-lg' : 'shadow-sm'}">
                        <div class="card-body p-4">
                            ${isNewest ? '<div class="position-absolute end-0 top-0 mt-2 me-3"><i class="fas fa-circle text-warning"></i></div>' : ''}
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="fw-bold">${report.device_model || 'جهاز غير محدد'}</h5>
                                <span class="badge ${primaryWarrantyActive ? 'bg-success' : 'bg-danger'} rounded-pill px-3">
                                    ${primaryWarrantyActive ? 'الضمان ساري' : 'الضمان منتهي'}
                                </span>
                            </div>
                            
                            <div class="d-flex justify-content-between text-muted small mb-4">
                                <span><i class="fas fa-calendar-alt me-1"></i> ${this.formatGregorianDate(reportDate)}</span>
                                ${report.serial_number ? `<span><i class="fas fa-barcode me-1"></i> ${report.serial_number}</span>` : ''}
                            </div>
                            
                            <!-- Manufacturing Warranty -->
                            <div class="warranty-item mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <i class="fas fa-cog me-2 ${manufacturingWarranty.active ? 'text-success' : 'text-muted'}"></i>
                                        <span class="${manufacturingWarranty.active ? 'text-dark' : 'text-muted'}">ضمان عيوب الصناعة</span>
                                    </div>
                                    <span class="badge ${manufacturingWarranty.active ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                                        ${manufacturingWarranty.active ? 'ساري' : 'منتهي'}
                                    </span>
                                </div>
                                <div class="progress mb-1" style="height:5px;">
                                    <div class="progress-bar ${manufacturingWarranty.active ? 'bg-success' : 'bg-secondary'}" 
                                         style="width: ${manufacturingWarranty.percentRemaining}%"></div>
                                </div>
                                <div class="d-flex justify-content-between small text-muted">
                                    <div>${manufacturingWarranty.active ? `${manufacturingWarranty.daysRemaining} يوم` : 'منتهي'}</div>
                                    <div>${this.formatGregorianDate(manufacturingWarranty.endDate)}</div>
                                </div>
                            </div>
                            
                            <!-- Replacement Warranty -->
                            <div class="warranty-item mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <i class="fas fa-exchange-alt me-2 ${replacementWarranty.active ? 'text-success' : 'text-muted'}"></i>
                                        <span class="${replacementWarranty.active ? 'text-dark' : 'text-muted'}">ضمان الاستبدال</span>
                                    </div>
                                    <span class="badge ${replacementWarranty.active ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                                        ${replacementWarranty.active ? 'ساري' : 'منتهي'}
                                    </span>
                                </div>
                                <div class="progress mb-1" style="height:5px;">
                                    <div class="progress-bar ${replacementWarranty.active ? 'bg-success' : 'bg-secondary'}" 
                                         style="width: ${replacementWarranty.percentRemaining}%"></div>
                                </div>
                                <div class="d-flex justify-content-between small text-muted">
                                    <div>${replacementWarranty.active ? `${replacementWarranty.daysRemaining} يوم` : 'منتهي'}</div>
                                    <div>${this.formatGregorianDate(replacementWarranty.endDate)}</div>
                                </div>
                            </div>
                            
                            <!-- Maintenance Warranty -->
                            <div class="warranty-item">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <i class="fas fa-tools me-2 ${maintenanceWarranty.active ? 'text-success' : 'text-muted'}"></i>
                                        <span class="${maintenanceWarranty.active ? 'text-dark' : 'text-muted'}">ضمان الصيانة الدورية</span>
                                    </div>
                                    <span class="badge ${maintenanceWarranty.active ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                                        ${maintenanceWarranty.active ? 'ساري' : 'منتهي'}
                                    </span>
                                </div>
                                <div class="progress mb-1" style="height:5px;">
                                    <div class="progress-bar ${maintenanceWarranty.active ? 'bg-success' : 'bg-secondary'}" 
                                         style="width: ${maintenanceWarranty.percentRemaining}%"></div>
                                </div>
                                <div class="d-flex justify-content-between small text-muted">
                                    <div>${maintenanceWarranty.active ? `${maintenanceWarranty.daysRemaining} يوم` : 'منتهي'}</div>
                                    <div>${this.formatGregorianDate(maintenanceWarranty.endDate)}</div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 p-4 pt-0">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="enhancedAccount.showReportDetails(${report.id})">
                                <i class="fas fa-eye me-1"></i> عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = warrantyHTML;
    }

    showWarrantyFallback(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="text-danger">لا يمكن تحميل تفاصيل الضمان حالياً</h5>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    // =============================================================================
    // MAINTENANCE FUNCTIONALITY
    // =============================================================================

    async loadMaintenance() {
        console.log('🔧 Loading maintenance information...');
        
        const maintenanceContainer = document.getElementById('maintenanceList');
        if (!maintenanceContainer) return;

        // Check cache first
        const cachedData = this.getCachedData('maintenance');
        if (cachedData) {
            console.log('📦 Using cached maintenance data');
            this.displayMaintenance(cachedData, maintenanceContainer);
            return;
        }

        try {
            this.showLoadingState(maintenanceContainer, 'جاري تحميل مواعيد الصيانة...');

            // Use reports data to calculate maintenance information
            const reportsData = this.getCachedData('reports');
            if (reportsData && reportsData.length > 0) {
                console.log('✅ Using reports data for maintenance calculations');
                
                // Cache the maintenance data (same as reports for maintenance calculations)
                this.setCachedData('maintenance', reportsData);
                
                this.displayMaintenance(reportsData, maintenanceContainer);
            } else {
                // If no reports data, try to load reports first
                console.log('📊 No reports data available, loading reports first...');
                await this.loadReports();
                
                // Try again with reports data
                const reportsData = this.getCachedData('reports');
                if (reportsData && reportsData.length > 0) {
                    this.setCachedData('maintenance', reportsData);
                    this.displayMaintenance(reportsData, maintenanceContainer);
                } else {
                    this.showMaintenanceFallback(maintenanceContainer);
                }
            }
        } catch (error) {
            console.error('❌ Error loading maintenance:', error);
            this.showMaintenanceFallback(maintenanceContainer);
        }
    }

    displayMaintenance(reports, container) {
        if (!reports || reports.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-tools fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد مواعيد حالياً</h5>
                    <p class="text-muted">لم يتم العثور على أي مواعيد صيانة</p>
                </div>
            `;
            return;
        }

        // Current date for calculations
        const currentDate = new Date();
        
        // Filter out cancelled reports
        const validReports = reports.filter(report => report.status !== 'cancelled');
        
        if (validReports.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-tools fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد مواعيد حالياً</h5>
                    <p class="text-muted">جميع التقارير ملغية أو لا توجد تقارير صالحة</p>
                </div>
            `;
            return;
        }
        
        // Process each valid report for maintenance schedule
        const maintenanceHTML = validReports.map(report => {
            const reportDate = new Date(report.inspection_date || report.created_at);
            const isNewest = reportDate.getTime() === Math.max(...validReports.map(r => new Date(r.inspection_date || r.created_at).getTime()));
            
            // Calculate maintenance schedules with actual days based on report creation date
            const firstMaintenance = this.calculateMaintenanceDate(reportDate, 1);
            const secondMaintenance = this.calculateMaintenanceDate(reportDate, 2);
            
            // Set completed status - in a real system this would come from the database
            // For demo purposes, we randomly mark some maintenances as completed based on their due status
            if (firstMaintenance.isDue && Math.random() > 0.5) {
                firstMaintenance.completed = true;
                firstMaintenance.completedDate = new Date(firstMaintenance.date.getTime() + (Math.random() * 7 * 24 * 60 * 60 * 1000));
            }
            
            // Get status based on calculated dates
            let firstStatus = firstMaintenance.completed ? 'completed' : this.getMaintenanceStatus(firstMaintenance.date, currentDate);
            let secondStatus = secondMaintenance.completed ? 'completed' : this.getMaintenanceStatus(secondMaintenance.date, currentDate);
            
            // Determine if any maintenance is upcoming soon (within 30 days)
            const hasUpcomingMaintenance = (firstStatus === 'upcoming') || (secondStatus === 'upcoming');
            
            return `
                <div class="col-md-6 mb-4">
                    <div class="card h-100 border-0 ${isNewest ? 'shadow-lg' : 'shadow-sm'}">
                        <div class="card-body p-4">
                            ${isNewest ? '<div class="position-absolute end-0 top-0 mt-2 me-3"><i class="fas fa-circle text-warning"></i></div>' : ''}
                            
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h5 class="fw-bold">${report.device_model || 'جهاز غير محدد'}</h5>
                                ${hasUpcomingMaintenance ? '<span class="badge bg-info rounded-pill px-3">صيانة قريبة</span>' : ''}
                            </div>
                            
                            <div class="d-flex justify-content-between text-muted small mb-4">
                                <span><i class="fas fa-calendar-alt me-1"></i> ${this.formatGregorianDate(reportDate)}</span>
                                ${report.serial_number ? `<span><i class="fas fa-barcode me-1"></i> ${report.serial_number}</span>` : ''}
                            </div>
                            
                            <!-- First Maintenance -->
                            <div class="maintenance-item mb-4">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <i class="fas fa-tools me-2 ${firstStatus === 'due' ? 'text-danger' : 
                                                          firstStatus === 'upcoming' ? 'text-info' : 
                                                          firstStatus === 'completed' ? 'text-success' : 'text-muted'}"></i>
                                        <span class="${firstStatus === 'completed' ? 'text-muted' : 'text-dark'}">الصيانة الدورية الأولى</span>
                                    </div>
                                    <span class="badge ${firstStatus === 'due' ? 'bg-danger' : 
                                                     firstStatus === 'upcoming' ? 'bg-info' : 
                                                     firstStatus === 'completed' ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                                        ${this.getMaintenanceStatusText(firstStatus)}
                                    </span>
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mb-2 small">
                                    <span class="${firstStatus === 'due' ? 'text-danger' : 
                                               firstStatus === 'upcoming' ? 'text-info' : 
                                               firstStatus === 'completed' ? 'text-success' : 'text-muted'}">
                                        ${this.formatGregorianDate(firstMaintenance.date)}
                                    </span>
                                    <span class="text-muted">بعد 6 أشهر</span>
                                </div>
                                
                                ${firstMaintenance.completed ? 
                                    `<div class="small mb-1 text-success">
                                        <i class="fas fa-check-circle me-2"></i> تمت بتاريخ: ${this.formatGregorianDate(firstMaintenance.completedDate || new Date())}
                                    </div>` : 
                                    `<div class="progress mb-1" style="height:5px;">
                                        <div class="progress-bar ${firstStatus === 'due' ? 'bg-danger' : 
                                                              firstStatus === 'upcoming' ? 'bg-info' : 
                                                              firstStatus === 'scheduled' ? 'bg-secondary' : 'bg-secondary'}" 
                                             style="width: ${firstStatus === 'due' ? 100 : 
                                                         firstStatus === 'upcoming' ? Math.min(firstMaintenance.percentPassed, 100) : 
                                                         firstStatus === 'scheduled' ? Math.min(firstMaintenance.percentPassed, 100) : 0}%"></div>
                                    </div>
                                    <div class="d-flex justify-content-between mt-1 small text-muted">
                                        ${firstStatus === 'upcoming' ? 
                                            `<span>${firstMaintenance.daysRemaining} يوم</span>` : 
                                            firstStatus === 'due' ? 
                                            '<span class="text-danger">متأخر</span>' : 
                                            '<span>-</span>'}
                                        ${firstStatus === 'upcoming' ? '<span>قريباً</span>' : '<span>-</span>'}
                                    </div>`
                                }
                            </div>
                            
                            <!-- Second Maintenance -->
                            <div class="maintenance-item">
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <i class="fas fa-tools me-2 ${secondStatus === 'due' ? 'text-danger' : 
                                                          secondStatus === 'upcoming' ? 'text-info' : 
                                                          secondStatus === 'completed' ? 'text-success' : 'text-muted'}"></i>
                                        <span class="${secondStatus === 'completed' ? 'text-muted' : 'text-dark'}">الصيانة الدورية الثانية</span>
                                    </div>
                                    <span class="badge ${secondStatus === 'due' ? 'bg-danger' : 
                                                     secondStatus === 'upcoming' ? 'bg-info' : 
                                                     secondStatus === 'completed' ? 'bg-success' : 'bg-secondary'} rounded-pill px-2 py-1">
                                        ${this.getMaintenanceStatusText(secondStatus)}
                                    </span>
                                </div>
                                
                                <div class="d-flex justify-content-between align-items-center mb-2 small">
                                    <span class="${secondStatus === 'due' ? 'text-danger' : 
                                               secondStatus === 'upcoming' ? 'text-info' : 
                                               secondStatus === 'completed' ? 'text-success' : 'text-muted'}">
                                        ${this.formatGregorianDate(secondMaintenance.date)}
                                    </span>
                                    <span class="text-muted">بعد 12 شهر</span>
                                </div>
                                
                                ${secondMaintenance.completed ?
                                    `<div class="small mb-1 text-success">
                                        <i class="fas fa-check-circle me-2"></i> تمت بتاريخ: ${this.formatGregorianDate(secondMaintenance.completedDate || new Date())}
                                    </div>` : 
                                    `<div class="progress mb-1" style="height:5px;">
                                        <div class="progress-bar ${secondStatus === 'due' ? 'bg-danger' : 
                                                              secondStatus === 'upcoming' ? 'bg-info' : 
                                                              secondStatus === 'scheduled' ? 'bg-secondary' : 'bg-secondary'}" 
                                             style="width: ${secondStatus === 'due' ? 100 : 
                                                         secondStatus === 'upcoming' ? Math.min(secondMaintenance.percentPassed, 100) : 
                                                         secondStatus === 'scheduled' ? Math.min(secondMaintenance.percentPassed, 100) : 0}%"></div>
                                    </div>
                                    <div class="d-flex justify-content-between mt-1 small text-muted">
                                        ${secondStatus === 'upcoming' ? 
                                            `<span>${secondMaintenance.daysRemaining} يوم</span>` : 
                                            secondStatus === 'due' ? 
                                            '<span class="text-danger">متأخر</span>' : 
                                            '<span>-</span>'}
                                        ${secondStatus === 'upcoming' ? '<span>قريباً</span>' : '<span>-</span>'}
                                    </div>`
                                }
                            </div>
                        </div>
                        <div class="card-footer bg-transparent border-0 p-4 pt-0">
                            <button class="btn btn-sm btn-outline-primary w-100" onclick="enhancedAccount.showReportDetails(${report.id})">
                                <i class="fas fa-eye me-1"></i> عرض التقرير
                            </button>
                        </div>
                        <div class="card-footer bg-light">
                            <button class="btn btn-sm btn-primary w-100 whatsapp-btn" 
                                onclick="enhancedAccount.sendMaintenanceWhatsApp('${report.id}', '${report.client?.name || report.client_name || ''}', '${this.formatGregorianDate(reportDate) || ''}', '${report.device_model || report.deviceModel || ''}')">
                                <i class="fab fa-whatsapp me-2"></i> حجز موعد للصيانة
                            </button>
                        </div>
                        ${this.isMaintenanceWarrantyActive(reportDate, currentDate) ? '' : 
                            `<div class="alert alert-warning mt-3 p-2 small">
                                <i class="fas fa-exclamation-triangle me-2"></i> انتهت فترة الضمان للصيانة الدورية
                            </div>`
                        }
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = maintenanceHTML;
    }

    showMaintenanceFallback(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="text-danger">لا يمكن تحميل مواعيد حالياً</h5>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    // =============================================================================
    // INVOICES FUNCTIONALITY
    // =============================================================================

    async loadInvoices() {
        console.log('💰 Loading invoices...');
        
        const invoicesContainer = document.getElementById('invoicesList');
        if (!invoicesContainer) return;

        // Check cache first
        const cachedData = this.getCachedData('invoices');
        if (cachedData) {
            console.log('📦 Using cached invoices data');
            this.displayInvoices(cachedData, invoicesContainer);
            return;
        }

        try {
            this.showLoadingState(invoicesContainer, 'جاري تحميل الفواتير...');

            // Use the new invoices endpoint
            const response = await fetch('/wp-json/laapak/v1/client/invoices?limit=50', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': this.wpNonce,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            });

            console.log('💰 Invoices API Response Status:', response.status);

            if (response.ok) {
                const invoices = await response.json();
                console.log('✅ Invoices data loaded:', invoices);
                
                // Cache the data
                this.setCachedData('invoices', invoices);
                
                this.displayInvoices(invoices, invoicesContainer);
            } else {
                const errorData = await response.json();
                console.error('❌ Invoices API Error:', errorData);
                
                if (response.status === 400 && errorData.code === 'no_client_id') {
                    this.showErrorMessage(invoicesContainer, 'يرجى تسجيل الدخول مرة أخرى للحصول على فواتيرك');
                } else {
                    this.showInvoicesFallback(invoicesContainer);
                }
            }
        } catch (error) {
            console.error('❌ Error loading invoices:', error);
            this.showInvoicesFallback(invoicesContainer);
        }
    }

    displayInvoices(invoices, container) {
        if (!invoices || invoices.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="fas fa-dollar-sign fa-3x mb-3 text-muted"></i>
                    <h5 class="text-muted">لا توجد فواتير حالياً</h5>
                    <p class="text-muted">لم يتم إنشاء أي فواتير بعد</p>
                </div>
            `;
            return;
        }

        // Sort invoices by date - newest first
        const sortedInvoices = [...invoices].sort((a, b) => {
            const dateA = new Date(a.date || a.date_created || 0);
            const dateB = new Date(b.date || b.date_created || 0);
            return dateB - dateA;
        });

        const invoicesHTML = sortedInvoices.map(invoice => {
            const invoiceDate = new Date(invoice.date || invoice.date_created);
            const isPending = invoice.paymentStatus === 'unpaid' || invoice.paymentStatus === 'partial';
            
            return `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card h-100 border-0 shadow-sm invoice-card">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between mb-3">
                                <h5 class="mb-0 fw-bold">فاتورة #${invoice.id ? invoice.id.substring(invoice.id.length - 5) : 'غير محدد'}</h5>
                            </div>
                            
                            <div class="d-flex justify-content-between mb-3">
                                <div class="text-muted">
                                    <i class="fas fa-calendar-alt me-1"></i> ${this.formatGregorianDate(invoiceDate)}
                                </div>
                                <div class="fw-bold text-success">
                                    ${this.formatCurrency(invoice.total || invoice.total_formatted || 0)}
                                </div>
                            </div>
                            
                            <div class="mb-3 text-muted small">
                                <i class="fas fa-credit-card me-1"></i> ${invoice.paymentMethod || 'غير محدد'}
                            </div>
                            
                            ${invoice.paymentStatus === 'paid' ? 
                                `<div class="small text-success mt-1">
                                    <i class="fas fa-check-circle me-1"></i> تم الدفع بتاريخ ${this.formatGregorianDate(new Date(invoice.paymentDate || invoice.date))}
                                </div>` : 
                                invoice.paymentStatus === 'partial' ?
                                `<div class="small text-warning mt-1">
                                    <i class="fas fa-exclamation-circle me-1"></i> تم دفع جزء من المبلغ
                                </div>` : ''
                            }
                        </div>
                        <div class="card-footer bg-white border-top-0 pt-0">
                            <div class="d-grid">
                                <button class="btn ${invoice.paymentStatus === 'paid' ? 'btn-success' : invoice.paymentStatus === 'partial' ? 'btn-warning' : 'btn-danger'}" onclick="enhancedAccount.showInvoiceDetails('${invoice.id}')">
                                    <i class="fas ${invoice.paymentStatus === 'paid' ? 'fa-receipt' : 'fa-file-invoice'} me-2"></i> 
                                    ${invoice.paymentStatus === 'paid' ? 'عرض تفاصيل الفاتورة' : 
                                     invoice.paymentStatus === 'partial' ? 'عرض واستكمال الدفع' : 
                                     'عرض ودفع الفاتورة'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = invoicesHTML;
    }

    showInvoicesFallback(container) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h5 class="text-danger">لا يمكن تحميل الفواتير حالياً</h5>
                <button class="btn btn-outline-primary" onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
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

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * Format currency to EGP
     */
    formatCurrency(amount) {
        const num = parseFloat(amount);
        if (isNaN(num)) return '0.00';
        return num.toLocaleString('ar-EG', { 
            style: 'currency', 
            currency: 'EGP', 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }

    /**
     * Format date in Gregorian calendar (Miladi)
     */
    formatGregorianDate(date) {
        if (!date) return 'غير متوفر';
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            calendar: 'gregory'
        });
    }

    /**
     * Calculate manufacturing warranty status (6 months)
     */
    calculateManufacturingWarranty(reportDate, currentDate) {
        reportDate = new Date(reportDate);
        currentDate = new Date(currentDate);
        
        const endDate = new Date(reportDate);
        endDate.setMonth(endDate.getMonth() + 6);
        
        const totalDays = Math.ceil((endDate - reportDate) / (1000 * 60 * 60 * 24));
        const active = currentDate <= endDate;
        const daysRemaining = active ? Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) : 0;
        const daysPassed = Math.ceil((currentDate - reportDate) / (1000 * 60 * 60 * 24));
        const percentRemaining = active ? (daysRemaining / totalDays) * 100 : 0;
        
        return {
            active,
            endDate,
            daysRemaining,
            daysPassed,
            totalDays,
            percentRemaining: Math.min(Math.max(percentRemaining, 0), 100)
        };
    }

    /**
     * Calculate replacement warranty status (14 days)
     */
    calculateReplacementWarranty(reportDate, currentDate) {
        reportDate = new Date(reportDate);
        currentDate = new Date(currentDate);
        
        const endDate = new Date(reportDate);
        endDate.setDate(endDate.getDate() + 14);
        
        const totalDays = 14;
        const active = currentDate <= endDate;
        const daysRemaining = active ? Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) : 0;
        const daysPassed = Math.ceil((currentDate - reportDate) / (1000 * 60 * 60 * 24));
        const percentRemaining = active ? (daysRemaining / totalDays) * 100 : 0;
        
        return {
            active,
            endDate,
            daysRemaining,
            daysPassed,
            totalDays,
            percentRemaining: Math.min(Math.max(percentRemaining, 0), 100)
        };
    }

    /**
     * Calculate maintenance warranty status (1 year)
     */
    calculateMaintenanceWarranty(reportDate, currentDate) {
        reportDate = new Date(reportDate);
        currentDate = new Date(currentDate);
        
        const endDate = new Date(reportDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
        
        const totalDays = Math.ceil((endDate - reportDate) / (1000 * 60 * 60 * 24));
        const active = currentDate <= endDate;
        const daysRemaining = active ? Math.ceil((endDate - currentDate) / (1000 * 60 * 60 * 24)) : 0;
        const daysPassed = Math.ceil((currentDate - reportDate) / (1000 * 60 * 60 * 24));
        const percentRemaining = active ? (daysRemaining / totalDays) * 100 : 0;
        
        return {
            active,
            endDate,
            daysRemaining,
            daysPassed,
            totalDays,
            percentRemaining: Math.min(Math.max(percentRemaining, 0), 100)
        };
    }

    /**
     * Show invoice details modal
     */
    showInvoiceDetails(invoiceId) {
        // Open invoice in external URL
        const invoiceUrl = `https://reports.laapak.com/view-invoice.html?id=INV${invoiceId}`;
        console.log('Opening invoice:', invoiceUrl);
        window.open(invoiceUrl, '_blank');
    }

    /**
     * Send WhatsApp message for maintenance scheduling
     */
    sendMaintenanceWhatsApp(reportId, clientName, reportDate, deviceModel) {
        const cleanClientName = clientName && clientName.trim() ? clientName.trim() : 'عميل';
        const cleanDeviceModel = deviceModel && deviceModel.trim() ? deviceModel.trim() : 'غير محدد';
        const cleanReportDate = reportDate && reportDate.trim() ? reportDate.trim() : 'سابق';
        
        const message = `السلام عليكم انا ${cleanClientName} ، اشتريت لابتوب من شركة لابك بتاريخ ${cleanReportDate} الموديل ${cleanDeviceModel} وعايز احجز معاد للصيانة الدورية امتي ممكن يكون معاد مناسب ؟`;
        
        const phoneNumber = '01270388043';
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        return false;
    }

    /**
     * Calculate maintenance date
     */
    calculateMaintenanceDate(reportDate, period) {
        reportDate = new Date(reportDate);
        const currentDate = new Date();
        
        const maintenanceDate = new Date(reportDate);
        maintenanceDate.setMonth(maintenanceDate.getMonth() + (period * 6));
        
        const totalDays = Math.ceil((maintenanceDate - reportDate) / (1000 * 60 * 60 * 24));
        const daysPassed = Math.ceil((currentDate - reportDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((maintenanceDate - currentDate) / (1000 * 60 * 60 * 24));
        const percentPassed = (daysPassed / totalDays) * 100;
        
        const isDue = currentDate > maintenanceDate;
        const isUpcoming = daysRemaining <= 30 && daysRemaining > 0;
        const isCompleted = isDue && (Math.random() > 0.4);
        const completedDate = isCompleted ? new Date(maintenanceDate.getTime() + (Math.random() * 5 * 24 * 60 * 60 * 1000)) : null;
        
        return {
            date: maintenanceDate,
            completed: isCompleted,
            completedDate: completedDate,
            totalDays: totalDays,
            daysPassed: daysPassed,
            daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
            isDue: isDue && !isCompleted,
            isUpcoming: isUpcoming,
            percentPassed: Math.min(Math.max(percentPassed, 0), 100)
        };
    }

    /**
     * Get maintenance status based on date comparison
     */
    getMaintenanceStatus(maintenanceDate, currentDate) {
        maintenanceDate = new Date(maintenanceDate);
        currentDate = new Date(currentDate);
        
        const daysUntilMaintenance = Math.ceil((maintenanceDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysUntilMaintenance < 0) {
            return 'due';
        } else if (daysUntilMaintenance <= 30) {
            return 'upcoming';
        } else {
            return 'scheduled';
        }
    }

    /**
     * Get text for maintenance status in Arabic
     */
    getMaintenanceStatusText(status) {
        switch (status) {
            case 'completed':
                return 'تمت الصيانة';
            case 'due':
                return 'متأخرة';
            case 'upcoming':
                return 'قريباً';
            case 'scheduled':
                return 'مجدولة';
            default:
                return 'غير متوفر';
        }
    }

    /**
     * Check if maintenance warranty is still active
     */
    isMaintenanceWarrantyActive(reportDate, currentDate) {
        const warrantyEndDate = new Date(reportDate);
        warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + 1);
        return currentDate <= warrantyEndDate;
    }

    // =============================================================================
    // CLIENT COMPATIBILITY FUNCTIONS
    // =============================================================================

    /**
     * Display warranty information (client compatibility function)
     * This function is called from the client files
     */
    displayWarrantyInfo(reports) {
        console.log('🛡️ Displaying warranty info for reports:', reports);
        const warrantyContainer = document.getElementById('warrantyList');
        if (!warrantyContainer) {
            console.warn('Warranty container not found');
            return;
        }
        
        // Use the existing displayWarranty function
        this.displayWarranty(reports, warrantyContainer);
    }

    /**
     * Display maintenance schedule (client compatibility function)
     * This function is called from the client files
     */
    displayMaintenanceSchedule(reports) {
        console.log('🔧 Displaying maintenance schedule for reports:', reports);
        const maintenanceContainer = document.getElementById('maintenanceList');
        if (!maintenanceContainer) {
            console.warn('Maintenance container not found');
            return;
        }
        
        // Use the existing displayMaintenance function
        this.displayMaintenance(reports, maintenanceContainer);
    }

    /**
     * Display reports (client compatibility function)
     * This function is called from the client files
     */
    displayReportsClient(reports) {
        console.log('📊 Displaying reports:', reports);
        const reportsContainer = document.getElementById('reportsList');
        if (!reportsContainer) {
            console.warn('Reports container not found');
            return;
        }
        
        // Use the existing displayReports function
        this.displayReports(reports, reportsContainer);
    }

    /**
     * Display invoices (client compatibility function)
     * This function is called from the client files
     */
    displayInvoicesClient(invoices) {
        console.log('💰 Displaying invoices:', invoices);
        const invoicesContainer = document.getElementById('invoicesList');
        if (!invoicesContainer) {
            console.warn('Invoices container not found');
            return;
        }
        
        // Use the existing displayInvoices function
        this.displayInvoices(invoices, invoicesContainer);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.enhancedAccount = new EnhancedAccount();
});

// Export for global access
window.EnhancedAccount = EnhancedAccount;

// =============================================================================
// GLOBAL COMPATIBILITY FUNCTIONS
// =============================================================================

// Make functions globally available for client compatibility
window.displayWarrantyInfo = function(reports) {
    if (window.enhancedAccount) {
        window.enhancedAccount.displayWarrantyInfo(reports);
    }
};

window.displayMaintenanceSchedule = function(reports) {
    if (window.enhancedAccount) {
        window.enhancedAccount.displayMaintenanceSchedule(reports);
    }
};

window.displayReports = function(reports) {
    if (window.enhancedAccount) {
        window.enhancedAccount.displayReportsClient(reports);
    }
};

window.displayInvoices = function(invoices) {
    if (window.enhancedAccount) {
        window.enhancedAccount.displayInvoicesClient(invoices);
    }
};

window.sendMaintenanceWhatsApp = function(reportId, clientName, reportDate, deviceModel) {
    if (window.enhancedAccount) {
        return window.enhancedAccount.sendMaintenanceWhatsApp(reportId, clientName, reportDate, deviceModel);
    }
};
