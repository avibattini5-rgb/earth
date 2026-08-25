"use strict";

/* =========================================================
   EARTH // 2086
   GLOBAL COUNTRY EXPLORER
========================================================= */


/* =========================================================
   CONFIGURATION
========================================================= */

const CONFIG = {
    API_URL:
        "https://api.restcountries.com/countries/v5",

    /*
     * For testing:
     * rc_live_demo
     *
     * For the real production website:
     * replace this with your own REST Countries API key.
     */
    API_KEY: "rc_live_demo",

    API_LIMIT: 100,

    /*
     * We specifically want the 193 UN member states.
     * These are the countries excluded from the main explorer.
     */
    EXCLUDED_CODES: new Set([
        "ALA",
        "ASM",
        "ATA",
        "ABW",
        "BMU",
        "BES",
        "BVT",
        "CCK",
        "CXR",
        "COK",
        "CUW",
        "CPT",
        "ESH",
        "FLK",
        "FRO",
        "GUF",
        "GGY",
        "GIB",
        "GRL",
        "GLP",
        "GUM",
        "HKG",
        "IMN",
        "JEY",
        "MAC",
        "MTQ",
        "MSR",
        "MYT",
        "NCL",
        "NIU",
        "NFK",
        "PCN",
        "PRI",
        "PYF",
        "REU",
        "SHN",
        "SPM",
        "SXM",
        "TAA",
        "TKL",
        "TCA",
        "UMI",
        "VAT",
        "VGB",
        "VIR",
        "WLF",
        "WSM"
    ])
};


/* =========================================================
   GLOBAL STATE
========================================================= */

const STATE = {
    countries: [],
    filteredCountries: [],
    currentCountry: null,

    globe: {
        rotation: 0,
        tilt: 0,
        zoom: 1,
        autoRotate: true,
        dragging: false,
        lastX: 0,
        lastY: 0,
        animationFrame: null
    }
};


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const byId = id =>
    document.getElementById(id);


/* =========================================================
   APPLICATION START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApplication
);


async function initializeApplication() {

    initializeNavigation();
    initializeMobileMenu();
    initializeSearchOverlay();
    initializeHeroSearch();
    initializeCountryModal();

    initializeGlobe();
    initializeGlobeControls();

    initializeMapControls();

    initializeCounters();

    initializeParallax();
    initializeMagneticButtons();

    initializeImageFallbacks();
    initializeKeyboardControls();

    initializeClock();
    initializeSystemStatus();

    initializeSmoothLinks();

    await loadRealCountries();

    initializeRevealAnimations();

    startBootSequence();
}


/* =========================================================
   BOOT SEQUENCE
========================================================= */

function startBootSequence() {

    const bootScreen =
        byId("bootScreen");

    const progressBar =
        byId("bootProgressBar");

    const percent =
        byId("bootPercent");

    const status =
        $(".boot-status");

    const app =
        $(".app");

    if (!bootScreen) {
        app?.classList.add("ready");
        return;
    }

    const messages = [
        "INITIALIZING PLANETARY CORE",
        "CONNECTING GLOBAL DATABASE",
        "LOADING COUNTRY INTELLIGENCE",
        "CALIBRATING CARTOGRAPHIC ENGINE",
        "SYNCHRONIZING EARTH DATA",
        "SYSTEM READY"
    ];

    let progress = 0;

    const timer = setInterval(() => {

        progress +=
            Math.floor(Math.random() * 7) + 4;

        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
        }

        if (progressBar) {
            progressBar.style.width =
                `${progress}%`;
        }

        if (percent) {
            percent.textContent =
                `${progress}%`;
        }

        if (status) {

            const index =
                Math.min(
                    Math.floor(progress / 18),
                    messages.length - 1
                );

            status.textContent =
                messages[index];
        }

        if (progress === 100) {

            setTimeout(() => {

                bootScreen.classList.add("hidden");

                app?.classList.add("ready");

                initializeRevealAnimations();

            }, 700);
        }

    }, 120);
}


/* =========================================================
   REAL COUNTRY DATABASE
========================================================= */

async function loadRealCountries() {

    showDatabaseStatus("CONNECTING TO GLOBAL DATABASE");

    try {

        const allRecords =
            await fetchAllCountries();

        const normalized =
            allRecords
                .map(normalizeCountry)
                .filter(Boolean);

        STATE.countries =
            normalized;

        STATE.filteredCountries =
            [...normalized];

        renderCountryCards();
        updateGlobalStatistics();

        showDatabaseStatus(
            `${STATE.countries.length} COUNTRIES ONLINE`
        );

    } catch (error) {

        console.error(
            "Country database error:",
            error
        );

        showDatabaseStatus(
            "DATABASE CONNECTION FAILED"
        );

        /*
         * Fall back to countries.json if available.
         */
        await loadLocalDatabase();
    }
}


