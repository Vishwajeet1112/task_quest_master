import { useState, useEffect } from "react";
import { Task, Achievement, UserProgress } from "@/types";
import TaskCard from "@/components/TaskCard";
import AddTaskForm from "@/components/AddTaskForm";
import EditTaskForm from "@/components/EditTaskForm";
import ProgressBar from "@/components/ProgressBar";
import AchievementBadge from "@/components/AchievementBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { 
  serializeTasks, 
  deserializeTasks, 
  serializeAchievements, 
  deserializeAchievements,
  getDefaultAchievements,
  getDefaultUserProgress
} from "@/utils/dataTransforms";

const Index = () => {
  const { toast } = useToast();
  
  // Use localStorage for persistent data
  const [tasksJson, setTasksJson] = useLocalStorage('taskquest-tasks', '[]');
  const [achievementsJson, setAchievementsJson] = useLocalStorage('taskquest-achievements', '');
  const [userProgress, setUserProgress] = useLocalStorage('taskquest-progress', getDefaultUserProgress());
  
  // Local state for UI
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Initialize data from localStorage on component mount
  useEffect(() => {
    // Load tasks
    if (tasksJson && tasksJson !== '[]') {
      const loadedTasks = deserializeTasks(tasksJson);
      setTasks(loadedTasks);
    }

    // Load achievements
    if (achievementsJson) {
      const loadedAchievements = deserializeAchievements(achievementsJson);
      setAchievements(loadedAchievements);
    } else {
      // First time user - set default achievements
      const defaultAchievements = getDefaultAchievements();
      setAchievements(defaultAchievements);
      setAchievementsJson(serializeAchievements(defaultAchievements));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0 || tasksJson !== '[]') {
      setTasksJson(serializeTasks(tasks));
    }
  }, [tasks]);

  // Save achievements to localStorage whenever achievements change
  useEffect(() => {
    if (achievements.length > 0) {
      setAchievementsJson(serializeAchievements(achievements));
    }
  }, [achievements]);

  const checkAchievements = (newProgress: UserProgress) => {
    setAchievements(prevAchievements => 
      prevAchievements.map(achievement => {
        if (achievement.unlocked) return achievement;
        
        let shouldUnlock = false;
        switch (achievement.requirement.type) {
          case 'tasks_completed':
            shouldUnlock = newProgress.tasksCompleted >= achievement.requirement.value;
            break;
          case 'level_reached':
            shouldUnlock = newProgress.level >= achievement.requirement.value;
            break;
          case 'streak_days':
            shouldUnlock = newProgress.currentStreak >= achievement.requirement.value;
            break;
          case 'xp_earned':
            shouldUnlock = newProgress.totalXP >= achievement.requirement.value;
            break;
        }
        
        if (shouldUnlock) {
          toast({
            title: "🏆 Achievement Unlocked!",
            description: `${achievement.title}: ${achievement.description}`,
            duration: 5000
          });
          return { ...achievement, unlocked: true, unlockedAt: new Date() };
        }
        
        return achievement;
      })
    );
  };

  const getXPForLevel = (level: number) => level * 100;

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date()
    };
    setTasks(prev => [newTask, ...prev]);
    setShowAddForm(false);
    toast({
      title: "Quest Created!",
      description: `New ${taskData.difficulty} quest added. Complete it to earn ${taskData.xpReward} XP!`
    });
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
    toast({
      title: "Quest Updated!",
      description: "Your quest has been successfully updated."
    });
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowAddForm(false);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed, completedAt: task.completed ? undefined : new Date() };
        
        if (!task.completed) {
          // Task is being completed
          setUserProgress(prevProgress => {
            const newTotalXP = prevProgress.totalXP + task.xpReward;
            const newCurrentXP = prevProgress.currentXP + task.xpReward;
            const newLevel = Math.floor(newTotalXP / 100) + 1;
            const currentXPInLevel = newTotalXP % 100;
            
            const leveledUp = newLevel > prevProgress.level;
            
            const newProgress = {
              ...prevProgress,
              level: newLevel,
              currentXP: currentXPInLevel,
              totalXP: newTotalXP,
              tasksCompleted: prevProgress.tasksCompleted + 1
            };

            if (leveledUp) {
              setTimeout(() => {
                toast({
                  title: "🎉 LEVEL UP!",
                  description: `Congratulations! You've reached level ${newLevel}!`,
                  duration: 5000
                });
              }, 100);
            }

            setTimeout(() => {
              toast({
                title: "Quest Completed!",
                description: `+${task.xpReward} XP earned! ${leveledUp ? `Level ${newLevel} achieved!` : ''}`,
                duration: 3000
              });
            }, 200);

            // Check achievements after state update
            setTimeout(() => checkAchievements(newProgress), 300);
            
            return newProgress;
          });
        } else {
          // Task is being uncompleted
          setUserProgress(prevProgress => {
            const newTotalXP = Math.max(0, prevProgress.totalXP - task.xpReward);
            const newLevel = Math.floor(newTotalXP / 100) + 1;
            const currentXPInLevel = newTotalXP % 100;
            
            return {
              ...prevProgress,
              level: newLevel,
              currentXP: currentXPInLevel,
              totalXP: newTotalXP,
              tasksCompleted: Math.max(0, prevProgress.tasksCompleted - 1)
            };
          });
        }

        return updatedTask;
      }
      return task;
    }));
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
      setTasks([]);
      setUserProgress(getDefaultUserProgress());
      setAchievements(getDefaultAchievements());
      setTasksJson('[]');
      setAchievementsJson('');
      toast({
        title: "Data Reset",
        description: "All your progress has been reset. Start your quest anew!",
        duration: 3000
      });
    }
  };

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const currentLevelXP = getXPForLevel(userProgress.level);

  return (
    <div className="min-h-screen p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">TaskQuest Master</h1>
          <p className="text-muted-foreground">Level up your productivity with gamified tasks!</p>
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllData}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Reset All Data
            </Button>
          </div>
        </div>

        {/* User Progress */}
        <Card className="glass border-2 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="gradient-text">Player Stats</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Level {userProgress.level}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar
              current={userProgress.currentXP}
              max={currentLevelXP}
              label="XP Progress"
              animated={true}
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="glass rounded-lg p-3">
                <div className="text-2xl font-bold text-game-xp">{userProgress.totalXP}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-2xl font-bold text-game-green">{userProgress.tasksCompleted}</div>
                <div className="text-sm text-muted-foreground">Quests Completed</div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-2xl font-bold text-game-blue">{userProgress.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="glass rounded-lg p-3">
                <div className="text-2xl font-bold text-game-yellow">{userProgress.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="glass border-2 mb-6">
          <CardHeader>
            <CardTitle className="gradient-text">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map(achievement => (
                <AchievementBadge 
                  key={achievement.id} 
                  achievement={achievement} 
                  size="md"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tasks Section */}
        <Tabs defaultValue="active" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="glass">
              <TabsTrigger value="active">Active Quests ({pendingTasks.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
            </TabsList>
            <Button 
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingTask(null);
              }}
              className="bg-gradient-to-r from-game-purple to-game-blue hover:from-game-purple/90 hover:to-game-blue/90"
            >
              {showAddForm ? 'Cancel' : '+ New Quest'}
            </Button>
          </div>

          {showAddForm && (
            <AddTaskForm 
              onAddTask={addTask} 
              onCancel={() => setShowAddForm(false)} 
            />
          )}

          {editingTask && (
            <EditTaskForm
              task={editingTask}
              onUpdateTask={updateTask}
              onCancel={() => setEditingTask(null)}
            />
          )}

          <TabsContent value="active" className="space-y-4">
            {pendingTasks.length === 0 ? (
              <Card className="glass border-2">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium mb-2">No active quests</h3>
                  <p className="text-muted-foreground mb-4">Create your first quest to start earning XP!</p>
                  <Button onClick={() => setShowAddForm(true)}>
                    Create Your First Quest
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedTasks.length === 0 ? (
              <Card className="glass border-2">
                <CardContent className="py-12 text-center">
                  <div className="text-6xl mb-4">🏁</div>
                  <h3 className="text-lg font-medium mb-2">No completed quests yet</h3>
                  <p className="text-muted-foreground">Complete some tasks to see your achievements here!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskComplete}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;