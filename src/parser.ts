import { CATEGORIES, type Category, type Ingredient, type RecipeDraft } from './types'

const uid = () => crypto.randomUUID()
const clean = (value: string) => value.replace(/^[-•*]\s*/, '').replace(/^\d+[.)]\s*/, '').trim()
const withoutBullet = (value: string) => value.replace(/^[-•*]\s*/, '').trim()
const normalized = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

const UI_TEXT = /^(?:nueva receta|zuno|recetario|crear receta|guardar cambios|cancelar|quitar|hacer foto|fototeca\s*\/\s*album|buscar en internet|importar receta|foto de la receta|\+?\s*anadir|cantidad|ingrediente|\(?uno por linea\)?|estadisticas|total de la receta|raciones|calorias|hidratos de carbono|proteinas|grasas|fibra|azucares)$/i
const PLACEHOLDER = /^(?:ej\.?\s+|revisalo o escribelo tu|consejos, sustituciones)/i
const isNoise = (value: string) => UI_TEXT.test(normalized(clean(value))) || PLACEHOLDER.test(normalized(clean(value))) || /^(?:aa|[+×x])$/i.test(clean(value))

function normalizeAmount(value: string) {
  const amount = value.replace('½', '1/2').replace(/(\d)\s*\/\s*(\d)/g, '$1/$2').trim()
  const feminineUnit = /^(?:tazas?|cda(?:s)?|cdta(?:s)?|cucharadas?|cucharaditas?|unidades?|piezas?|pizcas?)$/i
  const singular = (unit: string) => unit.replace(/^tazas$/i, 'taza').replace(/^cdas$/i, 'cda').replace(/^cdtas$/i, 'cdta').replace(/^cucharadas$/i, 'cucharada').replace(/^cucharaditas$/i, 'cucharadita').replace(/^unidades$/i, 'unidad').replace(/^piezas$/i, 'pieza').replace(/^pizcas$/i, 'pizca')
  const half = amount.match(/^1\/2(?:\s+(.+))?$/)
  if (half) return half[1] ? `${feminineUnit.test(half[1]) ? 'media' : 'medio'} ${singular(half[1])}` : 'la mitad'
  const mixedHalf = amount.match(/^(\d+)\s+1\/2\s+(.+)$/)
  if (mixedHalf) return `${mixedHalf[1]} ${Number(mixedHalf[1]) === 1 ? singular(mixedHalf[2]) : mixedHalf[2]} y ${feminineUnit.test(mixedHalf[2]) ? 'media' : 'medio'}`
  return amount
}

function guessCategory(text: string): Category {
  const value = normalized(text)
  if (/azucar|harina|vainilla|bizcocho|tarta|galleta|postre|chocolate|levadura|polvo de hornear/.test(value)) return 'Postres'
  const matches: [Category, RegExp][] = [['Pollo', /pollo|pavo|ave|pechuga/], ['Carne', /carne|ternera|cerdo|hamburguesa|costilla/], ['Pescado', /pescado|salmon|merluza|atun|bacalao/], ['Patatas y verduras', /patata|verdura|calabacin|berenjena|brocoli|zanahoria/], ['Huevos', /huevo|tortilla/]]
  return matches.find(([, pattern]) => pattern.test(value))?.[0] ?? 'Otros'
}

function valueAfterLabel(lines: string[], labels: RegExp[]) {
  for (let index = 0; index < lines.length; index++) {
    const line = withoutBullet(lines[index])
    for (const label of labels) {
      const inline = line.match(new RegExp(`^(?:${label.source})\\s*:\\s*(.+)$`, 'i'))
      if (inline?.[1] && !isNoise(inline[1])) return inline[1].trim()
      if (new RegExp(`^(?:${label.source})\\s*:?$`, 'i').test(line)) {
        const next = lines.slice(index + 1).map(withoutBullet).find(value => value && !isNoise(value))
        if (next) return next
      }
    }
  }
  return ''
}

const amountOnly = /^(?:(?:(?:\d+\s+)?\d+\/\d+|\d+[\d/.,–-]*|una?|dos|tres|media?|mitad|al gusto|una pizca|pizca)\s*(?:g|kg|mg|ml|l|tazas?|cda(?:s)?|cdta(?:s)?|cucharad(?:a|as)|cucharadita(?:s)?|cucharadas?|unidad(?:es)?|pieza(?:s)?|pizca(?:s)?|sobre(?:s)?)?)$/i
const combinedIngredient = /^((?:(?:\d+\s+)?\d+\/\d+|\d+[\d/.,–-]*|una?|dos|tres|media?|mitad|al gusto|una pizca|pizca)\s*(?:g|kg|mg|ml|l|tazas?|cda(?:s)?|cdta(?:s)?|cucharad(?:a|as)|cucharadita(?:s)?|cucharadas?|unidad(?:es)?|pieza(?:s)?|pizca(?:s)?|sobre(?:s)?)?)\s+(.+)$/i