/* =========================================================
   FETCH API
========================================================= */

async function fetchAllCountries() {

    const records = [];

    let offset = 0;

    let more = true;

    while (more) {

        const url =
            `${CONFIG.API_URL}` +
            `?limit=${CONFIG.API_LIMIT}` +
            `&offset=${offset}`;

        const response =
            await fetch(url, {
                headers: {
                    "Authorization":
                        `Bearer ${CONFIG.API_KEY}`
                }
            });

        if (!response.ok) {
            throw new Error(
                `API HTTP ${response.status}`
            );
        }

        const result =
            await response.json();

        const objects =
            result?.data?.objects || [];

        const meta =
            result?.data?.meta || {};

        records.push(...objects);

        more =
            Boolean(meta.more) &&
            objects.length > 0;

        offset += objects.length;

        /*
         * Safety stop.
         */
        if (offset > 500) {
            break;
        }
    }

    /*
     * Remove territories/dependencies.
     * This leaves the main country set.
     */
    return records.filter(country => {

        const code =
            country?.codes?.alpha_3;

        return !CONFIG.EXCLUDED_CODES.has(code);
    });
}


/* =========================================================
   LOCAL DATABASE FALLBACK
========================================================= */

async function loadLocalDatabase() {

    try {

        const response =
            await fetch(
                "data/countries.json",
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Local database unavailable"
            );
        }

        const data =
            await response.json();

        const source =
            Array.isArray(data)
                ? data
                : data.countries || [];

        STATE.countries =
            source.map(normalizeCountry)
                .filter(Boolean);

        STATE.filteredCountries =
            [...STATE.countries];

        renderCountryCards();

        updateGlobalStatistics();

    } catch (error) {

        console.error(
            "Local database error:",
            error
        );

        STATE.countries = [];

        showDatabaseStatus(
            "NO COUNTRY DATA AVAILABLE"
        );
    }
}


/* =========================================================
   NORMALIZE API DATA
========================================================= */

function normalizeCountry(country) {

    if (!country) return null;

    const name =
        country?.names?.common ||
        country?.name?.common ||
        country?.name ||
        "";

    if (!name) return null;

    const languages =
        extractLanguages(
            country.languages
        );

    const currencies =
        extractCurrencies(
            country.currencies
        );

    const capitals =
        Array.isArray(country.capitals)
            ? country.capitals
                .map(capital =>
                    typeof capital === "string"
                        ? capital
                        : capital?.name
                )
                .filter(Boolean)
            : [];

    const continents =
        Array.isArray(country.continents)
            ? country.continents
            : [];

    const flag =
        country?.flag?.svg ||
        country?.flags?.svg ||
        country?.flag?.png ||
        country?.flags?.png ||
        "";

    return {

        name,

        officialName:
            country?.names?.official ||
            country?.name?.official ||
            name,

        code:
            country?.codes?.alpha_3 ||
            "",

        code2:
            country?.codes?.alpha_2 ||
            "",

        capital:
            capitals.join(", ") ||
            "No capital data",

        region:
            country.region ||
            "Unknown",

        subregion:
            country.subregion ||
            "Unknown",

        continent:
            continents.join(", ") ||
            "Unknown",

        population:
            country.population ??
            0,

        area:
            country?.area?.kilometers ??
            country?.area ??
            0,

        languages,

        currency:
            currencies.join(", ") ||
            "Unknown",

        timezones:
            Array.isArray(country.timezones)
                ? country.timezones
                : [],

        timezone:
            Array.isArray(country.timezones)
                ? country.timezones.join(", ")
                : "",

        flag,

        flagEmoji:
            country?.flag?.emoji ||
            "",

        latitude:
            country?.coordinates?.lat ??
            null,

        longitude:
            country?.coordinates?.lng ??
            null,

        landlocked:
            Boolean(country.landlocked),

        borders:
            Array.isArray(country.borders)
                ? country.borders
                : [],

        callingCodes:
            Array.isArray(country.calling_codes)
                ? country.calling_codes
                : [],

        description:
            `${name} is a country in ${
                continents.join(", ") ||
                country.region ||
                "the world"
            }.`
    };
}


/* =========================================================
   EXTRACT LANGUAGES
========================================================= */

function extractLanguages(languages) {

    if (!languages) return [];

    if (Array.isArray(languages)) {

        return languages
            .map(language => {

                if (typeof language === "string") {
                    return language;
                }

                return (
                    language?.name ||
                    language?.english ||
                    language?.native ||
                    ""
                );
            })
            .filter(Boolean);
    }

    if (typeof languages === "object") {

        return Object.values(languages)
            .map(language => {

                if (typeof language === "string") {
                    return language;
                }

                return (
                    language?.name ||
                    language?.english ||
                    language?.native ||
                    ""
                );
            })
            .filter(Boolean);
    }

    return [];
}


