export const CATEGORIES = ['Pollo', 'Carne', 'Pescado', 'Patatas y verduras', 'Huevos', 'Postres', 'Otros'] as const
export type Category = string
export interface CategoryDefinition { name: string; subcategories: string[] }

export interface Ingredient {
  id: string
  amount: string
  name: string
}

export interface Nutrition {
  servings: number
  calories: number
  carbohydrates: number
  protein: number
  fat: number
  fiber: number
  sugars: number
  salt: number
}

export interface Recipe {
  id: string
  name: string
  ingredients: Ingredient[]
  temperature: string
  cookingTime: string
  steps: string[]
  notes: string
  nutrition?: Nutrition
  photo?: string
  category: Category
  subcategory?: string
  favorite: boolean
  createdAt: string
  updatedAt: string
}

export type RecipeDraft = Omit<Recipe, 'id' | 'favorite' | 'createdAt' | 'updatedAt'>
