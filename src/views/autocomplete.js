// Minimal JS for SearchCustomVariable — maps selected note title to its hidden ID field.
// Uses event delegation to ensure it works regardless of when the DOM is injected by Joplin.

function syncSearchValue(input) {
    var hiddenId = input.getAttribute("data-hidden-id");
    if (!hiddenId) return;

    var hiddenInput = document.getElementById(hiddenId);
    if (!hiddenInput) return;

    var notesMap = {};
    try {
        notesMap = JSON.parse(input.getAttribute("data-notes-map") || "{}");
    } catch (e) {
        notesMap = {};
    }

    var title = input.value;
    if (notesMap[title] !== undefined) {
        hiddenInput.value = notesMap[title]; // store the note ID
    } else {
        hiddenInput.value = ""; // no valid note selected yet
    }
}

document.addEventListener("input", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("search-datalist-input")) {
        syncSearchValue(e.target);
    }
});

document.addEventListener("change", function (e) {
    if (e.target && e.target.classList && e.target.classList.contains("search-datalist-input")) {
        syncSearchValue(e.target);
    }
});
