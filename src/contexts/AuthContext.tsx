
import React, { createContext, useContext, ReactNode } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import { authService } from "@/services/authService";
import { AuthContextType, UserRole } from "@/types/auth";
import { useNavigate } from "react-router-dom";

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

  // Обновляем функцию обновления аватара пользователя для синхронизации с базой данных
  const updateUserAvatar = async (avatarUrl: string) => {
    if (!currentUser) return false;
    
    try {
      // Обновляем данные в базе Supabase
      const dbUpdateSuccess = await authService.updateUserAvatar(currentUser.id, avatarUrl);
      
      if (!dbUpdateSuccess) {
        console.error("Failed to update avatar in database");
        return false;
      }
      
      // Обновляем локальное состояние
      setCurrentUser({
        ...currentUser,
        avatar: avatarUrl
      });
      
      // Обновляем список пользователей
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, avatar: avatarUrl } 
          : user
      ));
      
      return true;
    } catch (error) {
      console.error("Error updating avatar:", error);
      return false;
    }
  };

  // Обновляем функцию обновления имени пользователя для синхронизации с базой данных
  const updateUserName = async (newName: string) => {
    if (!currentUser) return false;
    
    try {
      // Обновляем данные в базе Supabase
      const dbUpdateSuccess = await authService.updateUserName(currentUser.id, newName);
      
      if (!dbUpdateSuccess) {
        console.error("Failed to update name in database");
        return false;
      }
      
      // Обновляем локальное состояние
      setCurrentUser({
        ...currentUser,
        name: newName
      });
      
      // Обновляем список пользователей
      setUsers(prev => prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, name: newName } 
          : user
      ));
      
      return true;
    } catch (error) {
      console.error("Error updating name:", error);
      return false;
    }
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
    generateChildInviteLink,
    updateUserAvatar,
    updateUserName
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
