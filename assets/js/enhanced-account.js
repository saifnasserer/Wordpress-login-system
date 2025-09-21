/**
 * Enhanced Account Page JavaScript
 * Handles API calls and data loading for the enhanced account page
 * Uses the same structure as client-portal but adapted for WordPress
 */

// API Service Configuration - Using the same structure as client-portal
class WordPressApiService {
    constructor() {
        // Use the same API configuration as client-portal
        this.baseUrl = this.getApiBaseUrl();
        this.authToken = this.getAuthToken();
        this.userId = this.getCurrentUserId();
    }
    
    getApiBaseUrl() {
        // Try to get API base URL from meta tag, otherwise use default
        const metaUrl = document.querySelector('meta[name="api-base-url"]')?.content;
        if (metaUrl) {
            return metaUrl;
        }
        
        // Fallback to client-portal API URL
        const currentHost = window.location.hostname;
        const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
        
        if (isLocalhost) {
            return 'http://localhost:3001'; // Default client-portal API port
        } else {
            return 'https://reports.laapak.com'; // Production API
        }
    }
    
    getAuthToken() {
        // Get client token from localStorage (same as client-portal)
        return localStorage.getItem('clientToken') || 
               sessionStorage.getItem('clientToken') || 
               localStorage.getItem('adminToken') || 
               sessionStorage.getItem('adminToken') || '';
    }
    
    getCurrentUserId() {
        // Get current user ID from WordPress
        return document.querySelector('meta[name="user-id"]')?.content || '';
    }
    
    // Helper method to get auth headers (same as client-portal)
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-auth-token': this.authToken
        };
    }
    
    // Generic API request method (same as client-portal)
    async request(endpoint, method = 'GET', data = null, customHeaders = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                ...this.getAuthHeaders(),
                ...(customHeaders || {})
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }
        
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            options.signal = controller.signal;
            
            const response = await fetch(url, options);
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Get client reports - REAL API CALL
    async getClientReports() {
        try {
            console.log('🔍 [DEBUG] Fetching client reports from API...');
            console.log('🔍 [DEBUG] API Base URL:', this.baseUrl);
            console.log('🔍 [DEBUG] Auth Token:', this.authToken ? 'Present' : 'Missing');
            console.log('🔍 [DEBUG] Full URL:', `${this.baseUrl}/api/client/reports`);
            
            const response = await this.request('/api/client/reports');
            console.log('✅ [DEBUG] Client reports response:', response);
            console.log('✅ [DEBUG] Response success:', response.success);
            console.log('✅ [DEBUG] Response data length:', response.data ? response.data.length : 'No data');
            return response;
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching client reports:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, data: [], error: error.message };
        }
    }
    
    // Get client invoices - REAL API CALL
    async getClientInvoices() {
        try {
            console.log('🔍 [DEBUG] Fetching client invoices from API...');
            console.log('🔍 [DEBUG] Full URL:', `${this.baseUrl}/api/client/invoices`);
            const response = await this.request('/api/client/invoices');
            console.log('✅ [DEBUG] Client invoices response:', response);
            console.log('✅ [DEBUG] Response success:', response.success);
            console.log('✅ [DEBUG] Response data length:', response.data ? response.data.length : 'No data');
            return response;
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching client invoices:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, data: [], error: error.message };
        }
    }
    
    // Get warranty information - REAL API CALL
    async getWarrantyInfo() {
        try {
            console.log('🔍 [DEBUG] Fetching warranty info from API...');
            console.log('🔍 [DEBUG] Full URL:', `${this.baseUrl}/api/client/warranty`);
            const response = await this.request('/api/client/warranty');
            console.log('✅ [DEBUG] Warranty info response:', response);
            console.log('✅ [DEBUG] Response success:', response.success);
            console.log('✅ [DEBUG] Response data length:', response.data ? response.data.length : 'No data');
            return response;
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching warranty info:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, data: [], error: error.message };
        }
    }
    
    // Get maintenance schedules - REAL API CALL
    async getMaintenanceSchedules() {
        try {
            console.log('🔍 [DEBUG] Fetching maintenance schedules from API...');
            console.log('🔍 [DEBUG] Full URL:', `${this.baseUrl}/api/client/maintenance`);
            const response = await this.request('/api/client/maintenance');
            console.log('✅ [DEBUG] Maintenance schedules response:', response);
            console.log('✅ [DEBUG] Response success:', response.success);
            console.log('✅ [DEBUG] Response data length:', response.data ? response.data.length : 'No data');
            return response;
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching maintenance schedules:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, data: [], error: error.message };
        }
    }
}

