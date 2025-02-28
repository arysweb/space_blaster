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
        
        // Reset upgrades to initial state
        this.upgrades.forEach(upgrade => {
            switch (upgrade.id) {
                case 'damage':
                    this.game.player.damage = 1; // Base damage must be 1
                    break;
                case 'firerate':
                    this.game.player.fireRate = 0; // 0% fire rate bonus
                    break;
                case 'crit':
                    this.game.player.critChance = 0; // 0% crit chance
                    break;
            }
        });
    }
    
    renderUpgrades() {
        this.shopUpgrades.innerHTML = '';
        
        this.upgrades.forEach(upgrade => {
            const level = this.getCurrentLevel(upgrade.id);
            const cost = this.calculateCost(upgrade, level);
            const isMaxLevel = level >= upgrade.maxLevel;
            
            const upgradeElement = document.createElement('div');
            upgradeElement.className = `upgrade-item ${isMaxLevel || cost > this.game.coins ? 'disabled' : ''}`;
            
            upgradeElement.innerHTML = `
                <div class="upgrade-info">
                    <div class="name">${upgrade.name}</div>
                    <div class="description">${upgrade.description}</div>
                    <div class="stats">
                        <span class="level">LEVEL ${level}/${upgrade.maxLevel}</span>
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
        switch (upgradeId) {
            case 'damage':
                return this.game.player.damage - 1;
            case 'firerate':
                return Math.floor(this.game.player.fireRate / 10);
            case 'crit':
                return Math.floor(this.game.player.critChance / 10);
            default:
                return 0;
        }
    }
    
    calculateCost(upgrade, currentLevel) {
        return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
    }
    
    purchaseUpgrade(upgrade) {
        const level = this.getCurrentLevel(upgrade.id);
        const cost = this.calculateCost(upgrade, level);
        
        if (this.game.coins >= cost && level < upgrade.maxLevel) {
            this.game.coins -= cost;
            
            switch (upgrade.id) {
                case 'damage':
                    this.game.player.damage++;
                    this.game.ui.updateDamage(this.game.player.damage);
                    break;
                case 'firerate':
                    this.game.player.fireRate += 10;
                    this.game.ui.updateFireRate(this.game.player.fireRate);
                    break;
                case 'crit':
                    this.game.player.critChance += 10;
                    this.game.ui.updateCritChance(this.game.player.critChance);
                    break;
            }
            
            this.shopCoins.textContent = this.game.coins;
            this.renderUpgrades();
        }
    }
}
