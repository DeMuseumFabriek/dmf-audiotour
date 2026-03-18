document.querySelectorAll('.hotspot').forEach(hotspot => {
    let tapped = false;

    hotspot.addEventListener('touchstart', function (e) {
        if (!tapped) {
            // Eerste tik → tooltip tonen, link blokkeren
            tapped = true;
            hotspot.classList.add('show-tooltip');
            e.preventDefault();

            // Na 2 seconden resetten
            setTimeout(() => {
                tapped = false;
                hotspot.classList.remove('show-tooltip');
            }, 2000);
        } else {
            // Tweede tik → link openen
            window.location = hotspot.getAttribute('href');
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const hotspots = document.querySelectorAll(".hotspot");
    const tooltip = document.getElementById("hotspot-tooltip");

    // Tooltip bij hover
    hotspots.forEach(h => {
        h.addEventListener("mouseenter", () => {
            tooltip.innerHTML = h.dataset.title;
            tooltip.style.opacity = 1;
        });

        h.addEventListener("mousemove", () => {
            const rect = h.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + window.scrollX + "px";
            tooltip.style.top = rect.bottom + window.scrollY + 8 + "px";
        });

        h.addEventListener("mouseleave", () => {
            tooltip.style.opacity = 0;
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const img = document.querySelector(".hotspot-wrapper img");
    const display = document.getElementById("coord-display");

    if (!img || !display) {
        return;
    }

    // Maak de overlay zichtbaar
    display.style.display = "block";

    img.addEventListener("mousemove", function (e) {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        display.textContent = `X: ${x.toFixed(1)}%, Y: ${y.toFixed(1)}%`;
    });
});

