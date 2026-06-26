import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  GoalYear,
  GoalMonth,
  GoalWeek,
  TaskDay,
  Habit,
  ViewMode,
  CalendarView,
  ThemeMode,
} from '../types';
import { format } from 'date-fns';

interface AppState {
  // Navigation
  view: ViewMode;
  calendarView: CalendarView;
  theme: ThemeMode;
  selectedDate: string;
  commandPaletteOpen: boolean;
  planningOpen: boolean;
  searchQuery: string;

  // Data
  yearGoals: GoalYear[];
  monthGoals: GoalMonth[];
  weekGoals: GoalWeek[];
  dayTasks: TaskDay[];
  habits: Habit[];

  // Actions - Navigation
  setView: (v: ViewMode) => void;
  setCalendarView: (v: CalendarView) => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setSelectedDate: (d: string) => void;
  setCommandPaletteOpen: (o: boolean) => void;
  setPlanningOpen: (o: boolean) => void;
  setSearchQuery: (q: string) => void;

  // Actions - Year Goals
  addYearGoal: (g: Omit<GoalYear, 'id' | 'createdAt' | 'progress'>) => void;
  updateYearGoal: (id: string, g: Partial<GoalYear>) => void;
  deleteYearGoal: (id: string) => void;

  // Actions - Month Goals
  addMonthGoal: (g: Omit<GoalMonth, 'id' | 'createdAt' | 'progress'>) => void;
  updateMonthGoal: (id: string, g: Partial<GoalMonth>) => void;
  deleteMonthGoal: (id: string) => void;

  // Actions - Week Goals
  addWeekGoal: (g: Omit<GoalWeek, 'id' | 'createdAt'>) => void;
  updateWeekGoal: (id: string, g: Partial<GoalWeek>) => void;
  deleteWeekGoal: (id: string) => void;

  // Actions - Day Tasks
  addDayTask: (t: Omit<TaskDay, 'id' | 'createdAt'>) => void;
  updateDayTask: (id: string, t: Partial<TaskDay>) => void;
  deleteDayTask: (id: string) => void;
  toggleTask: (id: string) => void;

  // Actions - Habits
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  updateHabit: (id: string, h: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (id: string, date: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation defaults
      view: 'dashboard',
      calendarView: 'week',
      theme: 'dark',
      selectedDate: format(new Date(), 'yyyy-MM-dd'),
      commandPaletteOpen: false,
      planningOpen: false,
      searchQuery: '',

      // Data defaults
      yearGoals: [],
      monthGoals: [],
      weekGoals: [],
      dayTasks: [],
      habits: [],

      // Navigation actions
      setView: (v) => set({ view: v }),
      setCalendarView: (v) => set({ calendarView: v }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setCommandPaletteOpen: (o) => set({ commandPaletteOpen: o }),
      setPlanningOpen: (o) => set({ planningOpen: o }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Year Goals
      addYearGoal: (g) =>
        set((s) => ({
          yearGoals: [...s.yearGoals, { ...g, id: uuid(), progress: 0, createdAt: new Date().toISOString() }],
        })),
      updateYearGoal: (id, g) =>
        set((s) => ({
          yearGoals: s.yearGoals.map((y) => (y.id === id ? { ...y, ...g } : y)),
        })),
      deleteYearGoal: (id) =>
        set((s) => ({ yearGoals: s.yearGoals.filter((y) => y.id !== id) })),

      // Month Goals
      addMonthGoal: (g) =>
        set((s) => ({
          monthGoals: [...s.monthGoals, { ...g, id: uuid(), progress: 0, createdAt: new Date().toISOString() }],
        })),
      updateMonthGoal: (id, g) =>
        set((s) => ({
          monthGoals: s.monthGoals.map((m) => (m.id === id ? { ...m, ...g } : m)),
        })),
      deleteMonthGoal: (id) =>
        set((s) => ({ monthGoals: s.monthGoals.filter((m) => m.id !== id) })),

      // Week Goals
      addWeekGoal: (g) =>
        set((s) => ({
          weekGoals: [...s.weekGoals, { ...g, id: uuid(), createdAt: new Date().toISOString() }],
        })),
      updateWeekGoal: (id, g) =>
        set((s) => ({
          weekGoals: s.weekGoals.map((w) => (w.id === id ? { ...w, ...g } : w)),
        })),
      deleteWeekGoal: (id) =>
        set((s) => ({ weekGoals: s.weekGoals.filter((w) => w.id !== id) })),

      // Day Tasks
      addDayTask: (t) =>
        set((s) => ({
          dayTasks: [...s.dayTasks, { ...t, id: uuid(), createdAt: new Date().toISOString() }],
        })),
      updateDayTask: (id, t) =>
        set((s) => ({
          dayTasks: s.dayTasks.map((d) => (d.id === id ? { ...d, ...t } : d)),
        })),
      deleteDayTask: (id) =>
        set((s) => ({ dayTasks: s.dayTasks.filter((d) => d.id !== id) })),
      toggleTask: (id) =>
        set((s) => ({
          dayTasks: s.dayTasks.map((d) =>
            d.id === id ? { ...d, completed: !d.completed } : d
          ),
        })),

      // Habits
      addHabit: (h) =>
        set((s) => ({
          habits: [...s.habits, { ...h, id: uuid(), completedDates: [], createdAt: new Date().toISOString() }],
        })),
      updateHabit: (id, h) =>
        set((s) => ({
          habits: s.habits.map((hab) => (hab.id === id ? { ...hab, ...h } : hab)),
        })),
      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),
      toggleHabitDate: (id, date) =>
        set((s) => ({
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  completedDates: h.completedDates.includes(date)
                    ? h.completedDates.filter((d) => d !== date)
                    : [...h.completedDates, date],
                }
              : h
          ),
        })),
    }),
    {
      name: 'life-compass-storage',
    }
  )
);


