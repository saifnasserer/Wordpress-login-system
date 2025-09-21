# Laapak Report System - Client Portal Structure

## Overview

This document outlines the complete structure of the client portal for the Laapak Report System, including all HTML, CSS, JavaScript files, and assets needed for client account functionality.

## Folder Structure

```
client-portal/
├── html/                          # Client HTML Pages
│   ├── client-login.html          # Client login page
│   ├── client-dashboard.html      # Client dashboard
│   └── client-login-test.html     # Client login testing page
├── css/                           # Client-specific stylesheets
│   ├── custom-client.css          # Main client styling
│   ├── child-friendly.css         # Child-friendly report styling
│   ├── device-gallery.css         # Device gallery styling
│   ├── premium-report.css         # Premium report styling
│   └── report-walkthrough.css     # Report walkthrough styling
├── js/                            # Client JavaScript files
│   ├── api-service.js             # API service for client operations
│   ├── auth-check.js              # Authentication checking
│   ├── auth-middleware.js         # Authentication middleware
│   ├── client-dashboard.js        # Client dashboard functionality
│   ├── client-display.js          # Client data display
│   ├── client-header-component.js # Client header component
│   ├── client-login.js            # Client login functionality
│   ├── client-maintenance.js      # Client maintenance features
│   ├── client-selection.js        # Client selection functionality
│   └── client-warranty.js         # Client warranty features
├── assets/                        # Client portal assets
│   ├── cropped-Logo-mark.png.png  # Logo mark
│   ├── dashboard-illustration.svg # Dashboard illustration
│   └── logo.png                   # Main logo
└── CLIENT_PORTAL_STRUCTURE.md     # This documentation file
```

## File Descriptions

### HTML Files (`html/`)

#### `client-login.html`
- **Purpose**: Main client login page
- **Features**: 
  - Phone number and order code authentication
  - Responsive design
  - Error handling
  - Redirect to dashboard on successful login

#### `client-dashboard.html`
- **Purpose**: Client dashboard after login
- **Features**:
  - Display client's reports
  - Display client's invoices
  - Profile management
  - Navigation menu
  - Logout functionality

#### `client-login-test.html`
- **Purpose**: Testing page for client login functionality
- **Features**:
  - Debug information
  - Login testing tools
  - API response display

### CSS Files (`css/`)

#### `custom-client.css`
- **Purpose**: Main client portal styling
- **Features**:
  - Client-specific color scheme
  - Responsive layout
  - Custom components
  - Mobile optimization

#### `child-friendly.css`
- **Purpose**: Child-friendly report styling
- **Features**:
  - Kid-friendly colors and fonts
  - Simplified interface
  - Large buttons and text
  - Fun animations

#### `device-gallery.css`
- **Purpose**: Device gallery styling
- **Features**:
  - Image grid layout
  - Hover effects
  - Responsive gallery
  - Lightbox functionality

#### `premium-report.css`
- **Purpose**: Premium report styling
- **Features**:
  - Professional appearance
  - Enhanced typography
  - Premium color scheme
  - Advanced layouts

#### `report-walkthrough.css`
- **Purpose**: Report walkthrough styling
- **Features**:
  - Step-by-step styling
  - Progress indicators
  - Interactive elements
  - Guided navigation

### JavaScript Files (`js/`)

#### `api-service.js`
- **Purpose**: API service for client operations
- **Features**:
  - Client authentication
  - API request handling
  - Error management
  - Token management

#### `client-login.js`
- **Purpose**: Client login functionality
- **Features**:
  - Login form handling
  - Authentication API calls
  - Token storage
  - Redirect logic

#### `client-dashboard.js`
- **Purpose**: Client dashboard functionality
- **Features**:
  - Dashboard data loading
  - Report display
  - Invoice display
  - Profile management

#### `client-display.js`
- **Purpose**: Client data display
- **Features**:
  - Data formatting
  - Display logic
  - Interactive elements
  - Data filtering

#### `client-header-component.js`
- **Purpose**: Client header component
- **Features**:
  - Navigation menu
  - User information
  - Logout functionality
  - Responsive header

#### `client-maintenance.js`
- **Purpose**: Client maintenance features
- **Features**:
  - Maintenance scheduling
  - Service requests
  - Status tracking
  - Notifications

#### `client-selection.js`
- **Purpose**: Client selection functionality
- **Features**:
  - Client selection interface
  - Search functionality
  - Filter options
  - Selection handling

