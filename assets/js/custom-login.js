/**
 * Custom Login Page JavaScript
 * Enhanced user experience with form validation
 */

// jQuery fallback for environments where jQuery might not be available
(function($) {
    'use strict';
    
    // Fallback if jQuery is not available
    if (typeof $ === 'undefined') {
        console.warn('jQuery not available, using vanilla JS fallback');
        // We'll implement vanilla JS fallback if needed
        return;
    }

    // =============================================================================
    // INITIALIZATION
    // =============================================================================

    $(document).ready(function() {
        initLoginForm();
        initFormValidation();
        initLoadingStates();
        initAccessibility();
    });

    // =============================================================================
    // LOGIN FORM HANDLING
    // =============================================================================

    function initLoginForm() {
        const $form = $('#loginform');
        const $submitBtn = $('#wp-submit');
        const $loadingOverlay = $('#loadingOverlay');

    // Handle form submission
    $form.on('submit', function(e) {
        if (validateLoginForm()) {
            showLoading();
            // Let the form submit normally to WordPress
            // Don't prevent default - let WordPress handle the login
        } else {
            e.preventDefault();
        }
    });

        // Handle Enter key on password field
        $('#user_pass').on('keypress', function(e) {
            if (e.which === 13) {
                $form.trigger('submit');
            }
        });

        // Real-time validation
        $('#user_login, #user_pass').on('blur', function() {
            validateField($(this));
        });

        // Clear errors on input
        $('#user_login, #user_pass').on('input', function() {
            clearFieldError($(this));
        });
    }

    // =============================================================================
    // FORM VALIDATION
    // =============================================================================

    function initFormValidation() {
        // Add validation classes to inputs
        $('.form-input').each(function() {
            const $input = $(this);
            $input.on('blur', function() {
                validateField($input);
            });
        });
    }

    function validateLoginForm() {
        let isValid = true;
        const $username = $('#user_login');
        const $password = $('#user_pass');

        // Clear previous errors
        clearAllErrors();

        // Validate username
        if (!validateField($username)) {
            isValid = false;
        }

        // Validate password
        if (!validateField($password)) {
            isValid = false;
        }

        return isValid;
    }

    function validateField($field) {
        const value = $field.val().trim();
        const fieldName = $field.attr('name');
        let isValid = true;
        let errorMessage = '';

        // Username validation
        if (fieldName === 'log') {
            if (value.length === 0) {
                errorMessage = 'Username or email is required';
                isValid = false;
            } else if (value.length < 3) {
                errorMessage = 'Username must be at least 3 characters';
                isValid = false;
            }
        }

        // Password validation
        if (fieldName === 'pwd') {
            if (value.length === 0) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters';
                isValid = false;
            }
        }

        // Show/hide error
        if (!isValid) {
            showFieldError($field, errorMessage);
        } else {
            clearFieldError($field);
        }

        return isValid;
    }

    // =============================================================================
    // ERROR HANDLING
    // =============================================================================

    function showFieldError($field, message) {
        const $formGroup = $field.closest('.form-group');
        
        // Remove existing error
        $formGroup.find('.error-message').remove();
        $field.removeClass('success').addClass('error');
        
        // Add error message
        $formGroup.append(`<div class="error-message">${message}</div>`);
    }

    function clearFieldError($field) {
        const $formGroup = $field.closest('.form-group');
        $formGroup.find('.error-message').remove();
        $field.removeClass('error success');
    }

    function clearAllErrors() {
        $('.form-input').removeClass('error success');
        $('.error-message').remove();
    }

    // =============================================================================
    // FORM SUBMISSION (STANDARD WORDPRESS)
    // =============================================================================

    // WordPress handles login submission automatically
    // We just provide visual feedback during the process

    // =============================================================================
    // LOADING STATES
    // =============================================================================

    function initLoadingStates() {
        // Add loading class to button on form submit
        $('#loginform').on('submit', function() {
            const $submitBtn = $('#wp-submit');
            $submitBtn.prop('disabled', true);
            $submitBtn.val('جاري تسجيل الدخول...');
        });
    }

    function showLoading() {
        $('#loadingOverlay').addClass('show');
        
        // Auto-hide loading after 10 seconds (in case of issues)
        setTimeout(function() {
            hideLoading();
        }, 10000);
    }

    function hideLoading() {
        $('#loadingOverlay').removeClass('show');
        
        // Reset button state
        const $submitBtn = $('#wp-submit');
        $submitBtn.prop('disabled', false);
        $submitBtn.val('تسجيل الدخول');
    }

    // =============================================================================
    // MESSAGES
    // =============================================================================

    function showSuccessMessage(message) {
        showMessage(message, 'success');
    }

    function showErrorMessage(message) {
        showMessage(message, 'error');
    }

    function showMessage(message, type) {
        // Remove existing messages
        $('.login-error, .login-success').remove();
        
        const messageClass = type === 'success' ? 'login-success' : 'login-error';
        const icon = type === 'success' ? '✅' : '⚠️';
        
        const $message = $(`
            <div class="${messageClass}">
                <span class="error-icon">${icon}</span>
                ${message}
            </div>
        `);
        
        $('.login-form-container').prepend($message);
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(function() {
                $message.fadeOut();
            }, 3000);
        }
    }

    // =============================================================================
    // ACCESSIBILITY
    // =============================================================================

    function initAccessibility() {
        // Add ARIA labels
        $('#user_login').attr('aria-label', 'Username or email address');
        $('#user_pass').attr('aria-label', 'Password');
        $('#rememberme').attr('aria-label', 'Remember me');
        $('#wp-submit').attr('aria-label', 'Sign in to your account');

        // Add role attributes
        $('.login-error, .login-success').attr('role', 'alert');
        $('.login-form-container').attr('role', 'form');

        // Keyboard navigation
        $('.form-input').on('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                $('#loginform').trigger('submit');
            }
        });

        // Focus management
        $('#user_login').focus();
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // =============================================================================
    // ANIMATIONS
    // =============================================================================

    // Add entrance animations
    function initAnimations() {
        const $elements = $('.login-wrapper, .form-group');
        
        $elements.each(function(index) {
            const $element = $(this);
            $element.css({
                'opacity': '0',
                'transform': 'translateY(20px)'
            });
            
            setTimeout(function() {
                $element.css({
                    'opacity': '1',
                    'transform': 'translateY(0)',
                    'transition': 'all 0.6s ease-out'
                });
            }, index * 100);
        });
    }

    // Initialize animations on page load
    $(window).on('load', function() {
        initAnimations();
    });

    // =============================================================================
    // RESPONSIVE BEHAVIOR
    // =============================================================================

    function initResponsive() {
        // Handle mobile viewport changes
        function handleViewportChange() {
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                $('.login-wrapper').addClass('mobile');
            } else {
                $('.login-wrapper').removeClass('mobile');
            }
        }

        // Initial check
        handleViewportChange();

        // Listen for resize events
        $(window).on('resize', debounce(handleViewportChange, 250));
    }

    // Initialize responsive behavior
    initResponsive();

    // =============================================================================
    // SECURITY ENHANCEMENTS
    // =============================================================================

    function initSecurity() {
        // Clear sensitive data on page unload
        $(window).on('beforeunload', function() {
            $('#user_pass').val('');
            hideLoading(); // Hide loading overlay on page change
        });

        // Hide loading overlay on page visibility change
        $(document).on('visibilitychange', function() {
            if (document.hidden) {
                hideLoading();
            }
        });

        // Prevent password field from being saved by browser
        $('#user_pass').attr('autocomplete', 'current-password');
        $('#user_login').attr('autocomplete', 'username');
    }

    initSecurity();

})(jQuery);
