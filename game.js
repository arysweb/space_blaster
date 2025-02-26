class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.size = GAME_CONFIG.PLAYER.SIZE;
        this.lastFireTime = 0;
    }
    
    update(mouseX, mouseY) {
        // Update rotation to point towards mouse
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.rotation = Math.atan2(dy, dx);
    }
    
    draw(ctx, playerImage) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw player image if available
        if (playerImage && playerImage.complete && playerImage.naturalWidth > 0) {
            const imageSize = this.size * 2; // Make the image a bit larger than the hitbox
            
            // First rotate to make the ship point upward (default orientation)
            // Then rotate based on the player's rotation
            const angle = this.rotation + Math.PI/2; // Add 90 degrees to make it point up
            
            ctx.rotate(angle);
            
            ctx.drawImage(
                playerImage,
                -imageSize / 2, // Center the image
                -imageSize / 2,
                imageSize,
                imageSize
            );
        } else {
            // Fallback: Draw a triangle if image is not available
            ctx.rotate(this.rotation);
            ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
            ctx.beginPath();
            ctx.moveTo(this.size * 1.5, 0); // Tip (elongated)
            ctx.lineTo(-this.size / 2, -this.size / 2); // Bottom left
            ctx.lineTo(-this.size / 2, this.size / 2); // Bottom right
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    canFire() {
        return Date.now() - this.lastFireTime > GAME_CONFIG.PLAYER.FIRE_INTERVAL;
    }
    
    tryFire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = Date.now();
        
        return {
            x: this.x + Math.cos(this.rotation) * this.size,
            y: this.y + Math.sin(this.rotation) * this.size,
            vx: Math.cos(this.rotation) * GAME_CONFIG.PLAYER.BULLET_SPEED,
            vy: Math.sin(this.rotation) * GAME_CONFIG.PLAYER.BULLET_SPEED,
            size: GAME_CONFIG.PLAYER.BULLET_SIZE
        };
    }
    
    fire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = Date.now();
        
        return {
            x: this.x + Math.cos(this.rotation) * this.size,
            y: this.y + Math.sin(this.rotation) * this.size,
            vx: Math.cos(this.rotation) * GAME_CONFIG.PLAYER.BULLET_SPEED,
            vy: Math.sin(this.rotation) * GAME_CONFIG.PLAYER.BULLET_SPEED,
            size: GAME_CONFIG.PLAYER.BULLET_SIZE
        };
    }
}

class Bullet {
    constructor(x, y, vx, vy, size) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx, image) {
        // Check if image is loaded and not broken
        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback: Draw a simple circle if image is not available
            ctx.fillStyle = GAME_CONFIG.COLORS.FOREGROUND;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    isOffScreen(canvasWidth, canvasHeight) {
        return (
            this.x < -this.size ||
            this.x > canvasWidth + this.size ||
            this.y < -this.size ||
            this.y > canvasHeight + this.size
        );
    }
}

