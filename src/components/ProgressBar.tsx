
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  className?: string;
  showNumbers?: boolean;
  animated?: boolean;
}

const ProgressBar = ({ 
  current, 
  max, 
  label, 
  className, 
  showNumbers = true,
  animated = true 
}: ProgressBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);
  
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {showNumbers && (
            <span className="text-sm text-muted-foreground">
              {current}/{max}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
        <div 
          className={cn(
            "h-full xp-bar rounded-full transition-all duration-500 ease-out",
            animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
