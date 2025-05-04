
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface Child {
  id: string;
  name: string;
  avatar?: string;
  user_id: string;
  created_at: string;
}

interface ChildrenContextType {
  children: Child[];
  loading: boolean;
  error: Error | null;
  addChild: (name: string, avatar?: string) => Promise<void>;
  updateChild: (id: string, updates: Partial<Child>) => Promise<void>;
  deleteChild: (id: string) => Promise<void>;
  refetchChildren: () => Promise<void>;
}

const ChildrenContext = createContext<ChildrenContextType | undefined>(undefined);

export const ChildrenProvider = ({ children: childrenElements }: { children: ReactNode }) => {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const fetchChildren = async () => {
    if (!currentUser) {
      setChildren([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [currentUser]);

  const addChild = async (name: string, avatar?: string) => {
    if (!currentUser) return;

    try {
      const { error, data } = await supabase
        .from('children')
        .insert({
          name,
          avatar: avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
          user_id: currentUser.id
        })
        .select();

      if (error) throw error;
      
      toast.success(`Added ${name} to your family!`);
      setChildren(prev => [...prev, ...(data || [])]);
    } catch (err) {
      toast.error('Failed to add child');
      console.error('Error adding child:', err);
    }
  };

  const updateChild = async (id: string, updates: Partial<Child>) => {
    try {
      const { error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Child updated successfully');
      setChildren(prev => 
        prev.map(child => child.id === id ? { ...child, ...updates } : child)
      );
    } catch (err) {
      toast.error('Failed to update child');
      console.error('Error updating child:', err);
    }
  };

  const deleteChild = async (id: string) => {
    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Child removed');
      setChildren(prev => prev.filter(child => child.id !== id));
    } catch (err) {
      toast.error('Failed to remove child');
      console.error('Error deleting child:', err);
    }
  };

  return (
    <ChildrenContext.Provider
      value={{
        children,
        loading,
        error,
        addChild,
        updateChild,
        deleteChild,
        refetchChildren: fetchChildren
      }}
    >
      {childrenElements}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => {
  const context = useContext(ChildrenContext);
  if (context === undefined) {
    throw new Error("useChildren must be used within a ChildrenProvider");
  }
  return context;
};
