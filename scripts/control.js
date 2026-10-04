// WheelControl

import { WheelDisplay, gewinnerText, maskiere } from "./wheel.js";

const MODUL = "ninjos-player-wheel";

/**
 * Dreht das Rad fuer alle: Gewinner ziehen, Drehung an jeden Client schicken,
 * nach der Animation den Gewinner als erledigt speichern und im Chat melden.
 *
 * Der Knopf im Fenster und `api.spinWheel()` fuer Makros gehen beide hier
 * durch, damit ein Dreh aus einem Makro genauso zaehlt wie einer per Hand.
 *
 * @param {object} [optionen]
 * @param {string} [optionen.label]  Text ueber dem Gewinner nur fuer diesen
 *   Dreh, etwa "Wer haelt Wache?". Ohne ihn gilt die Einstellung, ohne die
 *   der Sprachstandard.
 * @returns {Promise<object>|null}  Erfuellt sich mit dem Gewinner, sobald er
 *   gespeichert ist; `null`, wenn nicht gedreht wurde.
 */
export function drehen({ label } = {}) {
    if (!game.user.isGM) return null;
    const players = game.settings.get(MODUL, "players");
    const candidates = players.filter(p => !p.wasSelected && p.active);

    if (candidates.length === 0) {
        ui.notifications.warn(game.i18n.localize("WHEEL.Control.NoCandidates"));
        return null;
    }

    // Pick winner
    const winner = candidates[Math.floor(Math.random() * candidates.length)];

    // If only 1 player, we do a quick reveal (instant).
    // If multiple, we do a long suspenseful spin.
    const isInstant = candidates.length === 1;
    const duration = isInstant ? 1000 : 8000;

    // Ein eigener Text reist mit dem Dreh, damit alle denselben sehen. Ohne
    // ihn bleibt `label` leer, und jeder Client zeigt den Standard in seiner
    // eigenen Sprache.
    const eigen = String(label ?? game.settings.get(MODUL, "winnerLabel") ?? "").trim();
    const spinData = {
        type: "spin",
        winner,
        segments: candidates,
        duration,
        isInstant,
        label: eigen || null
    };

    // Broadcast to everyone, and show it for the GM as well
    game.socket.emit(`module.${MODUL}`, spinData);
    WheelDisplay.show(spinData);

    // Delayed result, synchronized with the wheel animation
    return new Promise(resolve => setTimeout(async () => {
        const currentPlayers = game.settings.get(MODUL, "players");
        const original = currentPlayers.find(p => p.id === winner.id);
        if (original) original.wasSelected = true;

        // Auto-Reset Check
        if (!currentPlayers.some(p => !p.wasSelected && p.active)) {
            currentPlayers.forEach(p => p.wasSelected = false);
            ui.notifications.info(game.i18n.localize("WHEEL.Notify.AutoReset"));
        }

        // Erst speichern, dann melden: Bis 14.2610.1 stand die Chatnachricht
        // davor, und weil ihr `CONST.CHAT_MESSAGE_TYPES` in Foundry 14 nicht
        // mehr existiert, kam das Speichern nie an. Das Rad zog dieselben
        // Leute immer wieder.
        await game.settings.set(MODUL, "players", currentPlayers);
        try {
            await ChatMessage.create({ content: chatInhalt(winner.name, gewinnerText(spinData.label)) });
        } catch (err) {
            console.error("Player Wheel | Chat message failed", err);
        }
        resolve(winner);
    }, duration));
}

function chatInhalt(name, label) {
    const t = key => game.i18n.localize(key);
    return `
        <div style="text-align: center; font-family: var(--font-primary, serif);">
            <h2 style="color: #782e22; border-bottom: 1px solid #782e22; margin-bottom: 5px;">${maskiere(label)} ${t("WHEEL.Chat.Fallen")}</h2>
            <div style="font-size: 2em; font-weight: bold; color: #daa520; text-shadow: 1px 1px 0 #000;">${maskiere(name)}</div>
            <p style="font-style: italic; color: #4b4a44;">${t("WHEEL.Chat.ByWheel")}</p>
        </div>
    `;
}

