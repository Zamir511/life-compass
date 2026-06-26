import { useStore } from '../store/useStore';
import { ViewMode } from '../types';

const navItems: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Главная', icon: '◉' },
  { id: 'calendar', label: 'Календарь', icon: '▦' },
  { id: 'goals', label: 'Цели', icon: '◎' },
  { id: 'habits', label: 'Привычки', icon: '↻' },
  { id: 'statistics', label: 'Статистика', icon: '▤' },
];

export function MobileNav() {
  const { view, setView, theme } = useStore();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden flex items-center justify-around py-2 px-1 border-t ${
      theme === 'dark'
        ? 'bg-[#0c0c14]/95 backdrop-blur-lg border-white/[0.06]'
        : 'bg-white/95 backdrop-blur-lg border-gray-200'
    }`}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
            view === item.id
              ? theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
              : theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          <span className="text-lg">{item.icon}</span>
          <span className="text-[10px]">{item.label}</span>
        </button>
      ))}
    </div>
  );
}
