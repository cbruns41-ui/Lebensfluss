export interface HelpSection {
  title: string
  content: string
}

export interface PageHelpContent {
  title: string
  intro: string
  sections: HelpSection[]
  tips?: string[]
}

export const pageHelp: Record<string, PageHelpContent> = {
  dashboard: {
    title: 'Start – Hilfe',
    intro: 'Dein täglicher Überblick: Was ist heute wichtig, wie läuft deine Woche?',
    sections: [
      { title: 'Life Score', content: 'Eine Zahl von 0–100 aus Gewohnheiten, Wellness, Budget, Fokus und Reflexion. Der kleine Balken darunter zeigt den Verlauf der letzten 7 Tage. Tippe auf die Karte für Details in der Statistik.' },
      { title: 'Sonntags-Ritual', content: 'Einmal pro Woche erscheint ein goldener Hinweis: geführter Wochenstart mit Rückblick, Fokus-Gewohnheiten, Meal Prep und Budget. Findest du auch unter Mehr → Sonntags-Ritual.' },
      { title: 'Fokus-Woche', content: 'Nach dem Ritual kannst du „Leichte Woche" oder „Nur Basics" wählen. Dann zeigt das Dashboard weniger Bereiche und der Life Score gewichtet anders — z. B. mehr Gewohnheiten, weniger Fokus.' },
      { title: 'Einkaufsliste', content: 'Wenn Artikel offen sind, siehst du eine lila Karte — ein Tipp öffnet die Einkaufsliste direkt im Einkaufsmodus (große Buttons fürs Abhaken im Laden).' },
      { title: 'Insights', content: 'Kurze Hinweise aus deinen Daten: z. B. Schlaf und Gewohnheiten, Budget-Warnung, Meal Prep. Keine KI — nur Regeln aus deinen Einträgen.' },
      { title: 'Gewohnheiten heute', content: 'Der Ring zeigt, wie viele heute fällige Gewohnheiten du schon erledigt hast. Darunter optional dein Budget-Fortschritt im Monat.' },
      { title: 'Schnellzugriff', content: 'Sprung zu allen Bereichen mit Live-Status (z. B. „3/5 Gewohnheiten", „12 offen" beim Einkauf). In der Fokus-Woche sind weniger Zeilen sichtbar.' },
    ],
    tips: [
      'Life Score ab 75 = „Stark" — Abzeichen „Life Balance" in den Erfolgen.',
      'Sonntag: Ritual + Wochenreview-Export = bester Wochenstart.',
    ],
  },
  gewohnheiten: {
    title: 'Gewohnheiten – Hilfe',
    intro: 'Baue Routinen mit klarem Zeitplan, Streaks und optionalen Erinnerungen.',
    sections: [
      { title: 'Heute-Ansicht', content: 'Nur heute fällige Gewohnheiten. Ein Tipp = abhaken oder Rückgängig. Die Fortschrittsanzeige oben zeigt deinen Tagesstand.' },
      { title: 'Zeitplan', content: 'Täglich · bestimmte Wochentage (z. B. Mo–Fr) · oder flexibel „X-mal pro Woche". Streaks zählen nur an Tagen, an denen die Gewohnheit laut Plan fällig ist.' },
      { title: 'Erinnerungen', content: 'Pro Gewohnheit eine Uhrzeit. Zusätzlich optional abends „Streak-Warnung" (Einstellungen), wenn noch etwas offen ist.' },
      { title: 'Verknüpfung mit Zielen', content: 'In Zielen kannst du Gewohnheiten verknüpfen — sogar mit automatischem Fortschritt. Jedes Abhaken hier kann dein Ziel mitzählen.' },
      { title: 'Ansichten „31 Tage" & „Monat"', content: 'In „31 Tage": Streak und Verlauf der letzten Wochen. In „Monat": dunkel = nicht fällig, hell = fällig, ausgefüllt = erledigt.' },
      { title: 'Bearbeiten & Löschen', content: 'In der Ansicht „31 Tage": Stift bearbeitet Name, Icon, Zeitplan und Erinnerung. Mülleimer löscht die Gewohnheit und alle bisherigen Häkchen.' },
    ],
    tips: [
      'Starte mit 2–3 Gewohnheiten — Erfolg kommt von Beständigkeit, nicht von Menge.',
      'App aufs Handy installieren (Mehr-Menü), damit Erinnerungen zuverlässiger funktionieren.',
    ],
  },
  finanzen: {
    title: 'Budget – Hilfe',
    intro: 'Einnahmen und Ausgaben nach Kategorien — inklusive Verknüpfung zu Meal Prep und Einkauf.',
    sections: [
      { title: 'Monatsfilter', content: 'Mit den Pfeilen oben den Monat wechseln. Alle Summen und Einträge beziehen sich auf den gewählten Monat.' },
      { title: 'Übersicht', content: 'Ausgaben (rot) und Einnahmen (grün) als Kacheln. Der Balken „Budget-Auslastung" vergleicht Ausgaben mit der Summe aller Kategorie-Limits.' },
      { title: 'Meal Prep & Einkauf', content: 'Wenn du Mahlzeiten planst oder Rezept-Kosten hinterlegst, siehst du hier die geschätzte Wochensumme. Offene Einkaufsartikel werden verlinkt. „Als Ausgabe buchen" erstellt einen Eintrag in der Lebensmittel-Kategorie.' },
      { title: 'Einträge erfassen', content: '„+ Eintrag": Ausgabe oder Einnahme mit Datum, Betrag, Kategorie und Notiz. Stift zum Bearbeiten, Mülleimer zum Löschen.' },
      { title: 'Kategorien', content: 'Jede Kategorie hat ein Monatslimit und eine Farbe. „Lebensmittel" wird für Meal-Prep- und Einkaufs-Buchungen bevorzugt.' },
      { title: 'Daueraufträge', content: 'Fixkosten wie Miete oder Gehalt einmal anlegen — werden am gewählten Tag (1–28) jeden Monats automatisch gebucht.' },
      { title: 'CSV-Import', content: 'Upload-Symbol: Bank-CSV (Sparkasse, N26, ING …). Datum, Betrag und Verwendungszweck werden erkannt. Unklare Zeilen werden übersprungen.' },
      { title: 'Spar-Challenge', content: 'Wenn du dort Wochen abhakst und „Im Budget buchen" aktiv ist, erscheint hier eine Einnahme — verknüpft mit der Challenge.' },
    ],
    tips: [
      'Lege Daueraufträge für Miete & Abos an — dann fehlt nichts im Monatsbild.',
      'Rezept-Kosten in Meal Prep pflegen — dann stimmen die Wochen-Schätzungen hier.',
    ],
  },
  einkauf: {
    title: 'Einkaufsliste – Hilfe',
    intro: 'Deine Einkaufsliste als eigene Seite — erreichbar über die untere Navigation (Einkauf-Tab).',
    sections: [
      { title: 'Essen vs. Einkauf', content: '„Essen" = Wochenplan, Rezepte und Planung. „Einkauf" = nur die Liste zum Abhaken im Laden. Beides nutzt dieselbe Liste — du wechselst nur die Ansicht.' },
      { title: 'Liste füllen', content: '1) Im Tab „Woche" unter Essen Mahlzeiten eintragen, dann „Aus Wochenplan". 2) Oder im Rezeptbuch „Zutaten" tippen. 3) Oder manuell „+ Artikel" und Schnell-Buttons (Milch, Eier …).' },
      { title: 'Einkaufsmodus', content: 'Schalter oben rechts: große Flächen, nur offene Artikel, Fortschrittsbalken. Ideal unterwegs. Vom Dashboard kommst du per Karte direkt mit aktiviertem Modus.' },
      { title: 'Artikel bearbeiten', content: 'Im Normalmodus (nicht Einkaufsmodus): Artikel antippen zum Bearbeiten — Name, Menge, Kategorie, optional geschätzter Preis für den Budget-Vorschlag.' },
      { title: 'Teilen & aufräumen', content: '„Teilen / Kopieren" exportiert die offene Liste als Text. „Erledigte entfernen" löscht abgehakte Artikel und setzt die Budget-Verknüpfung für den letzten Einkauf zurück.' },
      { title: 'Budget-Verknüpfung', content: 'Schalter „Einkauf im Budget erfassen": Wenn alle Artikel abgehakt sind, erscheint ein Dialog mit Betrags-Vorschlag (aus Rezept-Kosten, Artikel-Preisen oder Lebensmittel-Budget). Die Ausgabe landet im Budget unter „Wocheneinkauf".' },
      { title: 'Verknüpfung Meal Prep', content: 'Oben siehst du Links zu Meal Prep und Budget. Geschätzte Wochenkosten aus Rezepten erscheinen auch in der Budget-Übersicht.' },
    ],
    tips: [
      'Ablauf: Woche planen → „Aus Wochenplan" → Einkauf-Tab → Einkaufsmodus im Laden → optional Budget buchen.',
      'Einstellungen: Schalter „Einkauf ins Budget übernehmen" (dauerhaft an/aus). Auf der Einkaufsseite heißt derselbe Schalter „Einkauf im Budget erfassen".',
    ],
  },
  essen: {
    title: 'Meal Prep – Hilfe',
    intro: 'Plane deine Woche, sammle Rezepte — die Einkaufsliste ist der letzte Schritt (eigener Tab „Einkauf" oder Navigation unten).',
    sections: [
      { title: 'Der Ablauf', content: 'Rezepte anlegen → Woche planen → Zutaten auf die Einkaufsliste → einkaufen (Seite „Einkauf" in der Navigation). Kosten optional pro Rezept — fließen ins Budget.' },
      { title: 'Tab „Heute"', content: 'Mahlzeiten für den aktuellen Wochentag. Verknüpfte Rezepte erscheinen als 📖-Chip — Tipp plant sie sofort ein.' },
      { title: 'Tab „Woche"', content: '7-Tage-Übersicht mit Fortschrittsbalken. Tag antippen zum Bearbeiten. „Aus Wochenplan" (im Einkauf-Tab) übernimmt Zutaten auf die Liste.' },
      { title: 'Tab „Rezepte"', content: 'Dein Rezeptbuch: Name, Zutaten (je Zeile oder kommagetrennt), Zubereitung, Portionen, Zeit, geschätzte Kosten in €. Aktionen: „Heute", „Tag" (Wochentag), „Zutaten" (→ Einkaufsliste).' },
      { title: 'Tab „Einkauf"', content: 'Kurzversion der Einkaufsliste — dieselben Daten wie unter Navigation → Einkauf. Tipp-Box verweist auf die eigene Einkaufsseite fürs Einkaufen unterwegs.' },
      { title: 'Vorlagen', content: '„Gesund & leicht", „Fitness" oder „Budget-freundlich" füllen die ganze Woche. Bestätigung nötig — dein alter Plan wird ersetzt.' },
      { title: 'Von Vortag übernehmen', content: 'Beim Aufklappen eines Tages: Button „Von [Wochentag] übernehmen" kopiert die Mahlzeiten vom Vortag — spart Zeit bei ähnlichen Tagen.' },
      { title: 'Geschätzte Kosten', content: 'Pro Rezept optional € — sichtbar in der Rezept-Zeile, im Budget unter „Meal Prep & Einkauf" und als Vorschlag beim Einkaufs-Abschluss.' },
    ],
    tips: [
      '5-Minuten-Setup: Vorlage wählen → 1–2 Tage anpassen → „Aus Wochenplan" → Navigation „Einkauf".',
      'Zutaten im Rezeptbuch immer je Zeile — dann funktioniert die automatische Einkaufsliste zuverlässig.',
    ],
  },
  wellness: {
    title: 'Wellness – Hilfe',
    intro: 'Wasser, Stimmung und Schlaf — die Basis für deinen Wellness-Anteil im Life Score.',
    sections: [
      { title: 'Wasser', content: 'Glas-Button nutzt deine Glasgröße aus den Einstellungen (Standard: 250 ml). Alternativ +500 ml oder manuelle Eingabe. Tagesziel ebenfalls in Einstellungen änderbar.' },
      { title: 'Stimmung', content: 'Emoji für heute wählen (1–5). Stift bearbeitet den heutigen Eintrag. Fließt in den Life Score und in Insights.' },
      { title: 'Schlaf', content: 'Stunden per Slider, Qualität per Sterne. „Zurücksetzen" löscht den heutigen Schlaf-Eintrag.' },
      { title: '7-Tage-Charts', content: 'Mini-Diagramme unter Wasser und Stimmung — erkenne Trends (z. B. wenig Wasser montags).' },
    ],
    tips: [
      'Morgens ein Glas Wasser — sofort abhaken, kleiner Gewinn für den Tag.',
      'Schlaf unter 6 h? Insights zeigen oft Zusammenhang mit weniger erledigten Gewohnheiten.',
    ],
  },
  tagebuch: {
    title: 'Tagebuch – Hilfe',
    intro: 'Gedanken, Dankbarkeit und kurze Notizen — stärkt den Reflexions-Teil deines Life Score.',
    sections: [
      { title: 'Tagebuch', content: 'Freitext für Gedanken und Erlebnisse. Einträge bearbeiten oder löschen. Suchfeld durchsucht alle Tagebuch-Texte.' },
      { title: 'Dankbarkeit', content: 'Separater Typ — „Wofür bin ich dankbar?" Tagebuch + Dankbarkeit am selben Tag = voller Reflexions-Score.' },
      { title: 'Schreibimpulse', content: 'Beim neuen Eintrag erscheinen Prompts — antippen fügt den Text ein. Kein leeres Blatt.' },
      { title: 'Notizen', content: 'Kurze Notizen, anpinnbar. Der grüne + Button unten rechts (auf jeder Seite) erstellt Notizen von überall.' },
      { title: 'Suche', content: 'Filtert Tagebuch und Dankbarkeit nach Stichworten — auch ältere Einträge.' },
    ],
    tips: [
      '2–3 Sätze Dankbarkeit reichen — Regelmäßigkeit zählt.',
    ],
  },
  fokus: {
    title: 'Fokus-Timer – Hilfe',
    intro: 'Pomodoro-Technik: konzentriert arbeiten, bewusst pausieren.',
    sections: [
      { title: 'Ablauf', content: 'Fokus-Phase (Standard 25 Min.), dann Pause (5 Min.). Nach Abschluss wechselt der Timer automatisch. Zeiten in Einstellungen anpassbar.' },
      { title: 'Steuerung', content: 'Start/Pause unterbricht. Reset setzt die aktuelle Phase zurück, ohne die Statistik zu löschen.' },
      { title: 'Life Score & Statistik', content: 'Abgeschlossene Fokus-Minuten fließen in den Life Score und erscheinen in der Statistik als Chart.' },
    ],
    tips: [
      'Benachrichtigungen stumm — eine Phase ohne Unterbrechung.',
    ],
  },
  'spar-challenge': {
    title: 'Spar-Challenge – Hilfe',
    intro: 'Das 52-Wochen-Prinzip: jede Woche etwas mehr sparen — bis zur großen Summe am Ende.',
    sections: [
      { title: 'Prinzip', content: 'Woche 1 = Basisbetrag (z. B. 10 €), Woche 2 = 20 €, … bis Woche 52. Basis in Einstellungen wählbar (5/10/20/25 €).' },
      { title: 'Abhaken', content: 'Woche antippen = gespart. Nochmal tippen = rückgängig. Oben siehst du Gesamtsumme und Fortschritt.' },
      { title: 'Budget-Verknüpfung', content: 'Mit „Im Budget buchen" wird beim Abhaken eine Einnahme erfasst — im Budget sichtbar. Beim Rückgängigmachen wird der Eintrag entfernt.' },
      { title: 'Ziel', content: 'Bei 10 € Basis sparst du am Ende 13.780 € über 52 Wochen — Motivation durch sichtbare Kästchen.' },
    ],
    tips: [
      'Direkt beim Abhaken aufs Sparkonto überweisen — dann bleibt das Geld wirklich gespart.',
    ],
  },
  planer: {
    title: 'Monatsplaner – Hilfe',
    intro: 'Aufgaben und Notizen ohne festes Datum — jeden Monat neu nutzbar.',
    sections: [
      { title: 'Aufgaben', content: 'Titel, Priorität (niedrig/mittel/hoch), optional Woche W1–W5. Checkbox = erledigt. Stift zum Bearbeiten.' },
      { title: 'Wochenfilter', content: 'Oben: Alle oder W1–W5. Die aktuelle Kalenderwoche ist hervorgehoben. Sortierung nach Priorität.' },
      { title: 'Fortschritt', content: 'Balken oben zeigt Anteil erledigter Aufgaben im aktuellen Filter.' },
      { title: 'Notizen', content: 'Freitext pro Monat — z. B. Termine, Ideen, Reflexion. Bearbeiten und löschen möglich.' },
    ],
    tips: [
      'Wichtiges in W1 legen — fokussierter Monatsstart.',
    ],
  },
  ziele: {
    title: 'Ziele – Hilfe',
    intro: 'Persönliche Meilensteine mit optionalem Bezug zu deinen Gewohnheiten.',
    sections: [
      { title: 'Ziel anlegen', content: 'Titel, Zielwert, Einheit (kg, Bücher, Mal, % …) und optionale Deadline. Beispiel: „5 kg abnehmen" statt nur „abnehmen".' },
      { title: 'Fortschritt manuell', content: '+/− passt den Stand an. Stift bearbeitet alle Felder.' },
      { title: 'Gewohnheiten verknüpfen', content: 'Beim Erstellen/Bearbeiten Habits auswählen. Auf der Karte: heute erledigt?, Wochen-Completions, bester Streak, Link zu Gewohnheiten.' },
      { title: 'Fortschritt aus Gewohnheiten', content: 'Optional aktivieren: Der Stand zählt automatisch alle Completions der verknüpften Habits der letzten 30 Tage (gedeckelt aufs Ziel). Aktualisiert sich beim Abhaken in Gewohnheiten — kein manuelles + nötig.' },
      { title: 'Ziel erreicht', content: 'Bei 100 %: Erfolgsmeldung und Abzeichen „Ziel erreicht" in den Erfolgen.' },
    ],
    tips: [
      'Gewohnheits-Ziele: Einheit „Mal" oder „Tage" + „Fortschritt aus Gewohnheiten" = automatische Fortschrittszählung.',
    ],
  },
  statistik: {
    title: 'Statistik – Hilfe',
    intro: 'Trends und Zusammenhänge — aus allen Modulen in einer Ansicht.',
    sections: [
      { title: 'Life Score', content: 'Gesamtwert mit 5 Teilbalken (Gewohnheiten, Wellness, Budget, Fokus, Reflexion). Chart zeigt Verlauf je nach Filter (7/30 Tage oder 12 Monate).' },
      { title: 'Wochenreport', content: 'Text-Zusammenfassung zum Teilen oder Kopieren — Life Score, Gewohnheiten, Budget, Meal Prep. Regelbasiert, keine KI.' },
      { title: 'Insights', content: 'Automatische Hinweise: Schlaf vs. Habits, Budget, Meal Prep vs. Lebensmittel, Ziele mit offenen Habits.' },
      { title: 'Charts', content: 'Gewohnheiten (%), Ausgaben (€), Fokus (Min.) — Zeitraum oben umschaltbar.' },
      { title: 'CSV-Export', content: 'Download mit Life Score, Kennzahlen und Summen — z. B. für eigene Auswertung in Excel.' },
      { title: 'Weitere Auswertungen', content: 'Rückblick = Monats/Jahr-Übersicht. Wochenreview = Reflexion mit Export. Erfolge = Abzeichen.' },
    ],
    tips: [
      'Sonntags: Statistik + Wochenreview-Export = vollständiges Wochenbild.',
    ],
  },
  rueckblick: {
    title: 'Rückblick – Hilfe',
    intro: 'Monats- und Jahresübersicht über Gewohnheiten, Wellness, Finanzen und mehr.',
    sections: [
      { title: 'Monatsansicht', content: 'Pfeile wählen den Monat. Kacheln: Gewohnheiten-%, Wasser-Tage, Budget, Stimmung, Schlaf, Fokus, Tagebuch.' },
      { title: 'Jahresansicht', content: '12-Monats-Charts und Highlights (bester Monat, höchste Ausgaben usw.).' },
      { title: 'Monats-Kacheln', content: 'In der Jahresansicht Monat antippen → springt in die Monatsdetail-Ansicht.' },
      { title: 'Hinweis', content: 'Spar-Challenge und Planer haben kein exaktes Datum pro Eintrag — dort siehst du den aktuellen Gesamtstand.' },
    ],
    tips: [
      'Monatsende: Rückblick + Wochenreview = gute Reflexion.',
    ],
  },
  erfolge: {
    title: 'Erfolge – Hilfe',
    intro: 'Abzeichen für Meilensteine — werden automatisch freigeschaltet.',
    sections: [
      { title: 'Freischalten', content: 'Kein manuelles Beantragen: Die App prüft deine Daten (Streaks, Life Score, Spar-Wochen, Rezepte …) und schaltet Erfolge frei.' },
      { title: 'Fortschritt', content: 'Graue Abzeichen zeigen einen Balken — wie nah du dran bist (z. B. 7/7 Streak-Tage).' },
      { title: 'Beispiele', content: 'Life Balance (Score 75+), Wochenstarter (Sonntags-Ritual), Ziel-Verknüpfer, Meal Prep Pro (volle Woche), Rezept-Sammler (5 Rezepte).' },
    ],
    tips: [
      '7-Tage-Streak bei einer Gewohnheit → „Woche der Disziplin".',
    ],
  },
  wochenritual: {
    title: 'Sonntags-Ritual – Hilfe',
    intro: 'Geführter Wochenstart in 5 Schritten — ideal sonntags oder montags.',
    sections: [
      { title: 'Schritt 1 – Rückblick', content: 'Deine Woche in Zahlen (Life Score, Gewohnheiten, Budget, Fokus). Optional Wochenreview öffnen und Eintrag schreiben.' },
      { title: 'Schritt 2 – Fokus-Gewohnheiten', content: 'Bis zu 3 Gewohnheiten als Priorität für die neue Woche — die Anzahl erscheint im Fokus-Woche-Banner auf dem Dashboard.' },
      { title: 'Schritt 3 – Fokus-Woche', content: 'Volle Woche (alles sichtbar) · Leichte Woche (weniger Module) · Nur Basics (Gewohnheiten, Wellness, Budget, Einkauf).' },
      { title: 'Schritt 4 – Meal Prep', content: 'Fortschritt des Wochenplans — Link zu Essen, wenn noch Lücken sind.' },
      { title: 'Schritt 5 – Budget', content: 'Monats-Ausgaben vs. Limit — Link zum Budget.' },
      { title: 'Abschluss', content: 'Life Score Wochenreport teilen oder kopieren. Ritual gilt pro Kalenderwoche — Dashboard erinnert, bis es erledigt ist.' },
    ],
    tips: [
      'Ritual + Wochenreview-Export = Planung und Reflexion in einem Durchgang.',
    ],
  },
  wochenreview: {
    title: 'Wochenreview – Hilfe',
    intro: 'Kurz reflektieren, klar in die nächste Woche starten.',
    sections: [
      { title: 'Woche in Zahlen', content: 'Automatische Zusammenfassung: Life Score mit Aufschlüsselung, Gewohnheiten, Budget, Fokus, Meal Prep, Einkauf, verknüpfte Ziele.' },
      { title: 'Drei Fragen', content: 'Was lief gut? · Was kann besser werden? · Fokus nächste Woche? — Schreibimpulse unter jeder Frage zum Antippen.' },
      { title: 'Export mit Life Score', content: '„Export teilen" oder „.txt": Vollständiger Life-Score-Wochenreport plus deine Antworten und alle Zahlen. Ideal für Journal oder Accountability.' },
      { title: 'Sonntags-Ritual', content: 'Die goldene Karte darunter startet den geführten Wochenbeginn — ergänzt das Review um Fokus und Planung.' },
      { title: 'Gespeicherte Reviews', content: 'Frühere Wochen bleiben in der Liste — bearbeiten oder löschen per Stift/Mülleimer.' },
    ],
    tips: [
      '10 Minuten reichen — Regelmäßigkeit schlägt Perfektion.',
    ],
  },
  einstellungen: {
    title: 'Einstellungen – Hilfe',
    intro: 'Profil, Darstellung, Modul-Optionen, Backup und Konto.',
    sections: [
      { title: 'Profil', content: 'Name, E-Mail, Passwort ändern. Alles lokal auf diesem Gerät gespeichert.' },
      { title: 'Erscheinungsbild', content: 'Dunkel, Hell oder System (folgt dem Handy).' },
      { title: 'Gewohnheiten & Erinnerungen', content: 'Morgen-Zusammenfassung (9:00), abendliche Streak-Warnung und Uhrzeit. Einzelne Gewohnheiten haben eigene Erinnerungszeiten.' },
      { title: 'Essen & Finanzen', content: '„Einkauf ins Budget übernehmen": Nach kompletter Einkaufsliste Dialog für Ausgaben-Buchung.' },
      { title: 'Wellness & Timer', content: 'Wasserziel, Glasgröße, Pomodoro-Fokus- und Pausenlänge, Spar-Challenge-Basis (5–25 €).' },
      { title: 'Backup', content: 'JSON exportieren/importieren — bei Handywechsel oder vor „Daten zurücksetzen" unbedingt nutzen!' },
      { title: 'Daten zurücksetzen', content: 'Löscht alle Inhalte, Konto bleibt. Mit Sicherheitsabfrage.' },
      { title: 'Abo & Konto', content: 'Abo-Status, Kündigung, Konto löschen. Rechtliches über Impressum/Datenschutz in der App.' },
    ],
    tips: [
      'Monatlich Backup exportieren — Browser-Cache-Löschung kann lokale Daten entfernen.',
    ],
  },
}