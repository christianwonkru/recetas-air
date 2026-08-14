import { Download, History, RotateCcw, Upload, X } from 'lucide-react'
import { useRef } from 'react'
import { exportRecipes, parseBackupFile, type RecipeBackup } from './backups'
import type { Recipe } from './types'

interface Props {
  recipes: Recipe[]
  backups: RecipeBackup[]
  onClose: () => void
  onRestore: (recipes: Recipe[]) => void
}

export function BackupModal({ recipes, backups, onClose, onRestore }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const restored = parseBackupFile(await file.text())
      if (confirm(`¿Sustituir las recetas actuales por las ${restored.length} del archivo?`)) onRestore(restored)
    } catch {
      alert('No se ha podido leer el archivo. Selecciona una copia exportada por RECETAS AIR.')
    }
  }
  return <div className="overlay" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal backup-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">SEGURIDAD</span><h2>Copias de seguridad</h2></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
    <p className="intro">Se crea una copia local cada 20 minutos mientras la aplicación está abierta y han cambiado las recetas. Se conservan las 36 últimas.</p>
    <div className="backup-actions"><button className="primary" onClick={() => exportRecipes(recipes)}><Download /> Descargar copia</button><button className="secondary" onClick={() => input.current?.click()}><Upload /> Importar archivo</button><input ref={input} hidden type="file" accept="application/json,.json" onChange={e => importFile(e.target.files?.[0])} /></div>
    <div className="section-heading"><h3><History size={18} /> Historial local</h3><span>{backups.length} copias</span></div>
    <div className="backup-list">{backups.length ? backups.map(backup => <div key={backup.id}><span><b>{new Date(backup.createdAt).toLocaleString('es-ES')}</b><small>{backup.recipes.length} {backup.recipes.length === 1 ? 'receta' : 'recetas'}</small></span><button className="secondary" onClick={() => confirm('¿Restaurar esta copia? Las recetas actuales serán sustituidas.') && onRestore(backup.recipes)}><RotateCcw /> Restaurar</button></div>) : <p>Todavía no hay copias locales.</p>}</div>
    <footer className="modal-actions"><button className="secondary" onClick={onClose}>Cerrar</button></footer>
  </section></div>
}
