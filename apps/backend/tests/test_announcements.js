const API_URL = 'http://localhost:5000/api';
let adminToken = '';
let announcementId = '';

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

async function createAnnouncement() {
  console.log('\n2. Creating a new school-wide announcement...');
  const res = await fetch(`${API_URL}/announcements`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ 
      title: "Tomorrow is a Holiday",
      content: "Due to heavy rains predicted for tomorrow, the school will remain closed. Stay safe!",
      scope: "school_wide",
      target: "all"
    })
  });
  const data = await res.json();
  if (data.success) {
    announcementId = data.data.id;
    console.log('✅ Announcement Created!\n', data.data);
  } else {
    console.error('❌ Failed to create announcement:', data);
    process.exit(1);
  }
}

async function getAnnouncements() {
  console.log('\n3. Fetching recent announcements...');
  const res = await fetch(`${API_URL}/announcements?limit=5`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success) {
    console.log('✅ Fetch Success! Found entries:', data.data.length);
  } else {
    console.error('❌ Failed to fetch announcements:', data);
    process.exit(1);
  }
}

async function deleteAnnouncement() {
  console.log(`\n4. Deleting the announcement (${announcementId})...`);
  const res = await fetch(`${API_URL}/announcements/${announcementId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await res.json();
  if (data.success) {
    console.log('✅ Delete Success!\n', data);
  } else {
    console.error('❌ Failed to delete announcement:', data);
    process.exit(1);
  }
}


async function runTests() {
  await loginAdmin();
  await createAnnouncement();
  await getAnnouncements();
  await deleteAnnouncement();
  console.log('\n🎉 ALL ANNOUNCEMENT TESTS PASSED!');
}

runTests();