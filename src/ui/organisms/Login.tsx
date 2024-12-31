import axios from "axios";
import axiosInstance from "../../instance";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
interface FormData {
  email: string;
  password: string;
}
const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [succcess, setSuccess] = useState<string | null>(null);
  const [formData, setformData] = useState<FormData>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const xyz = () => {
    console.log("yess")
  }
  const loginUser = async (e: any) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/user/login", {
        email: formData.email,
        password: formData.password,
      });

      sessionStorage.setItem(
        "accessToken",
        response.data.data.tokens.accessToken
      );
      navigate("/");
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
    e.preventDefault();
    setformData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  return (
    <div>
      {succcess && <p>{succcess}</p>}
      {error && <p>{error}</p>}
      Login
      <form action="" onSubmit={loginUser}>
        <div className="flex flex-col justify-center items-center h-[50vh]">
          <label htmlFor="">Email</label>
          <input
            className="border border-black bg-gray-100 rounded"
            type="text"
            name="email"
            onChange={handleChange}
          />
          <label htmlFor="">Password</label>
          <input
            className="border border-black bg-gray-100 rounded"
            type="text"
            name="password"
            onChange={handleChange}
          />
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
