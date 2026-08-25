"use strict";

/*
=========================================================
EARTH // 2086
REALISTIC 3D EARTH + COUNTRY EXPLORER
=========================================================
*/

/* ======================================================
   GLOBAL STATE
====================================================== */

const STATE = {
    countries: [],
    filteredCountries: [],
    currentCountry: null,

    globe: {
        ready: false,
        scene: null,
        camera: null,
        renderer: null,
        earth: null,
        clouds: null,
        atmosphere: null,
        stars: null,
        animationFrame: null,

        autoRotate: true,
        dragging: false,

        previousX: 0,
        previousY: 0,

        rotationVelocity: 0.002,
        targetRotationY: 0,
        targetRotationX: 0,

        zoom: 1
    }
};


/* ======================================================
   BASIC HELPERS
====================================================== */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

const byId = id =>
    document.getElementById(id);

function setText(id, value) {
    const element = byId(id);

    if (element) {
        element.textContent = value ?? "—";
    }
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}

function normalizeText(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function formatNumber(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "—";
    }

    if (number >= 1000000000) {
        return (
            (number / 1000000000)
                .toFixed(1)
                .replace(".0", "") + "B"
        );
    }

    if (number >= 1000000) {
        return (
            (number / 1000000)
                .toFixed(1)
                .replace(".0", "") + "M"
        );
    }

    return Math.round(number).toLocaleString();
}


/* ======================================================
   START APPLICATION
====================================================== */

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

    /*
     * REAL 3D EARTH
     */
    initializeRealEarth();

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

    /*
     * Country database.
     *
     * The local JSON can remain [] for now.
     * The globe itself does NOT depend on it.
     */
    await loadCountryDatabase();

    initializeRevealAnimations();

    startBootSequence();
}


/* ======================================================
   BOOT SCREEN
====================================================== */

function startBootSequence() {

    const bootScreen = byId("bootScreen");
    const progressBar = byId("bootProgressBar");
    const percent = byId("bootPercent");
    const status = $(".boot-status");
    const app = $(".app");

    if (!bootScreen) {
        app?.classList.add("ready");
        return;
    }

    const messages = [
        "INITIALIZING PLANETARY CORE",
        "LOADING THREE-DIMENSIONAL EARTH",
        "CONNECTING GLOBAL DATABASE",
        "CALIBRATING ORBITAL SYSTEM",
        "SYNCHRONIZING PLANETARY DATA",
        "SYSTEM READY"
    ];

    let progress = 0;

    const timer = setInterval(() => {

        progress += Math.floor(Math.random() * 8) + 5;

        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);
        }

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (percent) {
            percent.textContent = `${progress}%`;
        }

        if (status) {

            const index = Math.min(
                Math.floor(progress / 17),
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

    }, 110);
}


/* ======================================================
   REAL 3D EARTH
====================================================== */

async function initializeRealEarth() {

    const canvas = byId("earthCanvas");

    if (!canvas) {
        console.warn(
            "earthCanvas not found."
        );
        return;
    }

    try {

        /*
         * Load Three.js directly from CDN.
         *
         * No HTML modification is required.
         */
        const THREE = await import(
            "https://esm.sh/three@0.180.0"
        );

        createEarthScene(
            THREE,
            canvas
        );

    } catch (error) {

        console.error(
            "3D Earth failed to initialize:",
            error
        );

        showDatabaseStatus(
            "3D ENGINE CONNECTION FAILED"
        );
    }
}


/* ======================================================
   CREATE EARTH SCENE
====================================================== */