// Initialize API service
const apiService = new WordPressApiService();

// Debug logging for API service initialization
console.log('🚀 [DEBUG] Enhanced Account Page Initialized');
console.log('🚀 [DEBUG] API Service Base URL:', apiService.baseUrl);
console.log('🚀 [DEBUG] API Service Auth Token:', apiService.authToken ? 'Present' : 'Missing');
console.log('🚀 [DEBUG] API Service User ID:', apiService.userId);
console.log('🚀 [DEBUG] Current Location:', window.location.href);
console.log('🚀 [DEBUG] Local Storage Keys:', Object.keys(localStorage));
console.log('🚀 [DEBUG] Session Storage Keys:', Object.keys(sessionStorage));

// Test API connection
async function testApiConnection() {
    console.log('🔍 [DEBUG] Testing API connection...');
    try {
        const response = await fetch(`${apiService.baseUrl}/api/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': apiService.authToken
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ [DEBUG] API Connection Test - SUCCESS:', data);
        } else {
            console.log('⚠️ [DEBUG] API Connection Test - HTTP Error:', response.status, response.statusText);
        }
    } catch (error) {
        console.log('❌ [DEBUG] API Connection Test - FAILED:', error.message);
        console.log('❌ [DEBUG] This might be expected if the API server is not running');
    }
}

// Run connection test
testApiConnection();

// Enhanced Account Page Manager
class EnhancedAccountManager {
    constructor() {
        this.currentTab = 'reports';
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadInitialData();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                const targetTab = e.target.getAttribute('data-bs-target').replace('#', '');
                this.currentTab = targetTab;
                this.loadTabData(targetTab);
            });
        });
        
        // Auto-hide alerts
        setTimeout(() => {
            document.querySelectorAll('.alert').forEach(alert => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }, 5000);
    }
    
    async loadInitialData() {
        // Load data for the active tab
        await this.loadTabData(this.currentTab);
    }
    
    async loadTabData(tabName) {
        switch (tabName) {
            case 'reports':
                await this.loadReports();
                break;
            case 'invoices':
                await this.loadInvoices();
                break;
            case 'warranty':
                await this.loadWarranty();
                break;
            case 'maintenance':
                await this.loadMaintenance();
                break;
        }
    }
    
    async loadReports() {
        const reportsContainer = document.getElementById('reportsList');
        const loadingElement = document.getElementById('reportsLoading');
        const noReportsElement = document.getElementById('noReportsMessage');
        
        try {
            showLoading(loadingElement, true);
            
            // Check if user is authenticated
            if (!apiService.authToken) {
                console.warn('No authentication token found');
                hideLoading(loadingElement);
                showElement(noReportsElement);
                return;
            }
            
            const response = await apiService.getClientReports();
            
            if (response.success && response.data && response.data.length > 0) {
                this.displayReports(response.data);
                hideLoading(loadingElement);
                hideElement(noReportsElement);
            } else if (response.error) {
                console.error('API Error:', response.error);
                hideLoading(loadingElement);
                showElement(noReportsElement);
            } else {
                hideLoading(loadingElement);
                showElement(noReportsElement);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
            hideLoading(loadingElement);
            showElement(noReportsElement);
        }
    }
    
    async loadInvoices() {
        const invoicesContainer = document.getElementById('invoicesList');
        const loadingElement = document.getElementById('invoicesLoading');
        const noInvoicesElement = document.getElementById('noInvoicesMessage');
        
        try {
            showLoading(loadingElement, true);
            
            // Check if user is authenticated
            if (!apiService.authToken) {
                console.warn('No authentication token found');
                hideLoading(loadingElement);
                showElement(noInvoicesElement);
                return;
            }
            
            const response = await apiService.getClientInvoices();
            
            if (response.success && response.data && response.data.length > 0) {
                this.displayInvoices(response.data);
                hideLoading(loadingElement);
                hideElement(noInvoicesElement);
            } else if (response.error) {
                console.error('API Error:', response.error);
                hideLoading(loadingElement);
                showElement(noInvoicesElement);
            } else {
                hideLoading(loadingElement);
                showElement(noInvoicesElement);
            }
        } catch (error) {
            console.error('Error loading invoices:', error);
            hideLoading(loadingElement);
            showElement(noInvoicesElement);
        }
    }
    
    async loadWarranty() {
        const warrantyContainer = document.getElementById('warrantyList');
        const loadingElement = document.getElementById('warrantyLoading');
        
        try {
            showLoading(loadingElement, true);
            
            // Check if user is authenticated
            if (!apiService.authToken) {
                console.warn('No authentication token found');
                hideLoading(loadingElement);
                return;
            }
            
            const response = await apiService.getWarrantyInfo();
            
            if (response.success && response.data && response.data.length > 0) {
                this.displayWarranty(response.data);
                hideLoading(loadingElement);
            } else if (response.error) {
                console.error('API Error:', response.error);
                hideLoading(loadingElement);
            } else {
                hideLoading(loadingElement);
            }
        } catch (error) {
            console.error('Error loading warranty info:', error);
            hideLoading(loadingElement);
        }
    }
    
    async loadMaintenance() {
        const maintenanceContainer = document.getElementById('maintenanceList');
        const loadingElement = document.getElementById('maintenanceLoading');
        
        try {
            showLoading(loadingElement, true);
            
            // Check if user is authenticated
            if (!apiService.authToken) {
                console.warn('No authentication token found');
                hideLoading(loadingElement);
                return;
            }
            
            const response = await apiService.getMaintenanceSchedules();
            
            if (response.success && response.data && response.data.length > 0) {
                this.displayMaintenance(response.data);
                hideLoading(loadingElement);
            } else if (response.error) {
                console.error('API Error:', response.error);
                hideLoading(loadingElement);
            } else {
                hideLoading(loadingElement);
            }
        } catch (error) {
            console.error('Error loading maintenance schedules:', error);
            hideLoading(loadingElement);
        }
    }
    
    displayReports(reports) {
        const container = document.getElementById('reportsList');
        const reportsHTML = reports.map(report => this.createReportCard(report)).join('');
        container.innerHTML = reportsHTML;
    }
    
    displayInvoices(invoices) {
        const container = document.getElementById('invoicesList');
        const invoicesHTML = invoices.map(invoice => this.createInvoiceCard(invoice)).join('');
        container.innerHTML = invoicesHTML;
    }
    
    displayWarranty(warrantyData) {
        const container = document.getElementById('warrantyList');
        const warrantyHTML = warrantyData.map(warranty => this.createWarrantyCard(warranty)).join('');
        container.innerHTML = warrantyHTML;
    }
    
    displayMaintenance(maintenanceData) {
        const container = document.getElementById('maintenanceList');
        const maintenanceHTML = maintenanceData.map(maintenance => this.createMaintenanceCard(maintenance)).join('');
        container.innerHTML = maintenanceHTML;
    }
    
    createReportCard(report) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card report-card shadow-sm">
                    <div class="card-header bg-primary text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-laptop-medical me-2"></i>
                            ${report.title || 'تقرير فحص الجهاز'}
                        </h6>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${report.device_model || 'جهاز غير محدد'}</h6>
                        <p class="card-text text-muted">رقم التسلسل: ${report.serial_number || 'غير محدد'}</p>
                        <p class="card-text text-muted">تاريخ الفحص: ${report.inspection_date || 'غير محدد'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="warranty-badge ${report.warranty_status === 'active' ? 'warranty-active' : 'warranty-expired'}">
                                ${report.warranty_status === 'active' ? 'ضمان نشط' : 'ضمان منتهي'}
                            </span>
                            <button class="btn btn-outline-primary btn-sm" onclick="viewReport('${report.id}')">
                                عرض التقرير
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createInvoiceCard(invoice) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card report-card shadow-sm">
                    <div class="card-header bg-success text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-file-invoice me-2"></i>
                            فاتورة #${invoice.id || 'غير محدد'}
                        </h6>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${invoice.description || 'خدمة صيانة الجهاز'}</h6>
                        <p class="card-text text-muted">التاريخ: ${invoice.date || 'غير محدد'}</p>
                        <p class="card-text text-muted">المبلغ: ${invoice.total || '0.00'} ريال</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="order-badge order-${invoice.status || 'pending'}">
                                ${this.getStatusText(invoice.status)}
                            </span>
                            <button class="btn btn-outline-primary btn-sm" onclick="viewInvoice('${invoice.id}')">
                                عرض الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createWarrantyCard(warranty) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card report-card shadow-sm">
                    <div class="card-header bg-info text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-shield-alt me-2"></i>
                            ${warranty.type || 'ضمان الجهاز'}
                        </h6>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${warranty.device_name || 'جهاز غير محدد'}</h6>
                        <p class="card-text text-muted">تاريخ البداية: ${warranty.start_date || 'غير محدد'}</p>
                        <p class="card-text text-muted">تاريخ الانتهاء: ${warranty.end_date || 'غير محدد'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="warranty-badge ${warranty.status === 'active' ? 'warranty-active' : 'warranty-expired'}">
                                ${warranty.status === 'active' ? 'ضمان نشط' : 'ضمان منتهي'}
                            </span>
                            <button class="btn btn-outline-primary btn-sm" onclick="viewWarranty('${warranty.id}')">
                                عرض التفاصيل
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    createMaintenanceCard(maintenance) {
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card report-card shadow-sm">
                    <div class="card-header bg-warning text-white">
                        <h6 class="card-title mb-0">
                            <i class="fas fa-tools me-2"></i>
                            ${maintenance.type || 'صيانة دورية'}
                        </h6>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">${maintenance.device_name || 'جهاز غير محدد'}</h6>
                        <p class="card-text text-muted">التاريخ المحدد: ${maintenance.scheduled_date || 'غير محدد'}</p>
                        <p class="card-text text-muted">الحالة: ${maintenance.status || 'غير محدد'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="maintenance-badge ${this.getMaintenanceBadgeClass(maintenance.status)}">
                                ${this.getMaintenanceStatusText(maintenance.status)}
                            </span>
                            <button class="btn btn-outline-primary btn-sm" onclick="viewMaintenance('${maintenance.id}')">
                                عرض التفاصيل
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getStatusText(status) {
        const statusMap = {
            'completed': 'مكتمل',
            'processing': 'قيد المعالجة',
            'pending': 'معلق',
            'cancelled': 'ملغي'
        };
        return statusMap[status] || 'غير محدد';
    }
    
    getMaintenanceBadgeClass(status) {
        const classMap = {
            'scheduled': 'bg-primary',
            'completed': 'bg-success',
            'cancelled': 'bg-danger',
            'pending': 'bg-warning'
        };
        return classMap[status] || 'bg-secondary';
    }
    
    getMaintenanceStatusText(status) {
        const statusMap = {
            'scheduled': 'مجدول',
            'completed': 'مكتمل',
            'cancelled': 'ملغي',
            'pending': 'معلق'
        };
        return statusMap[status] || 'غير محدد';
    }
}

// Utility functions
function showLoading(element, show = true) {
    if (element) {
        element.style.display = show ? 'block' : 'none';
    }
}

function hideLoading(element) {
    if (element) {
        element.style.display = 'none';
    }
}

function showElement(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

// Global functions for card actions
function viewReport(reportId) {
    console.log('Viewing report:', reportId);
    // Implement report viewing logic
}

function viewInvoice(invoiceId) {
    console.log('Viewing invoice:', invoiceId);
    // Implement invoice viewing logic
}

function viewWarranty(warrantyId) {
    console.log('Viewing warranty:', warrantyId);
    // Implement warranty viewing logic
}

function viewMaintenance(maintenanceId) {
    console.log('Viewing maintenance:', maintenanceId);
    // Implement maintenance viewing logic
}

// Initialize the enhanced account manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new EnhancedAccountManager();
});
