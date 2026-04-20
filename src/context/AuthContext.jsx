import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// Pre-configured mock user database mapped by PIN
export const USERS_DB = {
  "0000": { name: "Manager",  role: "admin",   id: "admin-1"   },
  "1111": { name: "Waiter 1", role: "waiter",  id: "waiter-1"  },
  "2222": { name: "Waiter 2", role: "waiter",  id: "waiter-2"  },
  "3333": { name: "Waiter 3", role: "waiter",  id: "waiter-3"  },
  "4444": { name: "Chef",     role: "kitchen", id: "kitchen-1" },
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orderflow_user");
      if (stored) setCurrentUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  const login = (pin) => {
    const user = USERS_DB[pin];
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("orderflow_user", JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("orderflow_user");
  };

  if (loading) return <div className="state-container"><div className="spinner"></div></div>;

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
