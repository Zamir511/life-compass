export type LifeAreaId = 'knowledge' | 'spirituality' | 'finance' | 'health';

export interface LifeArea {
  id: LifeAreaId;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  subcategories: string[];
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

export type ViewMode = 'dashboard' | 'calendar' | 'goals' | 'habits' | 'statistics' | 'planning';
export type CalendarView = 'day' | 'week' | 'month' | 'agenda';
export type ThemeMode = 'light' | 'dark';
