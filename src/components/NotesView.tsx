import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getArea } from '../constants/areas';
import { MobileNav } from './MobileNav';

export function NotesView() {
  const { theme, notes, lifeAreas, addNote, updateNote, deleteNote, toggleNotePinned } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [query, setQuery] = useState('');

  const selected = notes.find((n) => n.id === selectedId) ?? null;
  const sortedNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...notes]
      .filter((n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, query]);

  const cardClass = theme === 'dark'
    ? 'bg-white/[0.03] border border-white/[0.06] rounded-2xl'
    : 'bg-white border border-gray-200/60 rounded-2xl shadow-sm';

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors ${
    theme === 'dark'
      ? 'bg-white/[0.04] border border-white/[0.08] focus:border-indigo-500/50 text-white placeholder:text-gray-600'
      : 'bg-gray-50 border border-gray-200 focus:border-indigo-500 text-gray-900 placeholder:text-gray-400'
  }`;

  const createNote = () => {
    addNote({ title: 'Новая заметка', content: '', areaId: lifeAreas[0]?.id });
    setTimeout(() => {
      const latest = useStore.getState().notes.at(-1);
      if (latest) setSelectedId(latest.id);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-24 md:pb-10">
      <MobileNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Заметки</h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Мысли, идеи, планы и детали к целям без лишней формы.
          </p>
        </div>
        <button onClick={createNote} className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
          + Новая заметка
        </button>
      </div>

      {notes.length === 0 ? (
        <div className={`${cardClass} p-8 text-center`}>
          <p className="text-3xl mb-3">✎</p>
          <h2 className="text-lg font-semibold mb-2">Запишите первую мысль</h2>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Заметки можно держать отдельно или привязывать к сфере.
          </p>
          <button onClick={createNote} className="px-5 py-2.5 rounded-xl bg-indigo-500 text-white text-sm font-medium">
            Создать заметку
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-[320px_1fr] gap-4">
          <div className={`${cardClass} p-3 h-fit`}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск заметок..." className={inputClass + ' mb-3'} />
            <div className="space-y-1 max-h-[65vh] overflow-y-auto">
              {sortedNotes.map((note) => {
                const area = getArea(lifeAreas, note.areaId);
                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedId(note.id)}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      selected?.id === note.id
                        ? theme === 'dark' ? 'bg-white/[0.08]' : 'bg-gray-100'
                        : theme === 'dark' ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: area.color }}>{note.pinned ? '★' : area.icon}</span>
                      <p className="text-sm font-medium truncate">{note.title || 'Без названия'}</p>
                    </div>
                    <p className={`text-xs mt-1 line-clamp-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {note.content || 'Пустая заметка'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`${cardClass} p-5`}>
              <div className="flex items-center gap-2 mb-4">
                <select value={selected.areaId ?? ''} onChange={(e) => updateNote(selected.id, { areaId: e.target.value || undefined })} className={inputClass + ' max-w-52'}>
                  <option value="">Без сферы</option>
                  {lifeAreas.map((area) => <option key={area.id} value={area.id}>{area.icon} {area.nameRu}</option>)}
                </select>
                <button onClick={() => toggleNotePinned(selected.id)} className={`px-3 py-2 rounded-lg text-sm ${theme === 'dark' ? 'hover:bg-white/[0.06]' : 'hover:bg-gray-100'}`}>
                  {selected.pinned ? '★' : '☆'}
                </button>
                <button onClick={() => { deleteNote(selected.id); setSelectedId(sortedNotes.find((n) => n.id !== selected.id)?.id ?? null); }} className="ml-auto px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300">
                  Удалить
                </button>
              </div>
              <input
                value={selected.title}
                onChange={(e) => updateNote(selected.id, { title: e.target.value })}
                className="w-full bg-transparent outline-none text-2xl font-bold mb-3"
                placeholder="Название"
              />
              <textarea
                value={selected.content}
                onChange={(e) => updateNote(selected.id, { content: e.target.value })}
                className={`w-full min-h-[420px] resize-none bg-transparent outline-none text-sm leading-7 ${theme === 'dark' ? 'text-gray-300 placeholder:text-gray-600' : 'text-gray-700 placeholder:text-gray-400'}`}
                placeholder="Пишите свободно..."
              />
              <p className={`text-[11px] mt-3 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}>
                Обновлено {format(parseISO(selected.updatedAt), 'd MMMM HH:mm', { locale: ru })}
              </p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
