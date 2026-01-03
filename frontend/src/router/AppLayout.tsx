import { Outlet } from "react-router-dom";

const AppLayout = () => (
  <div style={{ minHeight: "100vh" }}>
    <Outlet />
  </div>
);

export default AppLayout;
