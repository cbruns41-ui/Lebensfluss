import type { AppData, BudgetCategory, MealPlanDay, Recipe } from '../types'
import { MEAL_SLOTS } from './meals'
import { getGroceryStats } from './meals'

export interface WeeklyMealCostSummary {
  estimatedTotal: number
  slotsWithCost: number
  plannedSlots: number
  mealPlanPercent: number
}

export function computeWeeklyMealCosts(
  mealPlan: MealPlanDay[],
  recipes: Recipe[],
): WeeklyMealCostSummary {
  const recipeById = new Map(recipes.map(r => [r.id, r]))
  const titleToRecipe = new Map(recipes.map(r => [r.title.toLowerCase(), r]))
  let estimatedTotal = 0
  let slotsWithCost = 0
  let plannedSlots = 0

  for (const day of mealPlan) {
    for (const slot of MEAL_SLOTS) {
      const text = (day[slot.key] ?? '').trim()
      if (!text) continue
      plannedSlots++
      const linkedId = day.linkedRecipes?.[slot.key]
      const recipe = linkedId
        ? recipeById.get(linkedId)
        : titleToRecipe.get(text.toLowerCase())
      if (recipe?.estimatedCost != null && recipe.estimatedCost > 0) {
        estimatedTotal += recipe.estimatedCost
        slotsWithCost++
      }
    }
  }

  const totalSlots = mealPlan.length * MEAL_SLOTS.length
  return {
    estimatedTotal,
    slotsWithCost,
    plannedSlots,
    mealPlanPercent: totalSlots > 0 ? Math.round((plannedSlots / totalSlots) * 100) : 0,
  }
}

export function findFoodCategory(categories: BudgetCategory[]): BudgetCategory | undefined {
  return categories.find(c => /lebensmittel|essen|food|einkauf|mahlzeit/i.test(c.name))
    ?? categories.find(c => c.name.toLowerCase().includes('freizeit'))
    ?? categories[0]
}

export function getMealBudgetInsight(data: AppData): string | null {
  const costs = computeWeeklyMealCosts(data.mealPlan, data.recipes)
  if (costs.estimatedTotal <= 0) return null

  const foodCat = findFoodCategory(data.budgetCategories)
  if (!foodCat) {
    return `Dein Wochenplan kostet ca. ${costs.estimatedTotal.toFixed(2).replace('.', ',')} € (geschätzt).`
  }

  const monthKey = new Date().toISOString().slice(0, 7)
  const spent = data.transactions
    .filter(t => t.type === 'expense' && t.categoryId === foodCat.id && t.date.startsWith(monthKey))
    .reduce((s, t) => s + t.amount, 0)
  const remaining = foodCat.limit - spent

  if (remaining < costs.estimatedTotal) {
    return `Wochenplan ~${costs.estimatedTotal.toFixed(0)} € — in „${foodCat.name}" nur noch ${Math.max(0, remaining).toFixed(0)} € frei.`
  }
  return `Wochenplan ~${costs.estimatedTotal.toFixed(0)} € passt ins „${foodCat.name}"-Budget (${remaining.toFixed(0)} € übrig).`
}

export function getGroceryBudgetSummary(data: AppData): {
  openItems: number
  totalItems: number
  groceryPercent: number
} {
  const stats = getGroceryStats(data.groceryList)
  return {
    openItems: stats.open,
    totalItems: stats.total,
    groceryPercent: stats.percent,
  }
}