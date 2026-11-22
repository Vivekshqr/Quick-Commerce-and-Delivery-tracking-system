import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL, getToken } from "./api";

// Connects to the backend Socket.IO server for live order updates and tracking.
const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(API_URL, { auth: { token: getToken() } });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
