// RecapConfig

export class RecapConfig extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["form", "recap-config"],
            template: "modules/ninjos-player-wheel/templates/config.hbs",
            width: 400,
            height: "auto",
            title: "Recap Wheel Configuration"
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
            name: "New Player",
            color: "#ff0000",
            hasDoneRecap: false,
            active: true
        });
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    async _onRemovePlayer(event) {
        event.preventDefault();
        const index = event.currentTarget.dataset.index;
        const players = game.settings.get("ninjos-player-wheel", "players");
        players.splice(index, 1);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }

    async _onResetStatus(event) {
        event.preventDefault();
        const players = game.settings.get("ninjos-player-wheel", "players");
        players.forEach(p => p.hasDoneRecap = false);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
    }
}
