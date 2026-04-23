const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let studentId = ''; // We will grab the first student's ID

async function loginAdmin() {
  console.log('\n1. Logging in as admin...');
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

async function fetchStudent() {
  console.log('\n2. Fetching existing students to mark attendance for...');
  const res = await fetch(`${API_URL}/school/students?limit=1`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success && data.data.length > 0) {
    const student = data.data[0];
    studentId = student.id;
    console.log(`✅ Found student: ${student.full_name} (ID: ${studentId})`);
  } else {
    console.error('❌ Failed to fetch a student or no students found:', data);
    process.exit(1);
  }
}

async function markAttendance() {
  console.log('\n3. Simulating Teacher Marking Attendance as PRESENT...');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const res = await fetch(`${API_URL}/attendance/mark`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ 
      student_id: studentId,
      status: 'present',
      date: today,
      remarks: 'Arrived on time for the morning assembly'
    })
  });
  const data = await res.json();
  if (data.success) {
    console.log('✅ Mark Success!\n', data);
  } else {
    console.error('❌ Failed to mark attendance:', data);
    process.exit(1);
  }
}

async function getAttendanceRecords() {
  console.log('\n4. Viewing Today\'s Attendance Records...');
  const today = new Date().toISOString().split('T')[0];
  const res = await fetch(`${API_URL}/attendance?date=${today}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success) {
    console.log('✅ Records Retrieved:\n', JSON.stringify(data.data, null, 2));
  } else {
    console.error('❌ Failed to retrieve attendance records:', data);
    process.exit(1);
  }
}

async function runTests() {
  await loginAdmin();
  await fetchStudent();
  await markAttendance();
  await getAttendanceRecords();
  console.log('\n🎉 ALL ATTENDANCE TESTS PASSED!');
}

runTests();