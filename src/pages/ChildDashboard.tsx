
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Award, Trophy } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import RewardCard from "@/components/rewards/RewardCard";
import { demoTasks, demoRewards, demoUserStats, getAvailablePoints } from "@/utils/demoData";

const ChildDashboard = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState(demoTasks);
  const [rewards] = useState(demoRewards);
  
  // Get user stats
  const stats = currentUser ? demoUserStats[currentUser.id] : undefined;
  const availablePoints = currentUser ? getAvailablePoints(currentUser.id) : 0;
  
  // Filter tasks assigned to this child
  const childTasks = tasks.filter(
    task => task.assignedTo === currentUser?.id && !task.completed
  );
  
  const handleCompleteTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: true } 
          : task
      )
    );
    
    // In a real app, we would update the stats here
    // For the demo, we'll rely on the initial stats
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
                <span>{stats ? stats.tasksCompleted : 0} completed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: stats ? `${(stats.tasksCompleted / (stats.tasksCompleted + stats.tasksInProgress)) * 100}%` : "0%" 
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
            {stats && stats.tasksCompleted > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Trophy size={14} className="mr-1" />
                <span>
                  {stats.tasksCompleted} completed
                </span>
              </div>
            )}
          </div>
          
          {childTasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {childTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.slice(0, 2).map(reward => (
              <RewardCard key={reward.id} reward={reward} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ChildDashboard;
