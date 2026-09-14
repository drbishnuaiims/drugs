/* =========================================================
   PSYCHOPHARM REFERENCE
   Drug Monograph Renderer
   ========================================================= */

"use strict";


/* =========================================================
   1. CONFIGURATION
   ========================================================= */

const DRUG_DATA_URL = "data/drugs.json";
const HEADER_URL = "components/header.html";
const FOOTER_URL = "components/footer.html";


/* =========================================================
   2. DOM
   ========================================================= */

const headerContainer =
    document.getElementById("site-header");

const footerContainer =
    document.getElementById("site-footer");

const monographContainer =
    document.getElementById("drug-monograph");


/* =========================================================
   3. INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initDrugPage
);


async function initDrugPage() {

    await Promise.all([
        loadHeader(),
        loadFooter()
    ]);

    await loadMonograph();

}


/* =========================================================
   4. SHARED COMPONENTS
   ========================================================= */

async function loadHeader() {

    if (!headerContainer) {
        return;
    }

    try {

        const response =
            await fetch(HEADER_URL);

        if (!response.ok) {
            throw new Error(
                `Header request failed: ${response.status}`
            );
        }

        headerContainer.innerHTML =
            await response.text();

    } catch (error) {

        console.error(
            "Unable to load header:",
            error
        );

        headerContainer.innerHTML = "";

    }
}


async function loadFooter() {

    if (!footerContainer) {
        return;
    }

    try {

        const response =
            await fetch(FOOTER_URL);

        if (!response.ok) {
            throw new Error(
                `Footer request failed: ${response.status}`
            );
        }

        footerContainer.innerHTML =
            await response.text();

    } catch (error) {

        console.error(
            "Unable to load footer:",
            error
        );

        footerContainer.innerHTML = "";

    }
}


/* =========================================================
   5. LOAD DATABASE
   ========================================================= */

async function loadMonograph() {

    if (!monographContainer) {
        return;
    }

    try {

        const drugId =
            getDrugIdFromURL();

        if (!drugId) {

            renderError(
                "No medication was specified."
            );

            return;
        }


        const response =
            await fetch(DRUG_DATA_URL);

        if (!response.ok) {

            throw new Error(
                `Database request failed: ${response.status}`
            );

        }


        const database =
            await response.json();


        if (
            !database ||
            !Array.isArray(database.drugs)
        ) {

            throw new Error(
                "Invalid medication database format."
            );

        }


        const drug =
            database.drugs.find(
                item =>
                    String(item.id).toLowerCase() ===
                    String(drugId).toLowerCase()
            );


        if (!drug) {

            renderError(
                "Medication not found."
            );

            return;
        }


        renderMonograph(drug);

        updatePageMeta(drug);

    } catch (error) {

        console.error(
            "Unable to load monograph:",
            error
        );

        renderError(
            "Unable to load this medication monograph."
        );

    }

}


/* =========================================================
   6. URL
   ========================================================= */

function getDrugIdFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("id");

}


/* =========================================================
   7. PAGE META
   ========================================================= */

function updatePageMeta(drug) {

    const genericName =
        drug?.identity?.genericName ||
        "Medication";

    document.title =
        `${genericName} | Psychopharm Reference`;


    const metaDescription =
        document.querySelector(
            'meta[name="description"]'
        );

    if (metaDescription) {

        metaDescription.setAttribute(
            "content",
            `${genericName} clinical monograph — prescribing, dosing, safety, pharmacokinetics, interactions and treatment guidance.`
        );

    }

}


/* =========================================================
   8. MAIN RENDER
   ========================================================= */

function renderMonograph(drug) {

    const identity =
        drug.identity || {};

    const nbn =
        identity.nbn || {};

    monographContainer.innerHTML = `

        ${renderNavigation()}

        ${renderIdentity(drug)}

        ${renderSnapshot(drug)}

        ${renderCriticalAlerts(drug)}

        ${renderIndications(drug)}

        ${renderMechanism(drug)}

        ${renderEvidence(drug)}

        ${renderDosing(drug)}

        ${renderTrajectory(drug)}

        ${renderSafety(drug)}

        ${renderPharmacokinetics(drug)}

        ${renderInteractions(drug)}

        ${renderSpecialPopulations(drug)}

        ${renderContraindications(drug)}

        ${renderStoppingSwitching(drug)}

        ${renderClinicalPearls(drug)}

        ${renderBrands(drug)}

        ${renderReferences(drug)}

    `;

}


/* =========================================================
   9. NAVIGATION
   ========================================================= */

function renderNavigation() {

    const items = [
        ["identity", "Identity"],
        ["indications", "Indications"],
        ["mechanism", "Mechanism"],
        ["evidence", "Evidence"],
        ["dosing", "Dosing"],
        ["trajectory", "Trajectory"],
        ["safety", "Safety"],
        ["pk", "PK"],
        ["interactions", "Interactions"],
        ["populations", "Special populations"],
        ["contraindications", "Contraindications"],
        ["stopping", "Stopping / switching"],
        ["pearls", "Clinical pearls"],
        ["brands", "Brands"],
        ["references", "References"]
    ];

    return `
        <nav
            class="monograph-nav"
            aria-label="Monograph sections"
        >

            ${items.map(
                ([id, label]) => `
                    <a href="#${id}">
                        ${escapeHTML(label)}
                    </a>
                `
            ).join("")}

        </nav>
    `;

}


