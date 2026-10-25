// backend/tests/api.test.js
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const http = require('node:http');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_for_e2e_testing_12345';

// Import express app
const { app } = require('../server');

let server;
let baseUrl;

// Test variables to store state across test steps
let sellerToken = '';
let buyer1Token = '';
let buyer2Token = '';
let sellerUser = null;
let buyer1User = null;
let buyer2User = null;

let testItemId = null;
let testItem2Id = null;
let testItem3Id = null;

let buyer1RequestId = null;
let buyer2RequestId = null;
let cancelTestRequestId = null;

const uniqueSuffix = Date.now();

// Helper to make fetch requests to the test server
async function request(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  const fetchOptions = {
    method: options.method || 'GET',
    headers
  };
  
  if (options.body) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return {
    status: response.status,
    headers: response.headers,
    data
  };
}

describe('Waste Marketplace End-to-End Test Suite', () => {
  before(async () => {
    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`🧪 Test server started on ${baseUrl}`);
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log('🧪 Test server stopped.');
    }
  });

  // 1. Health & Smoke Check
  describe('1. Health Check', () => {
    test('GET /api/ping returns 200 with success message', async () => {
      const res = await request('/api/ping');
      assert.equal(res.status, 200);
      assert.equal(res.data.message, 'Backend is working 🚀');
    });
  });

  // 2. Authentication & Authorization
  describe('2. Authentication & Registration', () => {
    test('POST /api/auth/register registers a Seller successfully', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Sarah Seller',
          email: `sarah.seller_${uniqueSuffix}@example.com`,
          password: 'Password123!',
          role: 'seller',
          phone: '+1 512-555-0101',
          address: '100 Green Tech Blvd',
          city: 'Austin',
          pincode: '78701'
        }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.token, 'Token should be returned');
      assert.equal(res.data.user.role, 'seller');
      assert.equal(res.data.user.email, `sarah.seller_${uniqueSuffix}@example.com`);
      sellerToken = res.data.token;
      sellerUser = res.data.user;
    });

    test('POST /api/auth/register registers Buyer 1 (Collector) successfully', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Bob Buyer',
          email: `bob.buyer_${uniqueSuffix}@example.com`,
          password: 'Password123!',
          role: 'collector',
          phone: '+1 512-555-0202',
          address: '200 Circular Way',
          city: 'Austin',
          pincode: '78702'
        }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.token);
      assert.equal(res.data.user.role, 'collector');
      buyer1Token = res.data.token;
      buyer1User = res.data.user;
    });

    test('POST /api/auth/register registers Buyer 2 successfully', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Alice Recycler',
          email: `alice.recycler_${uniqueSuffix}@example.com`,
          password: 'Password123!',
          role: 'collector',
          phone: '+1 512-555-0303',
          address: '300 Eco Drive',
          city: 'Austin',
          pincode: '78703'
        }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.token);
      buyer2Token = res.data.token;
      buyer2User = res.data.user;
    });

    test('POST /api/auth/register rejects duplicate email with 400', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Sarah Duplicate',
          email: `sarah.seller_${uniqueSuffix}@example.com`,
          password: 'Password123!',
          role: 'seller'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /already registered/i);
    });

    test('POST /api/auth/register validates invalid email format with 400', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Invalid Email User',
          email: 'not-a-valid-email',
          password: 'Password123!'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /valid email/i);
    });

    test('POST /api/auth/register validates short password (< 6 chars) with 400', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Short Password User',
          email: `short_${uniqueSuffix}@example.com`,
          password: '123'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /at least 6 characters/i);
    });

    test('POST /api/auth/login authenticates registered user and returns JWT token', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: {
          email: `sarah.seller_${uniqueSuffix}@example.com`,
          password: 'Password123!'
        }
      });

      assert.equal(res.status, 200);
      assert.ok(res.data.token);
      assert.equal(res.data.user.email, `sarah.seller_${uniqueSuffix}@example.com`);
    });

    test('POST /api/auth/login rejects incorrect password with 400', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: {
          email: `sarah.seller_${uniqueSuffix}@example.com`,
          password: 'WrongPassword999!'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /Invalid email or password/i);
    });

    test('POST /api/auth/login rejects unregistered email with 400', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: {
          email: `ghost_${uniqueSuffix}@example.com`,
          password: 'Password123!'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /Invalid email or password/i);
    });
  });

  // 3. Auth Middleware Hardening
  describe('3. Auth Middleware Security', () => {
    test('Protected route without token returns 401 Unauthorized', async () => {
      const res = await request('/api/waste/my');
      assert.equal(res.status, 401);
      assert.match(res.data.message, /No token/i);
    });

    test('Protected route with malformed/invalid token returns 401', async () => {
      const res = await request('/api/waste/my', {
        headers: { Authorization: 'Bearer this.is.an.invalid.token' }
      });
      assert.equal(res.status, 401);
      assert.match(res.data.message, /Invalid or expired token/i);
    });
  });

  // 4. Waste Items CRUD
  describe('4. Waste Items Management', () => {
    test('POST /api/waste creates a new waste item listing', async () => {
      const res = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'MacBook Motherboards & Circuit Boards',
          category: 'E-Waste',
          weight: 42.5,
          basePrice: 650.00,
          address: '100 Green Tech Blvd',
          city: 'Austin',
          pincode: '78701'
        }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.itemId);
      testItemId = res.data.itemId;
    });

    test('POST /api/waste creates a second waste item listing for deletion test', async () => {
      const res = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Clean Aluminum Cans & Scrap',
          category: 'Metal',
          weight: 18.0,
          basePrice: 90.00,
          address: '102 Green Tech Blvd',
          city: 'Austin',
          pincode: '78701'
        }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.itemId);
      testItem2Id = res.data.itemId;
    });

    test('POST /api/waste rejects negative weight with 400', async () => {
      const res = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Test Negative Weight',
          category: 'E-Waste',
          weight: -10,
          basePrice: 50,
          address: '123 Fake St',
          city: 'Austin',
          pincode: '78701'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /positive number/i);
    });

    test('POST /api/waste rejects negative price with 400', async () => {
      const res = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Test Negative Price',
          category: 'E-Waste',
          weight: 10,
          basePrice: -25,
          address: '123 Fake St',
          city: 'Austin',
          pincode: '78701'
        }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /zero or a positive number/i);
    });

    test('POST /api/waste rejects missing required fields with 400', async () => {
      const res = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Missing Category Item'
        }
      });

      assert.equal(res.status, 400);
    });

    test('GET /api/waste returns open marketplace listings', async () => {
      const res = await request('/api/waste', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.length > 0);

      const found = res.data.find(item => item.id === testItemId);
      assert.ok(found, 'Created test item should appear in open marketplace');
      assert.equal(found.title, 'MacBook Motherboards & Circuit Boards');
      assert.equal(found.sellerName, 'Sarah Seller');
    });

    test('GET /api/waste?category=E-Waste filters correctly by category', async () => {
      const res = await request('/api/waste?category=E-Waste', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      for (const item of res.data) {
        assert.equal(item.category, 'E-Waste');
      }
    });

    test('GET /api/waste?city=Austin filters correctly by city', async () => {
      const res = await request('/api/waste?city=Austin', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      for (const item of res.data) {
        assert.equal(item.city, 'Austin');
      }
    });

    test('GET /api/waste?search=Motherboards searches correctly by title', async () => {
      const res = await request('/api/waste?search=Motherboards', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.some(i => i.id === testItemId));
    });

    test('GET /api/waste?sort=price_asc sorts items in ascending order', async () => {
      const res = await request('/api/waste?sort=price_asc', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      for (let i = 0; i < Math.min(res.data.length - 1, 20); i++) {
        assert.ok(res.data[i].base_price <= res.data[i + 1].base_price);
      }
    });

    test('GET /api/waste/my returns seller specific items with status', async () => {
      const res = await request('/api/waste/my', {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.some(i => i.id === testItemId));
      assert.ok(res.data.some(i => i.id === testItem2Id));
    });

    test('DELETE /api/waste/:id forbids non-owner from deleting listing with 403', async () => {
      const res = await request(`/api/waste/${testItem2Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(res.status, 403);
      assert.match(res.data.message, /Forbidden/i);
    });

    test('DELETE /api/waste/:id allows seller to delete their unsold listing', async () => {
      const res = await request(`/api/waste/${testItem2Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      assert.equal(res.status, 200);
      assert.match(res.data.message, /deleted successfully/i);

      // Verify item no longer in seller's listings
      const checkRes = await request('/api/waste/my', {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      assert.ok(!checkRes.data.some(i => i.id === testItem2Id));
    });
  });

  // 5. Requests Workflow & State Transitions
  describe('5. Requests Workflow & Auto-Resolution', () => {
    test('POST /api/requests prevents seller from requesting their own item with 400', async () => {
      const res = await request('/api/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: { waste_item_id: testItemId }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /cannot request your own/i);
    });

    test('POST /api/requests allows Buyer 1 to send collection request', async () => {
      const res = await request('/api/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer1Token}` },
        body: { waste_item_id: testItemId }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.requestId);
      buyer1RequestId = res.data.requestId;
    });

    test('POST /api/requests prevents duplicate request for same item with 400', async () => {
      const res = await request('/api/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer1Token}` },
        body: { waste_item_id: testItemId }
      });

      assert.equal(res.status, 400);
      assert.match(res.data.message, /already sent a request/i);
    });

    test('POST /api/requests allows Buyer 2 to also send competing request for same item', async () => {
      const res = await request('/api/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer2Token}` },
        body: { waste_item_id: testItemId }
      });

      assert.equal(res.status, 201);
      assert.ok(res.data.requestId);
      buyer2RequestId = res.data.requestId;
    });

    test('GET /api/requests/my allows Buyer to track sent requests', async () => {
      const res = await request('/api/requests/my', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      const reqRecord = res.data.find(r => r.id === buyer1RequestId);
      assert.ok(reqRecord);
      assert.equal(reqRecord.status, 'PENDING');
      assert.equal(reqRecord.title, 'MacBook Motherboards & Circuit Boards');
    });

    test('GET /api/requests/seller allows Seller to view incoming requests with buyer info', async () => {
      const res = await request('/api/requests/seller', {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.data));
      const req1 = res.data.find(r => r.id === buyer1RequestId);
      const req2 = res.data.find(r => r.id === buyer2RequestId);
      assert.ok(req1, 'Buyer 1 request should be visible to seller');
      assert.ok(req2, 'Buyer 2 request should be visible to seller');
      assert.equal(req1.buyerName, 'Bob Buyer');
      assert.equal(req2.buyerName, 'Alice Recycler');
    });

    test('PUT /api/requests/:id forbids non-owner seller from modifying status with 403', async () => {
      const res = await request(`/api/requests/${buyer1RequestId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${buyer1Token}` }, // buyer trying to accept
        body: { status: 'ACCEPTED' }
      });

      assert.equal(res.status, 403);
    });

    test('PUT /api/requests/:id accepts Buyer 1 request and auto-rejects competing Buyer 2 request', async () => {
      const res = await request(`/api/requests/${buyer1RequestId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: { status: 'ACCEPTED' }
      });

      assert.equal(res.status, 200);
      assert.match(res.data.message, /accepted/i);

      // Verify Buyer 1 request is ACCEPTED
      const b1Check = await request('/api/requests/my', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      const b1Req = b1Check.data.find(r => r.id === buyer1RequestId);
      assert.equal(b1Req.status, 'ACCEPTED');

      // Verify Buyer 2 request was automatically set to REJECTED
      const b2Check = await request('/api/requests/my', {
        headers: { Authorization: `Bearer ${buyer2Token}` }
      });
      const b2Req = b2Check.data.find(r => r.id === buyer2RequestId);
      assert.equal(b2Req.status, 'REJECTED');
    });

    test('PUT /api/requests/:id completes collection and closes waste item listing', async () => {
      const res = await request(`/api/requests/${buyer1RequestId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: { status: 'COMPLETED' }
      });

      assert.equal(res.status, 200);
      assert.match(res.data.message, /completed/i);

      // Verify item is no longer in open marketplace
      const marketRes = await request('/api/waste', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(marketRes.status, 200);
      assert.ok(!marketRes.data.some(i => i.id === testItemId));

      // Verify item shows as CLOSED in seller dashboard
      const sellerItems = await request('/api/waste/my', {
        headers: { Authorization: `Bearer ${sellerToken}` }
      });
      const closedItem = sellerItems.data.find(i => i.id === testItemId);
      assert.equal(closedItem.status, 'CLOSED');
    });

    test('Buyer can cancel their pending request (DELETE /api/requests/:id)', async () => {
      // 1. Seller creates item 3
      const itemRes = await request('/api/waste', {
        method: 'POST',
        headers: { Authorization: `Bearer ${sellerToken}` },
        body: {
          title: 'Surplus Cardboard Packaging',
          category: 'Paper',
          weight: 35.0,
          basePrice: 40.00,
          address: '104 Green Tech Blvd',
          city: 'Austin',
          pincode: '78701'
        }
      });
      testItem3Id = itemRes.data.itemId;

      // 2. Buyer 1 requests item 3
      const reqRes = await request('/api/requests', {
        method: 'POST',
        headers: { Authorization: `Bearer ${buyer1Token}` },
        body: { waste_item_id: testItem3Id }
      });
      cancelTestRequestId = reqRes.data.requestId;

      // 3. Buyer 2 tries to cancel Buyer 1's request -> 403 Forbidden
      const unauthCancel = await request(`/api/requests/${cancelTestRequestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${buyer2Token}` }
      });
      assert.equal(unauthCancel.status, 403);

      // 4. Buyer 1 cancels their own request -> 200 OK
      const cancelRes = await request(`/api/requests/${cancelTestRequestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.equal(cancelRes.status, 200);
      assert.match(cancelRes.data.message, /cancelled successfully/i);

      // 5. Verify request is removed from buyer's list
      const checkList = await request('/api/requests/my', {
        headers: { Authorization: `Bearer ${buyer1Token}` }
      });
      assert.ok(!checkList.data.some(r => r.id === cancelTestRequestId));
    });
  });

  // 6. Persistence Verification
  describe('6. Data Integrity & Persistence', () => {
    test('Persisted records remain queryable in database', async () => {
      const getDb = require('../config/db');
      const db = await getDb;
      
      const user = await db.get('SELECT * FROM users WHERE email = ?', [`sarah.seller_${uniqueSuffix}@example.com`]);
      assert.ok(user, 'Seller user must be saved in SQLite');
      assert.equal(user.role, 'seller');

      const completedItem = await db.get('SELECT * FROM waste_items WHERE id = ?', [testItemId]);
      assert.ok(completedItem, 'Item must be saved in SQLite');
      assert.equal(completedItem.status, 'CLOSED');

      const completedReq = await db.get('SELECT * FROM requests WHERE id = ?', [buyer1RequestId]);
      assert.ok(completedReq, 'Request must be saved in SQLite');
      assert.equal(completedReq.status, 'COMPLETED');
    });
  });
});
