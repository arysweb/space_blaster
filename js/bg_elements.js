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

class CloudManager {
    constructor(game) {
        this.game = game;
        this.clouds = [];
    }
    
    startCloudSpawner() {
        if (this.game.gameOver) return;
        
        // Spawn a cloud
        const newCloud = Cloud.spawn(this.game.canvas.width, this.game.canvas.height);
        this.clouds.push(newCloud);
        
        // Schedule next spawn
        const nextSpawnTime = GAME_CONFIG.BACKGROUND.CLOUD_SPAWN_INTERVAL;
        setTimeout(() => this.startCloudSpawner(), nextSpawnTime);
    }
    
    trySpawnCloud() {
        if (this.game.gameOver) return;
        
        // Try to spawn a new cloud
        const newCloud = Cloud.spawn(this.game.canvas.width, this.game.canvas.height);
        this.clouds.push(newCloud);
    }
    
    update() {
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
    }
    
    draw(ctx, cloudImages) {
        // Draw clouds (background)
        for (const cloud of this.clouds) {
            cloud.draw(ctx, cloudImages);
        }
    }
    
    setupInitialClouds() {
        // Create some initial clouds
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.game.canvas.width;
            this.clouds.push(Cloud.spawn(this.game.canvas.width, this.game.canvas.height, x));
        }
    }
    
    reset() {
        this.clouds = [];
    }
    
    getClouds() {
        return this.clouds;
    }
}

// Export the classes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Cloud,
        CloudManager
    };
} else {
    // For browser environment
    window.Cloud = Cloud;
    window.CloudManager = CloudManager;
}