function createEarthScene(
    THREE,
    canvas
) {

    const globe = STATE.globe;

    /*
     * Scene
     */
    const scene =
        new THREE.Scene();

    /*
     * Camera
     */
    const camera =
        new THREE.PerspectiveCamera(
            35,
            1,
            0.1,
            100
        );

    camera.position.set(
        0,
        0,
        3.2
    );

    /*
     * Renderer
     */
    const renderer =
        new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );

    renderer.setClearColor(
        0x000000,
        0
    );

    /*
     * Lighting
     */
    const ambientLight =
        new THREE.AmbientLight(
            0x9ab7d1,
            0.32
        );

    scene.add(
        ambientLight
    );

    const sunLight =
        new THREE.DirectionalLight(
            0xffffff,
            3.0
        );

    sunLight.position.set(
        -4,
        2,
        5
    );

    scene.add(
        sunLight
    );

    /*
     * Earth group
     */
    const earthGroup =
        new THREE.Group();

    scene.add(
        earthGroup
    );

    /*
     * Real Earth texture.
     *
     * Three.js provides planet textures
     * through its examples repository.
     */
    const textureLoader =
        new THREE.TextureLoader();

    const earthTexture =
        textureLoader.load(
            "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg"
        );

    earthTexture.colorSpace =
        THREE.SRGBColorSpace;

    /*
     * Earth sphere
     */
    const earthGeometry =
        new THREE.SphereGeometry(
            1,
            96,
            96
        );

    const earthMaterial =
        new THREE.MeshPhongMaterial({
            map: earthTexture,
            shininess: 18,
            specular: new THREE.Color(
                0x41627a
            )
        });

    const earth =
        new THREE.Mesh(
            earthGeometry,
            earthMaterial
        );

    earthGroup.add(
        earth
    );

    /*
     * Cloud layer.
     */
    const cloudTexture =
        textureLoader.load(
            "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png"
        );

    const cloudGeometry =
        new THREE.SphereGeometry(
            1.012,
            96,
            96
        );

    const cloudMaterial =
        new THREE.MeshPhongMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.42,
            depthWrite: false
        });

    const clouds =
        new THREE.Mesh(
            cloudGeometry,
            cloudMaterial
        );

    earthGroup.add(
        clouds
    );

    /*
     * Atmosphere.
     */
    const atmosphereGeometry =
        new THREE.SphereGeometry(
            1.055,
            96,
            96
        );

    const atmosphereMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x4ba3ff,
            transparent: true,
            opacity: 0.11,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

    const atmosphere =
        new THREE.Mesh(
            atmosphereGeometry,
            atmosphereMaterial
        );

    earthGroup.add(
        atmosphere
    );

    /*
     * Outer atmospheric glow.
     */
    const glowGeometry =
        new THREE.SphereGeometry(
            1.09,
            96,
            96
        );

    const glowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x398fff,
            transparent: true,
            opacity: 0.045,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });

    const glow =
        new THREE.Mesh(
            glowGeometry,
            glowMaterial
        );

    earthGroup.add(
        glow
    );

    /*
     * Stars.
     */
    const stars =
        createStarField(
            THREE
        );

    scene.add(
        stars
    );

    /*
     * Save references.
     */
    globe.scene =
        scene;

    globe.camera =
        camera;

    globe.renderer =
        renderer;

    globe.earth =
        earth;

    globe.clouds =
        clouds;

    globe.atmosphere =
        atmosphere;

    globe.stars =
        stars;

    globe.ready =
        true;

    /*
     * Canvas interactions.
     */
    initializeEarthInteraction(
        canvas
    );

    /*
     * Responsive renderer.
     */
    resizeEarth();

    window.addEventListener(
        "resize",
        resizeEarth,
        {
            passive: true
        }
    );

    /*
     * Start rendering.
     */
    animateEarth(
        THREE
    );
}


/* ======================================================
   STAR FIELD
====================================================== */

