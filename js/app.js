/* =========================================================
   PSYCHOPHARM REFERENCE
   Homepage Application
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const DATA_URL = "data/drugs.json";
const HEADER_URL = "components/header.html";
const FOOTER_URL = "components/footer.html";


/* =========================================================
   2. DOM ELEMENTS
   ========================================================= */

const headerContainer = document.getElementById("site-header");
const footerContainer = document.getElementById("site-footer");

const drugGrid = document.getElementById("drug-grid");
const drugSearch = document.getElementById("drug-search");
const clearSearchButton = document.getElementById("clear-search");

const drugCount = document.getElementById("drug-count");
const drugLoading = document.getElementById("drug-loading");
const drugError = document.getElementById("drug-error");
const drugEmpty = document.getElementById("drug-empty");


/* =========================================================
   3. APPLICATION STATE
   ========================================================= */

let allDrugs = [];
let currentSearch = "";


/* =========================================================
   4. INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", init);


async function init() {

    setupSearch();

    await Promise.all([
        loadHeader(),
        loadFooter()
    ]);

    await loadDrugDatabase();
}


/* =========================================================
   5. SHARED COMPONENTS
   ========================================================= */

async function loadHeader() {

    if (!headerContainer) {
        return;
    }

    try {

        const response = await fetch(HEADER_URL);

        if (!response.ok) {
            throw new Error(
                `Header request failed: ${response.status}`
            );
        }

        headerContainer.innerHTML = await response.text();

    } catch (error) {

        console.error("Unable to load header:", error);

        /*
         * The page remains usable even if the shared
         * header cannot be loaded.
         */
        headerContainer.innerHTML = "";

    }
}


async function loadFooter() {

    if (!footerContainer) {
        return;
    }

    try {

        const response = await fetch(FOOTER_URL);

        if (!response.ok) {
            throw new Error(
                `Footer request failed: ${response.status}`
            );
        }

        footerContainer.innerHTML = await response.text();

    } catch (error) {

        console.error("Unable to load footer:", error);

        footerContainer.innerHTML = "";

    }
}


/* =========================================================
   6. LOAD DRUG DATABASE
   ========================================================= */

async function loadDrugDatabase() {

    showLoading();

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                `Drug database request failed: ${response.status}`
            );
        }

        const database = await response.json();

        if (
            !database ||
            !Array.isArray(database.drugs)
        ) {
            throw new Error(
                "Invalid drug database format."
            );
        }

        allDrugs = database.drugs;

        renderDrugs(allDrugs);

    } catch (error) {

        console.error(
            "Unable to load drug database:",
            error
        );

        showDatabaseError();

    }
}


/* =========================================================
   7. SEARCH SETUP
   ========================================================= */

function setupSearch() {

    if (!drugSearch) {
        return;
    }

    drugSearch.addEventListener(
        "input",
        handleSearch
    );


    if (clearSearchButton) {

        clearSearchButton.addEventListener(
            "click",
            clearSearch
        );

    }

}


/* =========================================================
   8. SEARCH HANDLER
   ========================================================= */

function handleSearch(event) {

    currentSearch = event.target.value
        .trim()
        .toLowerCase();

    updateClearButton();

    const filteredDrugs = filterDrugs(
        allDrugs,
        currentSearch
    );

    renderDrugs(filteredDrugs);
}


/* =========================================================
   9. FILTER DRUGS
   ========================================================= */

function filterDrugs(drugs, searchTerm) {

    if (!searchTerm) {
        return drugs;
    }

    return drugs.filter((drug) => {

        const searchableText =
            buildSearchText(drug);

        return searchableText.includes(
            searchTerm
        );

    });
}


/* =========================================================
   10. BUILD SEARCHABLE TEXT
   ========================================================= */

