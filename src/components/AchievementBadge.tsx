
import { Achievement } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge = ({ achievement, size = 'md' }: AchievementBadgeProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base'
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={cn(
          "rounded-full glass border-2 flex items-center justify-center relative transition-all duration-300",
          sizeClasses[size],
          achievement.unlocked 
            ? "border-game-green bg-gradient-to-br from-game-green/20 to-game-blue/20 shadow-lg" 
            : "border-gray-300 bg-gray-100/50 opacity-60"
        )}
      >
        <span className="text-lg">{achievement.icon}</span>
        {achievement.unlocked && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-game-green rounded-full flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={cn(
          "font-medium text-xs",
          achievement.unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.title}
        </p>
        {size !== 'sm' && (
          <p className="text-xs text-muted-foreground max-w-20 text-center">
            {achievement.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementBadge;
