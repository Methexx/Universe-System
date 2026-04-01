const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let teacherToken = '';
let myId = '';
let otherId = 'e09337a9-c1f9-4e90-9c61-f2089edf3e7c'; // Replace if needed
let studentId = 'ff0b90e0-ab8a-497e-9c78-09d40b4e6e89';

async function loginAsTeacher() {
  const res = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@school.lk',
    password: 'adminpassword'
  });
  teacherToken = res.data.data.token;
  myId = res.data.data.user.id;
  console.log('Logged in as Teacher:', myId);
}

async function testMessages() {
  try {
    await loginAsTeacher();
    const config = { headers: { Authorization: `Bearer ${teacherToken}` } };

    // AI Draft
    try {
      console.log('Testing /messages/ai-draft...');
      const draftRes = await axios.post(`${BASE_URL}/messages/ai-draft`, { student_id: studentId }, config);
      console.log('AI Draft:', draftRes.data);
    } catch (e) {
      console.error('Draft error:', e.response?.data || e.message);
    }

    // Send Message
    let msgId;
    try {
      console.log('Testing /messages/send...');
      const sendRes = await axios.post(`${BASE_URL}/messages/send`, {
        receiver_id: myId, // Sending to oneself for testing if others don't exist
        student_id: studentId,
        content: 'Test message.'
      }, config);
      msgId = sendRes.data.message_id;
      console.log('Send Message result:', sendRes.data);
    } catch (e) {
      console.error('Send error:', e.response?.data || e.message);
    }

    // Inbox
    try {
      console.log('Testing /messages/inbox...');
      const inboxRes = await axios.get(`${BASE_URL}/messages/inbox`, config);
      console.log('Inbox count:', inboxRes.data.threads?.length || 0);
    } catch (e) {
      console.error('Inbox error:', e.response?.data || e.message);
    }

    // Thread
    try {
      console.log('Testing /messages/thread/:userId...');
      const threadRes = await axios.get(`${BASE_URL}/messages/thread/${myId}`, config);
      console.log('Thread message count:', threadRes.data.messages?.length || 0);
    } catch (e) {
      console.error('Thread error:', e.response?.data || e.message);
    }

    if (msgId) {
       try {
           console.log('Testing Mark as Read...');
           const readRes = await axios.put(`${BASE_URL}/messages/${msgId}/read`, {}, config);
           console.log('Mark Read result:', readRes.data);
       } catch (e) {
           console.error('Read error:', e.response?.data || e.message);
       }
    }

  } catch (err) {
    console.error('Global Error', err.response?.data || err.message);
  }
}

testMessages();