export class WheelControl extends FormApplication {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "ninjos-player-wheel-control",
            title: "Ninjo's Player Wheel",
            template: "modules/ninjos-player-wheel/templates/control.hbs",
            width: 450,
            height: "auto",
            classes: ["ninjos-player-wheel-window"],
            closeOnSubmit: false,
            submitOnClose: false
        });
    }

    getData() {
        // Get all players
        let players = game.settings.get("ninjos-player-wheel", "players") || [];

        // Return data for template
        return {
            players: players,
            hasPlayers: players.length > 0,
            canSpin: players.filter(p => p.active && !p.wasSelected).length >= 1,
            isGM: game.user.isGM
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // Player Management
        html.find(".player-add").click(this._onAddPlayer.bind(this));
        html.find(".player-remove").click(this._onRemovePlayer.bind(this));
        html.find(".player-toggle").click(this._onTogglePlayer.bind(this));
        html.find(".player-reset").click(this._onResetStatus.bind(this));
        html.find(".player-name-input").change(this._onNameChange.bind(this));

        // Spin
        html.find(".spin-button").click(this._onSpin.bind(this));
        html.find(".close-wheel-button").click(this._onCloseWheel.bind(this));
    }

    async _onNameChange(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const newName = event.currentTarget.value;
        const players = game.settings.get("ninjos-player-wheel", "players");

        if (players[index]) {
            players[index].name = newName;
            await game.settings.set("ninjos-player-wheel", "players", players);
        }
    }

    async _updateObject(event, formData) {
        // Not used for standard form submission, we use actions
    }

    async _onAddPlayer(event) {
        event.preventDefault();
        const players = game.settings.get("ninjos-player-wheel", "players");

        // Harmonic Palette (Jewel Tones & Earth Tones)
        const palette = [
            "#541811", // Deep Red
            "#1b4d3e", // Forest Green
            "#1f2e54", // Navy Blue
            "#4a2c58", // Plum Purple
            "#8b5a2b", // Bronze/Brown
            "#702963", // Byzantium
            "#004242", // Deep Teal
            "#5c0002"  // Blood Red
        ];

        // Pick a random color
        const randomColor = palette[Math.floor(Math.random() * palette.length)];

        players.push({
            id: foundry.utils.randomID(),
            name: game.i18n.localize("WHEEL.Config.NewPlayer"),
            color: randomColor,
            wasSelected: false,
            active: true
        });
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    async _onRemovePlayer(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const players = game.settings.get("ninjos-player-wheel", "players");
        if (!await this._frageEntfernen(players[index]?.name ?? "")) return;
        players.splice(index, 1);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    /**
     * Wirklich entfernen?
     *
     * Ein Spieler war mit einem Tipp aus der Liste, und es gibt kein
     * Rueckgaengig - die Liste ist eine Welteinstellung, keine
     * Dokumenthistorie. Also fragen wir.
     *
     * `DialogV2` und nicht der alte Dialog: Dass die Fenster dieses Moduls
     * noch auf `FormApplication` stehen, zwingt nicht dazu, auch die
     * Nachfragen alt zu bauen - und es ist derselbe Dialog wie in den
     * uebrigen Ninjo-Modulen. Wegklicken und Escape zaehlen als Nein.
     */
    async _frageEntfernen(name) {
        return foundry.applications.api.DialogV2.confirm({
            window: { title: game.i18n.localize("WHEEL.Confirm.RemoveTitle") },
            content: `<p>${game.i18n.format("WHEEL.Confirm.RemoveBody", { name })}</p>`,
            yes: { label: game.i18n.localize("WHEEL.Confirm.RemoveYes") },
            no: { label: game.i18n.localize("WHEEL.Confirm.Cancel"), default: true },
            rejectClose: false
        });
    }

    async _onTogglePlayer(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const players = game.settings.get("ninjos-player-wheel", "players");
        players[index].active = !players[index].active;
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    async _onResetStatus(event) {
        event.preventDefault();
        const players = game.settings.get("ninjos-player-wheel", "players");
        players.forEach(p => p.wasSelected = false);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    async _onSpin(event) {
        event.preventDefault();
        const lauf = drehen();
        if (!lauf) return;

        // Auto Close Window
        if (game.settings.get("ninjos-player-wheel", "autoCloseControl")) {
            this.close();
        }
        lauf.then(() => this.render());
    }

    async _onCloseWheel(event) {
        event.preventDefault();

        // Emit Socket (broadcast to everyone)
        game.socket.emit("module.ninjos-player-wheel", { type: "close" });

        // Also close for GM
        WheelDisplay.closeAll();

        ui.notifications.info(game.i18n.localize("WHEEL.Notify.ClosedForAll"));
    }
}
