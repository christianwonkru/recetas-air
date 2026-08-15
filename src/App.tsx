import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChefHat, Clock3, Flame, Heart, Plus, Search, Settings, ShieldCheck, Sparkles, Utensils } from 'lucide-react'
import { CATEGORIES, type Category, type Recipe, type RecipeDraft } from './types'
import { loadRecipes, saveRecipes } from './storage'
import { RecipeForm } from './RecipeForm'
import { RecipeDetail } from './RecipeDetail'
import { ImportModal } from './ImportModal'
import { BACKUP_INTERVAL_MS, createBackup, loadBackups, type RecipeBackup } from './backups'
import { BackupModal } from './BackupModal'
import { SettingsModal } from './SettingsModal'
import { useSettings } from './settings'

const emptyDraft = (): RecipeDraft => ({ name: '', ingredients: [{ id: crypto.randomUUID(), amount: '', name: '' }], temperature: '', cookingTime: '', steps: [''], notes: 'Sin aceite.', photo: '', category: 'Otros' })

export default function App() {
  const { t, categoryLabel } = useSettings()
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | 'Todas'>('Todas')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selected, setSelected] = useState<Recipe | null>(null)
  const [editing, setEditing] = useState<Recipe | undefined>()
  const [draft, setDraft] = useState<RecipeDraft | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [backupOpen, setBackupOpen] = useState(false)
  const [backups, setBackups] = useState<RecipeBackup[]>(loadBackups)
  const [settingsOpen, setSettingsOpen] = useState(false)
  useEffect(() => saveRecipes(recipes), [recipes])
  useEffect(() => {
    const timer = window.setInterval(() => setBackups(createBackup(recipes)), BACKUP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [recipes])

  const filtered = useMemo(() => recipes.filter(recipe => {
    const haystack = `${recipe.name} ${recipe.ingredients.map(x => x.name).join(' ')}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (category === 'Todas' || recipe.category === category) && (!favoritesOnly || recipe.favorite)
  }), [recipes, query, category, favoritesOnly])

  const openCreate = () => { setEditing(undefined); setDraft(emptyDraft()) }
  const openEdit = (recipe: Recipe) => { setSelected(null); setEditing(recipe); setDraft({ name: recipe.name, ingredients: recipe.ingredients, temperature: recipe.temperature, cookingTime: recipe.cookingTime, steps: recipe.steps, notes: recipe.notes, photo: recipe.photo ?? '', category: recipe.category }) }
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
    <header className="topbar"><a className="brand" href="#"><span><ChefHat /></span><div><b>RECETAS <em>AIR</em></b><small>Tu cocina, más ligera</small></div></a><nav><button className="nav-active"><BookOpen /> {t('recipes')}</button><button onClick={() => setFavoritesOnly(!favoritesOnly)} className={favoritesOnly ? 'nav-active' : ''}><Heart /> {t('favorites')}</button><button onClick={() => setBackupOpen(true)}><ShieldCheck /> {t('backup')}</button></nav><button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label={t('settings')}><Settings /></button><button className="primary compact" onClick={openCreate}><Plus /> {t('newRecipe')}</button></header>
    <main>
      <section className="welcome"><div><span className="eyebrow">{t('eyebrow')}</span><h1>{t('today')}</h1></div><div className="hero-mark"><Utensils /></div></section>
      <section className="controls"><div className="search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('search')} /></div><button className="import-button" onClick={() => setImportOpen(true)}><Sparkles /> {t('import')}</button></section>
      <div className="category-list"><button className={category === 'Todas' ? 'active' : ''} onClick={() => setCategory('Todas')}>{t('all')} <span>{recipes.length}</span></button>{CATEGORIES.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{categoryLabel(c)}</button>)}</div>
      <div className="result-heading"><h2>{favoritesOnly ? t('favoriteRecipes') : category === 'Todas' ? t('allRecipes') : categoryLabel(category)}</h2><span>{filtered.length} {filtered.length === 1 ? t('recipe') : t('recipesCount')}</span></div>
      {filtered.length ? <section className="recipe-grid">{filtered.map(recipe => <article className="recipe-card" key={recipe.id} onClick={() => setSelected(recipe)}>
        <div className={`card-art art-${CATEGORIES.indexOf(recipe.category) % 4}`}>{recipe.photo ? <><img src={recipe.photo} alt="" /><strong className="photo-title">{recipe.name}</strong></> : <ChefHat />}<span>{categoryLabel(recipe.category)}</span><button className="heart-button" aria-label={t('favorites')} onClick={e => { e.stopPropagation(); toggleFavorite(recipe.id) }}><Heart className={recipe.favorite ? 'filled' : ''} /></button></div>
        <div className="card-body"><h3>{recipe.name}</h3><p>{recipe.ingredients.slice(0, 3).map(x => x.name).filter(Boolean).join(' · ') || t('noIngredients')}</p><div><span><Flame /> {recipe.temperature || '—'}</span><span><Clock3 /> {recipe.cookingTime || '—'}</span></div></div>
      </article>)}</section> : <section className="empty"><Search /><h3>{t('empty')}</h3><p>{t('emptyHint')}</p><button className="primary" onClick={openCreate}><Plus /> {t('newRecipe')}</button></section>}
    </main>
    <footer className="page-footer"><span><ChefHat /> RECETAS AIR</span><button className="update-button" onClick={forceUpdate}>{t('update')} · v1.11</button><small>{t('localData')}</small></footer>
    {selected && <RecipeDetail recipe={selected} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} onDelete={() => remove(selected)} onFavorite={() => toggleFavorite(selected.id)} />}
    {draft && <RecipeForm draft={draft} editing={editing} onChange={setDraft} onSave={save} onClose={() => setDraft(null)} />}
    {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={value => { setImportOpen(false); setEditing(undefined); setDraft(value) }} />}
    {backupOpen && <BackupModal recipes={recipes} backups={backups} onClose={() => setBackupOpen(false)} onRestore={value => { const previous = createBackup(recipes); setBackups(previous); setRecipes(value); setBackupOpen(false) }} />}
    {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
  </div>
}
