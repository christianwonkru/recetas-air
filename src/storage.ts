import { initialRecipes } from './data'
import type { Recipe } from './types'
import { inferRecipeName } from './parser'

const KEY = 'recetas-air:v1'

export function loadRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return initialRecipes
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialRecipes
    return parsed.map((recipe: Recipe) => {
      if (recipe.name?.trim() && !/^ingredientes?\s*:?$/i.test(recipe.name.trim())) return recipe
      const content = `${recipe.ingredients?.map(item => item.name).join(' ') ?? ''} ${recipe.steps?.join(' ') ?? ''}`
      return { ...recipe, name: inferRecipeName(content, recipe.category) }
    })
  } catch {
    return initialRecipes
  }
}

export function saveRecipes(recipes: Recipe[]) {
  localStorage.setItem(KEY, JSON.stringify(recipes))
}
