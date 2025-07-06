
import { Task } from "@/types";
import { cn } from "@/lib/utils";
import { Circle, CheckCircle, Image, Volume2, Play, Pause, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
}

const TaskCard = ({ task, onToggleComplete, onEdit }: TaskCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const difficultyColors = {
    easy: 'border-game-green bg-game-green/10',
    medium: 'border-game-yellow bg-game-yellow/10',
    hard: 'border-game-red bg-game-red/10'
  };

  const categoryColors = {
    work: 'bg-blue-100 text-blue-800',
    personal: 'bg-purple-100 text-purple-800',
    health: 'bg-green-100 text-green-800',
    learning: 'bg-yellow-100 text-yellow-800'
  };

  const handleAudioToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className={cn(
      "glass rounded-lg p-3 sm:p-4 border-l-4 transition-all duration-300 hover:shadow-lg",
      difficultyColors[task.difficulty],
      task.completed && "opacity-60 animate-task-complete"
    )}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8 rounded-full hover:bg-muted/50 flex-shrink-0 mt-0.5"
            onClick={() => onToggleComplete(task.id)}
          >
            {task.completed ? (
              <CheckCircle className="w-6 h-6 fill-green-500 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground hover:text-green-500 transition-colors" />
            )}
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
              <h3 className={cn(
                "font-medium text-sm break-words",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  categoryColors[task.category]
                )}>
                  {task.category}
                </span>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-6 w-6 rounded-full hover:bg-muted"
                    onClick={() => onEdit(task)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {task.description && (
              <p className={cn(
                "text-xs text-muted-foreground mb-3 break-words",
                task.completed && "line-through"
              )}>
                {task.description}
              </p>
            )}

            {/* Media Section */}
            {(task.photo || task.audio) && (
              <div className="mb-3 space-y-2">
                {task.photo && (
                  <div className="relative">
                    <img 
                      src={task.photo} 
                      alt="Task attachment" 
                      className="w-full max-w-xs h-32 sm:h-40 object-cover rounded-lg border"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <Image className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                
                {task.audio && (
                  <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-8 w-8 rounded-full"
                      onClick={handleAudioToggle}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Audio note</span>
                    <audio
                      ref={audioRef}
                      src={task.audio}
                      onEnded={handleAudioEnded}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {task.difficulty.toUpperCase()}
                </span>
                <span className="text-xs text-game-xp font-bold">
                  +{task.xpReward} XP
                </span>
              </div>
              
              {task.completed && task.completedAt && (
                <span className="text-xs text-muted-foreground">
                  ✓ {new Date(task.completedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