/* =========================================================
   EXTRACT CURRENCIES
========================================================= */

function extractCurrencies(currencies) {

    if (!currencies) return [];

    if (Array.isArray(currencies)) {

        return currencies
            .map(currency => {

                if (typeof currency === "string") {
                    return currency;
                }

                return (
                    currency?.name ||
                    currency?.code ||
                    ""
                );
            })
            .filter(Boolean);
    }

    if (typeof currencies === "object") {

        return Object.entries(currencies)
            .map(([code, currency]) => {

                if (typeof currency === "string") {
                    return `${currency} (${code})`;
                }

                const name =
                    currency?.name ||
                    code;

                const symbol =
                    currency?.symbol;

                return symbol
                    ? `${name} (${symbol})`
                    : `${name} (${code})`;
            })
            .filter(Boolean);
    }

    return [];
}


/* =========================================================
   COUNTRY NAME
========================================================= */

function getCountryName(country) {

    return (
        country?.name ||
        country?.country ||
        country?.title ||
        ""
    );
}


/* =========================================================
   NORMALIZE SEARCH
========================================================= */

function normalizeText(value) {

    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim();
}


/* =========================================================
   FIND COUNTRY
========================================================= */

function findCountry(query) {

    const normalized =
        normalizeText(query);

    if (!normalized) return null;

    return STATE.countries.find(
        country => {

            const name =
                normalizeText(
                    country.name
                );

            const official =
                normalizeText(
                    country.officialName
                );

            const code =
                normalizeText(
                    country.code
                );

            const code2 =
                normalizeText(
                    country.code2
                );

            return (
                name === normalized ||
                official === normalized ||
                code === normalized ||
                code2 === normalized
            );
        }
    ) || null;
}


/* =========================================================
   SEARCH COUNTRIES
========================================================= */

function searchCountries(query) {

    const normalized =
        normalizeText(query);

    if (!normalized) return [];

    return STATE.countries
        .filter(country => {

            const searchable = [

                country.name,

                country.officialName,

                country.capital,

                country.region,

                country.subregion,

                country.continent,

                country.code,

                country.code2,

                ...(country.languages || []),

                country.currency

            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(
                normalized
            );
        })
        .slice(0, 10);
}


/* =========================================================
   HERO SEARCH
========================================================= */

function initializeHeroSearch() {

    const input =
        byId("heroSearchInput");

    const button =
        byId("heroSearchButton");

    const results =
        $(".hero-search-results");

    if (!input) return;

    input.addEventListener(
        "input",
        () => {

            const value =
                input.value.trim();

            if (!value) {

                results?.classList.remove(
                    "open"
                );

                return;
            }

            performCountrySearch(
                value,
                results
            );
        }
    );

    button?.addEventListener(
        "click",
        () => {

            const country =
                findCountry(
                    input.value
                );

            if (country) {
                openCountryModal(
                    country
                );
            }
        }
    );

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                const country =
                    findCountry(
                        input.value
                    );

                if (country) {
                    openCountryModal(
                        country
                    );
                }
            }
        }
    );
}


/* =========================================================
   GLOBAL SEARCH
========================================================= */

function initializeSearchOverlay() {

    const searchButton =
        byId("searchButton");

    const overlay =
        byId("searchOverlay");

    const closeButton =
        byId("searchClose");

    const input =
        byId("globalSearchInput");

    const results =
        $(".global-search-results");

    if (!overlay) return;

    function openSearch() {

        overlay.classList.add(
            "open"
        );

        document.body.style.overflow =
            "hidden";

        setTimeout(
            () => input?.focus(),
            250
        );
    }

    function closeSearch() {

        overlay.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";
    }

    searchButton?.addEventListener(
        "click",
        openSearch
    );

    closeButton?.addEventListener(
        "click",
        closeSearch
    );

    input?.addEventListener(
        "input",
        () => {

            performCountrySearch(
                input.value,
                results
            );
        }
    );

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {
                closeSearch();
            }
        }
    );
}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function performCountrySearch(
    query,
    container
) {

    if (!container) return;

    const results =
        searchCountries(query);

    container.innerHTML = "";

    if (!results.length) {

        container.innerHTML = `
            <div class="search-result">
                <strong>NO LOCATION FOUND</strong>
                <span>GLOBAL DATABASE</span>
            </div>
        `;

        container.classList.add(
            "open"
        );

        return;
    }

    results.forEach(country => {

        const result =
            document.createElement(
                "button"
            );

        result.className =
            "search-result";

        result.innerHTML = `

            <strong>
                ${escapeHTML(
                    country.name
                )}
            </strong>

            <span>
                ${escapeHTML(
                    country.region
                )}
                /
                ${escapeHTML(
                    country.capital
                )}
            </span>

        `;

        result.addEventListener(
            "click",
            () => {

                openCountryModal(
                    country
                );

                container.classList.remove(
                    "open"
                );
            }
        );

        container.appendChild(
            result
        );
    });

    container.classList.add(
        "open"
    );
}


