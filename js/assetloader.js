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
        this.projectileImage = new Image();
        this.projectileImage.src = GAME_CONFIG.PLAYER.PROJECTILE_IMAGE;
        this.projectileImage.onerror = () => console.warn('Failed to load player projectile image');
        
        // Player crit projectile image
        this.critProjectileImage = new Image();
        this.critProjectileImage.src = GAME_CONFIG.PLAYER.CRIT_PROJECTILE_IMAGE;
        this.critProjectileImage.onerror = () => console.warn('Failed to load player crit projectile image');
        
        // Alien images
        this.alienImages = {
            0: new Image(),
            1: new Image(),
            2: new Image(),
            3: new Image(),
            4: new Image(),
            5: new Image() // Overlord alien (type 5)
        };
        this.alienImages[0].src = GAME_CONFIG.ENEMY.LARGE.IMAGE;
        this.alienImages[0].onerror = () => console.warn('Failed to load large alien image');
        
        this.alienImages[1].src = GAME_CONFIG.ENEMY.SMALL.IMAGE;
        this.alienImages[1].onerror = () => console.warn('Failed to load small alien image');
        
        this.alienImages[2].src = GAME_CONFIG.ENEMY.L3.IMAGE;
        this.alienImages[2].onerror = () => console.warn('Failed to load L3 alien image');
        
        this.alienImages[3].src = GAME_CONFIG.ENEMY.L4.IMAGE;
        this.alienImages[3].onerror = () => console.warn('Failed to load L4 alien image');
        
        this.alienImages[4].src = GAME_CONFIG.ENEMY.SLUG.IMAGE;
        this.alienImages[4].onerror = () => console.warn('Failed to load slug alien image');
        
        this.alienImages[5].src = GAME_CONFIG.ENEMY.OVERLORD.IMAGE;
        this.alienImages[5].onerror = () => console.warn('Failed to load overlord alien image');
        
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
        
        // Explosion image
        this.explosionImage = new Image();
        this.explosionImage.src = GAME_CONFIG.MYSTERY_BOX.POWERUPS.EXPLOSION_IMAGE;
        this.explosionImage.onerror = () => console.warn('Failed to load explosion image');
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
        return this.projectileImage.complete && this.projectileImage.naturalWidth > 0 
            ? this.projectileImage 
            : this.placeholderImage;
    }
    
    getCritProjectileImage() {
        return this.critProjectileImage.complete && this.critProjectileImage.naturalWidth > 0 
            ? this.critProjectileImage 
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
    
    getExplosionImage() {
        return this.explosionImage.complete && this.explosionImage.naturalWidth > 0 
            ? this.explosionImage 
            : this.placeholderImage;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AssetLoader
    };
}