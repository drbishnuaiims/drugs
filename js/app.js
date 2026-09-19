/* =========================================================
   THOMSON CLINIC
   DRUG PRICE INTELLIGENCE
   MODULE 4 — PRICE INTELLIGENCE UI
========================================================= */


/* =========================================================
   DOM
========================================================= */

const searchInput =
    document.getElementById("drugSearch");

const autocomplete =
    document.getElementById("autocomplete");

const emptyState =
    document.getElementById("emptyState");

const drugSection =
    document.getElementById("drugSection");

const drugTitle =
    document.getElementById("drugTitle");

const drugSubtitle =
    document.getElementById("drugSubtitle");

const drugTags =
    document.getElementById("drugTags");

const summaryGrid =
    document.getElementById("summaryGrid");

const brandTable =
    document.getElementById("brandTable");

const brandCount =
    document.getElementById("brandCount");


/* =========================================================
   STATE
========================================================= */

let currentDrug = null;
let currentFormulation = null;


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeApp() {

    const database =
        await DrugDatabase.load();

    if (!database) {

        showDatabaseError();

        return;
    }

    console.log(
        `Loaded ${database.drugs.length} medicines`
    );

}


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    function () {

        const query =
            this.value.trim();

        if (!query) {

            autocomplete.classList.remove(
                "active"
            );

            return;
        }

        const results =
            DrugDatabase.search(
                query
            );

        renderSuggestions(
            results
        );

    }
);


/* =========================================================
   SEARCH SUGGESTIONS
========================================================= */

function renderSuggestions(results) {

    autocomplete.innerHTML = "";

    if (!results.length) {

        autocomplete.innerHTML = `

            <div class="suggestion">

                <div>

                    <div class="suggestion-name">
                        No matching medicine
                    </div>

                    <div class="suggestion-meta">
                        Try generic name,
                        brand name or strength.
                    </div>

                </div>

            </div>

        `;

        autocomplete.classList.add(
            "active"
        );

        return;
    }


    results.forEach(
        drug => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "suggestion";


            const strengths =
                [
                    ...new Set(
                        drug.formulations.map(
                            f =>
                                f.strength
                        )
                    )
                ].join(", ");


            item.innerHTML = `

                <div>

                    <div class="suggestion-name">
                        ${drug.genericName}
                    </div>

                    <div class="suggestion-meta">
                        ${drug.therapeuticClass}
                        · ${strengths}
                    </div>

                </div>

                <div class="suggestion-type">
                    DRUG
                </div>

            `;


            item.addEventListener(
                "click",
                () => {

                    selectDrug(drug);

                }
            );


            autocomplete.appendChild(
                item
            );

        }
    );


    autocomplete.classList.add(
        "active"
    );
}


/* =========================================================
   SELECT DRUG
========================================================= */

function selectDrug(drug) {

    currentDrug =
        drug;

    searchInput.value =
        drug.genericName;

    autocomplete.classList.remove(
        "active"
    );

    emptyState.style.display =
        "none";

    drugSection.classList.add(
        "visible"
    );

    renderDrug(
        drug
    );

    window.scrollTo({

        top:
            document.querySelector(
                ".main"
            ).offsetTop - 80,

        behavior:
            "smooth"

    });

}


/* =========================================================
   RENDER DRUG
========================================================= */

function renderDrug(drug) {

    drugTitle.textContent =
        drug.genericName;

    drugSubtitle.textContent =
        drug.therapeuticClass;


    const brandCountValue =
        countBrands(drug);


    drugTags.innerHTML = `

        <span class="tag">
            ${drug.therapeuticClass}
        </span>

        <span class="tag">
            ${drug.formulations.length}
            formulations
        </span>

        <span class="tag">
            ${brandCountValue}
            brands
        </span>

    `;


    renderFormulationSelector(
        drug
    );


    if (
        drug.formulations.length
    ) {

        selectFormulation(
            drug.formulations[0]
        );

    }

}


/* =========================================================
   FORMULATION SELECTOR
========================================================= */