/* =========================================================
   10. IDENTITY
   ========================================================= */

function renderIdentity(drug) {

    const identity =
        drug.identity || {};

    const nbn =
        identity.nbn || {};

    const genericName =
        identity.genericName ||
        "Unnamed medication";

    const drugClass =
        identity.class ||
        "Not populated";

    const category =
        identity.category ||
        "";


    return `
        <section
            id="identity"
            class="identity-block drug-section"
        >

            <div class="identity-top">

                <div class="identity-main">

                    <h1 class="drug-name">
                        ${escapeHTML(genericName)}
                    </h1>

                    <p class="drug-class-line">
                        ${escapeHTML(drugClass)}
                    </p>

                    ${
                        category
                            ? `
                                <p class="identity-category">
                                    ${escapeHTML(category)}
                                </p>
                            `
                            : ""
                    }


                    <div class="badge-row">

                        ${
                            identity.genericAvailable === true
                                ? `
                                    <span class="badge badge-positive">
                                        Generic available
                                    </span>
                                `
                                : `
                                    <span class="badge badge-neutral">
                                        Generic availability not confirmed
                                    </span>
                                `
                        }


                        ${
                            identity.habitForming === true
                                ? `
                                    <span class="badge badge-warning">
                                        Habit-forming
                                    </span>
                                `
                                : `
                                    <span class="badge badge-neutral">
                                        Not habit-forming
                                    </span>
                                `
                        }


                        ${
                            nbn.domain
                                ? `
                                    <span class="badge badge-neutral">
                                        NBN: ${escapeHTML(nbn.domain)}
                                    </span>
                                `
                                : ""
                        }

                    </div>

                </div>


                <div class="identity-side">

                    <p class="identity-side-label">
                        Pharmacological domain
                    </p>

                    <p class="identity-side-value">
                        ${
                            nbn.mechanism
                                ? escapeHTML(nbn.mechanism)
                                : "Not populated"
                        }
                    </p>

                </div>

            </div>


            <div class="quick-facts">

                ${renderFact(
                    "Generic",
                    identity.genericAvailable === true
                        ? "Available"
                        : "Not confirmed"
                )}

                ${renderFact(
                    "Habit-forming",
                    identity.habitForming === true
                        ? "Yes"
                        : "No"
                )}

                ${renderFact(
                    "Class",
                    drugClass
                )}

                ${renderFact(
                    "NBN domain",
                    nbn.domain || "Not populated"
                )}

            </div>

        </section>
    `;

}


function renderFact(label, value) {

    return `
        <div class="fact">

            <p class="fact-label">
                ${escapeHTML(label)}
            </p>

            <p class="fact-value">
                ${escapeHTML(value)}
            </p>

        </div>
    `;

}


/* =========================================================
   11. PRESCRIBING SNAPSHOT
   ========================================================= */

function renderSnapshot(drug) {

    const dosing =
        drug.dosing || {};

    const indications =
        Array.isArray(drug.regulatoryIndications)
            ? drug.regulatoryIndications
            : [];

    const firstDose =
        dosing.indications?.[0];


    const doseText =
        firstDose?.startingDose ||
        firstDose?.usualDose ||
        "See dosing section";


    const maxText =
        firstDose?.maximumDose ||
        "See dosing section";


    const forms =
        Array.isArray(dosing.dosageForms)
            ? dosing.dosageForms.join(", ")
            : "See dosing section";


    return `
        <section
            class="prescribing-snapshot drug-section"
        >

            <div class="snapshot-header">

                <h2 class="snapshot-title">
                    Prescribing Snapshot
                </h2>

            </div>


            <div class="snapshot-grid">

                ${renderSnapshotItem(
                    "Primary uses",
                    indications.length
                        ? indications.slice(0, 3).join(", ")
                        : "See indications"
                )}

                ${renderSnapshotItem(
                    "Typical starting dose",
                    doseText
                )}

                ${renderSnapshotItem(
                    "Maximum dose",
                    maxText
                )}

                ${renderSnapshotItem(
                    "Dosage forms",
                    forms
                )}

                ${renderSnapshotItem(
                    "Renal",
                    dosing.renalAdjustment ||
                    "See special populations"
                )}

                ${renderSnapshotItem(
                    "Hepatic",
                    dosing.hepaticAdjustment ||
                    "See special populations"
                )}

            </div>

        </section>
    `;

}


function renderSnapshotItem(label, value) {

    return `
        <div class="snapshot-item">

            <p class="snapshot-label">
                ${escapeHTML(label)}
            </p>

            <p class="snapshot-value">
                ${escapeHTML(value)}
            </p>

        </div>
    `;

}


