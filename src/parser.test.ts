import { describe, expect, it } from 'vitest'
import { parseRecipeText } from './parser'

describe('parseRecipeText', () => {
  it('detecta los campos principales de una receta', () => {
    const result = parseRecipeText(`Nombre: Salmón crujiente\nIngredientes:\n- 2 lomos de salmón\n- 1 cucharadita pimentón\nTemperatura: 190 °C\nTiempo: 12 minutos\nPasos:\n1. Sazonar el pescado.\n2. Cocinar hasta dorar.`)
    expect(result.name).toBe('Salmón crujiente')
    expect(result.ingredients).toHaveLength(2)
    expect(result.temperature).toBe('190 °C')
    expect(result.cookingTime).toBe('12 minutos')
    expect(result.steps).toHaveLength(2)
    expect(result.category).toBe('Pescado')
  })
})
