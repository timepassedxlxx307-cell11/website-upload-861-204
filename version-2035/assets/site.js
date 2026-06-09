(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMobileMenu() {
        var button = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSearchForms() {
        document.querySelectorAll("[data-search-form]").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                var input = form.querySelector("input[name='q'], input[type='search']");
                if (!input || !input.value.trim()) {
                    event.preventDefault();
                    return;
                }
                input.value = input.value.trim();
            });
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dotsBox = hero.querySelector("[data-hero-dots]");
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            if (dotsBox) {
                dotsBox.querySelectorAll("button").forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (dotsBox) {
            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "切换推荐影片");
                dot.addEventListener("click", function () {
                    setSlide(index);
                    startTimer();
                });
                dotsBox.appendChild(dot);
            });
        }

        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(current - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                setSlide(current + 1);
                startTimer();
            });
        }
        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        setSlide(0);
        startTimer();
    }

    function initLocalFilter() {
        var input = document.querySelector("[data-local-filter]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function createResultCard(item) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.setAttribute("data-title", item.title);
        article.setAttribute("data-category", item.category);
        article.setAttribute("data-year", item.year);
        article.setAttribute("data-tags", [item.genre, item.tags, item.region, item.type].join(" "));
        article.innerHTML = [
            '<a href="' + item.url + '" class="movie-card-link">',
            '<div class="poster-frame">',
            '<img class="poster-image" src="' + item.image + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy" onload="this.classList.add(\'is-loaded\')" onerror="this.classList.add(\'is-missing\')">',
            '<span class="play-chip">播放</span>',
            '</div>',
            '<div class="movie-card-body">',
            '<div class="movie-meta-line"><span>' + item.category + '</span><span>' + item.year + '</span></div>',
            '<h3>' + item.title + '</h3>',
            '<p>' + item.oneLine + '</p>',
            '<div class="tag-row"><span>' + item.region + '</span><span>' + item.genre + '</span></div>',
            '<div class="card-stats"><span>★ ' + item.rating + '</span><span>' + item.views + '热度</span></div>',
            '</div>',
            '</a>'
        ].join("");
        return article;
    }

    function initSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var input = document.querySelector("[data-search-input]");
        if (!results || !summary || !window.VideoIndex) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim();
        if (input) {
            input.value = query;
        }
        if (!query) {
            return;
        }
        var lower = query.toLowerCase();
        var matched = window.VideoIndex.filter(function (item) {
            return [
                item.title,
                item.category,
                item.year,
                item.region,
                item.type,
                item.genre,
                item.tags,
                item.oneLine
            ].join(" ").toLowerCase().indexOf(lower) !== -1;
        });
        results.innerHTML = "";
        matched.slice(0, 120).forEach(function (item) {
            results.appendChild(createResultCard(item));
        });
        summary.textContent = matched.length ? "搜索结果：" + query : "未找到匹配内容";
    }

    function initPlayers() {
        document.querySelectorAll("video[data-hls-src]").forEach(function (video) {
            var src = video.getAttribute("data-hls-src");
            var shell = video.closest(".player-shell");
            var overlay = shell ? shell.querySelector(".player-overlay") : null;
            var initialized = false;

            function attach() {
                if (initialized) {
                    return;
                }
                initialized = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    video.hlsInstance = hls;
                } else if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
                    video.src = src;
                } else {
                    video.src = src;
                }
            }

            function play() {
                attach();
                if (shell) {
                    shell.classList.add("is-playing");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (shell) {
                    shell.classList.add("is-playing");
                }
            });
            video.addEventListener("pause", function () {
                if (shell && video.currentTime === 0) {
                    shell.classList.remove("is-playing");
                }
            });
            attach();
        });
    }

    ready(function () {
        initMobileMenu();
        initSearchForms();
        initHero();
        initLocalFilter();
        initSearchPage();
        initPlayers();
    });
})();