/* =========================================================
   COUNTRY CARDS
========================================================= */

function renderCountryCards() {

    const grid =
        $(".country-grid");

    if (!grid) return;

    grid.innerHTML = "";

    /*
     * Show a curated first group.
     * Search still accesses every country.
     */
    const featured =
        STATE.countries.slice(0, 12);

    featured.forEach(
        country => {

            grid.appendChild(
                createCountryCard(
                    country
                )
            );
        }
    );

    initializeRevealAnimations();
}


function createCountryCard(
    country
) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "country-card reveal";

    const image =
        country.flag || "";

    card.innerHTML = `

        <div class="country-card-image">

            ${
                image
                    ? `
                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(country.name)}"
                            loading="lazy"
                        >
                    `
                    : ""
            }

        </div>

        <div class="country-card-overlay"></div>

        <div class="country-card-content">

            <div class="country-card-region">
                ${escapeHTML(
                    country.region
                )}
            </div>

            <h3>
                ${escapeHTML(
                    country.name
                )}
            </h3>

            <div class="country-card-meta">

                <span>
                    ${escapeHTML(
                        country.capital
                    )}
                </span>

                <span>
                    ${formatNumber(
                        country.population
                    )}
                </span>

            </div>

        </div>

        <div class="country-card-arrow">

            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
            >
                <path d="M5 12h14"/>
                <path d="m13 6 6 6-6 6"/>
            </svg>

        </div>
    `;

    card.addEventListener(
        "click",
        () => openCountryModal(
            country
        )
    );

    return card;
}


/* =========================================================
   COUNTRY MODAL
========================================================= */

function initializeCountryModal() {

    const modal =
        byId("countryModal");

    const closeButton =
        byId("modalClose");

    const backdrop =
        $(".country-modal-backdrop");

    if (!modal) return;

    function closeModal() {

        modal.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";

        STATE.currentCountry =
            null;
    }

    closeButton?.addEventListener(
        "click",
        closeModal
    );

    backdrop?.addEventListener(
        "click",
        closeModal
    );

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "open"
                )
            ) {
                closeModal();
            }
        }
    );
}


/* =========================================================
   OPEN COUNTRY
========================================================= */

function openCountryModal(
    country
) {

    const modal =
        byId("countryModal");

    if (!modal || !country) return;

    STATE.currentCountry =
        country;

    setText(
        "modalCountryName",
        country.name
    );

    setText(
        "modalCountrySubtitle",
        `${country.region} / ${country.capital}`
    );

    setText(
        "modalCountryDescription",
        country.description
    );

    setText(
        "modalCapital",
        country.capital
    );

    setText(
        "modalRegion",
        country.region
    );

    setText(
        "modalPopulation",
        formatNumber(
            country.population
        )
    );

    setText(
        "modalLanguage",
        country.languages.join(", ") ||
        "—"
    );

    setText(
        "modalCurrency",
        country.currency
    );

    setText(
        "modalArea",
        country.area
            ? `${formatNumber(country.area)} km²`
            : "—"
    );

    setText(
        "modalContinent",
        country.continent
    );

    setText(
        "modalTimezone",
        country.timezone
    );

    /*
     * Set modal flag/image when a matching
     * image element exists.
     */
    const modalImage =
        byId("modalCountryImage");

    if (modalImage) {

        if (country.flag) {

            modalImage.src =
                country.flag;

            modalImage.alt =
                `${country.name} flag`;

            modalImage.style.display =
                "";
        } else {

            modalImage.style.display =
                "none";
        }
    }

    modal.classList.add(
        "open"
    );

    document.body.style.overflow =
        "hidden";
}


/* =========================================================
   SET TEXT SAFELY
========================================================= */