class Alien {
    constructor(x, y, type, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.type = type; // 'small' or 'big'
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Set properties based on type
        if (type === 'small') {
            this.size = GAME_CONFIG.ENEMY.SMALL.SIZE;
            this.speed = GAME_CONFIG.ENEMY.SMALL.SPEED;
            this.points = GAME_CONFIG.ENEMY.SMALL.POINTS;
            this.coins = GAME_CONFIG.ENEMY.SMALL.COINS;
        } else {
            this.size = GAME_CONFIG.ENEMY.BIG.SIZE;
            this.speed = GAME_CONFIG.ENEMY.BIG.SPEED;
            this.points = GAME_CONFIG.ENEMY.BIG.POINTS;
            this.coins = GAME_CONFIG.ENEMY.BIG.COINS;
        }
        
        // Calculate direction towards center of screen
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        const dx = centerX - x;
        const dy = centerY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
        
        this.rotation = Math.atan2(dy, dx);
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx, images) {
        const img = this.type === 'small' ? images.small : images.big;
        
        // Check if image is loaded and not broken
        if (img && img.complete && img.naturalWidth > 0) {
            // Draw the image without rotation, just centered at the alien's position
            ctx.drawImage(
                img,
                this.x - this.size/2,
                this.y - this.size/2,
                this.size,
                this.size
            );
        } else {
            // Fallback: Draw a simple shape if image is not available
            ctx.fillStyle = this.type === 'small' ? '#ff5555' : '#ff0000';
            
            // Draw alien shape
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some details
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(this.x - this.size/5, this.y - this.size/5, this.size/10, 0, Math.PI * 2);
            ctx.arc(this.x + this.size/5, this.y - this.size/5, this.size/10, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    isOffScreen() {
        const margin = this.size * 2;
        return (
            this.x < -margin ||
            this.x > this.canvasWidth + margin ||
            this.y < -margin ||
            this.y > this.canvasHeight + margin
        );
    }
    
    static spawn(canvasWidth, canvasHeight, gameStartTime) {
        // Determine spawn position (outside the screen)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch (side) {
            case 0: // top
                x = Math.random() * canvasWidth;
                y = -50;
                break;
            case 1: // right
                x = canvasWidth + 50;
                y = Math.random() * canvasHeight;
                break;
            case 2: // bottom
                x = Math.random() * canvasWidth;
                y = canvasHeight + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * canvasHeight;
                break;
        }
        
        // Determine if it's a big alien (based on time and random chance)
        const isBigAlien = Date.now() - gameStartTime > GAME_CONFIG.ENEMY.BIG_ALIEN_START_TIME && Math.random() < 0.3;
        const type = isBigAlien ? 'big' : 'small';
        
        return new Alien(x, y, type, canvasWidth, canvasHeight);
    }
}

class MysteryBox {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.MYSTERY_BOX.SIZE;
        this.rotation = 0;
        this.scale = 1;
        this.scaleDirection = 1;
        this.points = GAME_CONFIG.MYSTERY_BOX.POINTS;
        this.coins = GAME_CONFIG.MYSTERY_BOX.COINS;
    }
    
    update() {
        // Rotate the box
        this.rotation += GAME_CONFIG.MYSTERY_BOX.ROTATION_SPEED;
        
        // Make the box pulse (scale up and down)
        this.scale += this.scaleDirection * GAME_CONFIG.MYSTERY_BOX.PULSE_SPEED;
        
        // Reverse direction if reaching scale limits
        if (this.scale > 1.2) {
            this.scale = 1.2;
            this.scaleDirection = -1;
        } else if (this.scale < 0.8) {
            this.scale = 0.8;
            this.scaleDirection = 1;
        }
    }
    
    draw(ctx, image) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Check if image is loaded and not broken
        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback: Draw a simple box if image is not available
            ctx.fillStyle = '#ffaa00';
            ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            
            // Draw question mark
            ctx.fillStyle = 'black';
            ctx.font = `${this.size / 2}px 'Press Start 2P'`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', 0, 0);
        }
        
        ctx.restore();
    }
    
    static spawn(canvasWidth, canvasHeight) {
        // Random position within the visible area (with margin)
        const margin = 100;
        const x = margin + Math.random() * (canvasWidth - 2 * margin);
        const y = margin + Math.random() * (canvasHeight - 2 * margin);
        
        return new MysteryBox(x, y);
    }
}

class Cloud {
    constructor(x, y, type, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.size = GAME_CONFIG.BACKGROUND.CLOUD_SIZES[type];
        this.speed = GAME_CONFIG.BACKGROUND.CLOUD_SPEEDS[type];
    }
    
    update() {
        // Move cloud from right to left
        this.x -= this.speed;
    }
    
