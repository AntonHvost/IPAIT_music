import {io} from 'socket.io-client';

export const options = {
    "force new connections": true,
    recconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"]
}

export const socket = io('http://localhost:3001', options);

export default socket;