/* =========================================================
   12. CRITICAL ALERTS
   ========================================================= */

function renderCriticalAlerts(drug) {

    const safety =
        drug.safety || {};

    const warnings =
        Array.isArray(safety.criticalWarnings)
            ? safety.criticalWarnings
            : [];

    if (!warnings.length) {
        return "";
    }


    return `
        <section
            class="critical-alerts drug-section"
        >

            <h2 class="critical-alerts-title">
                Critical Alerts
            </h2>

            <ul class="critical-alerts-list">

                ${warnings.map(
                    warning => `
                        <li>
                            ${escapeHTML(warning)}
                        </li>
                    `
                ).join("")}

            </ul>

        </section>
    `;

}


/* =========================================================
   13. INDICATIONS
   ========================================================= */

function renderIndications(drug) {

    const regulatory =
        Array.isArray(drug.regulatoryIndications)
            ? drug.regulatoryIndications
            : [];

    const common =
        Array.isArray(drug.commonUses)
            ? drug.commonUses
            : [];


    return `
        <section
            id="indications"
            class="drug-section"
        >

            ${sectionHeader(
                "Indications & Evidence",
                "Regulatory indications are distinguished from common clinical use."
            )}


            <div class="indication-columns">

                <div class="indication-group">

                    <h3 class="indication-group-title">
                        Regulatory indications
                    </h3>

                    ${
                        regulatory.length
                            ? `
                                <ul class="indication-list">

                                    ${regulatory.map(
                                        item => `
                                            <li class="indication-regulatory">
                                                ${escapeHTML(item)}
                                            </li>
                                        `
                                    ).join("")}

                                </ul>
                            `
                            : `
                                ${notPopulated()}
                            `
                    }

                </div>


                <div class="indication-group">

                    <h3 class="indication-group-title">
                        Commonly used for
                    </h3>

                    ${
                        common.length
                            ? `
                                <ul class="indication-list">

                                    ${common.map(
                                        item => `
                                            <li>
                                                ${escapeHTML(item)}
                                            </li>
                                        `
                                    ).join("")}

                                </ul>
                            `
                            : `
                                ${notPopulated()}
                            `
                    }

                </div>

            </div>

        </section>
    `;

}


/* =========================================================
   14. MECHANISM
   ========================================================= */

function renderMechanism(drug) {

    const mechanism =
        drug.mechanism || {};

    const depth =
        mechanism.inDepth || {};


    return `
        <section
            id="mechanism"
            class="drug-section"
        >

            ${sectionHeader(
                "Mechanism of Action",
                "Clinical mechanism followed by pharmacological detail."
            )}


            <p class="mechanism-clinical">

                ${
                    mechanism.clinical
                        ? escapeHTML(mechanism.clinical)
                        : "Not populated."
                }

            </p>


            <details class="mechanism-depth">

                <summary>
                    Pharmacology in depth
                </summary>

                <div class="mechanism-depth-content">

                    <div class="mechanism-grid">

                        ${renderMechanismDetail(
                            "Receptors",
                            formatArray(depth.receptors)
                        )}

                        ${renderMechanismDetail(
                            "Transporters",
                            formatArray(depth.transporters)
                        )}

                        ${renderMechanismDetail(
                            "Affinity",
                            formatArray(depth.affinity)
                        )}

                        ${renderMechanismDetail(
                            "Potency",
                            formatArray(depth.potency)
                        )}

                        ${renderMechanismDetail(
                            "Structure–activity",
                            depth.structureActivity
                        )}

                    </div>

                </div>

            </details>

        </section>
    `;

}


function renderMechanismDetail(label, value) {

    return `
        <div class="mechanism-detail">

            <p class="detail-label">
                ${escapeHTML(label)}
            </p>

            <p class="detail-value">
                ${escapeHTML(
                    value || "Not populated"
                )}
            </p>

        </div>
    `;

}


/* =========================================================
   15. EVIDENCE
   ========================================================= */

function renderEvidence(drug) {

    const evidence =
        Array.isArray(drug.evidence)
            ? drug.evidence
            : [];


    return `
        <section
            id="evidence"
            class="drug-section"
        >

            ${sectionHeader(
                "Indications & Evidence",
                "Evidence summaries are shown by indication."
            )}


            ${
                evidence.length
                    ? `
                        <div class="evidence-grid">

                            ${evidence.map(
                                renderEvidenceCard
                            ).join("")}

                        </div>
                    `
                    : notPopulated()
            }

        </section>
    `;

}


function renderEvidenceCard(item) {

    const title =
        item.indication ||
        item.title ||
        "Indication";


    return `
        <article class="evidence-card">

            <h3 class="evidence-card-title">
                ${escapeHTML(title)}
            </h3>

            ${evidenceRow(
                "Trial dose",
                item.trialDose
            )}

            ${evidenceRow(
                "Onset",
                item.onset
            )}

            ${evidenceRow(
                "Evidence",
                item.evidenceSummary ||
                item.summary
            )}

            ${evidenceRow(
                "RCTs",
                item.rctCount
            )}

            ${evidenceRow(
                "Comparator",
                item.comparator
            )}

            ${evidenceRow(
                "Effect size",
                item.effectSize
            )}

        </article>
    `;

}


