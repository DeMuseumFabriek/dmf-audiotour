document.addEventListener("DOMContentLoaded", function () {
    const helpBtn = document.querySelector(".help-button");
    const popup = document.querySelector(".help-popup");
    const closeBtn = document.querySelector(".close-help");

    if (!helpBtn || !popup || !closeBtn) return;

    helpBtn.addEventListener("click", () => {
        popup.classList.remove("hidden");
    });

    closeBtn.addEventListener("click", () => {
        popup.classList.add("hidden");
    });
});
