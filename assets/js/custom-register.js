/**
 * Custom Registration Page JavaScript
 * Server-side authentication (no AJAX)
 */

$(document).ready(function() {
    console.log('🚀 [REGISTER] Custom registration script loaded (server-side mode)');
    
    // Handle form submission - let server handle unified authentication
    $('#registerform').on('submit', function(e) {
        console.log('🚀 [REGISTER] Form submitted - using server-side unified authentication');
        
        // Add custom submit button name for our server handler
        $(this).append('<input type="hidden" name="custom_register_submit" value="1">');
        
        // Let the form submit naturally to WordPress
        // Our PHP handler will process unified authentication
    });
    
    // Show error message
    function showErrorMessage(message) {
        // Remove existing error messages
        $('.register-error').remove();
        
        // Add new error message
        const errorHtml = `
            <div class="register-error alert alert-danger mt-3" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        `;
        
        $('#registerform').after(errorHtml);
        
        // Scroll to error message
        $('html, body').animate({
            scrollTop: $('.register-error').offset().top - 100
        }, 500);
    }
    
    // Show success message
    function showSuccessMessage(message) {
        // Remove existing messages
        $('.register-success').remove();
        
        // Add new success message
        const successHtml = `
            <div class="register-success alert alert-success mt-3" role="alert">
                <i class="fas fa-check-circle me-2"></i>
                ${message}
            </div>
        `;
        
        $('#registerform').after(successHtml);
    }
    
    // Handle URL parameters for error messages
    const urlParams = new URLSearchParams(window.location.search);
    const registerError = urlParams.get('register');
    
    if (registerError === 'failed') {
        showErrorMessage('فشل في إنشاء الحساب');
    } else if (registerError === 'empty') {
        showErrorMessage('يرجى إدخال جميع البيانات المطلوبة');
    } else if (registerError === 'exists') {
        showErrorMessage('المستخدم موجود بالفعل');
    }
    
    // Add loading state to submit button
    $('#registerform').on('submit', function() {
        const submitBtn = $('#wp-submit');
        submitBtn.prop('disabled', true);
        submitBtn.html('<i class="fas fa-spinner fa-spin me-2"></i>جاري إنشاء الحساب...');
        
        // Re-enable button after 5 seconds as fallback
        setTimeout(function() {
            submitBtn.prop('disabled', false);
            submitBtn.html('إنشاء حساب');
        }, 5000);
    });
    
    // Test functions for debugging (server-side mode)
    window.testServerSideRegistration = function(username, email, password, firstName, lastName) {
        console.log('🧪 [TEST] Testing server-side registration for:', username);
        console.log('🧪 [TEST] Server-side flow:');
        console.log('  1. Form submits to WordPress');
        console.log('  2. PHP handles unified registration');
        console.log('  3. Redirects to account page on success');
        return true;
    };
    
    window.testFormSubmission = function(formData) {
        console.log('🧪 [TEST] Testing form submission:', formData);
        const auth = new UnifiedAuthService();
        return auth.testFormSubmission(formData);
    };
    
    // Log that we're in server-side mode
    console.log('📝 [REGISTER] All authentication is handled server-side by PHP');
    console.log('🔧 [REGISTER] Use test functions for debugging');
});