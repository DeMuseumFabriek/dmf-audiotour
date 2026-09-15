document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("static-search-form");
    const input = document.getElementById("static-search-query");
    const results = document.getElementById("static-search-results");
    const status = document.getElementById("static-search-status");

    if (!form || !input || !results || !status) {
        return;
    }

    const query = new URLSearchParams(window.location.search).get("query") || "";
    input.value = query;

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const searchUrl = new URL(window.location.href);
        searchUrl.searchParams.set("query", input.value.trim());
        window.location.href = searchUrl.toString();
    });

    if (!query.trim()) {
        return;
    }

    try {
        const response = await fetch("../search-index.json");
        if (!response.ok) {
            throw new Error("Search index unavailable");
        }

        const documents = await response.json();
        const normalizedQuery = query.trim().toLocaleLowerCase();
        const matches = documents.filter((document) => {
            const searchableText = `${document.title} ${document.text}`.toLocaleLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        results.replaceChildren();
        status.textContent = matches.length === 1
            ? "1 resultaat gevonden"
            : `${matches.length} resultaten gevonden`;

        for (const match of matches) {
            const item = document.createElement("li");
            const link = document.createElement("a");
            link.href = match.url;
            link.textContent = match.title;
            item.appendChild(link);
            results.appendChild(item);
        }
    } catch (error) {
        status.textContent = "Zoeken is tijdelijk niet beschikbaar.";
        console.error(error);
    }
});
