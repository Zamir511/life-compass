import { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const { setCommandPaletteOpen, setView, toggleTheme, setPlanningOpen, theme, dayTasks, yearGoals, weekGoals, habits } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCommandPaletteOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandPaletteOpen]);

  const navCommands: Command[] = [
    { id: 'nav-dashboard', label: 'Главная', icon: '◉', action: () => { setView('dashboard'); setCommandPaletteOpen(false); }, category: 'Навигация' },
    { id: 'nav-calendar', label: 'Календарь', icon: '▦', action: () => { setView('calendar'); setCommandPaletteOpen(false); }, category: 'Навигация' },
    { id: 'nav-goals', label: 'Цели', icon: '◎', action: () => { setView('goals'); setCommandPaletteOpen(false); }, category: 'Навигация' },
    { id: 'nav-habits', label: 'Привычки', icon: '↻', action: () => { setView('habits'); setCommandPaletteOpen(false); }, category: 'Навигация' },
    { id: 'nav-stats', label: 'Статистика', icon: '▤', action: () => { setView('statistics'); setCommandPaletteOpen(false); }, category: 'Навигация' },
  ];

  const actionCommands: Command[] = [
    { id: 'act-theme', label: 'Переключить тему', icon: theme === 'dark' ? '☀️' : '🌙', action: () => { toggleTheme(); setCommandPaletteOpen(false); }, category: 'Действия' },
    { id: 'act-plan', label: 'Спланировать завтра', icon: '✨', action: () => { setPlanningOpen(true); setCommandPaletteOpen(false); }, category: 'Действия' },
  ];

  const searchResults: Command[] = query
    ? [
        ...dayTasks
          .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map(t => ({
            id: `task-${t.id}`,
            label: t.title,
            icon: '☐',
            action: () => setCommandPaletteOpen(false),
            category: 'Задачи',
          })),
        ...yearGoals
          .filter(g => g.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(g => ({
            id: `goal-${g.id}`,
            label: g.title,
            icon: '◎',
            action: () => { setView('goals'); setCommandPaletteOpen(false); },
            category: 'Цели',
          })),
        ...weekGoals
          .filter(g => g.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(g => ({
            id: `wgoal-${g.id}`,
            label: g.title,
            icon: '◎',
            action: () => { setView('goals'); setCommandPaletteOpen(false); },
            category: 'Цели недели',
          })),
        ...habits
          .filter(h => h.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map(h => ({
            id: `habit-${h.id}`,
            label: h.title,
            icon: '↻',
            action: () => { setView('habits'); setCommandPaletteOpen(false); },
            category: 'Привычки',
          })),
      ]
    : [];

  const allCommands = query ? searchResults : [...navCommands, ...actionCommands];

  const grouped = allCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        onClick={e => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl overflow-hidden ${
          theme === 'dark' ? 'bg-[#12121a] border border-white/[0.08]' : 'bg-white border border-gray-200 shadow-2xl'
        }`}
      >
        <div className={`flex items-center gap-3 px-4 py-3 border-b ${theme === 'dark' ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск команд, задач, целей..."
            className={`flex-1 bg-transparent outline-none text-sm ${theme === 'dark' ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
          />
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${theme === 'dark' ? 'bg-white/[0.06] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>ESC</span>
        </div>

        <div className="max-h-[300px] overflow-y-auto py-2">
          {Object.entries(grouped).map(([category, commands]) => (
            <div key={category}>
              <p className={`px-4 py-1 text-[10px] font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                {category}
              </p>
              {commands.map(cmd => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                    theme === 'dark' ? 'hover:bg-white/[0.04] text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-base">{cmd.icon}</span>
                  <span>{cmd.label}</span>
                </button>
              ))}
            </div>
          ))}
          {query && searchResults.length === 0 && (
            <p className={`px-4 py-6 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
              Ничего не найдено
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
