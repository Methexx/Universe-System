const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let studentQr = ''; // We will grab the first student's QR code

async function loginAdmin() {
  console.log('1. Logging in as admin...');
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.lk', password: 'adminpassword' })
  });
  const data = await res.json();
  if (data.success) {
    adminToken = data.data.token;
    console.log('✅ Logged in successfully');
  } else {
    console.error('❌ Login failed:', data);
    process.exit(1);
  }
}

async function getAStudent() {
  console.log('\n2. Fetching existing students to find a QR code...');
  const res = await fetch(`${API_URL}/school/students`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  
  if (data.success && data.data.length > 0) {
    const student = data.data[0];
    studentQr = student.qr_code;
    console.log(`✅ Found student: ${student.full_name} (QR: ${studentQr})`);
  } else {
    console.log('⚠️ No students found, we must create one first or run test_school.js');
    process.exit(1);
  }
}

async function scanGate(direction) {
  console.log(`\n3. Simulating Security Scan: ${direction}...`);
  const res = await fetch(`${API_URL}/gate/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      qr_code: studentQr,
      direction: direction,
      method: 'qr'
    })
  });
  
  const data = await res.json();
  if (data.success) {
    console.log(`✅ Scan Success! Mode: ${direction}`);
    console.log(data);
  } else {
    console.error(`❌ Scan Failed:`, data);
  }
}

async function viewRecentEvents() {
  console.log('\n4. Viewing Recent Gate Events...');
  const res = await fetch(`${API_URL}/gate/events`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  
  if (data.success) {
    console.log(`✅ Events Retreived:`);
    console.log(JSON.stringify(data.data, null, 2));
  } else {
    console.error(`❌ Failed to retrieve events:`, data);
  }
}

async function runTests() {
  await loginAdmin();
  await getAStudent();
  await scanGate('IN');
  await new Promise(r => setTimeout(r, 1000)); // sleep 1 sec
  await scanGate('OUT');
  await viewRecentEvents();
  console.log('\n🎉 ALL GATE TESTS PASSED!');
}

runTests();
