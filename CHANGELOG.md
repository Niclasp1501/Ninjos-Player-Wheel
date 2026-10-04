# Changelog

## [14.2610.1] - Your own text above the winner, and a wheel that remembers again

### Added
- **Text above the winner.** A new module setting replaces "Chosen:" above the drawn name and in the chat message with your own text, for example for a game that is not D&D. Everyone at the table sees the GM's text; left empty, each player sees the default in their own language. Suggested by MostSmoothestBrain in #2.
- **Settings straight from the wheel.** A sliders button in the red banner of the control window opens Foundry's settings on the wheel's own tab, as in Ninjo's Shops. GMs only.
- **Import player characters.** A new button takes every player who has a character assigned and adds them to the list under the character's name, in a colour that is still free on the wheel. Importing again adds nobody twice: it only follows a renamed character, and a name you already typed in by hand is linked instead of duplicated.
- **`api.spinWheel({ label })` for macros.** A real spin for everyone, exactly like the button, with an optional text for this one spin ("Who keeps watch?").
- **The welcome window mentions Patreon.** Below the link to Ninjo's Forge, one line now says that the modules are free and stay free, and that you can support the work on Patreon and get premium add-ons. Only GMs see the window, and "Don't show again" still hides it for good.

### Fixed
- **New did nothing on Foundry 14.** It called `randomID()`, which Foundry 14 no longer provides as a global. Reported with the fix by MostSmoothestBrain in #1, thank you. The settings window had the same call, and `mergeObject` and `expandObject` are now taken from `foundry.utils` as well.
- **The wheel kept drawing the same people on Foundry 14.** After every spin the chat message used `CONST.CHAT_MESSAGE_TYPES`, which Foundry 14 removed. The error stopped the step that marks the winner as done, so nobody was ever marked, no chat message appeared and the automatic reset never ran. The winner is now saved first, and the message no longer sets a type.
- The text above the winner ("Auswahl:") and the chat message were German in every language. They now come from the language files, and the automatic reset no longer appends an English "(Auto-Reset)" to a German message.
- **Saving the player settings dropped every player's id.** The form only knows name, colour and the two checkboxes and rebuilt the list from them, so afterwards the wheel marked the first player as drawn whoever had won. The other fields are now kept.
- Player names are escaped before they are shown, so a name like `<b>` is shown as text.
- The chat message used Modesto Condensed, which has no German umlauts. It uses Foundry's font now.
- The welcome texts no longer use dashes as punctuation.
- Three buttons showed their raw language key as tooltip ("Add new player", "Reset status", and the "selected recently" checkbox in the settings). The templates had a space in front of the key, so Foundry never found it.
- The English interface was missing the texts for "Add new player", "Remove" and "Enable/Disable", and both languages were missing the tooltip on the trophy of a player who was already selected.

## [14.0.1-beta] - Beta CI Hardening and Documentation Upgrade
- Beta workflow now runs only when relevant files change (`module.json`, `scripts`, `styles`, `templates`, `languages`, workflow file).
- Added stronger CI checks in beta: manifest structure validation, JSON validation, and JavaScript syntax checks.
- Added generated beta release notes from the latest changelog section.
- Reworked README with compatibility matrix, beta install path, and troubleshooting guidance.

## [14.0.0] - Foundry-Versioned Module Semver
- Switched module versioning to start with `14.x.x` so the highest supported Foundry generation is visible at a glance.
- Added workflow validation to enforce the `14.x.x` version prefix for stable and beta releases.

## [1.1.0] - Foundry V14 Compatibility and Beta Channel
- Set module compatibility range to Foundry VTT 13-14 (`minimum: 13`, `verified: 14`, `maximum: 14`).
- Added a beta release workflow (`.github/workflows/release-beta.yml`) modeled after FANG.
- Updated the stable release workflow name/details for clear FVTT 13-14 targeting.

## [1.0.10] - Standardized Foundry Compatibility Metadata
- Updated module.json to include the typical Foundry compatibility range fields: minimum, verified, and maximum.
- This makes the supported Foundry generation explicit in release metadata and easier to read at a glance.

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


