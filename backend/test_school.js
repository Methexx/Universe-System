const BASE_URL = 'http://127.0.0.1:5000/api';
let adminToken = '';
let gradeId = '';
let classId = '';

async function runSchoolTests() {
  console.log('--- STARTING SCHOOL MODULE TESTS ---\n');

  try {
    // 1. LOGIN ADMIN
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@school.lk', password: 'adminpassword' })
    });
    const loginData = await loginRes.json();
    adminToken = loginData.data?.token;
    console.log('1. Admin Login:', adminToken ? '✅ Success' : '❌ Failed');

    if (!adminToken) return;

    // 2. CREATE A GRADE
    const gradeName = "Grade 10 " + Date.now().toString().slice(-4);
    const gradeRes = await fetch(`${BASE_URL}/school/grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({ name: gradeName })
    });
    const gradeData = await gradeRes.json();
    gradeId = gradeData.data?.id;
    console.log('2. Create Grade:', gradeData.success ? `✅ Success (${gradeData.data.name})` : '❌ Failed', gradeData);

    // 3. CREATE A CLASS
    if (gradeId) {
      const classRes = await fetch(`${BASE_URL}/school/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ 
          school_grade_id: gradeId,
          name: "Class A",
          subject: "General"
        })
      });
      const classData = await classRes.json();
      classId = classData.data?.id;
      console.log('3. Create Class:', classData.success ? `✅ Success (${classData.data.name})` : '❌ Failed', classId);
    }

    // 4. CREATE A STUDENT
    if (classId) {
      const studentIdNo = "SCH-" + Date.now().toString().slice(-6);
      const studentRes = await fetch(`${BASE_URL}/school/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ 
          full_name: "Test Student " + Date.now().toString().slice(-4),
          date_of_birth: "2010-01-01",
          class_id: classId,
          student_id_no: studentIdNo
        })
      });
      const studentData = await studentRes.json();
      console.log('4. Create Student:', studentData.success ? `✅ Success (QR Code UUID: ${studentData.data.qr_code})` : '❌ Failed', studentData);
    }

  } catch (e) {
    console.error(e);
  }
}

runSchoolTests();