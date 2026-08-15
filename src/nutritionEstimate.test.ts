import {describe,expect,it} from 'vitest'
import {estimateNutrition} from './nutritionEstimate'
describe('estimateNutrition',()=>{it('calcula el bizcocho guardado',()=>{const n=estimateNutrition([{id:'1',amount:'1 taza',name:'yogurt natural'},{id:'2',amount:'1 taza',name:'azúcar'},{id:'3',amount:'Media',name:'taza de aceite vegetal'},{id:'4',amount:'3',name:'huevos'},{id:'5',amount:'2 tazas',name:'harina de trigo'}],'Postres');expect(n?.servings).toBe(10);expect(n?.calories).toBeGreaterThan(2500);expect(n?.carbohydrates).toBeGreaterThan(300)})})
