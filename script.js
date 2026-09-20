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
       DAY / NIGHT THEME
       Remembers the user's preference with localStorage.
    ========================================================= */

    const themeToggle = $("#themeToggle");
    const savedTheme = localStorage.getItem("ashik-theme");
    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

    const applyTheme = (theme) => {
        const dark = theme === "dark";

        document.documentElement.setAttribute(
            "data-theme",
            dark ? "dark" : "light"
        );

        if (themeToggle) {
            themeToggle.setAttribute("aria-pressed", String(dark));
            themeToggle.setAttribute(
                "aria-label",
                dark ? "Switch to day mode" : "Switch to night mode"
            );
            themeToggle.setAttribute(
                "title",
                dark ? "Switch to day mode" : "Switch to night mode"
            );

            const themeLabel = themeToggle.querySelector(".theme-label");
            if (themeLabel) {
                themeLabel.textContent = dark ? "Day" : "Night";
            }
        }
    };

    applyTheme(
        savedTheme === "dark" || savedTheme === "light"
            ? savedTheme
            : (prefersDark ? "dark" : "light")
    );

    const switchTheme = (nextTheme) => {
        localStorage.setItem("ashik-theme", nextTheme);
        applyTheme(nextTheme);
    };

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const nextTheme =
                document.documentElement.getAttribute("data-theme") === "dark"
                    ? "light"
                    : "dark";

            /* Use the native View Transition API when available so the
               entire page cross-fades instead of snapping between themes. */
            if (document.startViewTransition) {
                document.startViewTransition(() => {
                    switchTheme(nextTheme);
                });
            } else {
                switchTheme(nextTheme);
            }
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

    if (header) {
        let ticking = false;

        const updateHeader = () => {
            header.classList.toggle(
                "scrolled",
                window.scrollY > 35
            );

            ticking = false;
        };

        updateHeader();

        window.addEventListener(
            "scroll",
            () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            },
            { passive: true }
        );
    }


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
       ACTIVE NAV LINK — RELIABLE + SMOOTH
       A single indicator slides between links. The active section
       is calculated from the real page position, avoiding the
       IntersectionObserver ratio conflict that could select the
       wrong menu item (for example, Certifications while Contact
       was visible).
    ========================================================= */

    const sections = $$("main section[id]");
    const navLinks = $$(".nav-link");
    const navIndicator = $(".nav-indicator");

    if (sections.length && navLinks.length && navList) {

        const linkById = new Map();

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");

            if (href && href.startsWith("#") && href.length > 1) {
                linkById.set(href.slice(1), link);
            }
        });

        const moveIndicator = (link, immediate = false) => {
            if (!navIndicator || !link) return;

            const left = link.offsetLeft;
            const top = link.offsetTop;

            if (immediate) {
                navIndicator.style.transition = "none";
            }

            navIndicator.style.left = `${left}px`;
            navIndicator.style.top = `${top}px`;
            navIndicator.style.width = `${link.offsetWidth}px`;
            navIndicator.style.height = `${link.offsetHeight}px`;
            navIndicator.style.opacity = "1";

            if (immediate) {
                void navIndicator.offsetWidth;
                navIndicator.style.transition = "";
            }
        };

        const activate = (id, immediate = false) => {
            navLinks.forEach((link) => {
                const isActive = link.getAttribute("href") === `#${id}`;

                link.classList.toggle("active", isActive);

                if (isActive) {
                    link.setAttribute("aria-current", "page");
                } else {
                    link.removeAttribute("aria-current");
                }
            });

            moveIndicator(linkById.get(id), immediate);
        };

        let activeId = null;
        let ticking = false;

        const getActiveId = () => {
            const headerHeight = header ? header.offsetHeight : 0;

            // Reading line: just below the sticky navbar.
            const marker = window.scrollY + headerHeight + Math.min(150, window.innerHeight * 0.20);

            let currentId = sections[0].id;

            for (const section of sections) {
                const top = section.getBoundingClientRect().top + window.scrollY;

                if (top <= marker) {
                    currentId = section.id;
                } else {
                    break;
                }
            }

            // Always select the last section at the bottom of the page.
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

            if (window.scrollY >= maxScroll - 10) {
                currentId = sections[sections.length - 1].id;
            }

            return currentId;
        };

        const updateActiveNav = () => {
            const currentId = getActiveId();

            if (currentId !== activeId) {
                activeId = currentId;
                activate(currentId);
            } else {
                moveIndicator(linkById.get(currentId));
            }

            ticking = false;
        };

        const requestActiveUpdate = () => {
            if (ticking) return;

            ticking = true;
            window.requestAnimationFrame(updateActiveNav);
        };

        // Correct initial state.
        activeId = getActiveId();
        activate(activeId, true);

        window.addEventListener("scroll", requestActiveUpdate, { passive: true });
        window.addEventListener("resize", requestActiveUpdate, { passive: true });

        // Set the selected item immediately when clicked. The scroll
        // handler then keeps it synchronized while smooth scrolling runs.
        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                const href = link.getAttribute("href");
                if (!href || !href.startsWith("#") || href.length < 2) return;

                activeId = href.slice(1);
                activate(activeId);
            });
        });

        window.addEventListener("hashchange", requestActiveUpdate);
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
    ========================================================= */

    const particleLayer = $(".particles");

    const createParticles = () => {

        if (!particleLayer || reducedMotion) {
            return;
        }

        particleLayer.innerHTML = "";

        const count =
            window.innerWidth < 700
                ? 9
                : 16;

        const fragment =
            document.createDocumentFragment();

        for (let i = 0; i < count; i++) {

            const particle =
                document.createElement("span");

            particle.className = "particle";

            const size =
                Math.random() * 6 + 3;

            const left =
                Math.random() * 100;

            const duration =
                Math.random() * 24 + 26;

            const delay =
                Math.random() * 20;

            const opacity =
                Math.random() * 0.12 + 0.08;

            const drift =
                Math.random() * 8 - 4;

            particle.style.width =
                `${size.toFixed(1)}px`;

            particle.style.height =
                `${size.toFixed(1)}px`;

            particle.style.left =
                `${left.toFixed(2)}%`;

            particle.style.animationDuration =
                `${duration.toFixed(1)}s`;

            particle.style.animationDelay =
                `-${delay.toFixed(1)}s`;

            particle.style.setProperty(
                "--p-opacity",
                opacity.toFixed(2)
            );

            particle.style.setProperty(
                "--p-drift",
                `${drift.toFixed(2)}vw`
            );

            fragment.appendChild(particle);
        }

        particleLayer.appendChild(fragment);
    };

    createParticles();


    let mobileState = window.innerWidth < 700;
    let resizeTimer;

    window.addEventListener("resize", () => {

        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {

            const nextMobile =
                window.innerWidth < 700;

            if (nextMobile !== mobileState) {
                mobileState = nextMobile;
                createParticles();
            }

        }, 250);

    });


    /* =========================================================
       LIQUID HIGHLIGHT
       Smooth cursor-following water reflection.
    ========================================================= */

    if (!reducedMotion) {

        const liquidItems = $$(".liquid");

        liquidItems.forEach((element) => {

            let frame = null;

            const updatePosition = (event) => {

                if (frame) {
                    return;
                }

                frame = window.requestAnimationFrame(() => {

                    const rect =
                        element.getBoundingClientRect();

                    const x =
                        ((event.clientX - rect.left) /
                            rect.width) *
                        100;

                    const y =
                        ((event.clientY - rect.top) /
                            rect.height) *
                        100;

                    element.style.setProperty(
                        "--mx",
                        `${Math.max(0, Math.min(100, x))}%`
                    );

                    element.style.setProperty(
                        "--my",
                        `${Math.max(0, Math.min(100, y))}%`
                    );

                    frame = null;
                });
            };


            element.addEventListener(
                "pointermove",
                updatePosition,
                { passive: true }
            );


            element.addEventListener(
                "pointerenter",
                updatePosition,
                { passive: true }
            );

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


})();
