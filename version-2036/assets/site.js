(function () {
  var searchToggle = document.querySelector('.search-toggle');
  var searchForm = document.querySelector('.header-search');
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (searchToggle && searchForm) {
    searchToggle.addEventListener('click', function () {
      searchForm.classList.toggle('open');
      var input = searchForm.querySelector('input');
      if (searchForm.classList.contains('open') && input) {
        input.focus();
      }
    });
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(nextIndex) {
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

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
    var grid = document.querySelector('[data-filter-grid]');
    if (!grid) {
      return;
    }
    var buttons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    buttons.forEach(function (button, buttonIndex) {
      if (buttonIndex === 0) {
        button.classList.add('active');
      }
      button.addEventListener('click', function () {
        var filter = button.getAttribute('data-filter');
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        cards.forEach(function (card) {
          var text = card.textContent || '';
          card.style.display = filter === '全部' || text.indexOf(filter) !== -1 ? '' : 'none';
        });
      });
    });
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-overlay]');
    var stream = player.getAttribute('data-stream');
    var bound = false;

    function bind() {
      if (!video || !stream || bound) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = stream;
      }
      bound = true;
    }

    function play() {
      bind();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });

  var searchData = window.SEARCH_MOVIES || [];
  var searchFormPage = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchType = document.querySelector('[data-search-type]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');
  var searchSubtitle = document.querySelector('[data-search-subtitle]');

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function makeCard(movie) {
    var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a href="./' + escapeHtml(movie.file) + '" class="movie-cover" aria-label="观看' + escapeHtml(movie.title) + '">',
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="play-mark">▶</span>',
      '<span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="movie-info">',
      '<div class="movie-tags">' + tags + '</div>',
      '<h3><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta">',
      '<span>' + escapeHtml(movie.region) + '</span>',
      '<span>' + escapeHtml(movie.year) + '</span>',
      '<span>' + escapeHtml(movie.genre) + '</span>',
      '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function runSearch() {
    if (!searchResults || !searchInput) {
      return;
    }
    var keyword = searchInput.value.trim().toLowerCase();
    var type = searchType ? searchType.value : '全部';
    var results = searchData.filter(function (movie) {
      var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, (movie.tags || []).join(' ')].join(' ').toLowerCase();
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      var typeMatch = type === '全部' || text.indexOf(type.toLowerCase()) !== -1;
      return keywordMatch && typeMatch;
    }).slice(0, 96);

    if (searchTitle) {
      searchTitle.textContent = keyword ? '搜索结果' : '推荐内容';
    }
    if (searchSubtitle) {
      searchSubtitle.textContent = keyword ? '已按关键词筛选片库内容' : '可通过上方搜索框筛选片库';
    }
    if (results.length) {
      searchResults.innerHTML = results.map(makeCard).join('');
    } else {
      searchResults.innerHTML = '<div class="empty-state">暂未找到相关内容</div>';
    }
  }

  if (searchFormPage && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;
    searchFormPage.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState({}, '', url);
    });
    if (searchType) {
      searchType.addEventListener('change', runSearch);
    }
    if (initialQuery) {
      runSearch();
    }
  }
})();
