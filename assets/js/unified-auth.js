/**
 * Unified Authentication Service
 * Server-side authentication helper (no AJAX)
 */

// Simple utility functions for server-side authentication
class UnifiedAuthService {
    constructor() {
        console.log('🚀 [AUTH] Unified Auth Service initialized (server-side mode)');
    }
    
    // Test function for debugging
    testConnection() {
        console.log('🧪 [TEST] Testing unified authentication connection...');
        console.log('✅ [TEST] Server-side mode - no AJAX required');
        return true;
    }
    
    // Debug function to test phone number processing
    testPhoneProcessing(phone) {
        console.log('🧪 [TEST] Testing phone number processing:', phone);
        
        // Clean phone number
        const cleanPhone = phone.replace(/[^\d]/g, '');
        console.log('🧪 [TEST] Cleaned phone:', cleanPhone);
        
        // Generate possible usernames
        const possibleUsernames = this.generatePossibleUsernames(phone);
        console.log('🧪 [TEST] Possible usernames:', possibleUsernames);
        
        return {
            original: phone,
            cleaned: cleanPhone,
            usernames: possibleUsernames
        };
    }
    
    // Generate possible usernames from phone number
    generatePossibleUsernames(phone) {
        const cleanPhone = phone.replace(/[^\d]/g, '');
        const withoutZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
        
        return [
            phone,           // Original input
            cleanPhone,      // Cleaned phone
            withoutZero,     // Without leading zero
            cleanPhone + '@laapak.com',  // Email format
            withoutZero + '@laapak.com'  // Email format without zero
        ];
    }
    
    // Debug function to test WordPress user search
    async testWordPressUserSearch(phone) {
        console.log('🧪 [TEST] Testing WordPress user search for:', phone);
        
        // This would normally be done server-side
        console.log('🧪 [TEST] Server-side search would check:');
        console.log('  - Username:', phone);
        console.log('  - Email:', phone + '@laapak.com');
        console.log('  - Phone meta field');
        
        return {
            phone: phone,
            searchMethods: ['username', 'email', 'meta_field']
        };
    }
    
    // Debug function to test external API
    async testExternalAPI(phone) {
        console.log('🧪 [TEST] Testing external API for:', phone);
        
        // This would normally be done server-side
        console.log('🧪 [TEST] Server-side API call would check:');
        console.log('  - URL: https://reports.laapak.com/api/external/clients/lookup?phone=' + phone);
        console.log('  - Headers: x-api-key: laapak-api-key-2024');
        
        return {
            phone: phone,
            apiUrl: 'https://reports.laapak.com/api/external/clients/lookup?phone=' + phone,
            method: 'server-side'
        };
    }
    
    // Debug function to test unified login flow
    async testUnifiedLoginFlow(phoneOrEmail, password) {
        console.log('🧪 [TEST] Testing unified login flow for:', phoneOrEmail);
        
        console.log('🧪 [TEST] Server-side flow would:');
        console.log('  1. Try WordPress authentication first');
        console.log('  2. If fails, check external API');
        console.log('  3. If found in API, create local user');
        console.log('  4. Login user and redirect');
        
        return {
            input: phoneOrEmail,
            flow: 'server-side',
            steps: [
                'WordPress authentication',
                'External API check',
                'User creation if needed',
                'Login and redirect'
            ]
        };
    }
    
    // Debug function to test user creation
    async testUserCreation(laapakUser) {
        console.log('🧪 [TEST] Testing user creation for:', laapakUser);
        
        console.log('🧪 [TEST] Server-side user creation would:');
        console.log('  - Username:', laapakUser.phone);
        console.log('  - Email:', laapakUser.email || laapakUser.phone + '@laapak.com');
        console.log('  - First name:', laapakUser.name);
        console.log('  - Phone meta:', laapakUser.phone);
        console.log('  - Laapak ID meta:', laapakUser.id);
        
        return {
            laapakUser: laapakUser,
            wpUser: {
                username: laapakUser.phone,
                email: laapakUser.email || laapakUser.phone + '@laapak.com',
                first_name: laapakUser.name,
                meta: {
                    phone: laapakUser.phone,
                    laapak_user_id: laapakUser.id
                }
            }
        };
    }
    
    // Debug function to test form submission
    testFormSubmission(formData) {
        console.log('🧪 [TEST] Testing form submission:', formData);
        
        console.log('🧪 [TEST] Server-side form processing would:');
        console.log('  - Validate form data');
        console.log('  - Call perform_unified_login()');
        console.log('  - Handle authentication result');
        console.log('  - Redirect to account page');
        
        return {
            formData: formData,
            processing: 'server-side',
            result: 'redirect_to_account'
        };
    }
}

// Initialize the service (only if not already declared)
if (typeof window.UnifiedAuthService === 'undefined') {
    window.UnifiedAuthService = UnifiedAuthService;
}

// Debug functions for testing
window.testUnifiedAuth = function(phoneOrEmail, password) {
    const auth = new UnifiedAuthService();
    return auth.testUnifiedLoginFlow(phoneOrEmail, password);
};

window.testPhoneProcessing = function(phone) {
    const auth = new UnifiedAuthService();
    return auth.testPhoneProcessing(phone);
};

window.testWordPressSearch = function(phone) {
    const auth = new UnifiedAuthService();
    return auth.testWordPressUserSearch(phone);
};

window.testExternalAPI = function(phone) {
    const auth = new UnifiedAuthService();
    return auth.testExternalAPI(phone);
};

window.testUserCreation = function(laapakUser) {
    const auth = new UnifiedAuthService();
    return auth.testUserCreation(laapakUser);
};

window.testFormSubmission = function(formData) {
    const auth = new UnifiedAuthService();
    return auth.testFormSubmission(formData);
};

// Log initialization
console.log('🚀 [AUTH] Unified Auth Service loaded (server-side mode)');
console.log('📝 [AUTH] All authentication is handled server-side by PHP');
console.log('🔧 [AUTH] Use test functions for debugging');
