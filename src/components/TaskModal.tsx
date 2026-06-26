import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { LIFE_AREAS, getArea } from '../constants/areas';
import { motion } from 'framer-motion';
// date-fns utils
import { LifeAreaId } from '../types';

interface TaskModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskModal({ taskId, onClose }: TaskModalProps) {
  const { dayTasks, weekGoals, monthGoals, yearGoals, addDayTask, updateDayTask, deleteDayTask, theme, selectedDate } = useStore();
  const task = taskId ? dayTasks.find(t => t.id === taskId) : null;

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [areaId, setAreaId] = useState<LifeAreaId>(task?.areaId || 'knowledge');
  const [weekGoalId, setWeekGoalId] = useState(task?.weekGoalId || '');
  const [date, setDate] = useState(task?.date || selectedDate);
  const [startTime, setStartTime] = useState(task?.startTime || '');
  const [endTime, setEndTime] = useState(task?.endTime || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(task?.priority || 'medium');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (taskId && task) {
      updateDayTask(taskId, { title, description, areaId, weekGoalId, date, startTime, endTime, priority });
    } else {
      addDayTask({ title, description, areaId, weekGoalId, date, startTime, endTime, priority, completed: false });
    }
    onClose();
  };

  const handleDelete = () => {
    if (taskId) {
      deleteDayTask(taskId);
      onClose();
    }
  };

  // Build goal chain
  const weekGoal = weekGoals.find(g => g.id === (task?.weekGoalId || weekGoalId));
  const monthGoal = weekGoal ? monthGoals.find(g => g.id === weekGoal.monthGoalId) : null;
  const yearGoal = monthGoal ? yearGoals.find(g => g.id === monthGoal.yearGoalId) : null;

  const filteredWeekGoals = weekGoals.filter(g => g.areaId === areaId);

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900'
  }`;

  const labelClass = `text-xs font-medium mb-1.5 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-[#12121a] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-2xl'
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{taskId ? 'Редактировать задачу' : 'Новая задача'}</h2>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'
          }`}>×</button>
        </div>

        {/* Goal Chain */}
        {yearGoal && (
          <div className={`mb-4 p-3 rounded-xl text-xs space-y-1 ${
            theme === 'dark' ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-gray-50 border border-gray-100'
          }`}>
            <p className={`font-medium mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Цепочка целей:</p>
            <div className="flex items-center gap-2">
              <span className="text-base">{getArea(yearGoal.areaId).icon}</span>
              <span>Год: {yearGoal.title}</span>
            </div>
            {monthGoal && (
              <div className="flex items-center gap-2 ml-4">
                <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}>↳</span>
                <span>Месяц: {monthGoal.title}</span>
              </div>
            )}
            {weekGoal && (
              <div className="flex items-center gap-2 ml-8">
                <span className={theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}>↳</span>
                <span>Неделя: {weekGoal.title}</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Название</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Что нужно сделать?"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Детали задачи..."
              rows={3}
              className={inputClass + ' resize-none'}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Сфера жизни</label>
              <select value={areaId} onChange={(e) => setAreaId(e.target.value as LifeAreaId)} className={inputClass}>
                {LIFE_AREAS.map(a => (
                  <option key={a.id} value={a.id}>{a.icon} {a.nameRu}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Приоритет</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as 'low'|'medium'|'high')} className={inputClass}>
                <option value="low">🟢 Низкий</option>
                <option value="medium">🟡 Средний</option>
                <option value="high">🔴 Высокий</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Цель недели</label>
            <select value={weekGoalId} onChange={(e) => setWeekGoalId(e.target.value)} className={inputClass}>
              <option value="">— Не привязана —</option>
              {filteredWeekGoals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Дата</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Начало</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Конец</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          {taskId ? (
            <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Удалить задачу
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              theme === 'dark' ? 'hover:bg-white/[0.06] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}>
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
            >
              {taskId ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
