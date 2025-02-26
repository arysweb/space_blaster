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
            this.health = GAME_CONFIG.ENEMY.LARGE.HEALTH;
        } else { // Small alien
            this.size = GAME_CONFIG.ENEMY.SMALL.SIZE;
            this.speed = GAME_CONFIG.ENEMY.SMALL.SPEED;
            this.points = GAME_CONFIG.ENEMY.SMALL.POINTS;
            this.coins = GAME_CONFIG.ENEMY.SMALL.COINS;
            this.health = GAME_CONFIG.ENEMY.SMALL.HEALTH;
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

class AlienManager {
    constructor(game) {
        this.game = game;
        this.aliens = [];
        this.alienSpawnerTimeout = null;
    }
    
    startAlienSpawner() {
        if (this.game.gameOver) return;
        
        // Spawn an alien
        this.spawnAlien();
        
        // Calculate game time in milliseconds
        const gameTime = Date.now() - this.game.gameStartTime;
        
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
        if (this.game.gameOver) return;
        
        const spawnPosition = this.getRandomSpawnPosition();
        
        // Determine alien type based on game time
        const gameTime = Date.now() - this.game.gameStartTime;
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
            this.game.canvas.width,
            this.game.canvas.height
        );
        
        this.aliens.push(alien);
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
    
    getRandomSpawnPosition() {
        // Determine spawn position (outside the screen)
        const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
        let x, y;
        
        switch (side) {
            case 0: // top
                x = Math.random() * this.game.canvas.width;
                y = -50;
                break;
            case 1: // right
                x = this.game.canvas.width + 50;
                y = Math.random() * this.game.canvas.height;
                break;
            case 2: // bottom
                x = Math.random() * this.game.canvas.width;
                y = this.game.canvas.height + 50;
                break;
            case 3: // left
                x = -50;
                y = Math.random() * this.game.canvas.height;
                break;
        }
        
        return { x, y };
    }
    
    reset() {
        this.aliens = [];
        
        if (this.alienSpawnerTimeout) {
            clearTimeout(this.alienSpawnerTimeout);
            this.alienSpawnerTimeout = null;
        }
    }
    
    getAliens() {
        return this.aliens;
    }
}

// Also move the collision detection methods related to aliens
class AlienCollisionDetector {
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

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Alien,
        AlienManager,
        AlienCollisionDetector
    };
}