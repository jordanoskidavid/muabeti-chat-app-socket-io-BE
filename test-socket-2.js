const { io } = require('socket.io-client');

const socket = io('http://localhost:3000', {
  auth: {
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsImVtYWlsIjoiaGRkYXZpZDY2NEBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc3ODUyMzA1NiwiZXhwIjoxNzc4NTI2NjU2fQ._YdkkjsTi694cp3v1RJ_ipMmoXlAn22OXCfnjxpnZm4',
  },
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // send message after connect
  socket.emit('privateMessage', {
    toUserId: 5, // change to another user id
    message: 'Hello bro',
  });
});

socket.on('receiveMessage', (data) => {
  console.log('📩 Received:', data);
});

socket.on('messageSent', (data) => {
  console.log('✅ Sent:', data);
});

socket.on('error', (err) => {
  console.log('❌ Error:', err);
});
process.stdin.resume();