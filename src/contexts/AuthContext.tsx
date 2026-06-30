import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  email?: string;
  isAuthenticated: boolean;
  login: (token: string, role: string, email?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedEmail = localStorage.getItem("email");
    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setEmail(storedEmail || undefined);
    }
  }, []);

  const login = (token: string, role: string, email?: string) => {
    setToken(token);
    setRole(role);
    setEmail(email);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    if (email) localStorage.setItem("email", email);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(undefined);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider
      value={{ token, role, email, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
