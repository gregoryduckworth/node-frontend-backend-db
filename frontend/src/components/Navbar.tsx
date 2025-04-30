import { logout as logoutApi } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { MouseEvent } from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      await logoutApi();
      navigate("/login");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
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
