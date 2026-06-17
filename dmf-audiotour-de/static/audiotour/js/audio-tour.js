document.addEventListener("DOMContentLoaded", function () {
    const menuBtn = document.querySelector(".menu-button");
    const menu = document.querySelector(".menu-popup");
    const closeMenu = document.querySelector(".close-menu");

    if (menuBtn && menu && closeMenu) {
        menuBtn.addEventListener("click", () => {
            menu.classList.remove("hidden");
        });

        closeMenu.addEventListener("click", () => {
            menu.classList.add("hidden");
        });
    }
});
