import { Clock3, Edit3, Flame, Heart, Trash2, X } from 'lucide-react'
import type { Recipe } from './types'
import { useSettings } from './settings'
import { NutritionStats } from './Nutrition'

interface Props { recipe: Recipe; onClose: () => void; onEdit: () => void; onDelete: () => void; onFavorite: () => void }
export function RecipeDetail({ recipe, onClose, onEdit, onDelete, onFavorite }: Props) {
  const { t, categoryLabel } = useSettings()
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><article className="modal detail" role="dialog" aria-modal="true">
    <header className={`detail-hero ${recipe.photo ? 'with-photo' : ''}`} style={recipe.photo ? { backgroundImage: `linear-gradient(90deg, rgba(20,45,35,.88), rgba(20,45,35,.45)), url(${recipe.photo})` } : undefined}>
      <div className="detail-top"><span className="category-pill">{categoryLabel(recipe.category)}</span><button className="icon-button light" onClick={onClose} aria-label={t('close')}><X /></button></div>
      <h2>{recipe.name}</h2><p>{t('oilFree')}</p>
      <div className="stats"><span><Flame /> <b>{recipe.temperature || '—'}</b><small>{t('temperature')}</small></span><span><Clock3 /> <b>{recipe.cookingTime || '—'}</b><small>{t('totalTime')}</small></span></div>
    </header>
    <div className="detail-body">
      <section><h3>{t('ingredients')}</h3><ul className="ingredients-detail">{recipe.ingredients.filter(x => x.name).map(x => <li key={x.id}><b>{x.amount}</b><span>{x.name}</span></li>)}</ul></section>
      <section><h3>{t('preparation')}</h3><ol className="steps">{recipe.steps.filter(Boolean).map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol></section>
      {recipe.notes && <aside className="note"><b>{t('notes')}</b><p>{recipe.notes}</p></aside>}
      <NutritionStats recipe={recipe} />
    </div>
    <footer className="detail-actions"><button className="danger-text" onClick={onDelete}><Trash2 /> {t('delete')}</button><div><button className="secondary" onClick={onFavorite}><Heart className={recipe.favorite ? 'filled' : ''} /> {t('favorites')}</button><button className="primary" onClick={onEdit}><Edit3 /> {t('edit')}</button></div></footer>
  </article></div>
}
