/**
 * Path Data - 預設路徑數據 v0.5.2
 * 從 path/ 目錄中的18張紅線圖片手動轉譯而來
 * 
 * 座標使用百分比 (0~1)，運行時乘以 canvasWidth/canvasHeight 轉換
 * 
 * 弧線型 (arc): 使用二次貝塞爾曲線 {start, control, end}
 *   - 起點和終點必須遠在螢幕外 (x < -0.30 或 x > 1.30)
 *   - 確保水果（含碰撞圓半徑）完全離開畫面後才消失
 * 環形型 (loop): 使用橢圓參數 {center, radiusX, radiusY}
 * 
 * 速度系統:
 *   - 5種恆定速度: 最慢/慢/一般/快/最快
 *   - 4種變速模式: 遞增(慢→快) 和 遞減(快→慢)
 */

// === 速度檔案 ===
const SPEED_PROFILES = [
    // 恆定速度（durationScale 範圍 1.5 ~ 0.75）
    { name: '最慢', durationScale: 1.50, easing: 'linear' },
    { name: '慢', durationScale: 1.31, easing: 'linear' },
    { name: '一般', durationScale: 1.13, easing: 'linear' },
    { name: '快', durationScale: 0.94, easing: 'linear' },
    { name: '最快', durationScale: 0.75, easing: 'linear' },

    // 遞增速度（每次只提升一級）
    { name: '最慢→慢', durationScale: 1.40, easing: 'ease_in' },
    { name: '慢→一般', durationScale: 1.22, easing: 'ease_in' },
    { name: '一般→快', durationScale: 1.03, easing: 'ease_in' },
    { name: '快→最快', durationScale: 0.84, easing: 'ease_in' },

    // 遞減速度（每次只降低一級）
    { name: '最快→快', durationScale: 0.84, easing: 'ease_out' },
    { name: '快→一般', durationScale: 1.03, easing: 'ease_out' },
    { name: '一般→慢', durationScale: 1.22, easing: 'ease_out' },
    { name: '慢→最慢', durationScale: 1.40, easing: 'ease_out' },
];

// === 反彈移動配置 ===
const BOUNCE_CONFIG = {
    SPEED_MIN: 3.0,           // 最低移動速度 (px/frame)
    SPEED_MAX: 5.5,           // 最高移動速度 (px/frame)
    MAX_BOUNCES: 5,           // 最大反彈次數（第6次碰壁飛出 - User Request）
    MARGIN: 50,               // 碰壁觸發邊距 (px)
    ROUND_SIZE_MIN: 6,        // 每輪最少蘋果數
    ROUND_SIZE_MAX: 12        // 每輪最多蘋果數
};

