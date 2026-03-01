import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Layout from "./components/Layout/Layout";
import Login from "./components/Login/Login";
import Home from "./components/Home/Home";
import Profile from "./components/Profile/Profile";
import Register from "./components/Register/Register";
import Notfound from "./components/Notfound/Notfound";
import ProtectedRoute from "./components/protectedRoute/protectedRoute";
import ProtectedAuth from "./components/protectedAuth/protectedAuth";
import PostDetails from "./components/postDetails/postDetails";
import UserProfile from "./components/UserProfile/UserProfile";
function App() {
  const routes = createBrowserRouter([
    {
      path: "",
      element: (
        <ProtectedAuth>
          <Login />
        </ProtectedAuth>
      ),
    },
    {
      path: "register",
      element: (
        <ProtectedAuth>
          <Register />
        </ProtectedAuth>
      ),
    },
    {
      path: "",
      element: <Layout />,
      children: [
        {
          path: "home",
          element: (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ),
        },
        {
          path: "profile",
          element: (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          ),
        },
        {
          path: "postDetails/:id",
          element: (
            <ProtectedRoute>
              <PostDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: "user/:userId",
          element: (
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          ),
        },
        { path: "*", element: <Notfound /> },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={routes} />
    </>
  );
}

export default App;
