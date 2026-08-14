import { initialRecipes } from './data'
import type { Recipe } from './types'

const KEY = 'recetas-air:v1'

export function loadRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return initialRecipes
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : initialRecipes
  } catch {
    return initialRecipes
  }
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes))
}
