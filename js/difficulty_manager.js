/**
 * DifficultyManager - Manages game difficulty progression
 * Handles increasing difficulty over time and providing AI feedback to the player
 */
class DifficultyManager {
    constructor(game) {
        this.game = game;
        
        // Difficulty state
        this.gameTime = 0;
        this.lastDifficultyUpdate = 0;
        this.difficultyLevel = 1;
        this.alienSpeedMultiplier = 1;
        this.alienHealthMultiplier = 1;
        this.alienSpawnRateMultiplier = 1;
        
        // Track shown messages to avoid duplicates
        this.shownMessages = [];
        
        // Difficulty thresholds for introducing new aliens (in seconds)
        this.ALIEN_INTRODUCTION_TIMES = {
            0: ["basicAlien"],
            60: ["basicAlien", "secondAlienType"],
            150: ["basicAlien", "secondAlienType", "thirdAlienType"],
            240: ["basicAlien", "secondAlienType", "thirdAlienType", "fourthAlienType"],
            330: ["basicAlien", "secondAlienType", "thirdAlienType", "fourthAlienType", "fifthAlienType"],
            420: ["basicAlien", "secondAlienType", "thirdAlienType", "fourthAlienType", "fifthAlienType", "sixthAlienType"]
        };
        
        // Difficulty increases per minute
        this.SPEED_INCREASE_PER_MINUTE = 0.08;
        this.HEALTH_INCREASE_PER_MINUTE = 0.15;
        this.SPAWN_RATE_INCREASE_PER_MINUTE = 0.12;
        
        // AI messages for difficulty changes - only at key moments
        this.AI_MESSAGES = [
            // New alien type introductions - announce just 1 second before they appear
            { time: 59, message: "Detecting new alien signatures approaching." },
            { time: 149, message: "More advanced alien species detected." },
            { time: 239, message: "Heavy alien reinforcements incoming!" },
            
            // Major difficulty increases
            { time: 90, message: "Enemy ships increasing speed and durability." },
            { time: 180, message: "Alien attack patterns becoming more aggressive." },
            { time: 300, message: "Alien reinforcements arriving at accelerated rate." }
        ];
    }
    
    /**
     * Update difficulty based on game time
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    update(deltaTime) {
        // Don't update if game is paused or over
        if (this.game.isPaused || this.game.gameOver) return;
        
        // Update game time (in seconds)
        this.gameTime += deltaTime / 1000;
        
        // Update difficulty every second
        if (this.gameTime - this.lastDifficultyUpdate >= 1) {
            this.updateDifficultyMultipliers();
            this.updateAvailableAliens();
            this.checkAIMessages();
            this.lastDifficultyUpdate = this.gameTime;
        }
    }
    
    /**
     * Update difficulty multipliers based on game time
     */
    updateDifficultyMultipliers() {
        const gameTimeMinutes = this.gameTime / 60;
        
        // Calculate difficulty multipliers based on minutes played
        this.alienSpeedMultiplier = 1 + (gameTimeMinutes * this.SPEED_INCREASE_PER_MINUTE);
        this.alienHealthMultiplier = 1 + (gameTimeMinutes * this.HEALTH_INCREASE_PER_MINUTE);
        this.alienSpawnRateMultiplier = 1 + (gameTimeMinutes * this.SPAWN_RATE_INCREASE_PER_MINUTE);
        
        // Update difficulty level (roughly every 2 minutes)
        this.difficultyLevel = Math.floor(gameTimeMinutes / 2) + 1;
    }
    
    /**
     * Update available alien types based on game time
     */
    updateAvailableAliens() {
        // This method is now just for internal tracking
        // The actual alien types are provided by getAvailableAlienTypes()
    }
    
