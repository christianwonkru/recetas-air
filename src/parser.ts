import { CATEGORIES, type Category, type RecipeDraft } from './types'

const uid = () => crypto.randomUUID()
const clean = (value: string) => value.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim()
const withoutBullet = (value: string) => value.replace(/^[-•*]\s*/, '').trim()

function guessCategory(text: string): Category {
  const value = text.toLowerCase()
  if (/az[uú]car|harina|vainilla|bizcocho|tarta|galleta|postre|chocolate|levadura|polvo de hornear/.test(value)) return 'Postres'
  const matches: [Category, RegExp][] = [
    ['Pollo', /pollo|pavo|ave/], ['Carne', /carne|ternera|cerdo|hamburguesa|costilla/],
    ['Pescado', /pescado|salm[oó]n|merluza|at[uú]n|bacalao/],
    ['Patatas y verduras', /patata|verdura|calabac[ií]n|berenjena|br[oó]coli|zanahoria/],
    ['Huevos', /huevo|tortilla/], ['Postres', /postre|tarta|bizcocho|galleta|dulce/]
  ]
  return matches.find(([, pattern]) => pattern.test(value))?.[0] ?? 'Otros'
}

function valueAfterLabel(lines: string[], labels: string[]) {
  const pattern = new RegExp(`^(?:${labels.join('|')})\\s*:?\\s*(.+)$`, 'i')
  return lines.map(line => withoutBullet(line).match(pattern)?.[1]?.trim()).find(Boolean) ?? ''
}

export function parseRecipeText(source: string): RecipeDraft {
  const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const section = (start: RegExp, ends: RegExp[]) => {
    const index = lines.findIndex(line => start.test(withoutBullet(line)))
    if (index < 0) return []
    const result: string[] = []
    for (let i = index + 1; i < lines.length && !ends.some(regex => regex.test(withoutBullet(lines[i]))); i++) result.push(lines[i])
    return result
  }
  const headings = [/^ingredientes?\s*:?$/i, /^(?:pasos?|preparaci[oó]n|instrucciones?)\s*:?$/i, /^notas?\s*:?$/i, /^categor[ií]a\s*:?/i, /^(?:temperatura|tiempo)\s*:?/i]
  const ingredientLines = section(/^ingredientes?\s*:?$/i, headings.slice(1))
  const stepLines = section(/^(?:pasos?|preparaci[oó]n|instrucciones?)\s*:?$/i, [/^ingredientes?\s*:?$/i, /^notas?\s*:?$/i, /^categor[ií]a\s*:?/i, /^(?:temperatura|tiempo(?: total)?)\s*:?/i])
  const explicitTitle = valueAfterLabel(lines, ['nombre', 'receta', 'título', 'titulo'])
  const firstHeading = lines.findIndex(line => headings.some(pattern => pattern.test(withoutBullet(line))))
  const possibleTitle = firstHeading > 0 ? clean(lines[0]) : ''
  const title = explicitTitle || possibleTitle
  const temperatureNumber = source.match(/(?:temperatura\s*:?\s*)?(\d{2,3})\s*[°ºo0.]?\s*c\b/i)?.[1]
  const temperature = temperatureNumber ? `${temperatureNumber} °C` : ''
  const cookingTime = valueAfterLabel(lines, ['tiempo(?: total)?', 'cocción', 'coccion']) || source.match(/\d+\s*[–-]\s*\d+\s*(?:minutos?|horas?)|\d+\s*(?:minutos?|horas?)/i)?.[0] || ''
  const ingredients = ingredientLines.map(line => {
    const item = clean(line)
    const match = item.match(/^((?:\d+[\d/.,–-]*|una?|dos|tres|al gusto|una pizca)\s*(?:g|kg|ml|l|tazas?|cda(?:s)?|cdta(?:s)?|cucharad(?:a|as)|cucharadita(?:s)?|cucharadas?|unidad(?:es)?|pieza(?:s)?|pizca(?:s)?|sobre(?:s)?)?)\s+(.+)$/i)
    return { id: uid(), amount: match?.[1] ?? '', name: match?.[2]?.replace(/^de\s+/i, '') ?? item }
  })
  const fallbackSteps = lines.filter(line => /^\d+[.)]\s+/.test(line)).map(clean)
  const categoryText = valueAfterLabel(lines, ['categoría', 'categoria'])
  const category = CATEGORIES.find(item => item.toLowerCase() === categoryText.toLowerCase()) ?? guessCategory(source)
  const noteLines = section(/^notas?\s*:?$/i, [/^categor[ií]a\s*:?/i])
  return {
    name: title,
    ingredients: ingredients.length ? ingredients : [{ id: uid(), amount: '', name: '' }],
    temperature,
    cookingTime,
    steps: (stepLines.length ? stepLines : fallbackSteps).map(clean),
    notes: noteLines.map(clean).join(' '),
    photo: '',
    category
  }
}
