document.addEventListener("DOMContentLoaded", () => {

    const hotspots = document.querySelectorAll(".hotspot");
    const tooltip = document.getElementById("hotspot-tooltip");
    const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

    if (hotspots.length === 0) {
        // Geen hotspots op deze pagina, script kan veilig stoppen.
        return;
    }

    // Tooltip ontbreekt? Stop veilig.
    if (!tooltip) {
        console.warn("⚠ hotspot-tooltip ontbreekt in de HTML");
        return;
    }

    tooltip.style.position = "fixed";
    tooltip.style.left = "0";
    tooltip.style.top = "0";
    tooltip.style.transform = "translateX(-50%)";

    // ----------------------------------------------------
    // 1. TOUCH LOGICA (dubbele tik)
    // ----------------------------------------------------
    hotspots.forEach(hotspot => {
        let tapped = false;

        if (isTouch) {
            hotspot.addEventListener("touchstart", e => {
                e.preventDefault(); // voorkomt ghost-click
                e.stopPropagation();

                const title = (hotspot.dataset.title || "").trim();
                if (!title) {
                    tooltip.style.opacity = 0;
                    window.location = hotspot.getAttribute("href");
                    return;
                }

                if (!tapped) {
                    tapped = true;
                    hotspot.classList.add("show-tooltip");

                    tooltip.innerHTML = title;
                    tooltip.style.opacity = 1;
                    tooltip.style.zIndex = "10000";
                    tooltip.style.transform = "translateX(-50%)";

                    // Tooltip positioneren
                    const rect = hotspot.getBoundingClientRect();
                    tooltip.style.left = rect.left + rect.width / 2 + "px";
                    tooltip.style.top = rect.top - 8 - 30 + "px"; // Position above hotspot

                } else {
                    // Tweede tik → navigeer
                    window.location = hotspot.getAttribute("href");
                }
            });
        }

        // ----------------------------------------------------
        // 2. DESKTOP HOVER TOOLTIP
        // ----------------------------------------------------
        if (!isTouch) {
            hotspot.addEventListener("mouseenter", () => {
                if (hotspot.dataset.title && hotspot.dataset.title.trim() !== "") {
                    tooltip.innerHTML = hotspot.dataset.title;
                    tooltip.style.opacity = 1;
                    tooltip.style.zIndex = "10000";
                }
            });

            hotspot.addEventListener("mousemove", () => {
                if (tooltip.style.opacity === "1") {
                    const rect = hotspot.getBoundingClientRect();
                    tooltip.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
                    tooltip.style.top = rect.top + window.scrollY - 8 - 30 + "px"; // Position above hotspot
                }
            });

            hotspot.addEventListener("mouseleave", () => {
                tooltip.style.opacity = 0;
            });
        }

        // ----------------------------------------------------
        // 3. RESET BIJ TIK BUITEN HOTSPOT (touch)
        // ----------------------------------------------------
        document.addEventListener("touchstart", e => {
            if (!hotspot.contains(e.target)) {
                tapped = false;
                hotspot.classList.remove("show-tooltip");
                tooltip.style.opacity = 0;
            }
        });
    });

    // ----------------------------------------------------
    // 4. COORDINATEN OVERLAY (admin)
    // ----------------------------------------------------
    const img = document.querySelector(".hotspot-wrapper img, .hotspot-fullscreen-wrapper img");
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
