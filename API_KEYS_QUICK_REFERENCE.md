# Laapak API Keys - Quick Reference

## 🔑 **API Keys**
```
laapak-api-key-2024          (Primary - Use this one)
laapak-external-access-key   (Secondary)
laapak-integration-key       (Integration)
```

## 🌐 **Base URLs**
```
Production:  https://reports.laapak.com/api/external
Development: http://localhost:3000/api/external
```

## 📋 **Quick Examples**

### **JavaScript:**
```javascript
const api = new LaapakAPI('https://reports.laapak.com/api/external', 'laapak-api-key-2024');

// Check if user exists
const client = await api.lookupClientByPhone('01128260256');
if (client.success) {
    console.log('User found:', client.client);
} else {
    console.log('User not found');
}
```

### **cURL:**
```bash
# Test connection
curl -X GET "https://reports.laapak.com/api/external/health" \
  -H "x-api-key: laapak-api-key-2024"

# Lookup client
curl -X GET "https://reports.laapak.com/api/external/clients/lookup?phone=01128260256" \
  -H "x-api-key: laapak-api-key-2024"
```

### **Python:**
```python
api = LaapakAPI('https://reports.laapak.com/api/external', 'laapak-api-key-2024')
client = api.lookup_client_by_phone('01128260256')
```

## 🚀 **Your Working Code**
```javascript
class LaapakUserChecker {
    constructor() {
        this.apiKey = 'laapak-api-key-2024';
        this.baseUrl = 'https://reports.laapak.com/api/external';
    }

    async checkUser(phone) {
        try {
            const response = await fetch(`${this.baseUrl}/clients/lookup?phone=${phone}`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return { found: false, message: 'User not found' };
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return { found: true, client: data.client };
        } catch (error) {
            return { found: false, error: error.message };
        }
    }
}
```

## ✅ **Tested & Working**
- ✅ API Key: `laapak-api-key-2024`
- ✅ Base URL: `https://reports.laapak.com/api/external`
- ✅ Client Found: Phone `01128260256` → Client "أحمد داوود" (ID: 104)
- ✅ CORS: Properly configured
- ✅ All endpoints: Working