    draw(ctx, images) {
        const img = images[this.type];
        
        // Set opacity for clouds
        ctx.globalAlpha = 0.3; // 30% opacity
        
        // Check if image is loaded and not broken
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(
                img,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback: Draw a simple cloud shape if image is not available
            ctx.fillStyle = '#aaaaaa';
            
            // Draw cloud shape
            const radius = this.size / 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.arc(this.x + radius, this.y - radius / 2, radius * 0.8, 0, Math.PI * 2);
            ctx.arc(this.x - radius, this.y - radius / 2, radius * 0.8, 0, Math.PI * 2);
            ctx.arc(this.x + radius * 2, this.y, radius * 0.7, 0, Math.PI * 2);
            ctx.arc(this.x - radius * 2, this.y, radius * 0.7, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset opacity
        ctx.globalAlpha = 1.0;
    }
    
    isOffScreen() {
        return this.x < -this.size;
    }
    
    static spawn(canvasWidth, canvasHeight, x = null) {
        // Randomly select cloud type (0: large, 1: medium, 2: small)
        const cloudType = Math.floor(Math.random() * 3);
        const cloudSize = GAME_CONFIG.BACKGROUND.CLOUD_SIZES[cloudType];
        
        // Set initial x position
        let cloudX = x !== null ? x : canvasWidth + cloudSize/2;
        
        // Set random y position
        const cloudY = Math.random() * canvasHeight;
        
        return new Cloud(cloudX, cloudY, cloudType, canvasWidth, canvasHeight);
    }
    
    static checkOverlap(newCloud, existingClouds) {
        const minDistance = GAME_CONFIG.BACKGROUND.MIN_CLOUD_DISTANCE;
        
        for (const cloud of existingClouds) {
            const dx = newCloud.x - cloud.x;
            const dy = newCloud.y - cloud.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                return true; // Overlapping
            }
        }
        
        return false; // Not overlapping
    }
}

class CoinEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.VISUAL.COIN_SIZE;
        this.alpha = 1;
        this.vy = -2; // Move upward
        this.lifeTime = 0;
        this.maxLifeTime = 60; // frames
    }
    
    update() {
        this.y += this.vy;
        this.lifeTime++;
        this.alpha = 1 - (this.lifeTime / this.maxLifeTime);
    }
    
    draw(ctx, image) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Check if image is loaded and not broken
        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                this.x - this.size / 2,
                this.y - this.size / 2,
                this.size,
                this.size
            );
        } else {
            // Fallback: Draw a simple coin if image is not available
            ctx.fillStyle = GAME_CONFIG.COLORS.COIN_COLOR;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some detail
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 3, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    isDead() {
        return this.lifeTime >= this.maxLifeTime;
    }
    
    static createMultiple(x, y, count) {
        const effects = [];
        
        for (let i = 0; i < count; i++) {
            // Add some random offset to make it look more natural
            const offsetX = (Math.random() - 0.5) * 30;
            const offsetY = (Math.random() - 0.5) * 30;
            
            effects.push(new CoinEffect(x + offsetX, y + offsetY));
        }
        
        return effects;
    }
}

class CollisionDetector {
    static checkBulletAlienCollision(bullet, alien) {
        const dx = bullet.x - alien.x;
        const dy = bullet.y - alien.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < alien.size / 2;
    }
    
    static checkBulletMysteryBoxCollision(bullet, mysteryBox) {
        const dx = bullet.x - mysteryBox.x;
        const dy = bullet.y - mysteryBox.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < mysteryBox.size / 2;
    }
    
    static checkPlayerAlienCollision(player, alien) {
        const dx = player.x - alien.x;
        const dy = player.y - alien.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < player.size / 2 + alien.size / 2;
    }
}

class GameUI {
    constructor() {
        this.heartImage = new Image();
        this.heartImage.src = GAME_CONFIG.VISUAL.HEART_IMAGE;
        
        this.coinImage = new Image();
        this.coinImage.src = GAME_CONFIG.VISUAL.COIN_IMAGE;
        
        // Get DOM elements
        this.scoreElement = document.getElementById('score');
        this.coinsElement = document.getElementById('coins');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalCoinsElement = document.getElementById('finalCoins');
        this.restartButtonElement = document.getElementById('restartButton');
    }
    
    updateScore(score) {
        this.scoreElement.innerText = `SCORE: ${score}`;
    }
    
    updateCoins(coins) {
        this.coinsElement.innerText = `COINS: ${coins}`;
    }
    
    updateLives(lives) {
        // Clear previous hearts
        this.livesElement.innerHTML = '';
        
        // Add heart images
        for (let i = 0; i < lives; i++) {
            const heartImg = document.createElement('img');
            heartImg.src = GAME_CONFIG.VISUAL.HEART_IMAGE;
            heartImg.width = GAME_CONFIG.VISUAL.HEART_SIZE;
            heartImg.height = GAME_CONFIG.VISUAL.HEART_SIZE;
            heartImg.style.marginRight = '5px';
            this.livesElement.appendChild(heartImg);
        }
    }
    
    showGameOver(score, coins) {
        this.gameOverElement.style.display = 'flex';
        this.finalScoreElement.innerText = score;
        this.finalCoinsElement.innerText = coins;
    }
    
    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
    
    setupRestartButton(callback) {
        this.restartButtonElement.addEventListener('click', callback);
    }
}

