export function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var status = document.getElementById(options.statusId);
    var source = options.source;
    if (!video || !source) {
        return;
    }
    var hlsInstance = null;

    function setStatus(text) {
        if (status) {
            status.textContent = text || "";
        }
    }

    function attachSource() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    setStatus("播放暂时不可用，请稍后再试");
                }
            });
            return;
        }
        video.src = source;
    }

    function start() {
        if (overlay) {
            overlay.classList.add("hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("hidden");
                }
                setStatus("点击画面继续播放");
            });
        }
    }

    attachSource();
    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("hidden");
        }
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            if (overlay) {
                overlay.classList.remove("hidden");
            }
        }
    });
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
    if (overlay) {
        overlay.addEventListener("click", start);
    }
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
