class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.size = GAME_CONFIG.PLAYER.SIZE;
        this.lastFireTime = 0;
        this.damage = GAME_CONFIG.PLAYER.PROJECTILE_DAMAGE; // Player's current damage level
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
        return Date.now() - this.lastFireTime > GAME_CONFIG.PLAYER.FIRE_RATE;
    }
    
    tryFire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = Date.now();
        
        return {
            x: this.x + Math.cos(this.rotation) * this.size,
            y: this.y + Math.sin(this.rotation) * this.size,
            vx: Math.cos(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            vy: Math.sin(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            size: GAME_CONFIG.PLAYER.PROJECTILE_SIZE,
            damage: this.damage
        };
    }
    
    fire() {
        if (!this.canFire()) return null;
        
        this.lastFireTime = Date.now();
        
        return {
            x: this.x + Math.cos(this.rotation) * this.size,
            y: this.y + Math.sin(this.rotation) * this.size,
            vx: Math.cos(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            vy: Math.sin(this.rotation) * GAME_CONFIG.PLAYER.PROJECTILE_SPEED,
            size: GAME_CONFIG.PLAYER.PROJECTILE_SIZE,
            damage: this.damage
        };
    }
}

class Bullet {
    constructor(x, y, vx, vy, size, damage = GAME_CONFIG.PLAYER.PROJECTILE_DAMAGE) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.damage = damage;
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