import { useState } from 'react';
import { useStore } from '../store/useStore';
import { LIFE_AREAS, getArea } from '../constants/areas';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { TaskModal } from './TaskModal';
import { MobileNav } from './MobileNav';

export function Dashboard() {
  const store = useStore();
  const { dayTasks, weekGoals, monthGoals, yearGoals, habits, theme, toggleTask } = store;
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');


  const todayTasks = dayTasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  // tasks loaded from store

  const currentMonthGoals = monthGoals.filter(g => g.month === today.getMonth() && g.year === today.getFullYear());
  const currentYearGoals = yearGoals.filter(g => g.year === today.getFullYear());

  const todayHabits = habits.filter(h => h.frequency === 'daily');
  const completedHabitsToday = todayHabits.filter(h => h.completedDates.includes(todayStr)).length;

  // Area stats
  const areaStats = LIFE_AREAS.map(area => {
    const areaTasks = dayTasks.filter(t => t.areaId === area.id);
    const completed = areaTasks.filter(t => t.completed).length;
    const total = areaTasks.length;
    return { ...area, completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  const isEmpty = yearGoals.length === 0 && dayTasks.length === 0 && habits.length === 0;

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />
      
      {/* Header */}
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p className={`text-sm mb-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {format(today, 'EEEE, d MMMM yyyy', { locale: ru })}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Добрый день 👋</h1>
        </motion.div>
      </div>

      {isEmpty && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${cardClass} p-8 text-center mb-8`}>
          <p className="text-4xl mb-4">🧭</p>
          <h2 className="text-lg font-semibold mb-2">Добро пожаловать в Life Compass</h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Начните стратегическое планирование жизни.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { setSelectedTaskId(null); setTaskModalOpen(true); }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              + Добавить задачу
            </button>
            <button
              onClick={() => useStore.getState().setView('goals')}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/[0.1] text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Создать цель
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Задачи сегодня', value: `${completedToday}/${todayTasks.length}`, icon: '✓', color: 'from-indigo-500 to-blue-600' },
          { label: 'Цели недели', value: `${weekGoals.filter(g=>g.completed).length}/${weekGoals.length}`, icon: '◎', color: 'from-purple-500 to-pink-600' },
          { label: 'Привычки', value: `${completedHabitsToday}/${todayHabits.length}`, icon: '↻', color: 'from-emerald-500 to-teal-600' },
          { label: 'Цели года', value: `${currentYearGoals.length}`, icon: '★', color: 'from-orange-500 to-red-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={cardClass + ' p-4 md:p-5'}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white text-sm mb-3`}>
              {stat.icon}
            </div>
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 md:gap-6">
        {/* Today Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${cardClass} p-5 md:col-span-2`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">Задачи на сегодня</h2>
            <button
              onClick={() => { setSelectedTaskId(null); setTaskModalOpen(true); }}
              className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
                theme === 'dark' ? 'bg-white/[0.06] hover:bg-white/[0.1] text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              + Добавить
            </button>
          </div>
          
          {todayTasks.length === 0 ? (
            <p className={`text-sm py-8 text-center ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              Нет задач на сегодня. Добавьте первую задачу!
            </p>
          ) : (
            <div className="space-y-1">
              {todayTasks.sort((a,b) => (a.startTime||'99').localeCompare(b.startTime||'99')).map((task, i) => {
                const area = getArea(task.areaId);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                      theme === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => { setSelectedTaskId(task.id); setTaskModalOpen(true); }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        task.completed
                          ? 'border-transparent text-white text-xs'
                          : theme === 'dark' ? 'border-gray-600 hover:border-gray-400' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={task.completed ? { background: area.color } : {}}
                    >
                      {task.completed && '✓'}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                      {task.startTime && (
                        <p className={`text-[11px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {task.startTime}{task.endTime ? ` — ${task.endTime}` : ''}
                        </p>
                      )}
                    </div>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: area.color }}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}

          {todayTasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dashed" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayTasks.length > 0 ? (completedToday / todayTasks.length * 100) : 0}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
                <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {todayTasks.length > 0 ? Math.round(completedToday / todayTasks.length * 100) : 0}%
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Life Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${cardClass} p-5`}
        >
          <h2 className="text-base font-semibold mb-4">Сферы жизни</h2>
          <div className="space-y-3">
            {areaStats.map((area) => (
              <div key={area.id} className="flex items-center gap-3">
                <span className="text-xl">{area.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium">{area.nameRu}</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{area.pct}%</p>
                  </div>
                  <div className={`h-1.5 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: area.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Week Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${cardClass} p-5`}
        >
          <h2 className="text-base font-semibold mb-4">Цели недели</h2>
          {weekGoals.length === 0 ? (
            <p className={`text-sm text-center py-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              Нет целей на неделю
            </p>
          ) : (
            <div className="space-y-2">
              {weekGoals.map((g) => {
                const area = getArea(g.areaId);
                return (
                  <div key={g.id} className={`flex items-center gap-2 p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'
                  }`}>
                    <span
                      className="w-1.5 h-6 rounded-full flex-shrink-0"
                      style={{ background: area.color }}
                    />
                    <p className={`text-xs flex-1 ${g.completed ? 'line-through opacity-50' : ''}`}>{g.title}</p>
                    {g.completed && <span className="text-xs text-emerald-500">✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Month Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className={`${cardClass} p-5`}
        >
          <h2 className="text-base font-semibold mb-4">Цели месяца</h2>
          {currentMonthGoals.length === 0 ? (
            <p className={`text-sm text-center py-6 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              Нет целей на месяц
            </p>
          ) : (
            <div className="space-y-2">
              {currentMonthGoals.map((g) => {
                const area = getArea(g.areaId);
                return (
                  <div key={g.id} className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-white/[0.02]' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: area.color }} />
                      <p className="text-xs font-medium">{g.title}</p>
                    </div>
                    <div className={`h-1 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                      <div className="h-full rounded-full" style={{ background: area.color, width: `${g.progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Year Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${cardClass} p-5`}
        >
          <h2 className="text-base font-semibold mb-4">Прогресс года</h2>
          {(() => {
            const yearStr = String(today.getFullYear());
            const yearTasks = dayTasks.filter(t => t.date.startsWith(yearStr));
            const yearCompleted = yearTasks.filter(t => t.completed).length;
            const yearTotal = yearTasks.length;
            const yearWeekGoals = weekGoals.filter(g => g.weekStart.startsWith(yearStr));
            const yearWeekDone = yearWeekGoals.filter(g => g.completed).length;
            const yearWeekTotal = yearWeekGoals.length;

            const totalItems = yearTotal + yearWeekTotal;
            const doneItems = yearCompleted + yearWeekDone;
            const yearPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;
            const circumference = 2 * Math.PI * 40;

            return (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f3f5'} strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${circumference}`}
                        strokeDashoffset={`${circumference * (1 - yearPct / 100)}`}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold">{yearPct}%</span>
                    </div>
                  </div>
                </div>
                <div className={`flex justify-between text-[11px] mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span>Задачи: {yearCompleted}/{yearTotal}</span>
                  <span>Цели: {yearWeekDone}/{yearWeekTotal}</span>
                </div>
                <div className="space-y-1">
                  {currentYearGoals.slice(0, 4).map((g) => {
                    const area = getArea(g.areaId);
                    // считаем реальный прогресс для каждой годовой цели
                    const linkedMonthGoals = monthGoals.filter(m => m.yearGoalId === g.id);
                    const linkedWeekGoals = linkedMonthGoals.flatMap(m => weekGoals.filter(w => w.monthGoalId === m.id));
                    const linkedTasks = linkedWeekGoals.flatMap(w => dayTasks.filter(t => t.weekGoalId === w.id));
                    const allItems = linkedWeekGoals.length + linkedTasks.length;
                    const doneAll = linkedWeekGoals.filter(w => w.completed).length + linkedTasks.filter(t => t.completed).length;
                    const goalPct = allItems > 0 ? Math.round((doneAll / allItems) * 100) : 0;
                    return (
                      <div key={g.id}>
                        <div className="flex items-center gap-2 text-xs mb-0.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: area.color }} />
                          <span className="truncate flex-1">{g.title}</span>
                          <span className={`text-[10px] flex-shrink-0 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{goalPct}%</span>
                        </div>
                        <div className={`ml-3.5 h-1 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                          <div className="h-full rounded-full transition-all" style={{ background: area.color, width: `${goalPct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </motion.div>
      </div>

      {taskModalOpen && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setTaskModalOpen(false)}
        />
      )}
    </div>
  );
}