    /**
     * Get available alien types based on game time
     * @returns {Array<number>} Array of available alien type IDs
     */
    getAvailableAlienTypes() {
        // Start with small aliens (type 1) and slug aliens (type 4)
        const availableTypes = [1, 4];
        
        // Add big aliens (type 0) after 2 minutes
        if (this.gameTime >= 120) {
            availableTypes.push(0);
        }
        
        // Add L3 aliens (type 2) after 4 minutes
        if (this.gameTime >= 240) {
            availableTypes.push(2);
        }
        
        // Add L4 aliens (type 3) after 6 minutes
        if (this.gameTime >= 360) {
            availableTypes.push(3);
        }
        
        return availableTypes;
    }
    
    /**
     * Get the current alien spawn interval based on difficulty
     * @returns {number} Spawn interval in milliseconds
     */
    getAlienSpawnInterval() {
        // Get base spawn interval from config
        const baseInterval = GAME_CONFIG.ENEMY.SPAWN_INTERVAL;
        
        // Apply spawn rate multiplier (inverted since lower interval = faster spawning)
        return Math.max(300, baseInterval / this.alienSpawnRateMultiplier);
    }
    
    /**
     * Get current alien speed modifier
     * @returns {number} Speed modifier
     */
    getAlienSpeedModifier() {
        return this.alienSpeedMultiplier;
    }
    
    /**
     * Get current alien health modifier
     * @returns {number} Health modifier
     */
    getAlienHealthModifier() {
        return this.alienHealthMultiplier;
    }
    
    /**
     * Check if any AI messages should be displayed
     */
    checkAIMessages() {
        for (const messageData of this.AI_MESSAGES) {
            // Check if we should display this message (within 1 second of the specified time)
            if (!this.shownMessages.includes(messageData.time) && 
                this.gameTime >= messageData.time && 
                this.gameTime <= messageData.time + 1) {
                
                this.showAIMessage(messageData.message);
                this.shownMessages.push(messageData.time);
            }
        }
    }
    
    /**
     * Display AI message to the player
     * @param {string} message - Message to display
     */
    showAIMessage(message) {
        // Create dialogue box similar to tutorial but simpler
        const dialogueBox = document.createElement('div');
        dialogueBox.className = 'tutorial-dialogue ai-warning';
        
        // Add AI prefix to the message
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = "AI: " + message;
        
        dialogueBox.appendChild(messageText);
        document.body.appendChild(dialogueBox);
        
        // Make the dialogue visible
        dialogueBox.style.display = 'block';
        
        // Slow down the game instead of pausing it completely
        this.game.timeScale = 0.5; // Slow motion effect, but not too slow
        
        // Resume normal speed after 1.5 seconds (shorter time)
        setTimeout(() => {
            this.game.timeScale = 1.0;
        }, 1500);
        
        // Remove dialogue after a few seconds
        setTimeout(() => {
            dialogueBox.classList.add('fade-out');
            setTimeout(() => dialogueBox.remove(), 1000);
        }, 3000);
    }
    
    /**
     * Reset difficulty manager state
     */
    reset() {
        this.gameTime = 0;
        this.lastDifficultyUpdate = 0;
        this.difficultyLevel = 1;
        this.alienSpeedMultiplier = 1;
        this.alienHealthMultiplier = 1;
        this.alienSpawnRateMultiplier = 1;
        this.shownMessages = [];
    }
    
    /**
     * Get current alien speed multiplier
     * @returns {number} Speed multiplier
     */
    getAlienSpeedMultiplier() {
        return this.alienSpeedMultiplier;
    }
    
    /**
     * Get current alien health multiplier
     * @returns {number} Health multiplier
     */
    getAlienHealthMultiplier() {
        return this.alienHealthMultiplier;
    }
    
    /**
     * Get current alien spawn rate multiplier
     * @returns {number} Spawn rate multiplier
     */
    getAlienSpawnRateMultiplier() {
        return this.alienSpawnRateMultiplier;
    }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DifficultyManager
    };
} else {
    // For browser environment
    window.DifficultyManager = DifficultyManager;
}
