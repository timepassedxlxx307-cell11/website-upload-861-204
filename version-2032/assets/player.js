(function () {
    function setupMoviePlayer(rootId, source) {
        var root = document.getElementById(rootId);

        if (!root) {
            return;
        }

        var video = root.querySelector('video');
        var cover = root.querySelector('.player-cover');
        var hlsInstance = null;
        var initialized = false;

        if (!video) {
            return;
        }

        function attachSource() {
            if (initialized) {
                return;
            }

            initialized = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            attachSource();

            if (cover) {
                cover.classList.add('hidden');
            }

            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (cover) {
                        cover.classList.remove('hidden');
                    }
                });
            }
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('hidden');
            }
        });

        video.addEventListener('error', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
                initialized = false;
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
