import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import {
  GoalYear,
  GoalMonth,
  GoalWeek,
  TaskDay,
  Habit,
  LifeArea,
  Note,
  ViewMode,
  CalendarView,
  ThemeMode,
} from '../types';
import { format } from 'date-fns';
import { DEFAULT_LIFE_AREAS, createAreaColors } from '../constants/areas';

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
  lifeAreas: LifeArea[];
  yearGoals: GoalYear[];
  monthGoals: GoalMonth[];
  weekGoals: GoalWeek[];
  dayTasks: TaskDay[];
  habits: Habit[];
  notes: Note[];

  // Actions - Navigation
  setView: (v: ViewMode) => void;
  setCalendarView: (v: CalendarView) => void;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setSelectedDate: (d: string) => void;
  setCommandPaletteOpen: (o: boolean) => void;
  setPlanningOpen: (o: boolean) => void;
  setSearchQuery: (q: string) => void;

  // Actions - Life Areas
  addLifeArea: (area: Omit<LifeArea, 'id' | 'bgColor' | 'borderColor' | 'subcategories' | 'createdAt'> & { subcategories?: string[] }) => void;
  updateLifeArea: (id: string, area: Partial<LifeArea>) => void;
  deleteLifeArea: (id: string) => void;

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

  // Actions - Notes
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'pinned'> & { pinned?: boolean }) => void;
  updateNote: (id: string, n: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  toggleNotePinned: (id: string) => void;
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
      lifeAreas: DEFAULT_LIFE_AREAS,
      yearGoals: [],
      monthGoals: [],
      weekGoals: [],
      dayTasks: [],
      habits: [],
      notes: [],

      // Navigation actions
      setView: (v) => set({ view: v }),
      setCalendarView: (v) => set({ calendarView: v }),
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setCommandPaletteOpen: (o) => set({ commandPaletteOpen: o }),
      setPlanningOpen: (o) => set({ planningOpen: o }),
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Life Areas
      addLifeArea: (area) =>
        set((s) => {
          const colors = createAreaColors(area.color);
          const now = new Date().toISOString();
          return {
            lifeAreas: [
              ...s.lifeAreas,
              {
                ...area,
                id: uuid(),
                name: area.name || area.nameRu,
                nameRu: area.nameRu || area.name,
                subcategories: area.subcategories ?? [],
                ...colors,
                createdAt: now,
              },
            ],
          };
        }),
      updateLifeArea: (id, area) =>
        set((s) => ({
          lifeAreas: s.lifeAreas.map((a) => {
            if (a.id !== id) return a;
            const color = area.color ?? a.color;
            return { ...a, ...area, ...createAreaColors(color), color };
          }),
        })),
      deleteLifeArea: (id) =>
        set((s) => ({
          lifeAreas: s.lifeAreas.filter((a) => a.id !== id),
          yearGoals: s.yearGoals.map((g) => (g.areaId === id ? { ...g, areaId: '' } : g)),
          monthGoals: s.monthGoals.map((g) => (g.areaId === id ? { ...g, areaId: '' } : g)),
          weekGoals: s.weekGoals.map((g) => (g.areaId === id ? { ...g, areaId: '' } : g)),
          dayTasks: s.dayTasks.map((t) => (t.areaId === id ? { ...t, areaId: '' } : t)),
          habits: s.habits.map((h) => (h.areaId === id ? { ...h, areaId: '' } : h)),
          notes: s.notes.map((n) => (n.areaId === id ? { ...n, areaId: undefined, updatedAt: new Date().toISOString() } : n)),
        })),

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

      // Notes
      addNote: (n) =>
        set((s) => {
          const now = new Date().toISOString();
          return {
            notes: [
              ...s.notes,
              { ...n, id: uuid(), pinned: n.pinned ?? false, createdAt: now, updatedAt: now },
            ],
          };
        }),
      updateNote: (id, n) =>
        set((s) => ({
          notes: s.notes.map((note) =>
            note.id === id ? { ...note, ...n, updatedAt: new Date().toISOString() } : note
          ),
        })),
      deleteNote: (id) =>
        set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
      toggleNotePinned: (id) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n
          ),
        })),
    }),
    {
      name: 'life-compass-storage',
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppState> | undefined;
        if (!state) return persistedState;
        return {
          ...state,
          lifeAreas: state.lifeAreas?.length ? state.lifeAreas : DEFAULT_LIFE_AREAS,
          notes: state.notes ?? [],
        };
      },
    }
  )
);


