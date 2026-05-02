import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: Infinity,
  reconnectionDelay: 500,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.3,
  timeout: 15000,
  autoConnect: true,
  forceNew: false,
});

socket.on('connect', () => {
  console.log('[socket] connected', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('[socket] disconnected', reason);
  if (reason === 'io server disconnect' || reason === 'transport close') {
    socket.connect();
  }
});

socket.on('connect_error', (err) => {
  console.error('[socket] connect_error', err.message);
});

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (!socket.connected) {
      console.log('[socket] app foregrounded - reconnecting');
      socket.connect();
    }
  }
}

document.addEventListener('visibilitychange', handleVisibilityChange);
window.addEventListener('focus', () => {
  if (!socket.connected) {
    console.log('[socket] window focused - reconnecting');
    socket.connect();
  }
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted && !socket.connected) {
    console.log('[socket] pageshow (bfcache) - reconnecting');
    socket.connect();
  }
});

let heartbeatInterval = null;

function startHeartbeat() {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket.connected) {
      socket.volatile.emit('ping_keepalive');
    }
  }, 20000);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

socket.on('connect', startHeartbeat);
socket.on('disconnect', stopHeartbeat);

export default socket;