function evidenceRow(label, value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "";
    }

    return `
        <div class="evidence-row">

            <div class="evidence-label">
                ${escapeHTML(label)}
            </div>

            <div class="evidence-value">
                ${escapeHTML(
                    formatValue(value)
                )}
            </div>

        </div>
    `;

}


/* =========================================================
   16. DOSING
   ========================================================= */

function renderDosing(drug) {

    const dosing =
        drug.dosing || {};

    const indications =
        Array.isArray(dosing.indications)
            ? dosing.indications
            : [];

    const tips =
        Array.isArray(dosing.administrationTips)
            ? dosing.administrationTips
            : [];


    return `
        <section
            id="dosing"
            class="drug-section"
        >

            ${sectionHeader(
                "Dosing & Administration",
                "Dose by indication, titration, formulation and administration."
            )}


            ${
                indications.length
                    ? `
                        <div class="dosing-table-wrapper">

                            <table class="dosing-table">

                                <thead>
                                    <tr>
                                        <th>Indication</th>
                                        <th>Starting dose</th>
                                        <th>Target / usual dose</th>
                                        <th>Maximum</th>
                                        <th>Titration</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    ${indications.map(
                                        item => `
                                            <tr>

                                                <td>
                                                    ${escapeHTML(
                                                        item.indication ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHTML(
                                                        item.startingDose ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHTML(
                                                        item.targetDose ||
                                                        item.usualDose ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHTML(
                                                        item.maximumDose ||
                                                        "—"
                                                    )}
                                                </td>

                                                <td>
                                                    ${escapeHTML(
                                                        item.titration ||
                                                        "—"
                                                    )}
                                                </td>

                                            </tr>
                                        `
                                    ).join("")}

                                </tbody>

                            </table>

                        </div>
                    `
                    : notPopulated()
            }


            <div class="two-column">

                <div>

                    <h3 class="detail-label">
                        Dosage forms
                    </h3>

                    <p class="detail-value">
                        ${
                            formatArray(
                                dosing.dosageForms
                            ) ||
                            "Not populated"
                        }
                    </p>

                </div>


                <div>

                    <h3 class="detail-label">
                        Organ function
                    </h3>

                    <p class="detail-value">
                        <strong>Renal:</strong>
                        ${
                            escapeHTML(
                                dosing.renalAdjustment ||
                                "Not populated"
                            )
                        }
                        <br>

                        <strong>Hepatic:</strong>
                        ${
                            escapeHTML(
                                dosing.hepaticAdjustment ||
                                "Not populated"
                            )
                        }
                    </p>

                </div>

            </div>


            ${
                tips.length
                    ? `
                        <div class="dosing-tips">

                            <h3 class="dosing-tips-title">
                                Administration tips
                            </h3>

                            <ul class="dosing-tips-list">

                                ${tips.map(
                                    tip => `
                                        <li>
                                            ${escapeHTML(tip)}
                                        </li>
                                    `
                                ).join("")}

                            </ul>

                        </div>
                    `
                    : ""
            }

        </section>
    `;

}


/* =========================================================
   17. TRAJECTORY
   ========================================================= */

function renderTrajectory(drug) {

    const trajectory =
        drug.trajectory || {};

    const works =
        trajectory.ifWorks || {};

    const fails =
        trajectory.ifFails || {};

    const augmentation =
        Array.isArray(trajectory.augmentation)
            ? trajectory.augmentation
            : [];


    return `
        <section
            id="trajectory"
            class="drug-section"
        >

            ${sectionHeader(
                "Trajectory of Treatment",
                "What to do when treatment works — and when it does not."
            )}


            <div class="trajectory-grid">

                <article class="trajectory-card works">

                    <h3 class="trajectory-title">
                        If it works
                    </h3>

                    <ul class="trajectory-list">

                        ${trajectoryItem(
                            "Response",
                            works.responseDefinition
                        )}

                        ${trajectoryItem(
                            "Remission",
                            works.remissionGoal
                        )}

                        ${trajectoryItem(
                            "Continuation",
                            works.continuationDuration
                        )}

                        ${trajectoryItem(
                            "Maintenance",
                            works.maintenance
                        )}

                    </ul>

                </article>


                <article class="trajectory-card fails">

                    <h3 class="trajectory-title">
                        If it fails
                    </h3>

                    <ul class="trajectory-list">

                        ${trajectoryItem(
                            "Non-response",
                            fails.nonResponseDefinition
                        )}

                        ${trajectoryItem(
                            "Assessment",
                            fails.assessmentTime
                        )}

                        ${trajectoryItem(
                            "Escalation",
                            fails.escalation
                        )}

                        ${trajectoryItem(
                            "Switching",
                            fails.switchingTriggers
                        )}

                    </ul>

                </article>

            </div>


            ${
                augmentation.length
                    ? `
                        <div class="augmentation">

                            <h3 class="augmentation-title">
                                Augmentation options
                            </h3>

                            <ul class="trajectory-list">

                                ${augmentation.map(
                                    item => `
                                        <li>
                                            ${escapeHTML(
                                                formatValue(item)
                                            )}
                                        </li>
                                    `
                                ).join("")}

                            </ul>

                        </div>
                    `
                    : ""
            }

        </section>
    `;

}


