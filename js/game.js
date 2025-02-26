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
        return AlienCollisionDetector.checkBulletAlienCollision(bullet, alien);
    }
    
    static checkPlayerAlienCollision(player, alien) {
        return AlienCollisionDetector.checkPlayerAlienCollision(player, alien);
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
        this.lives = GAME_CONFIG.PLAYER.STARTING_LIVES;
        this.gameStartTime = Date.now();
        
        // Initialize empty arrays for game entities
        this.bullets = [];
        this.coinEffects = [];
        
        // Initialize alien manager
        this.alienManager = new AlienManager(this);
        
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
        this.alienManager.startAlienSpawner();
        this.cloudManager.startCloudSpawner();
        this.mysteryBoxManager.scheduleMysteryBoxSpawn();
        
        // Start game loop
        this.gameLoop();
    }
    
    resetGame() {
        // Reset game state
        this.gameOver = false;
        this.score = 0;
        this.coins = 0;
        this.lives = GAME_CONFIG.PLAYER.STARTING_LIVES;
        this.gameStartTime = Date.now();
        
        // Clear game entities
        this.bullets = [];
        this.coinEffects = [];
        
        // Reset managers
        this.alienManager.reset();
        this.mysteryBoxManager.reset();
        this.cloudManager.reset();
        
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
        
        // Start spawners
        this.alienManager.startAlienSpawner();
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
                bullet.size,
                bullet.damage
            ));
        }
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
    
    addCoinEffect(x, y, count) {
        const effects = CoinEffect.createMultiple(x, y, count);
        this.coinEffects.push(...effects);
    }
    
    checkCollisions() {
        // Check bullet collisions
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;
            
            // Check collision with aliens
            const aliens = this.alienManager.getAliens();
            for (let j = aliens.length - 1; j >= 0; j--) {
                const alien = aliens[j];
                
                if (CollisionDetector.checkBulletAlienCollision(bullet, alien)) {
                    // Reduce alien health by bullet damage
                    alien.health -= bullet.damage;
                    
                    // Remove bullet regardless of whether alien is destroyed
                    this.bullets.splice(i, 1);
                    bulletHit = true;
                    
                    // Check if alien is destroyed
                    if (alien.health <= 0) {
                        // Add score
                        this.score += alien.points;
                        
                        // Add coins
                        this.coins += alien.coins;
                        
                        // Create coin effect
                        this.addCoinEffect(alien.x, alien.y, alien.coins);
                        
                        // Remove alien
                        aliens.splice(j, 1);
                        
                        // Update displays
                        this.ui.updateScore(this.score);
                        this.ui.updateCoins(this.coins);
                    }
                    
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
                (x, y, amount) => this.addCoinEffect(x, y, amount),
                (x, y, size, type) => this.addExplosionEffect(x, y, size, type),
                () => this.addLife()
            );
        }
        
        // Check player collision with aliens
        if (!this.gameOver) {
            const aliens = this.alienManager.getAliens();
            for (const alien of aliens) {
                if (CollisionDetector.checkPlayerAlienCollision(this.player, alien)) {
                    this.lives--;
                    this.ui.updateLives(this.lives);
                    
                    if (this.lives <= 0) {
                        this.gameOver = true;
                        this.ui.showGameOver(this.score, this.coins);
                        this.ui.setupRestartButton(() => this.resetGame());
                    }
                }
            }
        }
    }
    
    drawEntities() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds (background)
        this.cloudManager.draw(this.ctx, this.assets.getCloudImages());
        
        // Draw mystery boxes
        this.mysteryBoxManager.draw(
            this.ctx, 
            this.assets.getMysteryBoxImage(),
            this.assets.getExplosionImage()
        );
        
        // Draw aliens
        const aliens = this.alienManager.getAliens();
        for (const alien of aliens) {
            alien.draw(this.ctx, this.assets.getAlienImage(alien.type));
        }
        
        // Draw player
        this.player.draw(this.ctx, this.assets.getPlayerImage());
        
        // Draw bullets
        for (const bullet of this.bullets) {
            bullet.draw(this.ctx, this.assets.getPlayerProjectileImage());
        }
        
        // Draw coin effects
        for (const effect of this.coinEffects) {
            effect.draw(this.ctx, this.assets.getCoinImage());
        }
    }
    
    gameLoop() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Skip updates if game is over
        if (this.gameOver) {
            // Still draw entities
            this.drawEntities();
            
            // Continue game loop
            requestAnimationFrame(() => this.gameLoop());
            return;
        }
        
        // Update player
        this.player.update(this.mouseX, this.mouseY);
        
        // Try to fire automatically
        this.tryPlayerShoot();
        
        // Update aliens
        this.alienManager.updateAliens();
        
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
            bulletSize,
            this.player.damage
        ));
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
    
    addLife() {
        if (this.lives < GAME_CONFIG.PLAYER.MAX_LIVES) {
            this.lives = Math.min(this.lives + 1, GAME_CONFIG.PLAYER.MAX_LIVES);
            this.ui.updateLives(this.lives);
        }
    }
    
    increaseDamage() {
        this.player.damage += 1;
        console.log(`Player damage increased to ${this.player.damage}`);
    }
    
    addExplosionEffect(x, y, size, powerupType) {
        this.mysteryBoxManager.createExplosionEffect(x, y, size, powerupType);
    }
}

// Initialize game when the window loads
window.addEventListener('load', () => {
    new Game();
});
