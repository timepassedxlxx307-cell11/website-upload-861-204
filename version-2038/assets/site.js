document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var slides = Array.from(document.querySelectorAll(".hero-slide"));
  var dots = Array.from(document.querySelectorAll(".hero-dot"));
  var activeIndex = 0;

  function activateHero(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      activateHero(dotIndex);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      activateHero(activeIndex + 1);
    }, 5200);
  }

  var searchInput = document.querySelector("[data-filter-input]");
  var genreSelect = document.querySelector("[data-filter-genre]");
  var yearSelect = document.querySelector("[data-filter-year]");
  var regionSelect = document.querySelector("[data-filter-region]");
  var cards = Array.from(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : "");
    var genre = normalize(genreSelect ? genreSelect.value : "");
    var year = normalize(yearSelect ? yearSelect.value : "");
    var region = normalize(regionSelect ? regionSelect.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var content = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.year,
        card.dataset.region,
        card.dataset.type
      ].join(" "));
      var matched = true;

      if (keyword && content.indexOf(keyword) === -1) {
        matched = false;
      }
      if (genre && normalize(card.dataset.genre).indexOf(genre) === -1) {
        matched = false;
      }
      if (year && normalize(card.dataset.year) !== year) {
        matched = false;
      }
      if (region && normalize(card.dataset.region).indexOf(region) === -1) {
        matched = false;
      }

      card.classList.toggle("hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  [searchInput, genreSelect, yearSelect, regionSelect].forEach(function (element) {
    if (element) {
      element.addEventListener("input", filterCards);
      element.addEventListener("change", filterCards);
    }
  });
});