function trajectoryItem(label, value) {

    if (!value) {
        return "";
    }

    return `
        <li>
            <strong>
                ${escapeHTML(label)}:
            </strong>
            ${escapeHTML(value)}
        </li>
    `;

}


/* =========================================================
   18. SAFETY
   ========================================================= */

function renderSafety(drug) {

    const safety =
        drug.safety || {};

    return `
        <section
            id="safety"
            class="drug-section"
        >

            ${sectionHeader(
                "Safety",
                "Adverse effects, clinically important risks and management."
            )}


            <div class="safety-grid">

                ${renderSafetyCard(
                    "Common",
                    safety.common,
                    "safety-common"
                )}

                ${renderSafetyCard(
                    "Uncommon",
                    safety.uncommon,
                    "safety-uncommon"
                )}

                ${renderSafetyCard(
                    "Rare",
                    safety.rare,
                    "safety-rare"
                )}

                ${renderSafetyCard(
                    "Rare / life-threatening",
                    safety.lifeThreatening,
                    "safety-life"
                )}

            </div>


            ${renderQuickProfile(
                safety.quickProfile
            )}


            ${
                Array.isArray(safety.management) &&
                safety.management.length
                    ? renderManagement(
                        safety.management
                    )
                    : ""
            }

        </section>
    `;

}


function renderSafetyCard(title, items, className) {

    const list =
        Array.isArray(items)
            ? items
            : [];


    return `
        <article
            class="safety-card ${className}"
        >

            <h3 class="safety-card-title">
                ${escapeHTML(title)}
            </h3>

            ${
                list.length
                    ? `
                        <ul class="safety-list">

                            ${list.map(
                                item => `
                                    <li>
                                        ${escapeHTML(
                                            formatValue(item)
                                        )}
                                    </li>
                                `
                            ).join("")}

                        </ul>
                    `
                    : notPopulated()
            }

        </article>
    `;

}


function renderQuickProfile(profile) {

    if (!profile) {
        return "";
    }

    const items = [
        ["Weight gain", profile.weightGain],
        ["Sedation", profile.sedation],
        ["Sexual dysfunction", profile.sexualDysfunction],
        ["QT risk", profile.qtRisk],
        ["Metabolic risk", profile.metabolicRisk]
    ];


    return `
        <div class="clinical-tags">

            ${items
                .filter(
                    ([, value]) =>
                        value !== null &&
                        value !== undefined &&
                        value !== ""
                )
                .map(
                    ([label, value]) => `
                        <span class="clinical-tag">
                            <strong>
                                ${escapeHTML(label)}:
                            </strong>
                            ${escapeHTML(value)}
                        </span>
                    `
                )
                .join("")}

        </div>
    `;

}


function renderManagement(items) {

    return `
        <div style="margin-top:20px;">

            <h3 class="detail-label">
                Side-effect management
            </h3>

            <div class="management-list">

                ${items.map(
                    item => {

                        const sideEffect =
                            item.sideEffect ||
                            item.effect ||
                            item.problem ||
                            "Adverse effect";

                        const action =
                            item.management ||
                            item.action ||
                            item.recommendation ||
                            "";

                        return `
                            <div class="management-item">

                                <div class="management-side-effect">
                                    ${escapeHTML(
                                        sideEffect
                                    )}
                                </div>

                                <div class="management-action">
                                    ${escapeHTML(
                                        action
                                    )}
                                </div>

                            </div>
                        `;
                    }
                ).join("")}

            </div>

        </div>
    `;

}


/* =========================================================
   19. PHARMACOKINETICS
   ========================================================= */

function renderPharmacokinetics(drug) {

    const pk =
        drug.pharmacokinetics || {};


    const rows = [
        ["Half-life", pk.halfLife],
        ["Steady state", pk.steadyState],
        ["Bioavailability", pk.bioavailability],
        ["Protein binding", pk.proteinBinding],
        ["Metabolism", pk.metabolism],
        ["Elimination", pk.elimination]
    ];


    return `
        <section
            id="pk"
            class="drug-section"
        >

            ${sectionHeader(
                "Pharmacokinetics",
                "Key parameters relevant to dosing and clinical interpretation."
            )}


            <div class="pharm-table-wrapper">

                <table class="pharm-table">

                    <tbody>

                        ${rows.map(
                            ([label, value]) => `
                                <tr>

                                    <td>
                                        ${escapeHTML(label)}
                                    </td>

                                    <td>
                                        ${
                                            value
                                                ? escapeHTML(value)
                                                : "Not populated"
                                        }
                                    </td>

                                </tr>
                            `
                        ).join("")}

                    </tbody>

                </table>

            </div>

        </section>
    `;

}


