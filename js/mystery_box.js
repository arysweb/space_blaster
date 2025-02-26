class MysteryBox {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.MYSTERY_BOX.SIZE;
        this.coins = GAME_CONFIG.MYSTERY_BOX.COINS;
        this.points = GAME_CONFIG.MYSTERY_BOX.POINTS;
        this.rotation = 0;
        this.scale = 1.0;
        this.pulseDirection = 1;
        
        // Fade out properties
        this.lifespan = 5000; // 5 seconds
        this.creationTime = Date.now();
        this.opacity = 1.0;
        this.isFadingOut = false;
    }
    
    update() {
        // Rotate the box
        this.rotation += GAME_CONFIG.MYSTERY_BOX.ROTATION_SPEED;
        
        // Make the box pulse (scale up and down)
        this.scale += this.pulseDirection * GAME_CONFIG.MYSTERY_BOX.PULSE_SPEED;
        
        // Reverse direction if reaching scale limits
        if (this.scale > 1.2) {
            this.scale = 1.2;
            this.pulseDirection = -1;
        } else if (this.scale < 0.8) {
            this.scale = 0.8;
            this.pulseDirection = 1;
        }
        
        // Check if it's time to start fading out
        const elapsedTime = Date.now() - this.creationTime;
        if (elapsedTime >= this.lifespan) {
            this.isFadingOut = true;
        }
        
        // Handle fade-out
        if (this.isFadingOut) {
            // Fade out over 1 second
            this.opacity = Math.max(0, this.opacity - 0.05);
        }
    }
    
    draw(ctx, image) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        
        // Apply opacity
        ctx.globalAlpha = this.opacity;
        
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
    
    // Check if the box should be removed (completely faded out)
    isExpired() {
        return this.isFadingOut && this.opacity <= 0;
    }
}

// Explosion effect when mystery box is hit
class Explosion {
    constructor(x, y, size, powerupType) {
        this.x = x;
        this.y = y;
        this.size = size * GAME_CONFIG.MYSTERY_BOX.EXPLOSION.SIZE_MULTIPLIER;
        this.opacity = 0; // Start with 0 opacity and fade in
        this.fadeInComplete = false;
        this.creationTime = Date.now();
        this.lifespan = GAME_CONFIG.MYSTERY_BOX.EXPLOSION.LIFESPAN;
        
        // Text effect properties
        this.powerupType = powerupType || 'damage'; // Default to damage
        this.text = this.getPowerupText(powerupType);
        this.textY = y; // Initial Y position same as explosion
        this.textOpacity = 1.0;
        this.textSpeed = GAME_CONFIG.MYSTERY_BOX.EXPLOSION.TEXT_SPEED;
        this.textLifespan = GAME_CONFIG.MYSTERY_BOX.EXPLOSION.TEXT_LIFESPAN;
    }
    
    getPowerupText(type) {
        // Find matching powerup type in config
        const powerupConfig = GAME_CONFIG.MYSTERY_BOX.POWERUPS.TYPES.find(p => p.TYPE === type);
        return powerupConfig ? powerupConfig.TEXT : GAME_CONFIG.MYSTERY_BOX.POWERUPS.TYPES[0].TEXT;
    }
    
    update() {
        const elapsedTime = Date.now() - this.creationTime;
        const progress = Math.min(1, elapsedTime / this.lifespan);
        
        // First 20% of time: fade in
        if (progress < 0.2) {
            this.opacity = progress / 0.2; // Normalize to 0-1
        } 
        // Middle 50%: stay fully visible
        else if (progress < 0.7) {
            this.opacity = 1.0;
        }
        // Remaining 30%: fade out
        else {
            this.fadeInComplete = true;
            // Map remaining progress (0.7-1.0) to opacity (1-0)
            this.opacity = 1 - ((progress - 0.7) / 0.3);
        }
        
        // Update floating text
        this.textY -= this.textSpeed; // Move text upward
        
        // Text fades out more gradually over the entire lifespan
        this.textOpacity = Math.max(0, 1 - (elapsedTime / this.textLifespan));
    }
    
    draw(ctx, image) {
        if (!image || !image.complete || image.naturalWidth === 0) return;
        
        // Draw explosion
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Draw centered explosion image
        ctx.drawImage(
            image,
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );
        
        ctx.restore();
        
        // Draw floating text
        ctx.save();
        ctx.globalAlpha = this.textOpacity;
        ctx.fillStyle = GAME_CONFIG.MYSTERY_BOX.EXPLOSION.TEXT_COLOR;
        ctx.font = GAME_CONFIG.MYSTERY_BOX.EXPLOSION.TEXT_FONT;
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.textY - this.size/2 - 5); // Position text above explosion
        ctx.restore();
    }
    
    isFinished() {
        return this.fadeInComplete && this.opacity <= 0 && this.textOpacity <= 0;
    }
}