function renderFormulationSelector(
    drug
) {

    const existing =
        document.getElementById(
            "formulationSelector"
        );

    if (existing) {
        existing.remove();
    }


    const container =
        document.createElement(
            "div"
        );

    container.id =
        "formulationSelector";


    container.style.cssText = `
        margin-top:18px;
        display:flex;
        flex-wrap:wrap;
        gap:8px;
    `;


    drug.formulations.forEach(
        formulation => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                `${formulation.strength} ${formulation.dosageForm}`;


            button.style.cssText = `
                border:1px solid #dce3e8;
                background:#ffffff;
                color:#173f5f;
                border-radius:8px;
                padding:8px 11px;
                cursor:pointer;
                font-size:12px;
                transition:all .18s ease;
            `;


            button.addEventListener(
                "click",
                () => {

                    selectFormulation(
                        formulation
                    );


                    document
                        .querySelectorAll(
                            "#formulationSelector button"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    drugSection
        .querySelector(
            ".drug-header"
        )
        .appendChild(
            container
        );

}


/* =========================================================
   SELECT FORMULATION
========================================================= */

function selectFormulation(
    formulation
) {

    currentFormulation =
        formulation;


    /*
       Remove old dynamic sections
       before rendering the newly
       selected formulation.
    */

    document
        .getElementById("pharmacyComparison")
        ?.remove();


    document
        .getElementById("treatmentCost")
        ?.remove();


    document
        .getElementById("dataFreshness")
        ?.remove();


    /*
       Render the new formulation
       data.
    */

    renderPriceSummary(
        formulation
    );


    renderPharmacyComparison(
        formulation
    );


    renderBrands(
        formulation
    );


    renderTreatmentCost(
        formulation
    );


    renderFreshness(
        formulation
    );

}


/* =========================================================
   GET LISTINGS
========================================================= */

function getListings(
    formulation
) {

    return DrugDatabase
        .getPriceListings(
            formulation
        );

}


/* =========================================================
   PRICE SUMMARY
========================================================= */

function renderPriceSummary(
    formulation
) {

    const listings =
        getListings(
            formulation
        );


    if (!listings.length) {

        summaryGrid.innerHTML =
            "";

        return;
    }


    const prices =
        listings.map(
            item =>
                item.pricePerUnit
        );


    const sorted =
        [...prices].sort(
            (a,b) =>
                a - b
        );


    const lowest =
        sorted[0];


    const highest =
        sorted[
            sorted.length - 1
        ];


    const median =
        calculateMedian(
            sorted
        );


    const difference =
        highest > lowest
            ? (
                (
                    highest -
                    lowest
                )
                /
                lowest
            ) * 100
            : 0;


    const lowestListing =
        listings.find(
            item =>
                item.pricePerUnit ===
                lowest
        );


    summaryGrid.innerHTML = `

        <div class="summary-card">

            <div class="summary-label">
                Lowest price / unit
            </div>

            <div class="summary-value">
                ₹${lowest.toFixed(2)}
            </div>

            <div class="summary-unit">
                ${lowestListing.source}
            </div>

            <div class="price-difference">
                Lowest observed
            </div>

        </div>


        <div class="summary-card">

            <div class="summary-label">
                Median price / unit
            </div>

            <div class="summary-value">
                ₹${median.toFixed(2)}
            </div>

            <div class="summary-unit">
                Across all listings
            </div>

        </div>


        <div class="summary-card">

            <div class="summary-label">
                Highest price / unit
            </div>

            <div class="summary-value">
                ₹${highest.toFixed(2)}
            </div>

            <div class="summary-unit">
                Across all listings
            </div>

            ${
                difference > 0
                ? `
                    <div class="price-difference">
                        ${difference.toFixed(0)}%
                        price spread
                    </div>
                  `
                : ""
            }

        </div>

    `;

}


/* =========================================================
   PHARMACY COMPARISON
========================================================= */

function renderPharmacyComparison(
    formulation
) {

    const listings =
        getListings(
            formulation
        );


    const existing =
        document.getElementById(
            "pharmacyComparison"
        );


    if (existing) {
        existing.remove();
    }


    if (!listings.length) {
        return;
    }


    const grouped = {};


    listings.forEach(
        listing => {

            if (
                !grouped[
                    listing.source
                ]
            ) {

                grouped[
                    listing.source
                ] = [];

            }


            grouped[
                listing.source
            ].push(
                listing
            );

        }
    );


    const section =
        document.createElement(
            "div"
        );


    section.id =
        "pharmacyComparison";


    section.className =
        "section-card";


    section.innerHTML = `

        <div class="section-header">

            <div>

                <h3 class="section-title">
                    Pharmacy Price Comparison
                </h3>

                <div class="section-caption">
                    Lowest available listing from each source
                </div>

            </div>

        </div>

        <div class="pharmacy-grid">
        </div>

    `;


    const grid =
        section.querySelector(
            ".pharmacy-grid"
        );


    Object.entries(
        grouped
    ).forEach(
        (
            [source, sourceListings]
        ) => {

            const best =
                sourceListings.reduce(
                    (
                        lowest,
                        item
                    ) =>
                        item.pricePerUnit <
                        lowest.pricePerUnit
                            ? item
                            : lowest
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pharmacy-card";


            card.innerHTML = `

                <div class="pharmacy-name">
                    ${source}
                </div>

                <div class="pharmacy-price">
                    ₹${best.pricePerUnit.toFixed(2)}
                </div>

                <div class="pharmacy-unit">
                    per ${formulation.dosageForm.toLowerCase()}
                </div>

                <div class="pharmacy-detail">
                    ${best.brandName}
                </div>

                <div class="pharmacy-detail">
                    Pack of ${best.packSize}
                </div>

                <div class="pharmacy-updated">
                    Checked ${formatDate(
                        best.checkedAt
                    )}
                </div>

            `;


            grid.appendChild(
                card
            );

        }
    );


    /*
       Insert before the main brand table.
    */

    const brandSection =
        brandTable.closest(
            ".section-card"
        );


    brandSection.parentNode.insertBefore(
        section,
        brandSection
    );

}


/* =========================================================
   BRAND TABLE
========================================================= */

function renderBrands(
    formulation
) {

    const listings =
        getListings(
            formulation
        );


    brandTable.innerHTML =
        "";


    listings.sort(
        (a,b) =>
            a.pricePerUnit -
            b.pricePerUnit
    );


    const lowest =
        listings.length
            ? listings[0].pricePerUnit
            : null;


    listings.forEach(
        listing => {

            const row =
                document.createElement(
                    "tr"
                );


            const isLowest =
                listing.pricePerUnit ===
                lowest;


            row.innerHTML = `

                <td>

                    <div class="brand-name-cell">
                        ${listing.brandName}
                    </div>

                    ${
                        isLowest
                        ? `
                            <span class="lowest">
                                Lowest
                            </span>
                          `
                        : ""
                    }

                </td>


                <td>

                    <div class="manufacturer">
                        ${listing.manufacturer}
                    </div>

                </td>


                <td>
                    ${listing.packSize}
                    ${listing.packUnit}
                </td>


                <td>

                    <span class="price">
                        ₹${listing.mrp.toFixed(2)}
                    </span>

                </td>


                <td>

                    <span class="price">
                        ₹${listing.sellingPrice.toFixed(2)}
                    </span>

                    <div class="manufacturer">
                        ${listing.discountPercent.toFixed(0)}% off
                    </div>

                </td>


                <td>

                    <span class="unit-price">
                        ₹${listing.pricePerUnit.toFixed(2)}
                    </span>

                </td>


                <td>

                    <span class="source-badge">
                        ${listing.source}
                    </span>

                </td>

            `;


            brandTable.appendChild(
                row
            );

        }
    );


    brandCount.textContent =
        `${listings.length} listings`;

}


/* =========================================================
   TREATMENT COST
========================================================= */

function renderTreatmentCost(
    formulation
) {

    const existing =
        document.getElementById(
            "treatmentCost"
        );


    if (existing) {
        existing.remove();
    }


    const listings =
        getListings(
            formulation
        );


    if (!listings.length) {
        return;
    }


    const lowest =
        Math.min(
            ...listings.map(
                item =>
                    item.pricePerUnit
            )
        );


    const section =
        document.createElement(
            "div"
        );


    section.id =
        "treatmentCost";

    section.className =
        "section-card";


    section.innerHTML = `

        <div class="section-header">

            <div>

                <h3 class="section-title">
                    Treatment Cost Estimate
                </h3>

                <div class="section-caption">
                    Based on the lowest observed
                    price per unit
                </div>

            </div>

        </div>


        <div class="cost-body">

            <div class="cost-input-group">

                <label>
                    Units per day
                </label>

                <input
                    id="dailyUnits"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value="1"
                >

            </div>


            <div class="cost-result">

                <div class="cost-label">
                    Estimated monthly medicine cost
                </div>

                <div
                    id="monthlyCost"
                    class="cost-value"
                >
                    ₹${(
                        lowest * 30
                    ).toFixed(0)}
                </div>

                <div class="cost-note">
                    Approximate 30-day cost
                </div>

            </div>

        </div>

    `;


    const brandSection =
        brandTable.closest(
            ".section-card"
        );


    brandSection.parentNode.insertBefore(
        section,
        brandSection.nextSibling
    );


    const input =
        section.querySelector(
            "#dailyUnits"
        );


    const result =
        section.querySelector(
            "#monthlyCost"
        );


    input.addEventListener(
        "input",
        function () {

            const units =
                Number(
                    this.value
                ) || 0;


            const monthly =
                lowest *
                units *
                30;


            result.textContent =
                `₹${monthly.toFixed(0)}`;

        }
    );

}


/* =========================================================
   DATA FRESHNESS
========================================================= */

function renderFreshness(
    formulation
) {

    const existing =
        document.getElementById(
            "dataFreshness"
        );


    if (existing) {
        existing.remove();
    }


    const listings =
        getListings(
            formulation
        );


    if (!listings.length) {
        return;
    }


    const dates =
        listings.map(
            item =>
                new Date(
                    item.checkedAt
                )
        );


    const latest =
        new Date(
            Math.max(
                ...dates.map(
                    date =>
                        date.getTime()
                )
            )
        );


    const section =
        document.createElement(
            "div"
        );


    section.id =
        "dataFreshness";


    section.className =
        "freshness-bar";


    section.innerHTML = `

        <div>

            <strong>
                Price data
            </strong>

            <span>
                Last checked
                ${formatDate(
                    latest.toISOString()
                )}
            </span>

        </div>


        <span class="refresh-status">
            DEMO DATA
        </span>

    `;


    summaryGrid.parentNode.insertBefore(
        section,
        summaryGrid.nextSibling
    );

}


/* =========================================================
   HELPERS
========================================================= */

function calculateMedian(
    sorted
) {

    if (!sorted.length) {
        return 0;
    }


    const middle =
        Math.floor(
            sorted.length / 2
        );


    if (
        sorted.length % 2 === 0
    ) {

        return (
            sorted[middle - 1]
            +
            sorted[middle]
        ) / 2;

    }


    return sorted[middle];

}


function countBrands(
    drug
) {

    return drug.formulations
        .reduce(
            (
                total,
                formulation
            ) =>
                total +
                formulation.brands.length,
            0
        );

}


function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown";

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   DATABASE ERROR
========================================================= */

function showDatabaseError() {

    autocomplete.innerHTML = `

        <div class="suggestion">

            <div>

                <div class="suggestion-name">
                    Database unavailable
                </div>

                <div class="suggestion-meta">
                    Check that Live Server
                    is running.
                </div>

            </div>

        </div>

    `;

    autocomplete.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE SEARCH
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            !event.target.closest(
                ".search-wrapper"
            )
        ) {

            autocomplete.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   ESCAPE
========================================================= */

searchInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            autocomplete.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   START
========================================================= */

initializeApp();