/* =========================================================
   20. INTERACTIONS
   ========================================================= */

function renderInteractions(drug) {

    const interactions =
        Array.isArray(drug.interactions)
            ? drug.interactions
            : [];


    return `
        <section
            id="interactions"
            class="drug-section"
        >

            ${sectionHeader(
                "Interactions",
                "Clinically relevant pharmacodynamic and pharmacokinetic interactions."
            )}


            ${
                interactions.length
                    ? `
                        <div class="interaction-table-wrapper">

                            <table class="interaction-table">

                                <thead>
                                    <tr>
                                        <th>Interacting drug / class</th>
                                        <th>Severity</th>
                                        <th>Clinical significance</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    ${interactions.map(
                                        renderInteractionRow
                                    ).join("")}

                                </tbody>

                            </table>

                        </div>
                    `
                    : notPopulated()
            }

        </section>
    `;

}


function renderInteractionRow(item) {

    const severity =
        item.severity ||
        item.risk ||
        "";

    const severityClass =
        getInteractionSeverityClass(
            severity
        );


    return `
        <tr>

            <td>
                ${escapeHTML(
                    item.drug ||
                    item.interactingDrug ||
                    item.interaction ||
                    "—"
                )}
            </td>

            <td
                class="interaction-severity ${severityClass}"
            >
                ${escapeHTML(
                    severity || "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    item.significance ||
                    item.clinicalEffect ||
                    item.description ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    item.action ||
                    item.management ||
                    "—"
                )}
            </td>

        </tr>
    `;

}


function getInteractionSeverityClass(
    severity
) {

    const text =
        String(severity)
            .toLowerCase();


    if (
        text.includes("major") ||
        text.includes("contraind")
    ) {
        return "interaction-major";
    }

    if (
        text.includes("moderate") ||
        text.includes("caution")
    ) {
        return "interaction-moderate";
    }

    return "interaction-clinical";

}


/* =========================================================
   21. SPECIAL POPULATIONS
   ========================================================= */

function renderSpecialPopulations(drug) {

    const populations =
        drug.specialPopulations || {};


    const definitions = [
        ["elderly", "Elderly"],
        ["childrenAdolescents", "Children & adolescents"],
        ["pregnancy", "Pregnancy"],
        ["breastfeeding", "Breastfeeding"],
        ["renal", "Renal impairment"],
        ["hepatic", "Hepatic impairment"],
        ["cardiac", "Cardiac disease"]
    ];


    return `
        <section
            id="populations"
            class="drug-section"
        >

            ${sectionHeader(
                "Special Populations",
                "Population-specific considerations and dose adjustments."
            )}


            <div class="population-grid">

                ${definitions.map(
                    ([key, title]) => {

                        const data =
                            populations[key];

                        return renderPopulationRow(
                            title,
                            data
                        );

                    }
                ).join("")}

            </div>

        </section>
    `;

}


function renderPopulationRow(
    title,
    data
) {

    if (!data) {

        return `
            <div class="population-row">

                <div class="population-title">
                    ${escapeHTML(title)}
                </div>

                <div class="population-content">
                    Not populated.
                </div>

            </div>
        `;

    }


    const parts = [
        data.recommendation,
        data.doseAdjustment,
        data.monitoring,
        data.evidence,
        data.considerations
    ]
        .filter(Boolean);


    return `
        <div class="population-row">

            <div class="population-title">
                ${escapeHTML(title)}
            </div>

            <div class="population-content">

                ${
                    parts.length
                        ? parts.map(
                            part => `
                                <p>
                                    ${escapeHTML(part)}
                                </p>
                            `
                        ).join("")
                        : "Not populated."
                }

            </div>

        </div>
    `;

}


/* =========================================================
   22. CONTRAINDICATIONS
   ========================================================= */

function renderContraindications(drug) {

    const items =
        Array.isArray(drug.contraindications)
            ? drug.contraindications
            : [];


    return `
        <section
            id="contraindications"
            class="drug-section"
        >

            ${sectionHeader(
                "Contraindications / Do Not Use",
                "Situations in which treatment should generally be avoided."
            )}


            <div class="contraindications">

                ${
                    items.length
                        ? `
                            <ul class="contraindications-list">

                                ${items.map(
                                    item => `
                                        <li>
                                            ${escapeHTML(
                                                formatValue(item)
                                            )}
                                        </li>
                                    `
                                ).join("")}

                            </ul>
                        `
                        : "Not populated."
                }

            </div>

        </section>
    `;

}


/* =========================================================
   23. STOPPING / SWITCHING
   ========================================================= */

