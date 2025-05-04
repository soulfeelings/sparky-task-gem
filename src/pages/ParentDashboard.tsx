
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useChildren } from "@/contexts/ChildrenContext";
import { useTasks } from "@/contexts/TasksContext";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import TaskCard from "@/components/tasks/TaskCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const ParentDashboard = () => {
  const { currentUser } = useAuth();
  const { children, loading: childrenLoading, addChild } = useChildren();
  const { tasks, loading: tasksLoading, completeTask } = useTasks();
  const navigate = useNavigate();
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [addingChild, setAddingChild] = useState(false);
  
  // Get incomplete tasks
  const incompleteTasks = tasks.filter(task => task.status === "pending");
  const completedTasks = tasks.filter(task => task.status !== "pending");
  
  const handleMarkTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingChild(true);
    
    try {
      await addChild(newChildName);
      setNewChildName("");
      setIsAddChildDialogOpen(false);
    } finally {
      setAddingChild(false);
    }
  };

  const handleViewChildTasks = (childId: string) => {
    navigate(`/tasks/${childId}`);
  };

  const loading = childrenLoading || tasksLoading;

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
              <p className="text-3xl font-semibold">{loading ? "-" : incompleteTasks.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{loading ? "-" : completedTasks.length}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Children section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Children</h2>
            <Button size="sm" onClick={() => setIsAddChildDialogOpen(true)}>
              <Plus size={16} className="mr-1" />
              Add Child
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              // Show loading skeleton
              <>Loading...</>
            ) : children.length > 0 ? (
              children.map(child => {
                // Count tasks for this child
                const childTasks = tasks.filter(task => task.child_id === child.id);
                const pendingTasks = childTasks.filter(task => task.status === "pending");
                const completedTasksCount = childTasks.length - pendingTasks.length;
                
                // Calculate available points (all completed tasks)
                const availablePoints = childTasks
                  .filter(task => task.status === "completed")
                  .reduce((sum, task) => sum + task.points, 0);
                
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
                            {availablePoints} points available
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-2xl font-semibold">{completedTasksCount}</p>
                          <p className="text-xs text-muted-foreground">Tasks completed</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-2xl font-semibold">{pendingTasks.length}</p>
                          <p className="text-xs text-muted-foreground">Tasks pending</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleViewChildTasks(child.id)}>
                          View Tasks
                        </Button>
                        <Button size="sm" onClick={() => navigate(`/tasks/${child.id}`)}>
                          Add Task
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">No children added yet</p>
                  <Button onClick={() => setIsAddChildDialogOpen(true)}>
                    <Plus size={16} className="mr-1" />
                    Add Your First Child
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Latest tasks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Latest Tasks</h2>
            {incompleteTasks.length > 3 && (
              <Button size="sm" variant="ghost" onClick={() => navigate('/tasks')}>
                <Clipboard size={16} className="mr-1" />
                View All
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <>Loading...</>
            ) : incompleteTasks.length > 0 ? (
              incompleteTasks.slice(0, 3).map(task => (
                <TaskCard 
                  key={task.id} 
                  task={{
                    id: task.id,
                    title: task.title,
                    description: task.description || "",
                    assignedTo: task.child_id,
                    points: task.points,
                    completed: task.status !== "pending",
                    category: task.category
                  }} 
                  onComplete={handleMarkTaskComplete}
                />
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active tasks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Child Dialog */}
      <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Child</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddChild} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="childName">Child's Name</Label>
              <Input
                id="childName"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="Enter name"
                required
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsAddChildDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addingChild || !newChildName}>
                {addingChild ? "Adding..." : "Add Child"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ParentDashboard;
