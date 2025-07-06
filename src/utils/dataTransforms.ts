import { Task, Achievement, UserProgress } from '@/types';

// Transform functions to handle Date objects in localStorage
export const serializeTasks = (tasks: Task[]): string => {
  return JSON.stringify(tasks, (key, value) => {
    if (key === 'createdAt' || key === 'completedAt') {
      return value instanceof Date ? value.toISOString() : value;
    }
    return value;
  });
};

export const deserializeTasks = (tasksJson: string): Task[] => {
  try {
    const tasks = JSON.parse(tasksJson);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined
    }));
  } catch (error) {
    console.error('Error deserializing tasks:', error);
    return [];
  }
};

export const serializeAchievements = (achievements: Achievement[]): string => {
  return JSON.stringify(achievements, (key, value) => {
    if (key === 'unlockedAt') {
      return value instanceof Date ? value.toISOString() : value;
    }
    return value;
  });
};

export const deserializeAchievements = (achievementsJson: string): Achievement[] => {
  try {
    const achievements = JSON.parse(achievementsJson);
    return achievements.map((achievement: any) => ({
      ...achievement,
      unlockedAt: achievement.unlockedAt ? new Date(achievement.unlockedAt) : undefined
    }));
  } catch (error) {
    console.error('Error deserializing achievements:', error);
    return [];
  }
};

// Default data
export const getDefaultAchievements = (): Achievement[] => [
  {
    id: '1',
    title: 'First Quest',
    description: 'Complete your first task',
    icon: '🎯',
    unlocked: false,
    requirement: { type: 'tasks_completed', value: 1 }
  },
  {
    id: '2',
    title: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    unlocked: false,
    requirement: { type: 'tasks_completed', value: 10 }
  },
  {
    id: '3',
    title: 'Streak Champion',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    unlocked: false,
    requirement: { type: 'streak_days', value: 7 }
  },
  {
    id: '4',
    title: 'Level Up!',
    description: 'Reach level 5',
    icon: '🏆',
    unlocked: false,
    requirement: { type: 'level_reached', value: 5 }
  }
];

export const getDefaultUserProgress = (): UserProgress => ({
  level: 1,
  currentXP: 0,
  totalXP: 0,
  tasksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0
});