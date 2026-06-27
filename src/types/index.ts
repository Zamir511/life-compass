export type LifeAreaId = string;

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subcategories: string[];
  archived?: boolean;
  createdAt?: string;
}

export interface GoalYear {
  id: string;
  title: string;
  description: string;
  areaId: LifeAreaId;
  year: number;
  progress: number;
  createdAt: string;
}

export interface GoalMonth {
  id: string;
  title: string;
  description: string;
  areaId: LifeAreaId;
  yearGoalId: string;
  month: number;
  year: number;
  progress: number;
  createdAt: string;
}

export interface GoalWeek {
  id: string;
  title: string;
  description: string;
  areaId: LifeAreaId;
  monthGoalId: string;
  weekStart: string;
  completed: boolean;
  createdAt: string;
}

export interface TaskDay {
  id: string;
  title: string;
  description: string;
  areaId: LifeAreaId;
  weekGoalId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface Habit {
  id: string;
  title: string;
  areaId: LifeAreaId;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  areaId: LifeAreaId;
  type: 'task' | 'event' | 'habit';
  sourceId?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  areaId?: LifeAreaId;
  goalId?: string;
  taskId?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'dashboard' | 'calendar' | 'goals' | 'habits' | 'notes' | 'areas' | 'statistics' | 'planning';
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';
export type ThemeMode = 'light' | 'dark';
