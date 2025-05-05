
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Trophy } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import RewardCard from "@/components/rewards/RewardCard";
import { useTasks } from "@/contexts/TasksContext";
import { supabase } from "@/integrations/supabase/client";
import { Reward } from "@/types/reward";

const ChildDashboard = () => {
  const { currentUser } = useAuth();
  const { tasks, completeTask } = useTasks();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<{
    tasksCompleted: number;
    tasksInProgress: number;
  }>({ tasksCompleted: 0, tasksInProgress: 0 });
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Fetch rewards from backend
  useEffect(() => {
    const fetchRewards = async () => {
      if (!currentUser) return;
      
      try {
        const { data, error } = await supabase
          .from("rewards")
          .select("*");
        
        if (error) throw error;
        
        // Cast data to ensure it matches our Reward interface
        const typedRewards = data as Reward[] || [];
        setRewards(typedRewards);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      }
    };
    
    fetchRewards();
  }, [currentUser]);
  
  // Calculate stats and available points from actual task data
  useEffect(() => {
    if (!currentUser) return;
    
    try {
      // Calculate stats from actual tasks
      const completedTasks = tasks.filter(
        task => task.child_id === currentUser.id && task.status !== "pending"
      );
      
      const pendingTasks = tasks.filter(
        task => task.child_id === currentUser.id && task.status === "pending"
      );
      
      setStats({
        tasksCompleted: completedTasks.length,
        tasksInProgress: pendingTasks.length
      });
      
      // Calculate available points from completed tasks
      const points = completedTasks.reduce((sum, task) => sum + task.points, 0);
      setAvailablePoints(points);
      
      setLoading(false);
    } catch (err) {
      console.error("Error calculating stats:", err);
      setLoading(false);
    }
  }, [currentUser, tasks]);
  
  // Filter tasks assigned to this child
  const childTasks = tasks.filter(
    task => task.child_id === currentUser?.id && task.status === "pending"
  );
  
  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Points card */}
        <Card className="bg-gradient-to-br from-primary/80 to-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">My Points</p>
                <h3 className="text-3xl font-bold mt-1">{availablePoints}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star size={24} className="text-white" />
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Task Progress</span>
                <span>{stats.tasksCompleted} completed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: stats.tasksCompleted + stats.tasksInProgress > 0
                      ? `${(stats.tasksCompleted / (stats.tasksCompleted + stats.tasksInProgress)) * 100}%` 
                      : "0%" 
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* My Tasks section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Tasks</h2>
            {stats.tasksCompleted > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Trophy size={14} className="mr-1" />
                <span>
                  {stats.tasksCompleted} completed
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <Card className="bg-muted/40">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Loading tasks...</p>
              </CardContent>
            </Card>
          ) : childTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {childTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description || "",
                    assignedTo: task.child_id,
                    points: task.points,
                    completed: false,
                    category: task.category
                  }}
                  onComplete={handleCompleteTask}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No tasks available right now!</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Rewards preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Rewards</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Award size={14} className="mr-1" />
              <span>
                {availablePoints} points available
              </span>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map((_, i) => (
                <Card key={i} className="bg-muted/40">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Loading rewards...</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : rewards.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.slice(0, 2).map(reward => (
                <RewardCard 
                  key={reward.id}
                  reward={reward}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-muted/40">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No rewards available yet!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ChildDashboard;