function parseIngredients(rawLines: string[]): Ingredient[] {
  const lines = rawLines.map(clean).filter(line => line && !isNoise(line))
  const result: Ingredient[] = []
  for (let index = 0; index < lines.length; index++) {
    const item = lines[index].replace('½', '1/2').replace(/(\d)\s*\/\s*(\d)/g, '$1/$2')
    const combined = item.match(combinedIngredient)
    if (amountOnly.test(item) && lines[index + 1] && !amountOnly.test(lines[index + 1])) {
      result.push({ id: uid(), amount: normalizeAmount(item), name: lines[++index].replace(/^de\s+/i, '') })
    } else if (combined) result.push({ id: uid(), amount: normalizeAmount(combined[1]), name: combined[2].replace(/^de\s+/i, '') })
    else if (!amountOnly.test(item)) result.push({ id: uid(), amount: '', name: item })
  }
  return result
}

export function looksLikeAppScreenshot(text: string) {
  const value = normalized(text)
  return /nueva receta/.test(value) && /foto de la receta/.test(value) && /crear receta|guardar cambios/.test(value)
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
  const headings = [/^ingredientes?\s*:?$/i, /^(?:pasos?|preparación|preparacion|instrucciones?)\s*:?$/i, /^notas?\s*:?$/i, /^categoría\s*:?|^categoria\s*:?/i, /^(?:temperatura|tiempo(?: total)?)\s*:?/i]
  const ingredientLines = section(/^ingredientes?\s*:?$/i, headings.slice(1))
  const stepLines = section(/^(?:pasos?|preparación|preparacion|instrucciones?)\s*:?$/i, [/^ingredientes?\s*:?$/i, /^notas?\s*:?$/i, /^categoría\s*:?|^categoria\s*:?/i, /^(?:temperatura|tiempo(?: total)?)\s*:?/i])
  const explicitTitle = valueAfterLabel(lines, [/nombre/i, /receta/i, /título/i, /titulo/i])
  const firstHeading = lines.findIndex(line => headings.some(pattern => pattern.test(withoutBullet(line))))
  const firstLine = clean(lines[0] ?? '')
  const possibleTitle = firstHeading > 0 && !isNoise(firstLine) ? firstLine : ''
  const explicitTemperature = valueAfterLabel(lines, [/temperatura/i])
  const temperatureNumber = (explicitTemperature || source).match(/(\d{2,3})\s*[°ºo0.]?\s*c\b/i)?.[1]
  const temperature = temperatureNumber ? `${temperatureNumber} °C` : ''
  const explicitTime = valueAfterLabel(lines, [/tiempo total/i, /tiempo/i, /cocción/i, /coccion/i])
  const cookingTime = explicitTime.match(/\d+\s*[–-]\s*\d+\s*(?:minutos?|horas?)|\d+\s*(?:minutos?|horas?)/i)?.[0] || source.match(/\d+\s*[–-]\s*\d+\s*(?:minutos?|horas?)|\d+\s*(?:minutos?|horas?)/i)?.[0] || ''
  const ingredients = parseIngredients(ingredientLines)
  const fallbackSteps = lines.filter(line => /^\d+[.)]\s+/.test(line)).map(clean)
  const categoryText = valueAfterLabel(lines, [/categoría/i, /categoria/i])
  const category = CATEGORIES.find(item => normalized(item) === normalized(categoryText)) ?? guessCategory(source)
  const noteLines = section(/^notas?\s*:?$/i, [/^categoría\s*:?|^categoria\s*:?/i, /^estadísticas|^estadisticas/i])
  const steps = (stepLines.length ? stepLines : fallbackSteps).map(clean).filter(line => line && !isNoise(line))
  return { name: explicitTitle || possibleTitle, ingredients: ingredients.length ? ingredients : [{ id: uid(), amount: '', name: '' }], temperature, cookingTime, steps, notes: noteLines.map(clean).filter(line => line && !isNoise(line)).join('\n'), photo: '', category }
}
