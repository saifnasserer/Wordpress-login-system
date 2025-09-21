/**
 * Custom Registration Page JavaScript
 * Simple form validation without multi-step logic
 */

(function($) {
    'use strict';

    // Initialize when document is ready
    $(document).ready(function() {
        console.log('Document ready, initializing form');
        initRegistrationForm();
    });

    function initRegistrationForm() {
        const $form = $('#registerform');
        const $password = $('#user_pass');
        const $confirmPassword = $('#user_pass_confirm');
        
        console.log('Form elements found:', {
            form: $form.length,
            password: $password.length,
            confirmPassword: $confirmPassword.length
        });
        
        // Real-time password confirmation validation
        $confirmPassword.on('input', function() {
            const password = $password.val();
            const confirmPassword = $(this).val();
            
            if (confirmPassword && password !== confirmPassword) {
                $(this).addClass('error');
                showFieldError($(this), 'كلمات المرور غير متطابقة');
            } else {
                $(this).removeClass('error');
                $(this).siblings('.field-error').remove();
            }
        });
        
        // Clear error state on input
        $('input, select, textarea').on('input change', function() {
            $(this).removeClass('error');
            $(this).siblings('.field-error').remove();
        });
        
        // Form submission validation
        $form.on('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
                console.log('Form validation failed');
            } else {
                console.log('Form validation passed');
            }
        });
        
        function validateForm() {
            let isValid = true;
            
            // Clear previous error states
            $('.form-input, .form-select, .form-textarea').removeClass('error');
            $('.field-error').remove();
            
            // Validate required fields
            $('input[required], select[required], textarea[required]').each(function() {
                const $field = $(this);
                const value = $field.val().trim();
                
                if (!value) {
                    $field.addClass('error');
                    isValid = false;
                    console.log('Required field empty:', $field.attr('name'));
                }
            });
            
            // Validate password confirmation
            const password = $password.val();
            const confirmPassword = $confirmPassword.val();
            
            if (password && confirmPassword && password !== confirmPassword) {
                $confirmPassword.addClass('error');
                showFieldError($confirmPassword, 'كلمات المرور غير متطابقة');
                isValid = false;
            }
            
            // Validate email format
            const email = $('#user_email').val();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email && !emailRegex.test(email)) {
                $('#user_email').addClass('error');
                showFieldError($('#user_email'), 'يرجى إدخال بريد إلكتروني صحيح');
                isValid = false;
            }
            
            console.log('Form validation result:', isValid);
            return isValid;
        }
        
        function showFieldError($field, message) {
            // Remove existing error message
            $field.siblings('.field-error').remove();
            
            // Add error message
            $field.after('<div class="field-error" style="color: #c33; font-size: 12px; margin-top: 5px;">' + message + '</div>');
        }
    }

    // Add CSS for error states
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
        .form-input.error,
        .form-select.error,
        .form-textarea.error {
            border-color: #c33 !important;
            box-shadow: 0 0 0 2px rgba(204, 51, 51, 0.1) !important;
        }
        
        .field-error {
            color: #c33;
            font-size: 12px;
            margin-top: 5px;
            display: block;
        }
    `;
    document.head.appendChild(style);

})(window.jQuery || function(selector) {
    // Fallback for environments without jQuery
    const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : [selector];
    
    return {
        ready: function(callback) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                callback();
            }
        },
        on: function(event, handler) {
            elements.forEach(el => {
                if (el) el.addEventListener(event, handler);
            });
            return this;
        },
        click: function(handler) {
            elements.forEach(el => {
                if (el) el.addEventListener('click', handler);
            });
            return this;
        },
        val: function(value) {
            if (elements.length > 0) {
                if (value !== undefined) {
                    elements[0].value = value;
                } else {
                    return elements[0].value;
                }
            }
            return this;
        },
        addClass: function(className) {
            elements.forEach(el => {
                if (el) el.classList.add(className);
            });
            return this;
        },
        removeClass: function(className) {
            elements.forEach(el => {
                if (el) el.classList.remove(className);
            });
            return this;
        },
        siblings: function(selector) {
            if (elements.length > 0) {
                const siblings = Array.from(elements[0].parentNode.children).filter(child => child !== elements[0]);
                if (selector) {
                    return siblings.filter(sibling => sibling.matches(selector));
                }
                return siblings;
            }
            return [];
        },
        after: function(html) {
            elements.forEach(el => {
                if (el) el.insertAdjacentHTML('afterend', html);
            });
            return this;
        },
        find: function(selector) {
            if (elements.length > 0) {
                return Array.from(elements[0].querySelectorAll(selector));
            }
            return [];
        },
        hide: function() {
            elements.forEach(el => {
                if (el) el.style.display = 'none';
            });
            return this;
        },
        show: function() {
            elements.forEach(el => {
                if (el) el.style.display = '';
            });
            return this;
        },
        attr: function(name, value) {
            if (elements.length > 0) {
                if (value !== undefined) {
                    elements[0].setAttribute(name, value);
                } else {
                    return elements[0].getAttribute(name);
                }
            }
            return this;
        },
        length: elements.length
    };
});