
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define user types
export type UserRole = "parent" | "child";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  parentId?: string;  // Для детей - ID родителя
}

// Auth context type
interface AuthContextType {
  currentUser: AppUser | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role?: UserRole, parentId?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  switchAccount: (userId: string) => void;
  users: AppUser[]; // Added users property
  generateChildInviteLink: () => string;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Demo users array for development purposes
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: "parent-1",
      name: "Parent User",
      role: "parent",
      avatar: "https://i.pravatar.cc/150?u=parent-1"
    },
    {
      id: "child-1",
      name: "Child User",
      role: "child",
      avatar: "https://i.pravatar.cc/150?u=child-1",
      parentId: "parent-1"
    }
  ]);

  // Set up authentication listeners
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        const role = session.user.user_metadata.role || 'parent';
        const parentId = session.user.user_metadata.parentId;
        
        const newUser = {
          id: session.user.id,
          name: session.user.user_metadata.name || 'User',
          role: role as UserRole,
          avatar: `https://i.pravatar.cc/150?u=${session.user.id}`,
          parentId
        };
        setCurrentUser(newUser);
        
        // Add the new user to the users array if not already present
        setUsers(prev => {
          const exists = prev.some(u => u.id === newUser.id);
          if (!exists) {
            return [...prev, newUser];
          }
          return prev;
        });
      }
      setLoading(false);
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      if (session?.user) {
        const role = session.user.user_metadata.role || 'parent';
        const parentId = session.user.user_metadata.parentId;
        
        const newUser = {
          id: session.user.id,
          name: session.user.user_metadata.name || 'User',
          role: role as UserRole,
          avatar: `https://i.pravatar.cc/150?u=${session.user.id}`,
          parentId
        };
        setCurrentUser(newUser);
        
        // Add the new user to the users array if not already present
        setUsers(prev => {
          const exists = prev.some(u => u.id === newUser.id);
          if (!exists) {
            return [...prev, newUser];
          }
          return prev;
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Generate invite link with QR code for child
  const generateChildInviteLink = () => {
    if (!currentUser || currentUser.role !== 'parent') {
      return '';
    }
    
    // Generate link with parent ID
    const baseUrl = window.location.origin;
    return `${baseUrl}/?parentId=${currentUser.id}`;
  };

  // Sign up with email and password
  const signup = async (email: string, password: string, name: string, role: UserRole = 'parent', parentId: string | null = null) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { 
            name,
            role,
            parentId: parentId || null
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }

      // If this is a child account, connect it to the parent in the children table
      if (role === 'child' && parentId) {
        // This will be handled after the user is confirmed and logs in
        toast.success("Регистрация успешна! Пожалуйста, проверьте свою почту для подтверждения.");
      } else {
        toast.success("Регистрация успешна! Пожалуйста, проверьте свою почту для подтверждения.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }

      toast.success("Вход выполнен успешно!");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success("Выход выполнен успешно");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Switch between accounts (for demo - will be adjusted)
  const switchAccount = (userId: string) => {
    const selectedUser = users.find(user => user.id === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const value = {
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
