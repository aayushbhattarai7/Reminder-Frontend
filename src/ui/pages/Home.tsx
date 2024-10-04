import axios from "axios";
import axiosInstance from "../../instance";
import { useEffect, useState } from "react";
import { io, Socket as IOSocket } from "socket.io-client";

interface Notification {
  notification: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  tasks: Task[];
}

interface Admin {
  id: string;
}

interface Task {
  id: string;
  name: string;
  deadline: string;
  status: string;
  admin: Admin;
}

const Home = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<IOSocket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    const newSocket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to the server");

      employee.forEach((emp) => {
        emp.tasks?.forEach((task, index) => {
          newSocket.emit("send-task-id", {
            task_id: task.id,
            task_deadline: task.deadline,
          });
          console.log(task.id, `${index +1}`, "taskId");
        });
      });
    });

    setSocket(newSocket);

    newSocket.on("task-notification", (taskData) => {
      console.log("Received task notification:", taskData);

      const newTasks = taskData.task;

      setNotifications(() => [...newTasks]);
    });

    newSocket.on("notification", (taskData) => {
      console.log("Received kakakakakkakaka notification:", taskData);
      if (taskData?.notification) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { notification: taskData.notification },
        ]);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      newSocket.disconnect();
      console.log("Disconnected from the server");
    };
  }, [employee]);

  const assign = async () => {
    try {
      const response = await axiosInstance.get(`/user/task`);
      console.log(response, "hahaha");
      const employee = response.data.data;
      setEmployee(employee);
      console.log(response.data.data,'lokoaoa')
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
      const notifications = response.data.data.map((notification: any) => ({
        notification: notification.notification,
      }));
      setNotifications(notifications);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
        setSuccess(null);
      } else {
        setError("Field should not be empty");
      }
    }
  };

  const submitTask = async (id: string, admin_id: string) => {
    try {
      // await axiosInstance.patch(`/user/complete/${id}`);
      socket?.emit("complete", {
        task_id: id,
        admin_id: admin_id,
      });
      console.log(admin_id, "jajaja");
      assign();
      console.log("baang");
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
        {notifications?.length > 0 ? (
          notifications?.map((notification, index) => (
            <p key={index}>
              {index + 1}. {notification?.notification}
            </p>
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
            <th className="border border-gray-300 px-4 py-2">Task Name</th>
            <th className="border border-gray-300 px-4 py-2">Task Deadline</th>
            <th className="border border-gray-300 px-4 py-2">Task Status</th>
            <th className="border border-gray-300 px-4 py-2">Submit</th>
          </tr>
        </thead>

        <tbody>
          {employee?.map((employee) =>
            employee.tasks.map((task, index) => (
              <tr key={`${employee.id}-${index}`}>
                {index === 0 && (
                  <>
                    <td
                      rowSpan={employee.tasks.length}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {employee.name}
                    </td>
                    <td
                      rowSpan={employee.tasks.length}
                      className="border border-gray-300 px-4 py-2"
                    >
                      {employee.email}
                    </td>
                  </>
                )}
                <td className="border border-gray-300 px-4 py-2">
                  {task.name}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {task.deadline}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {task.status}
                </td>
                <td>
                  {task.status != "EXPIRED" ? (
                    <button onClick={() => submitTask(task.id, task.admin.id)}>
                      submit
                    </button>
                  ) : (
                    <p className="border border-gray-300 px-4 py-2">Expired</p>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
