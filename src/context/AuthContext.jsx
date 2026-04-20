import { createContext, useContext, useState, useEffect } from "react";
export const AuthContext = createContext();
export const USERS_DB = { "0000": { name: "Admin", role: "admin" } };
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const login = (pin) => {
          const user = USERS_DB[pin];
          if (user) { setCurrentUser(user); return true; }
          return false;
    };
    const logout = () => setCurrentUser(null);
    return <AuthContext.Provider value={{ currentUser, login, logout }}>{children}</AuthContext.Provider>AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
