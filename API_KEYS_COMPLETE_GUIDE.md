# Laapak Report System - Complete API Keys Guide

## 🔑 **Available API Keys**

### **Primary API Keys:**
- `laapak-api-key-2024` (Main production key)
- `laapak-external-access-key` (Secondary key)
- `laapak-integration-key` (Integration key)

### **Custom API Key:**
Set environment variable `API_KEY` for custom key:
```bash
export API_KEY="your-custom-api-key"
```

## 🌐 **API Endpoints**

### **Base URLs:**
- **Production**: `https://reports.laapak.com/api/external`
- **Development**: `http://localhost:3000/api/external`

### **Authentication Header:**
```http
x-api-key: laapak-api-key-2024
```

## 📋 **Complete API Reference**

### **1. Health Check**
```http
GET /api/external/health
x-api-key: laapak-api-key-2024
```

**Response:**
```json
{
    "success": true,
    "message": "API key authentication successful",
    "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### **2. Client Lookup by Phone**
```http
GET /api/external/clients/lookup?phone=01128260256
x-api-key: laapak-api-key-2024
```

**Response (Client Found):**
```json
{
    "success": true,
    "client": {
        "id": 104,
        "name": "أحمد داوود",
        "phone": "01128260256",
        "email": null,
        "status": "active",
        "createdAt": "2024-01-15T10:00:00.000Z"
    }
}
```

**Response (Client Not Found):**
```json
{
    "message": "Client not found",
    "error": "CLIENT_NOT_FOUND"
}
```

### **3. Client Lookup by Email**
```http
GET /api/external/clients/lookup?email=client@example.com
x-api-key: laapak-api-key-2024
```

### **4. Client Verification (Phone + Order Code)**
```http
POST /api/external/clients/verify
x-api-key: laapak-api-key-2024
Content-Type: application/json

{
    "phone": "01128260256",
    "orderCode": "ORD123456"
}
```

**Response:**
```json
{
    "success": true,
    "client": {
        "id": 104,
        "name": "أحمد داوود",
        "phone": "01128260256",
        "email": null,
        "status": "active"
    },
    "message": "Client verified successfully"
}
```

### **5. Get Client's Reports**
```http
GET /api/external/clients/104/reports
x-api-key: laapak-api-key-2024
```

**Response:**
```json
{
    "success": true,
    "reports": [
        {
            "id": "RPT123456",
            "device_model": "iPhone 15",
            "serial_number": "ABC123",
            "inspection_date": "2024-01-15T10:00:00.000Z",
            "status": "active",
            "createdAt": "2024-01-15T10:00:00.000Z"
        }
    ],
    "count": 1
}
```

### **6. Get Client's Invoices**
```http
GET /api/external/clients/104/invoices
x-api-key: laapak-api-key-2024
```

**Response:**
```json
{
    "success": true,
    "invoices": [
        {
            "id": "INV123456",
            "total": "500.00",
            "paymentStatus": "paid",
            "date": "2024-01-15T10:00:00.000Z",
            "createdAt": "2024-01-15T10:00:00.000Z"
        }
    ],
    "count": 1
}
```

## 💻 **JavaScript Integration**

### **Complete API Client Class:**
```javascript
class LaapakAPI {
    constructor(baseUrl = 'https://reports.laapak.com/api/external', apiKey = 'laapak-api-key-2024') {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    async makeRequest(endpoint, method = 'GET', data = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, options);
            
            if (!response.ok) {
                if (response.status === 404) {
                    const errorData = await response.json();
                    throw new Error(`Not found: ${errorData.message}`);
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return await this.makeRequest('/health');
    }

    // Client lookup by phone
    async lookupClientByPhone(phone) {
        return await this.makeRequest(`/clients/lookup?phone=${phone}`);
    }

    // Client lookup by email
    async lookupClientByEmail(email) {
        return await this.makeRequest(`/clients/lookup?email=${email}`);
    }

    // Verify client credentials
    async verifyClient(phone, orderCode) {
        return await this.makeRequest('/clients/verify', 'POST', { phone, orderCode });
    }

    // Get client's reports
    async getClientReports(clientId) {
        return await this.makeRequest(`/clients/${clientId}/reports`);
    }

    // Get client's invoices
    async getClientInvoices(clientId) {
        return await this.makeRequest(`/clients/${clientId}/invoices`);
    }
}

// Usage Examples
const api = new LaapakAPI();

// Test connection
try {
    const health = await api.healthCheck();
    console.log('✅ API Connection successful:', health);
} catch (error) {
    console.error('❌ API Connection failed:', error.message);
}

// Lookup client by phone
try {
    const client = await api.lookupClientByPhone('01128260256');
    console.log('Client found:', client.client);
} catch (error) {
    console.error('Client lookup failed:', error.message);
}

// Verify client credentials
try {
    const verification = await api.verifyClient('01128260256', 'ORD123456');
    console.log('Client verified:', verification.client);
} catch (error) {
    console.error('Client verification failed:', error.message);
}
```

## 🐍 **Python Integration**

```python
import requests
import json

class LaapakAPI:
    def __init__(self, base_url='https://reports.laapak.com/api/external', api_key='laapak-api-key-2024'):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'x-api-key': api_key,
            'Content-Type': 'application/json'
        })

    def make_request(self, endpoint, method='GET', data=None):
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method == 'GET':
                response = self.session.get(url)
            elif method == 'POST':
                response = self.session.post(url, json=data)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                return {"error": "Not found", "status": 404}
            raise e

    def health_check(self):
        return self.make_request('/health')

    def lookup_client_by_phone(self, phone):
        return self.make_request(f'/clients/lookup?phone={phone}')

    def lookup_client_by_email(self, email):
        return self.make_request(f'/clients/lookup?email={email}')

    def verify_client(self, phone, order_code):
        return self.make_request('/clients/verify', 'POST', {
            'phone': phone,
            'orderCode': order_code
        })

    def get_client_reports(self, client_id):
        return self.make_request(f'/clients/{client_id}/reports')

    def get_client_invoices(self, client_id):
        return self.make_request(f'/clients/{client_id}/invoices')

