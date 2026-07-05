export type SubscriptionPlan =
  | 'none'
  | 'trial'
  | 'lifetime'
  | 'monthly'
  | 'yearly'
  | 'expired'
  | 'demo'

export interface UserSubscription {
  plan: SubscriptionPlan
  trialStartedAt?: string
  trialEndsAt?: string
  purchasedAt?: string
  expiresAt?: string
  cancelAtPeriodEnd?: boolean
  cancelledAt?: string
}

export type UserRole = 'user' | 'admin'

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
  subscription: UserSubscription
  role?: UserRole
  acceptedTermsAt?: string
  acceptedPrivacyAt?: string
}

export interface NewsItem {
  id: string
  title: string
  content: string
  publishedAt: string
  updatedAt: string
  pinned?: boolean
}

export interface AdminConfig {
  supportEmails: string[]
}

export type SupportTicketStatus = 'open' | 'closed'

export interface SupportTicket {
  id: string
  userId?: string
  userName: string
  userEmail: string
  subject: string
  message: string
  createdAt: string
  status: SupportTicketStatus
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'system'
  waterGoalMl: number
  waterGlassMl: number
  onboardingCompleted: boolean
  savingsIncrement: number
  pomodoroWorkMin: number
  pomodoroBreakMin: number
  dailyReminder: boolean
  habitStreakReminder: boolean
  habitEveningReminderHour: number
  /** Beim Abschluss der Einkaufsliste Ausgabe im Budget anbieten */
  groceryBookToBudget: boolean
}

export type HabitScheduleType = 'daily' | 'weekdays' | 'weekly'

export interface HabitReminder {
  enabled: boolean
  time: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  createdAt: string
  schedule?: HabitScheduleType
  weekdays?: number[]
  timesPerWeek?: number
  reminder?: HabitReminder
}

export interface HabitCompletion {
  habitId: string
  date: string
}

export interface BudgetCategory {
  id: string
  name: string
  limit: number
  color: string
}

export interface Transaction {
  id: string
  categoryId: string
  amount: number
  note: string
  date: string
  type: 'expense' | 'income'
  recurringId?: string
}

export interface RecurringTransaction {
  id: string
  name: string
  categoryId: string
  amount: number
  note: string
  type: 'expense' | 'income'
  dayOfMonth: number
  active: boolean
}

export interface SavingsWeek {
  week: number
  amount: number
  completed: boolean
  budgetTransactionId?: string
}

export type MealSlotKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export interface MealPlanDay {
  day: string
  breakfast: string
  lunch: string
  dinner: string
  snacks: string
  linkedRecipes?: Partial<Record<MealSlotKey, string>>
}

export type RecipeCategory = MealSlotKey

export interface Recipe {
  id: string
  title: string
  category: RecipeCategory
  ingredients: string
  instructions?: string
  portions?: number
  cookTimeMin?: number
  estimatedCost?: number
  createdAt: string
}

export interface GroceryItem {
  id: string
  name: string
  quantity: string
  checked: boolean
  category: string
  estimatedPrice?: number
}

export interface PlannerTask {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  week?: number
}

export interface PlannerNote {
  id: string
  content: string
  month: string
}

export interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline: string
  linkedHabitIds?: string[]
  /** Fortschritt = Completions verknüpfter Gewohnheiten (30 Tage) */
  habitDrivenProgress?: boolean
}

export type FocusMode = 'full' | 'light' | 'basics'

export interface WeeklyRitualState {
  weekStart: string
  completedAt?: string
  focusHabitIds: string[]
  focusMode: FocusMode
}

export interface WaterEntry {
  date: string
  ml: number
}

export interface MoodEntry {
  id: string
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  note: string
}

export interface SleepEntry {
  date: string
  hours: number
  quality: 1 | 2 | 3 | 4 | 5
}

export interface JournalEntry {
  id: string
  date: string
  content: string
  type: 'journal' | 'gratitude'
}

export interface QuickNote {
  id: string
  content: string
  createdAt: string
  pinned: boolean
}

export interface FocusSession {
  id: string
  date: string
  durationMin: number
  type: 'work' | 'break'
}

export interface WeeklyReview {
  id: string
  weekStart: string
  wins: string
  improvements: string
  nextWeek: string
}

export interface AppData {
  settings: UserSettings
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  budgetCategories: BudgetCategory[]
  transactions: Transaction[]
  recurringTransactions: RecurringTransaction[]
  savingsWeeks: SavingsWeek[]
  mealPlan: MealPlanDay[]
  recipes: Recipe[]
  groceryList: GroceryItem[]
  plannerTasks: PlannerTask[]
  plannerNotes: PlannerNote[]
  goals: Goal[]
  waterEntries: WaterEntry[]
  moodEntries: MoodEntry[]
  sleepEntries: SleepEntry[]
  journalEntries: JournalEntry[]
  quickNotes: QuickNote[]
  focusSessions: FocusSession[]
  weeklyReviews: WeeklyReview[]
  weeklyRitual: WeeklyRitualState
  groceryLastTripTransactionId?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress?: number
  target?: number
}