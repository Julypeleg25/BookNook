import { Outlet } from "react-router-dom";
import AppBar from "@/components/AppBar";

const AppLayout = () => {
  return (
    <div className="app-layout flex min-h-screen">
      <AppBar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AppLayout;
