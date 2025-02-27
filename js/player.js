class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.game = game;
        this.rotation = 0;
        this.size = GAME_CONFIG.PLAYER.SIZE;
        this.lastFireTime = performance.now();  // Use performance.now() for precision
        this.damage = GAME_CONFIG.PLAYER.PROJECTILE_DAMAGE; // Player's current damage level
        this.critChance = 0; // Percentage chance to instantly kill an alien (0-100)
        this.fireRate = 0; // Percentage increase in fire rate (0-100)
        this.isInvincible = false;
        this.invincibilityTime = 0;
        this.invincibilityDuration = 2000; // 2 seconds of invincibility after being hit
        
        // Store last mouse position for accurate shooting
        this.lastMouseX = x;
        this.lastMouseY = y;
    }
    
    updateRotation(mouseX, mouseY) {
        // Store exact mouse coordinates for shooting
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;
        
        // Update rotation to point towards mouse - direct, no smoothing
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.rotation = Math.atan2(dy, dx);
    }
    
    update(mouseX, mouseY) {
        // Update rotation using stored coordinates
        this.updateRotation(mouseX, mouseY);
        
        // Update invincibility if active
        if (this.isInvincible) {
            this.invincibilityTime += 16; // Approximate time per frame (ms)
            if (this.invincibilityTime >= this.invincibilityDuration) {
                this.isInvincible = false;
                this.invincibilityTime = 0;
                console.log("Player invincibility ended");
            }
        }
    }
    
    draw(ctx, playerImage) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Apply flashing effect if invincible
        if (this.isInvincible) {
            // Flash every 100ms
            if (Math.floor(this.invincibilityTime / 100) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }
        
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
        // Use performance.now() for more precise timing
        const actualFireRate = GAME_CONFIG.PLAYER.FIRE_RATE * (1 - (this.fireRate / 100));
        return performance.now() - this.lastFireTime > actualFireRate;
    }
    
    tryFire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = performance.now();
        
        // Use stored mouse coordinates for perfect accuracy
        const dx = this.lastMouseX - this.x;
        const dy = this.lastMouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Normalize direction
        const dirX = dx / distance;
        const dirY = dy / distance;
        
        return {
            x: this.x, // Spawn bullet at player center
            y: this.y,
            vx: dirX * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            vy: dirY * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            size: GAME_CONFIG.PLAYER.PROJECTILE_SIZE,
            damage: this.damage
        };
    }
    
    fire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = performance.now();
        
        return {
            x: this.x + Math.cos(this.rotation) * this.size,
            y: this.y + Math.sin(this.rotation) * this.size,
            vx: Math.cos(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            vy: Math.sin(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            size: GAME_CONFIG.PLAYER.PROJECTILE_SIZE,
            damage: this.damage
        };
    }
    
    makeInvincible() {
        this.isInvincible = true;
        this.invincibilityTime = 0;
        console.log("Player is now invincible");
    }
}

class Bullet {
    constructor(x, y, vx, vy, size, damage = GAME_CONFIG.PLAYER.PROJECTILE_DAMAGE, isCritical = false) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.damage = damage;
        this.isCritical = isCritical;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
    }
    
    draw(ctx, projectileImage, critProjectileImage) {
        // Determine which image to use based on isCritical flag
        const image = this.isCritical ? critProjectileImage : projectileImage;
        
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
            ctx.fillStyle = this.isCritical ? '#ff0000' : GAME_CONFIG.COLORS.FOREGROUND;
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