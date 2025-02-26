class Shop {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.upgradeLevels = {
            damage: 0,
            firerate: 0,
            crit: 0,
            health: 0
        };
        
        // Get DOM elements
        this.shopOverlay = document.getElementById('shopOverlay');
        this.shopButton = document.getElementById('shopButton');
        this.closeShopButton = document.getElementById('closeShopButton');
        this.shopCoinsElement = document.getElementById('shopCoins');
        this.shopItemsContainer = document.getElementById('shopItems');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Generate shop items
        this.generateShopItems();
    }
    
    setupEventListeners() {
        // Open shop when shop button is clicked
        this.shopButton.addEventListener('click', () => {
            this.openShop();
        });
        
        // Close shop when close button is clicked
        this.closeShopButton.addEventListener('click', () => {
            this.closeShop();
        });
        
        // Close shop when clicking outside the shop content
        this.shopOverlay.addEventListener('click', (event) => {
            if (event.target === this.shopOverlay) {
                this.closeShop();
            }
        });
        
        // Close shop when ESC key is pressed
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isOpen) {
                this.closeShop();
            }
        });
    }
    
    generateShopItems() {
        // Clear existing items
        this.shopItemsContainer.innerHTML = '';
        
        // Get upgrade options from config
        const upgrades = GAME_CONFIG.SHOP.UPGRADES;
        
        // Create a shop item for each upgrade
        upgrades.forEach(upgrade => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            // Calculate current level and cost
            const level = this.upgradeLevels[upgrade.TYPE];
            const cost = Math.floor(upgrade.BASE_COST * Math.pow(upgrade.COST_MULTIPLIER, level));
            const isMaxLevel = level >= upgrade.MAX_LEVEL;
            
            // Create item content
            itemElement.innerHTML = `
                <div class="shop-item-header">
                    <div class="shop-item-icon">
                        <img src="${upgrade.ICON}" alt="${upgrade.NAME}" onerror="this.src='img/mystery_box.png'">
                    </div>
                    <div class="shop-item-title">${upgrade.NAME}</div>
                </div>
                <div class="shop-item-description">${upgrade.DESCRIPTION}</div>
                <div class="shop-item-level">Level: ${level}/${upgrade.MAX_LEVEL}</div>
                <div class="shop-item-cost">${isMaxLevel ? 'MAX LEVEL' : 'Cost: ' + cost + ' coins'}</div>
                <button class="shop-item-button" data-type="${upgrade.TYPE}" ${isMaxLevel ? 'disabled' : ''}>
                    ${isMaxLevel ? 'MAXED' : 'UPGRADE'}
                </button>
            `;
            
            // Add the item to the container
            this.shopItemsContainer.appendChild(itemElement);
            
            // Add event listener to the upgrade button
            const upgradeButton = itemElement.querySelector('.shop-item-button');
            if (!isMaxLevel) {
                upgradeButton.addEventListener('click', () => {
                    this.purchaseUpgrade(upgrade.TYPE);
                });
            }
        });
    }
    
    purchaseUpgrade(type) {
        // Find the upgrade config
        const upgrade = GAME_CONFIG.SHOP.UPGRADES.find(u => u.TYPE === type);
        if (!upgrade) return;
        
        // Calculate current level and cost
        const level = this.upgradeLevels[type];
        const cost = Math.floor(upgrade.BASE_COST * Math.pow(upgrade.COST_MULTIPLIER, level));
        
        // Check if player has enough coins
        if (this.game.coins >= cost && level < upgrade.MAX_LEVEL) {
            // Deduct coins
            this.game.coins -= cost;
            this.game.ui.updateCoins(this.game.coins);
            
            // Increase upgrade level
            this.upgradeLevels[type]++;
            
            // Apply the upgrade effect
            this.applyUpgradeEffect(type, upgrade.INCREMENT);
            
            // Update shop display
            this.updateShopDisplay();
            
            // Play purchase sound (if available)
            // TODO: Add purchase sound
            
            console.log(`Purchased ${upgrade.NAME} upgrade (Level ${this.upgradeLevels[type]})`);
        } else {
            console.log(`Cannot afford ${upgrade.NAME} upgrade (Cost: ${cost}, Coins: ${this.game.coins})`);
            // TODO: Play "cannot afford" sound
        }
    }
    
    applyUpgradeEffect(type, increment) {
        switch(type) {
            case 'damage':
                // Increase player's damage
                this.game.player.damage += increment;
                this.game.ui.updateDamage(this.game.player.damage);
                break;
                
            case 'firerate':
                // Increase player's fire rate
                this.game.player.fireRate += increment;
                this.game.player.fireRate = Math.min(this.game.player.fireRate, 90); // Cap at 90%
                this.game.ui.updateFireRate(this.game.player.fireRate);
                break;
                
            case 'crit':
                // Increase player's critical hit chance
                this.game.player.critChance += increment;
                this.game.ui.updateCritChance(this.game.player.critChance);
                break;
                
            case 'health':
                // Increase player's maximum health
                const oldMax = GAME_CONFIG.PLAYER.MAX_LIVES;
                GAME_CONFIG.PLAYER.MAX_LIVES += increment;
                
                // If player is at max health, give them the new max
                if (this.game.lives === oldMax) {
                    this.game.lives = GAME_CONFIG.PLAYER.MAX_LIVES;
                    this.game.ui.updateLives(this.game.lives);
                }
                break;
        }
    }
    
    openShop() {
        if (this.game.gameOver) return;
        
        // Pause the game
        this.game.pauseGame();
        
        // Hide pause overlay if it's visible
        document.getElementById('pauseOverlay').style.display = 'none';
        
        // Update shop display
        this.updateShopDisplay();
        
        // Show the shop overlay
        this.shopOverlay.style.display = 'block';
        this.isOpen = true;
    }
    
    closeShop() {
        // Hide the shop overlay
        this.shopOverlay.style.display = 'none';
        this.isOpen = false;
        
        // Resume the game
        this.game.resumeGame();
    }
    
    updateShopDisplay() {
        // Update coins display
        this.shopCoinsElement.textContent = this.game.coins;
        
        // Regenerate shop items to reflect current levels and costs
        this.generateShopItems();
    }
    
    reset() {
        // Reset upgrade levels
        this.upgradeLevels = {
            damage: 0,
            firerate: 0,
            crit: 0,
            health: 0
        };
        
        // Reset max lives in config
        GAME_CONFIG.PLAYER.MAX_LIVES = GAME_CONFIG.PLAYER.STARTING_LIVES;
        
        // Close shop if open
        if (this.isOpen) {
            this.closeShop();
        }
    }
}