function renderStoppingSwitching(drug) {

    const data =
        drug.stoppingSwitching || {};

    const taper =
        data.taper || {};

    const overdose =
        data.overdose || {};

    const switching =
        Array.isArray(data.switching)
            ? data.switching
            : [];


    return `
        <section
            id="stopping"
            class="drug-section"
        >

            ${sectionHeader(
                "Stopping & Switching",
                "Tapering, withdrawal, switching strategies and overdose."
            )}


            <div class="switch-grid">

                <article class="switch-card">

                    <h3 class="switch-card-title">
                        Tapering
                    </h3>

                    <div class="switch-card-content">

                        <p>
                            ${
                                taper.protocol
                                    ? escapeHTML(
                                        taper.protocol
                                    )
                                    : "Not populated."
                            }
                        </p>


                        ${
                            Array.isArray(
                                taper.withdrawalSymptoms
                            ) &&
                            taper.withdrawalSymptoms.length
                                ? `
                                    <strong>
                                        Withdrawal symptoms
                                    </strong>

                                    <ul class="withdrawal-list">

                                        ${taper.withdrawalSymptoms.map(
                                            item => `
                                                <li>
                                                    ${escapeHTML(item)}
                                                </li>
                                            `
                                        ).join("")}

                                    </ul>
                                `
                                : ""
                        }

                    </div>

                </article>


                <article class="switch-card">

                    <h3 class="switch-card-title">
                        Switching
                    </h3>

                    <div class="switch-card-content">

                        ${
                            switching.length
                                ? `
                                    <ul class="switching-list">

                                        ${switching.map(
                                            item => `
                                                <li>
                                                    ${escapeHTML(
                                                        formatValue(item)
                                                    )}
                                                </li>
                                            `
                                        ).join("")}

                                    </ul>
                                `
                                : "Not populated."
                        }

                    </div>

                </article>

            </div>


            <div class="overdose-box">

                <h3 class="overdose-title">
                    Overdose
                </h3>

                <div class="switch-card-content">

                    ${
                        overdose.toxicity
                            ? `
                                <p>
                                    ${escapeHTML(
                                        overdose.toxicity
                                    )}
                                </p>
                            `
                            : ""
                    }


                    ${
                        Array.isArray(
                            overdose.signs
                        ) &&
                        overdose.signs.length
                            ? `
                                <strong>
                                    Signs
                                </strong>

                                <ul class="overdose-signs">

                                    ${overdose.signs.map(
                                        item => `
                                            <li>
                                                ${escapeHTML(item)}
                                            </li>
                                        `
                                    ).join("")}

                                </ul>
                            `
                            : ""
                    }


                    ${
                        overdose.management
                            ? `
                                <p>
                                    <strong>
                                        Management:
                                    </strong>
                                    ${escapeHTML(
                                        overdose.management
                                    )}
                                </p>
                            `
                            : ""
                    }

                </div>

            </div>

        </section>
    `;

}


/* =========================================================
   24. CLINICAL PEARLS
   ========================================================= */

function renderClinicalPearls(drug) {

    const pearls =
        drug.clinicalPearls || {};


    const categories = [
        ["Advantages", pearls.advantages],
        ["Disadvantages", pearls.disadvantages],
        ["Patient selection", pearls.patientSelection],
        ["Primary target symptoms", pearls.primaryTargetSymptoms],
        ["Expert pearls", pearls.expertPearls]
    ];


    const populated =
        categories.filter(
            ([, items]) =>
                Array.isArray(items) &&
                items.length
        );


    return `
        <section
            id="pearls"
            class="drug-section"
        >

            ${sectionHeader(
                "Clinical Pearls",
                "Practical points for treatment selection and day-to-day prescribing."
            )}


            ${
                populated.length
                    ? `
                        <div class="pearl-box">

                            ${populated.map(
                                ([title, items]) => `

                                    <div
                                        style="margin-bottom:18px;"
                                    >

                                        <h3 class="pearl-category">
                                            ${escapeHTML(title)}
                                        </h3>

                                        <ul class="pearl-list">

                                            ${items.map(
                                                item => `
                                                    <li>
                                                        ${escapeHTML(
                                                            formatValue(item)
                                                        )}
                                                    </li>
                                                `
                                            ).join("")}

                                        </ul>

                                    </div>

                                `
                            ).join("")}

                        </div>
                    `
                    : notPopulated()
            }

        </section>
    `;

}


/* =========================================================
   25. INDIAN BRANDS
   ========================================================= */

function renderBrands(drug) {

    const brands =
        Array.isArray(drug.brands)
            ? drug.brands
            : [];


    return `
        <section
            id="brands"
            class="drug-section"
        >

            <div class="brands-header">

                <div>

                    ${sectionHeader(
                        "Indian Brands & Prices",
                        "Brand availability and pricing are region- and date-dependent."
                    )}

                </div>

            </div>


            ${
                brands.length
                    ? `
                        <div class="brand-table-wrapper">

                            <table class="brand-table">

                                <thead>

                                    <tr>
                                        <th>Brand</th>
                                        <th>Manufacturer</th>
                                        <th>Strength</th>
                                        <th>Pack</th>
                                        <th>Price</th>
                                        <th>MRP</th>
                                        <th>Source / date</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    ${brands.map(
                                        renderBrandRow
                                    ).join("")}

                                </tbody>

                            </table>

                        </div>
                    `
                    : notPopulated()
            }

        </section>
    `;

}


