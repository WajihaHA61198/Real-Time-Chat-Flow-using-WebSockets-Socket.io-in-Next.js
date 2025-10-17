import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

export const socket = io(SOCKET_URL, {
  // transports: ["websocket"],
  autoConnect: false, // manually connect when needed
});
