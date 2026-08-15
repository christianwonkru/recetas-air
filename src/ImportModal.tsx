import { Camera, FileText, ImagePlus, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { parseRecipeText } from './parser'
import type { RecipeDraft } from './types'
import { optimizeRecipeImage } from './images'

export function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (draft: RecipeDraft) => void }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'text' | 'photo'>('text')
  const [photo, setPhoto] = useState('')
  const [reading, setReading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const readPhoto = async (file?: File) => {
    if (!file) return
    setReading(true); setProgress(0); setStatus('Preparando lector local…')
    try {
      const [{ createWorker }, optimized] = await Promise.all([import('tesseract.js'), optimizeRecipeImage(file)])
      setPhoto(optimized)
      const worker = await createWorker('spa', undefined, { logger: message => {
        if (typeof message.progress === 'number') setProgress(Math.round(message.progress * 100))
        if (message.status === 'recognizing text') setStatus('Leyendo la receta…')
        else if (message.status.includes('loading')) setStatus('Cargando el modelo de español…')
      } })
      const result = await worker.recognize(file)
      await worker.terminate()
      setText(result.data.text.trim())
      setStatus('Texto detectado. Revísalo antes de organizarlo.')
    } catch {
      setStatus('No se pudo leer la foto. Prueba con una imagen más nítida y bien iluminada.')
    } finally { setReading(false) }
  }
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal import-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">IMPORTACIÓN INTELIGENTE</span><h2>Pegar receta</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
    <p className="intro">Importa una receta escrita o fotografiada. Todo el reconocimiento se realiza localmente en este dispositivo.</p>
    <div className="import-tabs"><button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}><FileText /> Desde texto</button><button className={mode === 'photo' ? 'active' : ''} onClick={() => setMode('photo')}><Camera /> Desde foto</button></div>
    <div className="format-tip"><Sparkles /><span><b>Consejo:</b> funcionan mejor los textos con títulos como Ingredientes, Pasos, Temperatura y Tiempo.</span></div>
    {mode === 'photo' && <div className="ocr-upload">
      <label className={photo ? 'has-photo' : ''}>{photo ? <img src={photo} alt="Receta fotografiada" /> : <ImagePlus />}<b>{photo ? 'Elegir otra foto' : 'Elegir o fotografiar una receta'}</b><span>Procura que el texto se vea recto, nítido y con buena luz.</span><input type="file" accept="image/*" onChange={e => readPhoto(e.target.files?.[0])} disabled={reading} /></label>
      {(reading || status) && <div className="ocr-status"><div><span>{status}</span><b>{reading ? `${progress}%` : ''}</b></div>{reading && <progress max="100" value={progress} />}</div>}
    </div>}
    {(mode === 'text' || text) && <label>{mode === 'photo' ? 'Texto reconocido (puedes corregirlo)' : 'Texto de la receta'}<textarea autoFocus={mode === 'text'} rows={mode === 'text' ? 13 : 8} value={text} onChange={e => setText(e.target.value)} placeholder={'Nombre: Salmón con limón\n\nIngredientes:\n- 2 lomos de salmón\n- 1 limón\n\nTemperatura: 190 °C\nTiempo: 12 minutos\n\nPasos:\n1. Sazonar...'} /></label>}
    <footer className="modal-actions"><button className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={!text.trim() || reading} onClick={() => onImport({ ...parseRecipeText(text), photo })}><Sparkles /> Organizar receta</button></footer>
  </section></div>
}