function setText(
    id,
    value
) {

    const element =
        byId(id);

    if (!element) return;

    element.textContent =
        value ??
        "—";
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems =
        $$(".nav-item");

    navItems.forEach(item => {

        item.addEventListener(
            "click",
            event => {

                const href =
                    item.getAttribute(
                        "href"
                    );

                if (
                    !href ||
                    !href.startsWith("#")
                ) {
                    return;
                }

                const target =
                    $(href);

                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

                navItems.forEach(
                    nav =>
                        nav.classList.remove(
                            "active"
                        )
                );

                item.classList.add(
                    "active"
                );
            }
        );
    });

    const sections =
        $$("section[id]");

    if (!sections.length) return;

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        navItems.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                                if (
                                    item.getAttribute(
                                        "href"
                                    ) ===
                                    `#${entry.target.id}`
                                ) {

                                    item.classList.add(
                                        "active"
                                    );
                                }
                            }
                        );
                    }
                );
            },
            {
                threshold: .35
            }
        );

    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );
}


/* =========================================================
   MOBILE MENU
========================================================= */

function initializeMobileMenu() {

    const openButton =
        byId("mobileMenuButton");

    const closeButton =
        byId("mobileClose");

    const navigation =
        byId("mobileNavigation");

    if (!navigation) return;

    function openMenu() {

        navigation.classList.add(
            "open"
        );

        document.body.style.overflow =
            "hidden";
    }

    function closeMenu() {

        navigation.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";
    }

    openButton?.addEventListener(
        "click",
        openMenu
    );

    closeButton?.addEventListener(
        "click",
        closeMenu
    );

    $$(".mobile-navigation a")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMenu
            );
        });
}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initializeRevealAnimations() {

    const elements =
        $$(".reveal");

    if (!elements.length) return;

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );
                        }
                    }
                );
            },
            {
                threshold: .12
            }
        );

    elements.forEach(
        element =>
            observer.observe(
                element
            )
    );
}


/* =========================================================
   COUNTERS
========================================================= */

function initializeCounters() {

    const counters =
        $$("[data-counter]");

    if (!counters.length) return;

    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(
                    entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }

                        animateCounter(
                            entry.target
                        );

                        observer.unobserve(
                            entry.target
                        );
                    }
                );
            },
            {
                threshold: .6
            }
        );

    counters.forEach(
        counter =>
            observer.observe(
                counter
            )
    );
}


function animateCounter(
    element
) {

    const target =
        parseFloat(
            element.dataset.counter
        );

    if (!Number.isFinite(target)) {
        return;
    }

    const duration =
        1500;

    const start =
        performance.now();

    function update(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                4
            );

        element.textContent =
            formatNumber(
                target * eased
            );

        if (progress < 1) {

            requestAnimationFrame(
                update
            );
        }
    }

    requestAnimationFrame(
        update
    );
}


/* =========================================================
   GLOBAL STATISTICS
========================================================= */

function updateGlobalStatistics() {

    const total =
        STATE.countries.length;

    const countryCounter =
        $(
            "[data-stat='countries']"
        );

    if (countryCounter) {

        countryCounter.textContent =
            total;
    }

    const regions =
        new Set(
            STATE.countries
                .map(
                    country =>
                        country.region
                )
                .filter(Boolean)
        );

    const regionCounter =
        $(
            "[data-stat='regions']"
        );

    if (regionCounter) {

        regionCounter.textContent =
            regions.size;
    }

    const status =
        byId("countryCount");

    if (status) {

        status.textContent =
            `${total} COUNTRIES`;
    }
}


/* =========================================================
   EARTH CANVAS
========================================================= */

