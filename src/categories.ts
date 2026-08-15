import { CATEGORIES, type CategoryDefinition } from './types'

const KEY = 'recetas-air:categories:v1'
export const DEFAULT_CATEGORIES: CategoryDefinition[] = CATEGORIES.map(name => ({ name, subcategories: [] }))

export function loadCategories(): CategoryDefinition[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!Array.isArray(value)) return DEFAULT_CATEGORIES
    const valid = value.filter(item => typeof item?.name === 'string' && item.name.trim()).map(item => ({ name: item.name.trim(), subcategories: Array.isArray(item.subcategories) ? item.subcategories.filter((x: unknown) => typeof x === 'string' && x.trim()).map((x: string) => x.trim()) : [] }))
    return valid.length ? valid : DEFAULT_CATEGORIES
  } catch { return DEFAULT_CATEGORIES }
}

export function saveCategories(categories: CategoryDefinition[]) {
  localStorage.setItem(KEY, JSON.stringify(categories))
}

export function mergeRecipeCategories(categories: CategoryDefinition[], recipeNames: string[]) {
  const result = categories.map(item => ({ ...item, subcategories: [...item.subcategories] }))
  for (const name of recipeNames) if (name && !result.some(item => item.name === name)) result.push({ name, subcategories: [] })
  return result
}
