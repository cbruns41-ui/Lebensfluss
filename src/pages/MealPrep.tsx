import { useState, useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import {
  Plus, Trash2, Check, ShoppingCart, ChefHat, Wand2, Pencil,
  Copy, Share2, Sun, CalendarDays, Info, ChevronRight, BookOpen, CalendarPlus, Store, Wallet,
} from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useConfirm } from '../hooks/useConfirm'
import { generateId, GROCERY_CATEGORIES, cn, formatCurrency } from '../lib/utils'
import { bookGroceryTrip, suggestGroceryTripAmount, isGroceryTripComplete } from '../lib/groceryBudget'
import { mealWeekTemplates } from '../lib/mealWeekTemplates'
import {
  MEAL_SLOTS, MEAL_QUICK_SUGGESTIONS, GROCERY_STAPLES,
  getTodayGermanWeekday, getMealPlanProgress, extractGroceryFromMealPlan,
  formatGroceryListText, getPreviousWeekday, copyMealsFromDay, getGroceryStats,
} from '../lib/meals'
import {
  RECIPE_CATEGORY_LABELS, RECIPE_CATEGORY_EMOJI, WEEK_DAY_OPTIONS,
  applyRecipeToMealPlan, extractGroceryFromRecipe, formatRecipeMeta,
  countRecipeIngredients, createStarterRecipes,
} from '../lib/recipes'
import type { GroceryItem, MealSlotKey, Recipe, RecipeCategory } from '../types'

type Tab = 'today' | 'plan' | 'recipes' | 'grocery'

