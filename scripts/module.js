import { RecapConfig } from "./config.js";
import { WheelDisplay } from "./wheel.js";
import { RecapControl } from "./control.js";
import "./confetti.min.js"; // Side-effect import to load into window

try {
    Hooks.once("init", () => {
        console.log("Recap Wheel | Initializing");

        // 1. Register Settings
        game.settings.register("ninjos-player-wheel", "players", {
            name: "Players List",
            hint: "List of players for the wheel.",
            scope: "world",
            config: false,
            type: Object,
            default: []
        });

        // 2. Register Menu (Appears in Configure Settings -> Module Settings)
        game.settings.registerMenu("ninjos-player-wheel", "config", {
            name: "Recap Wheel Config",
            label: "Manage Recap Players",
            hint: "Add or remove players from the wheel.",
            icon: "fas fa-users-cog",
            type: RecapConfig,
            restricted: true
        });

        // 3. Register Keybinding (Shift + W to avoid Reload accidents)
        game.keybindings.register("ninjos-player-wheel", "openControl", {
            name: "Open Recap Wheel",
            hint: "Opens the dialog to select players and spin the wheel.",
            editable: [
                { key: "KeyW", modifiers: ["Shift"] }
            ],
            onDown: () => {
                if (game.user.isGM) {
                    new RecapControl().render(true);
                    return true;
                }
                return false;
            },
            restricted: true, // GMs only
            precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
        });

        // 4. Expose API for Macros
        game.modules.get("ninjos-player-wheel").api = {
            openControl: () => new RecapControl().render(true),
            openConfig: () => new RecapConfig().render(true),
            spin: (data) => WheelDisplay.show(data)
        };
    });

    // Remove the old sidebar button logic entirely.

} catch (error) {
    console.error("Recap Wheel | CRITICAL ERROR:", error);
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
        console.log("Recap Wheel | Ready. Press Shift+R to open.");
    }
});
