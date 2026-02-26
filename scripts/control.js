// WheelControl

export class WheelControl extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
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
            id: randomID(),
            name: "New Player",
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
        players.splice(index, 1);
        await game.settings.set("ninjos-player-wheel", "players", players);
        this.render();
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
        const players = game.settings.get("ninjos-player-wheel", "players");
        const candidates = players.filter(p => !p.wasSelected && p.active);

        if (candidates.length === 0) {
            ui.notifications.warn(game.i18n.localize("WHEEL.Control.NoCandidates"));
            return;
        }

        // Pick winner
        const winnerIndex = Math.floor(Math.random() * candidates.length);
        const winner = candidates[winnerIndex];

        // Determine Duration
        // If only 1 player, we do a quick reveal (instant). 
        // If multiple, we do a long suspenseful spin.
        const isInstant = candidates.length === 1;
        const duration = isInstant ? 1000 : 8000;

        // Prepare data
        const spinData = {
            type: "spin",
            winner: winner,
            segments: candidates,
            duration: duration,
            isInstant: isInstant
        };

        // Emit Socket (broadcast to everyone)
        // We want everyone to see it, unless Monk's blocks it.
        game.socket.emit("module.ninjos-player-wheel", spinData);

        // Also show for GM
        import("./wheel.js").then(m => m.WheelDisplay.show(spinData));

        // DELAYED RESULT (Synchronized with Wheel Animation)
        setTimeout(async () => {
            // Update winner status
            const currentPlayers = game.settings.get("ninjos-player-wheel", "players");
            const originalIndex = currentPlayers.findIndex(p => p.id === winner.id);
            if (originalIndex > -1) {
                currentPlayers[originalIndex].wasSelected = true;
            }

            // Auto-Reset Check
            const remainingCandidates = currentPlayers.filter(p => !p.wasSelected && p.active);
            if (remainingCandidates.length === 0) {
                currentPlayers.forEach(p => p.wasSelected = false);
                ui.notifications.info(`${game.i18n.localize("WHEEL.Config.ResetStatus")} (Auto-Reset)`);
            }

            // Chat Message Notification
            ChatMessage.create({
                content: `
                    <div style="text-align: center; font-family: 'Modesto Condensed', serif;">
                        <h2 style="color: #782e22; border-bottom: 1px solid #782e22; margin-bottom: 5px;">Auswahl: Der Würfel ist gefallen!</h2>
                        <div style="font-size: 2em; font-weight: bold; color: #daa520; text-shadow: 1px 1px 0 #000;">${winner.name}</div>
                        <p style="font-style: italic; color: #4b4a44;">wurde durch das Rad bestimmt!</p>
                    </div>
                `,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER
            });

            await game.settings.set("ninjos-player-wheel", "players", currentPlayers);
            this.render();

        }, duration); // Wait for wheel to finish
    }

    async _onCloseWheel(event) {
        event.preventDefault();

        // Emit Socket (broadcast to everyone)
        game.socket.emit("module.ninjos-player-wheel", { type: "close" });

        // Also close for GM
        import("./wheel.js").then(m => m.WheelDisplay.closeAll());

        ui.notifications.info("Rad bei allen Spielern geschlossen.");
    }
}