function renderBrandRow(brand) {

    const price =
        brand.price !== null &&
        brand.price !== undefined &&
        brand.price !== ""
            ? formatPrice(
                brand.price,
                brand.currency
            )
            : "—";


    const mrp =
        brand.mrp !== null &&
        brand.mrp !== undefined &&
        brand.mrp !== ""
            ? formatPrice(
                brand.mrp,
                brand.currency
            )
            : "—";


    const source =
        brand.source ||
        "Not specified";


    const date =
        brand.lastUpdated ||
        "";


    return `
        <tr>

            <td>
                <strong>
                    ${escapeHTML(
                        brand.brandName ||
                        "—"
                    )}
                </strong>

                ${
                    brand.availability
                        ? `
                            <span class="brand-availability">
                                ${escapeHTML(
                                    brand.availability
                                )}
                            </span>
                        `
                        : ""
                }

            </td>

            <td>
                ${escapeHTML(
                    brand.manufacturer ||
                    "Not verified"
                )}
            </td>

            <td>
                ${escapeHTML(
                    brand.strength ||
                    "—"
                )}
            </td>

            <td>
                ${escapeHTML(
                    brand.packSize ||
                    "—"
                )}
            </td>

            <td class="price-cell">
                ${escapeHTML(price)}
            </td>

            <td class="mrp-cell">
                ${escapeHTML(mrp)}
            </td>

            <td>
                ${escapeHTML(source)}

                ${
                    date
                        ? `
                            <div class="price-updated">
                                Checked:
                                ${escapeHTML(date)}
                            </div>
                        `
                        : ""
                }

            </td>

        </tr>
    `;

}


/* =========================================================
   26. REFERENCES
   ========================================================= */

function renderReferences(drug) {

    const references =
        Array.isArray(drug.references)
            ? drug.references
            : [];


    return `
        <section
            id="references"
            class="drug-section"
        >

            ${sectionHeader(
                "References",
                "Sources used for the medication monograph."
            )}


            ${
                references.length
                    ? `
                        <ol class="reference-list">

                            ${references.map(
                                (reference) => {

                                    const title =
                                        reference.title ||
                                        "Reference";

                                    const meta =
                                        [
                                            reference.type,
                                            reference.organization,
                                            reference.year
                                        ]
                                            .filter(Boolean)
                                            .join(" · ");

                                    return `
                                        <li class="reference-item">

                                            <p class="reference-title">
                                                ${escapeHTML(title)}
                                            </p>

                                            ${
                                                meta
                                                    ? `
                                                        <p class="reference-meta">
                                                            ${escapeHTML(meta)}
                                                        </p>
                                                    `
                                                    : ""
                                            }


                                            ${
                                                reference.url
                                                    ? `
                                                        <a
                                                            class="reference-link"
                                                            href="${escapeAttribute(
                                                                reference.url
                                                            )}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            View source
                                                        </a>
                                                    `
                                                    : ""
                                            }

                                        </li>
                                    `;

                                }
                            ).join("")}

                        </ol>
                    `
                    : notPopulated()
            }

        </section>
    `;

}


/* =========================================================
   27. SECTION HEADER
   ========================================================= */

function sectionHeader(
    title,
    subtitle = ""
) {

    return `
        <div class="drug-section-header">

            <div>

                <h2 class="drug-section-title">
                    ${escapeHTML(title)}
                </h2>

                ${
                    subtitle
                        ? `
                            <p class="drug-section-subtitle">
                                ${escapeHTML(subtitle)}
                            </p>
                        `
                        : ""
                }

            </div>

        </div>
    `;

}


/* =========================================================
   28. EMPTY STATE
   ========================================================= */

function notPopulated() {

    return `
        <div class="not-populated">
            Information not yet populated.
        </div>
    `;

}


/* =========================================================
   29. ERROR
   ========================================================= */

function renderError(message) {

    if (!monographContainer) {
        return;
    }

    monographContainer.innerHTML = `
        <div class="state-message state-error">
            ${escapeHTML(message)}
        </div>
    `;

}


/* =========================================================
   30. FORMAT HELPERS
   ========================================================= */

function formatArray(value) {

    if (!Array.isArray(value)) {
        return value
            ? String(value)
            : "";
    }

    return value
        .filter(Boolean)
        .map(item => formatValue(item))
        .join("; ");

}


function formatValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    if (Array.isArray(value)) {
        return formatArray(value);
    }


    if (
        typeof value === "object"
    ) {

        return Object.entries(value)
            .map(
                ([key, item]) =>
                    `${key}: ${formatValue(item)}`
            )
            .join("; ");

    }


    return String(value);

}


function formatPrice(
    value,
    currency = "INR"
) {

    const numeric =
        Number(value);


    if (
        Number.isFinite(numeric)
    ) {

        if (
            String(currency)
                .toUpperCase() === "INR"
        ) {

            return `₹${numeric.toFixed(2)}`;

        }

        return `${currency} ${numeric.toFixed(2)}`;

    }


    return String(value);

}


/* =========================================================
   31. SECURITY / HTML ESCAPING
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHTML(value);

}