/* =========================================================
   EARTH // 2086
   INTERACTIVE PLANETARY INTERFACE
========================================================= */

"use strict";


/* =========================================================
   COUNTRY DATA
========================================================= */

const countries = [
    {
        name: "Japan",
        region: "EAST ASIA",
        capital: "Tokyo",
        population: "123.7M",
        area: "377,975 km²",
        currency: "JPY",
        description:
            "An island nation where ancient traditions, advanced technology, dramatic landscapes and dense modern cities exist side by side."
    },
    {
        name: "United Arab Emirates",
        region: "WESTERN ASIA",
        capital: "Abu Dhabi",
        population: "10.2M",
        area: "83,600 km²",
        currency: "AED",
        description:
            "A federation known for its modern cities, ambitious architecture, desert landscapes, global trade and multicultural society."
    },
    {
        name: "India",
        region: "SOUTH ASIA",
        capital: "New Delhi",
        population: "1.46B",
        area: "3.28M km²",
        currency: "INR",
        description:
            "One of the world's most diverse civilizations, with thousands of years of history, languages, traditions, cuisines and landscapes."
    },
    {
        name: "Switzerland",
        region: "EUROPE",
        capital: "Bern",
        population: "9.0M",
        area: "41,285 km²",
        currency: "CHF",
        description:
            "A mountainous European country known for the Alps, precision industries, lakes, finance and distinctive regional cultures."
    },
    {
        name: "United States",
        region: "NORTH AMERICA",
        capital: "Washington, D.C.",
        population: "347M",
        area: "9.83M km²",
        currency: "USD",
        description:
            "A vast country spanning multiple climates and landscapes, from major global cities to deserts, forests, mountains and coastlines."
    },
    {
        name: "Australia",
        region: "OCEANIA",
        capital: "Canberra",
        population: "27.0M",
        area: "7.69M km²",
        currency: "AUD",
        description:
            "A continent-country famous for its unique wildlife, immense landscapes, beaches, reefs and distinctive urban centers."
    },
    {
        name: "Italy",
        region: "EUROPE",
        capital: "Rome",
        population: "58.9M",
        area: "301,340 km²",
        currency: "EUR",
        description:
            "A Mediterranean nation with an extraordinary artistic, architectural and culinary heritage extending from antiquity to the modern era."
    },
    {
        name: "Brazil",
        region: "SOUTH AMERICA",
        capital: "Brasília",
        population: "213M",
        area: "8.52M km²",
        currency: "BRL",
        description:
            "South America's largest nation, home to the Amazon, vast biodiversity, enormous cities and a rich mixture of cultures."
    }
];


/* =========================================================
   DOM HELPERS
========================================================= */

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const safeText = (element, value) => {
    if (element) element.textContent = value;
};


/* =========================================================
   APP STATE
========================================================= */

const state = {
    rotation: 0,
    tilt: 0,
    zoom: 1,

    dragging: false,
    lastPointerX: 0,
    lastPointerY: 0,

    autoRotate: true,

    selectedCountry: null,

    searchOpen: false,
    mobileMenuOpen: false
};


/* =========================================================
   BOOT SEQUENCE
========================================================= */

function startBootSequence() {

    const bootScreen = $(".boot-screen");
    const progress = $("#bootProgressBar");
    const percent = $("#bootPercent");

    if (!bootScreen) {
        initializeApplication();
        return;
    }

    let current = 0;

    const bootSteps = [
        { value: 16, text: "INITIALIZING CORE SYSTEM" },
        { value: 34, text: "LOADING PLANETARY DATA" },
        { value: 51, text: "CALIBRATING ORBITAL ENGINE" },
        { value: 68, text: "MAPPING CONTINENTS" },
        { value: 84, text: "CONNECTING GLOBAL DATABASE" },
        { value: 100, text: "SYSTEM ONLINE" }
    ];

    const bootText = $(".boot-text");

    const interval = setInterval(() => {

        current += Math.floor(Math.random() * 5) + 2;

        if (current >= 100) {
            current = 100;
        }

        if (progress) {
            progress.style.width = `${current}%`;
        }

        if (percent) {
            percent.textContent = `${current}%`;
        }

        const step = bootSteps.find(item => current <= item.value);

        if (step && bootText) {
            bootText.textContent = step.text;
        }

        if (current >= 100) {

            clearInterval(interval);

            setTimeout(() => {

                bootScreen.classList.add("hidden");

                initializeApplication();

            }, 650);
        }

    }, 90);
}


