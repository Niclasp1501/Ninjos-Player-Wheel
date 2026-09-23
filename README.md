# Ninjo's Player Wheel

![Foundry Version](https://img.shields.io/badge/Foundry-v13--v14-informational)
![License](https://img.shields.io/badge/License-MIT-green)

A wheel of fortune for Foundry VTT that everyone watches at the same time, and that makes sure
everybody gets a turn before anyone gets a second one.

*(Scroll down for the German version / Weiter unten auf Deutsch)*

---

## 🇬🇧 English

"Who goes first?" "Who hasn't had a turn yet?" "Who opens the door that's ticking so strangely?"
Instead of arguing about it, you just spin the wheel. Ninjo's Player Wheel shows everyone in the
game the same wheel of fortune, lets it spin for eight seconds and slowly roll to a stop, and at
the end a name sits in the middle, with a shower of confetti.

It works for anything that should be shared out fairly: who takes the spotlight in the next scene,
who gets first pick of the loot, or who has to pull the lever nobody is quite sure about.

### Fair, even across several nights

Whoever gets picked counts as done and stays off the wheel until everyone else has had their turn
too. Then the round starts over by itself. The list is saved in your world, so at the next game
night you carry on exactly where you left off.

If someone can't make it, you simply switch them off instead of deleting them. They won't appear
on the wheel, but they stay on the list until they are back. When only one name is left, the wheel
skips the long spin and shows the result straight away.

### Everyone watches

The wheel doesn't just appear on your screen. It shows up at the same time for everyone connected
to the world, and everyone sees the same spin. The result is also posted to the chat, so it can be
looked up later. A few seconds after the reveal, the wheel closes by itself for everyone.

### Getting started

Open the wheel with `Shift + W` or with the wheel icon in the token controls. Both are only
available to you as the GM. Use **New** to add names, each one gets a colour on the wheel,
and a click on **Spin the wheel!** starts the spin. **Reset** marks everyone as available again.

If you like, your control window closes by itself on every spin. You set that in the module
settings under **Auto-Close Control Window**.

### Installation

The Player Wheel is in the official Foundry package catalogue. In Foundry, open the **Add-on
Modules** tab, click **Install Module** and search for *Ninjo's Player Wheel*. Then enable it in
your world's module settings.

You can also use this manifest URL:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/latest/download/module.json`

You need Foundry VTT v13 or v14. The wheel isn't tied to any game system and works with whatever
you play in Foundry.

---

## 🇩🇪 Deutsch

„Wer fängt an?" „Wer war noch nicht dran?" „Wer öffnet die Tür, hinter der es so merkwürdig
tickt?" Statt darüber zu diskutieren, drehst du einfach am Rad. Ninjo's Player Wheel zeigt allen
in der Runde dasselbe Glücksrad, lässt es acht Sekunden lang kreisen und langsam ausrollen, und am
Ende steht ein Name in der Mitte, begleitet von einem Konfettiregen.

Das eignet sich für alles, was fair verteilt werden soll: wer in der nächsten Szene im Mittelpunkt
steht, wer sich zuerst etwas aus der Beute nehmen darf, oder wer den Hebel ziehen muss, bei dem
niemand so recht weiß, was er bewirkt.

### Fair, auch über mehrere Abende

Wer ausgewählt wurde, gilt als erledigt und landet so lange nicht wieder auf dem Rad, bis alle
anderen auch einmal dran waren. Danach beginnt die Runde von selbst von vorn. Die Liste bleibt in
deiner Welt gespeichert, deshalb geht es beim nächsten Spielabend genau dort weiter, wo ihr
aufgehört habt.

Fehlt jemand, schaltest du ihn einfach ab, statt ihn zu löschen. Er taucht dann nicht auf dem Rad
auf, bleibt aber in der Liste, bis er wieder dabei ist. Ist nur noch ein Name übrig, spart sich das
Rad die lange Drehung und zeigt das Ergebnis sofort.

### Alle sehen mit

Das Rad erscheint nicht nur auf deinem Bildschirm, sondern gleichzeitig bei jedem, der mit der
Welt verbunden ist, und alle sehen dieselbe Drehung. Das Ergebnis landet zusätzlich im Chat, damit
es auch später noch nachzulesen ist. Ein paar Sekunden nach der Auflösung schließt sich das Rad bei
allen von selbst.

### So legst du los

Öffne das Rad mit `Shift + W` oder über das Radsymbol in der Token-Leiste. Beides steht nur dir als
Spielleiter zur Verfügung. Mit **Neu** fügst du Namen hinzu, jeder bekommt eine Farbe auf
dem Rad, und ein Klick auf **Am Rad drehen!** startet die Drehung. Mit **Reset** setzt du fest, dass
wieder alle dran sein dürfen.

Wenn du möchtest, schließt sich dein Steuerfenster bei jedem Dreh von selbst. Das stellst du in den
Moduleinstellungen unter **Steuerung automatisch schließen** ein.

### Installation

Das Player Wheel steht im offiziellen Foundry-Paketkatalog. Öffne in Foundry den Reiter
**Add-on-Module**, klicke auf **Modul installieren** und suche nach *Ninjo's Player Wheel*. Danach
aktivierst du es in den Moduleinstellungen deiner Welt.

Du kannst auch diese Manifest-Adresse verwenden:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/latest/download/module.json`

Du brauchst Foundry VTT v13 oder v14. Das Rad hängt an keinem Spielsystem und läuft mit jedem,
das du in Foundry spielst.

---

## Technical notes

### Beta channel

Besides the stable manifest there is a beta manifest that follows the `beta` branch:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/download/beta-latest/module-beta.json`

The beta workflow runs on pushes to `beta` or by manual dispatch. It checks the version prefix
(`14.x.x`), the manifest structure, every JSON file in the module and the syntax of
`scripts/*.js`, and then publishes a prerelease under `beta-latest` with notes taken from the
latest changelog section.

### Troubleshooting

If the wheel icon does not appear, make sure you are logged in as a GM and open the token controls
once, since some interface modules add their buttons late. If it still does not show, disable
other toolbar modules and try again. If `Shift + W` does nothing, look for a conflicting shortcut
in Foundry's keybinding settings. If players do not see the spin, every client has to have the
module enabled and loaded, because the spin is sent to them over the module socket. A beta install
that does not update is fixed by installing again from the beta manifest and reloading the browser.

---

## License / Lizenz

The Player Wheel is released under the [MIT License](LICENSE). The Ninjo logo (`assets/ninjo.png`)
is not covered by it.

Das Player Wheel steht unter der [MIT-Lizenz](LICENSE). Das Ninjo-Logo (`assets/ninjo.png`) fällt
nicht darunter.
