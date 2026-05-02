import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_BACKEND_URL;

const socket = io(URL, {
  transports: ['websocket', 'polling'],
  reconnectionAttempts: 15,
  reconnectionDelay: 1500,
  autoConnect: true,
});

socket.on('connect', () => {
  console.log('[socket] connected', socket.id);
});

socket.on('disconnect', (reason) => {
  console.warn('[socket] disconnected', reason);
});

socket.on('connect_error', (err) => {
  console.error('[socket] connect_error', err.message);
});

export default socket;
