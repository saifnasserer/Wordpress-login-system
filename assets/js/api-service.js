/**
 * Laapak Report System - API Service
 * Handles all API calls to the backend server
 */

class ApiService {
    constructor(baseUrl = '') {
        // Try to determine the best API server URL
        // First check if we're running on a deployed server or localhost
        const currentHost = window.location.hostname;
        const isLocalhost = currentHost === 'localhost' || currentHost === '127.0.0.1';
        
        // Always use the external API
        if (baseUrl) {
            this.baseUrl = baseUrl;
        } else {
            this.baseUrl = 'https://reports.laapak.com/api/external';
        }
        
        console.log('API Service initialized with baseUrl:', this.baseUrl);
        // Use the API key for external API
        this.authToken = 'laapak-api-key-2024';
    }
    
    /**
     * Helper method to format a value as a JSON string
     * @param {*} value - The value to format as JSON
     * @returns {string} - A properly formatted JSON string
     */
    _formatJsonField(value) {
        try {
            // If it's already a string, check if it's valid JSON
            if (typeof value === 'string') {
                // Try to parse and re-stringify to ensure valid JSON format
                const parsed = JSON.parse(value);
                return JSON.stringify(parsed);
            } else {
                // If it's an object/array, stringify it
                return JSON.stringify(value);
            }
        } catch (e) {
            console.error('Error formatting JSON field:', e);
            // Return empty array as fallback
            return '[]';
        }
    }

