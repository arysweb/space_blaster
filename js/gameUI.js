class GameUI {
    constructor() {
        this.heartImage = new Image();
        this.heartImage.src = GAME_CONFIG.VISUAL.HEART_IMAGE;
        
        this.coinImage = new Image();
        this.coinImage.src = GAME_CONFIG.VISUAL.COIN_IMAGE;
        
        // Get DOM elements
        this.scoreElement = document.getElementById('score');
        this.coinsElement = document.getElementById('coins');
        this.critElement = document.getElementById('crit');
        this.damageElement = document.getElementById('damage');
        this.fireRateElement = document.getElementById('fire-rate');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('gameOver');
        this.finalScoreElement = document.getElementById('finalScore');
        this.finalCoinsElement = document.getElementById('finalCoins');
        this.restartButtonElement = document.getElementById('restartButton');
        this.shopButtonElement = document.getElementById('shopButton');
    }
    
    updateScore(score) {
        // Get the current label text
        const currentText = this.scoreElement.innerText;
        // Find the position of the last colon
        const colonIndex = currentText.lastIndexOf(':');
        
        if (colonIndex !== -1) {
            // Preserve the label part (everything up to and including the last colon)
            const labelPart = currentText.substring(0, colonIndex + 1);
            // Update only the value part
            this.scoreElement.innerText = `${labelPart} ${score}`;
        } else {
            // Fallback if no colon is found
            this.scoreElement.innerText = `SCORE: ${score}`;
        }
    }
    
    updateCoins(coins) {
        // Get the current label text
        const currentText = this.coinsElement.innerText;
        // Find the position of the last colon
        const colonIndex = currentText.lastIndexOf(':');
        
        if (colonIndex !== -1) {
            // Preserve the label part (everything up to and including the last colon)
            const labelPart = currentText.substring(0, colonIndex + 1);
            // Update only the value part
            this.coinsElement.innerText = `${labelPart} ${coins}`;
        } else {
            // Fallback if no colon is found
            this.coinsElement.innerText = `COINS: ${coins}`;
        }
    }
    
    updateCritChance(level) {
        // Get the current label text
        const currentText = this.critElement.innerText;
        // Find the position of the last colon
        const colonIndex = currentText.lastIndexOf(':');
        
        if (colonIndex !== -1) {
            // Preserve the label part (everything up to and including the last colon)
            const labelPart = currentText.substring(0, colonIndex + 1);
            // Update only the value part - display as level/10
            this.critElement.innerText = `${labelPart} ${level}/10`;
        } else {
            // Fallback if no colon is found
            this.critElement.innerText = `CRIT: ${level}/10`;
        }
    }
    
    updateDamage(level) {
        // Get the current label text
        const currentText = this.damageElement.innerText;
        // Find the position of the last colon
        const colonIndex = currentText.lastIndexOf(':');
        
        if (colonIndex !== -1) {
            // Preserve the label part (everything up to and including the last colon)
            const labelPart = currentText.substring(0, colonIndex + 1);
            // Update only the value part - display as level/10
            this.damageElement.innerText = `${labelPart} ${level}/10`;
        } else {
            // Fallback if no colon is found
            this.damageElement.innerText = `DAMAGE: ${level}/10`;
        }
    }
    
    updateFireRate(level) {
        // Get the current label text
        const currentText = this.fireRateElement.innerText;
        // Find the position of the last colon
        const colonIndex = currentText.lastIndexOf(':');
        
        if (colonIndex !== -1) {
            // Preserve the label part (everything up to and including the last colon)
            const labelPart = currentText.substring(0, colonIndex + 1);
            // Update only the value part - display as level/10
            this.fireRateElement.innerText = `${labelPart} ${level}/10`;
        } else {
            // Fallback if no colon is found
            this.fireRateElement.innerText = `FIRE RATE: ${level}/10`;
        }
    }
    
    updateLives(lives) {
        // Clear previous hearts
        this.livesElement.innerHTML = '';
        
        // Add heart images
        for (let i = 0; i < lives; i++) {
            const heartImg = document.createElement('img');
            heartImg.src = GAME_CONFIG.VISUAL.HEART_IMAGE;
            heartImg.width = GAME_CONFIG.VISUAL.HEART_SIZE;
            heartImg.height = GAME_CONFIG.VISUAL.HEART_SIZE;
            heartImg.style.marginRight = '5px';
            this.livesElement.appendChild(heartImg);
        }
    }
    
    showGameOver(score, coins) {
        this.gameOverElement.style.display = 'flex';
        this.finalScoreElement.innerText = score;
        this.finalCoinsElement.innerText = coins;
    }
    
    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
    
    setupRestartButton(callback) {
        this.restartButtonElement.addEventListener('click', callback);
    }
    
    setupShopButton(callback) {
        this.shopButtonElement.addEventListener('click', callback);
    }
}