
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppUser, UserRole } from "@/types/auth";
import { authService } from "@/services/authService";

export const useAuthState = () => {
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

  // Функция для загрузки профиля пользователя из таблицы profiles
  const loadUserProfile = async (userId: string, userMeta: any) => {
    const profile = await authService.getUserProfile(userId);
    
    const role = userMeta.role || 'parent';
    const parentId = userMeta.parentId;
    
    const newUser = {
      id: userId,
      name: profile?.full_name || userMeta.name || 'User',
      role: role as UserRole,
      avatar: profile?.avatar || `https://i.pravatar.cc/150?u=${userId}`,
      parentId
    };
    
    setCurrentUser(newUser);
    
    // Add the new user to the users array if not already present
    setUsers(prev => {
      const exists = prev.some(u => u.id === newUser.id);
      if (!exists) {
        return [...prev, newUser];
      }
      return prev.map(u => u.id === newUser.id ? newUser : u);
    });
    
    return newUser;
  };

  // Set up authentication listeners
  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      
      if (session?.user) {
        // Загружаем профиль пользователя из таблицы profiles
        loadUserProfile(session.user.id, session.user.user_metadata);
      }
      
      setLoading(false);
    });

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user || null);
      
      if (session?.user) {
        // При изменении состояния аутентификации загружаем профиль
        loadUserProfile(session.user.id, session.user.user_metadata);
      } else {
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    supabaseUser,
    currentUser,
    loading,
    users,
    setCurrentUser,
    setUsers,
    loadUserProfile
  };
};