/* =========================================================
   APPLICATION INITIALIZATION
========================================================= */

function initializeApplication() {

    const app = $(".app");

    if (app) {
        requestAnimationFrame(() => {
            app.classList.add("ready");
        });
    }

    initializeGlobe();
    initializeNavigation();
    initializeSearch();
    initializeCountryCards();
    initializeModal();
    initializeControls();
    initializeRevealAnimations();
    initializeCounters();
    initializeClock();

    updateOnlineStatus();
}


/* =========================================================
   LIVE CLOCK
========================================================= */

function initializeClock() {

    const clockElements = $$("[data-clock]");

    if (!clockElements.length) return;

    function updateClock() {

        const now = new Date();

        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");

        const value = `${hours}:${minutes}:${seconds}`;

        clockElements.forEach(element => {
            element.textContent = value;
        });
    }

    updateClock();

    setInterval(updateClock, 1000);
}


/* =========================================================
   ONLINE STATUS
========================================================= */

function updateOnlineStatus() {

    const statusElements = $$("[data-system-status]");

    statusElements.forEach(element => {
        element.textContent =
            navigator.onLine ? "SYSTEM ONLINE" : "OFFLINE MODE";
    });

    window.addEventListener("online", () => {

        statusElements.forEach(element => {
            element.textContent = "SYSTEM ONLINE";
        });

    });

    window.addEventListener("offline", () => {

        statusElements.forEach(element => {
            element.textContent = "OFFLINE MODE";
        });

    });
}


/* =========================================================
   NAVIGATION
========================================================= */

function initializeNavigation() {

    const navItems = $$(".nav-item");
    const sections = $$("section[id]");

    navItems.forEach(item => {

        item.addEventListener("click", event => {

            const target = item.getAttribute("href");

            if (!target || !target.startsWith("#")) return;

            const element = $(target);

            if (element) {

                event.preventDefault();

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                navItems.forEach(nav => {
                    nav.classList.remove("active");
                });

                item.classList.add("active");
            }
        });
    });


    /* Mobile menu */

    const mobileButton = $(".mobile-menu-button");
    const mobileNavigation = $(".mobile-navigation");
    const mobileClose = $(".mobile-close");

    function openMobileMenu() {

        if (!mobileNavigation) return;

        mobileNavigation.classList.add("open");

        state.mobileMenuOpen = true;
    }

    function closeMobileMenu() {

        if (!mobileNavigation) return;

        mobileNavigation.classList.remove("open");

        state.mobileMenuOpen = false;
    }

    if (mobileButton) {
        mobileButton.addEventListener("click", openMobileMenu);
    }

    if (mobileClose) {
        mobileClose.addEventListener("click", closeMobileMenu);
    }

    $$(".mobile-navigation a").forEach(link => {

        link.addEventListener("click", () => {
            closeMobileMenu();
        });

    });


    /* Active section detection */

    if ("IntersectionObserver" in window) {

        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    const id = entry.target.id;

                    navItems.forEach(item => {

                        const href = item.getAttribute("href");

                        item.classList.toggle(
                            "active",
                            href === `#${id}`
                        );
                    });

                });

            },
            {
                threshold: 0.25
            }
        );

        sections.forEach(section => {
            observer.observe(section);
        });
    }
}


/* =========================================================
   SEARCH
========================================================= */

