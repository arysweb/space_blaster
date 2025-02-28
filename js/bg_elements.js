class Cloud {
    constructor(x, y, type, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.size = GAME_CONFIG.BACKGROUND.CLOUD_SIZES[type];
        this.speed = GAME_CONFIG.BACKGROUND.CLOUD_SPEEDS[type];
        this.rotation = 0; // No rotation by default
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
            // Save the current context state
            ctx.save();
            
            // Translate to the center of the cloud
            ctx.translate(this.x, this.y);
            
            // Rotate the cloud
            ctx.rotate(this.rotation);
            
            // Draw the cloud image centered and upright
            ctx.drawImage(
                img,
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size
            );
            
            // Restore the context state
            ctx.restore();
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
        
        // Create the cloud
        const cloud = new Cloud(cloudX, cloudY, cloudType, canvasWidth, canvasHeight);
        
        // Set a random rotation (between -0.1 and 0.1 radians)
        cloud.rotation = (Math.random() * 0.2 - 0.1);
        
        return cloud;
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
        this.cloudSpawnerTimeout = null;
    }
    
    startCloudSpawner() {
        // Clear any existing timeout
        if (this.cloudSpawnerTimeout) {
            clearTimeout(this.cloudSpawnerTimeout);
            this.cloudSpawnerTimeout = null;
        }
        
        // Don't spawn if game is over
        if (this.game.gameOver) return;
        
        // Attempt to spawn a cloud that doesn't overlap with existing clouds
        let attempts = 0;
        let newCloud = null;
        const maxAttempts = 10;
        
        // Only try to spawn if the game is not paused
        if (!this.game.isPaused) {
            while (attempts < maxAttempts) {
                // Create a potential new cloud
                newCloud = Cloud.spawn(this.game.canvas.width, this.game.canvas.height);
                
                // Check if it overlaps with any existing clouds
                if (!Cloud.checkOverlap(newCloud, this.clouds)) {
                    // No overlap, we can use this cloud
                    break;
                }
                
                // Try again
                attempts++;
            }
            
            // If we found a valid cloud position, add it
            if (newCloud && attempts < maxAttempts) {
                this.clouds.push(newCloud);
            }
        }
        
        // Schedule next spawn using the configured interval
        this.cloudSpawnerTimeout = setTimeout(() => {
            // Only continue spawning if the game is not paused
            if (!this.game.isPaused) {
                this.startCloudSpawner();
            } else {
                // If game is paused, we'll restart the spawner when the game resumes
                console.log('Cloud spawner paused');
            }
        }, GAME_CONFIG.BACKGROUND.CLOUD_SPAWN_INTERVAL);
    }
    
    trySpawnCloud() {
        if (this.game.gameOver || this.game.isPaused) return;
        
        // Try to spawn a new cloud that doesn't overlap with existing clouds
        let attempts = 0;
        let newCloud = null;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            // Create a potential new cloud
            newCloud = Cloud.spawn(this.game.canvas.width, this.game.canvas.height);
            
            // Check if it overlaps with any existing clouds
            if (!Cloud.checkOverlap(newCloud, this.clouds)) {
                // No overlap, we can use this cloud
                break;
            }
            
            // Try again
            attempts++;
        }
        
        // If we found a valid cloud position, add it
        if (newCloud && attempts < maxAttempts) {
            this.clouds.push(newCloud);
        }
    }
    
    update() {
        // Don't update if game is paused or over
        if (this.game.isPaused || this.game.gameOver) {
            return;
        }
        
        // Update clouds
        for (let i = this.clouds.length - 1; i >= 0; i--) {
            this.clouds[i].update();
            
            // Remove clouds that are off-screen
            if (this.clouds[i].isOffScreen()) {
                this.clouds.splice(i, 1);
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
        // Create a single initial cloud at a random position
        const x = Math.random() * this.game.canvas.width;
        const cloud = Cloud.spawn(this.game.canvas.width, this.game.canvas.height, x);
        
        // Only add it if it doesn't overlap with any existing clouds
        if (!Cloud.checkOverlap(cloud, this.clouds)) {
            this.clouds.push(cloud);
        }
    }
    
    reset() {
        // Clear all clouds
        this.clouds = [];
        
        // Clear spawn timer
        if (this.cloudSpawnerTimeout) {
            clearTimeout(this.cloudSpawnerTimeout);
            this.cloudSpawnerTimeout = null;
        }
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