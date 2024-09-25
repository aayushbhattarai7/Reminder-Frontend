import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../../instance";

interface DecodedToken {
  id: string;
  name: string;
}

interface Birthday {
  message: string;
  data: {
    updatedAt: string;
  };
}

const BirthdayNotification = () => {
  const [birthday, setBirthday] = useState<Birthday | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        setDecodedToken(decoded);

        const newSocket = io("http://localhost:3000", {
          auth: {
            token: token,
          },
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("Connected to the server");
        });

        newSocket.on("birthday", (message: Birthday) => {
          setBirthday(message);
        });

        newSocket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
        });

        return () => {
          newSocket.disconnect();
          console.log("Disconnected from the server");
        };
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const getMessage = async () => {
    try {
      const response = await axiosInstance.get("/user/birthday");
      console.log(response);
      setBirthday(response.data.data);
    } catch (error) {
      console.error("Error fetching birthday message:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMessage();
  }, []);

  function getTimeDifference(createdAt: string) {
    const noteDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - noteDate.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {birthday &&(
        <h1>
          {birthday.message} {getTimeDifference(birthday.data.updatedAt)}
        </h1>
      )}
    </div>
  );
};

export default BirthdayNotification;
