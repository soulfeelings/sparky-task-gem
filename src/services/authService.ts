
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/types/auth";
import { toast } from "sonner";

export const authService = {
  // Sign up with email and password
  signup: async (email: string, password: string, name: string, role: UserRole = 'parent', parentId: string | null = null) => {
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
    }
  },

  // Login with email and password
  login: async (email: string, password: string) => {
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
    }
  },

  // Logout user
  logout: async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Выход выполнен успешно");
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Generate invite link with QR code for child
  generateChildInviteLink: (userId: string | undefined) => {
    if (!userId) {
      return '';
    }
    
    // Generate link with parent ID
    const baseUrl = window.location.origin;
    return `${baseUrl}/?parentId=${userId}`;
  },

  // Обновление данных профиля пользователя в таблице profiles
  updateUserProfile: async (userId: string, data: { avatar?: string, full_name?: string }) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', userId);
      
      if (error) {
        console.error("Error updating profile:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating profile in database:", error);
      return false;
    }
  },
  
  // Получение профиля пользователя из таблицы profiles
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching profile from database:", error);
      return null;
    }
  }
};
