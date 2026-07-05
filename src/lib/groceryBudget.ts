import type { AppData, Transaction } from '../types'
import { computeWeeklyMealCosts, findFoodCategory } from './mealBudget'
import { generateId, toDateKey } from './utils'

export function suggestGroceryTripAmount(data: AppData): number {
  const itemPrices = data.groceryList
    .filter(g => g.estimatedPrice != null && g.estimatedPrice > 0)
    .reduce((s, g) => s + (g.estimatedPrice ?? 0), 0)
  if (itemPrices > 0) return Math.round(itemPrices * 100) / 100

  const meal = computeWeeklyMealCosts(data.mealPlan, data.recipes)
  if (meal.estimatedTotal > 0) return meal.estimatedTotal

  const foodCat = findFoodCategory(data.budgetCategories)
  if (foodCat && foodCat.limit > 0) {
    return Math.round((foodCat.limit / 4) * 100) / 100
  }
  return 0
}

export function bookGroceryTrip(data: AppData, amount: number): AppData {
  if (amount <= 0) return data
  const category = findFoodCategory(data.budgetCategories)
  if (!category) return data

  let transactions = data.transactions
  if (data.groceryLastTripTransactionId) {
    transactions = transactions.filter(t => t.id !== data.groceryLastTripTransactionId)
  }

  const txId = generateId()
  const tx: Transaction = {
    id: txId,
    categoryId: category.id,
    amount: Math.round(amount * 100) / 100,
    note: 'Wocheneinkauf (Einkaufsliste)',
    date: toDateKey(new Date()),
    type: 'expense',
  }

  return {
    ...data,
    transactions: [tx, ...transactions],
    groceryLastTripTransactionId: txId,
  }
}

export function removeGroceryTripBooking(data: AppData): AppData {
  if (!data.groceryLastTripTransactionId) return data
  return {
    ...data,
    transactions: data.transactions.filter(t => t.id !== data.groceryLastTripTransactionId),
    groceryLastTripTransactionId: undefined,
  }
}

export function isGroceryTripComplete(data: AppData): boolean {
  return data.groceryList.length > 0 && data.groceryList.every(g => g.checked)
}