function initializeGlobe() {

    const canvas =
        byId("earthCanvas");

    if (!canvas) return;

    const context =
        canvas.getContext("2d");

    if (!context) return;

    const globe =
        STATE.globe;

    let width = 0;
    let height = 0;
    let radius = 0;

    function resize() {

        const rect =
            canvas.getBoundingClientRect();

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        width =
            rect.width;

        height =
            rect.height;

        canvas.width =
            Math.floor(
                width *
                pixelRatio
            );

        canvas.height =
            Math.floor(
                height *
                pixelRatio
            );

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        radius =
            Math.min(
                width,
                height
            ) * .39;
    }

    resize();

    window.addEventListener(
        "resize",
        resize,
        {
            passive: true
        }
    );


    /* -----------------------------------------------------
       POINTER CONTROL
    ----------------------------------------------------- */

    canvas.addEventListener(
        "pointerdown",
        event => {

            globe.dragging =
                true;

            globe.autoRotate =
                false;

            globe.lastX =
                event.clientX;

            globe.lastY =
                event.clientY;

            canvas.setPointerCapture?.(
                event.pointerId
            );
        }
    );

    canvas.addEventListener(
        "pointermove",
        event => {

            if (!globe.dragging) {
                return;
            }

            const dx =
                event.clientX -
                globe.lastX;

            const dy =
                event.clientY -
                globe.lastY;

            globe.rotation +=
                dx * .008;

            globe.tilt +=
                dy * .003;

            globe.tilt =
                Math.max(
                    -.5,
                    Math.min(
                        .5,
                        globe.tilt
                    )
                );

            globe.lastX =
                event.clientX;

            globe.lastY =
                event.clientY;
        }
    );

    canvas.addEventListener(
        "pointerup",
        () => {

            globe.dragging =
                false;
        }
    );

    canvas.addEventListener(
        "pointercancel",
        () => {

            globe.dragging =
                false;
        }
    );

    canvas.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            globe.zoom +=
                event.deltaY < 0
                    ? .05
                    : -.05;

            globe.zoom =
                Math.max(
                    .75,
                    Math.min(
                        1.35,
                        globe.zoom
                    )
                );
        },
        {
            passive: false
        }
    );


    /* -----------------------------------------------------
       RENDER
    ----------------------------------------------------- */

    function render() {

        context.clearRect(
            0,
            0,
            width,
            height
        );

        if (
            globe.autoRotate &&
            !globe.dragging
        ) {

            globe.rotation +=
                .0015;
        }

        const cx =
            width / 2;

        const cy =
            height / 2;

        const r =
            radius *
            globe.zoom;

        drawAtmosphere(
            cx,
            cy,
            r
        );

        drawOcean(
            cx,
            cy,
            r
        );

        drawLatitudeLines(
            cx,
            cy,
            r
        );

        drawLongitudeLines(
            cx,
            cy,
            r
        );

        drawContinents(
            cx,
            cy,
            r
        );

        drawCityLights(
            cx,
            cy,
            r
        );

        drawHighlight(
            cx,
            cy,
            r
        );

        globe.animationFrame =
            requestAnimationFrame(
                render
            );
    }

    function drawAtmosphere(
        cx,
        cy,
        r
    ) {

        const gradient =
            context.createRadialGradient(
                cx - r * .25,
                cy - r * .3,
                r * .15,
                cx,
                cy,
                r * 1.25
            );

        gradient.addColorStop(
            0,
            "rgba(70,150,220,.04)"
        );

        gradient.addColorStop(
            .72,
            "rgba(30,105,165,.09)"
        );

        gradient.addColorStop(
            1,
            "rgba(40,130,210,.32)"
        );

        context.beginPath();

        context.arc(
            cx,
            cy,
            r * 1.08,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            gradient;

        context.fill();
    }

    function drawOcean(
        cx,
        cy,
        r
    ) {

        const gradient =
            context.createRadialGradient(
                cx - r * .3,
                cy - r * .35,
                0,
                cx,
                cy,
                r
            );

        gradient.addColorStop(
            0,
            "#173d5b"
        );

        gradient.addColorStop(
            .45,
            "#0b2942"
        );

        gradient.addColorStop(
            1,
            "#03101c"
        );

        context.beginPath();

        context.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            gradient;

        context.fill();
    }

    function drawLatitudeLines(
        cx,
        cy,
        r
    ) {

        context.save();

        context.strokeStyle =
            "rgba(130,190,230,.11)";

        context.lineWidth =
            .7;

        for (
            let i = -3;
            i <= 3;
            i++
        ) {

            const y =
                cy +
                i *
                r *
                .21;

            const factor =
                Math.sqrt(
                    Math.max(
                        0,
                        1 -
                        Math.pow(
                            (y - cy) /
                            r,
                            2
                        )
                    )
                );

            context.beginPath();

            context.ellipse(
                cx,
                y,
                r * factor,
                r * .07,
                0,
                0,
                Math.PI * 2
            );

            context.stroke();
        }

        context.restore();
    }

    function drawLongitudeLines(
        cx,
        cy,
        r
    ) {

        context.save();

        context.strokeStyle =
            "rgba(130,190,230,.09)";

        context.lineWidth =
            .7;

        for (
            let i = 0;
            i < 8;
            i++
        ) {

            const angle =
                globe.rotation +
                i /
                8 *
                Math.PI;

            const factor =
                Math.abs(
                    Math.sin(angle)
                );

            context.beginPath();

            context.ellipse(
                cx,
                cy,
                Math.max(
                    r * .025,
                    r * factor
                ),
                r,
                0,
                0,
                Math.PI * 2
            );

            context.stroke();
        }

        context.restore();
    }

    function drawContinents(
        cx,
        cy,
        r
    ) {

        context.save();

        const shapes = [

            [
                [-.62, -.25],
                [-.52, -.38],
                [-.39, -.35],
                [-.34, -.20],
                [-.43, -.05],
                [-.51, .04],
                [-.62, -.02]
            ],

            [
                [-.22, -.05],
                [-.08, -.12],
                [.02, -.02],
                [-.02, .13],
                [-.13, .23],
                [-.25, .17],
                [-.28, .05]
            ],

            [
                [.12, -.42],
                [.27, -.48],
                [.41, -.39],
                [.48, -.25],
                [.38, -.12],
                [.21, -.17],
                [.08, -.29]
            ],

            [
                [.38, .04],
                [.51, .08],
                [.61, .22],
                [.55, .38],
                [.40, .32],
                [.34, .18]
            ],

            [
                [-.04, .28],
                [.09, .31],
                [.17, .45],
                [.11, .62],
                [-.02, .54],
                [-.11, .39]
            ]
        ];

        shapes.forEach(
            shape => {

                context.beginPath();

                shape.forEach(
                    (point, index) => {

                        const x =
                            cx +
                            point[0] *
                            r;

                        const y =
                            cy +
                            point[1] *
                            r;

                        if (
                            index === 0
                        ) {

                            context.moveTo(
                                x,
                                y
                            );

                        } else {

                            context.lineTo(
                                x,
                                y
                            );
                        }
                    }
                );

                context.closePath();

                context.fillStyle =
                    "rgba(61,111,83,.72)";

                context.fill();
            }
        );

        context.restore();
    }

    function drawCityLights(
        cx,
        cy,
        r
    ) {

        const points = [

            [-.51, -.25],
            [-.44, -.16],
            [-.35, -.23],
            [-.18, -.06],
            [.16, -.32],
            [.27, -.28],
            [.37, -.20],
            [.44, -.08],
            [.50, .09],
            [.39, .20],
            [.22, .25],
            [.08, .38],
            [-.03, .44],
            [-.18, .28],
            [-.34, .18]

        ];

        context.save();

        points.forEach(
            (point, index) => {

                const x =
                    cx +
                    point[0] *
                    r;

                const y =
                    cy +
                    point[1] *
                    r;

                const size =
                    1.1 +
                    Math.abs(
                        Math.sin(
                            index *
                            2.3
                        )
                    ) *
                    1.4;

                context.beginPath();

                context.arc(
                    x,
                    y,
                    size,
                    0,
                    Math.PI * 2
                );

                context.fillStyle =
                    "rgba(184,218,164,.72)";

                context.shadowBlur =
                    8;

                context.shadowColor =
                    "rgba(160,220,170,.65)";

                context.fill();
            }
        );

        context.restore();
    }

    function drawHighlight(
        cx,
        cy,
        r
    ) {

        const gradient =
            context.createRadialGradient(
                cx - r * .38,
                cy - r * .42,
                0,
                cx - r * .18,
                cy - r * .2,
                r
            );

        gradient.addColorStop(
            0,
            "rgba(255,255,255,.09)"
        );

        gradient.addColorStop(
            .35,
            "rgba(255,255,255,.025)"
        );

        gradient.addColorStop(
            1,
            "rgba(255,255,255,0)"
        );

        context.beginPath();

        context.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );

        context.fillStyle =
            gradient;

        context.fill();

        context.beginPath();

        context.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );

        context.strokeStyle =
            "rgba(120,190,240,.35)";

        context.lineWidth =
            1;

        context.stroke();
    }

    render();
}


