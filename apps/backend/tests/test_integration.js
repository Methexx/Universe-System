// Using global fetch (Node 18+)

const BASE_URL = 'http://127.0.0.1:5000/api';
let adminToken = '';
let newUserId = '';

async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---\n');

  try {
    // 1. LOGIN ADMIN
    console.log('1. Logging in as Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.lk', password: 'adminpassword' })
    });
    const loginData = await loginRes.json();
    console.log('Admin Login Result:', loginData.success ? '✅ Success' : '❌ Failed', loginData.message || loginData.error);
    if (!loginData.success) throw new Error('Admin login failed');
    adminToken = loginData.data.token;


    // 2. REGISTER A NEW USER (using Prisma client because OTP verify is complex for E2E script without email access right now)
    console.log('\n2. Injecting a pending user to the DB for testing...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const randomEmail = `test_${Date.now()}@example.com`;
    const bcrypt = require('bcryptjs'); // Assuming you use it or similar, actually just inject direct hash
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = await prisma.user.create({
      data: {
        email: randomEmail,
        password_hash: hashedPassword,
        full_name: 'E2E Testing User',
        role: 'pending',
        is_active: true
      }
    });
    newUserId = mockUser.id;
    console.log('Register Result: ✅ Success Injected', newUserId);

    // 3. Getting pending users (Admin)...
    const pendingRes = await fetch(`${BASE_URL}/users/pending`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const pendingData = await pendingRes.json();
    console.log('Pending Users Result:', pendingData.success ? '✅ Success' : '❌ Failed', `Found ${pendingData.data?.length || 0} users`);
    
    if (pendingData.data && pendingData.data.length > 0) {
      newUserId = pendingData.data[0].id;
    }

    // 4. TEST GET ME
    console.log('\n4. Getting own profile [GET /users/me]...');
    const meRes = await fetch(`${BASE_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const meData = await meRes.json();
    console.log('Get Me Result:', meData.success ? '✅ Success' : '❌ Failed', meData.data?.full_name);

    // 5. TEST UPDATE ME
    console.log('\n5. Updating own profile [PUT /users/me]...');
    const updateMeRes = await fetch(`${BASE_URL}/users/me`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ full_name: 'System Principal Updated' })
    });
    const updateMeData = await updateMeRes.json();
    console.log('Update Me Result:', updateMeData.success ? '✅ Success' : '❌ Failed', updateMeData.data?.full_name);

    if (newUserId) {
      // 6. PROMOTE USER
      console.log(`\n6. Promoting user ${newUserId} to teacher [PUT /users/:id/promote]...`);
      const promoteRes = await fetch(`${BASE_URL}/users/${newUserId}/promote`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'teacher' })
      });
      const promoteData = await promoteRes.json();
      console.log('Promote Result:', promoteData.success ? '✅ Success' : '❌ Failed', promoteData);

      // 7. SUSPEND USER
      console.log(`\n7. Suspending user ${newUserId} [PUT /users/:id/suspend]...`);
      const suspendRes = await fetch(`${BASE_URL}/users/${newUserId}/suspend`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const suspendData = await suspendRes.json();
      console.log('Suspend Result:', suspendData.success ? '✅ Success' : '❌ Failed', suspendData);

      // 8. UNSUSPEND USER
      console.log(`\n8. Unsuspending user ${newUserId} [PUT /users/:id/unsuspend]...`);
      const unsuspendRes = await fetch(`${BASE_URL}/users/${newUserId}/unsuspend`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      const unsuspendData = await unsuspendRes.json();
      console.log('Unsuspend Result:', unsuspendData.success ? '✅ Success' : '❌ Failed', unsuspendData);
    } else {
      console.log('\n⚠️ Skipping role management endpoints (no pending user found to manipulate).');
    }

  } catch (err) {
    console.error('Test Execution Error:', err);
  }
}

runTests();