import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../services/apiService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //logout 
  
  const logout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
  };



  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only check auth if there's a token in cookies
        const token = document.cookie.includes('token');
        if (token) {
          const res = await apiService.getCurrentUser();
          setUser(res.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading ,logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
