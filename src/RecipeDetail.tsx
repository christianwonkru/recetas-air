import { Clock3, Edit3, Flame, Heart, Trash2, X } from 'lucide-react'
import type { Recipe } from './types'

interface Props { recipe: Recipe; onClose: () => void; onEdit: () => void; onDelete: () => void; onFavorite: () => void }
export function RecipeDetail({ recipe, onClose, onEdit, onDelete, onFavorite }: Props) {
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><article className="modal detail" role="dialog" aria-modal="true">
    <header className="detail-hero">
      <div className="detail-top"><span className="category-pill">{recipe.category}</span><button className="icon-button light" onClick={onClose} aria-label="Cerrar"><X /></button></div>
      <h2>{recipe.name}</h2><p>Preparada sin aceite</p>
      <div className="stats"><span><Flame /> <b>{recipe.temperature || '—'}</b><small>Temperatura</small></span><span><Clock3 /> <b>{recipe.cookingTime || '—'}</b><small>Tiempo total</small></span></div>
    </header>
    <div className="detail-body">
      <section><h3>Ingredientes</h3><ul className="ingredients-detail">{recipe.ingredients.filter(x => x.name).map(x => <li key={x.id}><b>{x.amount}</b><span>{x.name}</span></li>)}</ul></section>
      <section><h3>Preparación</h3><ol className="steps">{recipe.steps.filter(Boolean).map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol></section>
      {recipe.notes && <aside className="note"><b>Notas del cocinero</b><p>{recipe.notes}</p></aside>}
    </div>
    <footer className="detail-actions"><button className="danger-text" onClick={onDelete}><Trash2 /> Eliminar</button><div><button className="secondary" onClick={onFavorite}><Heart className={recipe.favorite ? 'filled' : ''} /> {recipe.favorite ? 'Quitar favorito' : 'Favorita'}</button><button className="primary" onClick={onEdit}><Edit3 /> Editar</button></div></footer>
  </article></div>
}
