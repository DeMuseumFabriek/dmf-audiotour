console.log("dp.js geladen");

document.addEventListener("DOMContentLoaded", () => {

    const audio = document.getElementById("dp-audio");
    const heroImg = document.getElementById("dp-hero-image");
    const heroCaption = document.getElementById("dp-hero-caption");

    if (!audio || !heroImg) {
        console.warn("dp.js: audio of hero image ontbreekt");
        return;
    }

    const thumbNodes = document.querySelectorAll(".dp-thumb");

    const beelden = Array.from(thumbNodes)
        .map(node => ({
            sec: parseFloat(node.dataset.sec),
            src: node.dataset.image,
            caption: node.dataset.caption || ""
        }))
        .filter(b => !isNaN(b.sec))
        .sort((a, b) => a.sec - b.sec);

    if (!beelden.length) {
        console.warn("dp.js: geen beeldmomenten gevonden");
        return;
    }

    console.log("Beeldmomenten:", beelden);

    let currentIndex = 0;

    // 🔹 updateHero moet HIER staan
    function updateHero(beeld) {
        heroImg.src = beeld.src;
        if (heroCaption) {
            heroCaption.textContent = beeld.caption;
        }
    }

    audio.addEventListener("timeupdate", () => {
        const t = audio.currentTime;

        if (
            currentIndex + 1 < beelden.length &&
            t >= beelden[currentIndex + 1].sec
        ) {
            currentIndex++;
            updateHero(beelden[currentIndex]);
        }
    });

    // 🔹 Klik op thumbnail → spring in audio + wissel beeld
    thumbNodes.forEach((node, index) => {
        node.addEventListener("click", () => {
            const sec = parseFloat(node.dataset.sec);
            if (isNaN(sec)) return;

            audio.currentTime = sec;
            updateHero(beelden[index]);
            currentIndex = index;

            if (audio.paused) {
                audio.play().catch(() => { });
            }
        });
    });

});
