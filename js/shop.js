class Shop {
    constructor(game) {
        this.game = game;
        this.isOpen = false;
        this.shopOverlay = document.getElementById('shopOverlay');
        this.shopCoins = document.getElementById('shopCoins');
        this.shopUpgrades = document.getElementById('shopUpgrades');
        this.closeButton = document.getElementById('closeShopButton');
        
        // Setup event listeners
        this.closeButton.addEventListener('click', () => this.hide());
        document.getElementById('shopButton').addEventListener('click', () => this.show());
        document.getElementById('shopFromPauseButton').addEventListener('click', () => {
            document.getElementById('pauseOverlay').style.display = 'none';
            this.show();
        });
        
        // Use upgrades from config
        this.upgrades = SHOP_UPGRADES;
    }
    
    show() {
        this.isOpen = true;
        this.shopOverlay.style.display = 'flex';
        this.shopCoins.textContent = this.game.coins;
        this.renderUpgrades();
        this.game.isPaused = true;
    }
    
    hide() {
        this.isOpen = false;
        this.shopOverlay.style.display = 'none';
        this.game.isPaused = false;
    }
    
    reset() {
        // Reset shop state
        this.isOpen = false;
        this.shopOverlay.style.display = 'none';
        
        // Player stats are now reset by the PlayerStats manager
    }
    
    renderUpgrades() {
        this.shopUpgrades.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const level = this.getCurrentLevel(upgrade.id);
            const cost = this.calculateCost(upgrade, Math.floor(level));
            const isMaxLevel = level >= upgrade.maxLevel;
            
            const upgradeElement = document.createElement('div');
            upgradeElement.className = `upgrade-item ${isMaxLevel || cost > this.game.coins ? 'disabled' : ''}`;
            
            upgradeElement.innerHTML = `
                <div class="upgrade-info">
                    <div class="name">${upgrade.name}</div>
                    <div class="description">${upgrade.description}</div>
                    <div class="stats">
                        <span class="level">LEVEL ${level.toFixed(1)}/${upgrade.maxLevel}</span>
                        <span class="cost">${isMaxLevel ? 'MAX LEVEL' : `${cost} COINS`}</span>
                    </div>
                </div>
                <button class="buy-button" ${isMaxLevel || cost > this.game.coins ? 'disabled' : ''}>+</button>
            `;
            
            if (!isMaxLevel && cost <= this.game.coins) {
                const buyButton = upgradeElement.querySelector('.buy-button');
                buyButton.addEventListener('click', () => this.purchaseUpgrade(upgrade));
            }
            
            this.shopUpgrades.appendChild(upgradeElement);
        });
    }
    
    getCurrentLevel(upgradeId) {
        // Use the PlayerStats manager to get the current level
        return this.game.playerStats.getStatLevel(upgradeId);
    }
    
    calculateCost(upgrade, currentLevel) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }
    
    purchaseUpgrade(upgrade) {
        const level = this.getCurrentLevel(upgrade.id);
        const cost = this.calculateCost(upgrade, Math.floor(level));
        
        if (this.game.coins >= cost && level < upgrade.maxLevel) {
            this.game.coins -= cost;
            
            // Use the Game's increaseStatLevel method which will also save player data
            this.game.increaseStatLevel(upgrade.id);
            
            // Update UI
            this.shopCoins.textContent = this.game.coins;
            this.renderUpgrades();
            
            // Save player data after purchase
            this.game.savePlayerData();
        }
    }
}
