
import React, { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { AuthContextType, UserRole } from "@/types/auth";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    session,
    supabaseUser,
    currentUser,
    loading,
    users,
    setCurrentUser,
    setUsers
  } = useAuthState();

  // Switch between accounts (for demo - will be adjusted)
  const switchAccount = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole = 'parent', parentId: string | null = null) => {
    return authService.signup(email, password, name, role, parentId);
  };

  const login = async (email: string, password: string) => {
    return authService.login(email, password);
  };

  const logout = async () => {
    return authService.logout();
  };

  const generateChildInviteLink = () => {
    return authService.generateChildInviteLink(currentUser?.id);
  };

  const value: AuthContextType = {
    currentUser,
    supabaseUser,
    session,
    loading,
    login,
    signup,
    logout,
    switchAccount,
    users,
    generateChildInviteLink
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
