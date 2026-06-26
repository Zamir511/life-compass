import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { ViewMode } from '../types';
import { LIFE_AREAS } from '../constants/areas';
import { showToast } from './Toast';

const navItems: { id: ViewMode; label: string; icon: string; shortcut: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: '◉', shortcut: '1' },
  { id: 'calendar', label: 'Календарь', icon: '▦', shortcut: '2' },
  { id: 'goals', label: 'Цели', icon: '◎', shortcut: '3' },
  { id: 'habits', label: 'Привычки', icon: '↻', shortcut: '4' },
  { id: 'statistics', label: 'Статистика', icon: '▤', shortcut: '5' },
];

export function Sidebar() {
  const store = useStore();
  const { view, setView, theme, toggleTheme, setPlanningOpen, setCommandPaletteOpen, dayTasks, habits } = store;
  
  const today = new Date();

  // Экспорт данных в JSON файл
  const exportData = () => {
    const data = {
      yearGoals: store.yearGoals,
      monthGoals: store.monthGoals,
      weekGoals: store.weekGoals,
      dayTasks: store.dayTasks,
      habits: store.habits,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-compass-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Данные экспортированы', 'success');
  };

  // Импорт данных из JSON файла
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.yearGoals) data.yearGoals.forEach((g: typeof store.yearGoals[0]) => store.addYearGoal(g));
        if (data.monthGoals) data.monthGoals.forEach((g: typeof store.monthGoals[0]) => store.addMonthGoal(g));
        if (data.weekGoals) data.weekGoals.forEach((g: typeof store.weekGoals[0]) => store.addWeekGoal(g));
        if (data.dayTasks) data.dayTasks.forEach((t: typeof store.dayTasks[0]) => store.addDayTask(t));
        if (data.habits) data.habits.forEach((h: typeof store.habits[0]) => store.addHabit(h));
        showToast('Данные успешно импортированы!', 'success');
      } catch (err) {
        showToast('Ошибка при импорте файла', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Очистить все данные
  const clearAllData = () => {
    if (confirm('Вы уверены? Все цели, задачи и привычки будут удалены безвозвратно.')) {
      localStorage.removeItem('life-compass-storage');
      window.location.reload();
    }
  };
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const todayTasks = dayTasks.filter(t => t.date === todayStr);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const todayHabits = habits.filter(h => h.completedDates.includes(todayStr)).length;

  return (
    <aside className={`w-[260px] h-screen sticky top-0 flex flex-col border-r transition-colors duration-300 max-md:hidden ${
      theme === 'dark'
        ? 'bg-[#0c0c14]/80 backdrop-blur-xl border-white/[0.06]'
        : 'bg-white/80 backdrop-blur-xl border-gray-200/60'
    }`}>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-lg shadow-lg shadow-indigo-500/20">
          🧭
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">Life Compass</h1>
          <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Strategic Life Planning</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className={`mx-3 mb-3 p-3 rounded-xl ${
        theme === 'dark' ? 'bg-gradient-to-br from-indigo-500/[0.08] to-purple-500/[0.04] border border-indigo-500/[0.1]' : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/50'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-indigo-300/60' : 'text-indigo-400'}`}>Сегодня</p>
            <p className="text-lg font-bold">{completedToday}<span className={`text-xs font-normal ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/{todayTasks.length}</span></p>
          </div>
          <div className="text-right">
            <p className={`text-[10px] font-medium ${theme === 'dark' ? 'text-purple-300/60' : 'text-purple-400'}`}>Привычки</p>
            <p className="text-lg font-bold">{todayHabits}<span className={`text-xs font-normal ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>/{habits.length}</span></p>
          </div>
        </div>
        {todayTasks.length > 0 && (
          <div className={`h-1 rounded-full mt-2 ${theme === 'dark' ? 'bg-white/[0.06]' : 'bg-indigo-100'}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${(completedToday / todayTasks.length) * 100}%` }} />
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-3 mb-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
            theme === 'dark'
              ? 'bg-white/[0.03] hover:bg-white/[0.06] text-gray-500 border border-white/[0.04]'
              : 'bg-gray-50 hover:bg-gray-100 text-gray-400 border border-gray-100'
          }`}
        >
          <span className="text-sm">⌕</span>
          <span>Поиск...</span>
          <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
            theme === 'dark' ? 'bg-white/[0.06] text-gray-500' : 'bg-gray-200 text-gray-400'
          }`}>⌘K</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        <div className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-2 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Навигация
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-200 mb-0.5 group ${
              view === item.id
                ? theme === 'dark'
                  ? 'text-white bg-white/[0.07]'
                  : 'text-gray-900 bg-gray-100/80'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {view === item.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="text-base w-5 text-center">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
            <span className={`ml-auto text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>{item.shortcut}</span>
          </button>
        ))}

        {/* Life Areas */}
        <div className={`text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mt-5 mb-2 ${
          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
        }`}>
          Сферы жизни
        </div>
        {LIFE_AREAS.map((area) => {
          const areaTasks = dayTasks.filter(t => t.areaId === area.id);
          const areaCompleted = areaTasks.filter(t => t.completed).length;
          return (
            <div
              key={area.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span className="text-sm">{area.icon}</span>
              <span className="flex-1 font-medium">{area.nameRu}</span>
              {areaTasks.length > 0 && (
                <span className={`text-[10px] ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                  {areaCompleted}/{areaTasks.length}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Planning Button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => setPlanningOpen(true)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 active:scale-[0.98] relative overflow-hidden group"
        >
          <span className="relative z-10">✨ Спланировать завтра</span>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>

      {/* Theme toggle + Data */}
      <div className={`px-3 pb-4 pt-2 border-t space-y-0.5 ${
        theme === 'dark' ? 'border-white/[0.04]' : 'border-gray-100'
      }`}>
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span className="font-medium">{theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}</span>
          <span className={`ml-auto text-[10px] font-mono ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>T</span>
        </button>
        <button
          onClick={exportData}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <span>📤</span>
          <span className="font-medium">Экспорт данных</span>
        </button>
        <label
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all cursor-pointer ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          <span>📥</span>
          <span className="font-medium">Импорт данных</span>
          <input type="file" accept=".json" onChange={importData} className="hidden" />
        </label>
        <button
          onClick={clearAllData}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all ${
            theme === 'dark'
              ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06]'
              : 'text-red-400 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <span>🗑️</span>
          <span className="font-medium">Очистить всё</span>
        </button>
      </div>
    </aside>
  );
}
