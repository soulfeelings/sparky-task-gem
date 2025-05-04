
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTasks } from "@/contexts/TasksContext";
import { getCategoryEmoji } from "@/utils/demoData";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childId: string;
}

const CATEGORIES = ["homework", "chores", "exercise", "learning", "reading", "other"];

const TaskFormDialog: React.FC<TaskFormDialogProps> = ({ open, onOpenChange, childId }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(10);
  const [category, setCategory] = useState("other");
  const [loading, setLoading] = useState(false);
  const { addTask } = useTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addTask({
        title,
        description,
        points,
        category,
        child_id: childId,
        status: "pending"
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setPoints(10);
      setCategory("other");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Clean bedroom"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Make the bed, put away toys and vacuum the floor"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(parseInt(e.target.value))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  type="button"
                  variant={category === cat ? "default" : "outline"}
                  className="text-center"
                  onClick={() => setCategory(cat)}
                >
                  <span className="mr-1">{getCategoryEmoji(cat)}</span>
                  <span className="capitalize">{cat}</span>
                </Button>
              ))}
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFormDialog;
