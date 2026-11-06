# Agent Notes


## Oberfläche: die acht Regeln

Sie stehen vollständig in der [CLAUDE.md des Workspace](../../CLAUDE.md),
Abschnitt „Regelgrundsätze für die Oberfläche der Foundry-Module", und gelten
für jedes Modul: Fenster passen ins Bild · die Marke steht in einer Datei · die
Schrift liefert Foundry · kein sichtbarer Text ohne Sprachschlüssel · die
Rückmeldung steht dort, wo der Mensch hinschaut · jeder Knopf hat einen Namen ·
Unwiderrufliches fragt vorher · neue Fenster sind ApplicationV2.

Zwei Dateien werden dafür **kopiert, nicht geteilt** — wie `willkommen.js`:

| Datei | Angepasst wird |
|---|---|
| `styles/ninjo-marke.css` | nichts, sie ist überall identisch |
| `scripts/fensterpassen.js` | nur der `MODUL`-Block ganz oben |

Verbessert man eine davon, gehört sie in alle Module nachgezogen.

### Was hier gilt

**Fensterklassen:** `ninjos-player-wheel-window` und `wheel-config`.

**Am 07.09.2026 aufgeräumt:** Die Einstellungsnamen, die Tastenkürzel-Texte, der
Standardname eines neuen Spielers und der eine deutsche Toast liefen an den
Sprachdateien vorbei und stehen jetzt als Schlüssel darin. Die Symbolknöpfe in
beiden Listen sind echte `<button>` mit `aria-label` statt `<a>` ohne
Ziel, der Umschalter trägt `aria-pressed`. Und **das Entfernen fragt nach**:
`frageEntfernen()` in `control.js`, mit `DialogV2`, für beide Listen.

**Seit 14.2611.1 ist alles ApplicationV2** (`HandlebarsApplicationMixin`),
keine Zeile mehr auf `Application` oder `FormApplication`. Die Knöpfe laufen
über `data-action` und `DEFAULT_OPTIONS.actions`, die Formulare über
`form.handler`: im Steuerfenster mit `submitOnChange` für die Namen, im
Einstellungsfenster mit `closeOnSubmit` wie vorher. Geöffnet wird über
`steuerungOeffnen()` und `WheelConfig.oeffnen()`, die ein offenes Fenster nach
vorn holen statt ein zweites mit derselben Kennung anzulegen. Das Rad behält
seinen Rahmen samt `.window-content` und die Kennung
`#ninjos-player-wheel-display`, weil das CSS darauf zielt.

**Noch offen:** die Inline-Styles in `templates/config.hbs` und
`templates/control.hbs` nach `styles/module.css` ziehen. Die aus `wheel.js`
sind seit 14.2611.1 die Klasse `winner-overlay-sofort`.

**`common-display`** am Rad-Fenster ist eine Kopplung an Monk's Common Display.
Sie ist nirgends dokumentiert und niemand weiß mehr, ob sie noch gebraucht wird.
