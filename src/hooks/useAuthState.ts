
import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppUser, UserRole } from "@/types/auth";

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

  return {
    session,
    supabaseUser,
    currentUser,
    loading,
    users,
    setCurrentUser,
    setUsers
  };
};
