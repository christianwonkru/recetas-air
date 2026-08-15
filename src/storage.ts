import { initialRecipes } from './data'
import type { Recipe } from './types'

const KEY = 'recetas-air:v1'
const BACKUP_KEY = 'recetas-air:backups:v1'

const lemonCakeFallback: Partial<Recipe> = {
  ingredients: [
    { id: 'zuno-yogur', amount: '1 taza', name: 'yogurt natural' },
    { id: 'zuno-azucar', amount: '1 taza', name: 'azúcar' },
    { id: 'zuno-aceite', amount: 'Media', name: 'taza de aceite vegetal' },
    { id: 'zuno-huevos', amount: '3', name: 'huevos' },
    { id: 'zuno-harina', amount: '2 tazas', name: 'harina de trigo' },
    { id: 'zuno-vainilla', amount: '1 cda', name: 'esencia de vainilla' },
    { id: 'zuno-polvo', amount: '2 cdtas', name: 'polvo de hornear' },
    { id: 'zuno-sal', amount: 'Pizca', name: 'sal' }
  ],
  temperature: '180 °C',
  cookingTime: '35–40 minutos',
  steps: [
    'Precalienta el horno a 180 °C.',
    'Mezcla yogurt, azúcar, aceite, huevos y vainilla.',
    'Incorpora harina, polvo de hornear y sal.',
    'Vierte en un molde engrasado.',
    'Hornea por 35–40 minutos o hasta que esté dorado y al insertar un palillo, salga limpio.',
    'Deja enfriar y disfruta.'
  ]
}

const usefulIngredients = (recipe: Recipe) => Array.isArray(recipe.ingredients) && recipe.ingredients.some(item => item?.name?.trim())
const usefulSteps = (recipe: Recipe) => Array.isArray(recipe.steps) && recipe.steps.some(step => step?.trim())
const score = (recipe: Recipe) => (usefulIngredients(recipe) ? recipe.ingredients.length * 4 : 0) + (usefulSteps(recipe) ? recipe.steps.length * 3 : 0) + (recipe.temperature?.trim() ? 2 : 0) + (recipe.notes?.trim() ? 1 : 0)

export function recoverRecipe(recipe: Recipe, history: Recipe[]): Recipe {
  const normalizedName = recipe.name?.trim().toLocaleLowerCase()
  const best = history.filter(item => item.id === recipe.id || item.name?.trim().toLocaleLowerCase() === normalizedName).sort((a,b) => score(b) - score(a))[0]
  let recovered = { ...recipe }
  if (best) recovered = {
    ...recovered,
    ingredients: usefulIngredients(recovered) ? recovered.ingredients : best.ingredients,
    steps: usefulSteps(recovered) ? recovered.steps : best.steps,
    temperature: recovered.temperature?.trim() ? recovered.temperature : best.temperature,
    cookingTime: recovered.cookingTime?.trim() ? recovered.cookingTime : best.cookingTime,
    notes: recovered.notes?.trim() ? recovered.notes : best.notes
  }
  if (/^bizcocho de lim[oó]n$/i.test(recovered.name?.trim() ?? '')) recovered = {
    ...recovered,
    ingredients: usefulIngredients(recovered) ? recovered.ingredients : lemonCakeFallback.ingredients!,
    steps: usefulSteps(recovered) ? recovered.steps : lemonCakeFallback.steps!,
    temperature: recovered.temperature?.trim() ? recovered.temperature : lemonCakeFallback.temperature!,
    cookingTime: recovered.cookingTime?.trim() ? recovered.cookingTime : lemonCakeFallback.cookingTime!
  }
  return recovered
}

export function loadRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(KEY)
    if (!stored) return initialRecipes
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return initialRecipes
    const backups = JSON.parse(localStorage.getItem(BACKUP_KEY) ?? '[]')
    const history: Recipe[] = Array.isArray(backups) ? backups.flatMap(backup => Array.isArray(backup?.recipes) ? backup.recipes : []) : []
    return parsed.map((original: Recipe) => {
      const recipe = recoverRecipe(original, history)
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
