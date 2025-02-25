const GAME_CONFIG = {
    // Player settings
    PLAYER: {
        SIZE: 15,
        FIRE_INTERVAL: 200, // Fire every 200ms
        BULLET_SPEED: 8,
        BULLET_SIZE: 10,
        INITIAL_LIVES: 3,
        PROJECTILE_IMAGE: 'img/player_projectile.png',
        IMAGE: 'img/player/player.png'
    },
    
    // Enemy settings
    ENEMY: {
        SMALL: {
            SIZE: 30,
            SPEED: 1,
            POINTS: 10,
            COINS: 1,
            IMAGE: 'img/aliens/alien_small.png'
        },
        BIG: {
            SIZE: 50,
            SPEED: 0.7,
            POINTS: 25,
            COINS: 2,
            IMAGE: 'img/aliens/alien_big.png'
        },
        SPAWN_INTERVAL: 1000,
        MIN_SPAWN_DISTANCE: 100,
        BIG_ALIEN_START_TIME: 30000  // Start spawning big aliens after 30 seconds
    },
    
    // Background elements
    BACKGROUND: {
        CLOUD_IMAGES: [
            'img/bg_elements/bg_cloud_1.png',
            'img/bg_elements/bg_cloud_2.png',
            'img/bg_elements/bg_cloud_3.png'
        ],
        CLOUD_SIZES: [350, 280, 190],
        CLOUD_SPEEDS: [0.5, 0.3, 0.2],
        CLOUD_SPAWN_INTERVAL: 5000,
        MIN_CLOUD_DISTANCE: 350  // Minimum distance between clouds to prevent overlap
    },
    
    // Mystery box settings
    MYSTERY_BOX: {
        SIZE: 40,
        IMAGE: 'img/mystery_box.png',
        COINS: 30,
        MIN_SPAWN_TIME: 15000, // 15 seconds
        MAX_SPAWN_TIME: 30000, // 30 seconds
        INITIAL_SPAWN_DELAY: 10000, // 10 seconds delay before first spawn
        ROTATION_SPEED: 0.01,
        PULSE_SPEED: 0.005,
        POINTS: 50
    },
    
    // Visual settings
    VISUAL: {
        PIXEL_SIZE: 2,
        HEART_SIZE: 25,
        HEART_SPACING: 35,
        HEART_Y_POSITION: 30,
        HEART_IMAGE: 'img/heart.png',
        COIN_SIZE: 20,
        COIN_IMAGE: 'img/coin.png'
    },
    
    // UI settings
    UI: {
        FONT: '16px "Press Start 2P", monospace',
        MEDIUM_FONT: '20px "Press Start 2P", monospace',
        LARGE_FONT: '32px "Press Start 2P", monospace',
        HEART_SIZE: 25,
        HEART_SPACING: 35,
        HEART_Y_POSITION: 30
    },
    
    // Colors
    COLORS: {
        BACKGROUND: 'black',
        FOREGROUND: 'white',
        HEART_COLOR: '#ff3366',
        COIN_COLOR: '#ffd700'
    }
};
