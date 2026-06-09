(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
            toggle.textContent = open ? "×" : "☰";
        });
    }

    function setupHero() {
        var slider = document.querySelector(".hero-slider");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(current + 1);
        }, 5800);
    }

    function setupFilters() {
        var filterBars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        filterBars.forEach(function (bar) {
            var target = bar.getAttribute("data-filter-bar");
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target="' + target + '"] .movie-card'));
            var buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-btn"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-value");
                    buttons.forEach(function (btn) {
                        btn.classList.toggle("active", btn === button);
                    });
                    cards.forEach(function (card) {
                        var visible = value === "all" || card.getAttribute("data-filter") === value;
                        card.style.display = visible ? "" : "none";
                    });
                });
            });
        });
    }

    function setupLiveSearch() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-live-search]"));
        inputs.forEach(function (input) {
            var target = input.getAttribute("data-live-search");
            var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-target="' + target + '"] .movie-card'));
            input.addEventListener("input", function () {
                var q = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var hay = card.getAttribute("data-search") || "";
                    card.style.display = !q || hay.indexOf(q) !== -1 ? "" : "none";
                });
            });
        });
    }

    function renderSearch() {
        var root = document.querySelector("#search-results");
        if (!root || !window.MOVIE_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        var input = document.querySelector("#search-input");
        var typeSelect = document.querySelector("#search-type");
        var regionSelect = document.querySelector("#search-region");
        var info = document.querySelector("#search-info");
        if (input) {
            input.value = initial;
        }
        function match(item, q, type, region) {
            var text = [item.title, item.desc, item.genre, item.region, item.type, item.tags].join(" ").toLowerCase();
            if (q && text.indexOf(q) === -1) {
                return false;
            }
            if (type && item.type !== type) {
                return false;
            }
            if (region && item.region !== region) {
                return false;
            }
            return true;
        }
        function card(item) {
            return '<article class="movie-card">' +
                '<a class="poster-link" href="./' + item.link + '">' +
                '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
                '<span class="poster-shade"></span><span class="play-mark">▶</span></a>' +
                '<div class="movie-card-body"><div class="movie-meta-row"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>' +
                '<h3><a href="./' + item.link + '">' + item.title + '</a></h3>' +
                '<p>' + item.desc + '</p><div class="card-tags"><span class="tag-pill">' + item.genre + '</span></div></div></article>';
        }
        function update() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var type = typeSelect ? typeSelect.value : "";
            var region = regionSelect ? regionSelect.value : "";
            var results = window.MOVIE_INDEX.filter(function (item) {
                return match(item, q, type, region);
            }).slice(0, 120);
            root.innerHTML = results.length ? results.map(card).join("") : '<div class="no-results">没有找到匹配影片，请换个关键词试试。</div>';
            if (info) {
                info.textContent = q ? '搜索：“' + q + '”' : '输入片名、类型、地区或标签即可检索片库。';
            }
        }
        [input, typeSelect, regionSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", update);
                node.addEventListener("change", update);
            }
        });
        update();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupLiveSearch();
        renderSearch();
    });
})();