class AssetLoader {
    constructor() {
        // Create placeholder for missing images
        this.placeholderImage = this.createPlaceholderImage();
        
        // Player image
        this.playerImage = new Image();
        this.playerImage.src = GAME_CONFIG.PLAYER.IMAGE;
        this.playerImage.onerror = () => console.warn('Failed to load player image');
        
        // Player projectile image
        this.playerProjectileImage = new Image();
        this.playerProjectileImage.src = GAME_CONFIG.PLAYER.PROJECTILE_IMAGE;
        this.playerProjectileImage.onerror = () => console.warn('Failed to load player projectile image');
        
        // Alien images
        this.alienImages = {
            small: new Image(),
            big: new Image()
        };
        this.alienImages.small.src = GAME_CONFIG.ENEMY.SMALL.IMAGE;
        this.alienImages.small.onerror = () => console.warn('Failed to load small alien image');
        
        this.alienImages.big.src = GAME_CONFIG.ENEMY.BIG.IMAGE;
        this.alienImages.big.onerror = () => console.warn('Failed to load big alien image');
        
        // Mystery box image
        this.mysteryBoxImage = new Image();
        this.mysteryBoxImage.src = GAME_CONFIG.MYSTERY_BOX.IMAGE;
        this.mysteryBoxImage.onerror = () => console.warn('Failed to load mystery box image');
        
        // Coin image
        this.coinImage = new Image();
        this.coinImage.src = GAME_CONFIG.VISUAL.COIN_IMAGE;
        this.coinImage.onerror = () => console.warn('Failed to load coin image');
        
        // Cloud images
        this.cloudImages = [
            new Image(),
            new Image(),
            new Image()
        ];
        
        for (let i = 0; i < this.cloudImages.length; i++) {
            this.cloudImages[i].src = GAME_CONFIG.BACKGROUND.CLOUD_IMAGES[i];
            this.cloudImages[i].onerror = () => console.warn(`Failed to load cloud image ${i+1}`);
        }
    }
    
