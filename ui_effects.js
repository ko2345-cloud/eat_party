/**
 * UI Effects Module for Party Eat Game
 * Manages: Score popups, Combo display, Milestone words, Juice splatter
 */

// ============================================================
// Fruit type to splatter color folder mapping
// ============================================================
const FRUIT_SPLATTER_MAP = {
    apple: 'apple',
    watermelon: 'watermelon',
    orange: 'orange',
    pumpkin: 'orange',
    lemon: 'lemon',
    banana: 'banana',
    bananas: 'banana',
    pear: 'pear',
    avocado: 'avocado',
    tomato: 'tomato',
    eggplant: 'eggplant',
    carrot: 'carrot',
    chili: 'watermelon', // Share watermelon splatter per user request
    strawberry: 'strawberry',
    cherry: 'cherry',
    grapesGreen: 'pear',
    grapesPurple: 'grape',
    pineapple: 'pineapple'
};

// ============================================================
// Milestone FX images (English words, excluding juice splatter)
// ============================================================
const MILESTONE_IMAGES = [
    'fx/processed/1.png',                                                      // AMAZING
    'fx/processed/6039654.png',                                                // GREAT
    'fx/processed/nice-design-fluffy-name.png',                                // NICE
    'fx/processed/word-cool-is-top-word-cool_135595-128438.png',               // COOL
    'fx/processed/stock-vector-wonderful-colorful-vector-typography-banner-2159127483.png', // WONDERFUL
    'fx/processed/istockphoto-1306281589-612x612.png'                          // WOW
];

// ============================================================
// Image Preloader
// ============================================================
const UIImageCache = {};

function preloadUIImages() {
    // Preload NUM digits
    for (let i = 0; i <= 9; i++) {
        const img = new Image();
        img.src = `NUM/+_${i}_w.png`;
        UIImageCache[`num_${i}`] = img;
    }
    // Plus icon
    const plusImg = new Image();
    plusImg.src = 'NUM/+_icon.png';
    UIImageCache['num_plus'] = plusImg;

    // Combo images
    const comboWord = new Image();
    comboWord.src = 'combo/ingame_combo_w.png';
    UIImageCache['combo_word'] = comboWord;

    const comboX = new Image();
    comboX.src = 'combo/ingame_combo_x.png';
    UIImageCache['combo_x'] = comboX;

    for (let i = 0; i <= 9; i++) {
        const img = new Image();
        img.src = `combo/ingame_combo_${i}.png`;
        UIImageCache[`combo_${i}`] = img;
    }

    // Milestone images
    MILESTONE_IMAGES.forEach((path, idx) => {
        const img = new Image();
        img.src = path;
        UIImageCache[`milestone_${idx}`] = img;
    });

    // Splatter images (preload all colors)
    // Splatter images (preload all colors)
    Object.values(FRUIT_SPLATTER_MAP).forEach(colorName => {
        for (let i = 0; i < 9; i++) {
            const key = `splatter_${colorName}_${i}`;
            if (!UIImageCache[key]) {
                const img = new Image();
                img.src = `fx/splatter/${colorName}/splatter_${i}.png`;
                img.onerror = () => {
                    // console.warn(`[UIEffects] Missing splatter: ${key}`);
                    UIImageCache[key] = null; // Mark as missing so we can use fallback
                };
                UIImageCache[key] = img;
            }
        }
    });

    console.log('[UIEffects] Preloaded all UI images');
}

// ============================================================
// ScorePopup - Shows +10 with image digits below score
// ============================================================
class ScorePopup {
    constructor(container) {
        this.container = container;
        this.activePopups = [];
        this.MAX_POPUPS = 3;
    }

