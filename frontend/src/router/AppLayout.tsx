import { Outlet } from "react-router-dom";
import AppBar from "@/components/AppBar";
import FloatingAddButton from "@/components/common/FloatingAddButton";

const AppLayout = () => {
  return (
    <div className="app-layout flex min-h-screen">
      <AppBar />
      <div>
        <Outlet />
      </div>
      <FloatingAddButton />
    </div>
  );
};

export default AppLayout;
