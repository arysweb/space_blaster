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
        SPAWN_INTERVAL: 700, // Reduced from 1000ms to 700ms for faster spawning
        LARGE: {
            SIZE: 50,
            SPEED: 0.9, // Increased from 0.7 to 1.0
            POINTS: 15,
            COINS: 1,
            HEALTH: 4, // Health points for large aliens
            IMAGE: 'img/aliens/alien_big.png'
        },
        SMALL: {
            SIZE: 50,
            SPEED: 1, // Increased from 0.9 to 1.2
            POINTS: 10,
            COINS: 1,
            HEALTH: 1.5, // Health points for small aliens
            IMAGE: 'img/aliens/alien_small.png'
        },
        SLUG: {
            SIZE: 30, // Smaller than other aliens
            SPEED: 1.2, // Increased from 1.2 to 1.5
            POINTS: 5, // Lower points as it's weaker
            COINS: 1,
            HEALTH: 0.5, // Reduced health so they die with one shot
            IMAGE: 'img/aliens/slug_1.png'
        },
        L3: {
            SIZE: 50,
            SPEED: 1, // Increased from 0.9 to 1.2
            POINTS: 20,
            COINS: 1,
            HEALTH: 5, // Health points for L3 aliens
            IMAGE: 'img/aliens/alien_L3.png'
        },
        L4: {
            SIZE: 50,
            SPEED: 1, // Increased from 0.7 to 1.0
            POINTS: 25,
            COINS: 1,
            HEALTH: 7, // Health points for L4 aliens
            IMAGE: 'img/aliens/alien_L4.png'
        },
        OVERLORD: {
            SIZE: 70, // Larger than other aliens
            SPEED: 1.9, // Increased from 1.5 to 1.8
            POINTS: 50, // Higher points as it's a special alien
            COINS: 1, // More coins as reward
            HEALTH: 30, // Higher health
            IMAGE: 'img/aliens/overloard.png', // Using the provided image path
            SPAWN_INTERVAL: 20000, // Reduced from 25000 to 20000 for more frequent appearances
            WAVE_AMPLITUDE: 100, // Wave movement amplitude
            WAVE_FREQUENCY: 0.2, // Increased from 0.15 to 0.2 for faster wave movement
            MIN_DISTANCE_FROM_PLAYER: 300 // Minimum distance to keep from player
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
        CLOUD_SPEEDS: [0.5, 0.3, 0.2], // Reduced speeds
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
