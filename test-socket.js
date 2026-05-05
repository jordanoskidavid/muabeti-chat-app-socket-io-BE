const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);

  // Send message
  socket.emit('sendMessage', { message: 'Hello from test client' });
});
// Listen for response
socket.on('receiveMessage', (msg) => {
  console.log('📩 Received:', msg);
});
// Optional: debug
socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});
