import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChefHat, Clock3, Flame, Heart, Plus, Search, Settings, ShieldCheck, Sparkles, Utensils } from 'lucide-react'
import type { Category, CategoryDefinition, Recipe, RecipeDraft } from './types'
import { loadRecipes, saveRecipes } from './storage'
import { RecipeForm } from './RecipeForm'
import { RecipeDetail } from './RecipeDetail'
import { ImportModal } from './ImportModal'
import { BACKUP_INTERVAL_MS, createBackup, loadBackups, type RecipeBackup } from './backups'
import { BackupModal } from './BackupModal'
import { SettingsModal } from './SettingsModal'
import { useSettings } from './settings'
import { loadCategories, mergeRecipeCategories, saveCategories } from './categories'

const emptyDraft = (): RecipeDraft => ({ name: '', ingredients: [{ id: crypto.randomUUID(), amount: '', name: '' }], temperature: '', cookingTime: '', steps: [''], notes: 'Sin aceite.', photo: '', category: 'Otros', subcategory: '', nutrition: { servings: 1, calories: 0, carbohydrates: 0, protein: 0, fat: 0, fiber: 0, sugars: 0, salt: 0 } })

export default function App() {
  const { t, categoryLabel } = useSettings()
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'Todas'>('Todas')
  const [subcategory, setSubcategory] = useState('Todas')
  const [categoryDefinitions, setCategoryDefinitions] = useState<CategoryDefinition[]>(loadCategories)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [editing, setEditing] = useState<Recipe | undefined>()
  const [draft, setDraft] = useState<RecipeDraft | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [backups, setBackups] = useState<RecipeBackup[]>(loadBackups)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusCategorySettings, setFocusCategorySettings] = useState(false)
  useEffect(() => saveRecipes(recipes), [recipes])
  useEffect(() => saveCategories(categoryDefinitions), [categoryDefinitions])
  const availableCategories = useMemo(() => mergeRecipeCategories(categoryDefinitions, recipes.map(recipe => recipe.category)), [categoryDefinitions, recipes])
  useEffect(() => {
    const timer = window.setInterval(() => setBackups(createBackup(recipes)), BACKUP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [recipes])

  const filtered = useMemo(() => recipes.filter(recipe => {
    const haystack = `${recipe.name} ${recipe.ingredients.map(x => x.name).join(' ')}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (category === 'Todas' || recipe.category === category) && (subcategory === 'Todas' || recipe.subcategory === subcategory) && (!favoritesOnly || recipe.favorite)
  }), [recipes, query, category, subcategory, favoritesOnly])

  const openCreate = () => { setEditing(undefined); setDraft(emptyDraft()) }
  const openEdit = (recipe: Recipe) => { setSelected(null); setEditing(recipe); setDraft({ name: recipe.name, ingredients: recipe.ingredients, temperature: recipe.temperature, cookingTime: recipe.cookingTime, steps: recipe.steps, notes: recipe.notes, photo: recipe.photo ?? '', category: recipe.category, subcategory: recipe.subcategory ?? '', nutrition: recipe.nutrition ?? { servings: 1, calories: 0, carbohydrates: 0, protein: 0, fat: 0, fiber: 0, sugars: 0, salt: 0 } }) }
  const save = () => {
    if (!draft) return
    const now = new Date().toISOString()
    if (editing) setRecipes(items => items.map(x => x.id === editing.id ? { ...x, ...draft, updatedAt: now } : x))
    else setRecipes(items => [{ ...draft, id: crypto.randomUUID(), favorite: false, createdAt: now, updatedAt: now }, ...items])
    setDraft(null); setEditing(undefined)
  }
  const remove = (recipe: Recipe) => { if (confirm(`¿Eliminar “${recipe.name}”? Esta acción no se puede deshacer.`)) { setRecipes(items => items.filter(x => x.id !== recipe.id)); setSelected(null) } }
  const toggleFavorite = (id: string) => { setRecipes(items => items.map(x => x.id === id ? { ...x, favorite: !x.favorite } : x)); setSelected(current => current?.id === id ? { ...current, favorite: !current.favorite } : current) }
  const forceUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map(registration => registration.unregister()))
    }
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.filter(key => key.startsWith('recetas-air-')).map(key => caches.delete(key)))
    }
    window.location.reload()
  }

  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#"><span><ChefHat /></span><div><b>ZUNO</b><small>Tu cocina. Tus recetas.</small></div></a><nav><button className="nav-active"><BookOpen /> {t('recipes')}</button><button onClick={() => setFavoritesOnly(!favoritesOnly)} className={favoritesOnly ? 'nav-active' : ''}><Heart /> {t('favorites')}</button><button onClick={() => setBackupOpen(true)}><ShieldCheck /> {t('backup')}</button></nav><button className="settings-button" onClick={() => { setFocusCategorySettings(false); setSettingsOpen(true) }} aria-label={t('settings')}><Settings /></button><button className="primary compact" onClick={openCreate}><Plus /> {t('newRecipe')}</button></header>
    <main>
      <section className="welcome"><div><span className="eyebrow">{t('eyebrow')}</span><h1>{t('today')}</h1></div><div className="hero-mark"><Utensils /></div></section>
      <section className="controls"><div className="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('search')} /></div><button className="import-button" onClick={() => setImportOpen(true)}><Sparkles /> {t('import')}</button></section>
      <div className="category-list"><button className={category === 'Todas' ? 'active' : ''} onClick={() => { setCategory('Todas'); setSubcategory('Todas') }}>{t('all')} <span>{recipes.length}</span></button><button className="add-category-filter" onClick={() => { setFocusCategorySettings(true); setSettingsOpen(true) }}><Plus /> Añadir categoría</button>{availableCategories.map(c => <button key={c.name} className={category === c.name ? 'active' : ''} onClick={() => { setCategory(c.name); setSubcategory('Todas') }}>{categoryLabel(c.name)}</button>)}</div>
      {category !== 'Todas' && (availableCategories.find(item => item.name === category)?.subcategories.length ?? 0) > 0 && <div className="subcategory-list"><button className={subcategory === 'Todas' ? 'active' : ''} onClick={() => setSubcategory('Todas')}>{t('all')}</button>{availableCategories.find(item => item.name === category)?.subcategories.map(item => <button key={item} className={subcategory === item ? 'active' : ''} onClick={() => setSubcategory(item)}>{item}</button>)}</div>}
      <div className="result-heading"><h2>{favoritesOnly ? t('favoriteRecipes') : category === 'Todas' ? t('allRecipes') : categoryLabel(category)}</h2><span>{filtered.length} {filtered.length === 1 ? t('recipe') : t('recipesCount')}</span></div>
      {filtered.length ? <section className="recipe-grid">{filtered.map(recipe => <article className="recipe-card" key={recipe.id} onClick={() => setSelected(recipe)}>
        <div className={`card-art art-${Math.max(0, availableCategories.findIndex(item => item.name === recipe.category)) % 4}`}>{recipe.photo ? <><img src={recipe.photo} alt="" /><strong className="photo-title">{recipe.name}</strong></> : <ChefHat />}<span>{categoryLabel(recipe.category)}{recipe.subcategory ? ` · ${recipe.subcategory}` : ''}</span><button className="heart-button" aria-label={t('favorites')} onClick={e => { e.stopPropagation(); toggleFavorite(recipe.id) }}><Heart className={recipe.favorite ? 'filled' : ''} /></button></div>
        <div className="card-body"><h3>{recipe.name}</h3><p>{recipe.ingredients.slice(0, 3).map(x => x.name).filter(Boolean).join(' · ') || t('noIngredients')}</p><div><span><Flame /> {recipe.temperature || '—'}</span><span><Clock3 /> {recipe.cookingTime || '—'}</span></div></div>
      </article>)}</section> : <section className="empty"><Search /><h3>{t('empty')}</h3><p>{t('emptyHint')}</p><button className="primary" onClick={openCreate}><Plus /> {t('newRecipe')}</button></section>}
    </main>
    <footer className="page-footer"><span><ChefHat /> ZUNO</span><button className="update-button" onClick={forceUpdate}>{t('update')} · v1.21</button><small>{t('localData')}</small></footer>
    {selected && <RecipeDetail recipe={selected} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} onDelete={() => remove(selected)} onFavorite={() => toggleFavorite(selected.id)} />}
    {draft && <RecipeForm draft={draft} editing={editing} categories={availableCategories} onChange={setDraft} onSave={save} onClose={() => setDraft(null)} />}
    {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={value => { setImportOpen(false); setEditing(undefined); setDraft(value) }} />}
    {backupOpen && <BackupModal recipes={recipes} backups={backups} onClose={() => setBackupOpen(false)} onRestore={value => { const previous = createBackup(recipes); setBackups(previous); setRecipes(value); setBackupOpen(false) }} />}
    {settingsOpen && <SettingsModal categories={categoryDefinitions} focusCategories={focusCategorySettings} onCategoriesChange={setCategoryDefinitions} onClose={() => setSettingsOpen(false)} />}
  </div>
}
