import { Activity } from 'lucide-react'
import type { Nutrition, Recipe, RecipeDraft } from './types'
import { useSettings } from './settings'
import { estimateNutrition } from './nutritionEstimate'

const LABELS: Record<string, Record<string, string>> = {
  es:{ title:'Estadísticas',servings:'Raciones',calories:'Calorías',carbs:'Hidratos de carbono',protein:'Proteínas',fat:'Grasas',fiber:'Fibra',sugars:'Azúcares',salt:'Sal',total:'Total de la receta',portion:'Por ración',estimate:'Valores aproximados. Revisa el envase de cada ingrediente si necesitas mayor precisión.' },
  en:{ title:'Statistics',servings:'Servings',calories:'Calories',carbs:'Carbohydrates',protein:'Protein',fat:'Fat',fiber:'Fiber',sugars:'Sugars',salt:'Salt',total:'Whole recipe',portion:'Per serving',estimate:'Approximate values. Check ingredient packaging when greater accuracy is needed.' },
  fr:{ title:'Statistiques',servings:'Portions',calories:'Calories',carbs:'Glucides',protein:'Protéines',fat:'Lipides',fiber:'Fibres',sugars:'Sucres',salt:'Sel',total:'Recette entière',portion:'Par portion',estimate:'Valeurs approximatives. Vérifiez les emballages pour plus de précision.' },
  it:{ title:'Statistiche',servings:'Porzioni',calories:'Calorie',carbs:'Carboidrati',protein:'Proteine',fat:'Grassi',fiber:'Fibre',sugars:'Zuccheri',salt:'Sale',total:'Ricetta completa',portion:'Per porzione',estimate:'Valori approssimativi. Controlla le confezioni per maggiore precisione.' },
  pt:{ title:'Estatísticas',servings:'Porções',calories:'Calorias',carbs:'Hidratos de carbono',protein:'Proteínas',fat:'Gorduras',fiber:'Fibra',sugars:'Açúcares',salt:'Sal',total:'Receita completa',portion:'Por porção',estimate:'Valores aproximados. Consulte as embalagens para maior precisão.' }
}

export function NutritionEditor({ draft, onChange }: { draft: RecipeDraft; onChange: (value: RecipeDraft) => void }) {
  const { language } = useSettings(); const l = LABELS[language] ?? LABELS.es
  const n = draft.nutrition ?? { servings:1, calories:0, carbohydrates:0, protein:0, fat:0, fiber:0, sugars:0, salt:0 }
  const set = (key: keyof Nutrition, value: string) => onChange({ ...draft, nutrition:{ ...n, [key]: Math.max(0, Number(value) || 0) } })
  const fields: Array<[keyof Nutrition,string,string]> = [['servings',l.servings,''],['calories',l.calories,'kcal'],['carbohydrates',l.carbs,'g'],['protein',l.protein,'g'],['fat',l.fat,'g'],['fiber',l.fiber,'g'],['sugars',l.sugars,'g'],['salt',l.salt,'g']]
  return <section className="nutrition-editor"><div className="section-heading"><h3><Activity /> {l.title}</h3></div><p>{l.total}</p><div className="nutrition-inputs">{fields.map(([key,label,unit]) => <label key={key}>{label}<span><input type="number" min="0" step={key === 'servings' ? '1' : '0.1'} value={n[key] || ''} onChange={e => set(key,e.target.value)} />{unit}</span></label>)}</div><small>{l.estimate}</small></section>
}

export function NutritionStats({ recipe }: { recipe: Recipe }) {
  const { language } = useSettings(); const l = LABELS[language] ?? LABELS.es
  const hasManualData = !!recipe.nutrition && Object.entries(recipe.nutrition).some(([key,value]) => key !== 'servings' && Number(value) > 0)
  const nutrition = hasManualData ? recipe.nutrition! : estimateNutrition(recipe.ingredients, recipe.category)
  if (!nutrition) return <section className="nutrition-stats"><h3><Activity /> {l.title}</h3><small>{l.estimate}</small></section>
  const portions = Math.max(1,nutrition.servings || 1), per = (value:number) => Math.round(value / portions * 10) / 10
  const energy = nutrition.carbohydrates*4 + nutrition.protein*4 + nutrition.fat*9
  const pct = (value:number,factor:number) => energy ? Math.round(value*factor/energy*100) : 0
  return <section className="nutrition-stats"><h3><Activity /> {l.title}</h3><div className="nutrition-summary"><span><b>{per(nutrition.calories)}</b> kcal<small>{l.portion}</small></span><span><b>{portions}</b><small>{l.servings}</small></span></div><div className="macro-bars">{[[l.carbs,nutrition.carbohydrates,4,pct(nutrition.carbohydrates,4)],[l.protein,nutrition.protein,4,pct(nutrition.protein,4)],[l.fat,nutrition.fat,9,pct(nutrition.fat,9)]].map(([label,value,factor,percent]) => <div key={String(label)}><p><b>{label}</b><span>{per(Number(value))} g · {percent}%</span></p><i><em style={{width:`${percent}%`}} /></i></div>)}</div><div className="nutrition-extras"><span>{l.fiber}: <b>{per(nutrition.fiber)} g</b></span><span>{l.sugars}: <b>{per(nutrition.sugars)} g</b></span><span>{l.salt}: <b>{per(nutrition.salt)} g</b></span></div><small>{l.estimate}</small></section>
}
