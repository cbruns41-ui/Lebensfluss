import type { AppData, GroceryItem, MealPlanDay, Recipe } from '../types'
import { GROCERY_CATEGORIES } from './utils'

export const MEAL_SLOTS = [
  { key: 'breakfast' as const, label: 'Frühstück', emoji: '🌅' },
  { key: 'lunch' as const, label: 'Mittag', emoji: '☀️' },
  { key: 'dinner' as const, label: 'Abend', emoji: '🌙' },
  { key: 'snacks' as const, label: 'Snacks', emoji: '🍎' },
]

export const MEAL_QUICK_SUGGESTIONS: Record<(typeof MEAL_SLOTS)[number]['key'], string[]> = {
  breakfast: ['Haferflocken', 'Joghurt & Müsli', 'Vollkornbrot', 'Rührei & Toast', 'Smoothie'],
  lunch: ['Salat', 'Meal-Prep Reste', 'Suppe', 'Wrap', 'Buddha Bowl'],
  dinner: ['Gemüsepfanne', 'Pasta', 'Ofengemüse', 'Curry', 'Fisch & Reis'],
  snacks: ['Apfel', 'Nüsse', 'Joghurt', 'Karotten', ''],
}

export const GROCERY_STAPLES = [
  { name: 'Milch', category: 'Milchprodukte', quantity: '1 L' },
  { name: 'Eier', category: 'Milchprodukte', quantity: '6 Stk' },
  { name: 'Brot', category: 'Backwaren', quantity: '1' },
  { name: 'Banane', category: 'Obst & Gemüse', quantity: '4 Stk' },
  { name: 'Hähnchenbrust', category: 'Fleisch & Fisch', quantity: '400 g' },
  { name: 'Reis', category: 'Sonstiges', quantity: '500 g' },
]

const CATEGORY_KEYWORDS: [string, string][] = [
  ['Obst & Gemüse', 'apfel banane orange beere karotte brokkoli spinat salat gemüse tomat kartoffel zwiebel knoblauch avocado zitrone gurke paprika'],
  ['Fleisch & Fisch', 'hähnchen huhn puten steak hack lachs fisch thunfisch tofu'],
  ['Milchprodukte', 'milch joghurt quark skyr käse butter sahne ei eier'],
  ['Backwaren', 'brot toast brötchen haferflocken müsli nudel pasta reis'],
  ['Getränke', 'wasser saft kaffee tee limonade'],
]

export function getTodayGermanWeekday(): string {
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
  return days[new Date().getDay()]
}

export function getMealPlanProgress(mealPlan: MealPlanDay[]): { filled: number; total: number; percent: number } {
  const total = mealPlan.length * MEAL_SLOTS.length
  const filled = mealPlan.reduce((sum, day) =>
    sum + MEAL_SLOTS.filter(s => (day[s.key] ?? '').trim().length > 0).length, 0)
  return { filled, total, percent: total > 0 ? Math.round((filled / total) * 100) : 0 }
}

export function categorizeGroceryItem(name: string): string {
  const lower = name.toLowerCase()
  for (const [cat, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.split(' ').some(kw => lower.includes(kw))) return cat
  }
  return 'Sonstiges'
}

export function parseIngredientsFromText(text: string): string[] {
  if (!text.trim()) return []
  return text
    .split(/[,;+&/]|\n| und /i)
    .map(p => p.trim().replace(/^\d+\s*(g|kg|ml|l|stk|x)?\s*/i, ''))
    .filter(p => p.length > 2 && !/^(mit|und|oder|auf)$/i.test(p))
}

export function extractGroceryFromMealPlan(
  mealPlan: MealPlanDay[],
  existing: GroceryItem[],
  recipes: Recipe[] = [],
): Omit<GroceryItem, 'id' | 'checked'>[] {
  const seen = new Set(existing.map(g => g.name.toLowerCase()))
  const items: Omit<GroceryItem, 'id' | 'checked'>[] = []
  const recipeById = new Map(recipes.map(r => [r.id, r]))

  const addIngredient = (raw: string) => {
    const key = raw.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    items.push({
      name: raw.charAt(0).toUpperCase() + raw.slice(1),
      quantity: '1',
      category: categorizeGroceryItem(raw),
    })
  }

  for (const day of mealPlan) {
    for (const slot of MEAL_SLOTS) {
      const linkedId = day.linkedRecipes?.[slot.key]
      const linked = linkedId ? recipeById.get(linkedId) : undefined
      const texts = linked
        ? [linked.ingredients]
        : [day[slot.key]]
      for (const text of texts) {
        for (const ing of parseIngredientsFromText(text)) addIngredient(ing)
      }
    }
  }
  return items
}

export function formatGroceryListText(items: GroceryItem[]): string {
  const open = items.filter(g => !g.checked)
  if (open.length === 0) return 'Einkaufsliste ist leer.'
  const byCat = GROCERY_CATEGORIES.map(cat => ({
    cat,
    items: open.filter(g => g.category === cat),
  })).filter(g => g.items.length > 0)

  return byCat
    .map(({ cat, items: list }) =>
      `${cat}:\n${list.map(i => `  ☐ ${i.name}${i.quantity ? ` (${i.quantity})` : ''}`).join('\n')}`,
    )
    .join('\n\n')
}

export function getPreviousWeekday(day: string): string | null {
  const order = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
  const idx = order.indexOf(day)
  return idx > 0 ? order[idx - 1]! : null
}

export function copyMealsFromDay(
  mealPlan: MealPlanDay[],
  fromDay: string,
  toDay: string,
  slots: (typeof MEAL_SLOTS)[number]['key'][] = ['breakfast', 'lunch', 'dinner', 'snacks'],
): MealPlanDay[] {
  const source = mealPlan.find(d => d.day === fromDay)
  if (!source) return mealPlan
  return mealPlan.map(d =>
    d.day === toDay
      ? {
          ...d,
          ...Object.fromEntries(slots.map(k => [k, source[k]])),
          linkedRecipes: source.linkedRecipes
            ? { ...source.linkedRecipes }
            : undefined,
        }
      : d,
  ) as MealPlanDay[]
}

export function getTodayMeals(data: AppData): MealPlanDay | undefined {
  return data.mealPlan.find(d => d.day === getTodayGermanWeekday())
}

export function getGroceryStats(items: GroceryItem[]): {
  open: number
  done: number
  total: number
  percent: number
} {
  const done = items.filter(g => g.checked).length
  const total = items.length
  return {
    open: total - done,
    done,
    total,
    percent: total > 0 ? Math.round((done / total) * 100) : 0,
  }
}