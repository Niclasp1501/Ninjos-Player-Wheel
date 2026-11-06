// WheelControl

import { WheelDisplay, gewinnerText, maskiere } from "./wheel.js";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

const MODUL = "ninjos-player-wheel";

/** Kennung des Steuerfensters. Es gibt hoechstens eins. */
export const STEUERUNG_ID = "ninjos-player-wheel-control";

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

/**
 * Foundrys Einstellungen, gleich auf dem Reiter dieses Moduls. Derselbe Weg
 * wie ueber "Spieleinstellungen", nur ohne Suchen. Das Fenster ist ein
 * Einzelstueck, deshalb wird der Reiter nach dem Zeichnen gewechselt; die
 * Startkategorie gilt nur beim allerersten Oeffnen.
 */
export async function einstellungenOeffnen() {
    if (!game.user.isGM) return;
    const fenster = game.settings.sheet;
    await fenster.render({ force: true });
    try {
        fenster.changeTab(MODUL, "categories");
    } catch (err) {
        console.warn("Player Wheel | Could not switch to the module's settings tab", err);
    }
}

// Harmonic Palette (Jewel Tones & Earth Tones)
const PALETTE = [
    "#541811", // Deep Red
    "#1b4d3e", // Forest Green
    "#1f2e54", // Navy Blue
    "#4a2c58", // Plum Purple
    "#8b5a2b", // Bronze/Brown
    "#702963", // Byzantium
    "#004242", // Deep Teal
    "#5c0002"  // Blood Red
];

/** Eine Farbe, die auf dem Rad noch frei ist; erst wenn alle vergeben sind, zufaellig. */
export function freieFarbe(players) {
    const belegt = new Set(players.map(p => p.color));
    const frei = PALETTE.filter(f => !belegt.has(f));
    const auswahl = frei.length ? frei : PALETTE;
    return auswahl[Math.floor(Math.random() * auswahl.length)];
}

/**
 * Uebernimmt die Figur jedes Spielers, dem eine zugewiesen ist, mit dem Namen
 * der Figur. Ein Eintrag merkt sich die Figur (`actorId`): Ein zweiter Import
 * legt ihn nicht doppelt an, sondern zieht nur einen geaenderten Namen nach.
 * Steht derselbe Name schon von Hand in der Liste, wird dieser Eintrag mit der
 * Figur verknuepft statt verdoppelt.
 *
 * @returns {{neu: number, umbenannt: number}}
 */
