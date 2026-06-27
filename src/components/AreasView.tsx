import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { MobileNav } from './MobileNav';

const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4', '#84cc16', '#ec4899', '#64748b'];
const icons = ['◎', '★', '◆', '✦', '☀️', '🌙', '📚', '💪', '💰', '🏠', '💼', '🙏', '🎯', '🧠', '❤️'];

export function AreasView() {
  const { theme, lifeAreas, addLifeArea, updateLifeArea, deleteLifeArea, dayTasks, yearGoals, habits } = useStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('◎');
  const [color, setColor] = useState(colors[0]);

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900'
  }`;

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addLifeArea({ name: trimmed, nameRu: trimmed, icon, color });
    setName('');
    setIcon('◎');
    setColor(colors[0]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Сферы</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Соберите свои направления: работа, дом, здоровье, проекты или что-то личное.
          </p>
        </div>
      </div>

      <div className={`${cardClass} p-4 mb-6`}>
        <div className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Новая сфера..." className={inputClass} />
          <select value={icon} onChange={(e) => setIcon(e.target.value)} className={inputClass + ' md:w-28'}>
            {icons.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600">
            Добавить
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-lg transition-transform ${color === c ? 'scale-110 ring-2 ring-white/60' : ''}`}
              style={{ background: c }}
              aria-label={`Выбрать цвет ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {lifeAreas.map((area, index) => {
          const taskCount = dayTasks.filter((t) => t.areaId === area.id).length;
          const goalCount = yearGoals.filter((g) => g.areaId === area.id).length;
          const habitCount = habits.filter((h) => h.areaId === area.id).length;

          return (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className={`${cardClass} p-4`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: area.bgColor, color: area.color }}>
                  {area.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    value={area.nameRu}
                    onChange={(e) => updateLifeArea(area.id, { name: e.target.value, nameRu: e.target.value })}
                    className="w-full bg-transparent outline-none text-sm font-semibold"
                  />
                  <p className={`text-[11px] mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {taskCount} задач · {goalCount} целей · {habitCount} привычек
                  </p>
                </div>
                <button onClick={() => deleteLifeArea(area.id)} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
                  Удалить
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateLifeArea(area.id, { color: c })}
                    className={`w-5 h-5 rounded-md ${area.color === c ? 'ring-2 ring-white/60' : ''}`}
                    style={{ background: c }}
                    aria-label={`Поменять цвет на ${c}`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