    show(points) {
        // Remove oldest if at max
        while (this.activePopups.length >= this.MAX_POPUPS) {
            const oldest = this.activePopups.shift();
            if (oldest.el && oldest.el.parentNode) {
                oldest.el.parentNode.removeChild(oldest.el);
            }
        }

        const popup = document.createElement('div');
        popup.className = 'score-popup';

        // Build "+10" from images
        const pointStr = String(points);

        // Plus icon
        const plusImg = document.createElement('img');
        plusImg.src = 'NUM/+_icon.png';
        plusImg.className = 'score-popup-digit';
        popup.appendChild(plusImg);

        // Each digit
        for (const ch of pointStr) {
            const digitImg = document.createElement('img');
            digitImg.src = `NUM/+_${ch}_w.png`;
            digitImg.className = 'score-popup-digit';
            popup.appendChild(digitImg);
        }

        // Stagger position based on active popups
        const offsetY = this.activePopups.length * 32;
        popup.style.top = `${offsetY}px`;

        this.container.appendChild(popup);

        const entry = { el: popup, startTime: Date.now() };
        this.activePopups.push(entry);

        // Trigger animation
        requestAnimationFrame(() => {
            popup.classList.add('score-popup-animate');
        });

        // Remove after 1 second
        setTimeout(() => {
            popup.classList.add('score-popup-fadeout');
            setTimeout(() => {
                if (popup.parentNode) popup.parentNode.removeChild(popup);
                const idx = this.activePopups.indexOf(entry);
                if (idx !== -1) this.activePopups.splice(idx, 1);
            }, 300);
        }, 1000);
    }
}

// ============================================================
// ComboSystem - Tracks consecutive bites within 2 seconds
// ============================================================
class ComboSystem {
    constructor(container) {
        this.container = container;
        this.comboCount = 0;
        this.lastBiteTime = 0;
        this.comboTimeout = 2000; // 2 seconds window
        this.currentDisplay = null;
        this.hideTimer = null;
    }

    registerBite() {
        const now = Date.now();

        if (now - this.lastBiteTime < this.comboTimeout) {
            this.comboCount++;
        } else {
            this.comboCount = 1; // First bite in new sequence
        }

        this.lastBiteTime = now;

        // Show combo only if count >= 2
        if (this.comboCount >= 2) {
            this.showCombo(this.comboCount);

            // Audio with pitch scaling
            // Base pitch 1.0, increase by 0.1 for each combo after 2
            // Cap at 2.0 (or higher if fun)
            let pitch = 1.0 + (this.comboCount - 2) * 0.1;
            if (pitch > 2.5) pitch = 2.5;

            if (window.audioManager) {
                window.audioManager.playSFX('combo', { rate: pitch });
            }
        }
    }

    showCombo(count) {
        // Clear previous display
        this.clearDisplay();

        const comboEl = document.createElement('div');
        comboEl.className = 'combo-display';

        // COMBO word image
        const wordImg = document.createElement('img');
        wordImg.src = 'combo/ingame_combo_w.png';
        wordImg.className = 'combo-word';
        comboEl.appendChild(wordImg);

        // Second row: x + number
        const countRow = document.createElement('div');
        countRow.className = 'combo-count-row';

        const xImg = document.createElement('img');
        xImg.src = 'combo/ingame_combo_x.png';
        xImg.className = 'combo-x';
        countRow.appendChild(xImg);

        // Number digits
        const countStr = String(count);
        for (const ch of countStr) {
            const digitImg = document.createElement('img');
            digitImg.src = `combo/ingame_combo_${ch}.png`;
            digitImg.className = 'combo-digit';
            countRow.appendChild(digitImg);
        }

        comboEl.appendChild(countRow);
        this.container.appendChild(comboEl);
        this.currentDisplay = comboEl;

        // Trigger bounce animation
        requestAnimationFrame(() => {
            comboEl.classList.add('combo-bounce');
        });

        // Auto-hide after 2 seconds (if no new combo)
        if (this.hideTimer) clearTimeout(this.hideTimer);
        this.hideTimer = setTimeout(() => {
            this.clearDisplay();
        }, 2500);
    }

    clearDisplay() {
        if (this.currentDisplay && this.currentDisplay.parentNode) {
            this.currentDisplay.parentNode.removeChild(this.currentDisplay);
        }
        this.currentDisplay = null;
    }
}

// ============================================================
// MilestoneEffect - Shows English word at every 50 points
// ============================================================
class MilestoneEffect {
    constructor(container) {
        this.container = container;
        this.lastMilestone = 0;
    }

    check(score) {
        const currentMilestone = Math.floor(score / 50) * 50;

        if (currentMilestone > this.lastMilestone && currentMilestone > 0) {
            this.lastMilestone = currentMilestone;
            this.showRandomWord();
            if (window.audioManager) {
                window.audioManager.playSFX('milestone');
            }
        }
    }

