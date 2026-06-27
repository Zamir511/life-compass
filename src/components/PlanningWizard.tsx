import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { LifeAreaId } from '../types';

export function PlanningWizard() {
  const { theme, setPlanningOpen, dayTasks, weekGoals, lifeAreas, addDayTask } = useStore();
  const [step, setStep] = useState(0);
  const [newTasks, setNewTasks] = useState<{ title: string; areaId: LifeAreaId; weekGoalId: string; startTime: string; endTime: string }[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newArea, setNewArea] = useState<LifeAreaId>(lifeAreas[0]?.id ?? '');
  const [newWeekGoal, setNewWeekGoal] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:00');

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
  const todayTasks = dayTasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const activeWeekGoals = weekGoals.filter(g => !g.completed);

  const steps = [
    'Итоги дня',
    'Цели недели',
    'Задачи на завтра',
    'Расписание',
    'Подтверждение',
  ];

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900'
  }`;

  const addNewTask = () => {
    if (!newTitle.trim()) return;
    setNewTasks([...newTasks, { title: newTitle, areaId: newArea, weekGoalId: newWeekGoal, startTime: newStart, endTime: newEnd }]);
    setNewTitle('');
  };

  const confirm = () => {
    newTasks.forEach(t => {
      addDayTask({
        title: t.title,
        description: '',
        areaId: t.areaId,
        weekGoalId: t.weekGoalId,
        date: tomorrowStr,
        startTime: t.startTime,
        endTime: t.endTime,
        completed: false,
        priority: 'medium',
      });
    });
    setPlanningOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => setPlanningOpen(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 ${
          theme === 'dark' ? 'bg-[#12121a] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">✨ Вечернее планирование</h2>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Планируем {format(addDays(today, 1), 'EEEE, d MMMM', { locale: ru })}
            </p>
          </div>
          <button onClick={() => setPlanningOpen(false)} className={`w-8 h-8 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>×</button>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-6">
          {steps.map((_s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                i <= step
                  ? 'bg-indigo-500 text-white'
                  : theme === 'dark' ? 'bg-white/[0.06] text-gray-500' : 'bg-gray-100 text-gray-400'
              }`}>{i + 1}</div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px ${i < step ? 'bg-indigo-500' : theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-100'}`} />
              )}
            </div>
          ))}
        </div>

        <p className={`text-xs font-medium mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{steps[step]}</p>

        {/* Step 0: Today's results */}
        {step === 0 && (
          <div className="space-y-3">
            <div className={`p-4 rounded-xl text-center ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
              <p className="text-3xl font-bold">{completedToday}/{todayTasks.length}</p>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>задач выполнено сегодня</p>
              {todayTasks.length > 0 && (
                <div className={`h-2 rounded-full mt-3 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-gray-200'}`}>
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${(completedToday / todayTasks.length) * 100}%` }} />
                </div>
              )}
            </div>
            {todayTasks.map(t => {
              const area = getArea(lifeAreas, t.areaId);
              return (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${t.completed ? 'text-white' : theme === 'dark' ? 'border border-gray-600' : 'border border-gray-300'}`}
                    style={t.completed ? { background: area.color } : {}}>
                    {t.completed && '✓'}
                  </span>
                  <span className={t.completed ? 'line-through opacity-50' : ''}>{t.title}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 1: Week goals */}
        {step === 1 && (
          <div className="space-y-2">
            {activeWeekGoals.length === 0 ? (
              <p className={`text-sm text-center py-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Нет активных целей недели
              </p>
            ) : (
              activeWeekGoals.map(g => {
                const area = getArea(lifeAreas, g.areaId);
                return (
                  <div key={g.id} className={`flex items-center gap-3 p-3 rounded-xl ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                    <span className="text-lg">{area.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{g.title}</p>
                      <p className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{area.nameRu}</p>
                    </div>
                    <span className="w-2 h-2 rounded-full" style={{ background: area.color }} />
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Step 2: Tasks for tomorrow */}
        {step === 2 && (
          <div className="space-y-3">
            {newTasks.map((t, i) => {
              const area = getArea(lifeAreas, t.areaId);
              return (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${theme === 'dark' ? 'bg-white/[0.03]' : 'bg-gray-50'}`}>
                  <span className="w-2 h-4 rounded-full" style={{ background: area.color }} />
                  <span className="text-sm flex-1">{t.title}</span>
                  <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{t.startTime} — {t.endTime}</span>
                  <button onClick={() => setNewTasks(newTasks.filter((_, j) => j !== i))} className="text-xs text-red-400">✕</button>
                </div>
              );
            })}
            <div className={`p-3 rounded-xl border border-dashed ${theme === 'dark' ? 'border-white/[0.08]' : 'border-gray-200'}`}>
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Новая задача..." className={inputClass + ' mb-2'} />
              <div className="grid grid-cols-3 gap-2 mb-2">
                <select value={newArea} onChange={e => setNewArea(e.target.value as LifeAreaId)} className={inputClass}>
                  {lifeAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.nameRu}</option>
                  ))}
                </select>
                <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className={inputClass} />
                <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className={inputClass} />
              </div>
              {activeWeekGoals.length > 0 && (
                <select value={newWeekGoal} onChange={e => setNewWeekGoal(e.target.value)} className={inputClass + ' mb-2'}>
                  <option value="">— Привязать к цели недели —</option>
                  {activeWeekGoals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              )}
              <button onClick={addNewTask} className="w-full py-2 rounded-lg text-xs font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
                Добавить задачу
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule view */}
        {step === 3 && (
          <div className="space-y-1">
            {newTasks.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((t, i) => {
              const area = getArea(lifeAreas, t.areaId);
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: area.bgColor }}>
                  <div className="text-center" style={{ color: area.color }}>
                    <p className="text-xs font-bold">{t.startTime}</p>
                    <p className="text-[10px]">{t.endTime}</p>
                  </div>
                  <div className="w-px h-8 rounded-full" style={{ background: area.color }} />
                  <p className="text-sm font-medium" style={{ color: area.color }}>{t.title}</p>
                </div>
              );
            })}
            {newTasks.length === 0 && (
              <p className={`text-sm text-center py-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Вернитесь назад и добавьте задачи
              </p>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div className="text-center space-y-4">
            <p className="text-4xl">🎯</p>
            <h3 className="text-lg font-semibold">Готово!</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {newTasks.length} задач будет добавлено на завтра
            </p>
            <div className="space-y-1 text-left">
              {newTasks.map((t, i) => {
                const area = getArea(lifeAreas, t.areaId);
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full" style={{ background: area.color }} />
                    <span>{t.startTime} — {t.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
          {step > 0 ? (
            <button onClick={() => setStep(step - 1)} className={`px-4 py-2 rounded-lg text-sm ${theme === 'dark' ? 'text-gray-400 hover:bg-white/[0.06]' : 'text-gray-500 hover:bg-gray-100'}`}>
              ← Назад
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)} className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition-colors">
              Далее →
            </button>
          ) : (
            <button onClick={confirm} className="px-6 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
              ✨ Подтвердить план
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
