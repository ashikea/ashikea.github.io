/* =========================================================
   ASHIK — BURGUNDY LIQUID PORTFOLIO
   Smooth navigation, scroll reveal, droplets and liquid hover
========================================================= */

(() => {
    "use strict";

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const $ = (selector, context = document) =>
        context.querySelector(selector);

    const $$ = (selector, context = document) =>
        [...context.querySelectorAll(selector)];



    /* =========================================================
       PAGE LOADER
       Lightweight welcome screen. It never waits on every image/font to
       finish: the page becomes interactive first, then the loader fades.
    ========================================================= */

    const pageLoader = $("#pageLoader");

    if (pageLoader) {
        const startedAt = performance.now();
        const minimumDisplay = reducedMotion ? 180 : (window.innerWidth < 768 ? 380 : 500);
        let loaderClosed = false;

        const hidePageLoader = () => {
            if (loaderClosed) return;
            loaderClosed = true;

            const elapsed = performance.now() - startedAt;
            const wait = Math.max(0, minimumDisplay - elapsed);

            window.setTimeout(() => {
                pageLoader.classList.add("hidden");
                pageLoader.setAttribute("aria-hidden", "true");
                document.body.classList.remove("is-loading");

                window.setTimeout(() => {
                    pageLoader.remove();
                }, reducedMotion ? 0 : 420);
            }, wait);
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", hidePageLoader, { once: true });
        } else {
            hidePageLoader();
        }

        // Hard safety limit: the loader cannot delay the page for more than 1.6s.
        window.setTimeout(hidePageLoader, 950);
    }


    /* =========================================================
       DAY / NIGHT THEME
       Robust desktop + mobile implementation. No dependency on
       View Transition API: the theme always switches immediately,
       then CSS smoothly animates the visual properties.
    ========================================================= */

    const themeToggle = $("#themeToggle");
    const root = document.documentElement;

    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem("ashik-theme");
    } catch (error) {
        savedTheme = null;
    }

    const prefersDark = window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
        : false;

    const applyTheme = (theme, persist = false) => {
        const dark = theme === "dark";
        const resolved = dark ? "dark" : "light";

        // Set the theme on <html>, which is the selector used by the CSS.
        root.setAttribute("data-theme", resolved);
        root.style.colorScheme = resolved;

        if (persist) {
            try {
                localStorage.setItem("ashik-theme", resolved);
            } catch (error) {
                // Private browsing / blocked storage: theme still works.
            }
        }

        if (!themeToggle) return;

        themeToggle.setAttribute("aria-pressed", String(dark));
        themeToggle.setAttribute(
            "aria-label",
            dark ? "Switch to day mode" : "Switch to night mode"
        );
        themeToggle.setAttribute(
            "title",
            dark ? "Switch to day mode" : "Switch to night mode"
        );

        const label = $(".theme-label", themeToggle);
        if (label) {
            label.textContent = dark ? "Day" : "Night";
        }
    };

    const initialTheme =
        savedTheme === "dark" || savedTheme === "light"
            ? savedTheme
            : (prefersDark ? "dark" : "light");

    applyTheme(initialTheme);

    if (themeToggle) {

        // Touch devices have no persistent hover state. Give the
        // theme control a visible press/ripple interaction instead.
        const startThemePress = () => {
            themeToggle.classList.remove("theme-touch-active");
            void themeToggle.offsetWidth;
            themeToggle.classList.add("theme-touch-active");
        };

        const endThemePress = () => {
            themeToggle.classList.remove("theme-touch-active");
        };

        themeToggle.addEventListener("pointerdown", startThemePress, { passive: true });
        themeToggle.addEventListener("pointerup", endThemePress, { passive: true });
        themeToggle.addEventListener("pointercancel", endThemePress, { passive: true });
        themeToggle.addEventListener("pointerleave", endThemePress, { passive: true });

        themeToggle.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                startThemePress();
            }
        });

        themeToggle.addEventListener("keyup", endThemePress);

        themeToggle.addEventListener("click", (event) => {
            event.preventDefault();

            const current = root.getAttribute("data-theme") === "dark"
                ? "dark"
                : "light";

            const next = current === "dark" ? "light" : "dark";

            // Let CSS transitions handle the visual change consistently
            // on both desktop and mobile browsers.
            root.classList.add("theme-changing");
            themeToggle.classList.remove("theme-switching");
            void themeToggle.offsetWidth;
            themeToggle.classList.add("theme-switching");
            applyTheme(next, true);

            window.setTimeout(() => {
                root.classList.remove("theme-changing");
                themeToggle.classList.remove("theme-switching");
                themeToggle.classList.remove("theme-touch-active");
            }, 500);
        });
    }


    /* =========================================================
       FOOTER YEAR
    ========================================================= */

    const year = $("#year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }


    /* =========================================================
       NAVBAR SCROLL STATE
    ========================================================= */

    const header = $("#siteHeader");

    /* Keep the fixed header from covering section content. */
    const syncHeaderSpace = () => {
        if (!header) return;
        const height = header.offsetHeight;
        document.documentElement.style.setProperty(
            '--header-space',
            `${height + 12}px`
        );
    };

    if (header) {
        let headerScrolled = false;

        const updateHeader = () => {
            const next = window.scrollY > 35;

            if (next === headerScrolled) return;

            headerScrolled = next;
            header.classList.toggle("scrolled", next);
        };

        updateHeader();

        window.addEventListener("scroll", updateHeader, { passive: true });
    }

    syncHeaderSpace();
    window.addEventListener("resize", syncHeaderSpace, { passive: true });
    window.addEventListener("load", syncHeaderSpace, { once: true });


    /* =========================================================
       MOBILE NAVIGATION
    ========================================================= */

    const navToggle = $("#navToggle");
    const navList = $("#navList");

    if (navToggle && navList) {

        const closeMenu = () => {
            navToggle.setAttribute("aria-expanded", "false");
            navList.classList.remove("open");
        };

        const toggleMenu = () => {
            const opened =
                navToggle.getAttribute("aria-expanded") === "true";

            navToggle.setAttribute(
                "aria-expanded",
                String(!opened)
            );

            navList.classList.toggle("open", !opened);
        };

        navToggle.addEventListener("click", toggleMenu);

        $$(".nav-link", navList).forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {

            if (!navList.classList.contains("open")) {
                return;
            }

            if (
                navList.contains(event.target) ||
                navToggle.contains(event.target)
            ) {
                return;
            }

            closeMenu();
        });

        document.addEventListener("keydown", (event) => {

            if (
                event.key === "Escape" &&
                navList.classList.contains("open")
            ) {
                closeMenu();
                navToggle.focus();
            }
        });

        window.addEventListener("resize", () => {

            if (window.innerWidth > 900) {
                closeMenu();
            }

        });
    }


    /* =========================================================
       SMOOTH SCROLL
    ========================================================= */

    const scrollToTarget = (target) => {

        if (!target) {
            return;
        }

        const headerOffset = header
            ? header.offsetHeight + 18
            : 0;

        const targetTop =
            target.getBoundingClientRect().top +
            window.scrollY -
            headerOffset;

        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior: reducedMotion ? "auto" : "smooth"
        });
    };


    $$('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const hash = link.getAttribute("href");

            if (!hash || hash === "#" || hash.length < 2) {
                return;
            }

            const target = document.querySelector(hash);

            if (!target) {
                return;
            }

            event.preventDefault();

            scrollToTarget(target);

            history.pushState(
                null,
                "",
                hash
            );
        });

    });


    /* =========================================================
       ACTIVE NAVIGATION
       Cached section positions on scroll. Desktop uses a moving pill;
       mobile uses the active link's own burgundy surface.
    ========================================================= */

    const sections = $$('main section[id]');
    const navLinks = $$('.nav-link');
    const navIndicator = $('.nav-indicator');

    if (sections.length && navLinks.length && navList) {

        const linkById = new Map();

        navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                linkById.set(href.slice(1), link);
            }
        });

        let sectionTops = [];
        let activeId = '';
        let scrollTicking = false;
        let layoutTimer = 0;

        const moveIndicator = (link, immediate = false) => {
            if (!navIndicator || !link || window.innerWidth <= 900) return;

            const left = link.offsetLeft;
            const top = link.offsetTop;
            const width = link.offsetWidth;
            const height = link.offsetHeight;

            if (immediate) {
                navIndicator.style.transition = 'none';
            }

            navIndicator.style.left = `${left}px`;
            navIndicator.style.top = `${top}px`;
            navIndicator.style.width = `${width}px`;
            navIndicator.style.height = `${height}px`;
            navIndicator.style.opacity = '1';

            if (immediate) {
                void navIndicator.offsetWidth;
                navIndicator.style.transition = '';
            }
        };

        const setActive = (id, immediate = false) => {
            navLinks.forEach((link) => {
                const selected = link.getAttribute('href') === `#${id}`;
                link.classList.toggle('active', selected);
                if (selected) link.setAttribute('aria-current', 'page');
                else link.removeAttribute('aria-current');
            });

            moveIndicator(linkById.get(id), immediate);
        };

        const cacheSectionTops = () => {
            const pageY = window.scrollY;
            sectionTops = sections.map((section) => ({
                id: section.id,
                top: Math.round(section.getBoundingClientRect().top + pageY)
            }));
        };

        const currentSectionId = () => {
            if (!sectionTops.length) return sections[0].id;

            const headerHeight = header ? header.offsetHeight : 0;
            const marker = window.scrollY + headerHeight + Math.min(130, window.innerHeight * 0.18);
            let current = sectionTops[0].id;

            for (let i = sectionTops.length - 1; i >= 0; i--) {
                if (sectionTops[i].top <= marker) {
                    current = sectionTops[i].id;
                    break;
                }
            }

            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            if (window.scrollY >= maxScroll - 8) {
                current = sectionTops[sectionTops.length - 1].id;
            }

            return current;
        };

        const updateActive = () => {
            const id = currentSectionId();

            if (id !== activeId) {
                activeId = id;
                setActive(id);
            }

            scrollTicking = false;
        };

        const onScroll = () => {
            if (scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(updateActive);
        };

        const refreshLayout = () => {
            cacheSectionTops();
            const id = activeId || currentSectionId();
            if (id) setActive(id, true);
        };

        // Initial measurement after fonts/layout have settled.
        cacheSectionTops();
        activeId = currentSectionId();
        setActive(activeId, true);

        window.addEventListener('scroll', onScroll, { passive: true });

        window.addEventListener('resize', () => {
            window.clearTimeout(layoutTimer);
            layoutTimer = window.setTimeout(refreshLayout, 120);
        }, { passive: true });

        window.addEventListener('load', refreshLayout, { once: true });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                if (!href || !href.startsWith('#') || href.length < 2) return;
                activeId = href.slice(1);
                setActive(activeId);
            });
        });
    }


    /* =========================================================
       SCROLL REVEAL
    ========================================================= */

    const revealItems = $$(".reveal");

    if (revealItems.length) {

        if (
            reducedMotion ||
            !("IntersectionObserver" in window)
        ) {

            revealItems.forEach((item) => {
                item.classList.add("in-view");
            });

        } else {

            const counters = new WeakMap();

            revealItems.forEach((item) => {

                const parent = item.parentElement;

                const current =
                    counters.get(parent) || 0;

                const delay =
                    Math.min(current * 0.07, 0.35);

                item.style.setProperty(
                    "--rd",
                    `${delay}s`
                );

                counters.set(parent, current + 1);

            });


            const revealObserver =
                new IntersectionObserver(
                    (entries, observer) => {

                        entries.forEach((entry) => {

                            if (!entry.isIntersecting) {
                                return;
                            }

                            entry.target.classList.add(
                                "in-view"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        });

                    },
                    {
                        rootMargin:
                            "0px 0px -8% 0px",
                        threshold: 0.08
                    }
                );


            revealItems.forEach((item) => {
                revealObserver.observe(item);
            });
        }
    }


    /* =========================================================
       FLOATING WATER DROPLETS
       Delayed until the browser is idle and disabled on touch devices.
    ========================================================= */

    const particleLayer = $(".particles");

    const isTouchDevice =
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window;

    const createParticles = () => {
        if (!particleLayer || reducedMotion || isTouchDevice) return;

        particleLayer.replaceChildren();

        const count = window.innerWidth < 900 ? 6 : 10;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const particle = document.createElement("span");
            particle.className = "particle";

            const size = Math.random() * 5 + 3;
            const left = Math.random() * 100;
            const duration = Math.random() * 24 + 30;
            const delay = Math.random() * 25;
            const opacity = Math.random() * 0.08 + 0.06;
            const drift = Math.random() * 6 - 3;

            particle.style.cssText =
                `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;` +
                `left:${left.toFixed(2)}%;animation-duration:${duration.toFixed(1)}s;` +
                `animation-delay:-${delay.toFixed(1)}s;`;

            particle.style.setProperty("--p-opacity", opacity.toFixed(2));
            particle.style.setProperty("--p-drift", `${drift.toFixed(2)}vw`);
            fragment.appendChild(particle);
        }

        particleLayer.appendChild(fragment);
    };

    const idleSchedule = window.requestIdleCallback ||
        ((callback) => window.setTimeout(callback, 900));

    if (!reducedMotion && !isTouchDevice) {
        idleSchedule(createParticles, { timeout: 1800 });
    }


    /* =========================================================
       LIQUID HIGHLIGHT
       Pure CSS handles the highlight. No pointermove listeners are used,
       which removes a frequent source of main-thread work while scrolling.
    ========================================================= */



    /* =========================================================
       PREMIUM LIQUID MOUSE POINTER
       One RAF loop, transform-only movement, desktop/fine pointer.
    ========================================================= */

    if (!reducedMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {

        const pointer = document.createElement("div");
        pointer.className = "pointer-visual";
        pointer.setAttribute("aria-hidden", "true");
        pointer.innerHTML = `
            <span class="pointer-ring"></span>
            <span class="pointer-dot"></span>
            <span class="pointer-ripple"></span>
        `;

        document.body.appendChild(pointer);
        document.documentElement.classList.add("has-custom-pointer");

        const ring = pointer.querySelector(".pointer-ring");
        const dot = pointer.querySelector(".pointer-dot");
        const ripple = pointer.querySelector(".pointer-ripple");

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let rafId = 0;
        let pointerActive = false;

        const render = () => {
            // The dot follows the pointer directly.
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;

            // The ring follows with a small, smooth spring-like delay.
            ringX += (mouseX - ringX) * 0.17;
            ringY += (mouseY - ringY) * 0.17;

            ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0)`;
            ripple.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate3d(-50%, -50%, 0)`;

            if (pointerActive) {
                rafId = window.requestAnimationFrame(render);
            } else {
                rafId = 0;
            }
        };

        const wake = () => {
            if (!pointerActive) {
                pointerActive = true;
                pointer.classList.add("visible");
            }

            if (!rafId) {
                rafId = window.requestAnimationFrame(render);
            }
        };

        document.addEventListener("pointermove", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            wake();
        }, { passive: true });

        document.addEventListener("pointerenter", (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
            wake();
        }, { passive: true });

        document.addEventListener("pointerover", (event) => {
            const interactive = event.target.closest(
                "a, button, input, textarea, select, .liquid, .project-card, .skill-card, .experience-card"
            );

            if (interactive) {
                pointer.classList.add("pointer-hover");
            }
        }, { passive: true });

        document.addEventListener("pointerout", (event) => {
            const from = event.target.closest(
                "a, button, input, textarea, select, .liquid, .project-card, .skill-card, .experience-card"
            );

            if (!from) return;

            const to = event.relatedTarget;
            if (to && from.contains(to)) return;

            pointer.classList.remove("pointer-hover");
        }, { passive: true });

        document.addEventListener("pointerdown", () => {
            pointer.classList.add("clicking");

            ripple.classList.remove("play");
            void ripple.offsetWidth;
            ripple.classList.add("play");
        }, { passive: true });

        document.addEventListener("pointerup", () => {
            pointer.classList.remove("clicking");
        }, { passive: true });

        window.addEventListener("blur", () => {
            pointer.classList.remove("visible", "pointer-hover", "clicking");
            pointerActive = false;
            if (rafId) {
                window.cancelAnimationFrame(rafId);
                rafId = 0;
            }
        });
    }


        /* =========================================================
   CONTACT FORM — WEB3FORMS
   Validation + real email submission
========================================================= */

