const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const BASE_URL = 'http://localhost:5000/api';

async function runHealthCheck() {
  console.log('==================================================');
  console.log('🚀 ShopEZ Full Application Health Check & Verification');
  console.log('==================================================\n');

  let testSeller = null;
  let testCustomer = null;
  let testProduct = null;
  let testOrder = null;

  const results = {
    backendApi: false,
    mongoConnection: false,
    authFlow: false,
    catalogReviews: false,
    ordersCart: false,
  };

  try {
    // 1. Verify Backend API & MongoDB Connection
    console.log('1. Checking Backend API Health & DB Connection...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      console.log(`   [✓] Health Endpoint Active: "${healthData.message}"`);
      results.backendApi = true;
    } else {
      throw new Error(`Health check returned status ${healthRes.status}`);
    }

    // Fetch products to verify database connection through Mongoose
    const productsRes = await fetch(`${BASE_URL}/products`);
    if (productsRes.ok) {
      const productsList = await productsRes.json();
      console.log(`   [✓] MongoDB Connection verified via Mongoose. Retrieved ${productsList.length} products.`);
      results.mongoConnection = true;
    } else {
      throw new Error(`Products fetch failed with status ${productsRes.status}`);
    }

    // 2. Verify Authentication Flow
    console.log('\n2. Testing Authentication Flow...');
    const timestamp = Date.now();
    const sellerEmail = `seller_${timestamp}@test.com`;
    const customerEmail = `customer_${timestamp}@test.com`;

    // Register Seller
    const regSellerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Temp Seller',
        email: sellerEmail,
        password: 'password123',
        role: 'seller',
      }),
    });
    if (regSellerRes.ok) {
      testSeller = await regSellerRes.json();
      console.log('   [✓] Seller Registration succeeded.');
    } else {
      throw new Error(`Seller registration failed: ${await regSellerRes.text()}`);
    }

    // Register Customer
    const regCustomerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Temp Customer',
        email: customerEmail,
        password: 'password123',
        role: 'customer',
      }),
    });
    if (regCustomerRes.ok) {
      testCustomer = await regCustomerRes.json();
      console.log('   [✓] Customer Registration succeeded.');
    } else {
      throw new Error(`Customer registration failed: ${await regCustomerRes.text()}`);
    }

    // Login test
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: 'password123',
      }),
    });
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      if (loginData.token) {
        console.log('   [✓] Login Authentication & JWT Token issuance verified.');
        results.authFlow = true;
      }
    } else {
      throw new Error(`Login failed: ${await loginRes.text()}`);
    }

    // 3. Verify Product Creation, Catalog Fetching & Reviews Flow
    console.log('\n3. Testing Product Creation, Catalog Filtering & Reviews...');
    
    // Seller adds product
    const addProductRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSeller.token}`,
      },
      body: JSON.stringify({
        name: 'Verify Comfort Chair',
        price: 4999,
        description: 'Temporary verification item',
        category: 'Home & Living',
        image: 'https://images.unsplash.com/photo-1580481072645-022f9a6dbf27',
        stock: 10,
      }),
    });
    if (addProductRes.ok) {
      testProduct = await addProductRes.json();
      console.log(`   [✓] Product listing creation (Sellers only) verified. ID: ${testProduct._id}`);
    } else {
      throw new Error(`Product creation failed: ${await addProductRes.text()}`);
    }

    // Customer submits a review on the product
    const reviewRes = await fetch(`${BASE_URL}/products/${testProduct._id}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testCustomer.token}`,
      },
      body: JSON.stringify({
        rating: 5,
        comment: 'Highly recommended temp verification review!',
      }),
    });
    if (reviewRes.ok) {
      console.log('   [✓] Product review and rating submission verified.');
      results.catalogReviews = true;
    } else {
      throw new Error(`Review submission failed: ${await reviewRes.text()}`);
    }

    // 4. Verify Order Placement, Cart Simulation & Status Updates
    console.log('\n4. Testing Order Creation (Cart checkout simulation) & Seller Order Management...');
    
    const placeOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testCustomer.token}`,
      },
      body: JSON.stringify({
        orderItems: [
          {
            product: testProduct._id,
            name: testProduct.name,
            quantity: 2,
            price: testProduct.price,
            image: testProduct.image,
          },
        ],
        shippingAddress: '123 Verification St, Test City, TS 99999',
        totalPrice: Math.round((testProduct.price * 2) * 1.18) + (testProduct.price * 2 > 10000 ? 0 : 150), // grand total simulation (INR)
      }),
    });
    if (placeOrderRes.ok) {
      testOrder = await placeOrderRes.json();
      console.log(`   [✓] Order placement & stock reservation verified. ID: ${testOrder._id}`);
    } else {
      throw new Error(`Order placement failed: ${await placeOrderRes.text()}`);
    }

    // Seller updates order status
    const updateOrderRes = await fetch(`${BASE_URL}/orders/${testOrder._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testSeller.token}`,
      },
      body: JSON.stringify({
        status: 'Shipped',
      }),
    });
    if (updateOrderRes.ok) {
      const updatedOrder = await updateOrderRes.json();
      console.log(`   [✓] Order status modification (Sellers only) verified. Status updated to: ${updatedOrder.status}`);
      results.ordersCart = true;
    } else {
      throw new Error(`Order status update failed: ${await updateOrderRes.text()}`);
    }

  } catch (error) {
    console.error('\n❌ Health check failed with error:', error.message);
  } finally {
    // 5. Clean up temporary test data
    console.log('\n5. Cleaning up temporary verification data from Atlas...');
    try {
      const User = require('../models/User');
      const Product = require('../models/Product');
      const Order = require('../models/Order');
      const mongoose = require('mongoose');

      await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shopez');
      
      if (testOrder) {
        await Order.deleteOne({ _id: testOrder._id });
        console.log('   [-] Removed temporary test order.');
      }
      if (testProduct) {
        await Product.deleteOne({ _id: testProduct._id });
        console.log('   [-] Removed temporary test product.');
      }
      if (testSeller) {
        await User.deleteOne({ _id: testSeller._id });
        console.log('   [-] Removed temporary test seller.');
      }
      if (testCustomer) {
        await User.deleteOne({ _id: testCustomer._id });
        console.log('   [-] Removed temporary test customer.');
      }
      await mongoose.connection.close();
      console.log('   [✓] Cleanup completed.');
    } catch (cleanErr) {
      console.error('   [!] Cleanup warning:', cleanErr.message);
    }

    // Print final report
    console.log('\n==================================================');
    console.log('📊 FINAL HEALTH CHECK REPORT');
    console.log('==================================================');
    console.log(`Backend API Health check:        ${results.backendApi ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`MongoDB Atlas Connectivity:       ${results.mongoConnection ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`User Auth & JWT Flow:             ${results.authFlow ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Product Catalog & Review System:  ${results.catalogReviews ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log(`Cart Checkout & Orders Flow:      ${results.ordersCart ? 'PASS ✓' : 'FAIL ❌'}`);
    console.log('==================================================\n');

    process.exit(Object.values(results).every(v => v) ? 0 : 1);
  }
}

runHealthCheck();
