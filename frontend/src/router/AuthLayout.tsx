import { Outlet } from "react-router-dom";

const AuthLayout = () => (
  <div style={{ minHeight: "100vh" }}>
    <Outlet />
  </div>
);

export default AuthLayout;
