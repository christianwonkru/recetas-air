import { initialRecipes } from './data'
import type { Recipe } from './types'

const KEY = 'recetas-air:v1'

export function loadRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return initialRecipes
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialRecipes
    return parsed.map((recipe: Recipe) => {
      if (recipe.name?.trim() && !/^ingredientes?\s*:?$/i.test(recipe.name.trim())) return recipe
      return { ...recipe, name: 'Nueva receta' }
    })
  } catch {
    return initialRecipes
  }
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes))
}
