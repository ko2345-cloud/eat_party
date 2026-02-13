/**
 * Fruit Spawner v0.6.0
 * 使用預設紅線路徑 + 反彈移動模式，輪替生成水果
 * 
 * 輪替系統：每輪 6~12 個蘋果，交替使用軌跡移動和反彈移動
 */

class FruitSpawner {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.spawnInterval = 2500; // Spawn interval in milliseconds
        this.lastSpawnTime = 0;
        this.lastPathIndex = -1; // 追蹤上次使用的路徑，避免連續重複

        // === 輪替系統 ===
        this.roundMode = 'path';   // 'path' 或 'bounce'
        this.roundCount = 0;       // 當前輪已生成的蘋果數
        this.roundSize = this._randomRoundSize(); // 當前輪的蘋果數量目標

        // === 辣椒計時器 ===
        this.chiliTimer = Date.now();
        this.chiliInterval = this._randomChiliInterval();
        this.chiliPending = false; // 下一次生成是否為辣椒
        this.firstSpawn = true; // Force first spawn chili

        // === 西瓜計數器 ===
        this.bounceRoundCounter = 0; // 記錄反彈模式的輪次
        this.watermelonIndex = -1; // 當前輪次西瓜出現的索引 (如果有的話)

        console.log(`[Round] 初始模式: ${this.roundMode}, 本輪數量: ${this.roundSize}`);
        console.log(`[Chili] 下次辣椒在 ${(this.chiliInterval / 1000).toFixed(1)} 秒後`);
    }

    /**
     * 生成隨機輪次大小 (6~12)
     */
    _randomRoundSize() {
        const min = BOUNCE_CONFIG.ROUND_SIZE_MIN;
        const max = BOUNCE_CONFIG.ROUND_SIZE_MAX;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 隨機辣椒間隔 (25~40秒)
     */
    _randomChiliInterval() {
        return 25000 + Math.random() * 15000;
    }

    /**
     * 推進輪次計數，到達上限時切換模式
     */
    _advanceRound() {
        this.roundCount++;
        if (this.roundCount >= this.roundSize) {
            // 切換模式
            const oldMode = this.roundMode;

            // If finishing a bounce round, increment counter
            if (this.roundMode === 'bounce') {
                this.bounceRoundCounter++;
                console.log(`[Round] Bounce Round Finished. Total Bounce Rounds: ${this.bounceRoundCounter}`);
            }

            this.roundMode = this.roundMode === 'path' ? 'bounce' : 'path';
            this.roundCount = 0;
            this.roundSize = this._randomRoundSize();

            // 如果切換到反彈模式，決定這輪是否有西瓜，以及在哪個位置
            if (this.roundMode === 'bounce') {
                // 每兩輪一次 (Round 1, 3, 5...)
                // 檢查 bounceRoundCounter (此時尚未切換完，所以用當前值判斷下一輪?)
                // NO, bounceRoundCounter only increments when FINISHING a bounce round.
                // So now we are STARTING a bounce round. Current counter is accurate for "how many finished so far".
                // If we finished 0, this is the 1st (index 0). Finished 1, this is 2nd (index 1).
                // We want watermelon on index 1, 3, 5... (Counter % 2 !== 0)

                // Requirement: "每一個反彈移動都需要出現西瓜" (User Request)
                // Always spawn watermelon at random index for EVERY bounce round.
                this.watermelonIndex = Math.floor(Math.random() * this.roundSize);
                console.log(`[🍉 Watermelon] 本輪反彈將在第 ${this.watermelonIndex + 1} 個生成西瓜`);
            } else {
                this.watermelonIndex = -1;
            }

            console.log(`[Round] 切換模式: ${oldMode} → ${this.roundMode}, 下一輪數量: ${this.roundSize}`);
        }
    }

    /**
     * Get a random fruit type from config
     * @returns {String} Fruit type key
     */
    getRandomFruitType() {
        // Probabilities: Apple 25%, Lemon 25%, Orange 25%, Avocado 25%
        const rand = Math.random();
        if (rand < 0.25) {
            return 'apple';
        } else if (rand < 0.50) {
            return 'lemon';
        } else if (rand < 0.75) {
            return 'orange';
        } else {
            return 'avocado';
        }
    }

    /**
     * 從 PATH_PRESETS 隨機選取一條路徑，並轉換為像素座標
     * @returns {Object} 路徑數據（像素座標）+ type 字段
     */
    generatePath() {
        // 隨機選取一條路徑（避免連續重複同一條）
        let pathIndex;
        do {
            pathIndex = Math.floor(Math.random() * PATH_PRESETS.length);
        } while (pathIndex === this.lastPathIndex && PATH_PRESETS.length > 1);
        this.lastPathIndex = pathIndex;

        const preset = PATH_PRESETS[pathIndex];
        const w = this.canvasWidth;
        const h = this.canvasHeight;

        // 計算持續時間（基準 + 隨機偏移）
        const baseDuration = preset.durationBase + Math.random() * preset.durationRandom;

        // 隨機選取速度檔案
        const speedProfile = SPEED_PROFILES[Math.floor(Math.random() * SPEED_PROFILES.length)];
        const duration = baseDuration * speedProfile.durationScale;
        const easing = speedProfile.easing;
        const speedName = speedProfile.name;

        if (preset.type === 'arc') {
            // 弧線型：轉換百分比座標為像素座標
            const path = {
                type: 'arc',
                name: preset.name,
                start: { x: preset.start.x * w, y: preset.start.y * h },
                control: { x: preset.control.x * w, y: preset.control.y * h },
                end: { x: preset.end.x * w, y: preset.end.y * h },
                duration: duration,
                easing: easing,
                speedName: speedName
            };

            console.log(`[Path] 弧線 "${preset.name}" 速度:${speedName} 時長:${duration.toFixed(0)}ms`);
            return path;

        } else if (preset.type === 'loop') {
            // 環形型：轉換百分比座標為像素座標
            const path = {
                type: 'loop',
                name: preset.name,
                center: { x: preset.center.x * w, y: preset.center.y * h },
                radiusX: preset.radiusX * w,
                radiusY: preset.radiusY * h,
                duration: duration,
                easing: easing,
                speedName: speedName
            };

            console.log(`[Path] 環形 "${preset.name}" 速度:${speedName} 時長:${duration.toFixed(0)}ms`);
            return path;
        }

        // Fallback: 預設弧線
        console.warn('[Path] 未知路徑類型，使用預設弧線');
        return {
            type: 'arc',
            name: 'fallback',
            start: { x: -100, y: h * 0.8 },
            control: { x: w / 2, y: h * 0.1 },
            end: { x: w + 100, y: h * 0.8 },
            duration: 4000
        };
    }

    /**
     * 生成反彈移動路徑
     * 蘋果從畫面外隨機位置直線飛入，帶有隨機方向
     * @returns {Object} 反彈路徑數據 { type: 'bounce', startX, startY, vx, vy }
     */
    generateBouncePath() {
        const w = this.canvasWidth;
        const h = this.canvasHeight;
        const margin = 80; // 生成位置距離邊沿的距離

        // 隨機選擇入場邊 (0=上, 1=下, 2=左, 3=右)
        const edge = Math.floor(Math.random() * 4);

        let startX, startY;
        let angle; // 入場角度（弧度），指向畫面內部

        switch (edge) {
            case 0: // 從上方進入
                startX = Math.random() * w;
                startY = -margin;
                // 角度範圍：向下偏（PI/6 ~ 5PI/6，即30°~150°方向）
                angle = Math.PI / 6 + Math.random() * (2 * Math.PI / 3);
                break;
            case 1: // 從下方進入
                startX = Math.random() * w;
                startY = h + margin;
                // 角度範圍：向上偏（-5PI/6 ~ -PI/6）
                angle = -(Math.PI / 6 + Math.random() * (2 * Math.PI / 3));
                break;
            case 2: // 從左方進入
                startX = -margin;
                startY = Math.random() * h;
                // 角度範圍：向右偏（-PI/3 ~ PI/3）
                angle = -Math.PI / 3 + Math.random() * (2 * Math.PI / 3);
                break;
            case 3: // 從右方進入
                startX = w + margin;
                startY = Math.random() * h;
                // 角度範圍：向左偏（2PI/3 ~ 4PI/3）
                angle = 2 * Math.PI / 3 + Math.random() * (2 * Math.PI / 3);
                break;
        }

        // 計算速度分量
        const speed = BOUNCE_CONFIG.SPEED_MIN + Math.random() * (BOUNCE_CONFIG.SPEED_MAX - BOUNCE_CONFIG.SPEED_MIN);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const edgeNames = ['上', '下', '左', '右'];
        console.log(`[Bounce] 從${edgeNames[edge]}方進入 速度:${speed.toFixed(1)} 方向:(${vx.toFixed(2)}, ${vy.toFixed(2)})`);

        return {
            type: 'bounce',
            name: `bounce_from_${edgeNames[edge]}`,
            startX: startX,
            startY: startY,
            vx: vx,
            vy: vy,
            speed: speed
        };
    }

    /**
     * Generate spawn parameters for a new fruit
     * 根據當前輪次模式選擇軌跡或反彈
     * @returns {Object} Spawn parameters with path data
     */
    generateSpawnParams(overrideFruitType) {
        // Rotation speed (varied spin)
        const rotationSpeed = (Math.random() - 0.5) * 0.08;

        // Use apple or overridden type
        const fruitType = overrideFruitType || 'apple';

        let startX, startY, path;

        if (this.roundMode === 'bounce') {
            // === 反彈模式 ===
            const bouncePath = this.generateBouncePath();
            startX = bouncePath.startX;
            startY = bouncePath.startY;
            path = bouncePath;
        } else {
            // === 軌跡模式 ===
            path = this.generatePath();

            // 起始位置取決於路徑類型
            if (path.type === 'arc') {
                startX = path.start.x;
                startY = path.start.y;
            } else if (path.type === 'loop') {
                // 環形路徑從底部開始（t=0.5 對應底部）
                startX = path.center.x;
                startY = path.center.y + path.radiusY;
            }
        }

        // 推進輪次計數
        this._advanceRound();

        const params = {
            x: startX,
            y: startY,
            path: path,
            fruitType: fruitType,
            rotationSpeed: rotationSpeed
        };

        console.log(`[FruitSpawner] 模式:${this.roundMode === 'bounce' ? '反彈' : '軌跡'} 生成 ${path.type} 路徑水果 "${path.name}" (${this.roundCount}/${this.roundSize})`);

        return params;
    }

    /**
     * Check if it's time to spawn a new fruit
     * @param {Number} currentTime - Current timestamp
     * @returns {Boolean} True if should spawn
     */
    shouldSpawn(currentTime) {
        // 檢查辣椒計時器
        if (!this.chiliPending && currentTime - this.chiliTimer > this.chiliInterval) {
            this.chiliPending = true;
            console.log('[🌶️ Chili] 辣椒時間到！下一個生成為辣椒');
        }
        return currentTime - this.lastSpawnTime > this.spawnInterval;
    }

    /**
     * Spawn a new fruit
     * @param {Number} currentTime - Current timestamp
     * @returns {Object} Spawn data
     */
    spawn(currentTime) {
        this.lastSpawnTime = currentTime;

        // Force first spawn to be watermelon (User request for testing)
        // Force first spawn to be watermelon (User request for testing)
        /*
        if (this.firstSpawn) {
            this.firstSpawn = false;
            console.log('[FruitSpawner] 首次生成強制為西瓜 (Testing)');
            const params = this.generateSpawnParams('watermelon');
            // Overwrite speed to be very slow for testing
            if (params.path && params.path.vy) params.path.vy *= 0.3; // Slow vertical
            if (params.path && params.path.vx) params.path.vx *= 0.3; // Slow horizontal
            // If strictly gravity based, we might need to adjust throw strength
            // But let's just slow down whatever generated params we got
            params.rotationSpeed *= 0.1;

            // Also force a simple upward path if possible, but modifying generated params is easiest
            // Let's ensure it stays on screen longer

            return { fruitType: 'watermelon', ...params };
        }
        */

        // 如果辣椒待生成，優先生成辣椒
        if (this.chiliPending) {
            this.chiliPending = false;
            this.chiliTimer = currentTime;
            this.chiliInterval = this._randomChiliInterval();
            console.log(`[🌶️ Chili] 生成辣椒！下次在 ${(this.chiliInterval / 1000).toFixed(1)} 秒後`);
            const params = this.generateSpawnParams('chili');
            return { fruitType: 'chili', ...params };
        }

        // === 西瓜生成檢測 ===
        // 在反彈模式中，檢查是否命中預設的索引
        let fruitType = 'apple';
        if (this.roundMode === 'bounce') {
            if (this.roundCount === this.watermelonIndex) {
                fruitType = 'watermelon';
                console.log('[🍉 Spawner] 觸發隨機西瓜生成！');
            } else {
                fruitType = this.getRandomFruitType();
            }
        } else {
            fruitType = this.getRandomFruitType();
        }

        const params = this.generateSpawnParams(fruitType);
        // Ensure fruitType is passed
        params.fruitType = fruitType;

        return params;
    }

    /**
     * Adjust spawn interval for difficulty scaling
     * @param {Number} interval - New interval in milliseconds
     */
    setSpawnInterval(interval) {
        this.spawnInterval = interval;
    }
}