export function MealPrep() {
  const { data, updateData } = useData()
  const { confirm, cancel, opts } = useConfirm()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isGroceryRoute = location.pathname.endsWith('/einkauf')
  const [tab, setTab] = useState<Tab>(isGroceryRoute ? 'grocery' : 'today')
  const [shopMode, setShopMode] = useState(false)
  const [showDoneItems, setShowDoneItems] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [groceryModal, setGroceryModal] = useState(false)
  const [editingGroceryId, setEditingGroceryId] = useState<string | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('')
  const [itemCategory, setItemCategory] = useState(GROCERY_CATEGORIES[0])
  const [itemPrice, setItemPrice] = useState('')
  const [tripModalOpen, setTripModalOpen] = useState(false)
  const [tripAmount, setTripAmount] = useState('')
  const [toast, setToast] = useState('')
  const [showGuide, setShowGuide] = useState(true)
  const [recipeModal, setRecipeModal] = useState(false)
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null)
  const [recipeTitle, setRecipeTitle] = useState('')
  const [recipeCategory, setRecipeCategory] = useState<RecipeCategory>('lunch')
  const [recipeIngredients, setRecipeIngredients] = useState('')
  const [recipeInstructions, setRecipeInstructions] = useState('')
  const [recipePortions, setRecipePortions] = useState('')
  const [recipeCookTime, setRecipeCookTime] = useState('')
  const [recipeEstimatedCost, setRecipeEstimatedCost] = useState('')
  const [recipeFilter, setRecipeFilter] = useState<RecipeCategory | 'all'>('all')
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null)
  const [planModal, setPlanModal] = useState(false)
  const [planRecipeId, setPlanRecipeId] = useState<string | null>(null)
  const [planDay, setPlanDay] = useState('')
  const [planSlot, setPlanSlot] = useState<MealSlotKey>('lunch')

  const todayName = getTodayGermanWeekday()
  const todayMeals = data.mealPlan.find(d => d.day === todayName)
  const progress = getMealPlanProgress(data.mealPlan)
  const unchecked = data.groceryList.filter(g => !g.checked).length
  const groceryStats = getGroceryStats(data.groceryList)

  useEffect(() => {
    if (isGroceryRoute || searchParams.get('einkauf') === '1') setTab('grocery')
    if (searchParams.get('shop') === '1') setShopMode(true)
  }, [isGroceryRoute, searchParams])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const updateMeal = (day: string, slot: MealSlotKey, value: string) => {
    updateData(prev => ({
      ...prev,
      mealPlan: prev.mealPlan.map(d => {
        if (d.day !== day) return d
        const linked = { ...d.linkedRecipes }
        delete linked[slot]
        return {
          ...d,
          [slot]: value,
          linkedRecipes: Object.keys(linked).length ? linked : undefined,
        }
      }),
    }))
  }

  const openGroceryCreate = () => {
    setEditingGroceryId(null)
    setItemName('')
    setItemQty('')
    setItemCategory(GROCERY_CATEGORIES[0])
    setItemPrice('')
    setGroceryModal(true)
  }

  const openGroceryEdit = (item: GroceryItem) => {
    setEditingGroceryId(item.id)
    setItemName(item.name)
    setItemQty(item.quantity)
    setItemCategory(item.category)
    setItemPrice(item.estimatedPrice != null ? String(item.estimatedPrice) : '')
    setGroceryModal(true)
  }

  const openTripBooking = (snapshot?: typeof data) => {
    const d = snapshot ?? data
    setTripAmount(String(suggestGroceryTripAmount(d) || ''))
    setTripModalOpen(true)
  }

  const confirmTripBooking = () => {
    const amount = parseFloat(tripAmount.replace(',', '.'))
    if (!amount || amount <= 0) return
    updateData(prev => bookGroceryTrip(prev, amount))
    setTripModalOpen(false)
    showToast(`${formatCurrency(amount)} im Budget erfasst.`)
  }

  const saveGrocery = () => {
    if (!itemName.trim()) return
    const item: GroceryItem = {
      id: editingGroceryId ?? generateId(),
      name: itemName.trim(),
      quantity: itemQty.trim() || '1',
      checked: false,
      category: itemCategory,
      estimatedPrice: parseFloat(itemPrice.replace(',', '.')) || undefined,
    }
    if (editingGroceryId) {
      updateData(prev => ({
        ...prev,
        groceryList: prev.groceryList.map(g =>
          g.id === editingGroceryId ? { ...g, ...item, checked: g.checked } : g,
        ),
      }))
    } else {
      updateData(prev => ({ ...prev, groceryList: [...prev.groceryList, item] }))
    }
    setGroceryModal(false)
  }

  const toggleGrocery = (id: string) => {
    updateData(prev => {
      const next = {
        ...prev,
        groceryList: prev.groceryList.map(g => g.id === id ? { ...g, checked: !g.checked } : g),
      }
      const wasComplete = isGroceryTripComplete(prev)
      const nowComplete = isGroceryTripComplete(next)
      if (!wasComplete && nowComplete && next.settings.groceryBookToBudget && !next.groceryLastTripTransactionId) {
        setTimeout(() => openTripBooking(next), 300)
      }
      return next
    })
    if (shopMode && 'vibrate' in navigator) navigator.vibrate(30)
  }

  const deleteGrocery = (id: string) => {
    confirm({
      title: 'Artikel löschen?',
      message: 'Der Artikel wird von der Liste entfernt.',
      onConfirm: () => updateData(prev => ({
        ...prev,
        groceryList: prev.groceryList.filter(g => g.id !== id),
      })),
    })
  }

  const clearChecked = () => {
    confirm({
      title: 'Erledigte entfernen?',
      message: 'Alle abgehakten Artikel werden gelöscht.',
      onConfirm: () => updateData(prev => ({
        ...prev,
        groceryList: prev.groceryList.filter(g => !g.checked),
        groceryLastTripTransactionId: undefined,
      })),
    })
  }

  const generateFromPlan = () => {
    const newItems = extractGroceryFromMealPlan(data.mealPlan, data.groceryList, data.recipes)
    if (newItems.length === 0) {
      showToast('Keine neuen Zutaten gefunden. Trage Mahlzeiten kommagetrennt ein, z. B. „Reis, Brokkoli, Hähnchen".')
      return
    }
    updateData(prev => ({
      ...prev,
      groceryList: [
        ...prev.groceryList,
        ...newItems.map(i => ({ ...i, id: generateId(), checked: false })),
      ],
    }))
    setTab('grocery')
    showToast(`${newItems.length} Zutaten zur Einkaufsliste hinzugefügt.`)
  }

  const applyWeekTemplate = (index: number) => {
    const tpl = mealWeekTemplates[index]
    if (!tpl) return
    confirm({
      title: `Vorlage „${tpl.name}"?`,
      message: 'Der aktuelle Wochenplan wird ersetzt. Die Einkaufsliste bleibt unverändert.',
      onConfirm: () => {
        updateData(prev => ({
          ...prev,
          mealPlan: tpl.plan.map((d, i) => ({
            ...prev.mealPlan[i],
            ...d,
            day: prev.mealPlan[i]?.day ?? d.day,
          })),
        }))
        showToast(`Wochenplan „${tpl.name}" übernommen.`)
      },
    })
  }

  const copyFromPrevious = (day: string) => {
    const prev = getPreviousWeekday(day)
    if (!prev) return
    updateData(p => ({ ...p, mealPlan: copyMealsFromDay(p.mealPlan, prev, day) }))
    showToast(`Mahlzeiten von ${prev} übernommen.`)
  }

  const addStaple = (staple: typeof GROCERY_STAPLES[0]) => {
    const exists = data.groceryList.some(g => g.name.toLowerCase() === staple.name.toLowerCase())
    if (exists) {
      showToast(`${staple.name} ist schon auf der Liste.`)
      return
    }
    updateData(prev => ({
      ...prev,
      groceryList: [...prev.groceryList, { id: generateId(), ...staple, checked: false }],
    }))
  }

  const shareGroceryList = async () => {
    const text = formatGroceryListText(data.groceryList)
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Einkaufsliste', text })
      } else {
        await navigator.clipboard.writeText(text)
        showToast('Liste in Zwischenablage kopiert.')
      }
    } catch {
      showToast('Teilen abgebrochen.')
    }
  }

  const openRecipeCreate = () => {
    setEditingRecipeId(null)
    setRecipeTitle('')
    setRecipeCategory('lunch')
    setRecipeIngredients('')
    setRecipeInstructions('')
    setRecipePortions('')
    setRecipeCookTime('')
    setRecipeEstimatedCost('')
    setRecipeModal(true)
  }

  const openRecipeEdit = (recipe: Recipe) => {
    setEditingRecipeId(recipe.id)
    setRecipeTitle(recipe.title)
    setRecipeCategory(recipe.category)
    setRecipeIngredients(recipe.ingredients)
    setRecipeInstructions(recipe.instructions ?? '')
    setRecipePortions(recipe.portions ? String(recipe.portions) : '')
    setRecipeCookTime(recipe.cookTimeMin ? String(recipe.cookTimeMin) : '')
    setRecipeEstimatedCost(recipe.estimatedCost != null ? String(recipe.estimatedCost) : '')
    setRecipeModal(true)
  }

  const saveRecipe = () => {
    if (!recipeTitle.trim() || !recipeIngredients.trim()) return
    const recipe: Recipe = {
      id: editingRecipeId ?? generateId(),
      title: recipeTitle.trim(),
      category: recipeCategory,
      ingredients: recipeIngredients.trim(),
      instructions: recipeInstructions.trim() || undefined,
      portions: parseInt(recipePortions, 10) || undefined,
      cookTimeMin: parseInt(recipeCookTime, 10) || undefined,
      estimatedCost: parseFloat(recipeEstimatedCost.replace(',', '.')) || undefined,
      createdAt: editingRecipeId
        ? data.recipes.find(r => r.id === editingRecipeId)!.createdAt
        : new Date().toISOString(),
    }
    updateData(prev => ({
      ...prev,
      recipes: editingRecipeId
        ? prev.recipes.map(r => r.id === editingRecipeId ? recipe : r)
        : [recipe, ...prev.recipes],
    }))
    setRecipeModal(false)
    showToast(editingRecipeId ? 'Rezept gespeichert.' : 'Rezept angelegt.')
  }

  const deleteRecipe = (id: string) => {
    confirm({
      title: 'Rezept löschen?',
      message: 'Das Rezept wird entfernt. Verknüpfungen im Wochenplan bleiben als Text.',
      onConfirm: () => updateData(prev => ({
        ...prev,
        recipes: prev.recipes.filter(r => r.id !== id),
        mealPlan: prev.mealPlan.map(d => {
          if (!d.linkedRecipes) return d
          const linked = { ...d.linkedRecipes }
          for (const [slot, rid] of Object.entries(linked)) {
            if (rid === id) delete linked[slot as MealSlotKey]
          }
          return { ...d, linkedRecipes: Object.keys(linked).length ? linked : undefined }
        }),
      })),
    })
  }

  const planRecipe = (recipe: Recipe, day: string, slot: MealSlotKey) => {
    updateData(prev => ({
      ...prev,
      mealPlan: applyRecipeToMealPlan(prev.mealPlan, recipe, day, slot),
    }))
    showToast(`„${recipe.title}" für ${day} geplant.`)
    setPlanModal(false)
  }

  const planRecipeToday = (recipe: Recipe) => {
    planRecipe(recipe, todayName, recipe.category)
  }

  const openPlanModal = (recipe: Recipe) => {
    setPlanRecipeId(recipe.id)
    setPlanDay(todayName)
    setPlanSlot(recipe.category)
    setPlanModal(true)
  }

  const addRecipeGroceries = (recipe: Recipe) => {
    const newItems = extractGroceryFromRecipe(recipe, data.groceryList)
    if (newItems.length === 0) {
      showToast('Alle Zutaten sind schon auf der Liste.')
      return
    }
    updateData(prev => ({
      ...prev,
      groceryList: [...prev.groceryList, ...newItems.map(i => ({ ...i, id: generateId(), checked: false }))],
    }))
    setTab('grocery')
    showToast(`${newItems.length} Zutaten von „${recipe.title}" hinzugefügt.`)
  }

  const importStarterRecipes = () => {
    const existing = new Set(data.recipes.map(r => r.title.toLowerCase()))
    const toAdd = createStarterRecipes().filter(r => !existing.has(r.title.toLowerCase()))
    if (toAdd.length === 0) {
      showToast('Beispiel-Rezepte sind bereits vorhanden.')
      return
    }
    updateData(prev => ({ ...prev, recipes: [...toAdd, ...prev.recipes] }))
    showToast(`${toAdd.length} Beispiel-Rezepte hinzugefügt.`)
  }

  const filteredRecipes = data.recipes.filter(r => recipeFilter === 'all' || r.category === recipeFilter)
  const planRecipeObj = planRecipeId ? data.recipes.find(r => r.id === planRecipeId) : null

  const visibleGrocery = shopMode && !showDoneItems
    ? data.groceryList.filter(g => !g.checked)
    : data.groceryList

  const groupedGrocery = GROCERY_CATEGORIES
    .map(cat => ({ category: cat, items: visibleGrocery.filter(g => g.category === cat) }))
    .filter(g => g.items.length > 0)

  const tabs = [
    { id: 'today' as Tab, label: 'Heute', icon: Sun },
    { id: 'plan' as Tab, label: 'Woche', icon: CalendarDays },
    { id: 'recipes' as Tab, label: 'Rezepte', icon: BookOpen },
    { id: 'grocery' as Tab, label: `Einkauf (${unchecked})`, icon: ShoppingCart },
  ]

  return (
    <div className="px-5 pt-6 safe-top max-w-lg mx-auto pb-8">
      <PageHeader
        title={isGroceryRoute ? 'Einkaufsliste' : 'Meal Prep'}
        subtitle={isGroceryRoute ? 'Aus Wochenplan & Rezepten' : 'Planen → Einkaufen → Kochen'}
        helpId={isGroceryRoute ? 'einkauf' : 'essen'}
        actions={
          tab === 'grocery'
            ? <Button size="sm" onClick={openGroceryCreate}><Plus size={16} /> Artikel</Button>
            : tab === 'recipes'
              ? <Button size="sm" onClick={openRecipeCreate}><Plus size={16} /> Rezept</Button>
              : tab === 'plan'
                ? <Button size="sm" variant="secondary" onClick={generateFromPlan}><Wand2 size={14} /> → Liste</Button>
                : undefined
        } />

      {toast && (
        <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-xl px-3 py-2 mb-4">{toast}</p>
      )}

      {isGroceryRoute && (
        <Card className="mb-4 py-2.5 px-4 border-purple-500/15">
          <p className="text-xs text-muted">
            <Link to="/app/essen" className="text-purple-400 hover:text-purple-300">Meal Prep</Link>
            {' '}· Wochenplan {progress.percent}% ·{' '}
            <Link to="/app/finanzen" className="text-blue-400 hover:text-blue-300">Budget</Link>
          </p>
        </Card>
      )}

      {!isGroceryRoute && (
      <Card className="mb-4 py-3">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>Wochenplan</span>
          <span>{progress.filled}/{progress.total} Mahlzeiten · {progress.percent}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
      </Card>
      )}

      <div className="flex gap-1.5 mb-4 glass rounded-xl p-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex-1 min-w-[4.5rem] flex items-center justify-center gap-1 py-2.5 rounded-lg text-[11px] font-medium shrink-0',
              tab === id ? 'bg-emerald-500 text-white' : 'text-muted',
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {showGuide && progress.percent < 20 && (
        <Card className="mb-4 border-cyan-500/20 bg-cyan-500/5">
          <div className="flex gap-3">
            <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs text-muted leading-relaxed">
              <p className="font-medium text-slate-200 mb-1">So funktioniert Meal Prep</p>
              <p><strong className="text-slate-300">1.</strong> Rezepte anlegen oder aus dem Rezeptbuch wählen</p>
              <p><strong className="text-slate-300">2.</strong> In den Wochenplan einfügen → Einkaufsliste generieren</p>
              <p><strong className="text-slate-300">3.</strong> Beim Einkauf abhaken & teilen</p>
            </div>
            <button onClick={() => setShowGuide(false)} className="text-faint text-xs hover:text-muted">✕</button>
          </div>
        </Card>
      )}

      {tab === 'today' && (
        <div className="space-y-3">
          <Card className="glow-accent">
            <p className="text-xs text-emerald-400 font-medium mb-1">{todayName}</p>
            <h2 className="text-lg font-bold mb-4">Was steht heute an?</h2>
            {todayMeals ? (
              <div className="space-y-3">
                {MEAL_SLOTS.map(({ key, label, emoji }) => (
                  <div key={key}>
                    <label className="text-xs text-muted mb-1 block">{emoji} {label}</label>
                    <input
                      value={todayMeals[key]}
                      onChange={e => updateMeal(todayName, key, e.target.value)}
                      placeholder={`${label} planen…`}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm focus:outline-none focus:border-emerald-500/50"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {data.recipes.filter(r => r.category === key).slice(0, 2).map(r => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => planRecipe(r, todayName, key)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        >
                          📖 {r.title}
                        </button>
                      ))}
                      {MEAL_QUICK_SUGGESTIONS[key].filter(Boolean).slice(0, 3).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateMeal(todayName, key, todayMeals[key] ? `${todayMeals[key]}, ${s}` : s)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-muted hover:text-emerald-400"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Kein Eintrag für heute.</p>
            )}
          </Card>
          <button
            onClick={() => { setTab('plan'); setExpandedDay(todayName) }}
            className="w-full flex items-center justify-center gap-2 text-sm text-muted hover:text-emerald-400 py-2"
          >
            Ganze Woche bearbeiten <ChevronRight size={16} />
          </button>
        </div>
      )}

      {tab === 'plan' && (
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 mb-3">
            {data.mealPlan.map(day => {
              const filled = MEAL_SLOTS.filter(s => (day[s.key] ?? '').trim()).length
              const isToday = day.day === todayName
              return (
                <button
                  key={day.day}
                  onClick={() => { setExpandedDay(day.day); setTab('plan') }}
                  className={cn(
                    'rounded-lg py-2 text-center text-[10px] border transition-colors',
                    isToday ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-800/40',
                    expandedDay === day.day && 'ring-1 ring-emerald-500/40',
                  )}
                >
                  <p className="font-medium truncate px-0.5">{day.day.slice(0, 2)}</p>
                  <p className={cn('mt-0.5', filled >= 3 ? 'text-emerald-400' : filled > 0 ? 'text-amber-400' : 'text-faint')}>
                    {filled}/4
                  </p>
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {mealWeekTemplates.map((t, i) => (
              <Button key={t.name} size="sm" variant="ghost" onClick={() => applyWeekTemplate(i)}>
                {i === 0 ? '🥗' : i === 1 ? '💪' : '💶'} {t.name}
              </Button>
            ))}
          </div>

          {data.mealPlan.map(day => (
            <Card key={day.day} className={day.day === todayName ? 'border-emerald-500/25' : ''}>
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full flex justify-between items-center"
              >
                <span className="font-medium">
                  {day.day}
                  {day.day === todayName && <span className="text-xs text-emerald-400 ml-2">Heute</span>}
                </span>
                <span className="text-xs text-muted">
                  {MEAL_SLOTS.filter(s => (day[s.key] ?? '').trim()).length}/4
                </span>
              </button>
              {expandedDay === day.day && (
                <div className="mt-4 space-y-3 border-t border-slate-700/50 pt-4">
                  {getPreviousWeekday(day.day) && (
                    <button
                      onClick={() => copyFromPrevious(day.day)}
                      className="flex items-center gap-1.5 text-xs text-muted hover:text-emerald-400"
                    >
                      <Copy size={12} /> Von {getPreviousWeekday(day.day)} übernehmen
                    </button>
                  )}
                  {MEAL_SLOTS.map(({ key, label, emoji }) => (
                    <div key={key}>
                      <label className="text-xs text-muted mb-1 block">{emoji} {label}</label>
                      <input
                        value={day[key]}
                        onChange={e => updateMeal(day.day, key, e.target.value)}
                        placeholder="z. B. Reis, Brokkoli, Hähnchen"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm focus:outline-none focus:border-emerald-500/50"
                      />
                      <div className="flex flex-wrap gap-1 mt-1">
                        {MEAL_QUICK_SUGGESTIONS[key].filter(Boolean).slice(0, 3).map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateMeal(day.day, key, day[key] ? `${day[key]}, ${s}` : s)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-muted hover:text-emerald-400"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {expandedDay !== day.day && (day.breakfast || day.lunch || day.dinner) && (
                <p className="text-xs text-faint mt-2 truncate">
                  {[day.breakfast, day.lunch, day.dinner].filter(Boolean).join(' · ')}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === 'recipes' && (
        <div>
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            <button onClick={() => setRecipeFilter('all')} className={cn('px-3 py-1.5 rounded-xl text-xs shrink-0', recipeFilter === 'all' ? 'bg-emerald-500 text-white' : 'glass')}>Alle</button>
            {(Object.keys(RECIPE_CATEGORY_LABELS) as RecipeCategory[]).map(cat => (
              <button key={cat} onClick={() => setRecipeFilter(cat)} className={cn('px-3 py-1.5 rounded-xl text-xs shrink-0', recipeFilter === cat ? 'bg-emerald-500 text-white' : 'glass')}>
                {RECIPE_CATEGORY_EMOJI[cat]} {RECIPE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {data.recipes.length === 0 ? (
            <Card className="text-center py-10">
              <BookOpen size={36} className="mx-auto text-faint mb-3" />
              <p className="text-sm text-muted mb-4">Dein persönliches Rezeptbuch — einmal anlegen, immer wieder nutzen.</p>
              <div className="flex flex-col gap-2">
                <Button onClick={openRecipeCreate}><Plus size={16} /> Erstes Rezept</Button>
                <Button variant="secondary" onClick={importStarterRecipes}>Beispiel-Rezepte laden</Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRecipes.length === 0 && (
                <Card className="text-center py-6 text-sm text-muted">Keine Rezepte in dieser Kategorie.</Card>
              )}
              {filteredRecipes.map(recipe => (
                <Card key={recipe.id}>
                  <button
                    className="w-full text-left"
                    onClick={() => setExpandedRecipeId(expandedRecipeId === recipe.id ? null : recipe.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{RECIPE_CATEGORY_EMOJI[recipe.category]} {recipe.title}</p>
                        <p className="text-xs text-muted mt-0.5">{formatRecipeMeta(recipe)} · {countRecipeIngredients(recipe)} Zutaten</p>
                      </div>
                      <ChevronRight size={16} className={cn('text-faint shrink-0 transition-transform', expandedRecipeId === recipe.id && 'rotate-90')} />
                    </div>
                  </button>

                  {expandedRecipeId === recipe.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 text-sm space-y-3">
                      <div>
                        <p className="text-xs text-faint uppercase mb-1">Zutaten</p>
                        <p className="text-muted whitespace-pre-wrap leading-relaxed">{recipe.ingredients}</p>
                      </div>
                      {recipe.instructions && (
                        <div>
                          <p className="text-xs text-faint uppercase mb-1">Zubereitung</p>
                          <p className="text-muted leading-relaxed">{recipe.instructions}</p>
                        </div>
                      )}
                      {recipe.estimatedCost != null && recipe.estimatedCost > 0 && (
                        <Link to="/app/finanzen" className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                          ~{recipe.estimatedCost.toFixed(2).replace('.', ',')} € — im Budget planen →
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Button size="sm" variant="secondary" onClick={() => planRecipeToday(recipe)}>Heute</Button>
                    <Button size="sm" variant="ghost" onClick={() => openPlanModal(recipe)}>
                      <CalendarPlus size={14} /> Tag
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => addRecipeGroceries(recipe)}>
                      <ShoppingCart size={14} /> Zutaten
                    </Button>
                    <button onClick={() => openRecipeEdit(recipe)} className="p-2 text-faint hover:text-emerald-400"><Pencil size={14} /></button>
                    <button onClick={() => deleteRecipe(recipe.id)} className="p-2 text-faint hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'grocery' && !isGroceryRoute && (
        <Card className="mb-4 py-2.5 px-4 border-purple-500/15">
          <p className="text-xs text-muted">
            Tipp: Die Einkaufsliste hat eine{' '}
            <Link to="/app/einkauf" className="text-purple-400 hover:text-purple-300">eigene Seite</Link>
            {' '}in der unteren Navigation — ideal für unterwegs.
          </p>
        </Card>
      )}

      {tab === 'grocery' && (
        <div>
          <Card className="mb-4 border-blue-500/15">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.settings.groceryBookToBudget}
                onChange={e => updateData(prev => ({
                  ...prev,
                  settings: { ...prev.settings, groceryBookToBudget: e.target.checked },
                }))}
                className="mt-1 accent-emerald-500"
              />
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Wallet size={14} className="text-blue-400" /> Einkauf im Budget erfassen
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Wenn alle Artikel abgehakt sind, kannst du den Betrag als Ausgabe buchen (Vorschlag aus Rezept-Kosten).
                </p>
                {data.groceryLastTripTransactionId && (
                  <Link to="/app/finanzen" className="text-xs text-emerald-400 mt-1 inline-block">Letzter Einkauf im Budget →</Link>
                )}
              </div>
            </label>
          </Card>

          {data.groceryList.length > 0 && (
            <Card className={cn('mb-4', shopMode && 'sticky top-0 z-10 glow-accent border-emerald-500/20')}>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-2xl font-bold">{groceryStats.open}</p>
                  <p className="text-xs text-muted">noch offen · {groceryStats.done}/{groceryStats.total} erledigt</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShopMode(!shopMode)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    shopMode ? 'bg-emerald-500 text-white' : 'glass hover:border-emerald-500/30',
                  )}
                >
                  <Store size={16} />
                  {shopMode ? 'Modus an' : 'Einkaufsmodus'}
                </button>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${groceryStats.percent}%` }} />
              </div>
            </Card>
          )}

          {!shopMode && (
            <>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button size="sm" variant="secondary" onClick={generateFromPlan}>
                  <Wand2 size={14} /> Aus Wochenplan
                </Button>
                {data.groceryList.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={shareGroceryList}>
                    <Share2 size={14} /> Teilen / Kopieren
                  </Button>
                )}
              </div>
              <p className="text-xs text-faint mb-2 uppercase tracking-wider">Schnell hinzufügen</p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {GROCERY_STAPLES.map(s => (
                  <button
                    key={s.name}
                    onClick={() => addStaple(s)}
                    className="text-xs px-2.5 py-1 rounded-lg glass hover:border-emerald-500/30"
                  >
                    + {s.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {shopMode && data.groceryList.length > 0 && (
            <div className="flex gap-2 mb-4">
              <Button size="sm" variant="ghost" onClick={shareGroceryList}>
                <Share2 size={14} /> Teilen
              </Button>
              {groceryStats.done > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDoneItems(!showDoneItems)}
                  className={cn('text-xs px-3 py-2 rounded-xl', showDoneItems ? 'bg-emerald-500/20 text-emerald-400' : 'glass text-muted')}
                >
                  {showDoneItems ? 'Erledigte ausblenden' : `Erledigte (${groceryStats.done})`}
                </button>
              )}
            </div>
          )}

          {!shopMode && data.groceryList.some(g => g.checked) && (
            <button onClick={clearChecked} className="text-xs text-muted hover:text-emerald-400 mb-4">
              Erledigte entfernen
            </button>
          )}

          {data.groceryList.length === 0 ? (
            <Card className="text-center py-10">
              <ChefHat size={36} className="mx-auto text-faint mb-3" />
              <p className="text-sm text-muted mb-4">Noch keine Artikel. Plane die Woche und nutze „Aus Wochenplan".</p>
              <Button onClick={openGroceryCreate}><Plus size={16} /> Artikel hinzufügen</Button>
            </Card>
          ) : shopMode && groceryStats.open === 0 ? (
            <Card className="text-center py-12 border-emerald-500/30 bg-emerald-500/5">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-semibold text-emerald-400">Alles eingekauft!</p>
              <p className="text-sm text-muted mt-1">{groceryStats.total} Artikel erledigt</p>
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {data.settings.groceryBookToBudget && !data.groceryLastTripTransactionId && (
                  <Button size="sm" onClick={() => openTripBooking()}>
                    <Wallet size={14} /> Im Budget erfassen
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={clearChecked}>Liste aufräumen</Button>
              </div>
            </Card>
          ) : groupedGrocery.length === 0 && shopMode ? (
            <Card className="text-center py-8 text-sm text-muted">Alle offenen Artikel erledigt — tippe „Erledigte" zum Nachsehen.</Card>
          ) : groupedGrocery.map(({ category, items }) => (
            <div key={category} className="mb-4">
              <h3 className={cn('uppercase mb-2 flex items-center justify-between', shopMode ? 'text-sm font-medium text-slate-300' : 'text-xs text-faint')}>
                <span>{category}</span>
                <span className="text-faint font-normal">{items.filter(i => !i.checked).length} offen</span>
              </h3>
              {items.map(item => (
                <Card
                  key={item.id}
                  className={cn('mb-1.5', shopMode && 'py-0 overflow-hidden', item.checked && shopMode && 'opacity-60')}
                >
                  {shopMode ? (
                    <button
                      type="button"
                      onClick={() => toggleGrocery(item.id)}
                      className="w-full flex items-center gap-4 px-4 py-4 min-h-[3.5rem] text-left active:bg-slate-800/50"
                    >
                      <div className={cn(
                        'w-9 h-9 rounded-xl border-2 flex items-center justify-center shrink-0',
                        item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500',
                      )}>
                        {item.checked && <Check size={20} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-base font-medium leading-tight', item.checked && 'line-through text-faint')}>{item.name}</p>
                        {item.quantity && item.quantity !== '1' && (
                          <p className="text-sm text-muted mt-0.5">{item.quantity}</p>
                        )}
                      </div>
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 py-2.5">
                      <button
                        onClick={() => toggleGrocery(item.id)}
                        className={cn(
                          'w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0',
                          item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600',
                        )}
                      >
                        {item.checked && <Check size={14} className="text-white" />}
                      </button>
                      <p className={cn('flex-1 text-sm', item.checked && 'line-through text-faint')}>{item.name}</p>
                      <span className="text-xs text-muted">{item.quantity}</span>
                      <button onClick={() => openGroceryEdit(item)} className="text-faint hover:text-emerald-400">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteGrocery(item.id)} className="text-faint hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal open={recipeModal} onClose={() => setRecipeModal(false)} title={editingRecipeId ? 'Rezept bearbeiten' : 'Neues Rezept'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Name" value={recipeTitle} onChange={e => setRecipeTitle(e.target.value)} placeholder="z. B. Linsencurry" />
          <div>
            <p className="text-sm text-muted mb-2">Kategorie</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(RECIPE_CATEGORY_LABELS) as RecipeCategory[]).map(cat => (
                <button key={cat} onClick={() => setRecipeCategory(cat)}
                  className={cn('px-3 py-1.5 rounded-xl text-xs', recipeCategory === cat ? 'bg-emerald-500/20 text-emerald-400' : 'glass')}>
                  {RECIPE_CATEGORY_EMOJI[cat]} {RECIPE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted mb-1.5 block">Zutaten (je Zeile oder kommagetrennt)</label>
            <textarea value={recipeIngredients} onChange={e => setRecipeIngredients(e.target.value)} rows={4}
              placeholder={'Hähnchenbrust\nReis\nBrokkoli\nSojasauce'}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div>
            <label className="text-sm text-muted mb-1.5 block">Zubereitung (optional)</label>
            <textarea value={recipeInstructions} onChange={e => setRecipeInstructions(e.target.value)} rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-sm resize-none focus:outline-none focus:border-emerald-500/50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Portionen" type="number" min={1} value={recipePortions} onChange={e => setRecipePortions(e.target.value)} />
            <Input label="Zeit (Min.)" type="number" min={1} value={recipeCookTime} onChange={e => setRecipeCookTime(e.target.value)} />
          </div>
          <Input
            label="Geschätzte Kosten (€)"
            type="number"
            min={0}
            step={0.5}
            value={recipeEstimatedCost}
            onChange={e => setRecipeEstimatedCost(e.target.value)}
            placeholder="z. B. 4,50"
          />
          <p className="text-[10px] text-faint -mt-2">Hilft beim Budget-Check — wird im Wochenplan summiert.</p>
          <Button onClick={saveRecipe} className="w-full">{editingRecipeId ? 'Speichern' : 'Rezept anlegen'}</Button>
        </div>
      </Modal>

      <Modal open={planModal} onClose={() => setPlanModal(false)} title={planRecipeObj ? `„${planRecipeObj.title}" planen` : 'Rezept planen'}>
        {planRecipeObj && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted mb-2">Wochentag</p>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAY_OPTIONS.map(d => (
                  <button key={d} onClick={() => setPlanDay(d)}
                    className={cn('px-3 py-1.5 rounded-xl text-xs', planDay === d ? 'bg-emerald-500/20 text-emerald-400' : 'glass', d === todayName && 'ring-1 ring-emerald-500/30')}>
                    {d.slice(0, 2)}{d === todayName ? ' ✓' : ''}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted mb-2">Mahlzeit</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(RECIPE_CATEGORY_LABELS) as MealSlotKey[]).map(slot => (
                  <button key={slot} onClick={() => setPlanSlot(slot)}
                    className={cn('px-3 py-1.5 rounded-xl text-xs', planSlot === slot ? 'bg-emerald-500/20 text-emerald-400' : 'glass')}>
                    {RECIPE_CATEGORY_EMOJI[slot]} {RECIPE_CATEGORY_LABELS[slot]}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={() => planRecipe(planRecipeObj, planDay, planSlot)} className="w-full">In Wochenplan einfügen</Button>
          </div>
        )}
      </Modal>

      <Modal open={groceryModal} onClose={() => setGroceryModal(false)} title={editingGroceryId ? 'Artikel bearbeiten' : 'Artikel hinzufügen'}>
        <div className="space-y-4">
          <Input label="Artikel" value={itemName} onChange={e => setItemName(e.target.value)} />
          <Input label="Menge" value={itemQty} onChange={e => setItemQty(e.target.value)} placeholder="z. B. 500 g, 6 Stk" />
          <Input
            label="Geschätzter Preis (€, optional)"
            type="number"
            min={0}
            step={0.1}
            value={itemPrice}
            onChange={e => setItemPrice(e.target.value)}
            placeholder="Für Budget-Vorschlag"
          />
          <div className="flex flex-wrap gap-2">
            {GROCERY_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setItemCategory(c)}
                className={cn('px-3 py-1.5 rounded-xl text-xs', itemCategory === c ? 'bg-emerald-500/20 text-emerald-400' : 'glass')}
              >
                {c}
              </button>
            ))}
          </div>
          <Button onClick={saveGrocery} className="w-full">{editingGroceryId ? 'Speichern' : 'Hinzufügen'}</Button>
        </div>
      </Modal>

      <Modal open={tripModalOpen} onClose={() => setTripModalOpen(false)} title="Einkauf im Budget erfassen">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Alle Artikel erledigt! Trage den Einkaufsbetrag ein — der Vorschlag basiert auf Rezept-Kosten oder deiner Lebensmittel-Kategorie.
          </p>
          <Input
            label="Betrag (€)"
            type="number"
            min={0}
            step={0.01}
            value={tripAmount}
            onChange={e => setTripAmount(e.target.value)}
          />
          <Button onClick={confirmTripBooking} className="w-full">Als Ausgabe buchen</Button>
          <Button variant="ghost" className="w-full" onClick={() => setTripModalOpen(false)}>Später</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!opts} title={opts?.title ?? ''} message={opts?.message ?? ''}
        onConfirm={() => opts?.onConfirm()} onCancel={cancel} />
    </div>
  )
}