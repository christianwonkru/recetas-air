import { describe, expect, it } from 'vitest'
import { estimateNutrition } from './nutritionEstimate'

describe('estimateNutrition', () => {
  it('calcula el bizcocho guardado', () => {
    const n = estimateNutrition([{ id:'1', amount:'1 taza', name:'yogurt natural' }, { id:'2', amount:'1 taza', name:'azúcar' }, { id:'3', amount:'Media', name:'taza de aceite vegetal' }, { id:'4', amount:'3', name:'huevos' }, { id:'5', amount:'2 tazas', name:'harina de trigo' }], 'Postres')
    expect(n?.servings).toBe(10)
    expect(n?.calories).toBeGreaterThan(2500)
    expect(n?.carbohydrates).toBeGreaterThan(300)
  })

  it('duplica las estadísticas al pasar de una a dos pechugas', () => {
    const one = estimateNutrition([{ id:'1', amount:'1 unidad', name:'pechuga de pollo' }], 'Pollo')!
    const two = estimateNutrition([{ id:'1', amount:'2 unidades', name:'pechuga de pollo' }], 'Pollo')!
    expect(one.calories).toBe(247.5)
    expect(one.protein).toBe(46.5)
    expect(two.calories).toBe(one.calories * 2)
    expect(two.protein).toBe(one.protein * 2)
  })
})
