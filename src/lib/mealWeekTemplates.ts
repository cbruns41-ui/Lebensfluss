import type { AppData } from '../types'

export const mealWeekTemplates: { name: string; plan: AppData['mealPlan'] }[] = [
  {
    name: 'Gesund & leicht',
    plan: [
      { day: 'Montag', breakfast: 'Haferflocken, Beeren', lunch: 'Salat mit Hähnchen', dinner: 'Gemüsepfanne, Reis', snacks: 'Apfel, Nüsse' },
      { day: 'Dienstag', breakfast: 'Joghurt, Granola', lunch: 'Linsensuppe', dinner: 'Fisch, Brokkoli', snacks: 'Karotten' },
      { day: 'Mittwoch', breakfast: 'Vollkornbrot, Avocado', lunch: 'Quinoa-Bowl', dinner: 'Zucchini-Nudeln', snacks: 'Beeren' },
      { day: 'Donnerstag', breakfast: 'Smoothie', lunch: 'Wrap mit Turkey', dinner: 'Chili sin Carne', snacks: 'Mandeln' },
      { day: 'Freitag', breakfast: 'Rührei, Spinat', lunch: 'Buddha Bowl', dinner: 'Pizza selbst (Vollkorn)', snacks: 'Obst' },
      { day: 'Samstag', breakfast: 'Pancakes (leicht)', lunch: 'Meal Prep Reste', dinner: 'Grillgemüse, Tofu', snacks: '' },
      { day: 'Sonntag', breakfast: 'Brunch', lunch: 'Eintopf', dinner: 'Leicht, Suppe', snacks: '' },
    ],
  },
  {
    name: 'Fitness',
    plan: [
      { day: 'Montag', breakfast: 'Protein-Porridge', lunch: 'Hähnchen, Süßkartoffel', dinner: 'Salat, Thunfisch', snacks: 'Proteinriegel' },
      { day: 'Dienstag', breakfast: 'Eier, Toast', lunch: 'Reis, Putenbrust', dinner: 'Steak, Bohnen', snacks: 'Quark' },
      { day: 'Mittwoch', breakfast: 'Smoothie Bowl', lunch: 'Pasta, Hack (mager)', dinner: 'Omelett, Gemüse', snacks: 'Banane' },
      { day: 'Donnerstag', breakfast: 'Skyr, Nüsse', lunch: 'Burrito Bowl', dinner: 'Lachs, Spargel', snacks: '' },
      { day: 'Freitag', breakfast: 'Haferflocken, Protein', lunch: 'Meal Prep', dinner: 'Hähnchen-Wok', snacks: '' },
      { day: 'Samstag', breakfast: 'Rührei', lunch: 'Reste', dinner: 'Cheat Meal', snacks: '' },
      { day: 'Sonntag', breakfast: 'Brunch protein', lunch: 'Leicht', dinner: 'Suppe', snacks: '' },
    ],
  },
  {
    name: 'Budget-freundlich',
    plan: [
      { day: 'Montag', breakfast: 'Haferflocken', lunch: 'Nudeln mit Tomatensauce', dinner: 'Eintopf', snacks: '' },
      { day: 'Dienstag', breakfast: 'Brot, Marmelade', lunch: 'Reste Eintopf', dinner: 'Kartoffeln, Spiegelei', snacks: '' },
      { day: 'Mittwoch', breakfast: 'Joghurt', lunch: 'Reis, Gemüse', dinner: 'Linsencurry', snacks: '' },
      { day: 'Donnerstag', breakfast: 'Toast', lunch: 'Curry Reste', dinner: 'Nudelauflauf', snacks: '' },
      { day: 'Freitag', breakfast: 'Haferflocken', lunch: 'Sandwich', dinner: 'Selbstgemachte Pizza', snacks: '' },
      { day: 'Samstag', breakfast: 'Eier', lunch: 'Meal Prep', dinner: 'Ofengemüse', snacks: '' },
      { day: 'Sonntag', breakfast: 'Brunch', lunch: 'Suppe', dinner: 'Reste', snacks: '' },
    ],
  },
]