function createStarField(
    THREE
) {

    const geometry =
        new THREE.BufferGeometry();

    const count = 2200;

    const positions =
        new Float32Array(
            count * 3
        );

    for (
        let i = 0;
        i < count;
        i++
    ) {

        const radius =
            8 +
            Math.random() * 10;

        const theta =
            Math.random() *
            Math.PI *
            2;

        const phi =
            Math.acos(
                2 *
                Math.random() -
                1
            );

        positions[i * 3] =
            radius *
            Math.sin(phi) *
            Math.cos(theta);

        positions[i * 3 + 1] =
            radius *
            Math.cos(phi);

        positions[i * 3 + 2] =
            radius *
            Math.sin(phi) *
            Math.sin(theta);
    }

    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(
            positions,
            3
        )
    );

    const material =
        new THREE.PointsMaterial({
            color: 0xb9d8ff,
            size: 0.025,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

    return new THREE.Points(
        geometry,
        material
    );
}


/* ======================================================
   EARTH RESPONSIVE SIZE
====================================================== */

function resizeEarth() {

    const globe =
        STATE.globe;

    if (
        !globe.renderer ||
        !globe.camera
    ) {
        return;
    }

    const canvas =
        globe.renderer.domElement;

    const rect =
        canvas.getBoundingClientRect();

    const width =
        Math.max(
            1,
            rect.width
        );

    const height =
        Math.max(
            1,
            rect.height
        );

    globe.camera.aspect =
        width / height;

    globe.camera.updateProjectionMatrix();

    globe.renderer.setSize(
        width,
        height,
        false
    );
}


/* ======================================================
   EARTH ANIMATION
====================================================== */

function animateEarth(
    THREE
) {

    const globe =
        STATE.globe;

    if (
        !globe.renderer ||
        !globe.scene ||
        !globe.camera
    ) {
        return;
    }

    if (
        globe.autoRotate &&
        !globe.dragging
    ) {

        globe.targetRotationY +=
            globe.rotationVelocity;
    }

    /*
     * Smooth rotation.
     */
    if (globe.earth) {

        globe.earth.rotation.y +=
            (
                globe.targetRotationY -
                globe.earth.rotation.y
            ) * 0.045;

        globe.earth.rotation.x +=
            (
                globe.targetRotationX -
                globe.earth.rotation.x
            ) * 0.045;
    }

    /*
     * Clouds rotate slightly faster.
     */
    if (globe.clouds) {

        globe.clouds.rotation.y =
            globe.earth.rotation.y *
            1.012;
    }

    /*
     * Atmosphere follows Earth.
     */
    if (globe.atmosphere) {

        globe.atmosphere.rotation.y =
            globe.earth.rotation.y;
    }

    /*
     * Tiny star movement.
     */
    if (globe.stars) {

        globe.stars.rotation.y +=
            0.00004;
    }

    globe.renderer.render(
        globe.scene,
        globe.camera
    );

    globe.animationFrame =
        requestAnimationFrame(
            () =>
                animateEarth(
                    THREE
                )
        );
}


/* ======================================================
   TOUCH + MOUSE EARTH CONTROL
====================================================== */

function initializeEarthInteraction(
    canvas
) {

    const globe =
        STATE.globe;

    canvas.style.touchAction =
        "none";

    canvas.addEventListener(
        "pointerdown",
        event => {

            globe.dragging =
                true;

            globe.autoRotate =
                false;

            globe.previousX =
                event.clientX;

            globe.previousY =
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

            const deltaX =
                event.clientX -
                globe.previousX;

            const deltaY =
                event.clientY -
                globe.previousY;

            globe.targetRotationY +=
                deltaX * 0.006;

            globe.targetRotationX +=
                deltaY * 0.003;

            globe.targetRotationX =
                Math.max(
                    -0.55,
                    Math.min(
                        0.55,
                        globe.targetRotationX
                    )
                );

            globe.previousX =
                event.clientX;

            globe.previousY =
                event.clientY;
        }
    );

    const stopDragging = () => {

        globe.dragging =
            false;

        /*
         * Resume automatic rotation
         * after the user releases the Earth.
         */
        setTimeout(() => {

            if (!globe.dragging) {
                globe.autoRotate =
                    true;
            }

        }, 900);
    };

    canvas.addEventListener(
        "pointerup",
        stopDragging
    );

    canvas.addEventListener(
        "pointercancel",
        stopDragging
    );

    canvas.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            zoomEarth(
                event.deltaY < 0
                    ? 0.12
                    : -0.12
            );

        },
        {
            passive: false
        }
    );
}


/* ======================================================
   EARTH ZOOM
====================================================== */

