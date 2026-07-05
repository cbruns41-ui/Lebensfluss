import { useEffect } from 'react'
import { useData } from '../contexts/DataContext'
import {
  getTodayPendingHabits, migrateHabits, isCompleted, isHabitDueOnDate,
} from '../lib/habits'
import { toDateKey } from '../lib/utils'

function wasSent(key: string): boolean {
  return !!sessionStorage.getItem(key)
}

function markSent(key: string): void {
  sessionStorage.setItem(key, '1')
}

function sendNotification(title: string, body: string): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  new Notification(title, { body, icon: '/pwa-192.png' })
}

export function HabitReminders() {
  const { data } = useData()

  useEffect(() => {
    if (!('Notification' in window)) return

    const check = () => {
      const now = new Date()
      const hh = now.getHours()
      const mm = now.getMinutes()
      const todayKey = toDateKey(now)
      const habits = migrateHabits(data.habits)

      if (data.settings.dailyReminder && hh === 9 && mm === 0) {
        const key = `digest-${todayKey}`
        if (!wasSent(key)) {
          const pending = getTodayPendingHabits(habits, data.habitCompletions, now)
          if (pending.length > 0) {
            sendNotification(
              'Lebensfluss',
              pending.length === 1
                ? `Heute noch 1 Gewohnheit: ${pending[0].icon} ${pending[0].name}`
                : `Heute noch ${pending.length} Gewohnheiten offen – los geht's!`,
            )
          }
          markSent(key)
        }
      }

      for (const habit of habits) {
        const reminder = habit.reminder
        if (!reminder?.enabled) continue
        const [rh, rm] = reminder.time.split(':').map(Number)
        if (hh !== rh || mm !== rm) continue

        const key = `habit-${habit.id}-${todayKey}-${reminder.time}`
        if (wasSent(key)) continue

        if (!isHabitDueOnDate(habit, now)) continue
        if (isCompleted(habit.id, todayKey, data.habitCompletions)) continue

        sendNotification(
          `${habit.icon} ${habit.name}`,
          'Zeit für deine Gewohnheit – tippe zum Abhaken!',
        )
        markSent(key)
      }

      if (data.settings.habitStreakReminder) {
        const eveningHour = data.settings.habitEveningReminderHour ?? 20
        if (hh === eveningHour && mm === 0) {
          const key = `streak-${todayKey}`
          if (!wasSent(key)) {
            const pending = getTodayPendingHabits(habits, data.habitCompletions, now)
            const withStreak = pending.filter(habit => {
              const completions = data.habitCompletions
              let s = 0
              const d = new Date()
              for (let i = 0; i < 30; i++) {
                if (isHabitDueOnDate(habit, d) && isCompleted(habit.id, toDateKey(d), completions)) s++
                else if (isHabitDueOnDate(habit, d)) break
                d.setDate(d.getDate() - 1)
              }
              return s >= 2
            })

            if (withStreak.length > 0) {
              sendNotification(
                '🔥 Streak in Gefahr!',
                withStreak.length === 1
                  ? `„${withStreak[0].name}" – noch nicht erledigt heute!`
                  : `${withStreak.length} Gewohnheiten drohen den Streak zu verlieren.`,
              )
            }
            markSent(key)
          }
        }
      }
    }

    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [data])

  return null
}