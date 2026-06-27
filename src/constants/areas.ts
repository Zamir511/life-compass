import { LifeArea } from '../types';

export const DEFAULT_LIFE_AREAS: LifeArea[] = [
  {
    id: 'knowledge',
    name: 'Knowledge',
    nameRu: 'Знания',
    icon: '📚',
    color: '#6366f1',
    bgColor: 'rgba(99,102,241,0.1)',
    borderColor: 'rgba(99,102,241,0.3)',
    subcategories: ['Обучение', 'Курсы', 'Чтение', 'Навыки', 'Профессиональное развитие'],
  },
  {
    id: 'spirituality',
    name: 'Spirituality',
    nameRu: 'Духовность',
    icon: '🕊️',
    color: '#8b5cf6',
    bgColor: 'rgba(139,92,246,0.1)',
    borderColor: 'rgba(139,92,246,0.3)',
    subcategories: ['Молитва', 'Чтение религиозной литературы', 'Размышления', 'Благодарность', 'Личные духовные цели'],
  },
  {
    id: 'finance',
    name: 'Finance',
    nameRu: 'Финансы',
    icon: '💰',
    color: '#10b981',
    bgColor: 'rgba(16,185,129,0.1)',
    borderColor: 'rgba(16,185,129,0.3)',
    subcategories: ['Доход', 'Накопления', 'Инвестиции', 'Карьерный рост', 'Бюджетирование'],
  },
  {
    id: 'health',
    name: 'Health',
    nameRu: 'Здоровье',
    icon: '💪',
    color: '#f43f5e',
    bgColor: 'rgba(244,63,94,0.1)',
    borderColor: 'rgba(244,63,94,0.3)',
    subcategories: ['Спорт', 'Питание', 'Сон', 'Вес', 'Физическая активность'],
  },
];

export const fallbackArea: LifeArea = {
  id: 'none',
  name: 'No area',
  nameRu: 'Без сферы',
  icon: '○',
  color: '#94a3b8',
  bgColor: 'rgba(148,163,184,0.1)',
  borderColor: 'rgba(148,163,184,0.3)',
  subcategories: [],
};

export const createAreaColors = (color: string) => ({
  bgColor: hexToRgba(color, 0.1),
  borderColor: hexToRgba(color, 0.3),
});

export const getArea = (areas: LifeArea[], id?: string) => {
  if (!id) return fallbackArea;
  return areas.find((a) => a.id === id && !a.archived) ?? areas.find((a) => a.id === id) ?? fallbackArea;
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return `rgba(148,163,184,${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