const form = $("#contactForm");
const note = $("#formNote");

if (form && note) {

    const name = $("#name", form);
    const email = $("#email", form);
    const message = $("#message", form);
    const submitButton = $('button[type="submit"]', form);

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const showNote = (messageText, type) => {
        note.textContent = messageText;

        note.classList.remove(
            "success",
            "error"
        );

        note.classList.add(type);
    };

    const clearNote = () => {
        note.textContent = "";

        note.classList.remove(
            "success",
            "error"
        );
    };

    const validateField = (
        field,
        valid
    ) => {
        if (!field) {
            return;
        }

        field.classList.toggle(
            "invalid",
            !valid
        );

        field.setAttribute(
            "aria-invalid",
            String(!valid)
        );
    };

    [name, email, message]
        .filter(Boolean)
        .forEach((field) => {
            field.addEventListener(
                "input",
                () => {
                    field.classList.remove("invalid");
                    field.removeAttribute("aria-invalid");
                    clearNote();
                }
            );
        });

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const nameValue =
                name.value.trim();

            const emailValue =
                email.value.trim();

            const messageValue =
                message.value.trim();

            const nameValid =
                nameValue.length >= 2;

            const emailValid =
                emailPattern.test(emailValue);

            const messageValid =
                messageValue.length >= 10;

            validateField(name, nameValid);
            validateField(email, emailValid);
            validateField(message, messageValid);

            if (
                !nameValid ||
                !emailValid ||
                !messageValid
            ) {
                showNote(
                    "Please fill in all fields correctly.",
                    "error"
                );

                const firstInvalid =
                    [name, email, message]
                        .find(
                            (field) =>
                                field &&
                                field.classList.contains("invalid")
                        );

                if (firstInvalid) {
                    firstInvalid.focus();
                }

                return;
            }

            /*
             * The Access Key is already in index.html:
             * <input type="hidden" name="access_key" value="...">
             *
             * Read it from the form so it is not hard-coded twice.
             */
            const formData = new FormData(form);
            const accessKey = formData.get("access_key");

            if (
                !accessKey ||
                accessKey === "YOUR_ACCESS_KEY_HERE"
            ) {
                showNote(
                    "Please configure the Web3Forms Access Key.",
                    "error"
                );
                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.dataset.originalText =
                    submitButton.textContent;
                submitButton.textContent = "Sending...";
            }

            showNote(
                "Sending your message...",
                "success"
            );

            try {

                formData.set(
                    "subject",
                    "New Portfolio Contact Message"
                );

                formData.set(
                    "from_name",
                    "Ashik Portfolio"
                );

                const response =
                    await fetch(
                        "https://api.web3forms.com/submit",
                        {
                            method: "POST",
                            headers: {
                                "Accept": "application/json"
                            },
                            body: formData
                        }
                    );

                const result =
                    await response.json();

                if (
                    response.ok &&
                    result.success
                ) {

                    showNote(
                        "Message sent successfully! Thank you for contacting me.",
                        "success"
                    );

                    form.reset();

                    [name, email, message]
                        .filter(Boolean)
                        .forEach((field) => {
                            field.classList.remove("invalid");
                            field.removeAttribute("aria-invalid");
                        });

                } else {

                    showNote(
                        result.message ||
                        "Unable to send your message. Please try again.",
                        "error"
                    );
                }

            } catch (error) {

                console.error(
                    "Web3Forms error:",
                    error
                );

                showNote(
                    "Something went wrong. Please check your internet connection and try again.",
                    "error"
                );

            } finally {

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent =
                        submitButton.dataset.originalText ||
                        "Send Message";
                }
            }
        }
    );
}


    /* =====================================================
       ECO SHOP EXCEL — IN-PAGE REPORT VIEWER
       Uses locally generated report-data.js so the viewer works
       on GitHub Pages and when the portfolio is opened locally.
       The original .xlsx file remains available for download.
    ===================================================== */

    const reportOpenButton = $('#openEcoShopReport');
    const reportModal = $('#reportModal');
    const reportCloseButton = $('#closeReportModal');
    const reportTableWrap = $('#reportTableWrap');
    const reportSheetTabs = $('#reportSheetTabs');
    const reportStatus = $('#reportStatus');

    let reportData = Array.isArray(window.ECO_SHOP_REPORT)
        ? window.ECO_SHOP_REPORT
        : [];

    let reportDataPromise = null;
    let activeReportSheet = 0;
    let reportLastFocused = null;

    const setReportStatus = (message) => {
        if (reportStatus) {
            reportStatus.textContent = message;
        }
    };

    const escapeText = (value) => {
        if (value === null || value === undefined) return '';
        return String(value);
    };

    const findHeaderIndex = (rows) => {
        if (!Array.isArray(rows)) return 0;

        const candidates = [
            'TEST ID',
            'BUG ID',
            'MODULE NAME',
            'SL NO'
        ];

        for (let i = 0; i < Math.min(rows.length, 10); i++) {
            const values = Array.isArray(rows[i]) ? rows[i] : [];
            const normalized = values.map(value =>
                escapeText(value).trim().toUpperCase()
            );

            if (candidates.some(candidate => normalized.includes(candidate))) {
                return i;
            }
        }

        return 0;
    };

    const getColumnCount = (rows) => {
        return Math.max(
            1,
            ...rows.map(row => Array.isArray(row) ? row.length : 0)
        );
    };

    const renderMetadata = (rows, headerIndex) => {
        if (!reportTableWrap || headerIndex <= 0) return '';

        const metadataRows = rows.slice(0, headerIndex)
            .filter(row => Array.isArray(row) && row.some(value => escapeText(value).trim() !== ''));

        if (!metadataRows.length) return '';

        const wrapper = document.createElement('div');
        wrapper.className = 'report-metadata';

        metadataRows.forEach(row => {
            const item = document.createElement('div');
            item.className = 'report-metadata-row';

            row.forEach((value, index) => {
                const text = escapeText(value).trim();
                if (!text) return;

                const cell = document.createElement('span');
                cell.textContent = text;
                cell.className = index === 0 ? 'report-meta-primary' : 'report-meta-secondary';
                item.appendChild(cell);
            });

            if (item.children.length) wrapper.appendChild(item);
        });

        return wrapper;
    };

    const renderReportSheet = (sheetIndex) => {
        if (!reportTableWrap || !reportData.length) return;

        const sheet = reportData[sheetIndex];
        if (!sheet || !Array.isArray(sheet.rows)) return;

        activeReportSheet = sheetIndex;

        const rows = sheet.rows;
        if (!rows.length) {
            reportTableWrap.innerHTML = '<div class="report-error"><strong>This sheet is empty.</strong></div>';
            setReportStatus(`${sheet.name} · Empty sheet`);
            return;
        }

        const headerIndex = findHeaderIndex(rows);
        const header = rows[headerIndex] || [];
        const dataRows = rows.slice(headerIndex + 1);
        const columnCount = getColumnCount(rows);

        const container = document.createDocumentFragment();
        const metadata = renderMetadata(rows, headerIndex);
        if (metadata) container.appendChild(metadata);

        const tableOuter = document.createElement('div');
        tableOuter.className = 'report-table-scroll';

        const table = document.createElement('table');
        table.className = 'report-table';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        for (let col = 0; col < columnCount; col++) {
            const th = document.createElement('th');
            th.textContent = escapeText(header[col]);
            headerRow.appendChild(th);
        }

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        dataRows.forEach(row => {
            if (!Array.isArray(row)) return;

            const tr = document.createElement('tr');

            for (let col = 0; col < columnCount; col++) {
                const td = document.createElement('td');
                const value = escapeText(row[col]);
                td.textContent = value;

                const normalized = value.trim().toLowerCase();
                if (normalized === 'pass') {
                    td.classList.add('status-pass');
                } else if (normalized === 'fail') {
                    td.classList.add('status-fail');
                } else if (['new', 'closed', 'open'].includes(normalized)) {
                    td.classList.add('status-other');
                }

                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        tableOuter.appendChild(table);
        container.appendChild(tableOuter);

        reportTableWrap.innerHTML = '';
        reportTableWrap.appendChild(container);

        const visibleRows = dataRows.filter(row =>
            Array.isArray(row) && row.some(value => escapeText(value).trim() !== '')
        ).length;

        setReportStatus(`${sheet.name} · ${visibleRows} rows`);

        $$('.report-sheet-tab', reportSheetTabs || document).forEach((tab, index) => {
            const selected = index === sheetIndex;
            tab.classList.toggle('active', selected);
            tab.setAttribute('aria-selected', String(selected));
        });
    };

    const renderReportTabs = () => {
        if (!reportSheetTabs) return;

        reportSheetTabs.innerHTML = '';

        reportData.forEach((sheet, index) => {
            const tab = document.createElement('button');
            tab.type = 'button';
            tab.className = 'report-sheet-tab';
            tab.textContent = sheet.name.replace(/_/g, ' ');
            tab.setAttribute('aria-selected', String(index === activeReportSheet));

            tab.addEventListener('click', () => {
                renderReportSheet(index);
            });

            reportSheetTabs.appendChild(tab);
        });
    };

    const loadReportData = () => {
        if (reportData.length) return Promise.resolve(reportData);

        if (reportDataPromise) return reportDataPromise;

        reportDataPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-report-data]');

            if (existing) {
                existing.addEventListener('load', () => resolve(window.ECO_SHOP_REPORT || []), { once: true });
                existing.addEventListener('error', reject, { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = 'report-data.js';
            script.dataset.reportData = 'true';
            script.async = true;

            script.onload = () => {
                reportData = Array.isArray(window.ECO_SHOP_REPORT)
                    ? window.ECO_SHOP_REPORT
                    : [];
                resolve(reportData);
            };

            script.onerror = reject;
            document.body.appendChild(script);
        });

        return reportDataPromise;
    };

    const loadReport = async () => {
        if (!reportTableWrap) return;

        if (!reportData.length) {
            reportTableWrap.innerHTML = `
                <div class="report-loading">
                    <span class="report-spinner" aria-hidden="true"></span>
                    Preparing Excel report…
                </div>
            `;

            setReportStatus('Loading report…');

            try {
                await loadReportData();
            } catch (error) {
                reportTableWrap.innerHTML = `
                    <div class="report-error">
                        <strong>Report preview is unavailable.</strong>
                        <p>Please use the Download Excel button below.</p>
                    </div>
                `;
                setReportStatus('Preview unavailable');
                return;
            }
        }

        if (!reportData.length) {
            reportTableWrap.innerHTML = `
                <div class="report-error">
                    <strong>Report preview data is unavailable.</strong>
                    <p>Please use the Download Excel button below.</p>
                </div>
            `;
            setReportStatus('Preview unavailable');
            return;
        }

        renderReportTabs();
        renderReportSheet(activeReportSheet);
    };

    const openReport = () => {
        if (!reportModal) return;

        reportLastFocused = document.activeElement;
        reportModal.classList.add('open');
        reportModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('report-viewer-open');

        loadReport();

        window.setTimeout(() => {
            reportCloseButton?.focus();
        }, 40);
    };

    const closeReport = () => {
        if (!reportModal) return;

        reportModal.classList.remove('open');
        reportModal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('report-viewer-open');

        if (reportLastFocused && typeof reportLastFocused.focus === 'function') {
            reportLastFocused.focus();
        }
    };

    if (reportOpenButton && reportModal) {
        reportOpenButton.addEventListener('click', openReport);
        reportCloseButton?.addEventListener('click', closeReport);

        $$('.report-modal [data-close-report]').forEach(element => {
            element.addEventListener('click', closeReport);
        });

        document.addEventListener('keydown', event => {
            if (
                event.key === 'Escape' &&
                reportModal.classList.contains('open')
            ) {
                closeReport();
            }
        });
    }


})();

