export interface Task {
  id: string;
  title: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'work' | 'personal' | 'health' | 'learning';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  xpReward: number;
  photo?: string;
  audio?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  requirement: {
    type: 'tasks_completed' | 'streak_days' | 'xp_earned' | 'level_reached';
    value: number;
  };
}

export interface UserProgress {
  level: number;
  currentXP: number;
  totalXP: number;
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}