function zoomEarth(
    amount
) {

    const globe =
        STATE.globe;

    if (!globe.camera) {
        return;
    }

    globe.globeZoom =
        Math.max(
            2.35,
            Math.min(
                5.2,
                (
                    globe.camera.position.z -
                    amount
                )
            )
        );

    globe.camera.position.z =
        globe.globeZoom;
}


/* ======================================================
   GLOBE BUTTONS
====================================================== */

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

                        zoomEarth(
                            0.35
                        );
                    }

                    if (
                        action ===
                        "zoom-out"
                    ) {

                        zoomEarth(
                            -0.35
                        );
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

                    if (
                        action ===
                        "reset"
                    ) {

                        if (
                            STATE.globe.camera
                        ) {

                            STATE.globe.camera.position.set(
                                0,
                                0,
                                3.2
                            );

                            STATE.globe.globeZoom =
                                3.2;
                        }

                        STATE.globe.targetRotationY =
                            0;

                        STATE.globe.targetRotationX =
                            0;

                        STATE.globe.autoRotate =
                            true;
                    }
                }
            );
        });
}


/* ======================================================
   COUNTRY DATABASE
====================================================== */

async function loadCountryDatabase() {

    showDatabaseStatus(
        "LOADING GLOBAL DATABASE"
    );

    /*
     * First try local countries.json.
     */
    try {

        const response =
            await fetch(
                "data/countries.json",
                {
                    cache: "no-store"
                }
            );

        if (response.ok) {

            const data =
                await response.json();

            const source =
                Array.isArray(data)
                    ? data
                    : data.countries || [];

            if (source.length > 0) {

                STATE.countries =
                    source
                        .map(normalizeCountry)
                        .filter(Boolean);

                STATE.filteredCountries =
                    [...STATE.countries];

                renderCountryCards();
                updateGlobalStatistics();

                showDatabaseStatus(
                    `${STATE.countries.length} COUNTRIES ONLINE`
                );

                return;
            }
        }

    } catch (error) {

        console.warn(
            "Local country database unavailable.",
            error
        );
    }

    /*
     * JSON is intentionally allowed to be [].
     * The globe remains completely functional.
     */
    STATE.countries = [];
    STATE.filteredCountries = [];

    showDatabaseStatus(
        "PLANETARY ENGINE ONLINE"
    );
}


/* ======================================================
   COUNTRY NORMALIZATION
====================================================== */

function normalizeCountry(
    country
) {

    if (!country) {
        return null;
    }

    const name =
        country?.name?.common ||
        country?.name ||
        "";

    if (!name) {
        return null;
    }

    const languages =
        extractLanguages(
            country.languages
        );

    const currencies =
        extractCurrencies(
            country.currencies
        );

    const capitals =
        Array.isArray(
            country.capitals
        )
            ? country.capitals
            : country.capital
                ? [country.capital]
                : [];

    return {

        name,

        officialName:
            country?.name?.official ||
            country.officialName ||
            name,

        code:
            country?.cca3 ||
            country.code ||
            "",

        code2:
            country?.cca2 ||
            country.code2 ||
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
            Array.isArray(
                country.continents
            )
                ? country.continents.join(", ")
                : country.continent ||
                  "Unknown",

        population:
            country.population ||
            0,

        area:
            country.area ||
            0,

        languages,

        currency:
            currencies.join(", ") ||
            "Unknown",

        timezone:
            Array.isArray(
                country.timezones
            )
                ? country.timezones.join(", ")
                : country.timezone ||
                  "",

        flag:
            country?.flags?.svg ||
            country?.flags?.png ||
            country.flag ||
            "",

        flagEmoji:
            country.flagEmoji ||
            "",

        latitude:
            country?.latlng?.[0] ??
            null,

        longitude:
            country?.latlng?.[1] ??
            null,

        description:
            `${name} is a country in ${
                country.region ||
                "the world"
            }.`
    };
}


