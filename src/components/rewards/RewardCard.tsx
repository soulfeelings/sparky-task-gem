
import React, { useState } from "react";
import { Star, Award } from "lucide-react";
import { Reward, getCategoryEmoji, getAvailablePoints } from "@/utils/demoData";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RewardCardProps {
  reward: Reward;
  onRedeem?: (rewardId: string) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem }) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { currentUser } = useAuth();
  
  const isChild = currentUser?.role === "child";
  const availablePoints = currentUser && isChild ? getAvailablePoints(currentUser.id) : 0;
  const canAfford = availablePoints >= reward.pointsCost;

  const handleRedeem = () => {
    if (!canAfford || !isChild) return;
    
    setIsRedeeming(true);
    // Simulate API call
    setTimeout(() => {
      if (onRedeem) {
        onRedeem(reward.id);
        toast.success(`Reward redeemed! Show this to your parent.`);
      }
      setIsRedeeming(false);
    }, 600);
  };

  return (
    <div className="reward-card relative rounded-xl p-4 shadow text-white card-hover">
      {/* Category emoji */}
      <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl">
        {getCategoryEmoji(reward.category || 'other')}
      </div>
      
      {/* Reward details */}
      <div className="mb-4">
        <h3 className="font-medium text-lg">{reward.title}</h3>
        <p className="text-sm opacity-90 mt-1">{reward.description}</p>
      </div>
      
      {/* Cost */}
      <div className="flex items-center mt-2 text-sm font-medium">
        <Award size={16} className="mr-1" />
        <span>{reward.pointsCost} points</span>
      </div>
      
      {/* Redeem button (only for children) */}
      {isChild && (
        <Button 
          onClick={handleRedeem} 
          disabled={isRedeeming || !canAfford}
          className={`mt-3 w-full ${!canAfford ? 'opacity-70' : ''}`} 
          variant={canAfford ? "default" : "outline"}
          size="sm"
        >
          {isRedeeming ? "Redeeming..." : canAfford ? "Redeem Reward" : "Not Enough Points"}
        </Button>
      )}
    </div>
  );
};

export default RewardCard;
