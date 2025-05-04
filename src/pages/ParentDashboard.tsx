
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/TaskCard";
import { demoTasks, demoUserStats } from "@/utils/demoData";

const ParentDashboard = () => {
  const { currentUser, users } = useAuth();
  const [tasks, setTasks] = useState(demoTasks);
  
  // Get children accounts
  const children = users.filter(user => user.role === "child" && user.parentId === currentUser?.id);
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  const handleMarkTaskComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">Active Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{incompleteTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{completedTasks.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Children section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Children</h2>
            <Button size="sm" variant="ghost">
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {children.map(child => {
              const stats = demoUserStats[child.id] || { 
                tasksCompleted: 0, 
                totalPoints: 0, 
                tasksInProgress: 0,
                pointsSpent: 0,
                userId: child.id
              };
              
              return (
                <Card key={child.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={child.avatar} alt={child.name} />
                        <AvatarFallback>{child.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h3 className="font-medium">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {stats.totalPoints - stats.pointsSpent} points available
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-2xl font-semibold">{stats.tasksCompleted}</p>
                        <p className="text-xs text-muted-foreground">Tasks completed</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-2xl font-semibold">{stats.tasksInProgress}</p>
                        <p className="text-xs text-muted-foreground">Tasks pending</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-2">
                      <Button size="sm" variant="outline">View Tasks</Button>
                      <Button size="sm">Add Task</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Latest tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Latest Tasks</h2>
            <Button size="sm" variant="ghost">
              <Clipboard size={16} className="mr-1" />
              View All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {incompleteTasks.slice(0, 3).map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onComplete={handleMarkTaskComplete}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ParentDashboard;