function extractLanguages(
    languages
) {

    if (!languages) {
        return [];
    }

    if (Array.isArray(languages)) {
        return languages
            .map(language =>
                typeof language === "string"
                    ? language
                    : language?.name || ""
            )
            .filter(Boolean);
    }

    if (
        typeof languages ===
        "object"
    ) {

        return Object.values(
            languages
        )
            .map(language =>
                typeof language === "string"
                    ? language
                    : language?.name || ""
            )
            .filter(Boolean);
    }

    return [];
}


function extractCurrencies(
    currencies
) {

    if (!currencies) {
        return [];
    }

    if (Array.isArray(currencies)) {
        return currencies;
    }

    if (
        typeof currencies ===
        "object"
    ) {

        return Object.entries(
            currencies
        ).map(
            ([code, currency]) => {

                if (
                    typeof currency ===
                    "string"
                ) {
                    return `${currency} (${code})`;
                }

                return (
                    currency?.name ||
                    code
                );
            }
        );
    }

    return [];
}


/* ======================================================
   COUNTRY SEARCH
====================================================== */

function findCountry(
    query
) {

    const normalized =
        normalizeText(query);

    if (!normalized) {
        return null;
    }

    return STATE.countries.find(
        country => {

            return (
                normalizeText(
                    country.name
                ) === normalized ||

                normalizeText(
                    country.officialName
                ) === normalized ||

                normalizeText(
                    country.code
                ) === normalized ||

                normalizeText(
                    country.code2
                ) === normalized
            );
        }
    ) || null;
}


function searchCountries(
    query
) {

    const normalized =
        normalizeText(query);

    if (!normalized) {
        return [];
    }

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


/* ======================================================
   HERO SEARCH
====================================================== */

function initializeHeroSearch() {

    const input =
        byId("heroSearchInput");

    const button =
        byId("heroSearchButton");

    const results =
        $(".hero-search-results");

    if (!input) {
        return;
    }

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

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
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
}


/* ======================================================
   SEARCH OVERLAY
====================================================== */

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

    if (!overlay) {
        return;
    }

    function openSearch() {

        overlay.classList.add(
            "open"
        );

        document.body.style.overflow =
            "hidden";

        setTimeout(
            () =>
                input?.focus(),
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
                event.target ===
                overlay
            ) {
                closeSearch();
            }
        }
    );
}


/* ======================================================
   SEARCH RESULT RENDER
====================================================== */

function performCountrySearch(
    query,
    container
) {

    if (!container) {
        return;
    }

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

    results.forEach(
        country => {

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
        }
    );

    container.classList.add(
        "open"
    );
}


/* ======================================================
   COUNTRY CARDS
====================================================== */

