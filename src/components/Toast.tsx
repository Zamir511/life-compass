import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

// Simple toast store
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let toasts: ToastMessage[] = [];

export function showToast(text: string, type: ToastMessage['type'] = 'success') {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, text, type }];
  toastListeners.forEach(l => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    toastListeners.forEach(l => l(toasts));
  }, 3000);
}

export function ToastContainer() {
  const { theme } = useStore();
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter(l => l !== setItems);
    };
  }, []);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2">
      <AnimatePresence>
        {items.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
              theme === 'dark'
                ? 'bg-gray-800 text-gray-100 border border-gray-700'
                : 'bg-white text-gray-900 border border-gray-200'
            } ${
              toast.type === 'success' ? 'border-l-4 border-l-emerald-500' :
              toast.type === 'error' ? 'border-l-4 border-l-red-500' :
              'border-l-4 border-l-indigo-500'
            }`}
          >
            {toast.type === 'success' && '✓ '}
            {toast.type === 'error' && '✕ '}
            {toast.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