#### `client-warranty.js`
- **Purpose**: Client warranty features
- **Features**:
  - Warranty information
  - Warranty status
  - Warranty claims
  - Warranty tracking

#### `auth-check.js`
- **Purpose**: Authentication checking
- **Features**:
  - Token validation
  - Session management
  - Authentication status
  - Redirect logic

#### `auth-middleware.js`
- **Purpose**: Authentication middleware
- **Features**:
  - Request authentication
  - Token verification
  - Access control
  - Error handling

### Assets (`assets/`)

#### `logo.png`
- **Purpose**: Main Laapak logo
- **Usage**: Header, branding, navigation

#### `cropped-Logo-mark.png.png`
- **Purpose**: Logo mark/icon
- **Usage**: Favicon, small displays, mobile

#### `dashboard-illustration.svg`
- **Purpose**: Dashboard illustration
- **Usage**: Dashboard background, visual elements

## Client Portal Features

### 1. Authentication System
- **Phone + Order Code Login**: Secure client authentication
- **JWT Token Management**: Secure session handling
- **Auto-logout**: Session timeout protection
- **Remember Me**: Optional persistent login

### 2. Dashboard Features
- **Report Viewing**: View client's device reports
- **Invoice Access**: View and download invoices
- **Profile Management**: Update personal information
- **Service History**: View past services and repairs

### 3. Report Features
- **Report Display**: View detailed device reports
- **Technical Tests**: View technical test results
- **Images**: View device images
- **Warranty Information**: View warranty status

### 4. Invoice Features
- **Invoice List**: View all client invoices
- **Invoice Details**: View detailed invoice information
- **Payment Status**: Check payment status
- **Download**: Download invoice PDFs

### 5. Profile Management
- **Personal Information**: Update name, email, address
- **Contact Details**: Update phone number
- **Preferences**: Set notification preferences
- **Security**: Change login credentials

## API Integration

### Client Authentication Endpoints
```javascript
// Client login
POST /api/clients/auth
{
    "phone": "1234567890",
    "orderCode": "ORD123456"
}

// Get client's reports
GET /api/reports/client/me

// Get client's invoices
GET /api/invoices/client

// Update client profile
PUT /api/users/clients/:id
```

### Client API Service
```javascript
class ClientPortal {
    constructor(baseUrl = 'https://reports.laapak.com/api') {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    // Client login
    async loginClient(phone, orderCode) {
        const response = await fetch(`${this.baseUrl}/clients/auth`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, orderCode })
        });
        
        const data = await response.json();
        this.token = data.token;
        return data;
    }

    // Get client's reports
    async getMyReports() {
        return await this.makeRequest('GET', `${this.baseUrl}/reports/client/me`);
    }

    // Get client's invoices
    async getMyInvoices() {
        return await this.makeRequest('GET', `${this.baseUrl}/invoices/client`);
    }

    // Update profile
    async updateProfile(profileData) {
        return await this.makeRequest('PUT', `${this.baseUrl}/users/clients/${this.clientId}`, profileData);
    }
}
```

## Security Features

### 1. Authentication Security
- JWT token-based authentication
- Token expiration (24 hours)
- Secure token storage
- Session management

### 2. Data Protection
- Client data isolation
- Role-based access control
- API endpoint protection
- Input validation

### 3. Privacy Features
- Client can only see their own data
- No access to other clients' information
- Secure data transmission
- Privacy controls

## Deployment

### 1. File Organization
- All client files are organized in the `client-portal/` directory
- Clear separation of HTML, CSS, JavaScript, and assets
- Modular structure for easy maintenance

### 2. Dependencies
- Bootstrap 5.3.0 (RTL)
- Font Awesome 6.4.0
- Custom CSS and JavaScript
- API service integration

### 3. Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- RTL (Right-to-Left) support for Arabic
- Progressive Web App features

## Usage Instructions

### 1. Setup
1. Copy all files from `client-portal/` to your web server
2. Ensure API endpoints are accessible
3. Configure CORS settings
4. Set up SSL certificates for HTTPS

### 2. Configuration
1. Update API base URL in JavaScript files
2. Configure authentication settings
3. Set up error handling
4. Configure logging

### 3. Testing
1. Test client login functionality
2. Verify dashboard data loading
3. Test report and invoice display
4. Verify profile management

This structure provides a complete, organized client portal for the Laapak Report System with all necessary files and documentation.
