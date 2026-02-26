export class WheelDisplay extends Application {
    constructor(options = {}) {
        super(options);
        this.winner = options.winner;
        this.duration = options.duration || 6000;
        this.segments = options.segments || [];
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "ninjos-player-wheel-display",
            template: "modules/ninjos-player-wheel/templates/wheel.hbs",
            width: 600,
            height: 600,
            minimizable: false,
            resizable: false,
            classes: super.defaultOptions.classes.concat(["wheel-window", "common-display"]),
            popOut: true
        });
    }

    static show(data) {
        new WheelDisplay(data).render(true);
    }

    static closeAll() {
        Object.values(ui.windows).forEach(app => {
            if (app instanceof WheelDisplay) {
                app.close();
            }
        });
    }

    getData() {
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

        return {
            segments: enhancedSegments,
            winner: this.winner
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        // --- MONK'S COMMON DISPLAY NUKE ---
        if (this.element && this.element[0]) {
            this.element[0].classList.add("recap-fullscreen-class");
            this.element[0].style.setProperty("display", "flex", "important"); /* center contents */
            this.element[0].style.setProperty("visibility", "visible", "important");
            this.element[0].style.setProperty("opacity", "1", "important");
        }

        const wheelGroup = html.find(".wheel-inner")[0];

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
            wheelGroup.style.transition = "none";
            wheelGroup.style.transformOrigin = "300px 300px";
            // Set directly to target angle (without the 5 extra spins)
            const simpleRotation = (360 - winnerAngle) + 270;
            wheelGroup.style.transform = `rotate(${simpleRotation}deg)`;
        } else {
            // LONG SPIN (Suspense)
            // Heavy Ease-Out: starts fast, decelerrrrrates loooong
            wheelGroup.style.transition = `transform ${duration}ms cubic-bezier(0.12, 0, 0, 1)`;
            wheelGroup.style.transformOrigin = "300px 300px";
            wheelGroup.style.transform = `rotate(${rotationNeeded}deg)`;
        }

        // Finish / Reveal
        setTimeout(() => {
            // Highlight Winner
            const textElements = html.find("text");
            if (textElements[winnerIndex]) {
                const winnerText = textElements[winnerIndex];
                winnerText.classList.add("winner-text");
            }

            // Confetti!
            if (window.confetti) {
                window.confetti({
                    particleCount: 250,
                    spread: 100,
                    origin: { y: 0.6 },
                    zIndex: 2147483647
                });
            }

            // WINNER REVEAL OVERLAY
            const winnerName = this.winner.name;
            const overlay = $(`<div class="winner-overlay">
                <div class="winner-label">Rückblick:</div>
                <div class="winner-name">${winnerName}</div>
            </div>`);
            html.append(overlay);

            // Animate in
            setTimeout(() => overlay.addClass("visible"), 100);

            // Close after a delay (enough time to celebrate)
            setTimeout(() => {
                this.close();
            }, 6000);

        }, duration);
    }
}
