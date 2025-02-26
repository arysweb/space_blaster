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
        const margin = this.size * 2;
        return (
            this.x < -margin ||
            this.x > canvasWidth + margin ||
            this.y < -margin ||
            this.y > canvasHeight + margin
        );
    }
}

class Alien {
    constructor(x, y, type, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Set properties based on alien type
        if (type === 0) { // Large alien
            this.size = GAME_CONFIG.ENEMY.LARGE.SIZE;
            this.speed = GAME_CONFIG.ENEMY.LARGE.SPEED;
            this.points = GAME_CONFIG.ENEMY.LARGE.POINTS;
            this.coins = GAME_CONFIG.ENEMY.LARGE.COINS;
        } else { // Small alien
            this.size = GAME_CONFIG.ENEMY.SMALL.SIZE;
            this.speed = GAME_CONFIG.ENEMY.SMALL.SPEED;
            this.points = GAME_CONFIG.ENEMY.SMALL.POINTS;
            this.coins = GAME_CONFIG.ENEMY.SMALL.COINS;
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
        // Move alien
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx, image) {
        const img = image;
        
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
            ctx.fillStyle = this.type === 0 ? '#ff0000' : '#ff5555';
            
            // Draw alien shape
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    isOffScreen() {
        // Aliens are never off-screen in this game design
        // They always move towards the player in the center
        return false;
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
        return distance < alien.size / 2 + bullet.size / 2;
    }
    
    static checkPlayerAlienCollision(player, alien) {
        const dx = player.x - alien.x;
        const dy = player.y - alien.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < alien.size / 2 + player.size / 2;
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
        this.placeholderImage = new Image();
        this.placeholderImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
        
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
            0: new Image(),
            1: new Image()
        };
        this.alienImages[0].src = GAME_CONFIG.ENEMY.LARGE.IMAGE;
        this.alienImages[0].onerror = () => console.warn('Failed to load large alien image');
        
        this.alienImages[1].src = GAME_CONFIG.ENEMY.SMALL.IMAGE;
        this.alienImages[1].onerror = () => console.warn('Failed to load small alien image');
        
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
        
        // Mystery box image
        this.mysteryBoxImage = new Image();
        this.mysteryBoxImage.src = GAME_CONFIG.MYSTERY_BOX.IMAGE;
        this.mysteryBoxImage.onerror = () => console.warn('Failed to load mystery box image');
    }
    
    getAlienImage(type) {
        const img = this.alienImages[type];
        
        return img && img.complete && img.naturalWidth > 0 
            ? img 
            : this.placeholderImage;
    }
    
    getAlienImages() {
        return this.alienImages;
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
    
    getCloudImage(type) {
        // Make sure type is a valid index
        const index = Math.min(Math.max(0, type), this.cloudImages.length - 1);
        const img = this.cloudImages[index];
        return img && img.complete && img.naturalWidth > 0 ? img : this.placeholderImage;
    }
    
    getMysteryBoxImage() {
        return this.mysteryBoxImage.complete && this.mysteryBoxImage.naturalWidth > 0 
            ? this.mysteryBoxImage 
            : this.placeholderImage;
    }
}

class Game {
    constructor() {
        // Get canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set up canvas dimensions
        this.setupCanvas();
        
        // Initialize asset loader
        this.assets = new AssetLoader();
        
        // Initialize game state
        this.gameOver = false;
        this.score = 0;
        this.coins = 0;
        this.lives = GAME_CONFIG.PLAYER.INITIAL_LIVES;
        this.gameStartTime = Date.now();
        this.alienSpawnerTimeout = null;
        
        // Initialize empty arrays for game entities
        this.bullets = [];
        this.aliens = [];
        this.coinEffects = [];
        
        // Initialize mystery box manager
        this.mysteryBoxManager = new MysteryBoxManager(this);
        
        // Initialize cloud manager
        this.cloudManager = new CloudManager(this);
        
        // Initialize UI
        this.ui = new GameUI();
        this.ui.updateScore(this.score);
        this.ui.updateCoins(this.coins);
        this.ui.updateLives(this.lives);
        
        // Set up input handling
        this.setupInputHandling();
        
        // Create player in center of screen
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2,
            50
        );
        
        // Initialize mouse position
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // Set up initial clouds
        this.cloudManager.setupInitialClouds();
        
        // Start spawners
        this.startAlienSpawner();
        this.cloudManager.startCloudSpawner();
        this.mysteryBoxManager.scheduleMysteryBoxSpawn();
        
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
        this.mysteryBoxManager.reset();
        this.cloudManager.reset();
        this.gameStartTime = Date.now();
        
        // Reset UI
        this.ui.updateScore(this.score);
        this.ui.updateCoins(this.coins);
        this.ui.updateLives(this.lives);
        this.ui.hideGameOver();
        
        // Create player in center of screen
        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2,
            50
        );
        
        // Initialize mouse position
        this.mouseX = this.canvas.width / 2;
        this.mouseY = this.canvas.height / 2;
        
        // Set up initial clouds
        this.cloudManager.setupInitialClouds();
        
        // Clear any existing spawner timeouts
        if (this.alienSpawnerTimeout) {
            clearTimeout(this.alienSpawnerTimeout);
        }
        
        // Start spawners
        this.startAlienSpawner();
        this.cloudManager.startCloudSpawner();
        this.mysteryBoxManager.scheduleMysteryBoxSpawn();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Keep player in center of screen after resize
        if (this.player) {
            this.player.x = this.canvas.width / 2;
            this.player.y = this.canvas.height / 2;
        }
    }
    
