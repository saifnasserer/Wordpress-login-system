/**
 * Custom Login Page JavaScript
 * Server-side authentication (no AJAX)
 */

$(document).ready(function() {
    console.log('🚀 [LOGIN] Custom login script loaded (server-side mode)');
    
    // Handle form submission - let server handle unified authentication
    $('#loginform').on('submit', function(e) {
        console.log('🚀 [LOGIN] Form submitted - using server-side unified authentication');
        
        // Add custom submit button name for our server handler
        $(this).append('<input type="hidden" name="custom_login_submit" value="1">');
        
        // Let the form submit naturally to WordPress
        // Our PHP handler will process unified authentication
    });
    
    // Show error message
    function showErrorMessage(message) {
        // Remove existing error messages
        $('.login-error').remove();
        
        // Add new error message
        const errorHtml = `
            <div class="login-error alert alert-danger mt-3" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
        
        $('#loginform').after(errorHtml);
        
        // Scroll to error message
        $('html, body').animate({
            scrollTop: $('.login-error').offset().top - 100
        }, 500);
    }
    
    // Show success message
    function showSuccessMessage(message) {
        // Remove existing messages
        $('.login-success').remove();
        
        // Add new success message
        const successHtml = `
            <div class="login-success alert alert-success mt-3" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
            </div>
        `;
        
        $('#loginform').after(successHtml);
    }
    
    // Handle URL parameters for error messages
    const urlParams = new URLSearchParams(window.location.search);
    const loginError = urlParams.get('login');
    
    if (loginError === 'failed') {
        showErrorMessage('رقم الهاتف أو كلمة المرور غير صحيحة');
    } else if (loginError === 'empty') {
        showErrorMessage('يرجى إدخال جميع البيانات المطلوبة');
    }
    
    // Add loading state to submit button
    $('#loginform').on('submit', function() {
        const submitBtn = $('#wp-submit');
        submitBtn.prop('disabled', true);
        submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>جاري تسجيل الدخول...');
        
        // Re-enable button after 5 seconds as fallback
        setTimeout(function() {
            submitBtn.prop('disabled', false);
            submitBtn.html('تسجيل الدخول');
        }, 5000);
    });
    
    // Test functions for debugging (server-side mode)
    window.testServerSideAuth = function(phoneOrEmail, password) {
        console.log('🧪 [TEST] Testing server-side authentication for:', phoneOrEmail);
        console.log('🧪 [TEST] Server-side flow:');
        console.log('  1. Form submits to WordPress');
        console.log('  2. PHP handles unified authentication');
        console.log('  3. Redirects to account page on success');
        return true;
    };
    
    window.testPhoneProcessing = function(phone) {
        console.log('🧪 [TEST] Testing phone processing for:', phone);
        const auth = new UnifiedAuthService();
        return auth.testPhoneProcessing(phone);
    };
    
    window.testWordPressSearch = function(phone) {
        console.log('🧪 [TEST] Testing WordPress search for:', phone);
        const auth = new UnifiedAuthService();
        return auth.testWordPressUserSearch(phone);
    };
    
    window.testExternalAPI = function(phone) {
        console.log('🧪 [TEST] Testing external API for:', phone);
        const auth = new UnifiedAuthService();
        return auth.testExternalAPI(phone);
    };
    
    // Log that we're in server-side mode
    console.log('📝 [LOGIN] All authentication is handled server-side by PHP');
    console.log('🔧 [LOGIN] Use test functions for debugging');
});