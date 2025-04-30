import {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import jwt_decode from "jwt-decode";
import { refreshToken } from "../api/auth";

type AuthContextType = {
  token: string;
  expire: string;
  refresh: () => Promise<void>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
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
      const decoded: any = jwt_decode(data.accessToken);
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
