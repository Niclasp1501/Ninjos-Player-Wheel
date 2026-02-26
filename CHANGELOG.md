# Changelog

## [1.0.9] - Foundry V13 Scene Control Button Support
- **Major Fix:** Fully resolved compatibility issues with Foundry V13's Token Controls sidebar. The Player Wheel (☸️) tool now flawlessly injects as an action button, conforming to V13's strict `onChange` ApplicationV2 event expectations and Object-based control arrays.
- Removed deprecated array-push injection patterns for V13 to prevent missing buttons and click failures.

## [1.0.8] - Foundry V13 Tool Execution Fix
- Fixed an issue in Foundry V13 where the Token Control tool button was visible but failed to execute its action. Included strict `onClick` assignment to `controls.token.tools` array to abide by V13 strict object property rules.

## [1.0.7] - Foundry V13 Syntax Fix Complete
- Fully implemented the explicit V13 syntax for custom Scene Control tools. The `.tools` property in V13 is now a keyed object, not an array. The button now injects flawlessly into the left Token bar.

## [1.0.6] - Foundry V13 Compatibility Fix
- Fixed a breaking change introduced in Foundry V13 where the `getSceneControlButtons` hook provides an object map instead of an array.
- Fixed the button injection targeting the V13 renamed `tokens` group (formerly `token`). The tool icon now correctly appears in the left sidebar on V13.

## [1.0.5] - Dedicated Tool Icon / UI Relocation
- Due to UI collisions in the Foundry Player List, the launch button has been relocated to its native, intended spot: The **Token Controls** toolbar (left side of the screen). Look for the ☸️ icon!
- Cleaned up the injected CSS that is no longer needed.

## [1.0.4] - Launch Button & Documentation Fixes
- Implemented a convenient new "☸️ Player Selection" button directly at the bottom of the Foundry Player List box (bottom left of the screen) for Game Masters to quickly launch the wheel.
- Completely scrubbed and corrected `README.md`, removing false information about non-existent module buttons and clarifying the exact hotkeys (`Shift + W`) and UI locations to launch the tool.

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
