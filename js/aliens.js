class Alien {
    constructor(x, y, type, canvasWidth, canvasHeight, playerX, playerY) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.vx = 0;
        this.vy = 0;
        this.rotation = 0;
        this.lastUpdateTime = Date.now();
        
        // Special properties for Overlord alien
        this.waveTime = 0;
        this.initialX = x;
        this.initialY = y;
        this.isOverlord = type === 5; // Type 5 is the Overlord
        
        // Set properties based on alien type
        if (type === 0) { // Large alien
            this.size = GAME_CONFIG.ENEMY.LARGE.SIZE;
            this.speed = GAME_CONFIG.ENEMY.LARGE.SPEED;
            this.points = GAME_CONFIG.ENEMY.LARGE.POINTS;
            this.coins = GAME_CONFIG.ENEMY.LARGE.COINS;
            this.health = GAME_CONFIG.ENEMY.LARGE.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.LARGE.HEALTH;
        } else if (type === 1) { // Small alien
            this.size = GAME_CONFIG.ENEMY.SMALL.SIZE;
            this.speed = GAME_CONFIG.ENEMY.SMALL.SPEED;
            this.points = GAME_CONFIG.ENEMY.SMALL.POINTS;
            this.coins = GAME_CONFIG.ENEMY.SMALL.COINS;
            this.health = GAME_CONFIG.ENEMY.SMALL.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.SMALL.HEALTH;
        } else if (type === 2) { // L3 alien
            this.size = GAME_CONFIG.ENEMY.L3.SIZE;
            this.speed = GAME_CONFIG.ENEMY.L3.SPEED;
            this.points = GAME_CONFIG.ENEMY.L3.POINTS;
            this.coins = GAME_CONFIG.ENEMY.L3.COINS;
            this.health = GAME_CONFIG.ENEMY.L3.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.L3.HEALTH;
        } else if (type === 3) { // L4 alien
            this.size = GAME_CONFIG.ENEMY.L4.SIZE;
            this.speed = GAME_CONFIG.ENEMY.L4.SPEED;
            this.points = GAME_CONFIG.ENEMY.L4.POINTS;
            this.coins = GAME_CONFIG.ENEMY.L4.COINS;
            this.health = GAME_CONFIG.ENEMY.L4.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.L4.HEALTH;
        } else if (type === 4) { // Slug alien
            this.size = GAME_CONFIG.ENEMY.SLUG.SIZE;
            this.speed = GAME_CONFIG.ENEMY.SLUG.SPEED;
            this.points = GAME_CONFIG.ENEMY.SLUG.POINTS;
            this.coins = GAME_CONFIG.ENEMY.SLUG.COINS;
            this.health = GAME_CONFIG.ENEMY.SLUG.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.SLUG.HEALTH;
        } else if (type === 5) { // Overlord alien
            this.size = GAME_CONFIG.ENEMY.OVERLORD.SIZE;
            this.speed = GAME_CONFIG.ENEMY.OVERLORD.SPEED;
            this.points = GAME_CONFIG.ENEMY.OVERLORD.POINTS;
            this.coins = GAME_CONFIG.ENEMY.OVERLORD.COINS;
            this.health = GAME_CONFIG.ENEMY.OVERLORD.HEALTH;
            this.maxHealth = GAME_CONFIG.ENEMY.OVERLORD.HEALTH;
            this.waveAmplitude = GAME_CONFIG.ENEMY.OVERLORD.WAVE_AMPLITUDE;
            this.waveFrequency = GAME_CONFIG.ENEMY.OVERLORD.WAVE_FREQUENCY;
            this.minDistanceFromPlayer = GAME_CONFIG.ENEMY.OVERLORD.MIN_DISTANCE_FROM_PLAYER;
        }
        
        // Calculate direction towards player instead of center of screen
        const targetX = playerX || canvasWidth / 2;
        const targetY = playerY || canvasHeight / 2;
        
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
        
        this.rotation = Math.atan2(dy, dx);
    }
    
    update(allAliens, playerX, playerY, isPaused) {
        // If game is paused, freeze all movement
        if (isPaused) {
            // Reset velocities to ensure no movement when unpaused
            this.vx = 0;
            this.vy = 0;
            return;
        }
        
        // Store current position before updating
        this.lastX = this.x;
        this.lastY = this.y;
        
        // Calculate time since last update for smooth movement
        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;
        this.lastUpdateTime = now;
        
        // Special movement for Overlord alien
        if (this.isOverlord) {
            this.updateOverlordMovement(playerX, playerY, deltaTime);
            return;
        }
        
        // If player position is provided, update direction towards player
        if (playerX !== undefined && playerY !== undefined) {
            // Calculate direction towards player
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {  // Avoid division by zero
                // Gradually adjust velocity towards player (smoother tracking)
                const adjustmentFactor = 0.05; // Lower = smoother/slower adjustment
                
                // Calculate target velocity
                const targetVx = (dx / distance) * this.speed;
                const targetVy = (dy / distance) * this.speed;
                
                // Gradually adjust current velocity towards target
                this.vx += (targetVx - this.vx) * adjustmentFactor;
                this.vy += (targetVy - this.vy) * adjustmentFactor;
                
                // Update rotation to face movement direction
                this.rotation = Math.atan2(this.vy, this.vx);
            }
        }
        
        // Move alien
        this.x += this.vx * (deltaTime / 16); // Normalize to ~60fps
        this.y += this.vy * (deltaTime / 16);
        
        // Avoid collisions with other aliens if provided
        if (allAliens) {
            this.avoidCollisions(allAliens);
        }
    }
    
    updateOverlordMovement(playerX, playerY, deltaTime) {
        // Increment wave time
        this.waveTime += deltaTime * 0.001; // Convert to seconds
        
        // Calculate distance to player
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate a target position that keeps minimum distance from player
        let targetX = playerX;
        let targetY = playerY;
        
        if (distanceToPlayer < this.minDistanceFromPlayer) {
            // Move away from player to maintain minimum distance
            const angle = Math.atan2(dy, dx);
            targetX = playerX - Math.cos(angle) * this.minDistanceFromPlayer;
            targetY = playerY - Math.sin(angle) * this.minDistanceFromPlayer;
        } else {
            // Move in a wave pattern around the screen
            // Calculate base movement direction
            const screenCenterX = this.canvasWidth / 2;
            const screenCenterY = this.canvasHeight / 2;
            
            // Create a slow-moving wave pattern
            targetX = screenCenterX + Math.cos(this.waveTime) * (this.canvasWidth * 0.4);
            targetY = screenCenterY + Math.sin(this.waveTime * 1.5) * (this.canvasHeight * 0.4);
        }
        
        // Calculate direction to target
        const dxTarget = targetX - this.x;
        const dyTarget = targetY - this.y;
        const distanceToTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);
        
        if (distanceToTarget > 0) {
            // Gradually adjust velocity towards target (smoother movement)
            const adjustmentFactor = 0.02; // Lower = smoother/slower adjustment
            
            // Calculate target velocity
            const targetVx = (dxTarget / distanceToTarget) * this.speed;
            const targetVy = (dyTarget / distanceToTarget) * this.speed;
            
            // Gradually adjust current velocity towards target
            this.vx += (targetVx - this.vx) * adjustmentFactor;
            this.vy += (targetVy - this.vy) * adjustmentFactor;
            
            // Add wave motion perpendicular to movement direction
            const perpX = -this.vy;
            const perpY = this.vx;
            const waveOffset = Math.sin(this.waveTime * this.waveFrequency * 2 * Math.PI) * this.waveAmplitude;
            
            // Apply wave motion
            this.vx += perpX * waveOffset * 0.0001;
            this.vy += perpY * waveOffset * 0.0001;
            
            // Update rotation to face movement direction
            this.rotation = Math.atan2(this.vy, this.vx);
        }
        
        // Move alien
        this.x += this.vx * (deltaTime / 16); // Normalize to ~60fps
        this.y += this.vy * (deltaTime / 16);
    }
    
    avoidCollisions(allAliens) {
        const repulsionStrength = 0.3; // How strongly aliens repel each other
        const minDistance = this.size * 1.1; // Minimum distance to maintain
        
        for (const other of allAliens) {
            // Skip self
            if (other === this) continue;
            
            // Calculate distance between aliens
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If too close, apply repulsion force
            if (distance < minDistance) {
                // Calculate repulsion direction (normalized)
                const nx = dx / distance || 0; // Avoid division by zero
                const ny = dy / distance || 0;
                
                // Apply repulsion force (stronger when closer)
                const force = repulsionStrength * (1 - distance / minDistance);
                this.vx += nx * force;
                this.vy += ny * force;
            }
        }
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
            ctx.fillStyle = this.type === 0 ? '#ff0000' : this.type === 1 ? '#ff5555' : this.type === 2 ? '#ff00ff' : this.type === 3 ? '#00ffff' : this.type === 4 ? '#ff00ff' : '#ffff00';
            
            // Draw alien shape
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw health bar
        this.drawHealthBar(ctx);
    }
    
    drawHealthBar(ctx) {
        // Health bar dimensions
        const barWidth = this.size * 0.8;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size / 2 - 10; // Position above the alien
        
        // Draw background (empty health bar)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Calculate health percentage
        const healthPercentage = this.health / this.maxHealth;
        
        // Use simple white color for the health bar
        ctx.fillStyle = '#ffffff';
        
        // Draw filled health bar
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        
        // Draw border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    isOffScreen() {
        // Add a buffer to prevent aliens from being removed too early
        const buffer = this.size * 2;
        
        // Check if alien is far outside the canvas boundaries
        return (
            this.x < -buffer ||
            this.x > this.canvasWidth + buffer ||
            this.y < -buffer ||
            this.y > this.canvasHeight + buffer
        );
    }
}

