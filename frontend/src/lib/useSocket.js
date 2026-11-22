import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./api";

// Connects to the backend Socket.IO server for live order updates and tracking.
const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // withCredentials sends the httpOnly auth cookie with the handshake.
    const socketInstance = io(API_URL, { withCredentials: true });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
