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

// 5. Inject Button into Player List (GM Only)
Hooks.on("renderPlayerList", (app, html, data) => {
    if (!game.user.isGM) return;

    const button = $(`
        <button class="ninjos-player-wheel-launch-btn flexrow" title="${game.i18n.localize("WHEEL.Control.Title")}">
            <i class="fas fa-dharmachakra"></i>
            <span>${game.i18n.localize("WHEEL.Control.Title")}</span>
        </button>
    `);

    button.on("click", (e) => {
        e.preventDefault();
        // Since API structure is exposed:
        game.modules.get("ninjos-player-wheel").api.openControl();
    });

    // Append to the bottom of the Player List box
    html.append(button);
});
