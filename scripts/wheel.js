const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Der Text ueber dem Gewinner: der eigene aus dem Dreh oder der Standard in
 * der Sprache dieses Clients ("Auswahl:", "Chosen:").
 */
export function gewinnerText(label) {
    const eigen = String(label ?? "").trim();
    return eigen || game.i18n.localize("WHEEL.Wheel.Label");
}

/** Name und Text kommen aus Eingabefeldern und gehen ins HTML. */
export function maskiere(text) {
    const s = String(text ?? "");
    if (foundry.utils.escapeHTML) return foundry.utils.escapeHTML(s);
    return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** Wie lange das Rad nach dem Ende ausblendet, in Millisekunden. */
const AUSBLENDEN = 300;

/**
 * Das Rad selbst, auf jedem Client, der den Dreh bekommt.
 *
 * Seit 14.2611.1 ein ApplicationV2-Fenster; die alte `Application` faellt mit
 * Foundry 16 weg. Der Rahmen bleibt (Kopfzeile per CSS ausgeblendet), damit
 * `.window-content` und die Kennung `#ninjos-player-wheel-display` dieselben
 * sind wie vorher: Auf beide zielen die Regeln in `module.css`, und die
 * Klasse `common-display` haengt weiter am Fenster fuer Monk's Common Display.
 */
export class WheelDisplay extends HandlebarsApplicationMixin(ApplicationV2) {
    /**
     * @param {object} [daten]  Der Dreh: `winner`, `segments`, `duration`, `label`.
     *   Er kommt ueber den Socket und wird bewusst nicht als Fensteroption
     *   uebergeben, sonst mischte ApplicationV2 ihn in seine Optionen.
     */
    constructor(daten = {}) {
        super({});
        this.winner = daten.winner;
        this.duration = daten.duration || 6000;
        this.segments = daten.segments || [];
        this.label = daten.label ?? null;
        /** Laufende Zeitgeber, damit ein frueh geschlossenes Rad keine mehr hat. */
        this._zeitgeber = [];
    }

    static DEFAULT_OPTIONS = {
        id: "ninjos-player-wheel-display",
        classes: ["wheel-window", "common-display"],
        window: {
            frame: true,
            positioned: true,
            title: "",
            minimizable: false,
            resizable: false
        },
        position: {
            width: 600,
            height: 600
        }
    };

    static PARTS = {
        rad: { template: "modules/ninjos-player-wheel/templates/wheel.hbs" }
    };

    /**
     * Ein Rad zeigen. Laeuft noch eins, geht es vorher zu.
     *
     * Die Kennung ist fest, und ApplicationV2 fuehrt je Kennung genau ein
     * Fenster. Ein zweites mit derselben Kennung ersetzte das Element des
     * ersten im Dokument, und dessen Zeitgeber schlossen danach das neue.
     */
    static async show(data) {
        const laufend = [...foundry.applications.instances.values()].filter(app => app instanceof WheelDisplay);
        await Promise.all(laufend.map(app => app.close({ animate: false })));
        return new WheelDisplay(data).render({ force: true });
    }

    static closeAll() {
        for (const app of [...foundry.applications.instances.values()]) {
            if (app instanceof WheelDisplay) app.close();
        }
    }

    /** Ein Zeitgeber, der mit dem Fenster endet. */
    _spaeter(fn, ms) {
        this._zeitgeber.push(setTimeout(fn, ms));
    }

    async _prepareContext(options) {
        const context = await super._prepareContext(options);
        const segments = this.segments || [];
        const radius = 280;
        const center = { x: 300, y: 300 }; // viewBox 0 0 600 600

        const numSegments = segments.length;
        const angleRad = (Math.PI * 2) / numSegments;

        const enhancedSegments = segments.map((s, i) => {
            const startAngle = i * angleRad;
            const endAngle = (i + 1) * angleRad;

            // Coordinates
            const x1 = center.x + radius * Math.cos(startAngle);
            const y1 = center.y + radius * Math.sin(startAngle);
            const x2 = center.x + radius * Math.cos(endAngle);
            const y2 = center.y + radius * Math.sin(endAngle);
            const largeArc = angleRad > Math.PI ? 1 : 0;
            const d = `M ${center.x} ${center.y} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

            // Text
            const midAngle = startAngle + (angleRad / 2);
            const textRadius = radius * 0.70;
            const tx = center.x + textRadius * Math.cos(midAngle);
            const ty = center.y + textRadius * Math.sin(midAngle);
            let deg = midAngle * (180 / Math.PI);

            // Contrast Logic (Simple YIQ)
            const hex = s.color || "#541811";
            const r = parseInt(hex.substr(1, 2), 16);
            const g = parseInt(hex.substr(3, 2), 16);
            const b = parseInt(hex.substr(5, 2), 16);
            const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
            const textColor = (yiq >= 128) ? "#000000" : "#ffffff";

            // Single Player Override
            let pathData = d;
            let textTransform = `translate(${tx}, ${ty}) rotate(${deg})`;
            let displayName = s.name; // Use temp variable

            if (numSegments === 1) {
                // Full Circle Path
                pathData = `M ${center.x}, ${center.y} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
                // Center Text
                textTransform = `translate(${center.x}, ${center.y})`;
                // Hide Name in Wheel (Overlay is enough)
                displayName = "";
            }

            return {
                ...s,
                id: s.id,
                name: displayName, // Use temp variable for rendering
                d: pathData,
                color: s.color || "#541811",
                textColor: textColor,
                textTransform: textTransform,
                deg: deg
            };
        });

        return Object.assign(context, {
            segments: enhancedSegments,
            winner: this.winner
        });
    }

    /** Der Gewinner gross in der Mitte. `sofort` ist die Fassung ohne Drehung. */
    _zeigeGewinner(inhalt, { sofort = false } = {}) {
        const overlay = document.createElement("div");
        overlay.className = sofort ? "winner-overlay winner-overlay-sofort" : "winner-overlay";
        overlay.innerHTML = `<div class="winner-label">${maskiere(gewinnerText(this.label))}</div>
            <div class="winner-name">${maskiere(this.winner?.name)}</div>`;
        inhalt.append(overlay);
        return overlay;
    }

    _konfetti() {
        if (!window.confetti) return;
        window.confetti({
            particleCount: 250,
            spread: 100,
            origin: { y: 0.6 },
            zIndex: 2147483647
        });
    }

    async _onRender(context, options) {
        await super._onRender(context, options);
        // Das Rad dreht genau einmal, beim ersten Zeichnen.
        if (!options.isFirstRender) return;

        // --- MONK'S COMMON DISPLAY NUKE ---
        const el = this.element;
        el.classList.add("wheel-fullscreen-class");
        el.style.setProperty("display", "flex", "important"); /* center contents */
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("opacity", "1", "important");

        // Der gerenderte Teil, wie frueher `html` in activateListeners.
        const inhalt = this.parts?.rad ?? el.querySelector(".window-content > .wheel-window") ?? el;
        const wheelGroup = inhalt.querySelector(".wheel-inner");
        if (!wheelGroup || !this.winner) return;

        // Rotation Logic
        const winnerIndex = this.segments.findIndex(s => s.id === this.winner.id);
        const numSegments = this.segments.length;
        const anglePerSegment = 360 / numSegments;
        const winnerAngle = (winnerIndex * anglePerSegment) + (anglePerSegment / 2);

        // Target is 270 (Top)
        const rotationNeeded = (360 - winnerAngle) + 270 + (360 * 5);

        // Duration & Easing
        const duration = this.duration || 6000;
        const isInstant = duration < 2000;

        // Force reflow
        wheelGroup.getBoundingClientRect();

        if (isInstant) {
            // INSTANT REVEAL (Single Player)
            const container = inhalt.querySelector(".wheel-container");
            if (container) container.style.display = "none";

            this._konfetti();

            // WINNER REVEAL OVERLAY
            const overlay = this._zeigeGewinner(inhalt, { sofort: true });

            // Animate in
            this._spaeter(() => overlay.classList.add("visible"), 50);

            // Close after a delay
            this._spaeter(() => this.close(), duration + 5000); // Wait 6 seconds total

        } else {
            // LONG SPIN (Suspense)
            // Heavy Ease-Out: starts fast, decelerrrrrates loooong
            wheelGroup.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0, 0, 1)`;
            wheelGroup.style.transformOrigin = "300px 300px";
            wheelGroup.style.transform = `rotate(${rotationNeeded}deg)`;

            // Finish / Reveal
            this._spaeter(() => {
                // Highlight Winner
                const textElements = inhalt.querySelectorAll("text");
                if (textElements[winnerIndex]) textElements[winnerIndex].classList.add("winner-text");

                this._konfetti();

                // WINNER REVEAL OVERLAY
                const overlay = this._zeigeGewinner(inhalt);

                // Animate in
                this._spaeter(() => overlay.classList.add("visible"), 100);

                // Close after a delay (enough time to celebrate)
                this._spaeter(() => this.close(), 6000);

            }, duration);
        }
    }

    /**
     * Zu wie bisher: kurz ausblenden statt zusammenklappen.
     *
     * ApplicationV2 klappt ein Fenster beim Schliessen ueber `max-height` zu.
     * Beim Rad haelt das CSS die Groesse fest, die Animation liefe ins Leere
     * und das Fenster stuende bis zu einer Sekunde reglos da. Deshalb schliesst
     * es ohne die eingebaute Animation und blendet vorher selbst aus.
     */
    async close(options = {}) {
        return super.close({ ...options, animate: false, ausblenden: options.animate !== false });
    }

    async _preClose(options) {
        await super._preClose(options);
        for (const id of this._zeitgeber) clearTimeout(id);
        this._zeitgeber = [];
        const el = this.element;
        if (!options.ausblenden || !el?.isConnected) return;
        el.style.setProperty("transition", `opacity ${AUSBLENDEN}ms ease`, "important");
        el.style.setProperty("opacity", "0", "important");
        await new Promise(resolve => setTimeout(resolve, AUSBLENDEN));
    }
}