function buildSearchText(drug) {

    const identity = drug?.identity || {};
    const nbn = identity?.nbn || {};

    const brandNames = Array.isArray(
        identity.brandNames
    )
        ? identity.brandNames
        : [];

    const regulatoryIndications =
        Array.isArray(drug?.regulatoryIndications)
            ? drug.regulatoryIndications
            : [];

    const commonUses =
        Array.isArray(drug?.commonUses)
            ? drug.commonUses
            : [];

    return [
        identity.genericName,
        identity.class,
        identity.category,
        nbn.domain,
        nbn.mechanism,

        ...brandNames,

        ...regulatoryIndications,
        ...commonUses
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
}


/* =========================================================
   11. RENDER DRUGS
   ========================================================= */

function renderDrugs(drugs) {

    if (!drugGrid) {
        return;
    }

    hideLoading();
    hideDatabaseError();

    drugGrid.innerHTML = "";

    updateDrugCount(drugs.length);


    if (!drugs.length) {

        drugEmpty.hidden = false;

        return;
    }


    drugEmpty.hidden = true;


    const fragment =
        document.createDocumentFragment();


    drugs.forEach((drug) => {

        const card =
            createDrugCard(drug);

        fragment.appendChild(card);

    });


    drugGrid.appendChild(fragment);
}


/* =========================================================
   12. CREATE DRUG CARD
   ========================================================= */

function createDrugCard(drug) {

    const card =
        document.createElement("article");

    card.className = "drug-card";

    card.tabIndex = 0;

    const identity =
        drug?.identity || {};

    const nbn =
        identity?.nbn || {};


    const genericName =
        identity.genericName ||
        drug?.id ||
        "Unnamed medication";


    const category =
        identity.category ||
        "";


    const drugClass =
        identity.class ||
        "";


    const mechanism =
        nbn.mechanism ||
        "";


    const indications =
        Array.isArray(drug?.regulatoryIndications)
            ? drug.regulatoryIndications
            : [];


    const commonUses =
        Array.isArray(drug?.commonUses)
            ? drug.commonUses
            : [];


    const allIndications = [
        ...indications,
        ...commonUses
    ];


    card.innerHTML = `
        <div class="drug-card-top">

            <h3 class="drug-card-name">
                ${escapeHTML(genericName)}
            </h3>

            ${
                category
                    ? `
                        <span class="drug-card-category">
                            ${escapeHTML(category)}
                        </span>
                    `
                    : ""
            }

        </div>


        ${
            drugClass
                ? `
                    <p class="drug-card-class">
                        ${escapeHTML(drugClass)}
                    </p>
                `
                : ""
        }


        ${
            mechanism
                ? `
                    <p class="drug-card-mechanism">
                        ${escapeHTML(mechanism)}
                    </p>
                `
                : ""
        }


        ${
            allIndications.length
                ? `
                    <div class="drug-card-indications">
                        ${renderIndicationTags(
                            allIndications
                        )}
                    </div>
                `
                : ""
        }


        <div class="drug-card-badges">

            ${
                identity.genericAvailable === true
                    ? `
                        <span class="card-badge card-badge-generic">
                            Generic available
                        </span>
                    `
                    : ""
            }


            ${
                identity.habitForming === true
                    ? `
                        <span class="card-badge card-badge-warning">
                            Habit-forming
                        </span>
                    `
                    : `
                        <span class="card-badge card-badge-habit">
                            Not habit-forming
                        </span>
                    `
            }

        </div>


        <span
            class="drug-card-arrow"
            aria-hidden="true"
        >
            →
        </span>
    `;


    /*
     * Open the monograph when the card is clicked.
     */
    card.addEventListener(
        "click",
        () => openDrug(drug)
    );


    /*
     * Keyboard accessibility.
     */
    card.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openDrug(drug);
            }

        }
    );


    return card;
}


/* =========================================================
   13. INDICATION TAGS
   ========================================================= */

function renderIndicationTags(indications) {

    /*
     * Remove duplicates while preserving order.
     */
    const uniqueIndications = [
        ...new Set(
            indications
                .filter(Boolean)
                .map(
                    (item) => String(item).trim()
                )
        )
    ];


    /*
     * Keep the homepage cards compact.
     */
    const visible =
        uniqueIndications.slice(0, 4);


    return visible
        .map(
            (indication) => `
                <span class="drug-card-indication">
                    ${escapeHTML(indication)}
                </span>
            `
        )
        .join("");
}


/* =========================================================
   14. OPEN DRUG MONOGRAPH
   ========================================================= */

function openDrug(drug) {

    if (!drug?.id) {
        return;
    }

    window.location.href =
        `drug.html?id=${encodeURIComponent(drug.id)}`;
}


/* =========================================================
   15. SEARCH CLEAR
   ========================================================= */

function clearSearch() {

    if (!drugSearch) {
        return;
    }

    drugSearch.value = "";

    currentSearch = "";

    updateClearButton();

    renderDrugs(allDrugs);

    drugSearch.focus();
}


function updateClearButton() {

    if (!clearSearchButton) {
        return;
    }

    clearSearchButton.hidden =
        !currentSearch;

}


/* =========================================================
   16. COUNT
   ========================================================= */

function updateDrugCount(count) {

    if (!drugCount) {
        return;
    }

    const label =
        count === 1
            ? "1 medication"
            : `${count} medications`;

    drugCount.textContent = label;
}


/* =========================================================
   17. LOADING / ERROR STATES
   ========================================================= */

function showLoading() {

    if (drugLoading) {
        drugLoading.hidden = false;
    }

    if (drugError) {
        drugError.hidden = true;
    }

    if (drugEmpty) {
        drugEmpty.hidden = true;
    }
}


function hideLoading() {

    if (drugLoading) {
        drugLoading.hidden = true;
    }
}


function showDatabaseError() {

    hideLoading();

    if (drugError) {
        drugError.hidden = false;
    }

    if (drugEmpty) {
        drugEmpty.hidden = true;
    }

    if (drugGrid) {
        drugGrid.innerHTML = "";
    }

    if (drugCount) {
        drugCount.textContent =
            "Database unavailable";
    }
}


function hideDatabaseError() {

    if (drugError) {
        drugError.hidden = true;
    }
}


/* =========================================================
   18. HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}