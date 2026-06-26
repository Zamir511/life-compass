import { LifeArea } from '../types';

export const LIFE_AREAS: LifeArea[] = [
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

export const getArea = (id: string) => LIFE_AREAS.find(a => a.id === id)!;
