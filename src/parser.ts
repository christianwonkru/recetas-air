import { CATEGORIES, type Category, type RecipeDraft } from './types'

const uid = () => crypto.randomUUID()
const clean = (value: string) => value.replace(/^[-•*\d.)\s]+/, '').trim()

function guessCategory(text: string): Category {
  const value = text.toLowerCase()
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
  return lines.map(line => line.match(pattern)?.[1]?.trim()).find(Boolean) ?? ''
}

export function parseRecipeText(source: string): RecipeDraft {
  const lines = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const section = (start: RegExp, ends: RegExp[]) => {
    const index = lines.findIndex(line => start.test(line))
    if (index < 0) return []
    const result: string[] = []
    for (let i = index + 1; i < lines.length && !ends.some(regex => regex.test(lines[i])); i++) result.push(lines[i])
    return result
  }
  const headings = [/^ingredientes?\s*:?$/i, /^(?:pasos?|preparaci[oó]n|instrucciones?)\s*:?$/i, /^notas?\s*:?$/i, /^categor[ií]a\s*:?/i, /^(?:temperatura|tiempo)\s*:?/i]
  const ingredientLines = section(/^ingredientes?\s*:?$/i, headings.slice(1))
  const stepLines = section(/^(?:pasos?|preparaci[oó]n|instrucciones?)\s*:?$/i, [/^notas?\s*:?$/i, /^categor[ií]a\s*:?/i])
  const title = valueAfterLabel(lines, ['nombre', 'receta', 'título', 'titulo']) || clean(lines[0] || 'Nueva receta')
  const temperature = source.match(/(?:temperatura\s*:?\s*)?(\d{2,3}\s*°?\s*C)/i)?.[1]?.replace(/\s+/g, ' ') ?? ''
  const cookingTime = valueAfterLabel(lines, ['tiempo(?: total)?', 'cocción', 'coccion']) || source.match(/\d+\s*[–-]\s*\d+\s*minutos?|\d+\s*minutos?/i)?.[0] || ''
  const ingredients = ingredientLines.map(line => {
    const item = clean(line)
    const match = item.match(/^((?:\d+[\d/.,–-]*|una?|dos|tres|al gusto)\s*(?:g|kg|ml|l|cucharad(?:a|as)|cucharadita(?:s)?|unidad(?:es)?|pieza(?:s)?)?)\s+(.+)$/i)
    return { id: uid(), amount: match?.[1] ?? '', name: match?.[2] ?? item }
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
