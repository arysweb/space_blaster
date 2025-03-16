// Game configuration
const GAME_CONFIG = {
    // Player settings
    PLAYER: {
        SIZE: 20,
        FIRE_RATE: 300, // Back to 300ms between shots (slower, encourages upgrades)
        PROJECTILE_SPEED: 10,
        PROJECTILE_SIZE: 10,
        PROJECTILE_DAMAGE: 1, // Default damage per projectile
        IMAGE: 'img/player/player.png',
        PROJECTILE_IMAGE: 'img/player_projectile.png',
        CRIT_PROJECTILE_IMAGE: 'img/crit_projectile.png',
        STARTING_LIVES: 3,
        MAX_LIVES: 6
    },
    
    // Enemy settings
    ENEMY: {
        SPAWN_INTERVAL: 1000, // 1 second (was 2 seconds)
        LARGE: {
            SIZE: 50,
            SPEED: 0.8,
            POINTS: 15,
            COINS: 1,
            HEALTH: 3, // Health points for large aliens
            IMAGE: 'img/aliens/alien_big.png'
        },
        SMALL: {
            SIZE: 50,
            SPEED: 1.2,
            POINTS: 10,
            COINS: 1,
            HEALTH: 1, // Health points for small aliens
            IMAGE: 'img/aliens/alien_small.png'
        },
        L3: {
            SIZE: 50,
            SPEED: 1,
            POINTS: 20,
            COINS: 1,
            HEALTH: 3, // Health points for L3 aliens
            IMAGE: 'img/aliens/alien_L3.png'
        },
        L4: {
            SIZE: 50,
            SPEED: 0.8,
            POINTS: 25,
            COINS: 1,
            HEALTH: 4, // Health points for L4 aliens
            IMAGE: 'img/aliens/alien_L4.png'
        }
    },
    
    // Background elements
    BACKGROUND: {
        CLOUD_IMAGES: [
            'img/bg_elements/bg_cloud_1.png',
            'img/bg_elements/bg_cloud_2.png',
            'img/bg_elements/bg_cloud_3.png'
        ],
        CLOUD_SIZES: [500, 450, 400], // Increased sizes
        CLOUD_SPEEDS: [1, 0.7, 0.5],
        CLOUD_SPAWN_INTERVAL: 10000, 
        MIN_CLOUD_DISTANCE: 1000  // Minimum distance between clouds to prevent overlap
    },
    
    // Mystery box settings
    MYSTERY_BOX: {
        SPAWN_INTERVAL: 15000, // 15 seconds
        MIN_SPAWN_INTERVAL: 15000, // 15 seconds
        MAX_SPAWN_INTERVAL: 30000, // 30 seconds
        SIZE: 50,
        POINTS: 0,
        COINS: 5,
        IMAGE: 'img/mystery_box.png',
        ROTATION_SPEED: 0.01,
        PULSE_SPEED: 0.005,
        LIFESPAN: 8000, // 8 seconds
        FADE_SPEED: 0.05,
        EXPLOSION: {
            SIZE_MULTIPLIER: 1.2,
            LIFESPAN: 800, // milliseconds
            TEXT_LIFESPAN: 1500, // milliseconds
            TEXT_SPEED: 0.4,
            TEXT_FONT: 'bold 18px Arial',
            TEXT_COLOR: '#FFFFFF'
        },
        POWERUPS: {
            TYPES: [
                { TYPE: 'damage', TEXT: 'DAMAGE +1', VALUE: 1 },
                { TYPE: 'coins10', TEXT: 'COINS +10', VALUE: 10 },
                { TYPE: 'heart', TEXT: 'HEART +1', VALUE: 1 },
                { TYPE: 'crit', TEXT: 'CRIT +1', VALUE: 0.9 },
                { TYPE: 'firerate', TEXT: 'FIRE RATE +1', VALUE: 1.1 }
            ],
            EXPLOSION_IMAGE: 'img/enemy_defeted.png'
        }
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
