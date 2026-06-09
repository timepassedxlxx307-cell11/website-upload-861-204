(function () {
    const navButton = document.querySelector(".mobile-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navButton && navLinks) {
        navButton.addEventListener("click", function () {
            navLinks.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));

    if (slides.length > 1) {
        let current = 0;

        const showSlide = function (index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        window.setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    const filterInput = document.querySelector("[data-filter-input]");
    const typeFilter = document.querySelector("[data-type-filter]");
    const yearFilter = document.querySelector("[data-year-filter]");
    const cards = Array.from(document.querySelectorAll("[data-search-text]"));
    const emptyState = document.querySelector("[data-empty-state]");

    const applyFilters = function () {
        if (!cards.length) {
            return;
        }

        const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
        const selectedType = typeFilter ? typeFilter.value : "";
        const selectedYear = yearFilter ? yearFilter.value : "";
        let visible = 0;

        cards.forEach(function (card) {
            const text = (card.getAttribute("data-search-text") || "").toLowerCase();
            const type = card.getAttribute("data-type") || "";
            const year = card.getAttribute("data-year") || "";
            const matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            const matchedType = !selectedType || type === selectedType;
            const matchedYear = !selectedYear || year === selectedYear;
            const matched = matchedKeyword && matchedType && matchedYear;

            card.style.display = matched ? "" : "none";

            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visible ? "none" : "block";
        }
    };

    if (filterInput) {
        filterInput.addEventListener("input", applyFilters);
    }

    if (typeFilter) {
        typeFilter.addEventListener("change", applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener("change", applyFilters);
    }

    applyFilters();

    const renderSearchPage = function () {
        const box = document.querySelector("[data-global-search]");
        const target = document.querySelector("[data-search-results]");

        if (!box || !target || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const initial = params.get("q") || "";
        box.value = initial;

        const render = function () {
            const keyword = box.value.trim().toLowerCase();
            const pool = window.MOVIE_SEARCH_INDEX;
            const matched = keyword
                ? pool.filter(function (item) {
                    return item.text.toLowerCase().indexOf(keyword) !== -1;
                }).slice(0, 80)
                : pool.slice(0, 36);

            target.innerHTML = matched.map(function (item) {
                return [
                    '<article class="rank-card">',
                    '<a class="rank-cover" href="' + item.link + '"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>',
                    '<div class="rank-number">▶</div>',
                    '<div class="rank-info">',
                    '<h2><a href="' + item.link + '">' + escapeHtml(item.title) + '</a></h2>',
                    '<p>' + escapeHtml(item.description) + '</p>',
                    '<div class="meta-row"><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
                    '</div>',
                    '</article>'
                ].join("");
            }).join("");

            const empty = document.querySelector("[data-search-empty]");
            if (empty) {
                empty.style.display = matched.length ? "none" : "block";
            }
        };

        box.addEventListener("input", render);
        render();
    };

    const escapeHtml = function (value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    };

    renderSearchPage();

    const loadHls = function (callback) {
        if (window.Hls) {
            callback();
            return;
        }

        const existing = document.querySelector('script[data-hls-loader="1"]');

        if (existing) {
            existing.addEventListener("load", callback, { once: true });
            existing.addEventListener("error", callback, { once: true });
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
        script.async = true;
        script.setAttribute("data-hls-loader", "1");
        script.addEventListener("load", callback, { once: true });
        script.addEventListener("error", callback, { once: true });
        document.head.appendChild(script);
    };

    const setupPlayer = function (shell) {
        const video = shell.querySelector("video");
        const button = shell.querySelector(".play-cover");

        if (!video || !button) {
            return;
        }

        const sourceNode = video.querySelector("source");
        const stream = sourceNode ? sourceNode.src : video.currentSrc;
        let ready = false;
        let hlsInstance = null;

        const start = function () {
            shell.classList.add("is-playing");

            const playNow = function () {
                const promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            };

            if (ready) {
                playNow();
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                ready = true;
                playNow();
                return;
            }

            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playNow();
                    });
                    ready = true;
                } else {
                    video.src = stream;
                    ready = true;
                    playNow();
                }
            });
        };

        button.addEventListener("click", start);

        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        video.addEventListener("ended", function () {
            if (hlsInstance && hlsInstance.detachMedia) {
                hlsInstance.detachMedia();
            }
        });
    };

    document.querySelectorAll(".player-shell").forEach(setupPlayer);
})();
