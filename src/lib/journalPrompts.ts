export const journalPrompts = [
  'Was war heute dein Highlight?',
  'Wofür bist du heute dankbar?',
  'Was hast du heute gelernt?',
  'Was würdest du morgen anders machen?',
  'Wie fühlst du dich gerade – und warum?',
  'Welche kleine Sache hat dich heute gefreut?',
  'Was nimmst du aus dieser Woche mit?',
  'Wem möchtest du Danke sagen?',
]

export const gratitudePrompts = [
  'Drei Dinge, die heute gut liefen:',
  'Eine Person, die ich schätze:',
  'Etwas Einfaches, das ich oft übersehe:',
  'Mein Körper hat heute für mich getan:',
]

export function getDailyJournalPrompt(): string {
  const day = Math.floor(Date.now() / 86400000)
  return journalPrompts[day % journalPrompts.length]
}

export function getDailyGratitudePrompt(): string {
  const day = Math.floor(Date.now() / 86400000)
  return gratitudePrompts[day % gratitudePrompts.length]
}