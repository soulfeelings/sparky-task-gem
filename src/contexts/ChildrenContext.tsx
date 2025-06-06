
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
  const { currentUser, supabaseUser } = useAuth();

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

  // Регистрация ребенка в системе при первом входе, если он еще не добавлен в таблицу 'children'
  useEffect(() => {
    const registerChildIfNeeded = async () => {
      // Если текущий пользователь - ребенок и есть родительский ID
      if (currentUser?.role === 'child' && currentUser.parentId && supabaseUser) {
        // Проверка, существует ли уже этот ребенок в таблице children
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // Ребенок не найден в таблице, нужно добавить
          await addChild(
            currentUser.name, 
            currentUser.avatar, 
            currentUser.id,
            currentUser.parentId
          );
        }
      }
    };

    if (currentUser && supabaseUser) {
      registerChildIfNeeded();
    }
  }, [currentUser, supabaseUser]);

  useEffect(() => {
    fetchChildren();
  }, [currentUser]);

  const addChild = async (name: string, avatar?: string, childId?: string, parentId?: string) => {
    if (!currentUser && !parentId) return;

    try {
      const userId = parentId || currentUser?.id;
      const childData = {
        id: childId || undefined, // Если передан ID ребенка (для уже зарегистрированных), используем его
        name,
        avatar: avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
        user_id: userId
      };

      const { error, data } = await supabase
        .from('children')
        .insert(childData)
        .select();

      if (error) throw error;
      
      if (!childId) {
        // Только показываем уведомление, если это обычное добавление ребенка (не автоматическое)
        toast.success(`Добавлен ${name} в вашу семью!`);
      }
      setChildren(prev => [...prev, ...(data || [])]);
    } catch (err) {
      toast.error('Не удалось добавить ребенка');
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
      
      toast.success('Данные ребенка обновлены');
      setChildren(prev => 
        prev.map(child => child.id === id ? { ...child, ...updates } : child)
      );
    } catch (err) {
      toast.error('Не удалось обновить данные ребенка');
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
      
      toast.success('Ребенок удален');
      setChildren(prev => prev.filter(child => child.id !== id));
    } catch (err) {
      toast.error('Не удалось удалить ребенка');
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
