import { useNavigate } from "react-router-dom";
import { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const handleLogout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logout();
      addNotification("Logged out successfully", "success");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      addNotification("Failed to log out", "error");
    }
  };

  return (
    <nav className="bg-blue-700 px-4 py-3 flex items-center justify-between">
      <span className="text-white text-lg font-semibold">Dashboard</span>
      <Button
        onClick={handleLogout}
        variant="destructive"
        className="px-4 py-2"
      >
        Logout
      </Button>
    </nav>
  );
};

export default Navbar;
