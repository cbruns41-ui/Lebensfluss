export const dailyQuotes = [
  { text: 'Der beste Zeitpunkt anzufangen war gestern. Der zweitbeste ist jetzt.', author: 'Chinesisches Sprichwort' },
  { text: 'Disziplin ist die Brücke zwischen Zielen und Erfolg.', author: 'Jim Rohn' },
  { text: 'Kleine Schritte jeden Tag führen zu großen Veränderungen.', author: 'Lebensfluss' },
  { text: 'Du musst nicht perfekt sein, um produktiv zu sein.', author: 'James Clear' },
  { text: 'Was du heute tust, bestimmt dein Morgen.', author: 'Lebensfluss' },
  { text: 'Sparen ist Gewohnheit, nicht Einkommen.', author: 'Lebensfluss' },
  { text: 'Ein geplanter Tag ist ein gewonnener Tag.', author: 'Lebensfluss' },
]

export function getDailyQuote(): { text: string; author: string } {
  const day = new Date().getDate()
  return dailyQuotes[day % dailyQuotes.length]
}