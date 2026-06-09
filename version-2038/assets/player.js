(function () {
  window.initPlayer = function (mediaUrl) {
    var video = document.getElementById("movie-player");
    var mask = document.getElementById("play-mask");
    var button = document.getElementById("play-button");
    var started = false;
    var hls = null;

    if (!video || !mediaUrl) {
      return;
    }

    function loadMedia() {
      if (started) {
        return Promise.resolve();
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
      } else {
        video.src = mediaUrl;
      }

      video.setAttribute("controls", "controls");
      return video.play().catch(function () {
        return undefined;
      });
    }

    function start() {
      if (mask) {
        mask.classList.add("is-hidden");
      }
      loadMedia();
    }

    if (mask) {
      mask.addEventListener("click", start);
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (!started) {
        start();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };
}());