/* =========================================================
   GLOBE CONTROLS
========================================================= */

function initializeGlobeControls() {

    $$(".earth-control")
        .forEach(control => {

            control.addEventListener(
                "click",
                () => {

                    const action =
                        control.dataset.action;

                    if (
                        action ===
                        "zoom-in"
                    ) {

                        STATE.globe.zoom =
                            Math.min(
                                1.35,
                                STATE.globe.zoom +
                                .1
                            );
                    }

                    if (
                        action ===
                        "zoom-out"
                    ) {

                        STATE.globe.zoom =
                            Math.max(
                                .75,
                                STATE.globe.zoom -
                                .1
                            );
                    }

                    if (
                        action ===
                        "reset"
                    ) {

                        STATE.globe.rotation =
                            0;

                        STATE.globe.tilt =
                            0;

                        STATE.globe.zoom =
                            1;
                    }

                    if (
                        action ===
                        "rotate"
                    ) {

                        STATE.globe.autoRotate =
                            !STATE.globe.autoRotate;

                        control.classList.toggle(
                            "active",
                            STATE.globe.autoRotate
                        );
                    }
                }
            );
        });
}


/* =========================================================
   MAP CONTROLS
========================================================= */

function initializeMapControls() {

    $$(".layer-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    $$(".layer-button")
                        .forEach(
                            item =>
                                item.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    updateMapLayer(
                        button.dataset.layer
                    );
                }
            );
        });
}


