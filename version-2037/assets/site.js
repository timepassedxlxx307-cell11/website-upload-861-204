(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var show = function (next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var searchPanel = document.querySelector('[data-search-panel]');
    var searchList = document.querySelector('[data-search-list]');
    if (searchPanel && searchList) {
      var params = new URLSearchParams(window.location.search);
      var qInput = searchPanel.querySelector('input[name="q"]');
      var regionInput = searchPanel.querySelector('select[name="region"]');
      var typeInput = searchPanel.querySelector('select[name="type"]');
      var yearInput = searchPanel.querySelector('select[name="year"]');
      if (qInput) {
        qInput.value = params.get('q') || '';
      }
      var cards = Array.prototype.slice.call(searchList.querySelectorAll('.movie-card'));
      var filter = function () {
        var q = normalize(qInput && qInput.value);
        var region = normalize(regionInput && regionInput.value);
        var type = normalize(typeInput && typeInput.value);
        var year = normalize(yearInput && yearInput.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year')
          ].join(' '));
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (region && normalize(card.getAttribute('data-region')) !== region) {
            visible = false;
          }
          if (type && normalize(card.getAttribute('data-type')) !== type) {
            visible = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            visible = false;
          }
          card.classList.toggle('hidden', !visible);
        });
      };
      searchPanel.addEventListener('input', filter);
      searchPanel.addEventListener('change', filter);
      searchPanel.addEventListener('submit', function (event) {
        event.preventDefault();
        filter();
      });
      filter();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]')).forEach(function (form) {
      var input = form.querySelector('input[type="search"]');
      var select = form.querySelector('select');
      var list = document.querySelector('[data-card-list]');
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
      var apply = function () {
        var q = normalize(input && input.value);
        var year = normalize(select && select.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-region')
          ].join(' '));
          var visible = true;
          if (q && text.indexOf(q) === -1) {
            visible = false;
          }
          if (year && normalize(card.getAttribute('data-year')) !== year) {
            visible = false;
          }
          card.classList.toggle('hidden', !visible);
        });
      };
      form.addEventListener('input', apply);
      form.addEventListener('change', apply);
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    });
  });

  window.bootMoviePlayer = function (streamUrl) {
    ready(function () {
      var player = document.querySelector('[data-player]');
      if (!player) {
        return;
      }
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play]');
      var loaded = false;
      var hlsInstance = null;
      var start = function () {
        if (!video) {
          return;
        }
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
          } else {
            video.src = streamUrl;
          }
          loaded = true;
        }
        player.classList.add('is-playing');
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      };
      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            start();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };
})();
