# Ninjo's Player Wheel

![Foundry Version](https://img.shields.io/badge/Foundry-v13--v14-informational)
![License](https://img.shields.io/badge/License-MIT-green)

A lightweight spinning wheel module for Foundry VTT to randomly select players in a clear and fun way.

## Quick Start

1. Install the module via the stable manifest or beta manifest.
2. Enable the module in your world.
3. Open the wheel with `Shift + W` as GM.
4. Or click the wheel icon in the Token Controls bar.
5. Spin and auto-track selected players.

## Installation

Stable manifest:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/latest/download/module.json`

Beta manifest:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/download/beta-latest/module-beta.json`

## Compatibility Matrix

| Module Version | Foundry Minimum | Foundry Verified | Foundry Maximum |
| --- | --- | --- | --- |
| 14.x.x | 13 | 14 | 14 |

## Features

- Dynamic spin timing for suspense.
- Fair rotation with done-state tracking.
- Optional auto-close after winner reveal.
- English and German language packs.
- Token Controls toolbar integration.

## Troubleshooting

- Wheel button does not appear:
  - Make sure you are GM.
  - Open Token Controls once; some UI modules delay injection.
  - Disable conflicting toolbar/UI modules and retest.
- `Shift + W` does not open the control:
  - Check keybinding conflicts in Foundry keybindings.
- Spin does not show for players:
  - Ensure socket connection is active and all clients loaded the module.
- Beta install does not update:
  - Reinstall using the beta manifest URL above and refresh the browser cache.

## Development

### Beta release workflow

The beta workflow runs on pushes to `beta` (or manual dispatch) and does:

- Version prefix enforcement (`14.x.x`).
- Manifest structure validation.
- JSON validation for module and language files.
- JavaScript syntax checks for `scripts/*.js`.
- Beta prerelease publishing to `beta-latest` with generated release notes.

## Deutsch (Kurzfassung)

### Installation

Stabil:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/latest/download/module.json`

Beta:
`https://github.com/Niclasp1501/Ninjos-Player-Wheel/releases/download/beta-latest/module-beta.json`

### Nutzung

- Als Spielleiter mit `Shift + W` oeffnen.
- Oder ueber das Rad-Icon in den Token Controls.

### Kompatibilitaet

- Modul `14.x.x` fuer Foundry `13-14` (verified/max: `14`).

## License

MIT
