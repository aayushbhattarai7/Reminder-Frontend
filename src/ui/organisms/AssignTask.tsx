import axios from "axios";
import axiosInstance from "../../instance";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { io, Socket as IOSocket } from "socket.io-client";
import { Socket } from "socket.io";
interface FormData {
  name: string;
  deadline: string;
  employee: string;
}

interface AssignTaskResponse {
  message: string;
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
const AssignTask = () => {
  const [error, setError] = useState<string | null>(null);
  const [succcess, setSuccess] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [notification, setNotification] = useState<AssignTaskResponse | null>(
    null
  );

  const [socket, setSocket] = useState<IOSocket | null>(null);

  const [formData, setformData] = useState<FormData>({
    name: "",
    deadline: "",
    employee: "",
  });
  const {
    reset,
    register,
    formState: { isSubmitting },
  } = useForm<FormData>();

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

          setSocket(newSocket)
        newSocket.on("task-notification", (task: AssignTaskResponse) => {
          setNotification(task);
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

  const assign = async (id: string, e: any) => {
    e.preventDefault();
    try {
       await axiosInstance.post(`/task/assign/${id}`, {
        name: formData.name,
        deadline: formData.deadline,
        employee: formData.employee,
      });
      socket?.emit("assignTask", {
        data: formData,
        user: employeeId,
      });
      getEmployee();
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "An error occurred");
        setSuccess(null);
      } else {
        setError("Field should not be empty");
      }
    }
  };
  const handleChange = (e: any) => {
    setformData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getEmployee = async () => {
    try {
      const response = await axiosInstance.get("/admin/employee");
      setEmployee(response.data.data.employees);
      setEmployeeId(
        response.data.data.employees.map((employee: any) => employee.id)
      );
    } catch (error) {}
  };
  useEffect(() => {
    getEmployee();
  }, []);
  return (
    <div>
      {succcess && <p>{succcess}</p>}
      {error && <p>{error}</p>}
      Assign Task
      <div>
        <form action="" onSubmit={(e) => assign(employeeId!, e)}>
          <div className="flex flex-col justify-center items-center h-[50vh]">
            <label htmlFor="">name</label>
            <input
              className="border border-black bg-gray-100 rounded"
              type="text"
              {...register("name")}
              onChange={handleChange}
            />
            <label htmlFor="">Date</label>
            <input
              className="border border-black bg-gray-100 rounded"
              type="date"
              {...register("deadline")}
              onChange={handleChange}
            />
            <label htmlFor="">Employee</label>
            <select name="" id="">
              <option value="">Select Employee</option>
              {employee.map((employee) => (
                <option value={employee.id}>{employee.name}</option>
              ))}
            </select>
            <button type="submit" disabled={isSubmitting}>
              Assign task
            </button>
          </div>
        </form>
      </div>
      {employee.length > 0 ? (
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
      ) : (
        <p>No pending task </p>
      )}
    </div>
  );
};

export default AssignTask;
