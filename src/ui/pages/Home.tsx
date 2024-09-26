import axios from "axios";
import axiosInstance from "../../instance";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface Notification {
  notification: string;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  tasks: Task[];
}

interface Task {
  id: string;
  name: string;
  deadline: string;
  status: string;
}

const Home = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const newSocket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to the server");
    });
    newSocket.on("task-notification", (taskData) => {
      console.log("Received task notification:", taskData);

      const newTasks = taskData.task;

      setNotifications(() => [
        ...newTasks,
      ]);
    });


    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      newSocket.disconnect();
      console.log("Disconnected from the server");
    };
  }, []);

  const assign = async () => {
    try {
      const response = await axiosInstance.get(`/user/task`);
      setEmployee(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
        setSuccess(null);
      } else {
        setError("Field should not be empty");
      }
    }
  };

  const getNotification = async () => {
    try {
      const response = await axiosInstance.get(`/user/notification`);
      setNotifications(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
        setSuccess(null);
      } else {
        setError("Field should not be empty");
      }
    }
  };

  useEffect(() => {
    assign();
    getNotification();
  }, []);

  return (
    <div>
      {success && <p>{success}</p>}
      {error && <p>{error}</p>}
      Assign Task
    <div>
  {notifications.length > 0 ? (
    notifications.map((notification, index) => (
      <p key={index}>{notification.notification}</p>
    ))
  ) : (
    <p>No notifications yet</p>
  )}
</div>


        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Name</th>
              <th className="border border-gray-300 px-4 py-2">Email</th>
              <th className="border border-gray-300 px-4 py-2">Pending Task</th>
            </tr>
          </thead>

          <tbody>
            {employee.map((employee) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 px-4 py-2">
                  {employee.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {employee.email}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {employee.tasks.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
};

export default Home;
