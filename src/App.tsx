import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { GoalsView } from './components/GoalsView';
import { HabitsView } from './components/HabitsView';
import { StatisticsView } from './components/StatisticsView';
import { CommandPalette } from './components/CommandPalette';
import { PlanningWizard } from './components/PlanningWizard';
import { ToastContainer } from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';

export default function App() {
  const { view, theme, commandPaletteOpen, setCommandPaletteOpen, planningOpen } = useStore();

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      // Quick nav shortcuts
      if (!commandPaletteOpen && !planningOpen && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        switch (e.key) {
          case '1': useStore.getState().setView('dashboard'); break;
          case '2': useStore.getState().setView('calendar'); break;
          case '3': useStore.getState().setView('goals'); break;
          case '4': useStore.getState().setView('habits'); break;
          case '5': useStore.getState().setView('statistics'); break;
          case 't': useStore.getState().toggleTheme(); break;
          case 'p': useStore.getState().setPlanningOpen(true); break;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen, planningOpen]);

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <CalendarView />;
      case 'goals': return <GoalsView />;
      case 'habits': return <HabitsView />;
      case 'statistics': return <StatisticsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`${theme} min-h-screen flex`}>
      <div className={`flex w-full min-h-screen transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#08080d] text-gray-100' 
          : 'bg-[#f5f5f7] text-gray-900'
      }`}>
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {commandPaletteOpen && <CommandPalette />}
      </AnimatePresence>

      <AnimatePresence>
        {planningOpen && <PlanningWizard />}
      </AnimatePresence>

      <ToastContainer />
    </div>
  );
}
