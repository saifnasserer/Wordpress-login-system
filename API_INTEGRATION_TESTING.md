# 🧪 **API Integration Testing Guide**

## 📋 **Overview**

This guide provides comprehensive testing procedures for the updated Laapak API v2 integration. All endpoints have been updated to use the new API structure with proper client ID authentication.

## 🔧 **Testing Checklist**

### **Phase 1: Authentication Testing**

#### **1.1 Login Flow Testing**
- [ ] Test login with valid phone number
- [ ] Verify client ID is stored in user meta
- [ ] Test login with invalid credentials
- [ ] Verify error handling for API failures

#### **1.2 Client Verification Testing**
```bash
# Test client verification endpoint
curl -X POST "https://reports.laapak.com/api/v2/external/auth/verify-client" \
  -H "x-api-key: ak_live_500255ff51b5578eb115e16cef37e6c9e84ecd3baceb5cff0f45182ae7673d58" \
  -H "Content-Type: application/json" \
  -d '{"phone": "01128260256", "orderCode": "WP_LOGIN_1234567890"}'
```

### **Phase 2: Reports Integration Testing**

#### **2.1 Reports Endpoint Testing**
```bash
# Test reports endpoint (requires authentication)
GET /wp-json/laapak/v1/client/reports?limit=10&sortBy=created_at&sortOrder=DESC
```

**Expected Response:**
```json
[
  {
    "id": "RPT123456",
    "device_model": "iPhone 15 Pro",
    "serial_number": "ABC123456789",
    "inspection_date": "2024-01-15T10:00:00Z",
    "status": "active",
    "billing_enabled": true,
    "amount": "500.00"
  }
]
```

#### **2.2 Reports Search Testing**
```bash
# Test reports search
GET /wp-json/laapak/v1/client/reports/search?q=iPhone
```

### **Phase 3: Invoices Integration Testing**

#### **3.1 Invoices Endpoint Testing**
```bash
# Test invoices endpoint
GET /wp-json/laapak/v1/client/invoices?limit=10&paymentStatus=paid
```

**Expected Response:**
```json
[
  {
    "id": "INV123456",
    "date": "2024-01-15T10:00:00Z",
    "total": "575.00",
    "paymentStatus": "paid",
    "paymentMethod": "cash"
  }
]
```

### **Phase 4: Warranty & Maintenance Testing**

#### **4.1 Warranty Endpoint Testing**
```bash
# Test warranty endpoint
GET /wp-json/laapak/v1/client/warranty
```

#### **4.2 Maintenance Endpoint Testing**
```bash
# Test maintenance endpoint
GET /wp-json/laapak/v1/client/maintenance
```

### **Phase 5: Error Handling Testing**

#### **5.1 Client ID Validation**
- [ ] Test with missing client ID
- [ ] Verify proper error messages
- [ ] Test re-authentication flow

#### **5.2 API Error Scenarios**
- [ ] Test with invalid API key
- [ ] Test with network timeouts
- [ ] Test with rate limiting
- [ ] Test with server errors

### **Phase 6: Health Check Testing**

#### **6.1 API Health Check**
```bash
# Test health check endpoint
GET /wp-json/laapak/v1/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "External API is healthy",
  "external_api": {
    "success": true,
    "message": "API key authentication successful"
  },
  "timestamp": 1704067200
}
```

## 🐛 **Common Issues & Solutions**

### **Issue 1: "Client ID not found" Error**
**Cause:** User not properly authenticated with external API
**Solution:** 
1. Clear user session
2. Re-login to trigger new authentication
3. Check if client exists in external system

### **Issue 2: API Connection Timeout**
**Cause:** Network issues or API server problems
**Solution:**
1. Check API health endpoint
2. Verify API key validity
3. Check network connectivity

### **Issue 3: Empty Data Responses**
**Cause:** Client has no data in external system
**Solution:**
1. Verify client ID is correct
2. Check if client has reports/invoices
3. Test with different client

## 📊 **Performance Testing**

### **Load Testing**
- [ ] Test with 100 concurrent users
- [ ] Monitor API response times
- [ ] Check for rate limiting
- [ ] Verify error handling under load

### **Data Volume Testing**
- [ ] Test with clients having 100+ reports
- [ ] Test with clients having 100+ invoices
- [ ] Verify pagination works correctly
- [ ] Check memory usage

## 🔒 **Security Testing**

### **Authentication Security**
- [ ] Verify API key is not exposed in client-side code
- [ ] Test with invalid API keys
- [ ] Verify client ID validation
- [ ] Test session management

### **Data Security**
- [ ] Verify only authorized data is accessible
- [ ] Test data filtering by client ID
- [ ] Check for data leakage
- [ ] Verify HTTPS usage

## 📝 **Testing Results Template**

### **Test Case: [Test Name]**
- **Status:** ✅ Pass / ❌ Fail
- **Response Time:** [X]ms
- **Error Messages:** [If any]
- **Notes:** [Additional observations]

### **Overall Integration Status**
- **Authentication:** ✅ / ❌
- **Reports:** ✅ / ❌
- **Invoices:** ✅ / ❌
- **Warranty:** ✅ / ❌
- **Maintenance:** ✅ / ❌
- **Error Handling:** ✅ / ❌

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] All tests passing
- [ ] API health check successful
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] Security validated

### **Post-Deployment**
- [ ] Monitor API usage
- [ ] Check error logs
- [ ] Verify user experience
- [ ] Test with real users
- [ ] Monitor performance metrics

## 📞 **Support & Troubleshooting**

### **Debug Information**
When reporting issues, include:
1. User ID and Client ID
2. API response codes
3. Error messages
4. Timestamp of issue
5. Browser/device information

### **Log Locations**
- WordPress error logs: `/wp-content/debug.log`
- API response logs: Check error_log() output
- Browser console: Check for JavaScript errors

### **Contact Information**
- **Technical Support:** [Your support contact]
- **API Documentation:** [API docs URL]
- **Status Page:** [Status page URL]

---

**Last Updated:** [Current Date]
**Version:** 2.0
**Status:** Ready for Testing
