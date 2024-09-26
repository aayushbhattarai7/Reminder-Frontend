import axios from "axios";
import axiosInstance from "../../instance";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface AssignTaskResponse {
  message: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
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
  const [notification, setNotification] = useState<string | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]); // Store task details

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const newSocket = io("http://localhost:3000", {
          auth: {
            token: token,
          },
        });

        newSocket.on("connect", () => {
          console.log("Connected to the server");
        });

        // Listen for task notifications from the server
        newSocket.on("task-notification", (tasks: Task[]) => {
          setTaskList(tasks); // Update state with tasks received from the server
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

  const assign = async () => {
    try {
      const response = await axiosInstance.get(`/user/task`);
      console.log(response.data.data.message);
      setEmployee(response.data.data.employees);
      setNotification(response.data.data.message);
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
  }, []);

  return (
    <div>
      {success && <p>{success}</p>}
      <h1>Assign Task</h1>
      {notification && <p>{notification}</p>} {/* Display notification */}
      {employee.length > 0 ? (
        <div>
          {/* Task details for each employee */}
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">
                  Pending Tasks
                </th>
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

          {/* Display newly received tasks */}
          {taskList.length > 0 && (
            <div className="mt-4">
              <h2>Newly Assigned Tasks:</h2>
              <ul>
                {taskList.map((task) => (
                  <li key={task.id}>
                    <strong>{task.name}</strong> - Deadline: {task.deadline} -
                    Status: {task.status}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p>No pending tasks</p>
      )}
    </div>
  );
};

export default Home;
