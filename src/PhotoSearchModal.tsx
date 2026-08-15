import { ExternalLink, ImageIcon, Search, X } from 'lucide-react'
import { useState } from 'react'
import { optimizeRecipeImage } from './images'
import { useSettings } from './settings'

interface OpenverseImage { id: string; title: string; thumb: string; source: string }

const UI: Record<string, Record<string, string>> = {
  es: { title:'Buscar fotos de platos', search:'Buscar', searching:'Buscando fotos…', options:'opciones de fotos', use:'Usar foto', source:'Ver fuente', none:'No se encontraron fotos. Prueba con otras palabras.', error:'No se pudo conectar con el buscador. Comprueba Internet e inténtalo de nuevo.', saveError:'No se pudo guardar esta imagen. Prueba con otra.', note:'Imágenes abiertas proporcionadas por Openverse. Consulta la fuente para ver su autor y licencia.' },
  en: { title:'Search for dish photos', search:'Search', searching:'Searching for photos…', options:'photo options', use:'Use photo', source:'View source', none:'No photos found. Try different words.', error:'Could not connect to image search. Check your connection and try again.', saveError:'This image could not be saved. Try another one.', note:'Open images provided by Openverse. View the source for author and license details.' },
  fr: { title:'Rechercher des photos de plats', search:'Rechercher', searching:'Recherche de photos…', options:'photos proposées', use:'Utiliser la photo', source:'Voir la source', none:'Aucune photo trouvée. Essayez d’autres mots.', error:'Connexion à la recherche impossible. Vérifiez Internet et réessayez.', saveError:'Impossible d’enregistrer cette image. Essayez-en une autre.', note:'Images libres fournies par Openverse. Consultez la source pour connaître l’auteur et la licence.' },
  it: { title:'Cerca foto di piatti', search:'Cerca', searching:'Ricerca foto…', options:'foto disponibili', use:'Usa foto', source:'Vedi fonte', none:'Nessuna foto trovata. Prova altre parole.', error:'Impossibile collegarsi alla ricerca. Controlla Internet e riprova.', saveError:'Impossibile salvare questa immagine. Provane un’altra.', note:'Immagini aperte fornite da Openverse. Consulta la fonte per autore e licenza.' },
  pt: { title:'Pesquisar fotos de pratos', search:'Pesquisar', searching:'A pesquisar fotos…', options:'opções de fotos', use:'Usar foto', source:'Ver fonte', none:'Nenhuma foto encontrada. Tente outras palavras.', error:'Não foi possível ligar à pesquisa. Verifique a Internet e tente novamente.', saveError:'Não foi possível guardar esta imagem. Tente outra.', note:'Imagens abertas fornecidas pelo Openverse. Consulte a fonte para ver o autor e a licença.' }
}

const FOOD_WORDS: Record<string, Record<string, string>> = {
  es: { bizcocho:'cake', tarta:'cake', limon:'lemon', limón:'lemon', pollo:'chicken', pechuga:'breast', patatas:'potatoes', patata:'potato', pescado:'fish', carne:'meat', huevos:'eggs', huevo:'egg', verduras:'vegetables', hamburguesa:'burger' },
  fr: { gâteau:'cake', gateau:'cake', citron:'lemon', poulet:'chicken', poitrine:'breast', pommes:'potatoes', poisson:'fish', viande:'meat', œufs:'eggs', oeufs:'eggs', légumes:'vegetables', legumes:'vegetables' },
  it: { torta:'cake', limone:'lemon', pollo:'chicken', petto:'breast', patate:'potatoes', pesce:'fish', carne:'meat', uova:'eggs', verdure:'vegetables' },
  pt: { bolo:'cake', limão:'lemon', limao:'lemon', frango:'chicken', peito:'breast', batatas:'potatoes', peixe:'fish', carne:'meat', ovos:'eggs', legumes:'vegetables' }
}

function searchTerms(query: string, language: string) {
  if (language === 'en') return query.trim()
  const dictionary = FOOD_WORDS[language] ?? {}
  const translated = query.trim().split(/\s+/).map(word => {
    const clean = word.toLocaleLowerCase(language).replace(/[.,;:!?]/g, '')
    return dictionary[clean] ?? (['de', 'del', 'la', 'el', 'con', 'y', 'di', 'du', 'des', 'do', 'da', 'com', 'e'].includes(clean) ? '' : clean)
  }).filter(Boolean).join(' ')
  return translated || query.trim()
}

export function PhotoSearchModal({ initialQuery, onClose, onSelect }: { initialQuery: string; onClose: () => void; onSelect: (photo: string) => void }) {
  const { t, language } = useSettings()
  const ui = UI[language] ?? UI.es
  const [query, setQuery] = useState(initialQuery)
  const [images, setImages] = useState<OpenverseImage[]>([])
  const [loading, setLoading] = useState(false)
  const [choosing, setChoosing] = useState('')
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setSearched(true); setError('')
    try {
      const params = new URLSearchParams({ q: searchTerms(query, language), page_size:'20', mature:'false', categories:'photograph' })
      const responses = await Promise.all([1, 2].map(page => fetch(`https://api.openverse.org/v1/images/?${params}&page=${page}`)))
      if (responses.some(response => !response.ok)) throw new Error('Openverse request failed')
      const pages = await Promise.all(responses.map(response => response.json()))
      const results = pages.flatMap(data => data.results ?? []) as Array<{ id:string; title?:string; thumbnail?:string; foreign_landing_url?:string }>
      setImages(results.flatMap(item => item.thumbnail ? [{ id:item.id, title:item.title || query, thumb:item.thumbnail, source:item.foreign_landing_url ?? '' }] : []))
    } catch { setImages([]); setError(ui.error) }
    finally { setLoading(false) }
  }

  const choose = async (item: OpenverseImage) => {
    setChoosing(item.id)
    try {
      const response = await fetch(item.thumb)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const blob = await response.blob()
      onSelect(await optimizeRecipeImage(new File([blob], item.title, { type: blob.type || 'image/jpeg' })))
    } catch { alert(ui.saveError) }
    finally { setChoosing('') }
  }

  return <div className="overlay nested" role="presentation" onMouseDown={e => e.target === e.currentTarget && onClose()}><section className="modal photo-search-modal" role="dialog" aria-modal="true">
    <header className="modal-header"><div><span className="eyebrow">OPENVERSE</span><h2>{ui.title}</h2></div><button className="icon-button" onClick={onClose} aria-label={t('close')}><X /></button></header>
    <div className="web-photo-search"><div className="search"><Search /><input autoFocus value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder={ui.title} /></div><button className="primary" onClick={search}>{ui.search}</button></div>
    {loading ? <div className="photo-search-empty"><span className="spinner" />{ui.searching}</div> : images.length ? <><p className="photo-result-count">{images.length} {ui.options}</p><div className="internet-photo-grid">{images.map(item => <article key={item.id}><button onClick={() => choose(item)} disabled={!!choosing}><img src={item.thumb} alt={item.title} loading="lazy" /><span>{choosing === item.id ? '…' : ui.use}</span></button>{item.source && <a href={item.source} target="_blank" rel="noreferrer" aria-label={ui.source}><ExternalLink /></a>}</article>)}</div></> : <div className="photo-search-empty"><ImageIcon /><p>{error || (searched ? ui.none : ui.title)}</p></div>}
    <p className="commons-note">{ui.note}</p>
  </section></div>
}
