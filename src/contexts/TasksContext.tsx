
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  status: "pending" | "completed" | "approved";
  child_id: string;
  user_id: string;
  created_at: string;
  due_date?: string;
  category?: string;
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  addTask: (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  getTasksByChild: (childId: string) => Task[];
  refetchTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  const fetchTasks = async () => {
    if (!currentUser) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentUser]);

  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!currentUser) return;

    try {
      const { error, data } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: currentUser.id
        })
        .select();

      if (error) throw error;
      
      toast.success(`Task added successfully`);
      setTasks(prev => [...(data || []), ...prev]);
    } catch (err) {
      toast.error('Failed to add task');
      console.error('Error adding task:', err);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Task updated successfully');
      setTasks(prev => 
        prev.map(task => task.id === id ? { ...task, ...updates } : task)
      );
    } catch (err) {
      toast.error('Failed to update task');
      console.error('Error updating task:', err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Task deleted');
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      toast.error('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const completeTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Task completed!');
      setTasks(prev => 
        prev.map(task => task.id === id ? { ...task, status: 'completed' } : task)
      );
    } catch (err) {
      toast.error('Failed to complete task');
      console.error('Error completing task:', err);
    }
  };

  const getTasksByChild = (childId: string) => {
    return tasks.filter(task => task.child_id === childId);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        getTasksByChild,
        refetchTasks: fetchTasks
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
