# Changelog

## [1.0.3] - Instant Single Player Celebration
- Enhanced the single-player spin experience: If only one valid player remains on the wheel, the large wheel graphic will now stay hidden, instantly transitioning into the grand confetti and overlay celebration.

## [1.0.2] - Action & Core Settings Hotfix
- Fixed an issue where GitHub Actions was attempting to publish to the Foundry Package Registry with a missing token, causing the release pipeline to fail.
- Added new "Auto-Close Control Window" Module Setting (enabled by default) to automatically dismiss the GM's player list immediately after spinning the wheel.

## [1.0.1] - UI Overhaul & Cleanup
- Fully redesigned layout replacing the split-pane with a modern, compact single-column approach matching the D&D 5e Book FANG Theme.
- Removed unused manual "close window" button since the wheel natively auto-closes across all clients after revealing a winner.
- Fixed missing localization keys in `de.json` and `en.json` for the configure/control panels.

## [1.0.0] - Initial Release
- Brand new module! Renamed from experimental "ninjos-player-wheel" to "Ninjo's Player Wheel".
- Full integration with Foundry VTT settings to track players.
- Added visual and auditory celebratory feedback when a player is selected.
- Compatibility with Monk's Common Display for full party viewing.
- Implemented auto-reset behavior when all players have spun the wheel.
- German and English localization.
