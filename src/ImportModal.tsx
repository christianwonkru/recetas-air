import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { parseRecipeText } from './parser'
import type { RecipeDraft } from './types'

export function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (draft: RecipeDraft) => void }) {
  const [text, setText] = useState('')
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal import-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">IMPORTACIÓN INTELIGENTE</span><h2>Pegar receta</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
    <p className="intro">Pega una receta generada por ChatGPT o cualquier texto estructurado. Detectaremos automáticamente sus datos para que puedas revisarlos.</p>
    <div className="format-tip"><Sparkles /><span><b>Consejo:</b> funcionan mejor los textos con títulos como Ingredientes, Pasos, Temperatura y Tiempo.</span></div>
    <label>Texto de la receta<textarea autoFocus rows={13} value={text} onChange={e => setText(e.target.value)} placeholder={'Nombre: Salmón con limón\n\nIngredientes:\n- 2 lomos de salmón\n- 1 limón\n\nTemperatura: 190 °C\nTiempo: 12 minutos\n\nPasos:\n1. Sazonar...'} /></label>
    <footer className="modal-actions"><button className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={!text.trim()} onClick={() => onImport(parseRecipeText(text))}><Sparkles /> Detectar campos</button></footer>
  </section></div>
}
