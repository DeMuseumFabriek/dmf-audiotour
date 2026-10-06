document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("static-search-form");
    const input = document.getElementById("static-search-query");
    const results = document.getElementById("static-search-results");
    const status = document.getElementById("static-search-status");

    if (!form || !input || !results || !status) {
        return;
    }

    const locale = (status.dataset.locale || document.documentElement.lang || "nl").toLowerCase();
    const language = locale.startsWith("en") ? "en" : locale.startsWith("de") ? "de" : "nl";
    const translations = {
        nl: {
            unavailable: "Zoeken is tijdelijk niet beschikbaar.",
            none: "Geen zoekresultaten gevonden",
            one: "1 resultaat gevonden",
            many: (count) => `${count} resultaten gevonden`
        },
        en: {
            unavailable: "Search is temporarily unavailable.",
            none: "No search results found",
            one: "1 result found",
            many: (count) => `${count} results found`
        },
        de: {
            unavailable: "Suche ist vorübergehend nicht verfügbar.",
            none: "Keine Suchergebnisse gefunden",
            one: "1 Ergebnis gefunden",
            many: (count) => `${count} Ergebnisse gefunden`
        }
    };

    const text = translations[language];

    const query = new URLSearchParams(window.location.search).get("query") || "";
    input.value = query;

    const hasServerResults = results.querySelector("li") !== null;
    if (hasServerResults) {
        status.textContent = "";
    }

    const cancelButtons = document.querySelectorAll("[data-search-cancel]");
    cancelButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const searchUrl = new URL(window.location.href);
            searchUrl.searchParams.delete("query");
            if (document.referrer && document.referrer.startsWith(window.location.origin)) {
                window.history.back();
                return;
            }
            window.location.href = searchUrl.pathname;
        });
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const searchUrl = new URL(window.location.href);
        searchUrl.searchParams.set("query", input.value.trim());
        window.location.href = searchUrl.toString();
    });

    if (!query.trim()) {
        return;
    }

    if (hasServerResults) {
        return;
    }

    try {
        const response = await fetch("../search-index.json");
        if (!response.ok) {
            throw new Error("Search index unavailable");
        }

        const documents = await response.json();
        const numericQuery = /^\p{Decimal_Number}+$/u.test(query);
        const matches = documents.filter((document) => {
            if (numericQuery) {
                if (typeof document.description_top !== "string") {
                    return false;
                }
                const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                const numberPattern = new RegExp(
                    `(?:^|[^\\p{Decimal_Number}])${escapedQuery}(?!\\p{Decimal_Number})`,
                    "u"
                );
                return numberPattern.test(document.description_top);
            }

            const searchableText = `${document.title} ${document.text}`.toLocaleLowerCase();
            return searchableText.includes(query.toLocaleLowerCase());
        });

        results.replaceChildren();

        if (matches.length === 0) {
            status.textContent = text.none;
            return;
        }

        status.textContent = matches.length === 1
            ? text.one
            : text.many(matches.length);

        if (matches.length === 1) {
            window.location.href = matches[0].url;
            return;
        }

        for (const match of matches) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = match.url;
            link.textContent = match.title;
            item.appendChild(link);
            results.appendChild(item);
        }
    } catch (error) {
        if (results.querySelector("li")) {
            status.textContent = "";
            return;
        }
        status.textContent = text.unavailable;
        console.error(error);
    }
});
