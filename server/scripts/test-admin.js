const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const BASE_URL = 'http://localhost:5000/api';

async function runAdminTest() {
  console.log('==================================================');
  console.log('🛡️ ShopEZ Admin Dashboard Verification Test');
  console.log('==================================================\n');

  let adminToken = '';
  let customerToken = '';
  let tempUserId = '';
  let tempProductId = '';

  const results = {
    adminAuth: false,
    adminStats: false,
    userManagement: false,
    productBypass: false,
    allOrdersFetch: false,
    securityIsolation: false,
  };

  try {
    // 1. Admin Authentication & Login
    console.log('1. Authenticating as System Admin (admin@shopez.com)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@shopez.com',
        password: 'password123',
      }),
    });
    if (adminLoginRes.ok) {
      const data = await adminLoginRes.json();
      adminToken = data.token;
      console.log('   [✓] Admin logged in successfully.');
      results.adminAuth = true;
    } else {
      throw new Error(`Admin login failed: ${await adminLoginRes.text()}`);
    }

    // 2. Security isolation check: Verify customers cannot access admin endpoints
    console.log('\n2. Testing Security Isolation (Customer access to Admin APIs)...');
    const custLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@shopez.com',
        password: 'password123',
      }),
    });
    if (custLoginRes.ok) {
      const data = await custLoginRes.json();
      customerToken = data.token;
    } else {
      throw new Error(`Customer login failed`);
    }

    const unauthStatsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${customerToken}` },
    });
    if (unauthStatsRes.status === 403) {
      console.log('   [✓] Correctly blocked customer access to Admin stats (403 Forbidden).');
      results.securityIsolation = true;
    } else {
      throw new Error(`Security vulnerability: customer accessed admin stats with code ${unauthStatsRes.status}`);
    }

    // 3. Admin Overview statistics
    console.log('\n3. Testing Admin Overview Stats fetch...');
    const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (statsRes.ok) {
      const stats = await statsRes.json();
      console.log(`   [✓] Stats retrieved. Users: ${stats.userCount}, Products: ${stats.productCount}, Orders: ${stats.orderCount}`);
      results.adminStats = true;
    } else {
      throw new Error(`Stats fetch failed`);
    }

    // 4. User management (Promoting and Deleting users)
    console.log('\n4. Testing User Management (Registration, Promotion, and Deletion)...');
    // Create a temp customer to modify
    const tempUserEmail = `temp_cust_${Date.now()}@test.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Temp Test User',
        email: tempUserEmail,
        password: 'password123',
        role: 'customer',
      }),
    });
    if (regRes.ok) {
      const userObj = await regRes.json();
      tempUserId = userObj._id;
      console.log(`   [✓] Registered temporary customer: ${userObj.email}`);
    } else {
      throw new Error('Temp user registration failed');
    }

    // Promote temp customer to seller
    const promoteRes = await fetch(`${BASE_URL}/admin/users/${tempUserId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ role: 'seller' }),
    });
    if (promoteRes.ok) {
      const promotedUser = await promoteRes.json();
      if (promotedUser.role === 'seller') {
        console.log('   [✓] Admin successfully promoted user to seller role.');
      } else {
        throw new Error('Promoted user role did not change');
      }
    } else {
      throw new Error('Admin promotion endpoint failed');
    }

    // Delete the temp user
    const deleteRes = await fetch(`${BASE_URL}/admin/users/${tempUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (deleteRes.ok) {
      console.log('   [✓] Admin successfully deleted temporary user.');
      results.userManagement = true;
      tempUserId = ''; // cleared
    } else {
      throw new Error('Admin delete user endpoint failed');
    }

    // 5. Admin Product Management Bypass
    console.log('\n5. Testing Global Product Management Bypass (Admins modifying other products)...');
    // Login as a Seller to create a product
    const sellerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'seller@shopez.com',
        password: 'password123',
      }),
    });
    let sellerToken = '';
    if (sellerLoginRes.ok) {
      const data = await sellerLoginRes.json();
      sellerToken = data.token;
    } else {
      throw new Error('Seller login failed');
    }

    // Seller creates a product
    const addProductRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sellerToken}`,
      },
      body: JSON.stringify({
        name: 'Seller Chair',
        price: 49.99,
        description: 'Product owned by seller',
        category: 'Home & Living',
        image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27',
        stock: 5,
      }),
    });
    if (addProductRes.ok) {
      const prod = await addProductRes.json();
      tempProductId = prod._id;
      console.log(`   [✓] Seller created a product. ID: ${tempProductId}`);
    } else {
      throw new Error('Seller product creation failed');
    }

    // Admin updates stock on seller's product (bypass ownership check)
    const adminEditRes = await fetch(`${BASE_URL}/products/${tempProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ stock: 99 }),
    });
    if (adminEditRes.ok) {
      const updatedProduct = await adminEditRes.json();
      if (updatedProduct.stock === 99) {
        console.log('   [✓] Admin successfully bypassed ownership check and updated seller product stock.');
      } else {
        throw new Error('Product stock was not updated correctly');
      }
    } else {
      throw new Error(`Admin edit of seller product failed: ${await adminEditRes.text()}`);
    }

    // Admin deletes seller's product
    const adminDeleteRes = await fetch(`${BASE_URL}/products/${tempProductId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (adminDeleteRes.ok) {
      console.log('   [✓] Admin successfully bypassed ownership check and deleted seller product.');
      results.productBypass = true;
      tempProductId = ''; // cleared
    } else {
      throw new Error('Admin delete of seller product failed');
    }

    // 6. View all orders
    console.log('\n6. Testing global Orders history retrieval...');
    const ordersRes = await fetch(`${BASE_URL}/admin/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (ordersRes.ok) {
      const orders = await ordersRes.json();
      console.log(`   [✓] Retrieved list of all orders (${orders.length} orders total).`);
      results.allOrdersFetch = true;
    } else {
      throw new Error('Global orders retrieval failed');
    }

  } catch (err) {
    console.error('\n❌ Admin Verification Test failed:', err.message);
  } finally {
    // Cleanup any lingering data
    if (tempUserId || tempProductId) {
      console.log('\nCleanup lingering test users or products...');
      const mongoose = require('mongoose');
      const User = require('../models/User');
      const Product = require('../models/Product');
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopez');
      if (tempUserId) await User.deleteOne({ _id: tempUserId });
      if (tempProductId) await Product.deleteOne({ _id: tempProductId });
      await mongoose.connection.close();
    }

    console.log('\n==================================================');
    console.log('📊 ADMIN PANELS TEST STATUS REPORT');
    console.log('==================================================');
    console.log(`Admin Authenticated:            ${results.adminAuth ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Security Isolation:             ${results.securityIsolation ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Overview Stats fetching:        ${results.adminStats ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`User Promoting & Deleting:      ${results.userManagement ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Seller Product Override:        ${results.productBypass ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`All Orders Retrieval:           ${results.allOrdersFetch ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log('==================================================\n');

    process.exit(Object.values(results).every(v => v) ? 0 : 1);
  }
}

runAdminTest();