    createPlaceholderImage() {
        // Create a canvas element to generate a placeholder image
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;
        
        // Draw a simple placeholder pattern
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)'; // Magenta with transparency
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, size, size);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, size);
        ctx.moveTo(size, 0);
        ctx.lineTo(0, size);
        ctx.stroke();
        
        // Create an image from the canvas
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }
    
    getAlienImages() {
        return this.alienImages;
    }
    
    getMysteryBoxImage() {
        return this.mysteryBoxImage.complete && this.mysteryBoxImage.naturalWidth > 0 
            ? this.mysteryBoxImage 
            : this.placeholderImage;
    }
    
    getCoinImage() {
        return this.coinImage.complete && this.coinImage.naturalWidth > 0 
            ? this.coinImage 
            : this.placeholderImage;
    }
    
    getPlayerImage() {
        return this.playerImage.complete && this.playerImage.naturalWidth > 0 
            ? this.playerImage 
            : this.placeholderImage;
    }
    
    getPlayerProjectileImage() {
        return this.playerProjectileImage.complete && this.playerProjectileImage.naturalWidth > 0 
            ? this.playerProjectileImage 
            : this.placeholderImage;
    }
    
    getCloudImages() {
        return this.cloudImages.map(img => 
            img.complete && img.naturalWidth > 0 ? img : this.placeholderImage
        );
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up game state
        this.score = 0;
        this.coins = 0;
        this.lives = GAME_CONFIG.PLAYER.INITIAL_LIVES;
        this.gameOver = false;
        this.gameStartTime = Date.now();
        
        // Initialize empty arrays for game entities
        this.bullets = [];
        this.aliens = [];
        this.mysteryBoxes = [];
        this.clouds = [];
        this.coinEffects = [];
        
        // Create player in center of screen
        this.resizeCanvas();
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Set up UI
        this.ui = new GameUI();
        this.ui.updateScore(this.score);
        this.ui.updateCoins(this.coins);
        this.ui.updateLives(this.lives);
        this.ui.hideGameOver();
        
        // Load assets
        this.assets = new AssetLoader();
        
        // Initialize mouse position to center of screen
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set up initial clouds
        this.setupInitialClouds();
        
        // Start spawners
        this.startAlienSpawner();
        this.startCloudSpawner();
        this.scheduleMysteryBoxSpawn();
        
        // Start game loop
        this.gameLoop();
    }
    
    resetGame() {
        // Reset game state
        this.score = 0;
        this.coins = 0;
        this.lives = GAME_CONFIG.PLAYER.INITIAL_LIVES;
        this.gameOver = false;
        this.aliens = [];
        this.bullets = [];
        this.coinEffects = [];
        this.clouds = [];
        this.mysteryBoxes = [];
        this.gameStartTime = Date.now();
        
        // Reset UI
        this.ui.updateLives(this.lives);
        this.ui.updateScore(this.score);
        this.ui.updateCoins(this.coins);
        this.ui.hideGameOver();
        
        // Create player in center of screen
        this.resizeCanvas();
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        
        // Initialize mouse position to center of screen
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // Set up initial clouds
        this.setupInitialClouds();
        
        // Start spawners
        this.startAlienSpawner();
        this.startCloudSpawner();
        this.scheduleMysteryBoxSpawn();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Keep player in center of screen after resize
        if (this.player) {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height / 2;
        }
    }
    
    setupEventListeners() {
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Handle restart button
        this.ui.setupRestartButton(() => {
            this.resetGame();
        });
    }
    
    tryPlayerShoot() {
        if (this.gameOver || !this.player) return;
        
        const bullet = this.player.tryFire();
        if (bullet) {
            this.bullets.push(new Bullet(
                bullet.x,
                bullet.y,
                bullet.vx,
                bullet.vy,
                bullet.size
            ));
        }
    }
    
    startAlienSpawner() {
        if (this.gameOver) return;
        
        // Spawn an alien
        this.aliens.push(Alien.spawn(this.canvas.width, this.canvas.height, this.gameStartTime));
        
        // Schedule next spawn
        const nextSpawnTime = GAME_CONFIG.ENEMY.SPAWN_INTERVAL * (0.8 + Math.random() * 0.4);
        setTimeout(() => this.startAlienSpawner(), nextSpawnTime);
    }
    
    spawnAlien() {
        if (this.gameOver) return;
        
        const alien = Alien.spawn(
            this.canvas.width,
            this.canvasHeight,
            this.gameStartTime
        );
        
        this.aliens.push(alien);
    }
    
    startCloudSpawner() {
        if (this.gameOver) return;
        
        // Only spawn a new cloud if there are no clouds on screen
        if (this.clouds.length === 0) {
            // Spawn a cloud
            const newCloud = Cloud.spawn(this.canvas.width, this.canvas.height);
            this.clouds.push(newCloud);
        }
        
        // Schedule next spawn check, regardless of whether we spawned a cloud or not
        const nextSpawnTime = 2000; // Check every 2 seconds
        setTimeout(() => this.startCloudSpawner(), nextSpawnTime);
    }
    
    trySpawnCloud() {
        if (this.gameOver) return;
        
        // Only spawn a new cloud if there are no clouds on screen
        if (this.clouds.length === 0) {
            const newCloud = Cloud.spawn(this.canvas.width, this.canvas.height);
            this.clouds.push(newCloud);
        }
    }
    
    scheduleMysteryBoxSpawn() {
        if (this.gameOver) return;
        
        // Add a delay before the first spawn
        setTimeout(() => {
            // Spawn a mystery box
            this.mysteryBoxes.push(MysteryBox.spawn(this.canvas.width, this.canvas.height));
            
            // Schedule next spawn using the configured values
            const minTime = GAME_CONFIG.MYSTERY_BOX.MIN_SPAWN_TIME;
            const maxTime = GAME_CONFIG.MYSTERY_BOX.MAX_SPAWN_TIME;
            const nextSpawnTime = minTime + Math.random() * (maxTime - minTime);
            setTimeout(() => this.scheduleMysteryBoxSpawn(), nextSpawnTime);
        }, GAME_CONFIG.MYSTERY_BOX.INITIAL_SPAWN_DELAY);
    }
    
    spawnMysteryBox() {
        if (this.gameOver) return;
        
        const mysteryBox = MysteryBox.spawn(this.canvas.width, this.canvas.height);
        this.mysteryBoxes.push(mysteryBox);
    }
    
    addCoinEffect(x, y, count) {
        const effects = CoinEffect.createMultiple(x, y, count);
        this.coinEffects.push(...effects);
    }
    
    updateEntities() {
        // Update player
        if (this.player) {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height / 2;
            this.player.update(this.mouseX, this.mouseY);
        }
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            
            // Remove bullets that are off-screen
            if (this.bullets[i].isOffScreen(this.canvas.width, this.canvas.height)) {
                this.bullets.splice(i, 1);
            }
        }
        
        // Update aliens
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            this.aliens[i].update();
            
            // Remove aliens that are off-screen
            if (this.aliens[i].isOffScreen()) {
                this.aliens.splice(i, 1);
            }
        }
        
        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            this.clouds[i].update();
            
            // Remove clouds that are off-screen
            if (this.clouds[i].isOffScreen()) {
                this.clouds.splice(i, 1);
                
                // Spawn a new cloud immediately when one goes off screen
                this.trySpawnCloud();
            }
        }
        
        // Update mystery boxes
        for (const box of this.mysteryBoxes) {
            box.update();
        }
        
        // Update coin effects
        for (let i = this.coinEffects.length - 1; i >= 0; i--) {
            this.coinEffects[i].update();
            
            // Remove coin effects that are done
            if (this.coinEffects[i].isDead()) {
                this.coinEffects.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // Check bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            // Check collision with mystery boxes
            for (let j = this.mysteryBoxes.length - 1; j >= 0; j--) {
                const box = this.mysteryBoxes[j];
                
                if (CollisionDetector.checkBulletMysteryBoxCollision(bullet, box)) {
                    // Add score and coins
                    this.score += box.points;
                    this.coins += box.coins;
                    
                    // Create coin effect
                    this.addCoinEffect(box.x, box.y, box.coins / 5);
                    
                    // Remove mystery box and bullet
                    this.mysteryBoxes.splice(j, 1);
                    this.bullets.splice(i, 1);
                    
                    // Update displays
                    this.ui.updateScore(this.score);
                    this.ui.updateCoins(this.coins);
                    
                    bulletHit = true;
                    break;
                }
            }
            
            // If bullet already hit something, continue to next bullet
            if (bulletHit) continue;
            
            // Check collision with aliens
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];
                
                if (CollisionDetector.checkBulletAlienCollision(bullet, alien)) {
                    // Add score and coins
                    this.score += alien.points;
                    this.coins += alien.coins;
                    
                    // Create coin effect
                    this.addCoinEffect(alien.x, alien.y, alien.coins);
                    
                    // Remove alien and bullet
                    this.aliens.splice(j, 1);
                    this.bullets.splice(i, 1);
                    
                    // Update displays
                    this.ui.updateScore(this.score);
                    this.ui.updateCoins(this.coins);
                    
                    bulletHit = true;
                    break;
                }
            }
        }
        
        // Check alien collisions with player
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            
            if (CollisionDetector.checkPlayerAlienCollision(this.player, alien)) {
                this.loseLife();
                this.aliens.splice(i, 1);
            }
        }
    }
    
    loseLife() {
        this.lives--;
        this.ui.updateLives(this.lives);
        
        if (this.lives <= 0) {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.ui.showGameOver(this.score, this.coins);
    }
    
    drawEntities() {
        // Draw clouds (background)
        for (const cloud of this.clouds) {
            cloud.draw(this.ctx, this.assets.getCloudImages());
        }
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx, this.assets.getPlayerImage());
        }
        
        // Draw bullets
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx, this.assets.getPlayerProjectileImage());
        }
        
        // Draw aliens
        for (const alien of this.aliens) {
            alien.draw(this.ctx, this.assets.getAlienImages());
        }
        
        // Draw mystery boxes
        for (const box of this.mysteryBoxes) {
            box.draw(this.ctx, this.assets.getMysteryBoxImage());
        }
        
        // Draw coin effects
        for (const effect of this.coinEffects) {
            effect.draw(this.ctx, this.assets.getCoinImage());
        }
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update all entities
        this.updateEntities();
        
        // Try to shoot automatically
        this.tryPlayerShoot();
        
        // Check for collisions
        this.checkCollisions();
        
        // Draw all entities
        this.drawEntities();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    setupInitialClouds() {
        // Add just one initial cloud
        const x = Math.random() * this.canvas.width;
        this.clouds.push(Cloud.spawn(this.canvas.width, this.canvas.height, x));
    }
}

// Initialize game when the window loads
window.addEventListener('load', () => {
    new Game();
});
