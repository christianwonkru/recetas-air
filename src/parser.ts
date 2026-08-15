import { CATEGORIES, type Category, type RecipeDraft } from './types'

const uid = () => crypto.randomUUID()
const clean = (value: string) => value.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim()
const withoutBullet = (value: string) => value.replace(/^[-•*]\s*/, '').trim()

function normalizeAmount(value: string) {
  const normalized = value.replace('½', '1/2').replace(/(\d)\s*\/\s*(\d)/g, '$1/$2').trim()
  const feminineUnit = /^(?:tazas?|cda(?:s)?|cdta(?:s)?|cucharadas?|cucharaditas?|unidades?|piezas?|pizcas?)$/i
  const singular = (unit: string) => unit
    .replace(/^tazas$/i, 'taza').replace(/^cdas$/i, 'cda').replace(/^cdtas$/i, 'cdta')
    .replace(/^cucharadas$/i, 'cucharada').replace(/^cucharaditas$/i, 'cucharadita')
    .replace(/^unidades$/i, 'unidad').replace(/^piezas$/i, 'pieza').replace(/^pizcas$/i, 'pizca')
  const half = normalized.match(/^1\/2(?:\s+(.+))?$/)
  if (half) {
    if (!half[1]) return 'la mitad'
    return `${feminineUnit.test(half[1]) ? 'media' : 'medio'} ${singular(half[1])}`
  }
  const mixedHalf = normalized.match(/^(\d+)\s+1\/2\s+(.+)$/)
  if (mixedHalf) {
    const whole = Number(mixedHalf[1])
    const unit = whole === 1 ? singular(mixedHalf[2]) : mixedHalf[2]
    return `${whole} ${unit} y ${feminineUnit.test(mixedHalf[2]) ? 'media' : 'medio'}`
  }
  return normalized
}

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
    const item = clean(line).replace('½', '1/2').replace(/(\d)\s*\/\s*(\d)/g, '$1/$2')
    const match = item.match(/^((?:(?:\d+\s+)?\d+\/\d+|\d+[\d/.,–-]*|una?|dos|tres|al gusto|una pizca)\s*(?:g|kg|ml|l|tazas?|cda(?:s)?|cdta(?:s)?|cucharad(?:a|as)|cucharadita(?:s)?|cucharadas?|unidad(?:es)?|pieza(?:s)?|pizca(?:s)?|sobre(?:s)?)?)\s+(.+)$/i)
    return { id: uid(), amount: match ? normalizeAmount(match[1]) : '', name: match?.[2]?.replace(/^de\s+/i, '') ?? item }
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