    showRandomWord() {
        const idx = Math.floor(Math.random() * MILESTONE_IMAGES.length);
        const imgSrc = MILESTONE_IMAGES[idx];

        const el = document.createElement('div');
        el.className = 'milestone-effect';

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'milestone-img';
        el.appendChild(img);

        this.container.appendChild(el);

        // Trigger animation
        requestAnimationFrame(() => {
            el.classList.add('milestone-animate');
        });

        // Remove after 2 seconds
        setTimeout(() => {
            el.classList.add('milestone-fadeout');
            setTimeout(() => {
                if (el.parentNode) el.parentNode.removeChild(el);
            }, 500);
        }, 2000);
    }
}

// ============================================================
// JuiceSplash - Shows juice splatter when biting a fruit
// ============================================================
class JuiceSplash {
    constructor(container) {
        this.container = container;
    }

    show(fruitType, screenX, screenY) {
        const colorFolder = FRUIT_SPLATTER_MAP[fruitType] || 'apple';
        const splatterIdx = Math.floor(Math.random() * 9);
        const imgPath = `fx/splatter/${colorFolder}/splatter_${splatterIdx}.png`;

        console.log(`[JuiceSplash] Showing: ${imgPath} at (${screenX}, ${screenY}), container:`, this.container);

        const el = document.createElement('div');
        el.className = 'juice-splash';

        const img = document.createElement('img');
        img.src = imgPath;
        img.className = 'juice-splash-img';
        img.onerror = () => console.error(`[JuiceSplash] Failed to load: ${imgPath}`);
        el.appendChild(img);

        // Position at fruit location
        el.style.left = `${screenX}px`;
        el.style.top = `${screenY}px`;

        // Random rotation for variety
        const randomAngle = Math.random() * 360;
        el.style.setProperty('--splash-rotation', `${randomAngle}deg`);

        this.container.appendChild(el);

        // Trigger animation
        requestAnimationFrame(() => {
            el.classList.add('juice-splash-animate');
        });

        // Remove after 0.8 seconds
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 800);
    }
}

// ============================================================
// UIEffectsManager - Central manager
// ============================================================
class UIEffectsManager {
    constructor() {
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        // Create UI containers
        this.scorePopupContainer = document.getElementById('score-popup-container');
        this.comboContainer = document.getElementById('combo-container');
        this.milestoneContainer = document.getElementById('milestone-container');
        this.splashContainer = document.getElementById('splash-container');

        // Initialize subsystems
        this.scorePopup = new ScorePopup(this.scorePopupContainer);
        this.combo = new ComboSystem(this.comboContainer);
        this.milestone = new MilestoneEffect(this.milestoneContainer);
        this.juiceSplash = new JuiceSplash(this.splashContainer);

        // Preload images
        preloadUIImages();

        this.initialized = true;
        console.log('[UIEffectsManager] Initialized');
    }

    /**
     * Called when a fruit is bitten
     * @param {number} points - Points scored
     * @param {string} fruitType - Type of fruit (key in FRUIT_CONFIG)
     * @param {number} screenX - Screen X position of the fruit
     * @param {number} screenY - Screen Y position of the fruit
     * @param {number} totalScore - Total score after adding points
     */
    onBite(points, fruitType, screenX, screenY, totalScore) {
        if (!this.initialized) return;

        // 1. Score popup
        this.scorePopup.show(points);

        // 2. Combo
        this.combo.registerBite();

        // 3. Milestone check
        this.milestone.check(totalScore);

        // 4. Juice splatter
        this.juiceSplash.show(fruitType, screenX, screenY);
    }
    /**
     * Get a random splatter image for the fruit type
     * @param {string} fruitType 
     * @returns {HTMLImageElement|null}
     */
    getSplatterImage(fruitType) {
        if (!fruitType) return null;

        // Map fruit type to color folder
        const colorName = FRUIT_SPLATTER_MAP[fruitType] || 'apple'; // default to red/apple

        // Pick random index 0-8
        // To keep it consistent for the same "stain" session, maybe we should store it?
        // But for now random is fine, or we can use a hash of the fruit ID if we want consistency.
        // Actually, script.js calls this every frame in render loop? 
        // NO. script.js should call this ONCE when bite happens and store the image in gameState.
        // OR render loop should use a stored image.
        // Let's just return a random one here.
        const idx = Math.floor(Math.random() * 9);
        const key = `splatter_${colorName}_${idx}`;
        return UIImageCache[key] || null;
    }
}

// Global instance
const uiEffects = new UIEffectsManager();