    setupInputHandling() {
        // Track mouse movement
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.setupCanvas());
        
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
        const spawnPosition = this.getRandomSpawnPosition();
        
        // Determine alien type based on game time
        const gameTime = Date.now() - this.gameStartTime;
        let alienType;
        
        if (gameTime > 30000) { // After 30 seconds, both types possible
            alienType = Math.random() < 0.3 ? 0 : 1; // 30% chance for large alien
        } else { // First 30 seconds, only small
            alienType = 1; // Small alien
        }
        
        const alien = new Alien(
            spawnPosition.x,
            spawnPosition.y,
            alienType,
            this.canvas.width,
            this.canvas.height
        );
        
        this.aliens.push(alien);
        
        // Calculate spawn interval based on game time (gets shorter as game progresses)
        let spawnInterval = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        
        // Reduce spawn interval as game progresses (minimum 300ms)
        if (gameTime > 60000) { // After 1 minute
            spawnInterval = Math.max(300, spawnInterval - (gameTime / 60000) * 200);
        }
        
        // Add some randomness to the spawn interval (±20%)
        const nextSpawnTime = spawnInterval * (0.8 + Math.random() * 0.4);
        
        // Schedule next spawn
        this.alienSpawnerTimeout = setTimeout(() => this.startAlienSpawner(), nextSpawnTime);
    }
    
    spawnAlien() {
        if (this.gameOver) return;
        
        const spawnPosition = this.getRandomSpawnPosition();
        const alien = new Alien(
            spawnPosition.x,
            spawnPosition.y,
            1, // Small alien
            this.canvas.width,
            this.canvas.height
        );
        
        this.aliens.push(alien);
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
        
        // Update coin effects
        for (let i = this.coinEffects.length - 1; i >= 0; i--) {
            this.coinEffects[i].update();
            
            // Remove coin effects that are done
            if (this.coinEffects[i].isDead()) {
                this.coinEffects.splice(i, 1);
            }
        }
        
        // Update mystery box manager
        this.mysteryBoxManager.update();
        
        // Update cloud manager
        this.cloudManager.update();
    }
    
    checkCollisions() {
        // Check bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            // Check collision with aliens
            for (let j = this.aliens.length - 1; j >= 0; j--) {
                const alien = this.aliens[j];
                
                if (CollisionDetector.checkBulletAlienCollision(bullet, alien)) {
                    // Add score
                    this.score += alien.points;
                    
                    // Add coins
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
            
            // If bullet already hit something, continue to next bullet
            if (bulletHit) continue;
            
            // Check collision with mystery boxes
            this.mysteryBoxManager.checkCollisions(
                this.bullets, 
                (points) => {
                    this.score += points;
                    this.ui.updateScore(this.score);
                },
                (coins) => {
                    this.coins += coins;
                    this.ui.updateCoins(this.coins);
                },
                (x, y, count) => this.addCoinEffect(x, y, count)
            );
        }
        
        // Check alien collisions with player
        if (!this.gameOver) {
            for (let i = this.aliens.length - 1; i >= 0; i--) {
                const alien = this.aliens[i];
                
                if (CollisionDetector.checkPlayerAlienCollision(this.player, alien)) {
                    // Player hit by alien - lose a life
                    this.lives--;
                    
                    // Update lives display
                    this.ui.updateLives(this.lives);
                    
                    // Remove the alien
                    this.aliens.splice(i, 1);
                    
                    // Check for game over
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        this.ui.showGameOver(this.score, this.coins);
                    }
                    
                    break;
                }
            }
        }
    }
    
    drawEntities() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds (background)
        this.cloudManager.draw(this.ctx, this.assets.getCloudImages());
        
        // Draw bullets
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx, this.assets.getPlayerProjectileImage());
        }
        
        // Draw aliens
        for (const alien of this.aliens) {
            alien.draw(this.ctx, this.assets.getAlienImage(alien.type));
        }
        
        // Draw mystery boxes
        this.mysteryBoxManager.draw(this.ctx, this.assets.getMysteryBoxImage());
        
        // Draw player
        if (this.player) {
            this.player.draw(this.ctx, this.assets.getPlayerImage());
        }
        
        // Draw coin effects
        for (const effect of this.coinEffects) {
            effect.draw(this.ctx, this.assets.getCoinImage());
        }
    }
    
    gameLoop() {
        if (this.gameOver) {
            // Only continue updating UI and handling input
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        // Update player
        this.player.update(this.mouseX, this.mouseY);
        
        // Try to fire automatically
        this.tryPlayerShoot();
        
        // Update aliens
        this.updateAliens();
        
        // Update bullets
        this.updateBullets();
        
        // Update coin effects
        this.updateCoinEffects();
        
        // Update mystery boxes
        this.mysteryBoxManager.update();
        
        // Update clouds
        this.cloudManager.update();
        
        // Check for collisions
        this.checkCollisions();
        
        // Draw all entities
        this.drawEntities();
        
        // Continue game loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    handleMouseMove(event) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }
    
    handleClick() {
        if (this.gameOver) return;
        
        // Create a bullet
        const angle = this.player.rotation;
        const bulletSpeed = GAME_CONFIG.PLAYER.PROJECTILE_SPEED;
        const bulletSize = GAME_CONFIG.PLAYER.PROJECTILE_SIZE;
        
        // Calculate bullet velocity based on player rotation
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;
        
        // Create bullet at player position
        this.bullets.push(new Bullet(
            this.player.x,
            this.player.y,
            vx,
            vy,
            bulletSize
        ));
    }
    
    updateAliens() {
        // Update aliens
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            this.aliens[i].update();
            
            // Remove aliens that are off-screen
            if (this.aliens[i].isOffScreen()) {
                this.aliens.splice(i, 1);
            }
        }
    }
    
    updateBullets() {
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            
            // Remove bullets that are off-screen
            if (this.bullets[i].isOffScreen(this.canvas.width, this.canvas.height)) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateCoinEffects() {
        // Update coin effects
        for (let i = this.coinEffects.length - 1; i >= 0; i--) {
            this.coinEffects[i].update();
            
            // Remove coin effects that are done
            if (this.coinEffects[i].isDead()) {
                this.coinEffects.splice(i, 1);
            }
        }
    }
    
    getRandomSpawnPosition() {
        // Determine spawn position (outside the screen)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch (side) {
            case 0: // top
                x = Math.random() * this.canvas.width;
                y = -50;
                break;
            case 1: // right
                x = this.canvas.width + 50;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.canvas.height;
                break;
        }
        
        return { x, y };
    }
}

// Initialize game when the window loads
window.addEventListener('load', () => {
    new Game();
});
