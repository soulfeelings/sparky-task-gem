
import { Session, User } from "@supabase/supabase-js";

// Define user types
export type UserRole = "parent" | "child";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  parentId?: string;  // For children - parent's ID
}

// Auth context type
export interface AuthContextType {
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
  updateUserAvatar: (avatarUrl: string) => Promise<boolean>;
  updateUserName: (newName: string) => Promise<boolean>;
}
