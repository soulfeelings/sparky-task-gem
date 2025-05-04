
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { useTasks } from "@/contexts/TasksContext";
import { useChildren } from "@/contexts/ChildrenContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, ArrowLeft, Loader2 } from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { Skeleton } from "@/components/ui/skeleton";

const TasksPage = () => {
  const { childId } = useParams<{ childId: string }>();
  const { tasks, loading: tasksLoading, completeTask } = useTasks();
  const { children, loading: childrenLoading } = useChildren();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  if (!childId) {
    // If no childId is provided, redirect to parent dashboard
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Select a child to manage tasks</p>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </AppLayout>
    );
  }

  // Get the selected child
  const selectedChild = children.find(child => child.id === childId);
  
  // Get tasks for this child
  const childTasks = tasks.filter(task => task.child_id === childId);
  
  // Handle task completion
  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const loading = childrenLoading || tasksLoading;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header with back button */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ArrowLeft size={18} />
          </Button>
          <h1 className="text-2xl font-semibold">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              selectedChild ? `${selectedChild.name}'s Tasks` : 'Tasks'
            )}
          </h1>
          <div className="flex-1" />
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} className="mr-1" />
            Add Task
          </Button>
        </div>

        {/* Tasks list */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : childTasks.length > 0 ? (
            childTasks.map(task => (
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
                onComplete={handleCompleteTask}
              />
            ))
          ) : (
            // Empty state
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">No tasks available for this child</p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus size={16} className="mr-1" />
                  Add First Task
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Task Form Dialog */}
      <TaskFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        childId={childId}
      />
    </AppLayout>
  );
};

export default TasksPage;