class AlienExplosion {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size * 0.75; // Make explosion smaller (75% of alien size)
        this.opacity = 0; // Start with 0 opacity and fade in
        this.fadeInComplete = false;
        this.creationTime = Date.now();
        this.lifespan = 300; // Reduced from 500ms to 300ms for faster removal
        this.scale = 0.5; // Start small
        this.maxScale = 1.0; // Grow to full size
    }
    
    update() {
        const elapsed = Date.now() - this.creationTime;
        const progress = Math.min(elapsed / this.lifespan, 1);
        
        // Fade in quickly, then fade out
        if (progress < 0.2) {
            // Fade in phase
            this.opacity = progress / 0.2;
            this.scale = 0.5 + (this.maxScale - 0.5) * (progress / 0.2);
        } else {
            // Fade out phase
            this.fadeInComplete = true;
            this.opacity = 1 - ((progress - 0.2) / 0.8);
            this.scale = this.maxScale;
        }
    }
    
    draw(ctx, image) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        const drawSize = this.size * this.scale;
        
        // Check if image is loaded and not broken
        if (image && image.complete && image.naturalWidth > 0) {
            ctx.drawImage(
                image,
                this.x - drawSize / 2,
                this.y - drawSize / 2,
                drawSize,
                drawSize
            );
        } else {
            // Fallback: Draw a simple explosion if image is not available
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, drawSize / 2
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    isFinished() {
        return Date.now() - this.creationTime >= this.lifespan;
    }
}

