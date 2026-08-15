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

  it('no usa Ingredientes como nombre y entiende encabezados de OCR con guiones', () => {
    const result = parseRecipeText(`- Ingredientes:\n- 1 taza de yogur\n- 2 tazas de harina de trigo\n- 1 cda de esencia de vainilla\n- 2 cdtas de polvo de hornear\n- Pizca de sal\n\n- Preparación:\n1. Precalienta el horno a 180 ºC.\n2. Mezcla yogur, azúcar, huevos y vainilla.\n3. Incorpora harina y polvo de hornear.\nTiempo total: 35-40 minutos`)
    expect(result.name).toBe('')
    expect(result.ingredients).toHaveLength(5)
    expect(result.ingredients[1]).toMatchObject({ amount: '2 tazas', name: 'harina de trigo' })
    expect(result.temperature).toBe('180 °C')
    expect(result.cookingTime).toBe('35-40 minutos')
    expect(result.steps).toHaveLength(3)
    expect(result.category).toBe('Postres')
  })

  it('convierte medias cantidades a lenguaje natural', () => {
    const result = parseRecipeText(`Ingredientes:\n- 1/2 taza de aceite\n- ½ cucharadita de sal\n- 1 / 2 kg de patatas\n- 1 1/2 tazas de harina\nPasos:\n1. Mezclar todo.`)
    expect(result.ingredients.map(item => item.amount)).toEqual(['media taza', 'media cucharadita', 'medio kg', '1 taza y media'])
    expect(result.ingredients.map(item => item.name)).toEqual(['aceite', 'sal', 'patatas', 'harina'])
  })

  it('organiza correctamente una captura del formulario de ZUNO', () => {
    const result = parseRecipeText(`ZUNO
Nueva receta
Nombre
Pechuga de pollo al perejil
Categoría
Pollo
Temperatura
190 °C
Tiempo total
14 minutos
Foto de la receta
Importar receta
Ingredientes
1 unidad
pechuga de pollo
al gusto
sal
1 cucharadita
perejil
Pasos
(uno por línea)
1. Precalienta la air fryer a 190 °C durante 3 minutos.
2. Sazona la pechuga con sal por ambos lados.
3. Añade el perejil por encima.
4. Coloca la pechuga en la cesta de la air fryer.
5. Cocina 7 minutos a 190 °C.
6. Dale la vuelta y cocina otros 7 minutos.
7. Comprueba que esté bien hecha y sirve.
Notas
Sin aceite.
Si la pechuga es gruesa, añade 2-3 minutos más.
aa
Estadísticas
Crear receta`)
    expect(result).toMatchObject({ name: 'Pechuga de pollo al perejil', category: 'Pollo', temperature: '190 °C', cookingTime: '14 minutos' })
    expect(result.ingredients.map(({ amount, name }) => ({ amount, name }))).toEqual([
      { amount: '1 unidad', name: 'pechuga de pollo' }, { amount: 'al gusto', name: 'sal' }, { amount: '1 cucharadita', name: 'perejil' }
    ])
    expect(result.steps).toHaveLength(7)
    expect(result.notes).toBe('Sin aceite.\nSi la pechuga es gruesa, añade 2-3 minutos más.')
  })

})
