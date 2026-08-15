import { ExternalLink, ImageIcon, Search, X } from 'lucide-react'
import { useState } from 'react'
import { optimizeRecipeImage } from './images'
import { useSettings } from './settings'

interface CommonsImage { title: string; thumb: string; source: string }
export function PhotoSearchModal({ initialQuery, onClose, onSelect }: { initialQuery: string; onClose: () => void; onSelect: (photo: string) => void }) {
  const { t } = useSettings()
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<CommonsImage[]>([])
  const [loading, setLoading] = useState(false)
  const [choosing, setChoosing] = useState('')
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    setError('')
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:query.trim(), gsrnamespace:'6', gsrlimit:'24', gsrsort:'relevance', prop:'imageinfo', iiprop:'url|mime', iiurlwidth:'600', format:'json', formatversion:'2', origin:'*' })
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error.info ?? 'Error de Wikimedia Commons')
      const results = (data.query?.pages ?? []) as Array<{ title: string; imageinfo?: Array<{ thumburl?: string; descriptionurl?: string; mime?: string }> }>
      setImages(results.flatMap(page => { const info = page.imageinfo?.[0]; return info?.thumburl && info.mime?.startsWith('image/') ? [{ title: page.title.replace(/^File:/, ''), thumb: info.thumburl, source: info.descriptionurl ?? '' }] : [] }))
    } catch {
      setImages([])
      setError('No se pudo conectar con Wikimedia. Comprueba Internet e inténtalo de nuevo.')
    } finally { setLoading(false) }
  }
  const choose = async (item: CommonsImage) => {
    setChoosing(item.thumb)
    try {
      const blob = await fetch(item.thumb).then(response => response.blob())
      onSelect(await optimizeRecipeImage(new File([blob], item.title, { type: blob.type || 'image/jpeg' })))
    } catch { alert('No se pudo guardar esta imagen. Prueba con otra.') }
    finally { setChoosing('') }
  }
  return <div className="overlay nested" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal photo-search-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">WIKIMEDIA COMMONS</span><h2>{t('searchPhotos')}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('close')}><X /></button></header>
    <div className="web-photo-search"><div className="search"><Search /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder={t('searchPhotos')} /></div><button className="primary" onClick={search}>{t('searchAction')}</button></div>
    {loading ? <div className="photo-search-empty"><span className="spinner" />Buscando…</div> : images.length ? <div className="internet-photo-grid">{images.map(item => <article key={item.thumb}><button onClick={() => choose(item)} disabled={!!choosing}><img src={item.thumb} alt={item.title} /><span>{choosing === item.thumb ? '…' : t('usePhoto')}</span></button><a href={item.source} target="_blank" rel="noreferrer" aria-label={t('photoSource')}><ExternalLink /></a></article>)}</div> : <div className="photo-search-empty"><ImageIcon /><p>{error || (searched ? 'No se encontraron fotos. Prueba con menos palabras.' : t('searchPhotos'))}</p></div>}
    <p className="commons-note">Imágenes proporcionadas por Wikimedia Commons. Consulta la fuente para ver su autor y licencia.</p>
  </section></div>
}
