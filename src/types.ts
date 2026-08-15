export const CATEGORIES = ['Pollo', 'Carne', 'Pescado', 'Patatas y verduras', 'Huevos', 'Postres', 'Otros'] as const
export type Category = typeof CATEGORIES[number]

export interface Ingredient {
  id: string
  amount: string
  name: string
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  temperature: string
  cookingTime: string
  steps: string[]
  notes: string
  photo?: string
  category: Category
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type RecipeDraft = Omit<Recipe, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>
