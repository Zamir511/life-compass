import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { LifeAreaId } from '../types';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileNav } from './MobileNav';

export function HabitsView() {
  const { theme, habits, addHabit, deleteHabit, toggleHabitDate, lifeAreas } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState<LifeAreaId>(lifeAreas[0]?.id ?? '');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const last30 = eachDayOfInterval({ start: subDays(today, 29), end: today });
  const last7 = last30.slice(-7);

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900'
  }`;

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addHabit({ title: newTitle, areaId: newArea, frequency: 'daily' });
    setNewTitle('');
    setModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Привычки</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Ежедневный трекер привычек
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          + Новая привычка
        </button>
      </div>

      {/* Today summary */}
      <div className={`${cardClass} p-5 mb-6`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">Сегодня</h2>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {habits.filter(h => h.completedDates.includes(todayStr)).length}/{habits.length} выполнено
          </p>
        </div>
        <div className="space-y-2">
          {habits.map(h => {
            const area = getArea(lifeAreas, h.areaId);
            const done = h.completedDates.includes(todayStr);
            return (
              <motion.div key={h.id} whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  done
                    ? theme === 'dark' ? 'bg-emerald-500/[0.06]' : 'bg-emerald-50'
                    : theme === 'dark' ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleHabitDate(h.id, todayStr)}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-sm transition-all ${
                  done ? 'text-white' : theme === 'dark' ? 'border border-gray-600' : 'border border-gray-300'
                }`} style={done ? { background: area.color } : {}}>
                  {done && '✓'}
                </div>
                <span className={`text-sm flex-1 ${done ? 'line-through opacity-60' : ''}`}>{h.title}</span>
                <span className="text-lg">{area.icon}</span>
              </motion.div>
            );
          })}
          {habits.length === 0 && (
            <p className={`text-sm text-center py-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Добавьте первую привычку
            </p>
          )}
        </div>
      </div>

      {/* Weekly matrix */}
      {habits.length > 0 && (
        <div className={`${cardClass} p-5 mb-6`}>
          <h2 className="text-base font-semibold mb-4">Неделя</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={`text-left text-xs font-medium pb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Привычка</th>
                  {last7.map(d => (
                    <th key={d.toISOString()} className={`text-center text-[10px] pb-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} ${isToday(d) ? 'text-indigo-400' : ''}`}>
                      {format(d, 'EE', { locale: ru })}
                      <br />
                      <span className="font-semibold">{format(d, 'd')}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map(h => {
                  const area = getArea(lifeAreas, h.areaId);
                  return (
                    <tr key={h.id} className={`border-t ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
                      <td className="py-2 text-sm">{h.title}</td>
                      {last7.map(d => {
                        const ds = format(d, 'yyyy-MM-dd');
                        const done = h.completedDates.includes(ds);
                        return (
                          <td key={ds} className="text-center py-2">
                            <button onClick={() => toggleHabitDate(h.id, ds)}
                              className={`w-7 h-7 rounded-lg mx-auto flex items-center justify-center text-xs transition-all ${
                                done ? 'text-white' : theme === 'dark' ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                              style={done ? { background: area.color } : {}}>
                              {done && '✓'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 30-day heatmap */}
      {habits.length > 0 && (
        <div className={`${cardClass} p-5`}>
          <h2 className="text-base font-semibold mb-4">30 дней</h2>
          <div className="space-y-3">
            {habits.map(h => {
              const area = getArea(lifeAreas, h.areaId);
              const streak = getStreak(h.completedDates, todayStr);
              return (
                <div key={h.id} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{area.icon}</span>
                      <span className="text-xs font-medium">{h.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        🔥 {streak} дней
                      </span>
                      <button onClick={() => deleteHabit(h.id)}
                        className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {last30.map(d => {
                      const ds = format(d, 'yyyy-MM-dd');
                      const done = h.completedDates.includes(ds);
                      return (
                        <div key={ds}
                          onClick={() => toggleHabitDate(h.id, ds)}
                          className="w-full aspect-square rounded-[3px] cursor-pointer transition-all hover:scale-110"
                          style={{ background: done ? area.color : theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f1f3f5' }}
                          title={format(d, 'd MMMM', { locale: ru })}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add habit modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#12121a] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-2xl'}`}>
              <h2 className="text-lg font-semibold mb-4">Новая привычка</h2>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Название</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Привычка..." className={inputClass} autoFocus />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Сфера</label>
                  <select value={newArea} onChange={e => setNewArea(e.target.value as LifeAreaId)} className={inputClass}>
                    {lifeAreas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.nameRu}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setModalOpen(false)} className={`px-4 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Отмена</button>
                <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600">Создать</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function isToday(d: Date) {
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

function getStreak(completedDates: string[], todayStr: string): number {
  let streak = 0;
  let d = new Date(todayStr);
  while (completedDates.includes(format(d, 'yyyy-MM-dd'))) {
    streak++;
    d = subDays(d, 1);
  }
  return streak;
}