class AlienManager {
    constructor(game) {
        this.game = game;
        this.aliens = [];
        this.explosions = [];
        this.alienSpawnerTimeout = null;
        this.gameStartTime = Date.now();
        this.availableTypes = [1, 4]; // Start with small aliens (type 1) and slug aliens (type 4)
        this.isPaused = false; // Add isPaused flag
        this.spawnInterval = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        this.spawnCounter = 0; // Initialize spawn counter
        
        // Overlord alien specific properties
        this.lastOverlordSpawnTime = 0;
        this.overlordSpawnInterval = 25000; // 25 seconds
    }
    
    updateAvailableTypes() {
        const elapsedMinutes = (Date.now() - this.gameStartTime) / 60000;
        
        // Gradually introduce more alien types as time progresses
        if (elapsedMinutes >= 1 && !this.availableTypes.includes(0)) {
            // After 1 minute, add large aliens (type 0)
            this.availableTypes.push(0);
            console.log('Large aliens now available');
        }
        
        if (elapsedMinutes >= 2 && !this.availableTypes.includes(2)) {
            // After 2 minutes, add L3 aliens (type 2)
            this.availableTypes.push(2);
            console.log('L3 aliens now available');
        }
        
        if (elapsedMinutes >= 3 && !this.availableTypes.includes(3)) {
            // After 3 minutes, add L4 aliens (type 3)
            this.availableTypes.push(3);
            console.log('L4 aliens now available');
        }
    }
    
