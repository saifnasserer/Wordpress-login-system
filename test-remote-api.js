/**
 * Test Remote API Key Endpoints
 * This script tests the API key authentication on the remote server
 */

const fetch = require('node-fetch');

class RemoteAPITester {
    constructor(baseUrl = 'https://reports.laapak.com/api/external') {
        this.baseUrl = baseUrl;
        this.apiKey = 'laapak-api-key-2024';
    }

    async testHealthCheck() {
        try {
            console.log('🧪 Testing remote API key health check...');
            console.log(`URL: ${this.baseUrl}/health`);
            
            const response = await fetch(`${this.baseUrl}/health`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Error response:', errorText);
                throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Remote health check successful:', data);
            return true;
        } catch (error) {
            console.error('❌ Remote health check failed:', error.message);
            return false;
        }
    }

    async testClientLookup(phone) {
        try {
            console.log(`🧪 Testing remote client lookup for phone: ${phone}`);
            console.log(`URL: ${this.baseUrl}/clients/lookup?phone=${phone}`);
            
            const response = await fetch(`${this.baseUrl}/clients/lookup?phone=${phone}`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.status === 404) {
                console.log('ℹ️ Client not found (expected for test phone)');
                const errorData = await response.json();
                console.log('404 Response:', errorData);
                return { found: false, status: 404 };
            }

            if (!response.ok) {
                const errorData = await response.text();
                console.log('Error response:', errorData);
                throw new Error(`Client lookup failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ Remote client lookup successful:', data);
            return data;
        } catch (error) {
            console.error('❌ Remote client lookup failed:', error.message);
            return { error: error.message };
        }
    }

    async testCORS() {
        try {
            console.log('🧪 Testing remote CORS configuration...');
            
            const response = await fetch(`${this.baseUrl}/health`, {
                headers: {
                    'x-api-key': this.apiKey,
                    'Content-Type': 'application/json',
                    'Origin': 'https://reports.laapak.com'
                }
            });

            console.log('CORS Response status:', response.status);
            console.log('CORS Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                console.log('✅ CORS test successful');
                return true;
            } else {
                console.log('❌ CORS test failed');
                return false;
            }
        } catch (error) {
            console.error('❌ CORS test failed:', error.message);
            return false;
        }
    }

    async testAllEndpoints() {
        console.log('🚀 Starting Remote API Key Tests');
        console.log(`Base URL: ${this.baseUrl}`);
        console.log(`API Key: ${this.apiKey}\n`);

        // Test 1: Health Check
        console.log('='.repeat(60));
        console.log('TEST 1: Health Check');
        console.log('='.repeat(60));
        const healthOk = await this.testHealthCheck();
        
        if (!healthOk) {
            console.log('\n❌ Health check failed - API key endpoints may not be deployed');
            console.log('💡 Possible solutions:');
            console.log('   1. Deploy the new API key routes to production');
            console.log('   2. Check if the server is running');
            console.log('   3. Verify the API key is correct');
            return;
        }

        // Test 2: CORS
        console.log('\n' + '='.repeat(60));
        console.log('TEST 2: CORS Configuration');
        console.log('='.repeat(60));
        await this.testCORS();

        // Test 3: Client Lookup
        console.log('\n' + '='.repeat(60));
        console.log('TEST 3: Client Lookup');
        console.log('='.repeat(60));
        await this.testClientLookup('01128260256');

        // Test 4: Different phone numbers
        console.log('\n' + '='.repeat(60));
        console.log('TEST 4: Multiple Phone Numbers');
        console.log('='.repeat(60));
        const testPhones = ['01128260256', '1234567890', '9876543210'];
        
        for (const phone of testPhones) {
            console.log(`\nTesting phone: ${phone}`);
            await this.testClientLookup(phone);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Remote API Key Tests Complete');
        console.log('='.repeat(60));
    }
}

// Run tests
async function main() {
    const tester = new RemoteAPITester();
    await tester.testAllEndpoints();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = RemoteAPITester;
