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
  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:`${query} food filetype:bitmap`, gsrnamespace:'6', gsrlimit:'18', prop:'imageinfo', iiprop:'url|mime', iiurlwidth:'600', format:'json', origin:'*' })
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`)
      const data = await response.json()
      const results = Object.values(data.query?.pages ?? {}) as Array<{ title: string; imageinfo?: Array<{ thumburl?: string; descriptionurl?: string; mime?: string }> }>
      setImages(results.flatMap(page => { const info = page.imageinfo?.[0]; return info?.thumburl && info.mime?.startsWith('image/') ? [{ title: page.title.replace(/^File:/, ''), thumb: info.thumburl, source: info.descriptionurl ?? '' }] : [] }))
    } catch { setImages([]) } finally { setLoading(false) }
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
    {loading ? <div className="photo-search-empty"><span className="spinner" />Buscando…</div> : images.length ? <div className="internet-photo-grid">{images.map(item => <article key={item.thumb}><button onClick={() => choose(item)} disabled={!!choosing}><img src={item.thumb} alt={item.title} /><span>{choosing === item.thumb ? '…' : t('usePhoto')}</span></button><a href={item.source} target="_blank" rel="noreferrer" aria-label={t('photoSource')}><ExternalLink /></a></article>)}</div> : <div className="photo-search-empty"><ImageIcon /><p>{t('searchPhotos')}</p></div>}
    <p className="commons-note">Imágenes proporcionadas por Wikimedia Commons. Consulta la fuente para ver su autor y licencia.</p>
  </section></div>
}