function initializeSearch() {

    const searchButtons = $$("[data-search-open]");
    const searchOverlay = $(".search-overlay");
    const closeButton = $(".search-close");

    const globalInput = $(".global-search input");
    const heroInput = $(".hero-search input");

    const globalResults = $(".global-search-results");
    const heroResults = $(".hero-search-results");


    function openSearch() {

        if (!searchOverlay) return;

        searchOverlay.classList.add("open");

        state.searchOpen = true;

        setTimeout(() => {

            if (globalInput) {
                globalInput.focus();
            }

        }, 300);
    }


    function closeSearch() {

        if (!searchOverlay) return;

        searchOverlay.classList.remove("open");

        state.searchOpen = false;

        if (globalInput) {
            globalInput.value = "";
        }

        if (heroInput) {
            heroInput.value = "";
        }

        clearResults();
    }


    searchButtons.forEach(button => {
        button.addEventListener("click", openSearch);
    });


    if (closeButton) {
        closeButton.addEventListener("click", closeSearch);
    }


    if (searchOverlay) {

        searchOverlay.addEventListener("click", event => {

            if (event.target === searchOverlay) {
                closeSearch();
            }

        });
    }


    function clearResults() {

        if (globalResults) {
            globalResults.innerHTML = "";
        }

        if (heroResults) {
            heroResults.innerHTML = "";
            heroResults.classList.remove("open");
        }
    }


    function performSearch(value, container, isHero = false) {

        if (!container) return;

        const query = value.trim().toLowerCase();

        container.innerHTML = "";

        if (!query) {

            if (isHero) {
                container.classList.remove("open");
            }

            return;
        }


        const matches = countries.filter(country =>
            country.name.toLowerCase().includes(query) ||
            country.region.toLowerCase().includes(query) ||
            country.capital.toLowerCase().includes(query)
        );


        if (!matches.length) {

            container.innerHTML = `
                <div class="search-result">
                    <strong>NO MATCH FOUND</strong>
                    <span>DATABASE</span>
                </div>
            `;

            if (isHero) {
                container.classList.add("open");
            }

            return;
        }


        matches.forEach(country => {

            const result = document.createElement("div");

            result.className = "search-result";

            result.innerHTML = `
                <strong>${country.name}</strong>
                <span>${country.region}</span>
            `;

            result.addEventListener("click", () => {

                openCountryModal(country);

                if (isHero) {
                    heroInput.value = "";
                    container.classList.remove("open");
                }

                if (!isHero) {
                    closeSearch();
                }

            });

            container.appendChild(result);
        });


        if (isHero) {
            container.classList.add("open");
        }
    }


    if (globalInput) {

        globalInput.addEventListener("input", () => {

            performSearch(
                globalInput.value,
                globalResults
            );

        });

        globalInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                const firstResult =
                    globalResults?.querySelector(".search-result");

                if (firstResult) {
                    firstResult.click();
                }
            }

        });
    }


    if (heroInput) {

        heroInput.addEventListener("input", () => {

            performSearch(
                heroInput.value,
                heroResults,
                true
            );

        });

        heroInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {

                const firstResult =
                    heroResults?.querySelector(".search-result");

                if (firstResult) {
                    firstResult.click();
                }
            }

        });
    }


    document.addEventListener("keydown", event => {

        if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "k"
        ) {

            event.preventDefault();

            if (state.searchOpen) {
                closeSearch();
            } else {
                openSearch();
            }
        }

        if (event.key === "Escape") {

            if (state.searchOpen) {
                closeSearch();
            }
        }
    });
}


/* =========================================================
   COUNTRY CARDS
========================================================= */

function initializeCountryCards() {

    $$(".country-card").forEach(card => {

        card.addEventListener("click", () => {

            const name =
                card.dataset.country ||
                card.querySelector("h3")?.textContent.trim();

            if (!name) return;

            const country = countries.find(
                item =>
                    item.name.toLowerCase() === name.toLowerCase()
            );

            if (country) {
                openCountryModal(country);
            }
        });
    });
}


