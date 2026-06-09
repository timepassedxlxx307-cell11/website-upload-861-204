
(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
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
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function textOf(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-tags') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-type') || ''
    ].join(' ').toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var container = scope.parentElement || document;
      var input = scope.querySelector('[data-filter-input]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card-wrap'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card-wrap'));
      }
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        cards.forEach(function (card) {
          var text = textOf(card);
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
          card.hidden = !(matchQuery && matchType && matchYear);
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      if (type) {
        type.addEventListener('change', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
    });
  }

  function setupYear() {
    var targets = document.querySelectorAll('[data-current-year]');
    var value = String(new Date().getFullYear());
    targets.forEach(function (target) {
      target.textContent = value;
    });
  }

  window.initMoviePlayer = function (id, streamUrl) {
    var video = document.getElementById(id);
    if (!video || !streamUrl) {
      return;
    }
    var shell = video.closest('[data-player-shell]');
    var playButton = shell ? shell.querySelector('[data-play-button]') : null;
    var message = shell ? shell.querySelector('[data-player-message]') : null;
    var hls = null;
    function showMessage(text) {
      if (message) {
        message.textContent = text;
        message.hidden = false;
      }
    }
    function hideOverlay() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }
    function showOverlay() {
      if (playButton && video.paused && !video.ended) {
        playButton.classList.remove('is-hidden');
      }
    }
    function attach() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放暂时不可用');
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        showMessage('播放暂时不可用');
      }
    }
    function play() {
      hideOverlay();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showOverlay();
        });
      }
    }
    attach();
    if (playButton) {
      playButton.addEventListener('click', play);
    }
    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', showOverlay);
    video.addEventListener('ended', showOverlay);
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupYear();
  });
})();
