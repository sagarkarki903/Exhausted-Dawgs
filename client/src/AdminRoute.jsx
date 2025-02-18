import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const userRole = localStorage.getItem("userRole");

  return userRole === "Admin" ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
