/**
 * PlayerStats - Centralized manager for player statistics and upgrades
 * This class handles all player stat tracking, upgrades, and provides
 * a single source of truth for both the shop and mystery box systems.
 */
class PlayerStats {
    constructor(game) {
        this.game = game;
        
        // Define max levels for each stat
        this.MAX_LEVEL = 10;
        
        // Initialize stat levels (0-10 scale)
        this.damageLevel = 1.0; // Start with level 1 damage so player can play
        this.fireRateLevel = 0.0;
        this.critChanceLevel = 0.0;
        
        // Initialize UI references
        this.ui = game.ui;
    }
    
    /**
     * Reset all stats to their initial values
     */
    reset() {
        this.damageLevel = 1.0; // Start with level 1 damage
        this.fireRateLevel = 0.0;
        this.critChanceLevel = 0.0;
        
        // Update the player object with these base values
        this.updatePlayerStats();
        
        // Update UI
        this.updateUI();
    }
    
    /**
     * Update the player object with the current stat values
     */
    updatePlayerStats() {
        // Update player's actual stats based on levels
        if (this.game.player) {
            // Damage: level is directly used (1-10)
            this.game.player.damage = this.damageLevel;
            
            // Fire rate: convert level (0-10) to percentage (0-90%)
            // We cap at 90% to avoid division by zero issues with fire rate
            this.game.player.fireRate = Math.min(this.fireRateLevel * 10, 90);
            
            // Crit chance: convert level (0-10) to percentage (0-100%)
            this.game.player.critChance = this.critChanceLevel * 10;
        }
    }
    
    /**
     * Update the UI to reflect current stat levels
     */
    updateUI() {
        if (this.ui) {
            // Round to 1 decimal place for display
            this.ui.updateDamage(this.damageLevel.toFixed(1));
            this.ui.updateFireRate(this.fireRateLevel.toFixed(1));
            this.ui.updateCritChance(this.critChanceLevel.toFixed(1));
        }
    }
    
    /**
     * Increase damage level by the specified amount
     * @param {number} amount - Amount to increase (default: 0.5)
     * @returns {boolean} - Whether the upgrade was successful
     */
    increaseDamageLevel(amount = 0.5) {
        if (this.damageLevel >= this.MAX_LEVEL) {
            return false; // Already at max level
        }
        
        // Increase level, capped at MAX_LEVEL
        this.damageLevel = Math.min(this.damageLevel + amount, this.MAX_LEVEL);
        
        // Update player stats and UI
        this.updatePlayerStats();
        this.updateUI();
        
        return true;
    }
    
    /**
     * Increase fire rate level by the specified amount
     * @param {number} amount - Amount to increase (default: 0.5)
     * @returns {boolean} - Whether the upgrade was successful
     */
    increaseFireRateLevel(amount = 0.5) {
        if (this.fireRateLevel >= this.MAX_LEVEL) {
            return false; // Already at max level
        }
        
        // Increase level, capped at MAX_LEVEL
        this.fireRateLevel = Math.min(this.fireRateLevel + amount, this.MAX_LEVEL);
        
        // Update player stats and UI
        this.updatePlayerStats();
        this.updateUI();
        
        return true;
    }
    
    /**
     * Increase critical hit chance level by the specified amount
     * @param {number} amount - Amount to increase (default: 0.5)
     * @returns {boolean} - Whether the upgrade was successful
     */
    increaseCritChanceLevel(amount = 0.5) {
        if (this.critChanceLevel >= this.MAX_LEVEL) {
            return false; // Already at max level
        }
        
        // Increase level, capped at MAX_LEVEL
        this.critChanceLevel = Math.min(this.critChanceLevel + amount, this.MAX_LEVEL);
        
        // Update player stats and UI
        this.updatePlayerStats();
        this.updateUI();
        
        return true;
    }
    
    /**
     * Get the current level for a specific stat
     * @param {string} statId - The ID of the stat ('damage', 'firerate', 'crit')
     * @returns {number} - The current level (0-10)
     */
    getStatLevel(statId) {
        switch (statId) {
            case 'damage':
                return this.damageLevel;
            case 'firerate':
                return this.fireRateLevel;
            case 'crit':
                return this.critChanceLevel;
            default:
                console.error(`Unknown stat ID: ${statId}`);
                return 0;
        }
    }
    
    /**
     * Check if a stat is at max level
     * @param {string} statId - The ID of the stat ('damage', 'firerate', 'crit')
     * @returns {boolean} - Whether the stat is at max level
     */
    isStatMaxLevel(statId) {
        return this.getStatLevel(statId) >= this.MAX_LEVEL;
    }
    
    /**
     * Increase a stat level by ID
     * @param {string} statId - The ID of the stat to increase ('damage', 'firerate', 'crit')
     * @param {number} amount - Amount to increase (default: 0.5)
     * @returns {boolean} - Whether the upgrade was successful
     */
    increaseStatLevel(statId, amount = 0.5) {
        switch (statId) {
            case 'damage':
                return this.increaseDamageLevel(amount);
            case 'firerate':
                return this.increaseFireRateLevel(amount);
            case 'crit':
                return this.increaseCritChanceLevel(amount);
            default:
                console.error(`Unknown stat ID: ${statId}`);
                return false;
        }
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlayerStats
    };
} else {
    // For browser environment
    window.PlayerStats = PlayerStats;
}
