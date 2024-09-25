import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import { Route } from "./ui/common/molecules/Route";
import Login from "./ui/organisms/Login";
import Home from "./ui/pages/Home";
import BirthdayNotification from "./ui/organisms/Notification";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Route />,
      children: [
        {
          path: "",
          element: <Home />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/notification",
          element: <BirthdayNotification />,
        },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