/* =========================================================
   COUNTRY MODAL
========================================================= */

function initializeModal() {

    const modal = $(".country-modal");
    const close = $(".modal-close");
    const backdrop = $(".country-modal-backdrop");

    if (!modal) return;


    if (close) {
        close.addEventListener("click", closeCountryModal);
    }

    if (backdrop) {
        backdrop.addEventListener("click", closeCountryModal);
    }


    document.addEventListener("keydown", event => {

        if (
            event.key === "Escape" &&
            modal.classList.contains("open")
        ) {
            closeCountryModal();
        }

    });
}


function openCountryModal(country) {

    const modal = $(".country-modal");

    if (!modal) return;

    state.selectedCountry = country;


    const name = modal.querySelector(
        "[data-modal-name]"
    );

    const region = modal.querySelector(
        "[data-modal-region]"
    );

    const capital = modal.querySelector(
        "[data-modal-capital]"
    );

    const population = modal.querySelector(
        "[data-modal-population]"
    );

    const area = modal.querySelector(
        "[data-modal-area]"
    );

    const currency = modal.querySelector(
        "[data-modal-currency]"
    );

    const description = modal.querySelector(
        "[data-modal-description]"
    );


    safeText(name, country.name);
    safeText(region, country.region);
    safeText(capital, country.capital);
    safeText(population, country.population);
    safeText(area, country.area);
    safeText(currency, country.currency);
    safeText(description, country.description);


    modal.classList.add("open");

    document.body.style.overflow = "hidden";
}


function closeCountryModal() {

    const modal = $(".country-modal");

    if (!modal) return;

    modal.classList.remove("open");

    document.body.style.overflow = "";

    state.selectedCountry = null;
}


/* =========================================================
   GLOBE ENGINE
========================================================= */

let globeCanvas = null;
let globeContext = null;
let globeAnimation = null;

function initializeGlobe() {

    globeCanvas = $("#earthCanvas");

    if (!globeCanvas) return;

    globeContext = globeCanvas.getContext("2d");

    resizeGlobe();

    window.addEventListener("resize", resizeGlobe);

    setupGlobePointer();

    animateGlobe();
}


function resizeGlobe() {

    if (!globeCanvas || !globeContext) return;

    const rect = globeCanvas.getBoundingClientRect();

    const ratio =
        Math.min(window.devicePixelRatio || 1, 2);

    globeCanvas.width =
        Math.floor(rect.width * ratio);

    globeCanvas.height =
        Math.floor(rect.height * ratio);

    globeContext.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}


/* =========================================================
   GLOBE DRAWING
========================================================= */

function animateGlobe() {

    if (!globeCanvas || !globeContext) return;

    drawGlobe();

    if (state.autoRotate && !state.dragging) {
        state.rotation += 0.0017;
    }

    globeAnimation =
        requestAnimationFrame(animateGlobe);
}


