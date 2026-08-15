import { Activity } from 'lucide-react'
import type { Recipe, RecipeDraft } from './types'
import { useSettings } from './settings'
import { estimateNutrition } from './nutritionEstimate'

const LABELS: Record<string, Record<string, string>> = {
  es:{ title:'Estadísticas',servings:'Raciones',calories:'Calorías',carbs:'Hidratos de carbono',protein:'Proteínas',fat:'Grasas',fiber:'Fibra',sugars:'Azúcares',salt:'Sal',total:'Total de la receta',portion:'Por ración',estimate:'Valores aproximados. Revisa el envase de cada ingrediente si necesitas mayor precisión.' },
  en:{ title:'Statistics',servings:'Servings',calories:'Calories',carbs:'Carbohydrates',protein:'Protein',fat:'Fat',fiber:'Fiber',sugars:'Sugars',salt:'Salt',total:'Whole recipe',portion:'Per serving',estimate:'Approximate values. Check ingredient packaging when greater accuracy is needed.' },
  fr:{ title:'Statistiques',servings:'Portions',calories:'Calories',carbs:'Glucides',protein:'Protéines',fat:'Lipides',fiber:'Fibres',sugars:'Sucres',salt:'Sel',total:'Recette entière',portion:'Par portion',estimate:'Valeurs approximatives. Vérifiez les emballages pour plus de précision.' },
  it:{ title:'Statistiche',servings:'Porzioni',calories:'Calorie',carbs:'Carboidrati',protein:'Proteine',fat:'Grassi',fiber:'Fibre',sugars:'Zuccheri',salt:'Sale',total:'Ricetta completa',portion:'Per porzione',estimate:'Valori approssimativi. Controlla le confezioni per maggiore precisione.' },
  pt:{ title:'Estatísticas',servings:'Porções',calories:'Calorias',carbs:'Hidratos de carbono',protein:'Proteínas',fat:'Gorduras',fiber:'Fibra',sugars:'Açúcares',salt:'Sal',total:'Receita completa',portion:'Por porção',estimate:'Valores aproximados. Consulte as embalagens para maior precisão.' }
}

export function NutritionEditor({ draft }: { draft: RecipeDraft; onChange: (value: RecipeDraft) => void }) {
  const { language } = useSettings(); const l = LABELS[language] ?? LABELS.es
  const n = estimateNutrition(draft.ingredients, draft.category)
  return <section className="nutrition-editor"><div className="section-heading"><h3><Activity /> {l.title}</h3></div><p>Cálculo automático según las cantidades de los ingredientes</p>{n ? <div className="nutrition-preview"><span><b>{n.calories}</b> kcal<small>{l.calories}</small></span><span><b>{n.carbohydrates}</b> g<small>{l.carbs}</small></span><span><b>{n.protein}</b> g<small>{l.protein}</small></span><span><b>{n.fat}</b> g<small>{l.fat}</small></span></div> : <p className="nutrition-empty">Añade cantidades e ingredientes reconocibles para ver la estimación.</p>}<small>{l.estimate}</small></section>
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
