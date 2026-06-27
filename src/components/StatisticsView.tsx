import { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { MobileNav } from './MobileNav';

export function StatisticsView() {
  const { theme, dayTasks, yearGoals, monthGoals, weekGoals, habits, lifeAreas } = useStore();

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const last90 = eachDayOfInterval({ start: subDays(today, 89), end: today });

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  // Area progress
  const areaProgress = useMemo(() => {
    return lifeAreas.map(area => {
      const tasks = dayTasks.filter(t => t.areaId === area.id);
      const completed = tasks.filter(t => t.completed).length;
      const total = tasks.length;
      const yGoals = yearGoals.filter(g => g.areaId === area.id).length;
      const mGoals = monthGoals.filter(g => g.areaId === area.id).length;
      const wGoals = weekGoals.filter(g => g.areaId === area.id).length;
      const completedWeekGoals = weekGoals.filter(g => g.areaId === area.id && g.completed).length;
      return {
        ...area,
        tasks: total,
        completedTasks: completed,
        pct: total > 0 ? Math.round((completed / total) * 100) : 0,
        yearGoals: yGoals,
        monthGoals: mGoals,
        weekGoals: wGoals,
        completedWeekGoals,
      };
    });
  }, [dayTasks, yearGoals, monthGoals, weekGoals, lifeAreas]);

  // Overall stats
  const totalTasks = dayTasks.length;
  const completedTasks = dayTasks.filter(t => t.completed).length;
  const totalGoals = yearGoals.length + monthGoals.length + weekGoals.length;
  const completedGoals = weekGoals.filter(g => g.completed).length;

  // Daily productivity (last 30 days)
  const dailyData = useMemo(() => {
    return last30.map(d => {
      const ds = format(d, 'yyyy-MM-dd');
      const tasks = dayTasks.filter(t => t.date === ds);
      const completed = tasks.filter(t => t.completed).length;
      return { date: ds, day: format(d, 'EE', { locale: ru }), num: format(d, 'd'), total: tasks.length, completed };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTasks]);

  // Weekly productivity
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({ start: subWeeks(today, 7), end: today }, { weekStartsOn: 1 });
    return weeks.map(w => {
      const ws = startOfWeek(w, { weekStartsOn: 1 });
      const we = endOfWeek(w, { weekStartsOn: 1 });
      const weekDays = eachDayOfInterval({ start: ws, end: we });
      let total = 0;
      let completed = 0;
      weekDays.forEach(d => {
        const ds = format(d, 'yyyy-MM-dd');
        const tasks = dayTasks.filter(t => t.date === ds);
        total += tasks.length;
        completed += tasks.filter(t => t.completed).length;
      });
      return { week: format(ws, 'd MMM', { locale: ru }), total, completed };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTasks]);

  // Streaks
  const longestStreak = useMemo(() => {
    let maxStreak = 0;
    let currentStreak = 0;
    const sortedDays = [...last90].reverse();
    for (const d of sortedDays) {
      const ds = format(d, 'yyyy-MM-dd');
      const tasks = dayTasks.filter(t => t.date === ds);
      if (tasks.length > 0 && tasks.every(t => t.completed)) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (tasks.length > 0) {
        currentStreak = 0;
      }
    }
    return maxStreak;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayTasks]);

  // Habit streaks
  const habitStreaks = useMemo(() => {
    return habits.map(h => {
      let streak = 0;
      let d = new Date(todayStr);
      while (h.completedDates.includes(format(d, 'yyyy-MM-dd'))) {
        streak++;
        d = subDays(d, 1);
      }
      return { ...h, streak };
    });
  }, [habits, todayStr]);

  const maxBar = Math.max(...dailyData.map(d => d.total), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Статистика</h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Аналитика вашей продуктивности</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего задач', value: totalTasks, icon: '📋', sub: `${completedTasks} выполнено` },
          { label: 'Всего целей', value: totalGoals, icon: '🎯', sub: `${completedGoals} завершено` },
          { label: 'Привычек', value: habits.length, icon: '↻', sub: `${habitStreaks.filter(h => h.streak > 0).length} активных` },
          { label: 'Макс. серия', value: longestStreak, icon: '🔥', sub: 'дней подряд' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`${cardClass} p-4`}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-2xl font-bold mt-2">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
            <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Area progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold mb-4">Прогресс по сферам</h2>
          <div className="space-y-4">
            {areaProgress.map(area => (
              <div key={area.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{area.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{area.nameRu}</span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{area.pct}%</span>
                    </div>
                    <div className={`h-2 rounded-full mt-1 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${area.pct}%` }} transition={{ duration: 0.8 }}
                        className="h-full rounded-full" style={{ background: area.color }} />
                    </div>
                  </div>
                </div>
                <div className={`ml-8 flex gap-4 text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  <span>{area.completedTasks}/{area.tasks} задач</span>
                  <span>{area.completedWeekGoals}/{area.weekGoals} нед. целей</span>
                  <span>{area.yearGoals} год. целей</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pie chart simulation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold mb-4">Распределение задач</h2>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {areaProgress.reduce((acc, area) => {
                  const total = areaProgress.reduce((s, a) => s + a.tasks, 0) || 1;
                  const pct = area.tasks / total;
                  const offset = acc.offset;
                  const circumference = 2 * Math.PI * 35;
                  acc.elements.push(
                    <circle key={area.id} cx="50" cy="50" r="35" fill="none" stroke={area.color} strokeWidth="15"
                      strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
                      strokeDashoffset={`${-offset * circumference}`} opacity={0.85} />
                  );
                  acc.offset += pct;
                  return acc;
                }, { offset: 0, elements: [] as React.ReactNode[] }).elements}
                {areaProgress.reduce((s, a) => s + a.tasks, 0) === 0 && (
                  <circle cx="50" cy="50" r="35" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#f1f3f5'} strokeWidth="15" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{totalTasks}</span>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>задач</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {areaProgress.map(a => (
              <div key={a.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{a.nameRu} ({a.tasks})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Daily bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`${cardClass} p-5 md:col-span-2`}>
          <h2 className="text-base font-semibold mb-4">Продуктивность по дням (30 дней)</h2>
          <div className="flex items-end gap-1 h-32">
            {dailyData.map((d, i) => (
              <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div className="w-full relative flex-1 flex flex-col justify-end">
                  {d.total > 0 && (
                    <motion.div initial={{ height: 0 }} animate={{ height: `${(d.total / maxBar) * 100}%` }} transition={{ delay: i * 0.02, duration: 0.5 }}
                      className={`w-full rounded-t ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                      <motion.div initial={{ height: 0 }} animate={{ height: d.total > 0 ? `${(d.completed / d.total) * 100}%` : '0%' }}
                        transition={{ delay: i * 0.02 + 0.3, duration: 0.5 }}
                        className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t" />
                    </motion.div>
                  )}
                </div>
                <p className={`text-[8px] mt-1 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {i % 5 === 0 ? d.num : ''}
                </p>
                {/* Tooltip */}
                <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-900 text-white'
                }`}>
                  {d.completed}/{d.total}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weekly chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold mb-4">По неделям</h2>
          <div className="space-y-2">
            {weeklyData.map((w, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{w.week}</span>
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{w.completed}/{w.total}</span>
                </div>
                <div className={`h-2 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                  <motion.div initial={{ width: 0 }} animate={{ width: w.total > 0 ? `${(w.completed / w.total) * 100}%` : '0%' }}
                    transition={{ duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* GitHub-style heatmap */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold mb-4">Heatmap (90 дней)</h2>
          <div className="grid grid-cols-13 gap-1" style={{ gridTemplateColumns: 'repeat(13, 1fr)' }}>
            {last90.map(d => {
              const ds = format(d, 'yyyy-MM-dd');
              const tasks = dayTasks.filter(t => t.date === ds);
              const completed = tasks.filter(t => t.completed).length;
              const total = tasks.length;
              const intensity = total > 0 ? completed / total : 0;
              return (
                <div key={ds} className="aspect-square rounded-[2px] transition-colors" title={`${format(d, 'd MMM', { locale: ru })}: ${completed}/${total}`}
                  style={{
                    background: total === 0
                      ? (theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f3f5')
                      : `rgba(99,102,241,${0.2 + intensity * 0.8})`
                  }} />
              );
            })}
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className={`text-[9px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Меньше</span>
            {[0.1, 0.3, 0.5, 0.7, 1].map(o => (
              <div key={o} className="w-3 h-3 rounded-[2px]" style={{ background: `rgba(99,102,241,${o})` }} />
            ))}
            <span className={`text-[9px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>Больше</span>
          </div>
        </motion.div>

        {/* Habit streaks */}
        {habitStreaks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className={`${cardClass} p-5 md:col-span-2`}>
            <h2 className="text-base font-semibold mb-4">Серии привычек</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {habitStreaks.map(h => {
                const area = getArea(lifeAreas, h.areaId);
                return (
                  <div key={h.id} className={`p-3 rounded-xl text-center ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                    <p className="text-2xl mb-1">🔥</p>
                    <p className="text-xl font-bold">{h.streak}</p>
                    <p className="text-xs mt-0.5" style={{ color: area.color }}>{h.title}</p>
                    <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>дней</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
