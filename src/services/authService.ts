
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

  // Update user avatar in the database
  updateUserAvatar: async (userId: string, avatarUrl: string) => {
    try {
      // Update user metadata in auth.users
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { avatar: avatarUrl }
      });
      
      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating avatar in database:", error);
      return false;
    }
  },
  
  // Update user name in the database
  updateUserName: async (userId: string, newName: string) => {
    try {
      // Update user metadata in auth.users
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { name: newName }
      });
      
      if (metadataError) {
        console.error("Error updating user metadata:", metadataError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating name in database:", error);
      return false;
    }
  }
};