    getCurrentAlienType() {
        // Update available types first
        this.updateAvailableTypes();
        
        // Randomly select from available types
        const randomIndex = Math.floor(Math.random() * this.availableTypes.length);
        return this.availableTypes[randomIndex];
    }
    
    startAlienSpawner() {
        // Clear any existing timeout
        if (this.alienSpawnerTimeout) {
            clearTimeout(this.alienSpawnerTimeout);
        }
        
        // Schedule next alien spawn
        this.alienSpawnerTimeout = setTimeout(() => {
            // Spawn alien if game is not paused
            if (!this.isPaused && !this.game.gameOver) {
                this.spawnAlien();
            }
            
            // Continue spawning
            this.startAlienSpawner();
        }, this.spawnInterval);
        
        // Check if it's time to spawn an Overlord alien
        this.checkOverlordSpawn();
    }
    
    checkOverlordSpawn() {
        const now = Date.now();
        
        // Check if enough time has passed since the last Overlord spawn
        if (now - this.lastOverlordSpawnTime >= this.overlordSpawnInterval) {
            // Spawn an Overlord alien
            this.spawnOverlordAlien();
            
            // Update the last spawn time
            this.lastOverlordSpawnTime = now;
        }
    }
    
    spawnOverlordAlien() {
        // Don't spawn if game is paused or over
        if (this.isPaused || this.game.gameOver) {
            return;
        }
        
        // Get a random spawn position
        const spawnPos = this.getRandomSpawnPosition();
        
        // Create a new Overlord alien (type 5)
        const overlord = new Alien(
            spawnPos.x,
            spawnPos.y,
            5, // Overlord type
            this.game.canvas.width,
            this.game.canvas.height,
            this.game.player.x,
            this.game.player.y
        );
        
        // Add to aliens array
        this.aliens.push(overlord);
        
        console.log('Overlord alien spawned!');
    }
    
    spawnAlien() {
        // Increment spawn counter
        this.spawnCounter++;
        
        // Get a random spawn position
        const spawnPos = this.getRandomSpawnPosition();
        
        // Get current alien type based on game progression
        const alienType = this.getCurrentAlienType();
        
        // Create a new alien
        const alien = new Alien(
            spawnPos.x,
            spawnPos.y,
            alienType,
            this.game.canvas.width,
            this.game.canvas.height,
            this.game.player.x,
            this.game.player.y
        );
        
        // Add to aliens array
        this.aliens.push(alien);
    }
    
