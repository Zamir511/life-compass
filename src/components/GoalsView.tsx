import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { LifeAreaId } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileNav } from './MobileNav';

type GoalLevel = 'year' | 'month' | 'week';

export function GoalsView() {
  const { theme, yearGoals, monthGoals, weekGoals, addYearGoal, addMonthGoal, addWeekGoal,
    deleteYearGoal, deleteMonthGoal, deleteWeekGoal, updateWeekGoal, lifeAreas } = useStore();
  const [activeLevel, setActiveLevel] = useState<GoalLevel>('year');
  const [modalOpen, setModalOpen] = useState(false);
  const [filterArea, setFilterArea] = useState<LifeAreaId | 'all'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newArea, setNewArea] = useState<LifeAreaId>(lifeAreas[0]?.id ?? '');
  const [newParent, setNewParent] = useState('');

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900'
  }`;

  const levels: { id: GoalLevel; label: string }[] = [
    { id: 'year', label: 'Годовые' },
    { id: 'month', label: 'Месячные' },
    { id: 'week', label: 'Недельные' },
  ];

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const now = new Date();
    if (activeLevel === 'year') {
      addYearGoal({ title: newTitle, description: newDesc, areaId: newArea, year: now.getFullYear() });
    } else if (activeLevel === 'month') {
      addMonthGoal({ title: newTitle, description: newDesc, areaId: newArea, yearGoalId: newParent, month: now.getMonth(), year: now.getFullYear() });
    } else {
      const fmt = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      addWeekGoal({ title: newTitle, description: newDesc, areaId: newArea, monthGoalId: newParent, weekStart: fmt, completed: false });
    }
    setNewTitle('');
    setNewDesc('');
    setNewParent('');
    setModalOpen(false);
  };

  const filteredYearGoals = filterArea === 'all' ? yearGoals : yearGoals.filter(g => g.areaId === filterArea);
  const filteredMonthGoals = filterArea === 'all' ? monthGoals : monthGoals.filter(g => g.areaId === filterArea);
  const filteredWeekGoals = filterArea === 'all' ? weekGoals : weekGoals.filter(g => g.areaId === filterArea);

  const currentGoals = activeLevel === 'year' ? filteredYearGoals : activeLevel === 'month' ? filteredMonthGoals : filteredWeekGoals;

  const getChain = (goalId: string, level: GoalLevel) => {
    if (level === 'year') return [];
    if (level === 'month') {
      const mg = monthGoals.find(g => g.id === goalId);
      if (!mg) return [];
      const yg = yearGoals.find(g => g.id === mg.yearGoalId);
      return yg ? [{ level: 'Год', title: yg.title, icon: getArea(lifeAreas, yg.areaId).icon }] : [];
    }
    const wg = weekGoals.find(g => g.id === goalId);
    if (!wg) return [];
    const mg = monthGoals.find(g => g.id === wg.monthGoalId);
    const chain: { level: string; title: string; icon: string }[] = [];
    if (mg) {
      const yg = yearGoals.find(g => g.id === mg.yearGoalId);
      if (yg) chain.push({ level: 'Год', title: yg.title, icon: getArea(lifeAreas, yg.areaId).icon });
      chain.push({ level: 'Месяц', title: mg.title, icon: getArea(lifeAreas, mg.areaId).icon });
    }
    return chain;
  };

  const parentOptions = () => {
    if (activeLevel === 'month') return yearGoals.filter(g => filterArea === 'all' || g.areaId === newArea);
    if (activeLevel === 'week') return monthGoals.filter(g => filterArea === 'all' || g.areaId === newArea);
    return [];
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Цели</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Иерархия стратегических целей</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          + Новая цель
        </button>
      </div>

      {/* Level tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className={`flex items-center rounded-xl p-1 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
          {levels.map(l => (
            <button key={l.id} onClick={() => setActiveLevel(l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeLevel === l.id
                  ? theme === 'dark' ? 'bg-white/[0.1] text-white' : 'bg-white text-gray-900 shadow-sm'
                  : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>{l.label}</button>
          ))}
        </div>
        <div className={`flex items-center rounded-xl p-1 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
          <button onClick={() => setFilterArea('all')}
            className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filterArea === 'all' ? (theme === 'dark' ? 'bg-white/[0.1] text-white' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-400'}`}>Все</button>
          {lifeAreas.map(a => (
            <button key={a.id} onClick={() => setFilterArea(a.id)}
              className={`px-2 py-1.5 rounded-lg text-xs transition-all ${filterArea === a.id ? (theme === 'dark' ? 'bg-white/[0.1] text-white' : 'bg-white text-gray-900 shadow-sm') : 'text-gray-400'}`}>
              {a.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid md:grid-cols-2 gap-3">
        <AnimatePresence>
          {currentGoals.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`${cardClass} p-8 text-center md:col-span-2`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Нет целей. Создайте первую!</p>
            </motion.div>
          )}
          {currentGoals.map((goal, i) => {
            const area = getArea(lifeAreas, goal.areaId);
            const chain = getChain(goal.id, activeLevel);
            const isWeek = activeLevel === 'week' && 'completed' in goal;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ delay: i * 0.03 }}
                className={`${cardClass} p-4 group`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{area.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{goal.title}</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{area.nameRu}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isWeek && (
                      <button onClick={() => updateWeekGoal(goal.id, { completed: !(goal as typeof weekGoals[0]).completed })}
                        className={`text-xs px-2 py-1 rounded ${(goal as typeof weekGoals[0]).completed ? 'text-emerald-400' : theme === 'dark' ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                        {(goal as typeof weekGoals[0]).completed ? '✓' : '○'}
                      </button>
                    )}
                    <button onClick={() => {
                      if (activeLevel === 'year') deleteYearGoal(goal.id);
                      else if (activeLevel === 'month') deleteMonthGoal(goal.id);
                      else deleteWeekGoal(goal.id);
                    }} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded">✕</button>
                  </div>
                </div>
                
                {'progress' in goal && typeof (goal as { progress: number }).progress === 'number' && (
                  <div className="mb-2">
                    <div className={`h-1 rounded-full ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`}>
                      <div className="h-full rounded-full transition-all" style={{ background: area.color, width: `${(goal as { progress: number }).progress}%` }} />
                    </div>
                  </div>
                )}

                {chain.length > 0 && (
                  <div className={`mt-2 pt-2 border-t ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
                    {chain.map((c, j) => (
                      <div key={j} className={`flex items-center gap-1 text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span>{c.icon}</span>
                        <span>{c.level}: {c.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-2xl p-6 ${theme === 'dark' ? 'bg-[#12121a] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-2xl'}`}>
              <h2 className="text-lg font-semibold mb-4">Новая {activeLevel === 'year' ? 'годовая' : activeLevel === 'month' ? 'месячная' : 'недельная'} цель</h2>
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Название</label>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Цель..." className={inputClass} autoFocus />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Описание</label>
                  <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Сфера</label>
                  <select value={newArea} onChange={e => setNewArea(e.target.value as LifeAreaId)} className={inputClass}>
                    {lifeAreas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.nameRu}</option>)}
                  </select>
                </div>
                {activeLevel !== 'year' && (
                  <div>
                    <label className={`text-xs font-medium mb-1 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Родительская цель ({activeLevel === 'month' ? 'годовая' : 'месячная'})
                    </label>
                    <select value={newParent} onChange={e => setNewParent(e.target.value)} className={inputClass}>
                      <option value="">— Не выбрана —</option>
                      {parentOptions().map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setModalOpen(false)} className={`px-4 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/[0.06]' : 'text-gray-500 hover:bg-gray-100'}`}>Отмена</button>
                <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600">Создать</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
