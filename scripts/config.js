// WheelConfig

export class WheelConfig extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form", "wheel-config"],
            template: "modules/ninjos-player-wheel/templates/config.hbs",
            width: 400,
            height: "auto",
            title: "Player Wheel Configuration"
        });
    }

    getData() {
        return {
            players: game.settings.get("ninjos-player-wheel", "players"),
            isGM: game.user.isGM
        };
    }

    async _updateObject(event, formData) {
        // Expand data to handle the array of players correctly
        const expanded = expandObject(formData);
        const players = [];

        // Convert the object-based form data back to an array
        for (const key in expanded.players) {
            if (expanded.players.hasOwnProperty(key)) {
                players.push(expanded.players[key]);
            }
        }

        await game.settings.set("ninjos-player-wheel", "players", players);
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".add-player").click(this._onAddPlayer.bind(this));
        html.find(".remove-player").click(this._onRemovePlayer.bind(this));
        html.find(".reset-status").click(this._onResetStatus.bind(this));
    }

    async _onAddPlayer(event) {
        event.preventDefault();
        const players = game.settings.get("ninjos-player-wheel", "players");
        players.push({
            id: randomID(),
            name: game.i18n.localize("WHEEL.Config.NewPlayer"),
            color: "#ff0000",
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

    async _onResetStatus(event) {
        event.preventDefault();
        const players = game.settings.get("ninjos-player-wheel", "players");
        players.forEach(p => p.wasSelected = false);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }
}
