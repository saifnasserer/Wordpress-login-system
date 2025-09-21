<?php
/**
 * Custom WordPress Functions for Login & Register Pages
 * 
 * This file only handles visual aspects - WordPress handles all logic
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// =============================================================================
// CHILD THEME SETUP
// =============================================================================

// Enqueue parent theme styles
function enqueue_parent_theme_styles() {
    wp_enqueue_style('parent-theme-style', get_template_directory_uri() . '/style.css');
}
add_action('wp_enqueue_scripts', 'enqueue_parent_theme_styles');

// =============================================================================
// CUSTOM PAGE TEMPLATES
// =============================================================================

// Add custom page templates
function add_custom_page_templates($templates) {
    $templates['page-templates/login.php'] = 'Custom Login';
    $templates['page-templates/register.php'] = 'Custom Register';
    return $templates;
}
add_filter('theme_page_templates', 'add_custom_page_templates');

// Load custom page templates
function load_custom_page_template($template) {
    global $post;
    
    if ($post) {
        $page_template = get_post_meta($post->ID, '_wp_page_template', true);
        
        if ($page_template && $page_template !== 'default') {
            $template_path = get_stylesheet_directory() . '/' . $page_template;
            if (file_exists($template_path)) {
                return $template_path;
            }
        }
    }
    
    return $template;
}
add_filter('page_template', 'load_custom_page_template');

// =============================================================================
// DIRECT CSS INJECTION (FALLBACK)
// =============================================================================

// Inject CSS directly into <head> for custom ages
function inject_custom_auth_css() {
    // Get current page slug
    $current_page = get_post_field('post_name', get_the_ID());
    
    // Login page CSS
    if (is_page('login') || $current_page === 'login') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/custom-login.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
    
    // Register page CSS
    if (is_page('register') || $current_page === 'register') {
        $css_url = get_stylesheet_directory_uri() . '/assets/css/custom-register.css';
        echo '<link rel="stylesheet" href="' . esc_url($css_url) . '?v=' . time() . '" type="text/css" media="all">' . "\n";
    }
}
add_action('wp_head', 'inject_custom_auth_css', 1);

// =============================================================================
// ASSET ENQUEUING (PRIMARY METHOD)
// =============================================================================

// Enqueue custom styles and scripts
function enqueue_custom_auth_assets() {
    // Get current page slug
    $current_page = get_post_field('post_name', get_the_ID());
    
    // Login page assets
    if (is_page('login') || $current_page === 'login') {
        wp_enqueue_style('custom-login-css', get_stylesheet_directory_uri() . '/assets/css/custom-login.css', array(), '1.0.0');
        wp_enqueue_script('custom-login-js', get_stylesheet_directory_uri() . '/assets/js/custom-login.js', array('jquery'), '1.0.0', true);
    }
    
    // Register page assets
    if (is_page('register') || $current_page === 'register') {
        wp_enqueue_style('custom-register-css', get_stylesheet_directory_uri() . '/assets/css/custom-register.css', array(), '1.0.0');
        wp_enqueue_script('custom-register-js', get_stylesheet_directory_uri() . '/assets/js/custom-register.js', array('jquery'), '1.0.0', true);
    }
}
add_action('wp_enqueue_scripts', 'enqueue_custom_auth_assets');