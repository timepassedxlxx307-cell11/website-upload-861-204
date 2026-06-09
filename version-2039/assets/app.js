(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
      var scope = document.querySelector(input.getAttribute('data-search-input')) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-text]'));
      var empty = document.querySelector(input.getAttribute('data-empty-target'));

      function applySearch() {
        var value = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
          var matched = !value || haystack.indexOf(value) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      input.addEventListener('input', applySearch);
      applySearch();
    });

    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.querySelector(button.getAttribute('data-filter-target')) || document;
        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-search-text]'));
        var value = button.getAttribute('data-filter-value') || '';
        var group = button.parentElement ? Array.prototype.slice.call(button.parentElement.querySelectorAll('[data-filter-value]')) : [];
        group.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search-text') || '').toLowerCase();
          card.style.display = !value || haystack.indexOf(value.toLowerCase()) !== -1 ? '' : 'none';
        });
      });
    });
  });
})();
