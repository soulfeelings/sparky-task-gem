
import React, { useState } from "react";
import { Check, Star } from "lucide-react";
import { Task, getCategoryEmoji } from "@/utils/demoData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { currentUser } = useAuth();
  
  const isChild = currentUser?.role === "child";
  const isAssignedToCurrentUser = task.assignedTo === currentUser?.id;

  const handleComplete = () => {
    if (!isAssignedToCurrentUser) return;
    
    setIsCompleting(true);
    // Simulate API call
    setTimeout(() => {
      if (onComplete) {
        onComplete(task.id);
        setShowConfetti(true);
        toast.success(`Task completed! You earned ${task.points} points!`);
        
        // Hide confetti after animation completes
        setTimeout(() => {
          setShowConfetti(false);
        }, 1500);
      }
      setIsCompleting(false);
    }, 600);
  };

  return (
    <div className={`task-card relative rounded-xl p-4 shadow ${task.completed ? 'opacity-75' : ''} card-hover`}>
      {/* Category emoji */}
      <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl">
        {getCategoryEmoji(task.category || 'other')}
      </div>
      
      {/* Task details */}
      <div className="mb-2">
        <div className="flex items-center">
          <h3 className={`font-medium text-lg flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
      </div>
      
      {/* Points */}
      <div className="flex items-center mt-2 text-sm font-medium">
        <Star size={16} className="text-primary mr-1" />
        <span>{task.points} points</span>
      </div>
      
      {/* Complete button (only for children and assigned tasks) */}
      {isChild && isAssignedToCurrentUser && !task.completed && (
        <Button 
          onClick={handleComplete} 
          disabled={isCompleting}
          className="mt-3 w-full" 
          variant="outline"
          size="sm"
        >
          {isCompleting ? "Completing..." : "Complete Task"}
        </Button>
      )}
      
      {/* Completed status */}
      {task.completed && (
        <div className="bg-accent/20 text-accent flex items-center justify-center rounded-md py-1 px-2 mt-3">
          <Check size={14} className="mr-1" />
          <span className="text-xs font-medium">Completed</span>
        </div>
      )}
      
      {/* Confetti animation */}
      {showConfetti && (
        <>
          <div className="confetti confetti-1" />
          <div className="confetti confetti-2" />
          <div className="confetti confetti-3" />
          <div className="confetti confetti-4" />
          <div className="confetti confetti-5" />
          <div className="confetti confetti-6" />
        </>
      )}
    </div>
  );
};

export default TaskCard;
