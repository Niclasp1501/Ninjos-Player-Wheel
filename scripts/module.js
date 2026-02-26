import { WheelConfig } from "./config.js";
import { WheelDisplay } from "./wheel.js";
import { WheelControl } from "./control.js";
import "./confetti.min.js"; // Side-effect import to load into window

try {
    Hooks.once("init", () => {
        console.log("Player Wheel | Initializing");

        // 1. Register Settings
        game.settings.register("ninjos-player-wheel", "players", {
            name: "Players List",
            hint: "List of players for the wheel.",
            scope: "world",
            config: false,
            type: Object,
            default: []
        });

        // 2. Register Client Setting (Auto Close Control)
        game.settings.register("ninjos-player-wheel", "autoCloseControl", {
            name: "WHEEL.Settings.AutoCloseControl.Name",
            hint: "WHEEL.Settings.AutoCloseControl.Hint",
            scope: "client",
            config: true,
            type: Boolean,
            default: true
        });

        // 3. Register Menu (Appears in Configure Settings -> Module Settings)
        game.settings.registerMenu("ninjos-player-wheel", "config", {
            name: "Recap Wheel Config",
            label: "Manage Wheel Players",
            hint: "Add or remove players from the wheel.",
            icon: "fas fa-users-cog",
            type: WheelConfig,
            restricted: true
        });

        // 3. Register Keybinding (Shift + W to avoid Reload accidents)
        game.keybindings.register("ninjos-player-wheel", "openControl", {
            name: "Open Player Wheel",
            hint: "Opens the dialog to select players and spin the wheel.",
            editable: [
                { key: "KeyW", modifiers: ["Shift"] }
            ],
            onDown: () => {
                if (game.user.isGM) {
                    new WheelControl().render(true);
                    return true;
                }
                return false;
            },
            restricted: true, // GMs only
            precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
        });

        // 4. Expose API for Macros
        game.modules.get("ninjos-player-wheel").api = {
            openControl: () => new WheelControl().render(true),
            openConfig: () => new WheelConfig().render(true),
            spin: (data) => WheelDisplay.show(data)
        };
    });

    // Remove the old sidebar button logic entirely.

} catch (error) {
    console.error("Player Wheel | CRITICAL ERROR:", error);
}

Hooks.on("ready", () => {
    game.socket.on("module.ninjos-player-wheel", (data) => {
        if (data.type === "spin") {
            const userId = game.user.id;
            if (data.targetUsers && !data.targetUsers.includes(userId)) {
                return;
            }
            WheelDisplay.show(data);
        } else if (data.type === "close") {
            WheelDisplay.closeAll();
        }
    });

    // Notify GM that module is ready
    if (game.user.isGM) {
        console.log("Player Wheel | Ready. Press Shift+W or click the Player List button to open.");
    }
});

// 5. Inject Button into Scene Controls (Token Bar)
Hooks.on('getSceneControlButtons', (controls) => {
    // Only show to GMs
    if (!game.user || !game.user.isGM) return;

    // V12 backward compatibility: controls is an Array
    if (Array.isArray(controls)) {
        let tokenGroup = controls.find(c => c.name === "token" || c.name === "tokens");
        if (tokenGroup && Array.isArray(tokenGroup.tools)) {
            tokenGroup.tools.push({
                name: "player-wheel",
                title: "WHEEL.Control.Title",
                icon: "fas fa-dharmachakra",
                button: true,
                visible: true,
                onClick: () => {
                    const windowExists = Object.values(ui.windows).some(w => w.id === "ninjos-player-wheel-control");
                    if (windowExists) return;
                    game.modules.get("ninjos-player-wheel").api.openControl();
                }
            });
        }
    }
    // V13+ compatibility according to official documentation API
    else {
        // Fallback to controls.token if controls.tokens is undefined (some modules mess with this)
        let tokenGroup = controls.tokens || controls.token;
        if (tokenGroup && tokenGroup.tools) {
            tokenGroup.tools.playerWheel = {
                name: "playerWheel", // V13 prefers camelCase for the key/name mapping
                title: "WHEEL.Control.Title",
                icon: "fas fa-dharmachakra",
                order: Object.keys(tokenGroup.tools).length,
                button: true,
                visible: true,
                onChange: () => {
                    const windowExists = Object.values(ui.windows).some(w => w.id === "ninjos-player-wheel-control");
                    if (windowExists) return;
                    game.modules.get("ninjos-player-wheel").api.openControl();
                }
            };
        }
    }
});
