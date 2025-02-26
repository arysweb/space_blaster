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

// Mystery box manager to handle spawning and updating
class MysteryBoxManager {
    constructor(game) {
        this.game = game;
        this.mysteryBoxes = [];
    }
    
    scheduleMysteryBoxSpawn() {
        if (this.game.gameOver) return;
        
        // Add a delay before the first spawn
        setTimeout(() => {
            // Spawn a mystery box
            this.mysteryBoxes.push(MysteryBox.spawn(this.game.canvas.width, this.game.canvas.height));
            
            // Schedule next spawn using the configured values
            const minTime = GAME_CONFIG.MYSTERY_BOX.MIN_SPAWN_TIME;
            const maxTime = GAME_CONFIG.MYSTERY_BOX.MAX_SPAWN_TIME;
            const nextSpawnTime = minTime + Math.random() * (maxTime - minTime);
            setTimeout(() => this.scheduleMysteryBoxSpawn(), nextSpawnTime);
        }, GAME_CONFIG.MYSTERY_BOX.INITIAL_SPAWN_DELAY);
    }
    
    spawnMysteryBox() {
        if (this.game.gameOver) return;
        
        const mysteryBox = MysteryBox.spawn(this.game.canvas.width, this.game.canvas.height);
        this.mysteryBoxes.push(mysteryBox);
    }
    
    update() {
        // Update mystery boxes
        for (const box of this.mysteryBoxes) {
            box.update();
        }
    }
    
    draw(ctx, mysteryBoxImage) {
        // Draw mystery boxes
        for (const box of this.mysteryBoxes) {
            box.draw(ctx, mysteryBoxImage);
        }
    }
    
    checkCollisions(bullets, addScore, addCoins, createCoinEffect) {
        // Check bullet collisions with mystery boxes
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = this.mysteryBoxes.length - 1; j >= 0; j--) {
                const box = this.mysteryBoxes[j];
                
                if (this.checkBulletMysteryBoxCollision(bullet, box)) {
                    // Add score and coins
                    addScore(box.points);
                    addCoins(box.coins);
                    
                    // Create coin effect
                    createCoinEffect(box.x, box.y, box.coins / 5);
                    
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
        this.mysteryBoxes = [];
    }
    
    getMysteryBoxes() {
        return this.mysteryBoxes;
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MysteryBox,
        MysteryBoxManager
    };
} else {
    // For browser environment
    window.MysteryBox = MysteryBox;
    window.MysteryBoxManager = MysteryBoxManager;
}