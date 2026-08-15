import type { Recipe } from './types'

export const BACKUP_INTERVAL_MS = 20 * 60 * 1000
const BACKUP_KEY = 'recetas-air:backups:v1'
const MAX_BACKUPS = 36

export interface RecipeBackup {
  id: string
  createdAt: string
  recipes: Recipe[]
}

export function loadBackups(): RecipeBackup[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(BACKUP_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function createBackup(recipes: Recipe[]): RecipeBackup[] {
  const existing = loadBackups()
  const latest = existing[0]
  if (latest && JSON.stringify(latest.recipes) === JSON.stringify(recipes)) return existing
  const backup: RecipeBackup = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    recipes: structuredClone(recipes)
  }
  const updated = [backup, ...existing].slice(0, MAX_BACKUPS)
  localStorage.setItem(BACKUP_KEY, JSON.stringify(updated))
  return updated
}

export function exportRecipes(recipes: Recipe[]) {
  const payload = JSON.stringify({ app: 'ZUNO', version: 1, exportedAt: new Date().toISOString(), recipes }, null, 2)
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `zuno-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function parseBackupFile(source: string): Recipe[] {
  const parsed = JSON.parse(source)
  if (!parsed || !['RECETAS AIR', 'ZUNO'].includes(parsed.app) || !Array.isArray(parsed.recipes)) throw new Error('Archivo no válido')
  return parsed.recipes
}
