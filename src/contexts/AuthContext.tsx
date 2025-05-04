
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Define user types
export type UserRole = "parent" | "child";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  parentId?: string; // Only for child accounts
}

// Auth context type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchAccount: (userId: string) => void;
  users: User[]; // All users (for demo - family members)
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users data for the prototype
const demoUsers: User[] = [
  {
    id: "parent1",
    name: "Alex",
    role: "parent",
    avatar: "https://i.pravatar.cc/150?img=11",
  },
  {
    id: "child1",
    name: "Sam",
    role: "child",
    parentId: "parent1",
    avatar: "https://i.pravatar.cc/150?img=8",
  },
  {
    id: "child2",
    name: "Jamie",
    role: "child",
    parentId: "parent1",
    avatar: "https://i.pravatar.cc/150?img=5",
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [users] = useState<User[]>(demoUsers);

  // Simulate loading auth state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    // For demo, we'll just log in as the parent
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const parentUser = users.find(user => user.role === "parent");
      if (parentUser) {
        setCurrentUser(parentUser);
        // Store in session
        sessionStorage.setItem("currentUser", JSON.stringify(parentUser));
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock logout function
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem("currentUser");
  };

  // Switch between accounts (for demo)
  const switchAccount = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem("currentUser", JSON.stringify(user));
    }
  };

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    logout,
    switchAccount,
    users
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
