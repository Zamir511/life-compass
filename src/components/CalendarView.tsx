import { PointerEvent, useMemo, useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { TaskDay, Habit, LifeArea, CalendarView as CalView } from '../types';
import { format, addDays, startOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parseISO, isToday, addMonths, subMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskModal } from './TaskModal';
import { MobileNav } from './MobileNav';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function CalendarView() {
  const { dayTasks, habits, lifeAreas, calendarView, setCalendarView, selectedDate, setSelectedDate, theme, toggleTask, updateDayTask } = useStore();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const currentDate = parseISO(selectedDate);

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  const views: { id: CalView; label: string }[] = [
    { id: 'day', label: 'День' },
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'agenda', label: 'Список' },
  ];

  const navigateDate = (direction: number) => {
    if (calendarView === 'day') setSelectedDate(format(addDays(currentDate, direction), 'yyyy-MM-dd'));
    else if (calendarView === 'week') setSelectedDate(format(addDays(currentDate, direction * 7), 'yyyy-MM-dd'));
    else setSelectedDate(format(direction > 0 ? addMonths(currentDate, 1) : subMonths(currentDate, 1), 'yyyy-MM-dd'));
  };

  const openTask = (id: string) => { setSelectedTaskId(id); setTaskModalOpen(true); };
  const newTask = () => { setSelectedTaskId(null); setTaskModalOpen(true); };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Календарь</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            {format(currentDate, 'LLLL yyyy', { locale: ru })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center rounded-xl p-1 ${theme === 'dark' ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
            {views.map((v) => (
              <button key={v.id} onClick={() => setCalendarView(v.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  calendarView === v.id
                    ? theme === 'dark' ? 'bg-white/[0.1] text-white' : 'bg-white text-gray-900 shadow-sm'
                    : theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                }`}>{v.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigateDate(-1)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>←</button>
            <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>Сегодня</button>
            <button onClick={() => navigateDate(1)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>→</button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={calendarView + selectedDate} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {calendarView === 'day' && <DayViewComp date={currentDate} tasks={dayTasks} lifeAreas={lifeAreas} theme={theme} toggleTask={toggleTask} updateDayTask={updateDayTask} cardClass={cardClass} onTaskClick={openTask} onNewTask={newTask} />}
          {calendarView === 'week' && <WeekViewComp date={currentDate} tasks={dayTasks} lifeAreas={lifeAreas} theme={theme} cardClass={cardClass} onTaskClick={openTask} onNewTask={newTask} />}
          {calendarView === 'month' && <MonthViewComp date={currentDate} tasks={dayTasks} habits={habits} lifeAreas={lifeAreas} theme={theme} setSelectedDate={setSelectedDate} setCalendarView={setCalendarView} cardClass={cardClass} />}
          {calendarView === 'agenda' && <AgendaViewComp tasks={dayTasks} lifeAreas={lifeAreas} theme={theme} toggleTask={toggleTask} cardClass={cardClass} onTaskClick={openTask} />}
        </motion.div>
      </AnimatePresence>

      {taskModalOpen && <TaskModal taskId={selectedTaskId} onClose={() => setTaskModalOpen(false)} />}
    </div>
  );
}

interface DayProps { date: Date; tasks: TaskDay[]; lifeAreas: LifeArea[]; theme: string; toggleTask: (id: string) => void; updateDayTask: (id: string, task: Partial<TaskDay>) => void; cardClass: string; onTaskClick: (id: string) => void; onNewTask: () => void; }

function DayViewComp({ date, tasks, lifeAreas, theme, toggleTask, updateDayTask, cardClass, onTaskClick, onNewTask }: DayProps) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const dayTasks = tasks.filter((t: TaskDay) => t.date === dateStr);
  const timedTasks = dayTasks.filter((t: TaskDay) => t.startTime);
  const untimedTasks = dayTasks.filter((t: TaskDay) => !t.startTime);
  const [preview, setPreview] = useState<{ taskId: string; startTime: string; endTime: string } | null>(null);
  const dragMovedRef = useRef(false);

  const startTimeEdit = (event: PointerEvent<HTMLDivElement>, task: TaskDay, mode: 'move' | 'resize') => {
    if (!task.startTime) return;
    event.preventDefault();
    event.stopPropagation();

    const startY = event.clientY;
    const originalStart = timeToMinutes(task.startTime);
    const originalEnd = timeToMinutes(task.endTime) || originalStart + 60;
    dragMovedRef.current = false;

    const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
      const rawDelta = moveEvent.clientY - startY;
      const delta = Math.round(rawDelta / 15) * 15;
      if (Math.abs(rawDelta) > 4) dragMovedRef.current = true;

      if (mode === 'move') {
        const duration = Math.max(15, originalEnd - originalStart);
        const nextStart = clampMinutes(originalStart + delta);
        const nextEnd = clampMinutes(nextStart + duration);
        setPreview({ taskId: task.id, startTime: minutesToTime(nextStart), endTime: minutesToTime(nextEnd) });
      } else {
        const nextEnd = Math.max(originalStart + 15, clampMinutes(originalEnd + delta));
        setPreview({ taskId: task.id, startTime: minutesToTime(originalStart), endTime: minutesToTime(nextEnd) });
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      const current = useStore.getState().dayTasks.find((t) => t.id === task.id);
      setPreview((p) => {
        if (p && current) updateDayTask(task.id, { startTime: p.startTime, endTime: p.endTime });
        return null;
      });
      window.setTimeout(() => {
        dragMovedRef.current = false;
      }, 0);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div className={cardClass + ' overflow-hidden'}>
      <div className={`px-4 py-3 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <h3 className="text-sm font-semibold">{format(date, 'EEEE, d MMMM', { locale: ru })}</h3>
        <button onClick={onNewTask} className="text-xs text-indigo-400 hover:text-indigo-300">+ Задача</button>
      </div>
      
      {untimedTasks.length > 0 && (
        <div className={`px-4 py-2 border-b ${theme === 'dark' ? 'border-white/[0.06] bg-white/[0.01]' : 'border-gray-100 bg-gray-50/50'}`}>
          {untimedTasks.map((task: TaskDay) => {
            const area = getArea(lifeAreas, task.areaId);
            return (
              <div key={task.id} className="flex items-center gap-2 py-1 cursor-pointer" onClick={() => onTaskClick(task.id)}>
                <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${task.completed ? 'text-white' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                  style={task.completed ? { background: area.color, borderColor: area.color } : {}}
                >{task.completed && '✓'}</button>
                <span className={`text-xs ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative overflow-y-auto max-h-[600px]">
        {HOURS.map(hour => (
          <div key={hour} className={`flex border-b ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
            <div className={`w-16 flex-shrink-0 py-2 px-3 text-right text-[10px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex-1 h-[60px] relative">
              {timedTasks
                .filter((t: TaskDay) => parseInt(t.startTime!.split(':')[0]) === hour)
                .map((task: TaskDay) => {
                  const area = getArea(lifeAreas, task.areaId);
                  const activePreview = preview?.taskId === task.id ? preview : null;
                  const visibleStart = activePreview?.startTime ?? task.startTime!;
                  const visibleEnd = activePreview?.endTime ?? task.endTime;
                  const startMin = parseInt(visibleStart.split(':')[1] || '0');
                  const endH = visibleEnd ? parseInt(visibleEnd.split(':')[0]) : hour + 1;
                  const endMin = visibleEnd ? parseInt(visibleEnd.split(':')[1] || '0') : 0;
                  const duration = (endH - hour) * 60 + (endMin - startMin);
                  const height = Math.max(duration, 20);

                  return (
                    <div key={task.id}
                      onPointerDown={(e) => startTimeEdit(e, task, 'move')}
                      onClick={() => {
                        if (!dragMovedRef.current) onTaskClick(task.id);
                      }}
                      className="absolute left-1 right-2 rounded-lg px-2 py-1 cursor-grab active:cursor-grabbing transition-all hover:opacity-80 overflow-hidden touch-none select-none"
                      style={{ top: `${startMin}px`, height: `${height}px`, background: area.bgColor, borderLeft: `3px solid ${area.color}` }}>
                      <p className="text-[11px] font-medium truncate" style={{ color: area.color }}>{task.title}</p>
                      <p className="text-[10px] opacity-60" style={{ color: area.color }}>{visibleStart} — {visibleEnd || ''}</p>
                      <div
                        onPointerDown={(e) => startTimeEdit(e, task, 'resize')}
                        className="absolute left-2 right-2 bottom-0 h-2 cursor-ns-resize"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function timeToMinutes(time?: string) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

function minutesToTime(value: number) {
  const minutes = clampMinutes(value);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function clampMinutes(value: number) {
  return Math.min(23 * 60 + 45, Math.max(0, Math.round(value / 15) * 15));
}

interface WeekProps { date: Date; tasks: TaskDay[]; lifeAreas: LifeArea[]; theme: string; cardClass: string; onTaskClick: (id: string) => void; onNewTask: () => void; }

function WeekViewComp({ date, tasks, lifeAreas, theme, cardClass, onTaskClick, onNewTask }: WeekProps) {
  const ws = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));

  return (
    <div className={cardClass + ' overflow-hidden'}>
      <div className={`grid grid-cols-8 border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <div className="p-2" />
        {days.map(d => (
          <div key={d.toISOString()} className={`p-2 text-center border-l ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
            <p className={`text-[10px] uppercase ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{format(d, 'EEE', { locale: ru })}</p>
            <p className={`text-sm font-semibold mt-0.5 ${isToday(d) ? 'text-indigo-500' : ''}`}>{format(d, 'd')}</p>
          </div>
        ))}
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {HOURS.filter(h => h >= 6 && h <= 23).map(hour => (
          <div key={hour} className={`grid grid-cols-8 border-b ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
            <div className={`py-1 px-2 text-right text-[10px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{hour.toString().padStart(2, '0')}:00</div>
            {days.map(d => {
              const ds = format(d, 'yyyy-MM-dd');
              const hourTasks = tasks.filter((t: TaskDay) => t.date === ds && t.startTime && parseInt(t.startTime.split(':')[0]) === hour);
              return (
                <div key={ds + hour} className={`h-[50px] border-l relative ${theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-50'}`}>
                  {hourTasks.map((task: TaskDay) => {
                    const area = getArea(lifeAreas, task.areaId);
                    return (
                      <div key={task.id} onClick={() => onTaskClick(task.id)}
                        className="absolute inset-x-0.5 rounded px-1 py-0.5 cursor-pointer text-[9px] overflow-hidden hover:opacity-80 transition-opacity"
                        style={{ background: area.bgColor, borderLeft: `2px solid ${area.color}`, top: 0, minHeight: '100%' }}>
                        <span style={{ color: area.color }} className="font-medium truncate block">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className={`p-2 border-t flex justify-end ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        <button onClick={onNewTask} className="text-xs text-indigo-400 hover:text-indigo-300">+ Новая задача</button>
      </div>
    </div>
  );
}

interface MonthProps { date: Date; tasks: TaskDay[]; habits: Habit[]; lifeAreas: LifeArea[]; theme: string; setSelectedDate: (d: string) => void; setCalendarView: (v: CalView) => void; cardClass: string; }

function MonthViewComp({ date, tasks, habits, lifeAreas, theme, setSelectedDate, setCalendarView, cardClass }: MonthProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const lastDay = addDays(monthEnd, 6);
  const calEnd = startOfWeek(lastDay, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: addDays(calEnd, 6) });

  return (
    <div className={cardClass + ' overflow-hidden'}>
      <div className={`grid grid-cols-7 border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
          <div key={d} className={`p-2 text-center text-[11px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.slice(0, 42).map((d, i) => {
          const ds = format(d, 'yyyy-MM-dd');
          const dt = tasks.filter((t: TaskDay) => t.date === ds);
          const dh = habits.filter((h: Habit) => h.completedDates.includes(ds));
          const isCur = isSameMonth(d, date);
          const td = isToday(d);
          return (
            <div key={i} onClick={() => { setSelectedDate(ds); setCalendarView('day'); }}
              className={`min-h-[80px] md:min-h-[100px] p-1.5 border-b border-r cursor-pointer transition-colors ${
                theme === 'dark' ? `border-white/[0.04] ${td ? 'bg-indigo-500/[0.05]' : 'hover:bg-white/[0.02]'}` : `border-gray-50 ${td ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'}`
              } ${!isCur ? 'opacity-30' : ''}`}>
              <p className={`text-xs font-medium mb-1 ${td ? 'text-indigo-500' : theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{format(d, 'd')}</p>
              <div className="space-y-0.5">
                {dt.slice(0, 3).map((t: TaskDay) => (
                  <div key={t.id} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: getArea(lifeAreas, t.areaId).color }} />
                    <span className={`text-[9px] truncate ${t.completed ? 'line-through opacity-50' : ''}`}>{t.title}</span>
                  </div>
                ))}
                {dt.length > 3 && <p className={`text-[9px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>+{dt.length - 3}</p>}
                {dh.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dh.slice(0, 4).map((h: Habit) => <span key={h.id} className="w-1.5 h-1.5 rounded-full" style={{ background: getArea(lifeAreas, h.areaId).color }} />)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AgendaProps { tasks: TaskDay[]; lifeAreas: LifeArea[]; theme: string; toggleTask: (id: string) => void; cardClass: string; onTaskClick: (id: string) => void; }

function AgendaViewComp({ tasks, lifeAreas, theme, toggleTask, cardClass, onTaskClick }: AgendaProps) {
  const today = new Date();
  const groups = useMemo(() => {
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(addDays(today, 1), 'yyyy-MM-dd');
    const weekEndStr = format(addDays(today, 7), 'yyyy-MM-dd');
    return [
      { label: 'Сегодня', items: tasks.filter((t: TaskDay) => t.date === todayStr) },
      { label: 'Завтра', items: tasks.filter((t: TaskDay) => t.date === tomorrowStr) },
      { label: 'На этой неделе', items: tasks.filter((t: TaskDay) => t.date > tomorrowStr && t.date <= weekEndStr) },
      { label: 'Позже', items: tasks.filter((t: TaskDay) => t.date > weekEndStr) },
    ].filter(g => g.items.length > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  return (
    <div className="space-y-4">
      {groups.length === 0 && (
        <div className={`${cardClass} p-8 text-center`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Нет предстоящих задач</p>
        </div>
      )}
      {groups.map(group => (
        <div key={group.label} className={cardClass + ' overflow-hidden'}>
          <div className={`px-4 py-2.5 border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
            <h3 className="text-sm font-semibold">{group.label}</h3>
          </div>
          <div>
            {group.items.sort((a: TaskDay, b: TaskDay) => (a.startTime || '99').localeCompare(b.startTime || '99')).map((task: TaskDay) => {
              const area = getArea(lifeAreas, task.areaId);
              return (
                <div key={task.id} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b last:border-0 ${
                  theme === 'dark' ? 'hover:bg-white/[0.02] border-white/[0.04]' : 'hover:bg-gray-50 border-gray-50'
                }`} onClick={() => onTaskClick(task.id)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] flex-shrink-0 ${task.completed ? 'text-white' : theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                    style={task.completed ? { background: area.color, borderColor: area.color } : {}}
                  >{task.completed && '✓'}</button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${task.completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {task.startTime && <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{task.startTime}{task.endTime ? ` — ${task.endTime}` : ''}</span>}
                      <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-300'}`}>{format(parseISO(task.date), 'd MMM', { locale: ru })}</span>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: area.color }} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
