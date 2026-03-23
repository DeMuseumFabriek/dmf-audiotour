document.addEventListener("DOMContentLoaded", () => {

    const hotspots = document.querySelectorAll(".hotspot");
    const tooltip = document.getElementById("hotspot-tooltip");
    const isTouch = "ontouchstart" in window;

    // -------------------------------
    // 1. TOUCH LOGICA (dubbele tik)
    // -------------------------------
    hotspots.forEach(hotspot => {
        let tapped = false;

        if (isTouch) {
            hotspot.addEventListener("touchstart", e => {
                e.preventDefault(); // blokkeert ghost-click

                if (!tapped) {
                    tapped = true;
                    hotspot.classList.add("show-tooltip");

                    // Tooltip vullen
                    tooltip.innerHTML = hotspot.dataset.title;
                    tooltip.style.opacity = 1;

                    // Tooltip positioneren
                    const rect = hotspot.getBoundingClientRect();
                    tooltip.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
                    tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";

                } else {
                    window.location = hotspot.getAttribute("href");
                }
            });
        }

        // -------------------------------
        // 2. DESKTOP HOVER TOOLTIP
        // -------------------------------
        if (!isTouch) {
            hotspot.addEventListener("mouseenter", () => {
                tooltip.innerHTML = hotspot.dataset.title;
                tooltip.style.opacity = 1;
            });

            hotspot.addEventListener("mousemove", () => {
                const rect = hotspot.getBoundingClientRect();
                tooltip.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
                tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
            });

            hotspot.addEventListener("mouseleave", () => {
                tooltip.style.opacity = 0;
            });
        }

        // -------------------------------
        // 3. RESET BIJ TIK BUITEN HOTSPOT
        // -------------------------------
        document.addEventListener("touchstart", e => {
            if (!hotspot.contains(e.target)) {
                tapped = false;
                hotspot.classList.remove("show-tooltip");
                tooltip.style.opacity = 0;
            }
        });
    });

    // -------------------------------
    // 4. COORDINATEN OVERLAY (admin)
    // -------------------------------
    const img = document.querySelector(".hotspot-wrapper img");
    const display = document.getElementById("coord-display");

    if (img && display) {
        display.style.display = "block";

        img.addEventListener("mousemove", e => {
            const rect = img.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            display.textContent = `X: ${x.toFixed(1)}%, Y: ${y.toFixed(1)}%`;
        });
    }
});
