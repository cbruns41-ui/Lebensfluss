import type { GroceryItem, MealPlanDay, MealSlotKey, Recipe, RecipeCategory } from '../types'
import { categorizeGroceryItem, parseIngredientsFromText } from './meals'
import { generateId, getFullWeekDays } from './utils'

export const RECIPE_CATEGORY_LABELS: Record<RecipeCategory, string> = {
  breakfast: 'Frühstück',
  lunch: 'Mittag',
  dinner: 'Abend',
  snacks: 'Snacks',
}

export const RECIPE_CATEGORY_EMOJI: Record<RecipeCategory, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍎',
}

export const starterRecipes: Omit<Recipe, 'id' | 'createdAt'>[] = [
  {
    title: 'Haferflocken-Porridge',
    category: 'breakfast',
    ingredients: 'Haferflocken\nMilch\nBanane\nHonig\nZimt',
    instructions: 'Haferflocken mit Milch 5 Min. köcheln. Mit Banane und Honig servieren.',
    portions: 1,
    cookTimeMin: 10,
  },
  {
    title: 'Hähnchen-Buddha-Bowl',
    category: 'lunch',
    ingredients: 'Hähnchenbrust\nReis\nBrokkoli\nAvocado\nSojasauce',
    instructions: 'Reis kochen, Hähnchen anbraten, Brokkoli dämpfen. Alles in einer Schüssel anrichten.',
    portions: 2,
    cookTimeMin: 35,
  },
  {
    title: 'Linsencurry',
    category: 'dinner',
    ingredients: 'Rote Linsen\nKokosmilch\nZwiebel\nCurrypaste\nReis',
    instructions: 'Zwiebel anbraten, Currypaste kurz rösten, Linsen und Kokosmilch 20 Min. köcheln.',
    portions: 4,
    cookTimeMin: 30,
  },
]

export function createStarterRecipes(): Recipe[] {
  const now = new Date().toISOString()
  return starterRecipes.map(r => ({ ...r, id: generateId(), createdAt: now }))
}

export function applyRecipeToMealPlan(
  mealPlan: MealPlanDay[],
  recipe: Recipe,
  dayName: string,
  slot: MealSlotKey = recipe.category,
): MealPlanDay[] {
  return mealPlan.map(d =>
    d.day === dayName
      ? {
          ...d,
          [slot]: recipe.title,
          linkedRecipes: { ...d.linkedRecipes, [slot]: recipe.id },
        }
      : d,
  )
}

export function clearLinkedRecipe(
  mealPlan: MealPlanDay[],
  dayName: string,
  slot: MealSlotKey,
): MealPlanDay[] {
  return mealPlan.map(d => {
    if (d.day !== dayName) return d
    const linked = { ...d.linkedRecipes }
    delete linked[slot]
    return { ...d, linkedRecipes: Object.keys(linked).length ? linked : undefined }
  })
}

export function extractGroceryFromRecipe(
  recipe: Recipe,
  existing: GroceryItem[],
): Omit<GroceryItem, 'id' | 'checked'>[] {
  const seen = new Set(existing.map(g => g.name.toLowerCase()))
  const items: Omit<GroceryItem, 'id' | 'checked'>[] = []

  for (const ing of parseIngredientsFromText(recipe.ingredients)) {
    const key = ing.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    items.push({
      name: ing.charAt(0).toUpperCase() + ing.slice(1),
      quantity: '1',
      category: categorizeGroceryItem(ing),
    })
  }
  return items
}

export function formatRecipeMeta(recipe: Recipe): string {
  const parts: string[] = [RECIPE_CATEGORY_LABELS[recipe.category]]
  if (recipe.cookTimeMin) parts.push(`${recipe.cookTimeMin} Min.`)
  if (recipe.portions) parts.push(`${recipe.portions} Port.`)
  if (recipe.estimatedCost != null && recipe.estimatedCost > 0) {
    parts.push(`~${recipe.estimatedCost.toFixed(2).replace('.', ',')} €`)
  }
  return parts.join(' · ')
}

export function countRecipeIngredients(recipe: Recipe): number {
  return parseIngredientsFromText(recipe.ingredients).length
}

export const WEEK_DAY_OPTIONS = getFullWeekDays()