function drawGlobe() {

    const ctx = globeContext;

    const width = globeCanvas.clientWidth;
    const height = globeCanvas.clientHeight;

    if (!width || !height) return;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    const radius =
        Math.min(width, height) *
        0.37 *
        state.zoom;


    /* Atmosphere */

    const atmosphere =
        ctx.createRadialGradient(
            cx - radius * .25,
            cy - radius * .28,
            radius * .1,
            cx,
            cy,
            radius * 1.25
        );

    atmosphere.addColorStop(
        0,
        "rgba(70,145,205,.22)"
    );

    atmosphere.addColorStop(
        .55,
        "rgba(30,92,143,.12)"
    );

    atmosphere.addColorStop(
        1,
        "rgba(2,5,10,0)"
    );

    ctx.fillStyle = atmosphere;

    ctx.beginPath();
    ctx.arc(
        cx,
        cy,
        radius * 1.24,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Planet body */

    const planet =
        ctx.createRadialGradient(
            cx - radius * .32,
            cy - radius * .38,
            radius * .05,
            cx,
            cy,
            radius
        );

    planet.addColorStop(
        0,
        "#244b68"
    );

    planet.addColorStop(
        .35,
        "#102b40"
    );

    planet.addColorStop(
        .72,
        "#071521"
    );

    planet.addColorStop(
        1,
        "#02060a"
    );

    ctx.fillStyle = planet;

    ctx.beginPath();
    ctx.arc(
        cx,
        cy,
        radius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* Clip globe details */

    ctx.save();

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius - .5,
        0,
        Math.PI * 2
    );

    ctx.clip();


    drawLatitudeLines(
        ctx,
        cx,
        cy,
        radius
    );

    drawLongitudeLines(
        ctx,
        cx,
        cy,
        radius
    );

    drawContinents(
        ctx,
        cx,
        cy,
        radius
    );

    drawClouds(
        ctx,
        cx,
        cy,
        radius
    );

    drawCityLights(
        ctx,
        cx,
        cy,
        radius
    );


    ctx.restore();


    /* Edge */

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius,
        0,
        Math.PI * 2
    );

    ctx.strokeStyle =
        "rgba(126,191,235,.25)";

    ctx.lineWidth = 1;

    ctx.stroke();


    /* Rim glow */

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        radius + 2,
        Math.PI * .95,
        Math.PI * 1.65
    );

    ctx.strokeStyle =
        "rgba(143,200,255,.3)";

    ctx.lineWidth = 2;

    ctx.shadowBlur = 15;
    ctx.shadowColor = "rgba(80,170,230,.4)";

    ctx.stroke();

    ctx.shadowBlur = 0;
}


/* =========================================================
   LATITUDE LINES
========================================================= */

