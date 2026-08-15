import type { Category, Ingredient, Nutrition } from './types'
type Food = Omit<Nutrition,'servings'> & { words:string[]; cup?:number; each?:number; tbsp?:number; tsp?:number }
const FOODS:Food[]=[
{words:['aceite'],calories:884,carbohydrates:0,protein:0,fat:100,fiber:0,sugars:0,salt:0,cup:218,tbsp:13.6,tsp:4.5},
{words:['azucar'],calories:387,carbohydrates:100,protein:0,fat:0,fiber:0,sugars:100,salt:0,cup:200,tbsp:12.5,tsp:4.2},
{words:['harina'],calories:364,carbohydrates:76.3,protein:10.3,fat:1,fiber:2.7,sugars:.3,salt:.01,cup:125,tbsp:7.8,tsp:2.6},
{words:['yogur','yogurt'],calories:61,carbohydrates:4.7,protein:3.5,fat:3.3,fiber:0,sugars:4.7,salt:.12,cup:245,tbsp:15,tsp:5},
{words:['huevo'],calories:143,carbohydrates:.7,protein:12.6,fat:9.5,fiber:0,sugars:.4,salt:.36,each:50},
{words:['hamburguesa'],calories:180,carbohydrates:2,protein:20,fat:10,fiber:0,sugars:0,salt:1,each:120},
{words:['pechuga','pollo'],calories:165,carbohydrates:0,protein:31,fat:3.6,fiber:0,sugars:0,salt:.19,each:150},
{words:['pan'],calories:265,carbohydrates:49,protein:9,fat:3.2,fiber:2.7,sugars:5,salt:1.2,each:70},
{words:['queso'],calories:350,carbohydrates:2,protein:25,fat:27,fiber:0,sugars:.5,salt:1.6,each:20},
{words:['patata'],calories:77,carbohydrates:17,protein:2,fat:.1,fiber:2.2,sugars:.8,salt:.02,each:180},
{words:['salmon'],calories:208,carbohydrates:0,protein:20,fat:13,fiber:0,sugars:0,salt:.15,each:150},
{words:['vainilla'],calories:288,carbohydrates:12.7,protein:.1,fat:.1,fiber:0,sugars:12.7,salt:.02,tbsp:13,tsp:4.3},
{words:['polvo de hornear','levadura'],calories:53,carbohydrates:27.7,protein:0,fat:0,fiber:.2,sugars:0,salt:10.6,tbsp:12,tsp:4}]
const norm=(v:string)=>v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
function qty(text:string){const v=norm(text).replace(',','.');if(/media|medio|mitad|1\/2|½/.test(v))return .5;if(/cuarto|1\/4|¼/.test(v))return .25;if(/tres cuartos|3\/4|¾/.test(v))return .75;const f=v.match(/(\d+)\/(\d+)/);if(f)return Number(f[1])/Number(f[2]);return Number(v.match(/\d+(?:\.\d+)?/)?.[0]??0)}
function grams(item:Ingredient,food:Food){const text=norm(`${item.amount} ${item.name}`),q=qty(item.amount||item.name)||1;if(/\bkg\b|kilo/.test(text))return q*1000;if(/\bmg\b/.test(text))return q/1000;if(/\bg\b|gram/.test(text))return q;if(/cucharad|cdta|tsp/.test(text))return q*(food.tsp??5);if(/cucharada|\bcda\b|tbsp/.test(text))return q*(food.tbsp??15);if(/taza|cup/.test(text))return q*(food.cup??200);return q*(food.each??100)}
export function estimateNutrition(ingredients:Ingredient[],category:Category):Nutrition|undefined{const total:Nutrition={servings:category==='Postres'?10:1,calories:0,carbohydrates:0,protein:0,fat:0,fiber:0,sugars:0,salt:0};let recognized=0;for(const item of ingredients){const name=norm(item.name),food=FOODS.find(f=>f.words.some(w=>name.includes(norm(w))));if(!food)continue;recognized++;const factor=grams(item,food)/100;for(const key of ['calories','carbohydrates','protein','fat','fiber','sugars','salt'] as const)total[key]+=food[key]*factor}if(!recognized)return;for(const key of ['calories','carbohydrates','protein','fat','fiber','sugars','salt'] as const)total[key]=Math.round(total[key]*10)/10;return total}
