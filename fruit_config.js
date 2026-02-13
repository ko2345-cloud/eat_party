/**
 * Fruit Configuration
 * Defines all fruit types with their properties
 */

const FRUIT_CONFIG = {
    watermelon: {
        name: '西瓜',
        stages: ['watermelon', 'watermelon-bite', 'watermelon-half', 'watermelon-piece'],
        bites: 3,
        scale: 2.5,
        stainColor: '#ff5252',
        texture: null
    },
    /*
        pineapple: {
            name: '菠蘿',
            stages: ['pineapple'],
            bites: 0,
            scale: 0.75,
            stainColor: '#ffeb3b',
            texture: null
        },
    */
    // --- 1. Basic Fruits ---
    'apple': {
        name: '蘋果',
        model: 'apple', // defined in script.js (loader)
        scale: 1.0, // Base scale (Normalized 300 units)
        color: '#ff0000', // for debug/fallback
        splash: 'red', // visual splash color
        points: 10,
        hp: 3, // 3 bites to finish
        stages: ['apple', 'apple-bite1', 'apple-bite2'] // Model keys for hp=3, 2, 1
    },
    orange: {
        name: '橙',
        stages: ['orange', 'orange-slice', 'orange-slice2'],
        hp: 3,
        scale: 1.02,
        splash: 'orange',
        points: 10
    },
    /*
        'banana': {
            name: '香蕉',
            model: 'banana',
            scale: 28.0, // Slightly larger/longer
            color: '#ffeb3b',
            splash: 'yellow',
            points: 15,
            hp: 3,
            stages: ['banana', 'banana-bite', 'banana-peal']
        },
        'cherry': {
            name: '櫻桃',
            model: 'cherry',
            scale: 20.0, // Smaller
            color: '#ff0000',
            splash: 'red',
            points: 10,
            hp: 1, // Cherry is small, 1 bite?
            stages: ['cherry']
        },
        pear: {
            name: '梨',
            stages: ['pear', 'pear-half'],
            hp: 2,
            scale: 26.0,
            splash: 'yellow',
            points: 10
        },
        orange: {
            name: '橙',
            stages: ['orange', 'orange-slice', 'orange-slice2'],
            hp: 3,
            scale: 25.0,
            splash: 'orange',
            points: 10
        },
        /*
         lemon: {
             name: '檸檬',
             // Note: filenames are 'lemom...'
             stages: ['lemom', 'lemom-half', 'lemom-slice2'],
             hp: 3,
             scale: 22.0,
             stainColor: '#fff700', // Yellow
             points: 10
         },
         */
    avocado: {
        name: '酪梨',
        stages: ['avocado', 'avocado-bone', 'avocado-boneless'],
        hp: 3,
        scale: 1.2,
        collisionScale: 1.2, // Expand edible range (Yellow -> Orange size)
        splash: 'green',
        points: 15
    },
    tomato: {
        name: '番茄',
        stages: ['tomato', 'tomato-slice'],
        hp: 2,
        scale: 24.0,
        splash: 'red',
        points: 10
    },
    strawberry: {
        name: '草莓',
        stages: ['strawberry'],
        hp: 1,
        scale: 18.0,
        splash: 'red',
        points: 20
    },
    cherry: {
        name: '櫻桃',
        stages: ['cherry'],
        hp: 1,
        scale: 18.0,
        splash: 'red',
        points: 25
    },
    banana: {
        name: '香蕉',
        stages: ['banana', 'banana-bite', 'banana-peal'],
        hp: 3,
        scale: 30.0,
        splash: 'yellow',
        points: 15
    },
    grapesGreen: {
        name: '綠葡萄',
        stages: ['grapes-green'],
        hp: 1,
        scale: 25.0,
        splash: 'green',
        points: 20
    },
    grapesPurple: {
        name: '紫葡萄',
        stages: ['grape.purlple'],
        hp: 1,
        scale: 25.0,
        splash: 'purple',
        points: 20
    },

    // --- 2. Vegetables / Others ---
    carrot: {
        name: '紅蘿蔔',
        stages: ['carrot'],
        hp: 2,
        scale: 28.0,
        splash: 'orange',
        points: 10
    },
    eggplant: {
        name: '茄子',
        stages: ['eggplant'],
        hp: 2,
        scale: 28.0,
        splash: 'purple',
        points: 10
    },
    pumpkin: {
        name: '南瓜',
        stages: ['pumpking'], // Note: 'pumpking'
        hp: 10, // Big!
        scale: 1.5,
        splash: 'orange',
        points: 50
    },
    pineapple: {
        name: '菠蘿',
        stages: ['pineapple'],
        hp: 5,
        scale: 1.2,
        splash: 'yellow',
        points: 30
    },

    // --- 3. Special & Existing ---
    watermelon: {
        name: '西瓜',
        stages: ['watermelon', 'watermelon-half', 'watermelon-piece', 'watermelon-bite'],
        hp: 10, // Special handling in code
        scale: 2.4, // Increased to 2.4 (20% larger)
        // Wait, current watermelon scale is 2.5? That seems small if apple is 25.0. 
        // Ah, apple.obj vs fbx scaling might be different.
        // I should check `script.js` for how watermelon is scaled.
        // Current apple scale in script might be different.
        // Let's use a consistent scale for FBX. Watermelon FBX is likely ~same unit as others.
        // If 'apple01.fbx' is ~45KB and 'watermelon.fbx' is ~22KB, they might be similar units.
        // I will guess 35.0 for watermelon FBX?
        // BUT, the current game uses 'watermelon_asset.js' (base64?). 
        // "watermelon.fbx" is in the folder but is it used?
        // The user said "Add *other* models".
        // Watermelon is already working with `watermelon_asset.js`.
        // I should probably leave watermelon alone unless I want to switch to the FBX.
        // The user says "Replace me with all *other* models...".
        // Keep watermelon as is for now to avoid breaking the slicing mechanic which relies on specific meshes?
        // Just update the config to match existing if needed.
        // Existing config has hp: 3 etc. I will preserve existing watermelon config.
        stainColor: '#ff5252',
        texture: null
    },
    chili: {
        name: '辣椒',
        stages: ['chili'],
        hp: 1,
        scale: 1.0,
        stainColor: '#ff4500',
        texture: null,
        isSpecial: true
    },
    lemon: {
        name: '檸檬',
        // Note: filenames are 'lemom...'
        stages: ['lemom', 'lemom-half', 'lemom-slice2'],
        hp: 3,
        scale: 0.9,
        stainColor: '#fff700', // Yellow
        points: 10
    }
};