function drawLatitudeLines(
    ctx,
    cx,
    cy,
    radius
) {

    ctx.strokeStyle =
        "rgba(125,181,218,.055)";

    ctx.lineWidth = 1;

    for (let i = -4; i <= 4; i++) {

        const y =
            cy + i * radius * .19;

        const halfWidth =
            Math.sqrt(
                Math.max(
                    0,
                    radius * radius -
                    Math.pow(y - cy, 2)
                )
            );

        ctx.beginPath();

        ctx.ellipse(
            cx,
            y,
            halfWidth,
            Math.max(
                3,
                halfWidth * .12
            ),
            0,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}


/* =========================================================
   LONGITUDE LINES
========================================================= */

function drawLongitudeLines(
    ctx,
    cx,
    cy,
    radius
) {

    ctx.strokeStyle =
        "rgba(125,181,218,.045)";

    ctx.lineWidth = 1;

    for (let i = -5; i <= 5; i++) {

        const width =
            radius *
            Math.abs(
                Math.cos(
                    (i / 5) * Math.PI / 2
                )
            );

        ctx.beginPath();

        ctx.ellipse(
            cx,
            cy,
            Math.max(width, 2),
            radius,
            0,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}


/* =========================================================
   CONTINENT SHAPES
========================================================= */

function drawContinents(
    ctx,
    cx,
    cy,
    radius
) {

    const continents = [

        /* North America */

        [
            [-.64, -.38],
            [-.51, -.48],
            [-.39, -.44],
            [-.32, -.31],
            [-.38, -.18],
            [-.48, -.17],
            [-.54, -.05],
            [-.64, -.10],
            [-.70, -.25]
        ],

        /* South America */

        [
            [-.30, .02],
            [-.22, .10],
            [-.18, .25],
            [-.25, .42],
            [-.34, .62],
            [-.42, .48],
            [-.38, .29],
            [-.44, .15]
        ],

        /* Europe */

        [
            [.02, -.35],
            [.10, -.39],
            [.18, -.34],
            [.22, -.27],
            [.13, -.23],
            [.05, -.25]
        ],

        /* Africa */

        [
            [-.02, -.18],
            [.13, -.15],
            [.23, -.02],
            [.18, .20],
            [.07, .42],
            [-.08, .30],
            [-.13, .08]
        ],

        /* Asia */

        [
            [.18, -.38],
            [.34, -.43],
            [.52, -.36],
            [.67, -.22],
            [.58, -.07],
            [.43, -.12],
            [.34, -.02],
            [.23, -.13]
        ],

        /* Australia */

        [
            [.46, .25],
            [.62, .25],
            [.69, .34],
            [.60, .44],
            [.45, .42],
            [.40, .33]
        ]
    ];


    ctx.fillStyle =
        "rgba(77,125,139,.38)";

    ctx.strokeStyle =
        "rgba(123,174,184,.18)";

    ctx.lineWidth = 1;


    continents.forEach(shape => {

        ctx.beginPath();

        shape.forEach((point, index) => {

            const x =
                cx + point[0] * radius;

            const y =
                cy + point[1] * radius;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.closePath();

        ctx.fill();
        ctx.stroke();
    });
}


/* =========================================================
   CLOUDS
========================================================= */

function drawClouds(
    ctx,
    cx,
    cy,
    radius
) {

    ctx.strokeStyle =
        "rgba(210,235,248,.05)";

    ctx.lineWidth = 4;

    const offset =
        (state.rotation * radius * 0.7) %
        (radius * 2);

    for (let i = 0; i < 5; i++) {

        const y =
            cy -
            radius * .55 +
            i * radius * .28;

        ctx.beginPath();

        ctx.ellipse(
            cx + offset * .15,
            y,
            radius * (.35 + i * .025),
            radius * .025,
            -.2,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }
}


/* =========================================================
   CITY LIGHTS
========================================================= */

function drawCityLights(
    ctx,
    cx,
    cy,
    radius
) {

    const lights = [
        [-.43, -.24],
        [-.35, -.17],
        [-.28, -.10],
        [.07, -.27],
        [.15, -.22],
        [.24, -.18],
        [.34, -.12],
        [.42, -.04],
        [.48, .02],
        [.28, .14],
        [.14, .09],
        [.50, .32],
        [-.25, .18],
        [-.18, .26]
    ];

    ctx.fillStyle =
        "rgba(232,193,111,.5)";

    lights.forEach(point => {

        const x =
            cx + point[0] * radius;

        const y =
            cy + point[1] * radius;

        const distance =
            Math.sqrt(
                Math.pow(x - cx, 2) +
                Math.pow(y - cy, 2)
            );

        if (distance < radius * .92) {

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                1.25,
                0,
                Math.PI * 2
            );

            ctx.fill();
        }
    });
}


/* =========================================================
   GLOBE POINTER CONTROLS
========================================================= */

function setupGlobePointer() {

    if (!globeCanvas) return;


    globeCanvas.addEventListener(
        "pointerdown",
        event => {

            state.dragging = true;

            state.autoRotate = false;

            state.lastPointerX = event.clientX;
            state.lastPointerY = event.clientY;

            globeCanvas.setPointerCapture(
                event.pointerId
            );
        }
    );


    globeCanvas.addEventListener(
        "pointermove",
        event => {

            if (!state.dragging) return;

            const dx =
                event.clientX -
                state.lastPointerX;

            const dy =
                event.clientY -
                state.lastPointerY;

            state.rotation += dx * .004;

            state.tilt += dy * .002;

            state.tilt =
                Math.max(
                    -.25,
                    Math.min(.25, state.tilt)
                );

            state.lastPointerX =
                event.clientX;

            state.lastPointerY =
                event.clientY;
        }
    );


    globeCanvas.addEventListener(
        "pointerup",
        event => {

            state.dragging = false;

            try {
                globeCanvas.releasePointerCapture(
                    event.pointerId
                );
            } catch (_) {}

            setTimeout(() => {
                state.autoRotate = true;
            }, 1400);
        }
    );


    globeCanvas.addEventListener(
        "pointercancel",
        () => {
            state.dragging = false;
            state.autoRotate = true;
        }
    );


    globeCanvas.addEventListener(
        "wheel",
        event => {

            event.preventDefault();

            const direction =
                event.deltaY > 0 ? -.08 : .08;

            state.zoom += direction;

            state.zoom =
                Math.max(
                    .78,
                    Math.min(1.35, state.zoom)
                );
        },
        { passive: false }
    );
}


/* =========================================================
   GLOBE BUTTON CONTROLS
========================================================= */

function initializeControls() {

    const rotateButton =
        $("[data-globe-rotate]");

    const zoomIn =
        $("[data-globe-zoom-in]");

    const zoomOut =
        $("[data-globe-zoom-out]");

    const reset =
        $("[data-globe-reset]");


    if (rotateButton) {

        rotateButton.addEventListener(
            "click",
            () => {

                state.autoRotate =
                    !state.autoRotate;

                rotateButton.classList.toggle(
                    "active",
                    state.autoRotate
                );
            }
        );
    }


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            () => {

                state.zoom += .1;

                state.zoom =
                    Math.min(
                        1.35,
                        state.zoom
                    );
            }
        );
    }


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            () => {

                state.zoom -= .1;

                state.zoom =
                    Math.max(
                        .78,
                        state.zoom
                    );
            }
        );
    }


    if (reset) {

        reset.addEventListener(
            "click",
            () => {

                state.rotation = 0;
                state.tilt = 0;
                state.zoom = 1;

                state.autoRotate = true;
            }
        );
    }


    /* Generic control support */

    $$("[data-action]").forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const action =
                    button.dataset.action;

                if (action === "rotate") {
                    state.autoRotate =
                        !state.autoRotate;
                }

                if (action === "reset") {
                    state.rotation = 0;
                    state.tilt = 0;
                    state.zoom = 1;
                }

                if (action === "zoom-in") {
                    state.zoom =
                        Math.min(
                            1.35,
                            state.zoom + .1
                        );
                }

                if (action === "zoom-out") {
                    state.zoom =
                        Math.max(
                            .78,
                            state.zoom - .1
                        );
                }
            }
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


    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {
            element.classList.add("visible");
        });

        return;
    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add(
                        "visible"
                    );

                    observer.unobserve(
                        entry.target
                    );
                });

            },
            {
                threshold: .12,
                rootMargin: "0px 0px -40px 0px"
            }
        );


    elements.forEach(element => {
        observer.observe(element);
    });
}