    // Helper method to get auth headers for external API
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.authToken
        };
    }

    // Update auth token
    setAuthToken(token) {
        this.authToken = token;
    }

    // Generic API request method
    async request(endpoint, method = 'GET', data = null, customHeaders = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                ...this.getAuthHeaders(),
                // Add any custom headers passed to the method
                ...(customHeaders || {})
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
            console.log(`Request data:`, data);
        }

        console.log(`API Request: ${method} ${url}`);
        
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            options.signal = controller.signal;
            
            const response = await fetch(url, options);
            clearTimeout(timeoutId);
            
            console.log(`API Response status: ${response.status}`);
            
            // Handle non-JSON responses
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                console.log('Non-JSON response:', text);
                responseData = { message: text };
            }

            if (!response.ok) {
                // Enhanced error message for database issues
                if (response.status === 500) {
                    if (method === 'POST' && endpoint === '/api/reports') {
                        throw new Error('فشل في حفظ التقرير في قاعدة البيانات. يرجى التأكد من اتصال قاعدة البيانات.');
                    } else {
                        // For GET requests with 500 errors, return the error response instead of throwing
                        // This allows the calling method to handle database column errors gracefully
                        return {
                            success: false,
                            error: responseData.message || 'خطأ في الخادم. يرجى التأكد من اتصال قاعدة البيانات.',
                            status: response.status
                        };
                    }
                } else {
                    throw new Error(responseData.message || `فشل طلب API بحالة ${response.status}`);
                }
            }

            return responseData;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            // Enhanced error handling with specific messages
            if (error.name === 'AbortError') {
                throw new Error('طلب API انتهت مهلته. يرجى المحاولة مرة أخرى.');
            } else if (error.name === 'TypeError' && error.message.includes('NetworkError')) {
                throw new Error('لا يمكن الاتصال بالخادم. يرجى التأكد من تشغيل خادم Node.js على المنفذ 3000.');
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                throw new Error('فشل الاتصال بالخادم. يرجى التأكد من تشغيل خادم API.');
            } else if (error.message && error.message.includes('database')) {
                throw new Error('مشكلة في قاعدة البيانات. يرجى التأكد من تشغيل خدمة MySQL وتكوين قاعدة البيانات بشكل صحيح.');
            }
            
            throw error;
        }
    }
    
    // Client-specific API methods for enhanced account page
    async getClientReports() {
        try {
            console.log('🔍 [DEBUG] Fetching client reports from WordPress API...');
            
            // Use WordPress custom endpoint instead of direct API
            const response = await fetch('/wp-json/laapak/v1/client/reports', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': document.querySelector('meta[name="wp-nonce"]')?.content || '',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const reports = await response.json();
            console.log('✅ [DEBUG] Client reports response:', reports);
            
            // Handle error responses
            if (reports.error) {
                console.error('❌ [DEBUG] API Error:', reports.error);
                return { success: false, reports: [], error: reports.error };
            }
            
            // Return reports in expected format
            return {
                success: true,
                reports: Array.isArray(reports) ? reports : []
            };
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching client reports:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, reports: [], error: error.message };
        }
    }
    
    async getClientInvoices() {
        try {
            console.log('🔍 [DEBUG] Fetching client invoices from WordPress API...');
            
            // Use WordPress custom endpoint instead of direct API
            const response = await fetch('/wp-json/laapak/v1/client/invoices', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': document.querySelector('meta[name="wp-nonce"]')?.content || '',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const invoices = await response.json();
            console.log('✅ [DEBUG] Client invoices response:', invoices);
            
            // Handle error responses
            if (invoices.error) {
                console.error('❌ [DEBUG] API Error:', invoices.error);
                return { success: false, invoices: [], error: invoices.error };
            }
            
            // Return invoices in expected format
            return {
                success: true,
                invoices: Array.isArray(invoices) ? invoices : []
            };
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching client invoices:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, invoices: [], error: error.message };
        }
    }
    
    async getWarrantyInfo() {
        try {
            console.log('🔍 [DEBUG] Fetching warranty info from WordPress API...');
            
            // Use WordPress custom endpoint instead of direct API
            const response = await fetch('/wp-json/laapak/v1/client/warranty', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': document.querySelector('meta[name="wp-nonce"]')?.content || '',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const warranty = await response.json();
            console.log('✅ [DEBUG] Client warranty response:', warranty);
            
            // Handle error responses
            if (warranty.error) {
                console.error('❌ [DEBUG] API Error:', warranty.error);
                return { success: false, warranty: [], error: warranty.error };
            }
            
            // Return warranty in expected format
            return {
                success: true,
                warranty: Array.isArray(warranty) ? warranty : []
            };
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching warranty info:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, warranty: [], error: error.message };
        }
    }
    
    async getMaintenanceSchedules() {
        try {
            console.log('🔍 [DEBUG] Fetching maintenance schedules from WordPress API...');
            
            // Use WordPress custom endpoint instead of direct API
            const response = await fetch('/wp-json/laapak/v1/client/maintenance', {
                method: 'GET',
                headers: {
                    'X-WP-Nonce': document.querySelector('meta[name="wp-nonce"]')?.content || '',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const maintenance = await response.json();
            console.log('✅ [DEBUG] Client maintenance response:', maintenance);
            
            // Handle error responses
            if (maintenance.error) {
                console.error('❌ [DEBUG] API Error:', maintenance.error);
                return { success: false, maintenance: [], error: maintenance.error };
            }
            
            // Return maintenance in expected format
            return {
                success: true,
                maintenance: Array.isArray(maintenance) ? maintenance : []
            };
        } catch (error) {
            console.error('❌ [DEBUG] Error fetching maintenance schedules:', error);
            console.error('❌ [DEBUG] Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });
            return { success: false, maintenance: [], error: error.message };
        }
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Export class for module environments
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = ApiService;
}

// Create a global instance of ApiService for direct use in browser
// Use var instead of const to ensure it's accessible from all scopes
var apiService;

// Initialize with a self-executing function to ensure it runs immediately
(function() {
    try {
        // Check if apiService already exists to avoid re-creating it
        if (!window.apiService) {
            apiService = new ApiService();
            // Make it available globally
            window.apiService = apiService;
            console.log('Global apiService instance created successfully');
        } else {
            apiService = window.apiService;
            console.log('Using existing global apiService instance');
        }
    } catch (error) {
        console.error('Error initializing apiService:', error);
        // Create a fallback service with the production URL
        apiService = new ApiService('https://reports.laapak.com');
        window.apiService = apiService;
        console.log('Created fallback apiService with hardcoded URL');
    }
})();
