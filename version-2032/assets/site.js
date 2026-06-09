(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }

            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    function applyLocalFilters(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var category = scope.querySelector('[data-filter-category]');
        var year = scope.querySelector('[data-filter-year]');
        var count = scope.querySelector('[data-filter-count]') || document.querySelector('[data-filter-count]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        function update() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedCategory = category ? category.value : '';
            var selectedYear = year ? year.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-category') || '',
                    card.getAttribute('data-tags') || '',
                    card.getAttribute('data-year') || ''
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                var okCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
                var okYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var show = okKeyword && okCategory && okYear;

                card.classList.toggle('is-hidden', !show);

                if (show) {
                    visibleCount += 1;
                }
            });

            if (count) {
                count.textContent = visibleCount + ' 部';
            }
        }

        [input, category, year].forEach(function (field) {
            if (field) {
                field.addEventListener('input', update);
                field.addEventListener('change', update);
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(applyLocalFilters);

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var input = searchPage.querySelector('[data-search-input]');
        var categorySelect = searchPage.querySelector('[data-search-category]');
        var results = searchPage.querySelector('[data-search-results]');
        var title = searchPage.querySelector('[data-search-title]');
        var count = searchPage.querySelector('[data-search-count]');

        if (input) {
            input.value = initialQuery;
        }

        function cardTemplate(movie) {
            return [
                '<article class="movie-card">',
                '<a href="' + movie.url + '" aria-label="观看' + escapeHtml(movie.title) + '">',
                '<div class="poster-frame medium">',
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<div class="poster-hover"><span class="play-bubble">▶</span></div>',
                '<span class="rating-badge">★ ' + movie.rating + '</span>',
                '<span class="category-badge">' + escapeHtml(movie.category) + '</span>',
                '</div>',
                '<div class="card-content">',
                '<h3>' + escapeHtml(movie.title) + '</h3>',
                '<p>' + escapeHtml(movie.oneLine || '') + '</p>',
                '<div class="card-meta"><span>' + escapeHtml(movie.region || '') + '</span><span>' + escapeHtml(movie.year || '') + '</span></div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value).replace(/[&<>"']/g, function (char) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[char];
            });
        }

        function render(movies) {
            var query = input ? input.value.trim().toLowerCase() : '';
            var category = categorySelect ? categorySelect.value : '';
            var filtered = movies.filter(function (movie) {
                var text = [movie.title, movie.region, movie.year, movie.category, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ').toLowerCase();
                return (!query || text.indexOf(query) !== -1) && (!category || movie.category === category);
            });

            if (title) {
                title.textContent = query ? '“' + input.value.trim() + '”的搜索结果' : '全部影片';
            }

            if (count) {
                count.textContent = filtered.length + ' 部';
            }

            if (results) {
                results.innerHTML = filtered.slice(0, 300).map(cardTemplate).join('');
            }
        }

        function initializeSearch(movies) {
            render(movies);

            if (input) {
                input.addEventListener('input', function () {
                    render(movies);
                });
            }

            if (categorySelect) {
                categorySelect.addEventListener('change', function () {
                    render(movies);
                });
            }
        }

        if (window.MOVIE_SEARCH_INDEX && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
            initializeSearch(window.MOVIE_SEARCH_INDEX);
        } else {
            fetch('./data/movies.json')
                .then(function (response) {
                    return response.json();
                })
                .then(initializeSearch);
        }
    }
})();