const PATH_PRESETS = [
    // ============================================================
    // 弧線型路徑 (Arc) — 從螢幕外飛入，完全飛出螢幕後才消失
    // ============================================================

    // --- 圖4: 從左下到右上的大弧線 ---
    {
        name: 'arc_4',
        type: 'arc',
        start: { x: -0.35, y: 1.20 },
        control: { x: 0.45, y: -0.10 },
        end: { x: 1.35, y: -0.20 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖5: 從左下到右上的弧線（較平緩） ---
    {
        name: 'arc_5',
        type: 'arc',
        start: { x: -0.35, y: 1.10 },
        control: { x: 0.45, y: 0.0 },
        end: { x: 1.35, y: -0.15 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖6: 從左下到右側的陡弧線 ---
    {
        name: 'arc_6',
        type: 'arc',
        start: { x: -0.35, y: 1.20 },
        control: { x: 0.35, y: -0.05 },
        end: { x: 1.35, y: -0.15 },
        durationBase: 3500,
        durationRandom: 1000
    },

    // --- 圖7: 陡峭的左到右弧線 ---
    {
        name: 'arc_7',
        type: 'arc',
        start: { x: -0.35, y: 1.20 },
        control: { x: 0.35, y: -0.15 },
        end: { x: 1.35, y: -0.20 },
        durationBase: 3500,
        durationRandom: 1000
    },

    // --- 圖8: 從左下大弧線掃過頂部到右方 ---
    {
        name: 'arc_8',
        type: 'arc',
        start: { x: -0.35, y: 1.20 },
        control: { x: 0.50, y: -0.25 },
        end: { x: 1.35, y: -0.20 },
        durationBase: 4000,
        durationRandom: 1500
    },

    // --- 圖9: 從左下斜到右上的弧線（角度中等） ---
    {
        name: 'arc_9',
        type: 'arc',
        start: { x: -0.35, y: 1.10 },
        control: { x: 0.45, y: 0.05 },
        end: { x: 1.35, y: -0.10 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖10: 從右側大弧線掃到左側 ---
    {
        name: 'arc_10',
        type: 'arc',
        start: { x: 1.35, y: 1.00 },
        control: { x: 0.50, y: -0.20 },
        end: { x: -0.35, y: -0.10 },
        durationBase: 4000,
        durationRandom: 1500
    },

    // --- 圖11: 寬闊橫向弧線（左到右，過底部） ---
    {
        name: 'arc_11',
        type: 'arc',
        start: { x: -0.35, y: 0.50 },
        control: { x: 0.50, y: 0.85 },
        end: { x: 1.35, y: 0.50 },
        durationBase: 4000,
        durationRandom: 1500
    },

    // --- 圖12: 低弧線，從左到右橫穿下方 ---
    {
        name: 'arc_12',
        type: 'arc',
        start: { x: -0.35, y: 0.85 },
        control: { x: 0.50, y: 1.10 },
        end: { x: 1.35, y: 0.80 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖13: 高弧線，從左到右橫穿頂部 ---
    {
        name: 'arc_13',
        type: 'arc',
        start: { x: -0.35, y: 0.35 },
        control: { x: 0.50, y: -0.10 },
        end: { x: 1.35, y: 0.30 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖14: 從左到右，過頂部的寬弧線 ---
    {
        name: 'arc_14',
        type: 'arc',
        start: { x: -0.35, y: 0.40 },
        control: { x: 0.50, y: -0.15 },
        end: { x: 1.35, y: 0.10 },
        durationBase: 3500,
        durationRandom: 1500
    },

    // --- 圖21: 大弧線從右下掃過頂部到左下 ---
    {
        name: 'arc_21',
        type: 'arc',
        start: { x: 1.35, y: 1.20 },
        control: { x: 0.35, y: -0.25 },
        end: { x: -0.35, y: 1.10 },
        durationBase: 4500,
        durationRandom: 1500
    },

    // ============================================================
    // 環形型路徑 (Loop) — 垂直橢圓迴圈
    // 水果從螢幕下方進入，繞一圈後從下方離開
    // ============================================================

    // --- 圖15: 左側的垂直橢圓 ---
    {
        name: 'loop_15',
        type: 'loop',
        center: { x: 0.18, y: 0.50 },
        radiusX: 0.08,
        radiusY: 0.45,
        durationBase: 4000,
        durationRandom: 1000
    },

    // --- 圖16: 偏左的垂直橢圓 ---
    {
        name: 'loop_16',
        type: 'loop',
        center: { x: 0.28, y: 0.50 },
        radiusX: 0.10,
        radiusY: 0.45,
        durationBase: 4000,
        durationRandom: 1000
    },

    // --- 圖17: 中央偏左的垂直橢圓（稍寬）---
    {
        name: 'loop_17',
        type: 'loop',
        center: { x: 0.40, y: 0.48 },
        radiusX: 0.12,
        radiusY: 0.48,
        durationBase: 4000,
        durationRandom: 1000
    },

    // --- 圖18: 中央的垂直橢圓 ---
    {
        name: 'loop_18',
        type: 'loop',
        center: { x: 0.52, y: 0.50 },
        radiusX: 0.10,
        radiusY: 0.45,
        durationBase: 4000,
        durationRandom: 1000
    },

    // --- 圖19: 偏右的垂直橢圓 ---
    {
        name: 'loop_19',
        type: 'loop',
        center: { x: 0.68, y: 0.50 },
        radiusX: 0.10,
        radiusY: 0.48,
        durationBase: 4000,
        durationRandom: 1000
    },

    // --- 圖20: 右側的垂直橢圓（窄） ---
    {
        name: 'loop_20',
        type: 'loop',
        center: { x: 0.82, y: 0.50 },
        radiusX: 0.07,
        radiusY: 0.48,
        durationBase: 4000,
        durationRandom: 1000
    }
];
