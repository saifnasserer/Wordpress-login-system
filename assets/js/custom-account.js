/**
 * Custom Account Page JavaScript
 * 
 * Handles tab switching, form validation, and user interactions
 */

(function($) {
    'use strict';

    // Wait for DOM to be ready
    $(document).ready(function() {
        
        // Initialize account page
        initAccountPage();
        
        // Initialize tab functionality
        initTabs();
        
        // Initialize form validation
        initFormValidation();
        
        // Initialize smooth interactions
        initSmoothInteractions();
        
    });

    /**
     * Initialize account page
     */
    function initAccountPage() {
        console.log('Account page initialized');
        
        // Add loading states to buttons
        $('.account-button').on('click', function() {
            if ($(this).hasClass('primary') || $(this).hasClass('danger')) {
                addLoadingState($(this));
            }
        });
        
        // Auto-hide success/error messages
        setTimeout(function() {
            $('.account-success, .account-error').fadeOut(500);
        }, 5000);
    }

    /**
     * Initialize tab functionality
     */
    function initTabs() {
        $('.tab-button').on('click', function() {
            const targetTab = $(this).data('tab');
            
            // Remove active class from all tabs and content
            $('.tab-button').removeClass('active');
            $('.tab-content').removeClass('active');
            
            // Add active class to clicked tab
            $(this).addClass('active');
            
            // Show corresponding content
            $('#' + targetTab + '-tab').addClass('active');
            
            // Add smooth transition effect
            $('#' + targetTab + '-tab').hide().fadeIn(300);
        });
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
        // Profile form validation
        $('form[name="registerform"]').on('submit', function(e) {
            if (!validateProfileForm()) {
                e.preventDefault();
            }
        });
        
        // Password form validation
        $('form').on('submit', function(e) {
            if ($(this).find('input[name="new_password"]').length > 0) {
                if (!validatePasswordForm()) {
                    e.preventDefault();
                }
            }
        });
        
        // Real-time validation
        $('.form-input').on('blur', function() {
            validateField($(this));
        });
        
        // Password confirmation validation
        $('#confirm_password').on('input', function() {
            const newPassword = $('#new_password').val();
            const confirmPassword = $(this).val();
            
            if (newPassword && confirmPassword) {
                if (newPassword !== confirmPassword) {
                    showFieldError($(this), 'كلمة المرور غير متطابقة');
                } else {
                    clearFieldError($(this));
                }
            }
        });
    }

    /**
     * Validate profile form
     */
    function validateProfileForm() {
        let isValid = true;
        
        // Validate first name
        const firstName = $('#first_name').val().trim();
        if (!firstName) {
            showFieldError($('#first_name'), 'الاسم الأول مطلوب');
            isValid = false;
        } else {
            clearFieldError($('#first_name'));
        }
        
        // Validate last name
        const lastName = $('#last_name').val().trim();
        if (!lastName) {
            showFieldError($('#last_name'), 'الاسم الأخير مطلوب');
            isValid = false;
        } else {
            clearFieldError($('#last_name'));
        }
        
        // Validate email
        const email = $('#email').val().trim();
        if (!email) {
            showFieldError($('#email'), 'البريد الإلكتروني مطلوب');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError($('#email'), 'البريد الإلكتروني غير صحيح');
            isValid = false;
        } else {
            clearFieldError($('#email'));
        }
        
        // Validate phone
        const phone = $('#phone').val().trim();
        if (!phone) {
            showFieldError($('#phone'), 'رقم الهاتف مطلوب');
            isValid = false;
        } else if (!isValidPhone(phone)) {
            showFieldError($('#phone'), 'رقم الهاتف غير صحيح');
            isValid = false;
        } else {
            clearFieldError($('#phone'));
        }
        
        return isValid;
    }

    /**
     * Validate password form
     */
    function validatePasswordForm() {
        let isValid = true;
        
        // Validate current password
        const currentPassword = $('#current_password').val();
        if (!currentPassword) {
            showFieldError($('#current_password'), 'كلمة المرور الحالية مطلوبة');
            isValid = false;
        } else {
            clearFieldError($('#current_password'));
        }
        
        // Validate new password
        const newPassword = $('#new_password').val();
        if (!newPassword) {
            showFieldError($('#new_password'), 'كلمة المرور الجديدة مطلوبة');
            isValid = false;
        } else if (newPassword.length < 6) {
            showFieldError($('#new_password'), 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            isValid = false;
        } else {
            clearFieldError($('#new_password'));
        }
        
        // Validate password confirmation
        const confirmPassword = $('#confirm_password').val();
        if (!confirmPassword) {
            showFieldError($('#confirm_password'), 'تأكيد كلمة المرور مطلوب');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            showFieldError($('#confirm_password'), 'كلمة المرور غير متطابقة');
            isValid = false;
        } else {
            clearFieldError($('#confirm_password'));
        }
        
        return isValid;
    }

    /**
     * Validate individual field
     */
    function validateField($field) {
        const fieldName = $field.attr('name');
        const fieldValue = $field.val().trim();
        
        switch (fieldName) {
            case 'first_name':
            case 'last_name':
                if (!fieldValue) {
                    showFieldError($field, 'هذا الحقل مطلوب');
                    return false;
                }
                break;
                
            case 'email':
                if (!fieldValue) {
                    showFieldError($field, 'البريد الإلكتروني مطلوب');
                    return false;
                } else if (!isValidEmail(fieldValue)) {
                    showFieldError($field, 'البريد الإلكتروني غير صحيح');
                    return false;
                }
                break;
                
            case 'phone':
                if (!fieldValue) {
                    showFieldError($field, 'رقم الهاتف مطلوب');
                    return false;
                } else if (!isValidPhone(fieldValue)) {
                    showFieldError($field, 'رقم الهاتف غير صحيح');
                    return false;
                }
                break;
        }
        
        clearFieldError($field);
        return true;
    }

    /**
     * Show field error
     */
    function showFieldError($field, message) {
        clearFieldError($field);
        
        $field.addClass('error');
        $field.after('<div class="field-error">' + message + '</div>');
        
        // Add shake animation
        $field.addClass('shake');
        setTimeout(function() {
            $field.removeClass('shake');
        }, 500);
    }

    /**
     * Clear field error
     */
    function clearFieldError($field) {
        $field.removeClass('error');
        $field.siblings('.field-error').remove();
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone format
     */
    function isValidPhone(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if it's a valid length (7-15 digits)
        return cleanPhone.length >= 7 && cleanPhone.length <= 15;
    }

    /**
     * Initialize smooth interactions
     */
    function initSmoothInteractions() {
        // Smooth scroll for anchor links
        $('a[href^="#"]').on('click', function(e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            if (target.length) {
                $('html, body').animate({
                    scrollTop: target.offset().top - 100
                }, 500);
            }
        });
        
        // Add hover effects to interactive elements
        $('.activity-item').hover(
            function() {
                $(this).addClass('hover');
            },
            function() {
                $(this).removeClass('hover');
            }
        );
        
        // Add focus effects to form inputs
        $('.form-input').on('focus', function() {
            $(this).parent().addClass('focused');
        }).on('blur', function() {
            $(this).parent().removeClass('focused');
        });
    }

    /**
     * Add loading state to button
     */
    function addLoadingState($button) {
        $button.addClass('loading').prop('disabled', true);
        
        // Remove loading state after 3 seconds (fallback)
        setTimeout(function() {
            $button.removeClass('loading').prop('disabled', false);
        }, 3000);
    }

    /**
     * Show notification
     */
    function showNotification(message, type = 'info') {
        const notification = $('<div class="notification notification-' + type + '">' + message + '</div>');
        $('body').append(notification);
        
        setTimeout(function() {
            notification.fadeOut(500, function() {
                notification.remove();
            });
        }, 3000);
    }

    /**
     * Handle form submission with AJAX (optional enhancement)
     */
    function handleAjaxFormSubmission() {
        $('.account-form').on('submit', function(e) {
            e.preventDefault();
            
            const $form = $(this);
            const formData = $form.serialize();
            const action = $form.attr('action') || window.location.href;
            
            // Add loading state
            const $submitButton = $form.find('button[type="submit"]');
            addLoadingState($submitButton);
            
            $.ajax({
                url: action,
                type: 'POST',
                data: formData,
                success: function(response) {
                    // Handle success response
                    showNotification('تم الحفظ بنجاح', 'success');
                    $submitButton.removeClass('loading').prop('disabled', false);
                },
                error: function(xhr, status, error) {
                    // Handle error response
                    showNotification('حدث خطأ أثناء الحفظ', 'error');
                    $submitButton.removeClass('loading').prop('disabled', false);
                }
            });
        });
    }

    // Initialize AJAX form submission if needed
    // handleAjaxFormSubmission();

})(jQuery);

// Additional CSS for JavaScript interactions
const additionalCSS = `
    .form-input.error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
    }
    
    .field-error {
        color: #dc3545;
        font-size: 0.85rem;
        margin-top: 5px;
        display: block;
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
    }
    
    .notification-success {
        background: #28a745;
    }
    
    .notification-error {
        background: #dc3545;
    }
    
    .notification-info {
        background: #17a2b8;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .form-group.focused .form-label {
        color: #28a745;
        transform: translateY(-2px);
    }
    
    .activity-item.hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    }
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);
