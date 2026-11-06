// WheelConfig

import { frageEntfernen } from "./control.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

const MODUL = "ninjos-player-wheel";

/** Kennung des Einstellungsfensters. Es gibt hoechstens eins. */
export const EINSTELLUNG_ID = "ninjos-player-wheel-config";

/**
 * Das Einstellungsmenue (registerMenu): die Spielerliste mit Farben und
 * Haken, gespeichert erst mit "Speichern".
 *
 * Seit 14.2611.1 ApplicationV2 statt `FormApplication`. Das Fenster ist
 * selbst das Formular (`tag: "form"`), der Speichern-Knopf schickt es ab, und
 * wie vorher schliesst es danach (`closeOnSubmit`).
 */
export class WheelConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: EINSTELLUNG_ID,
        tag: "form",
        classes: ["form", "wheel-config"],
        window: {
            title: "WHEEL.ConfigTitle",
            resizable: false
        },
        position: {
            width: 400,
            height: "auto"
        },
        form: {
            handler: WheelConfig.#onSubmit,
            submitOnChange: false,
            closeOnSubmit: true
        },
        actions: {
            addPlayer: WheelConfig.#onAddPlayer,
            removePlayer: WheelConfig.#onRemovePlayer,
            resetStatus: WheelConfig.#onResetStatus
        }
    };

    static PARTS = {
        einstellungen: { template: "modules/ninjos-player-wheel/templates/config.hbs" }
    };

    /** Oeffnen oder, wenn schon offen, nach vorn holen. */
    static oeffnen() {
        const offen = foundry.applications.instances.get(EINSTELLUNG_ID);
        return (offen ?? new WheelConfig()).render({ force: true });
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        return Object.assign(context, {
            players: game.settings.get(MODUL, "players"),
            isGM: game.user.isGM
        });
    }

    static async #onSubmit(event, form, formData) {
        // Expand data to handle the array of players correctly
        const expanded = foundry.utils.expandObject(formData.object);
        const bisher = game.settings.get(MODUL, "players");
        const felder = expanded.players ?? {};
        const players = [];

        // Das Formular kennt nur Name, Farbe und die zwei Haken. Alles andere,
        // vor allem `id` und `actorId`, kommt aus dem gespeicherten Eintrag an
        // derselben Stelle; sonst verlor jeder Spieler beim Speichern seine
        // Kennung, und das Rad markierte danach immer den ersten als gezogen.
        for (const key in felder) {
            if (!Object.hasOwn(felder, key)) continue;
            const feld = felder[key];
            players.push({
                ...(bisher[Number(key)] ?? { id: foundry.utils.randomID() }),
                name: feld.name,
                color: feld.color,
                active: Boolean(feld.active),
                wasSelected: Boolean(feld.wasSelected)
            });
        }

        await game.settings.set(MODUL, "players", players);
    }

    static async #onAddPlayer(event) {
        event.preventDefault();
        const players = game.settings.get(MODUL, "players");
        players.push({
            id: foundry.utils.randomID(),
            name: game.i18n.localize("WHEEL.Config.NewPlayer"),
            color: "#ff0000",
            wasSelected: false,
            active: true
        });
        await game.settings.set(MODUL, "players", players);
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
        // geaendert haben.
        const aktuell = game.settings.get(MODUL, "players");
        const pos = eintrag.id ? aktuell.findIndex(p => p.id === eintrag.id) : index;
        if (pos < 0) return;
        aktuell.splice(pos, 1);
        await game.settings.set(MODUL, "players", aktuell);
        this.render();
    }

    static async #onResetStatus(event) {
        event.preventDefault();
        const players = game.settings.get(MODUL, "players");
        players.forEach(p => p.wasSelected = false);
        await game.settings.set(MODUL, "players", players);
        this.render();
    }
}
