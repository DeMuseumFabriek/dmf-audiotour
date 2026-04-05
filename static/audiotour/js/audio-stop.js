document.addEventListener("DOMContentLoaded", function () {

/* ------------ SCRIPTS audio_stop_page.html -------------------
 * De onderstaande scripts worden gebruikt in de template:
 * audio_stop_page.html
 * 
 * Fred van Goor, maart 2026
 * -----------------------------------------------------------*/

/* ---------------------------------------------------------
* HELP POPUP
* De help popup verschijnt als de gebruiker op help (?) klikt
--------------------------------------------------------- */
    const helpBtn = document.querySelector(".help-button");
    const helpPopup = document.querySelector(".help-popup");
    const helpClose = document.querySelector(".close-help");

    if (helpBtn && helpPopup && helpClose) {
        helpBtn.addEventListener("click", () => helpPopup.classList.remove("hidden"));
        helpClose.addEventListener("click", () => helpPopup.classList.add("hidden"));
    }

/* ---------------------------------------------------------
* Info POPUP
* Deze popup (Info) is bedoeld voor nadere informatie
* (verdieping) over het object
*-------------------------------------------------------- */
    const avoBtn = document.querySelector(".avo-button");
    const avoPopup = document.querySelector(".avo-popup");
    const avoClose = document.querySelector(".close-avo");

    if (avoBtn && avoPopup && avoClose) {
        avoBtn.addEventListener("click", () => avoPopup.classList.remove("hidden"));
        avoClose.addEventListener("click", () => avoPopup.classList.add("hidden"));
    }

/* ---------------------------------------------------------
 * TIMED IMAGES + AUDIO SYNC
 * Dit script regelt het verschijnen van afbeeldingen nadat de
 * opgegeven tijd overschreden wordt tijdens het afspelen
 * van de audio. 
 * Werkt alleen voor 'Timed images', dus niet
 * bij 'Hotspot image'. 
 * --------------------------------------------------------- */
    //const audio = document.getElementById("audio-player");
    //const images = Array.from(document.querySelectorAll(".timed-image"));

    //if (audio && images.length > 0) {

        //// Reset audio on load
        //audio.pause();
        //audio.currentTime = 0;

        //// Apply focal point + hide all images
        //images.forEach(img => {
            //const focalX = img.dataset.focalX || "50%";
            //const focalY = img.dataset.focalY || "50%";
            //img.style.objectPosition = `${focalX} ${focalY}`;
            //img.style.objectFit = "cover";
            //img.style.display = "none";
        //});

        //// Show first image
        //let first = images[0];
        //first.style.display = "block";


        //audio.addEventListener("timeupdate", function () {
            //const current = audio.currentTime;
            //let active = null;

            //images.forEach(img => {
                //const ts = parseFloat(img.dataset.timestamp);
                //if (current >= ts) active = img;
            //});

             //images.forEach(img => img.style.display = "none");
             //if (active) active.style.display = "block";
        //});

        //audio.addEventListener("ended", function () {
             //images.forEach(img => img.style.display = "none");
             //first.style.display = "block";            
        //});
    //}
/* ---------------------------------------------------------
 * TIMED IMAGES + AUDIO SYNC
 * --------------------------------------------------------- */
const audio = document.getElementById("audio-player");
const images = Array.from(document.querySelectorAll(".timed-image"));
const titleBox = document.getElementById("timed-image-title");

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

    // Update title for first image
    if (titleBox) {
        titleBox.textContent = first.dataset.alt || "";
    }

    audio.addEventListener("timeupdate", function () {
        const current = audio.currentTime;
        let active = null;

        images.forEach(img => {
            const ts = parseFloat(img.dataset.timestamp);
            if (current >= ts) active = img;
        });

        images.forEach(img => img.style.display = "none");

        if (active) {
            active.style.display = "block";

            // Update title for active image
            if (titleBox) {
                titleBox.textContent = active.dataset.alt || "";
            }
        }
    });

    audio.addEventListener("ended", function () {
        images.forEach(img => img.style.display = "none");
        first.style.display = "block";

        // Reset title to first image
        if (titleBox) {
            titleBox.textContent = first.dataset.alt || "";
        }
    });
}

    const videoOpenButton = document.querySelector(".open-video");
    const videoModal = document.querySelector(".video-modal");
    const videoCloseButton = document.querySelector(".video-modal__close");
    const videoElement = document.querySelector(".video-modal video");

    function closeVideoModal() {
        if (!videoModal) return;
        videoModal.classList.add("hidden");
        videoModal.setAttribute("aria-hidden", "true");
        if (videoElement) {
            videoElement.pause();
        }
    }

    if (videoOpenButton && videoModal && videoCloseButton) {
        function openVideoModal(event) {
            event.preventDefault();
            videoModal.classList.remove("hidden");
            videoModal.setAttribute("aria-hidden", "false");
        }

        videoOpenButton.addEventListener("click", openVideoModal);
        videoOpenButton.addEventListener("pointerup", openVideoModal);
        videoOpenButton.addEventListener("touchend", openVideoModal);

        videoCloseButton.addEventListener("click", closeVideoModal);
        videoCloseButton.addEventListener("pointerup", (event) => {
            event.preventDefault();
            closeVideoModal();
        });
        videoCloseButton.addEventListener("touchend", (event) => {
            event.preventDefault();
            closeVideoModal();
        });

        videoModal.addEventListener("click", (event) => {
            if (event.target === videoModal) {
                closeVideoModal();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !videoModal.classList.contains("hidden")) {
                closeVideoModal();
            }
        });
    }

/* ---------------------------------------------------------
*   SWIPE NAVIGATION + DESCRIPTION TOGGLE
*   Dit script regelt de 'swipe' functie bij touch screens
*   Werkt due alleen bij bijvoorbeeld mobiele telefoons of
*   tablets
*   Verder regelt dit script de 'full screen' mode voor de
*   beschrijvings-tekst wanneer de gebruiker dubbel-klikt op
*   het scherm. Full screen wordt weer erlaten nadat de gebruiker
*   op het tekst blok klikt.
*--------------------------------------------------------- */
    let startX = 0;
    let endX = 0;
    let startTime = 0;
    let swipeTouchStartedOnControl = false;

    document.addEventListener("touchstart", (e) => {
        const interactiveControl = e.target.closest("button, a, input, textarea, select, label, .nav-button, .description, .open-video");
        if (interactiveControl) {
            swipeTouchStartedOnControl = true;
            startX = 0;
            startTime = 0;
            return;
        }

        swipeTouchStartedOnControl = false;
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startTime = Date.now();
        } else {
            startX = 0;
            startTime = 0;
        }
    });

    document.addEventListener("touchend", (e) => {
        if (swipeTouchStartedOnControl) {
            swipeTouchStartedOnControl = false;
            startX = 0;
            startTime = 0;
            return;
        }

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

