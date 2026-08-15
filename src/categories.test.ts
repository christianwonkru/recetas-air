import { describe, expect, it } from 'vitest'
import { mergeRecipeCategories } from './categories'

describe('categorías personalizadas', () => {
  it('conserva una categoría usada por una receta aunque ya no esté configurada', () => {
    expect(mergeRecipeCategories([{ name: 'Postres', subcategories: ['Chocolate', 'Limón'] }], ['Mis platos'])[1]).toEqual({ name: 'Mis platos', subcategories: [] })
  })
})
