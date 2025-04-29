import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { refreshToken } from "../api/auth";

const Verify = () => {
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const data = await refreshToken();
      const decoded = jwt_decode(data.accessToken);
      navigate(`/dashboard/${decoded.userId}`);
    } catch (error) {
      navigate("/login");
    }
  };

  useEffect(() => {
    handleVerify();
  }, []);
};

export default Verify;
