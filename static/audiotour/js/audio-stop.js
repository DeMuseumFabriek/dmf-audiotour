document.addEventListener("DOMContentLoaded", function () {

    /* ---------------------------------------------------------
       HELP POPUP
    --------------------------------------------------------- */
    const helpBtn = document.querySelector(".help-button");
    const helpPopup = document.querySelector(".help-popup");
    const helpClose = document.querySelector(".close-help");

    if (helpBtn && helpPopup && helpClose) {
        helpBtn.addEventListener("click", () => helpPopup.classList.remove("hidden"));
        helpClose.addEventListener("click", () => helpPopup.classList.add("hidden"));
    }


    /* ---------------------------------------------------------
       AVO POPUP
    --------------------------------------------------------- */
    const avoBtn = document.querySelector(".avo-button");
    const avoPopup = document.querySelector(".avo-popup");
    const avoClose = document.querySelector(".close-avo");

    if (avoBtn && avoPopup && avoClose) {
        avoBtn.addEventListener("click", () => avoPopup.classList.remove("hidden"));
        avoClose.addEventListener("click", () => avoPopup.classList.add("hidden"));
    }


    /* ---------------------------------------------------------
       TIMED IMAGES + AUDIO SYNC
    --------------------------------------------------------- */
    const audio = document.getElementById("audio-player");
    const images = Array.from(document.querySelectorAll(".timed-image"));

    if (audio && images.length > 0) {

        // Reset audio on load
        audio.pause();
        audio.currentTime = 0;

        // Apply focal point + hide all images
        images.forEach(img => {
            const focalX = img.dataset.focalX || "50%";
            const focalY = img.dataset.focalY || "50%";
            img.style.objectPosition = `${focalX} ${focalY}`;
            img.style.objectFit = "cover";
            img.style.display = "none";


        });

        // Show first image
        let first = images[0];
        first.style.display = "block";


        audio.addEventListener("timeupdate", function () {
            const current = audio.currentTime;
            let active = null;

            images.forEach(img => {
                const ts = parseFloat(img.dataset.timestamp);
                if (current >= ts) active = img;
            });

             images.forEach(img => img.style.display = "none");
             if (active) active.style.display = "block";
            


            
            
        });

        audio.addEventListener("ended", function () {
             images.forEach(img => img.style.display = "none");
             first.style.display = "block";


            
        });
    }


    /* ---------------------------------------------------------
       SWIPE NAVIGATION + DESCRIPTION TOGGLE
    --------------------------------------------------------- */
    let startX = 0;
    let endX = 0;
    let startTime = 0;

    document.addEventListener("touchstart", (e) => {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startTime = Date.now();
        } else {
            startX = 0;
            startTime = 0;
        }
    });

    document.addEventListener("touchend", (e) => {
        if (e.touches.length === 0 && startX > 0) {
            const elapsed = Date.now() - startTime;
            if (elapsed < 500) {
                endX = e.changedTouches[e.changedTouches.length - 1].clientX;
                handleSwipe();
            }
            startX = 0;
            startTime = 0;
        }
    });

    function handleSwipe() {
        const distance = endX - startX;
        if (Math.abs(distance) < 50) return;

        const buttons = document.querySelectorAll(".nav-button");
        const prevBtn = buttons[0];
        const nextBtn = buttons[buttons.length - 1];

        if (distance > 0) prevBtn?.click();
        else nextBtn?.click();
    }

    /* Description expand/collapse */
    const description = document.querySelector(".description");

    if (description) {

        document.addEventListener("dblclick", () => {
            if (!description.classList.contains("expanded")) {
                description.classList.add("expanded");
                window.getSelection().removeAllRanges();
                setTimeout(() => {
                    description.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 0);
            }
        });

        description.addEventListener("click", (e) => {
            if (description.classList.contains("expanded")) {
                e.stopPropagation();
                description.classList.remove("expanded");
            }
        });

        description.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (description.classList.contains("expanded")) {
                    description.classList.remove("expanded");
                }
            }
        });
    }

});