/* =========================================================
   ANIMATED NUMBERS
========================================================= */

function initializeCounters() {

    const counters =
        $$("[data-counter]");

    if (!counters.length) return;


    counters.forEach(counter => {

        const target =
            parseFloat(
                counter.dataset.counter
            );

        if (Number.isNaN(target)) return;

        const suffix =
            counter.dataset.suffix || "";

        const decimals =
            counter.dataset.decimals
                ? parseInt(
                    counter.dataset.decimals,
                    10
                )
                : 0;

        let started = false;


        function animateCounter() {

            if (started) return;

            started = true;

            const duration = 1800;

            const startTime =
                performance.now();


            function frame(now) {

                const progress =
                    Math.min(
                        (now - startTime) /
                        duration,
                        1
                    );

                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        4
                    );

                const value =
                    target * eased;

                counter.textContent =
                    value.toLocaleString(
                        "en-US",
                        {
                            minimumFractionDigits:
                                decimals,
                            maximumFractionDigits:
                                decimals
                        }
                    ) + suffix;


                if (progress < 1) {
                    requestAnimationFrame(frame);
                }
            }

            requestAnimationFrame(frame);
        }


        if ("IntersectionObserver" in window) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        if (
                            entries[0].isIntersecting
                        ) {

                            animateCounter();

                            observer.disconnect();
                        }

                    },
                    {
                        threshold: .5
                    }
                );

            observer.observe(counter);

        } else {

            animateCounter();
        }
    });
}