function updateMapLayer(
    layer
) {

    const map =
        $(".map-placeholder");

    if (map) {

        map.dataset.layer =
            layer;
    }

    const title =
        $(".map-title");

    if (!title) return;

    const names = {

        terrain:
            "TERRAIN",

        borders:
            "BORDERS",

        population:
            "POPULATION",

        satellite:
            "SATELLITE"
    };

    title.innerHTML = `
        ${names[layer] || "GLOBAL"}
        <span>GLOBAL VIEW</span>
    `;
}


/* =========================================================
   PARALLAX
========================================================= */

function initializeParallax() {

    const hero =
        $(".hero-section");

    if (!hero) return;

    let ticking =
        false;

    window.addEventListener(
        "scroll",
        () => {

            if (ticking) return;

            ticking = true;

            requestAnimationFrame(
                () => {

                    const scroll =
                        window.scrollY;

                    const earth =
                        $(".earth-container");

                    const grid =
                        $(".hero-grid");

                    if (earth) {

                        earth.style.transform =
                            `translateY(${scroll * .06}px)`;
                    }

                    if (grid) {

                        grid.style.transform =
                            `translateY(${scroll * .03}px)`;
                    }

                    ticking =
                        false;
                }
            );
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   MAGNETIC BUTTONS
========================================================= */

function initializeMagneticButtons() {

    $$(".primary-button, .outline-button")
        .forEach(button => {

            button.addEventListener(
                "pointermove",
                event => {

                    const rect =
                        button.getBoundingClientRect();

                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;

                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;

                    button.style.transform =
                        `translate(
                            ${x * .08}px,
                            ${y * .08}px
                        )`;
                }
            );

            button.addEventListener(
                "pointerleave",
                () => {

                    button.style.transform =
                        "";
                }
            );
        });
}


/* =========================================================
   IMAGE FALLBACK
========================================================= */

function initializeImageFallbacks() {

    document.addEventListener(
        "error",
        event => {

            const image =
                event.target;

            if (
                image?.tagName !==
                "IMG"
            ) {
                return;
            }

            image.style.display =
                "none";
        },
        true
    );
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

function initializeKeyboardControls() {

    document.addEventListener(
        "keydown",
        event => {

            const tag =
                event.target?.tagName;

            if (
                tag === "INPUT" ||
                tag === "TEXTAREA"
            ) {
                return;
            }

            switch (
                event.key.toLowerCase()
            ) {

                case "r":

                    STATE.globe.autoRotate =
                        !STATE.globe.autoRotate;

                    break;

                case "+":

                case "=":

                    STATE.globe.zoom =
                        Math.min(
                            1.35,
                            STATE.globe.zoom +
                            .1
                        );

                    break;

                case "-":

                    STATE.globe.zoom =
                        Math.max(
                            .75,
                            STATE.globe.zoom -
                            .1
                        );

                    break;

                case "0":

                    STATE.globe.rotation =
                        0;

                    STATE.globe.tilt =
                        0;

                    STATE.globe.zoom =
                        1;

                    break;
            }
        }
    );
}


/* =========================================================
   CLOCK
========================================================= */

function initializeClock() {

    const clock =
        byId("systemClock");

    if (!clock) return;

    function update() {

        const now =
            new Date();

        clock.textContent =
            now.toISOString()
                .replace(
                    "T",
                    " "
                )
                .replace(
                    /\.\d{3}Z$/,
                    " UTC"
                );
    }

    update();

    setInterval(
        update,
        1000
    );
}


/* =========================================================
   SYSTEM STATUS
========================================================= */

function initializeSystemStatus() {

    const status =
        byId("systemStatus");

    if (!status) return;

    status.textContent =
        "SYSTEM OPERATIONAL";
}


function showDatabaseStatus(
    message
) {

    const elements = [
        byId("databaseStatus"),
        byId("systemStatus")
    ];

    elements.forEach(
        element => {

            if (element) {
                element.textContent =
                    message;
            }
        }
    );
}


/* =========================================================
   SMOOTH LINKS
========================================================= */

function initializeSmoothLinks() {

    $$("a[href^='#']")
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const id =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !id ||
                        id === "#"
                    ) {
                        return;
                    }

                    const target =
                        $(id);

                    if (!target) return;

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior:
                            "smooth",
                        block:
                            "start"
                    });
                }
            );
        });
}


/* =========================================================
   FORMAT NUMBERS
========================================================= */

function formatNumber(
    value
) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (
        number >=
        1000000000
    ) {

        return (
            number /
            1000000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) +
            "B";
    }

    if (
        number >=
        1000000
    ) {

        return (
            number /
            1000000
        )
            .toFixed(1)
            .replace(
                ".0",
                ""
            ) +
            "M";
    }

    return Math.round(
        number
    ).toLocaleString();
}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );
}
