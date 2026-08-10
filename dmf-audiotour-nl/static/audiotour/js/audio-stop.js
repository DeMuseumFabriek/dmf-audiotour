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
 * FIXES: iOS slider interaction issue by listening to multiple events
 * --------------------------------------------------------- */
var audio = document.getElementById("audio-player");
var images = Array.prototype.slice.call(document.querySelectorAll(".timed-image"));
var titleBox = document.getElementById("timed-image-title");

function isLegacyAudioBrowser() {
    var ua = navigator.userAgent || "";
    var oldIos = /iP(hone|ad|od).*OS (9|10|11)_/i.test(ua);
    var oldSafari = /Version\/(9|10|11)\./i.test(ua) && !/(Chrome|CriOS|FxiOS|OPiOS|EdgiOS)/i.test(ua);
    return oldIos || oldSafari;
}

if (audio && images.length > 0) {
    if (isLegacyAudioBrowser()) {
        for (var i = 0; i < images.length; i++) {
            var legacyImg = images[i];
            legacyImg.className = "timed-image";
            legacyImg.style.display = "none";
        }

        if (images[0]) {
            images[0].className = "timed-image active";
            images[0].style.display = "block";
        }

        if (titleBox && images[0]) {
            titleBox.textContent = images[0].getAttribute("data-alt") || "";
        }
        return;
    }

    var syncTimer = null;
    var lastAppliedTimestamp = null;
    var pollTimer = null;
    var isPolling = false;

    // Reset audio on load
    audio.pause();
    audio.currentTime = 0;

    // Apply focal point + hide all images
    for (var i = 0; i < images.length; i++) {
        var img = images[i];
        var focalX = img.getAttribute("data-focal-x") || "50%";
        var focalY = img.getAttribute("data-focal-y") || "50%";
        img.style.objectPosition = focalX + " " + focalY;
        img.style.objectFit = "cover";
        img.className = "timed-image";
        img.style.display = "none";
    }

    // Show first image
    var first = images[0];
    if (first) {
        first.className = "timed-image active";
        first.style.display = "block";
    }

    // Update title for first image
    if (titleBox && first) {
        titleBox.textContent = first.getAttribute("data-alt") || "";
    }

    function clearImageVisibility() {
        for (var j = 0; j < images.length; j++) {
            images[j].className = "timed-image";
            images[j].style.display = "none";
        }
    }

    function updateTimedImages(force) {
        if (!audio || isNaN(audio.currentTime)) return;

        var current = audio.currentTime;
        var currentTimestamp = Math.floor(current * 10) / 10;

        if (!force && lastAppliedTimestamp === currentTimestamp) {
            return;
        }

        var active = null;

        for (var k = 0; k < images.length; k++) {
            var image = images[k];
            var ts = parseFloat(image.getAttribute("data-timestamp"));
            if (!isNaN(ts) && current >= ts) {
                active = image;
            }
        }

        clearImageVisibility();

        if (active) {
            active.className = "timed-image active";
            active.style.display = "block";
            lastAppliedTimestamp = currentTimestamp;

            if (titleBox) {
                titleBox.textContent = active.getAttribute("data-alt") || "";
            }
        } else {
            lastAppliedTimestamp = currentTimestamp;
        }
    }

    function scheduleSync() {
        if (syncTimer) {
            clearTimeout(syncTimer);
        }

        syncTimer = setTimeout(function () {
            updateTimedImages(true);
            syncTimer = null;
        }, 100);
    }

    function startPolling() {
        if (isPolling) return;
        isPolling = true;

        pollTimer = setInterval(function () {
            if (!audio || isNaN(audio.currentTime)) return;
            updateTimedImages(false);
        }, 150);
    }

    function stopPolling() {
        isPolling = false;
        if (pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
        }
    }

    function attachSyncListeners() {
        audio.addEventListener("timeupdate", function () {
            updateTimedImages(false);
        });
        audio.addEventListener("seeking", function () {
            scheduleSync();
        });
        audio.addEventListener("seeked", function () {
            scheduleSync();
        });
        audio.addEventListener("play", function () {
            startPolling();
            scheduleSync();
        });
        audio.addEventListener("playing", function () {
            startPolling();
            scheduleSync();
        });
        audio.addEventListener("pause", function () {
            stopPolling();
            scheduleSync();
        });
        audio.addEventListener("ended", function () {
            stopPolling();
            updateTimedImages(true);
        });
        audio.addEventListener("loadedmetadata", function () {
            scheduleSync();
        });
        audio.addEventListener("canplay", function () {
            scheduleSync();
        });
        audio.addEventListener("canplaythrough", function () {
            scheduleSync();
        });

        document.addEventListener("change", function (e) {
            if (e.target === audio || (e.target.tagName === "INPUT" && e.target.type === "range")) {
                scheduleSync();
            }
        }, true);

        document.addEventListener("touchend", function () {
            setTimeout(function () {
                scheduleSync();
            }, 50);
        }, false);

        window.addEventListener("pageshow", function () {
            scheduleSync();
        });
    }

    attachSyncListeners();
    scheduleSync();
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

