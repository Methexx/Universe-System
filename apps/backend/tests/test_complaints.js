const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, options);
  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

async function testComplaintsFlow() {
  console.log('\n1. Logging in as admin...');
  const login = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@school.lk', password: 'adminpassword' }),
  });

  if (!login.ok || !login.data?.data?.token) {
    console.error('Login failed:', login.data);
    process.exit(1);
  }

  const token = login.data.data.token;
  const adminId = login.data.data.user.id;
  console.log('OK Logged in:', adminId);

  console.log('\n2. Fetching students...');
  const students = await request('/school/students', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!students.ok || !Array.isArray(students.data?.data) || students.data.data.length === 0) {
    console.error('No students available:', students.data);
    process.exit(1);
  }

  const studentId = students.data.data[0].id;
  console.log('OK Student selected:', studentId);

  console.log('\n3. Creating complaint...');
  const created = await request('/complaints', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      student_id: studentId,
      category: 'other',
      description: 'Test complaint from automated flow.',
    }),
  });

  if (!created.ok || !created.data?.data?.id) {
    console.error('Complaint creation failed:', created.data);
    process.exit(1);
  }

  const complaintId = created.data.data.id;
  console.log('OK Complaint created:', complaintId);

  console.log('\n4. Assigning complaint...');
  const assigned = await request(`/complaints/${complaintId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ assigned_to_id: adminId }),
  });

  if (!assigned.ok) {
    console.error('Complaint assign failed:', assigned.data);
    process.exit(1);
  }

  console.log('OK Complaint assigned to admin');

  console.log('\n5. Updating complaint status...');
  const updated = await request(`/complaints/${complaintId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'resolved',
      reply_note: 'Issue reviewed and marked resolved via test flow.',
    }),
  });

  if (!updated.ok) {
    console.error('Complaint status update failed:', updated.data);
    process.exit(1);
  }

  console.log('OK Complaint resolved');

  console.log('\n6. Fetching complaint by ID...');
  const one = await request(`/complaints/${complaintId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!one.ok) {
    console.error('Get by ID failed:', one.data);
    process.exit(1);
  }

  console.log('OK Complaint fetched by ID');

  console.log('\n7. Fetching admin complaint list...');
  const all = await request('/complaints/all', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!all.ok) {
    console.error('Get all failed:', all.data);
    process.exit(1);
  }

  console.log(`OK Admin complaints count: ${all.data?.data?.length ?? 0}`);
  console.log('\nALL COMPLAINT FLOW TESTS PASSED');
}

testComplaintsFlow().catch((error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});