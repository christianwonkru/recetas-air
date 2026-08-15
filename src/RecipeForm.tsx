import { Camera, Globe2, Images, Plus, Trash2, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { CategoryDefinition, Recipe, RecipeDraft } from './types'
import { optimizeRecipeImage } from './images'
import { useSettings } from './settings'
import { PhotoSearchModal } from './PhotoSearchModal'
import { NutritionEditor } from './Nutrition'

interface Props { draft: RecipeDraft; editing?: Recipe; categories: CategoryDefinition[]; onChange: (draft: RecipeDraft) => void; onSave: () => void; onClose: () => void }

export function RecipeForm({ draft, editing, categories, onChange, onSave, onClose }: Props) {
  const { t, categoryLabel } = useSettings()
  const cameraInput = useRef<HTMLInputElement>(null)
  const libraryInput = useRef<HTMLInputElement>(null)
  const [processingImage, setProcessingImage] = useState(false)
  const [photoSearchOpen, setPhotoSearchOpen] = useState(false)
  const update = <K extends keyof RecipeDraft>(key: K, value: RecipeDraft[K]) => onChange({ ...draft, [key]: value })
  const chooseImage = async (file?: File) => {
    if (!file) return
    setProcessingImage(true)
    try { update('photo', await optimizeRecipeImage(file)) }
    catch { alert('No se ha podido procesar esa imagen. Prueba con otra fotografía.') }
    finally { setProcessingImage(false) }
  }
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <header className="modal-header"><div><span className="eyebrow">ZUNO</span><h2 id="form-title">{editing ? t('edit') : t('newRecipe')}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('close')}><X /></button></header>
      <div className="form-grid">
        <label className="wide">{t('name')} <span className="hint">{t('nameHint')}</span><input autoFocus value={draft.name} onChange={e => update('name', e.target.value)} placeholder="Ej. Salmón con limón" /></label>
        <label>{t('category')}<select value={draft.category} onChange={e => onChange({ ...draft, category: e.target.value, subcategory: '' })}>{categories.map(c => <option value={c.name} key={c.name}>{categoryLabel(c.name)}</option>)}</select></label>
        <label>Subcategoría<select value={draft.subcategory ?? ''} onChange={e => update('subcategory', e.target.value)}><option value="">Sin subcategoría</option>{categories.find(c => c.name === draft.category)?.subcategories.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
        <label>{t('temperature')}<input value={draft.temperature} onChange={e => update('temperature', e.target.value)} placeholder="190 °C" /></label>
        <label>{t('totalTime')}<input value={draft.cookingTime} onChange={e => update('cookingTime', e.target.value)} placeholder="15 minutos" /></label>
      </div>
      <div className="photo-editor">
        <div className="section-heading"><h3>{t('photo')}</h3></div>
        {draft.photo && <div className="photo-preview"><img src={draft.photo} alt="" /><button className="danger-text" onClick={() => update('photo', '')}><Trash2 /> {t('remove')}</button></div>}
        <div className="photo-source-buttons"><button className="secondary" onClick={() => cameraInput.current?.click()} disabled={processingImage}><Camera /> {t('takePhoto')}</button><button className="secondary" onClick={() => libraryInput.current?.click()} disabled={processingImage}><Images /> {t('photoLibrary')}</button><button className="secondary web" onClick={() => setPhotoSearchOpen(true)}><Globe2 /> {t('searchWeb')}</button></div>
        <input ref={cameraInput} hidden type="file" accept="image/*" capture="environment" onChange={e => chooseImage(e.target.files?.[0])} />
        <input ref={libraryInput} hidden type="file" accept="image/*" onChange={e => chooseImage(e.target.files?.[0])} />
      </div>
      <div className="section-heading"><h3>{t('ingredients')}</h3><button className="text-button" onClick={() => update('ingredients', [...draft.ingredients, { id: crypto.randomUUID(), amount: '', name: '' }])}><Plus size={17} /> {t('add')}</button></div>
      <div className="ingredient-list">{draft.ingredients.map((item, i) => <div className="ingredient-row" key={item.id}>
        <input aria-label={`${t('amount')} ${i + 1}`} value={item.amount} placeholder={t('amount')} onChange={e => update('ingredients', draft.ingredients.map(x => x.id === item.id ? { ...x, amount: e.target.value } : x))} />
        <input aria-label={`${t('ingredient')} ${i + 1}`} value={item.name} placeholder={t('ingredient')} onChange={e => update('ingredients', draft.ingredients.map(x => x.id === item.id ? { ...x, name: e.target.value } : x))} />
        <button className="icon-button small" aria-label="Eliminar ingrediente" onClick={() => update('ingredients', draft.ingredients.filter(x => x.id !== item.id))}><Trash2 /></button>
      </div>)}</div>
      <label>{t('steps')} <span className="hint">{t('onePerLine')}</span><textarea rows={6} value={draft.steps.join('\n')} onChange={e => update('steps', e.target.value.split('\n'))} /></label>
      <label>{t('notesField')}<textarea rows={3} value={draft.notes} onChange={e => update('notes', e.target.value)} /></label>
      <NutritionEditor draft={draft} onChange={onChange} />
      <footer className="modal-actions"><button className="secondary" onClick={onClose}>{t('cancel')}</button><button className="primary" disabled={!draft.name.trim()} onClick={onSave}>{editing ? t('save') : t('create')}</button></footer>
      {photoSearchOpen && <PhotoSearchModal initialQuery={draft.name} onClose={() => setPhotoSearchOpen(false)} onSelect={photo => { update('photo', photo); setPhotoSearchOpen(false) }} />}
    </section>
  </div>
}