/* =========================================================
   KEYBOARD NAVIGATION
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "r") {

            if (
                document.activeElement?.tagName ===
                "INPUT"
            ) return;

            state.autoRotate = true;
        }

        if (event.key === " ") {

            if (
                document.activeElement?.tagName ===
                "INPUT"
            ) return;

            event.preventDefault();

            state.autoRotate =
                !state.autoRotate;
        }

        if (event.key === "+" || event.key === "=") {

            state.zoom =
                Math.min(
                    1.35,
                    state.zoom + .08
                );
        }

        if (event.key === "-" || event.key === "_") {

            state.zoom =
                Math.max(
                    .78,
                    state.zoom - .08
                );
        }

        if (event.key === "0") {

            state.rotation = 0;
            state.tilt = 0;
            state.zoom = 1;
        }
    }
);


/* =========================================================
   SMOOTH MOUSE PARALLAX
========================================================= */

function initializeParallax() {

    const elements =
        $$(".hero-grid, .space-glow");

    if (!elements.length) return;

    let targetX = 0;
    let targetY = 0;

    let currentX = 0;
    let currentY = 0;


    window.addEventListener(
        "pointermove",
        event => {

            targetX =
                (event.clientX /
                    window.innerWidth -
                    .5) * 12;

            targetY =
                (event.clientY /
                    window.innerHeight -
                    .5) * 12;
        },
        { passive: true }
    );


    function animate() {

        currentX +=
            (targetX - currentX) * .035;

        currentY +=
            (targetY - currentY) * .035;


        elements.forEach(
            (element, index) => {

                const multiplier =
                    index === 0 ? 1 : .5;

                element.style.transform =
                    `translate3d(
                        ${currentX * multiplier}px,
                        ${currentY * multiplier}px,
                        0
                    )`;
            }
        );


        requestAnimationFrame(animate);
    }

    animate();
}


/* =========================================================
   BUTTON RIPPLE
========================================================= */

function initializeButtonEffects() {

    $$("button").forEach(button => {

        button.addEventListener(
            "pointerdown",
            event => {

                const ripple =
                    document.createElement("span");

                ripple.style.position =
                    "absolute";

                ripple.style.pointerEvents =
                    "none";

                ripple.style.width =
                    "8px";

                ripple.style.height =
                    "8px";

                ripple.style.borderRadius =
                    "50%";

                ripple.style.background =
                    "rgba(255,255,255,.18)";

                ripple.style.transform =
                    "translate(-50%, -50%) scale(1)";

                ripple.style.transition =
                    "transform .55s ease, opacity .55s ease";

                const rect =
                    button.getBoundingClientRect();

                ripple.style.left =
                    `${event.clientX - rect.left}px`;

                ripple.style.top =
                    `${event.clientY - rect.top}px`;

                button.style.position =
                    "relative";

                button.style.overflow =
                    "hidden";

                button.appendChild(ripple);


                requestAnimationFrame(() => {

                    ripple.style.transform =
                        "translate(-50%, -50%) scale(28)";

                    ripple.style.opacity = "0";

                });


                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        );
    });
}


/* =========================================================
   INITIALIZE EXTRA EFFECTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        startBootSequence();

        initializeParallax();

        initializeButtonEffects();
    }
);


/* =========================================================
   WINDOW VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {

            state.autoRotate = false;

        } else {

            state.autoRotate = true;
        }
    }
);


/* =========================================================
   PREVENT ACCIDENTAL IMAGE DRAGGING
========================================================= */

document.addEventListener(
    "dragstart",
    event => {

        if (
            event.target.tagName === "IMG"
        ) {
            event.preventDefault();
        }
    }
);


/* =========================================================
   CONSOLE BRANDING
========================================================= */

console.log(
    "%cEARTH // 2086",
    "font-size:24px;font-weight:600;"
);

console.log(
    "%cPLANETARY INTERFACE ONLINE",
    "font-size:10px;letter-spacing:4px;"
);
