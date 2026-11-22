import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./api";

// Connects to the backend Socket.IO server for live order updates.
const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io(API_URL);
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