// Mystery box manager to handle spawning and updating
class MysteryBoxManager {
    constructor(game) {
        this.game = game;
        this.mysteryBoxes = [];
        this.explosions = [];
        this.spawnTimeout = null;
        
        // Get powerup types from config
        this.powerupTypes = GAME_CONFIG.MYSTERY_BOX.POWERUPS.TYPES.map(p => ({
            type: p.TYPE,
            weight: p.WEIGHT
        }));
        
        // Calculate total weight for probability calculation
        this.totalWeight = this.powerupTypes.reduce((sum, powerup) => sum + powerup.weight, 0);
    }
    
    // Get a random powerup type based on weights
    getRandomPowerupType() {
        const random = Math.random() * this.totalWeight;
        let weightSum = 0;
        
        for (const powerup of this.powerupTypes) {
            weightSum += powerup.weight;
            if (random <= weightSum) {
                return powerup.type;
            }
        }
        
        // Fallback to damage if something goes wrong
        return 'damage';
    }
    
    scheduleMysteryBoxSpawn() {
        // Clear any existing timeout
        if (this.spawnTimeout) {
            clearTimeout(this.spawnTimeout);
        }
        
        // Only schedule a new spawn if there are no existing mystery boxes
        if (this.mysteryBoxes.length === 0) {
            // Random spawn interval between min and max
            const spawnInterval = Math.random() * 
                (GAME_CONFIG.MYSTERY_BOX.MAX_SPAWN_INTERVAL - GAME_CONFIG.MYSTERY_BOX.MIN_SPAWN_INTERVAL) + 
                GAME_CONFIG.MYSTERY_BOX.MIN_SPAWN_INTERVAL;
            
            this.spawnTimeout = setTimeout(() => {
                this.spawnMysteryBox();
            }, spawnInterval);
        }
    }
    
    spawnMysteryBox() {
        // Only spawn if there are no existing mystery boxes
        if (this.mysteryBoxes.length === 0 && !this.game.gameOver) {
            // Spawn a mystery box
            this.mysteryBoxes.push(MysteryBox.spawn(this.game.canvas.width, this.game.canvas.height));
            
            // Schedule the next spawn
            this.scheduleMysteryBoxSpawn();
        }
    }
    
    update() {
        // Update mystery boxes
        for (const box of this.mysteryBoxes) {
            box.update();
        }
        
        // Update explosions
        for (const explosion of this.explosions) {
            explosion.update();
        }
        
        // Remove expired boxes
        this.mysteryBoxes = this.mysteryBoxes.filter(box => !box.isExpired());
        
        // Remove finished explosions
        this.explosions = this.explosions.filter(explosion => !explosion.isFinished());
    }
    
    draw(ctx, mysteryBoxImage, explosionImage) {
        // Draw mystery boxes
        for (const box of this.mysteryBoxes) {
            box.draw(ctx, mysteryBoxImage);
        }
        
        // Draw explosions
        for (const explosion of this.explosions) {
            explosion.draw(ctx, explosionImage);
        }
    }
    
    checkCollisions(bullets, addScore, addCoins, createCoinEffect, createExplosionEffect, addLife) {
        // Check bullet collisions with mystery boxes
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = this.mysteryBoxes.length - 1; j >= 0; j--) {
                const box = this.mysteryBoxes[j];
                
                if (this.checkBulletMysteryBoxCollision(bullet, box)) {
                    // Get random powerup type
                    const powerupType = this.getRandomPowerupType();
                    
                    // Apply powerup effect based on type
                    switch(powerupType) {
                        case 'damage':
                            // Damage powerup will be implemented later
                            break;
                        case 'coins10':
                        case 'coins20':
                        case 'coins30':
                            // Find the powerup config to get the coin value
                            const coinPowerup = GAME_CONFIG.MYSTERY_BOX.POWERUPS.TYPES.find(p => p.TYPE === powerupType);
                            if (coinPowerup && coinPowerup.VALUE) {
                                addCoins(coinPowerup.VALUE);
                            }
                            break;
                        case 'heart':
                            if (addLife) addLife(); // Add life if function is provided
                            break;
                    }
                    
                    // Create explosion effect with the powerup type
                    createExplosionEffect(box.x, box.y, box.size, powerupType);
                    
                    // Remove mystery box and bullet
                    this.mysteryBoxes.splice(j, 1);
                    bullets.splice(i, 1);
                    
                    // We found a collision, so break out of the inner loop
                    break;
                }
            }
        }
    }
    
    checkBulletMysteryBoxCollision(bullet, mysteryBox) {
        const dx = bullet.x - mysteryBox.x;
        const dy = bullet.y - mysteryBox.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < mysteryBox.size / 2;
    }
    
    reset() {
        // Clear any existing timeout
        if (this.spawnTimeout) {
            clearTimeout(this.spawnTimeout);
            this.spawnTimeout = null;
        }
        
        this.mysteryBoxes = [];
        this.explosions = [];
    }
    
    getMysteryBoxes() {
        return this.mysteryBoxes;
    }
    
    createExplosionEffect(x, y, size, powerupType) {
        this.explosions.push(new Explosion(x, y, size, powerupType));
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MysteryBox,
        MysteryBoxManager,
        Explosion
    };
} else {
    // For browser environment
    window.MysteryBox = MysteryBox;
    window.MysteryBoxManager = MysteryBoxManager;
    window.Explosion = Explosion;
}