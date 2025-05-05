
import React, { useState, useEffect } from "react";
import AppLayout from "@/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RewardCard from "@/components/rewards/RewardCard";
import { supabase } from "@/integrations/supabase/client";
import { Reward } from "@/types/reward";

const RewardsPage = () => {
  const { currentUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePoints, setAvailablePoints] = useState(0);
  
  useEffect(() => {
    const fetchRewards = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch rewards
        const { data: rewardsData, error: rewardsError } = await supabase
          .from("rewards")
          .select("*");
          
        if (rewardsError) throw rewardsError;
        
        // Fetch completed tasks to calculate available points
        const { data: tasksData, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("child_id", currentUser.id)
          .eq("status", "completed");
          
        if (tasksError) throw tasksError;
        
        // Calculate available points
        const points = tasksData?.reduce((sum, task) => sum + task.points, 0) || 0;
        
        // Cast data to ensure it matches our Reward interface
        const typedRewards = rewardsData as Reward[] || [];
        
        setRewards(typedRewards);
        setAvailablePoints(points);
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRewards();
  }, [currentUser]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rewards</h1>
          <div className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
            {availablePoints} points available
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rewards.map(reward => (
              <RewardCard 
                key={reward.id} 
                reward={reward}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No rewards available yet!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default RewardsPage;
