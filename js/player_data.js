/**
 * PlayerData - Manages player data persistence using localStorage
 * This class handles saving and loading player progress including:
 * - Coins
 * - Lives
 * - Upgrade levels (damage, fire rate, crit chance)
 */
class PlayerData {
    constructor() {
        // localStorage key for player data
        this.STORAGE_KEY = 'spaceShooter_playerData';
    }

    /**
     * Save player data to localStorage
     * @param {Object} gameState - Current game state object containing player data
     */
    savePlayerData(gameState) {
        if (!gameState) return;

        const playerData = {
            coins: gameState.coins || 0,
            lives: gameState.lives || GAME_CONFIG.PLAYER.STARTING_LIVES,
            stats: {
                damageLevel: gameState.playerStats.damageLevel || 1.0,
                fireRateLevel: gameState.playerStats.fireRateLevel || 0.0,
                critChanceLevel: gameState.playerStats.critChanceLevel || 0.0
            },
            // Add timestamp for potential future features (e.g., daily rewards)
            lastSaved: Date.now()
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(playerData));
            console.log('Player data saved successfully');
        } catch (error) {
            console.error('Failed to save player data:', error);
        }
    }

    /**
     * Load player data from localStorage
     * @returns {Object|null} - Player data object or null if no data exists
     */
    loadPlayerData() {
        try {
            const savedData = localStorage.getItem(this.STORAGE_KEY);
            if (!savedData) {
                console.log('No saved player data found');
                return null;
            }

            const playerData = JSON.parse(savedData);
            console.log('Player data loaded successfully');
            return playerData;
        } catch (error) {
            console.error('Failed to load player data:', error);
            return null;
        }
    }

    /**
     * Apply loaded player data to the current game state
     * @param {Object} gameState - Current game state to apply saved data to
     * @returns {boolean} - Whether player data was successfully applied
     */
    applyPlayerData(gameState) {
        if (!gameState) return false;

        const playerData = this.loadPlayerData();
        if (!playerData) return false;

        // Apply saved data to game state
        gameState.coins = playerData.coins;
        gameState.lives = playerData.lives;

        // Apply saved stats to player stats manager
        if (gameState.playerStats && playerData.stats) {
            gameState.playerStats.damageLevel = playerData.stats.damageLevel;
            gameState.playerStats.fireRateLevel = playerData.stats.fireRateLevel;
            gameState.playerStats.critChanceLevel = playerData.stats.critChanceLevel;
            
            // Update player stats and UI
            gameState.playerStats.updatePlayerStats();
            gameState.playerStats.updateUI();
        }

        // Update UI
        if (gameState.ui) {
            gameState.ui.updateCoins(gameState.coins);
            gameState.ui.updateLives(gameState.lives);
        }

        console.log('Player data applied to game state');
        return true;
    }

    /**
     * Clear all saved player data
     * Used when player has no more lives and game over is final
     */
    clearPlayerData() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('Player data cleared');
        } catch (error) {
            console.error('Failed to clear player data:', error);
        }
    }

    /**
     * Check if player has saved data
     * @returns {boolean} - Whether player has saved data
     */
    hasPlayerData() {
        return localStorage.getItem(this.STORAGE_KEY) !== null;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PlayerData
    };
} else {
    // For browser environment
    window.PlayerData = PlayerData;
}
