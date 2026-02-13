class AudioManager {
    constructor() {
        this.context = null;
        this.bgmNode = null;
        this.bgmGain = null;
        this.sfxBuffers = {};
        this.loopNodes = {}; // Track looping nodes: { name: { source, gain } }
        this.isMuted = false;
        this.masterVolume = 1.0; // Increased from 0.5 to 1.0 for better audibility

        // Assets to load
        this.assets = {
            bgm: 'audio/bgm.wav',
            eat: 'audio/eat.wav',
            slice: 'audio/slice.wav',
            fire: 'audio/fire.wav',
            game_over: 'audio/game_over.wav',
            count: 'audio/count.wav',
            start: 'audio/start.wav',
            machine_gun: 'audio/machine_gun.wav',
            clean: 'audio/clean.wav',
            milestone: 'audio/milestone.wav',
            combo: 'audio/combo.wav',
            retry: 'audio/retry.wav',
            lemon: 'audio/lemom.wav' // User specified lemom.wav for lemon effect
        };

        this.init();
    }

    init() {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
            this.loadAllAssets();
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }

    async loadAllAssets() {
        // Use Base64 Assets if available (Bypasses CORS)
        if (window.AUDIO_ASSETS) {
            console.log('[AudioManager] Loading from Base64 Assets...');
            const promises = Object.entries(this.assets).map(async ([key, originalPath]) => {
                // Determine filename purely from the original path string (e.g. 'audio/bgm.wav' -> 'bgm.wav')
                const filename = originalPath.split('/').pop();
                const base64URI = window.AUDIO_ASSETS[filename];

                if (base64URI) {
                    try {
                        const response = await fetch(base64URI);
                        const arrayBuffer = await response.arrayBuffer();
                        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                        if (key === 'bgm') this.bgmBuffer = audioBuffer;
                        else this.sfxBuffers[key] = audioBuffer;
                        // console.log(`[Audio] Loaded ${key}`);
                    } catch (e) {
                        console.error(`[Audio] Failed to decode ${key}:`, e);
                    }
                } else {
                    console.warn(`[Audio] Missing Base64 for ${filename}`);
                }
            });
            await Promise.all(promises);
            console.log('[AudioManager] All Base64 assets loaded.');
            return;
        }

        const promises = Object.entries(this.assets).map(async ([name, url]) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                if (name === 'bgm') {
                    this.bgmBuffer = audioBuffer;
                } else {
                    this.sfxBuffers[name] = audioBuffer;
                }
            } catch (e) {
                console.error(`Failed to load audio: ${name}`, e);
            }
        });
        await Promise.all(promises);
        console.log('Audio assets loaded via Fetch:', Object.keys(this.sfxBuffers));
    }

    playBGM() {
        if (this.isMuted) {
            console.log('[Audio] BGM is muted');
            return;
        }
        if (!this.bgmBuffer) {
            console.warn('[Audio] BGM buffer not loaded yet');
            return;
        }
        if (this.bgmNode) {
            console.log('[Audio] BGM already playing');
            return;
        }

        console.log('[Audio] Starting BGM...');
        this.bgmNode = this.context.createBufferSource();
        this.bgmNode = this.context.createBufferSource();
        this.bgmNode.buffer = this.bgmBuffer;
        this.bgmNode.loop = true;
        this.bgmNode.loop = true;

        this.bgmGain = this.context.createGain();
        this.bgmGain.gain.value = this.masterVolume * 0.5; // BGM at 50% of master

        this.bgmNode.connect(this.bgmGain);
        this.bgmGain.connect(this.context.destination);
        this.bgmNode.start(0);
        console.log('[Audio] BGM Started');
    }

    stopBGM() {
        if (this.bgmNode) {
            this.bgmNode.stop();
            this.bgmNode = null;
        }
    }

    getDebugInfo() {
        const loaded = Object.keys(this.sfxBuffers).length + (this.bgmBuffer ? 1 : 0);
        const total = Object.keys(this.assets).length;
        const vol = Math.round(this.masterVolume * 100);
        return `Vol: ${vol}% | Assets: ${loaded}/${total}`;
    }

    /**
     * Play a one-shot sound effect
     * @param {string} name 
     * @param {object} options { rate: 1.0, volume: 1.0 }
     */
    playSFX(name, options = {}) {
        if (!this.context) return; // Safety check
        if (this.isMuted || !this.sfxBuffers[name]) return;

        // Resume context if suspended (browser policy)
        if (this.context.state === 'suspended') {
            this.context.resume().catch(e => console.warn("[Audio] Auto-resume failed:", e));
        }

        const source = this.context.createBufferSource();
        source.buffer = this.sfxBuffers[name];

        // Pitch/Speed control
        if (options.rate) {
            source.playbackRate.value = options.rate;
        }

        const gainNode = this.context.createGain();
        const vol = options.volume !== undefined ? options.volume : 1.0;
        gainNode.gain.value = this.masterVolume * vol;

        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        source.start(0);
    }

    playLoop(name) {
        if (this.isMuted || !this.sfxBuffers[name]) return;
        if (this.loopNodes[name]) return; // Already looping

        if (this.context.state === 'suspended') {
            this.context.resume();
        }

        const source = this.context.createBufferSource();
        source.buffer = this.sfxBuffers[name];
        source.loop = true;

        const gainNode = this.context.createGain();
        gainNode.gain.value = this.masterVolume;

        source.connect(gainNode);
        gainNode.connect(this.context.destination);
        source.start(0);

        this.loopNodes[name] = { source, gain: gainNode };
    }

    stopLoop(name) {
        if (this.loopNodes[name]) {
            try {
                this.loopNodes[name].source.stop();
            } catch (e) { /* ignore if already stopped */ }
            delete this.loopNodes[name];
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopBGM();
            Object.keys(this.loopNodes).forEach(name => this.stopLoop(name));
            if (this.context) this.context.suspend();
        } else {
            if (this.context) this.context.resume();
            this.playBGM();
        }
    }
}