# Usage
api = LaapakAPI()

# Test connection
try:
    health = api.health_check()
    print('✅ API Connection successful:', health)
except Exception as e:
    print('❌ API Connection failed:', str(e))

# Lookup client
try:
    client = api.lookup_client_by_phone('01128260256')
    print('Client found:', client)
except Exception as e:
    print('Client lookup failed:', str(e))
```

## 🔧 **cURL Examples**

### **Test API Key Authentication:**
```bash
curl -X GET "https://reports.laapak.com/api/external/health" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json"
```

### **Lookup Client by Phone:**
```bash
curl -X GET "https://reports.laapak.com/api/external/clients/lookup?phone=01128260256" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json"
```

### **Lookup Client by Email:**
```bash
curl -X GET "https://reports.laapak.com/api/external/clients/lookup?email=client@example.com" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json"
```

### **Verify Client Credentials:**
```bash
curl -X POST "https://reports.laapak.com/api/external/clients/verify" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json" \
  -d '{"phone": "01128260256", "orderCode": "ORD123456"}'
```

### **Get Client Reports:**
```bash
curl -X GET "https://reports.laapak.com/api/external/clients/104/reports" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json"
```

### **Get Client Invoices:**
```bash
curl -X GET "https://reports.laapak.com/api/external/clients/104/invoices" \
  -H "x-api-key: laapak-api-key-2024" \
  -H "Content-Type: application/json"
```

## 🚨 **Error Handling**

### **Common Error Responses:**

```json
// 401 Unauthorized - Invalid API Key
{
    "message": "Invalid or missing API key",
    "error": "API_KEY_REQUIRED"
}

// 400 Bad Request - Missing Parameters
{
    "message": "Phone number or email is required",
    "error": "MISSING_PARAMETERS"
}

// 404 Not Found - Client Not Found
{
    "message": "Client not found",
    "error": "CLIENT_NOT_FOUND"
}

// 404 Not Found - Invalid Credentials
{
    "message": "Invalid credentials",
    "error": "INVALID_CREDENTIALS"
}
```

### **Error Handling Example:**
```javascript
async function handleApiCall(apiFunction) {
    try {
        const result = await apiFunction();
        return { success: true, data: result };
    } catch (error) {
        if (error.message.includes('401')) {
            console.error('❌ Invalid API key');
        } else if (error.message.includes('404')) {
            console.error('❌ Client not found');
        } else if (error.message.includes('400')) {
            console.error('❌ Missing parameters');
        } else {
            console.error('❌ API Error:', error.message);
        }
        
        return { success: false, error: error.message };
    }
}
```

## 🔒 **Security Best Practices**

### **1. API Key Management**
- Store API keys securely (not in client-side code)
- Use environment variables for API keys
- Rotate API keys regularly
- Monitor API key usage

### **2. Request Security**
- Always use HTTPS in production
- Validate input parameters
- Implement rate limiting
- Log API requests for monitoring

### **3. Error Handling**
- Don't expose sensitive information in error messages
- Implement proper logging
- Handle network errors gracefully
- Use try-catch blocks appropriately

## 📊 **Rate Limiting**

The API has built-in rate limiting. If you exceed the limits, you'll receive:
```json
{
    "message": "Too many requests",
    "error": "RATE_LIMIT_EXCEEDED"
}
```

**Recommended:**
- Implement exponential backoff for retries
- Cache responses when appropriate
- Monitor your API usage

## 🧪 **Testing Your Integration**

### **1. Test Script:**
```bash
# Run the test script
node test-remote-api.js
```

### **2. Manual Testing:**
```bash
# Test health check
curl -X GET "https://reports.laapak.com/api/external/health" \
  -H "x-api-key: laapak-api-key-2024"

# Test client lookup
curl -X GET "https://reports.laapak.com/api/external/clients/lookup?phone=01128260256" \
  -H "x-api-key: laapak-api-key-2024"
```

### **3. Browser Testing:**
Open `test-api-keys.html` in your browser to test the endpoints interactively.

## 📝 **Quick Reference**

### **API Keys:**
- `laapak-api-key-2024` (Primary)
- `laapak-external-access-key` (Secondary)
- `laapak-integration-key` (Integration)

### **Base URLs:**
- Production: `https://reports.laapak.com/api/external`
- Development: `http://localhost:3000/api/external`

### **Required Header:**
```http
x-api-key: laapak-api-key-2024
```

### **Common Endpoints:**
- Health: `GET /health`
- Client Lookup: `GET /clients/lookup?phone=01128260256`
- Client Verify: `POST /clients/verify`
- Client Reports: `GET /clients/{id}/reports`
- Client Invoices: `GET /clients/{id}/invoices`

This guide provides everything you need to integrate with the Laapak Report System API using API keys! 🚀
