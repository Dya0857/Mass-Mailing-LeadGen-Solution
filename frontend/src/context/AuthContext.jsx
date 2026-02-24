// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser && rawUser !== "undefined" && rawUser !== "null") {
        return JSON.parse(rawUser);
      }
    } catch (err) {
      console.error("Error parsing user from localStorage in AuthContext", err);
    }
    return null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async ({ email, password }) => {
    const res = await fetch("http://localhost:5005/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("token", data.token);
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    }
    setToken(data.token);

    return true;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