function renderCountryCards() {

    const grid =
        $(".country-grid");

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    STATE.countries
        .slice(0, 12)
        .forEach(country => {

            grid.appendChild(
                createCountryCard(
                    country
                )
            );
        });

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

    card.innerHTML = `

        <div class="country-card-image">

            ${
                country.flag
                    ? `
                        <img
                            src="${escapeAttribute(
                                country.flag
                            )}"
                            alt="${escapeAttribute(
                                country.name
                            )}"
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
    `;

    card.addEventListener(
        "click",
        () =>
            openCountryModal(
                country
            )
    );

    return card;
}


/* ======================================================
   COUNTRY MODAL
====================================================== */

function initializeCountryModal() {

    const modal =
        byId("countryModal");

    const close =
        byId("modalClose");

    const backdrop =
        $(".country-modal-backdrop");

    if (!modal) {
        return;
    }

    function closeModal() {

        modal.classList.remove(
            "open"
        );

        document.body.style.overflow =
            "";

        STATE.currentCountry =
            null;
    }

    close?.addEventListener(
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


function openCountryModal(
    country
) {

    const modal =
        byId("countryModal");

    if (!modal || !country) {
        return;
    }

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
            ? `${formatNumber(
                country.area
            )} km²`
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

    const image =
        byId("modalCountryImage");

    if (image) {

        if (country.flag) {

            image.src =
                country.flag;

            image.alt =
                `${country.name} flag`;

            image.style.display =
                "";

        } else {

            image.style.display =
                "none";
        }
    }

    modal.classList.add(
        "open"
    );

    document.body.style.overflow =
        "hidden";
}


/* ======================================================
   NAVIGATION
====================================================== */

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

                if (!target) {
                    return;
                }

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

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
}


/* ======================================================
   MOBILE MENU
====================================================== */

function initializeMobileMenu() {

    const open =
        byId("mobileMenuButton");

    const close =
        byId("mobileClose");

    const navigation =
        byId("mobileNavigation");

    if (!navigation) {
        return;
    }

    open?.addEventListener(
        "click",
        () => {

            navigation.classList.add(
                "open"
            );

            document.body.style.overflow =
                "hidden";
        }
    );

    close?.addEventListener(
        "click",
        () => {

            navigation.classList.remove(
                "open"
            );

            document.body.style.overflow =
                "";
        }
    );
}


/* ======================================================
   REVEAL ANIMATIONS
====================================================== */

function initializeRevealAnimations() {

    const elements =
        $$(".reveal");

    if (!elements.length) {
        return;
    }

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
                threshold: 0.12
            }
        );

    elements.forEach(
        element =>
            observer.observe(
                element
            )
    );
}


/* ======================================================
   COUNTERS
====================================================== */

function initializeCounters() {

    const counters =
        $$("[data-counter]");

    if (!counters.length) {
        return;
    }

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
                threshold: 0.6
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


/* ======================================================
   STATISTICS
====================================================== */

function updateGlobalStatistics() {

    const countryCounter =
        $(
            "[data-stat='countries']"
        );

    if (countryCounter) {

        countryCounter.textContent =
            STATE.countries.length;
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

    const count =
        byId("countryCount");

    if (count) {

        count.textContent =
            `${STATE.countries.length} COUNTRIES`;
    }
}


/* ======================================================
   MAP CONTROLS
====================================================== */

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
}


/* ======================================================
   PARALLAX
====================================================== */

function initializeParallax() {

    window.addEventListener(
        "scroll",
        () => {

            const scroll =
                window.scrollY;

            const grid =
                $(".hero-grid");

            if (grid) {

                grid.style.transform =
                    `translateY(${scroll * 0.03}px)`;
            }

        },
        {
            passive: true
        }
    );
}


/* ======================================================
   MAGNETIC BUTTONS
====================================================== */

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
                            ${x * 0.08}px,
                            ${y * 0.08}px
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


/* ======================================================
   IMAGE FALLBACK
====================================================== */

function initializeImageFallbacks() {

    document.addEventListener(
        "error",
        event => {

            if (
                event.target?.tagName ===
                "IMG"
            ) {

                event.target.style.display =
                    "none";
            }
        },
        true
    );
}


/* ======================================================
   KEYBOARD
====================================================== */

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

            if (
                event.key.toLowerCase() ===
                "r"
            ) {

                STATE.globe.autoRotate =
                    !STATE.globe.autoRotate;
            }

            if (
                event.key === "+"
            ) {

                zoomEarth(
                    0.25
                );
            }

            if (
                event.key === "-"
            ) {

                zoomEarth(
                    -0.25
                );
            }

            if (
                event.key === "0"
            ) {

                if (
                    STATE.globe.camera
                ) {

                    STATE.globe.camera.position.set(
                        0,
                        0,
                        3.2
                    );
                }

                STATE.globe.targetRotationY =
                    0;

                STATE.globe.targetRotationX =
                    0;
            }
        }
    );
}


/* ======================================================
   CLOCK
====================================================== */

function initializeClock() {

    const clock =
        byId("systemClock");

    if (!clock) {
        return;
    }

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


/* ======================================================
   SYSTEM STATUS
====================================================== */

function initializeSystemStatus() {

    const status =
        byId("systemStatus");

    if (status) {

        status.textContent =
            "3D PLANETARY ENGINE ONLINE";
    }
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


/* ======================================================
   SMOOTH LINKS
====================================================== */

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

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            );
        });
}
