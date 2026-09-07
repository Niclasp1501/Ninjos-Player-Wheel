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
Ziel, der Umschalter trägt `aria-pressed`. Und **das Entfernen fragt nach** —
`_frageEntfernen()` in `control.js` und `config.js`, mit `DialogV2`,
obwohl die Fenster selbst noch alt sind.

**Offen, und hier am billigsten zu haben:** Das Modul steht mit drei Fenstern
und 825 Zeilen noch auf `FormApplication`. Es ist das kleinste im Portfolio
und damit der richtige Ort, die Ablösung nach ApplicationV2 einmal komplett
durchzuexerzieren — danach ist es das Muster für das MCP-Modul. Dabei
gleich die 25 Inline-Styles aus den Vorlagen in `styles/module.css` ziehen.

**`common-display`** am Rad-Fenster ist eine Kopplung an Monk's Common Display.
Sie ist nirgends dokumentiert und niemand weiß mehr, ob sie noch gebraucht wird.