export function figurenUebernehmen(players) {
    let neu = 0, umbenannt = 0;
    const gleicherName = (a, b) => a.trim().toLocaleLowerCase() === b.trim().toLocaleLowerCase();
    for (const user of game.users) {
        if (user.isGM) continue;
        const actor = user.character;
        if (!actor) continue;
        const eintrag = players.find(p => p.actorId === actor.id)
            ?? players.find(p => !p.actorId && gleicherName(p.name ?? "", actor.name));
        if (eintrag) {
            eintrag.actorId = actor.id;
            if (eintrag.name !== actor.name) { eintrag.name = actor.name; umbenannt++; }
            continue;
        }
        players.push({
            id: foundry.utils.randomID(),
            name: actor.name,
            color: freieFarbe(players),
            wasSelected: false,
            active: true,
            actorId: actor.id
        });
        neu++;
    }
    return { neu, umbenannt };
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

/**
 * Wirklich entfernen?
 *
 * Ein Spieler war mit einem Tipp aus der Liste, und es gibt kein
 * Rueckgaengig: Die Liste ist eine Welteinstellung, keine Dokumenthistorie.
 * Also fragen wir. Der Knopf heisst "Entfernen", nicht "Ja"; Wegklicken und
 * Escape zaehlen als Nein (`rejectClose: false` gibt dann `null`).
 *
 * Steuerfenster und Einstellungsfenster fragen beide hier, damit es dieselbe
 * Frage bleibt. Der Name kommt aus einem Eingabefeld und wird maskiert.
 */
export async function frageEntfernen(name) {
    const antwort = await DialogV2.confirm({
        window: { title: game.i18n.localize("WHEEL.Confirm.RemoveTitle") },
        content: `<p>${game.i18n.format("WHEEL.Confirm.RemoveBody", { name: maskiere(name) })}</p>`,
        yes: { label: game.i18n.localize("WHEEL.Confirm.RemoveYes"), icon: "fa-solid fa-trash" },
        no: { label: game.i18n.localize("WHEEL.Confirm.Cancel"), default: true },
        rejectClose: false
    });
    return antwort === true;
}

/**
 * Das Steuerfenster oeffnen oder, wenn es schon offen ist, nach vorn holen.
 * Tastenkuerzel, Werkzeugknopf und `api.openControl()` gehen alle hier durch.
 */
export function steuerungOeffnen() {
    const offen = foundry.applications.instances.get(STEUERUNG_ID);
    return (offen ?? new WheelControl()).render({ force: true });
}

/**
 * Das Fenster, aus dem die Spielleitung dreht: Liste pflegen, Rad drehen.
 *
 * Seit 14.2611.1 ApplicationV2 statt `FormApplication`. Die Knoepfe laufen
 * ueber `data-action`, die Namensfelder ueber das Formular mit
 * `submitOnChange`: Ein geaenderter Name wird beim Verlassen des Feldes
 * gespeichert, wie vorher mit dem eigenen `change`-Lauscher.
 */
export class WheelControl extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: STEUERUNG_ID,
        tag: "form",
        classes: ["ninjos-player-wheel-window"],
        window: {
            title: "WHEEL.WindowTitle",
            resizable: false
        },
        position: {
            width: 450,
            height: "auto"
        },
        form: {
            handler: WheelControl.#onSubmit,
            submitOnChange: true,
            closeOnSubmit: false
        },
        actions: {
            openSettings: WheelControl.#onOpenSettings,
            addPlayer: WheelControl.#onAddPlayer,
            importPlayers: WheelControl.#onImportPlayers,
            removePlayer: WheelControl.#onRemovePlayer,
            togglePlayer: WheelControl.#onTogglePlayer,
            resetStatus: WheelControl.#onResetStatus,
            spin: WheelControl.#onSpin,
            closeWheel: WheelControl.#onCloseWheel
        }
    };

    static PARTS = {
        steuerung: { template: "modules/ninjos-player-wheel/templates/control.hbs" }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const players = game.settings.get(MODUL, "players") || [];
        return Object.assign(context, {
            players: players,
            hasPlayers: players.length > 0,
            canSpin: players.filter(p => p.active && !p.wasSelected).length >= 1,
            isGM: game.user.isGM
        });
    }

    /**
     * Ein Name wurde geaendert (Formular mit `submitOnChange`).
     *
     * Nur die Namen stehen im Formular. Gespeichert wird, was sich geaendert
     * hat, ohne neu zu zeichnen: Sonst sprang der Cursor beim Wechsel in das
     * naechste Feld heraus, und das tat er vorher auch nicht.
     */
    static async #onSubmit(event, form, formData) {
        const felder = foundry.utils.expandObject(formData.object).players ?? {};
        const players = game.settings.get(MODUL, "players");
        let geaendert = false;
        for (const [index, feld] of Object.entries(felder)) {
            const eintrag = players[Number(index)];
            if (!eintrag || typeof feld?.name !== "string" || eintrag.name === feld.name) continue;
            eintrag.name = feld.name;
            geaendert = true;
        }
        if (geaendert) await game.settings.set(MODUL, "players", players);
    }

    static #onOpenSettings(event) {
        event.preventDefault();
        einstellungenOeffnen();
    }

    static async #onAddPlayer(event) {
        event.preventDefault();
        const players = game.settings.get(MODUL, "players");

        players.push({
            id: foundry.utils.randomID(),
            name: game.i18n.localize("WHEEL.Config.NewPlayer"),
            color: freieFarbe(players),
            wasSelected: false,
            active: true
        });
        await game.settings.set(MODUL, "players", players);
        this.render();
    }

    static async #onImportPlayers(event) {
        event.preventDefault();
        const players = game.settings.get(MODUL, "players");
        const { neu, umbenannt } = figurenUebernehmen(players);
        if (!neu && !umbenannt) {
            ui.notifications.info(game.i18n.localize("WHEEL.Notify.ImportNone"));
            return;
        }
        await game.settings.set(MODUL, "players", players);
        ui.notifications.info(game.i18n.format("WHEEL.Notify.Imported", { neu, umbenannt }));
        this.render();
    }

    static async #onRemovePlayer(event, target) {
        event.preventDefault();
        const index = Number(target.dataset.index);
        const players = game.settings.get(MODUL, "players");
        const eintrag = players[index];
        if (!eintrag) return;
        if (!await frageEntfernen(eintrag.name ?? "")) return;
        // Neu lesen: Waehrend die Frage offen stand, kann sich die Liste
        // geaendert haben (ein Dreh, ein gespeicherter Name).
        const aktuell = game.settings.get(MODUL, "players");
        const pos = eintrag.id ? aktuell.findIndex(p => p.id === eintrag.id) : index;
        if (pos < 0) return;
        aktuell.splice(pos, 1);
        await game.settings.set(MODUL, "players", aktuell);
        this.render();
    }

    static async #onTogglePlayer(event, target) {
        event.preventDefault();
        const index = Number(target.dataset.index);
        const players = game.settings.get(MODUL, "players");
        if (!players[index]) return;
        players[index].active = !players[index].active;
        await game.settings.set(MODUL, "players", players);
        this.render();
    }

    static async #onResetStatus(event) {
        event.preventDefault();
        const players = game.settings.get(MODUL, "players");
        players.forEach(p => p.wasSelected = false);
        await game.settings.set(MODUL, "players", players);
        this.render();
    }

    static async #onSpin(event) {
        event.preventDefault();
        const lauf = drehen();
        if (!lauf) return;

        // Auto Close Window
        if (game.settings.get(MODUL, "autoCloseControl")) {
            this.close();
        }
        // Ein geschlossenes Fenster oeffnet `render()` ohne `force` nicht wieder.
        lauf.then(() => this.render());
    }

    static async #onCloseWheel(event) {
        event.preventDefault();

        // Emit Socket (broadcast to everyone)
        game.socket.emit(`module.${MODUL}`, { type: "close" });

        // Also close for GM
        WheelDisplay.closeAll();

        ui.notifications.info(game.i18n.localize("WHEEL.Notify.ClosedForAll"));
    }
}
