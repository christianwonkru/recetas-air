import { describe, expect, it } from 'vitest'
import type { Recipe } from './types'
import { recoverRecipe } from './storage'

const empty:Recipe={id:'cake',name:'Bizcocho de limón',ingredients:[],temperature:'',cookingTime:'35-40',steps:[],notes:'',category:'Postres',favorite:false,createdAt:'',updatedAt:''}
describe('recoverRecipe',()=>{
  it('reconstruye el bizcocho si sus campos están vacíos',()=>{const value=recoverRecipe(empty,[]);expect(value.ingredients).toHaveLength(8);expect(value.steps).toHaveLength(6);expect(value.temperature).toBe('180 °C')})
  it('prefiere una copia local completa',()=>{const backup={...empty,temperature:'175 °C',ingredients:[{id:'x',amount:'2',name:'limones'}],steps:['Mezclar']};const value=recoverRecipe(empty,[backup]);expect(value.ingredients[0].name).toBe('limones');expect(value.temperature).toBe('175 °C')})
})
