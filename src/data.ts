import type { Recipe } from './types'

export const initialRecipes: Recipe[] = [{
  id: 'hamburguesa-pollo-inicial',
  name: 'Hamburguesa de pollo',
  ingredients: [
    { id: 'ingrediente-hamburguesa', amount: '1', name: 'hamburguesa de pollo fresca' },
    { id: 'ingrediente-queso', amount: 'Al gusto', name: 'queso (opcional)' },
    { id: 'ingrediente-pan', amount: '1', name: 'pan de hamburguesa' }
  ],
  temperature: '190 °C',
  cookingTime: '10–12 minutos',
  steps: [
    'Precalentar la air fryer si el modelo lo requiere.',
    'Cocinar la hamburguesa 5–6 minutos por un lado.',
    'Dar la vuelta y cocinar otros 5–6 minutos.',
    'Añadir queso durante el último minuto si se desea.',
    'Calentar el pan durante 1–2 minutos.',
    'Comprobar que el centro del pollo alcance aproximadamente 74 °C.'
  ],
  notes: 'Sin aceite. El tiempo puede variar ligeramente según el grosor y el modelo de air fryer.',
  category: 'Pollo',
  favorite: false,
  createdAt: '2026-08-14T00:00:00.000Z',
  updatedAt: '2026-08-14T00:00:00.000Z'
}]