    updateAliens() {
        // Check if it's time to spawn an Overlord alien
        this.checkOverlordSpawn();
        
        // Update all aliens
        for (let i = this.aliens.length - 1; i >= 0; i--) {
            const alien = this.aliens[i];
            
            // Update alien position
            alien.update(this.aliens, this.game.player.x, this.game.player.y, this.isPaused);
            
            // Remove aliens that are off-screen
            if (alien.isOffScreen()) {
                this.aliens.splice(i, 1);
            }
        }
        
        // Update all explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            
            // Update explosion
            explosion.update();
            
            // Remove finished explosions
            if (explosion.isFinished()) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    resetAlienVelocities() {
        // Reset all alien velocities to 0
        for (const alien of this.aliens) {
            alien.vx = 0;
            alien.vy = 0;
        }
    }
    
    getRandomSpawnPosition() {
        const canvas = this.game.canvas;
        const buffer = 50; // Spawn buffer from edge
        
        // Determine spawn edge (0: top, 1: right, 2: bottom, 3: left)
        const edge = Math.floor(Math.random() * 4);
        
        let x, y;
        
        switch (edge) {
            case 0: // Top edge
                x = Math.random() * canvas.width;
                y = -buffer;
                break;
            case 1: // Right edge
                x = canvas.width + buffer;
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom edge
                x = Math.random() * canvas.width;
                y = canvas.height + buffer;
                break;
            case 3: // Left edge
                x = -buffer;
                y = Math.random() * canvas.height;
                break;
        }
        
        // Ensure position is clear of other aliens
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!this.isPositionClear(x, y) && attempts < maxAttempts) {
            // Try a different position
            switch (edge) {
                case 0: // Top edge
                    x = Math.random() * canvas.width;
                    break;
                case 1: // Right edge
                    y = Math.random() * canvas.height;
                    break;
                case 2: // Bottom edge
                    x = Math.random() * canvas.width;
                    break;
                case 3: // Left edge
                    y = Math.random() * canvas.height;
                    break;
            }
            
            attempts++;
        }
        
        return { x, y };
    }
    
    isPositionClear(x, y) {
        // Check if position is clear of other aliens
        const minDistance = 50; // Minimum distance between aliens
        
        for (const alien of this.aliens) {
            const dx = alien.x - x;
            const dy = alien.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < minDistance) {
                return false;
            }
        }
        
        return true;
    }
    
    reset() {
        // Clear all aliens and explosions
        this.aliens = [];
        this.explosions = [];
        
        // Reset spawn counter
        this.spawnCounter = 0;
        
        // Reset available types
        this.availableTypes = [1, 4]; // Start with small aliens (type 1) and slug aliens (type 4)
        
        // Reset game start time
        this.gameStartTime = Date.now();
        
        // Reset Overlord spawn time
        this.lastOverlordSpawnTime = 0;
        
        // Clear any existing timeout
        if (this.alienSpawnerTimeout) {
            clearTimeout(this.alienSpawnerTimeout);
            this.alienSpawnerTimeout = null;
        }
    }
    
    getAliens() {
        return this.aliens;
    }
    
    addExplosion(x, y, size) {
        this.explosions.push(new AlienExplosion(x, y, size));
    }
    
    drawExplosions(ctx) {
        // Draw all explosions
        for (const explosion of this.explosions) {
            explosion.draw(ctx, this.game.assets.getExplosionImage());
        }
    }
}

class AlienCollisionDetector {
    static checkBulletAlienCollision(bullet, alien) {
        // Calculate distance between centers
        const dx = bullet.x - alien.x;
        const dy = bullet.y - alien.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if distance is less than sum of radii
        return distance < (bullet.size / 2 + alien.size / 2);
    }
    
    static checkPlayerAlienCollision(player, alien) {
        // Calculate distance between centers
        const dx = player.x - alien.x;
        const dy = player.y - alien.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if distance is less than sum of radii
        return distance < (player.size / 2 + alien.size / 2);
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Alien,
        AlienExplosion,
        AlienManager,
        AlienCollisionDetector
    };
}