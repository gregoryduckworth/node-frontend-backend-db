import { createContext, useState, useEffect, useCallback } from "react";
import jwt_decode from "jwt-decode";
import { refreshToken } from "../api/auth";
import PropTypes from "prop-types";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchToken = useCallback(async () => {
    try {
      const data = await refreshToken();
      if (!data || !data.accessToken) {
        setToken("");
        setExpire("");
        return;
      }
      setToken(data.accessToken);
      const decoded = jwt_decode(data.accessToken);
      setExpire(decoded.exp);
    } catch (error) {
      setToken("");
      setExpire("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  return (
    <AuthContext.Provider
      value={{ token, expire, refresh: fetchToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };
