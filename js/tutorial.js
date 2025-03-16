/**
 * Tutorial System for Space Blaster
 * Guides the player through game mechanics
 */
class TutorialSystem {
    constructor(game) {
        // Store reference to game instance
        this.game = game;
        
        // Tutorial state
        this.active = false;
        this.currentStep = 0;
        this.dialogueBox = null;
        this.dialogueContent = null;
        this.dialogueText = null;
        this.continueButton = null;
        this.originalAlienKillHandler = null;
        this.alienCheckInterval = null;
        this.aliensSpawned = 0;
        this.aliensKilled = 0;
        this.waitingForAliensToBeKilled = false;
        this.showInfoBarOnContinue = false;
        this.showingCompletionDialogue = false;
        this.showingFinalDialogue = false;
        this.finalDialogueStep = 0;
        this.showShopButtonOnContinue = false;
        this.showingUpgradeDropDialogue = false;
        
        // Cookie name for tracking tutorial completion
        this.tutorialCookieName = 'spaceblaster_tutorial_seen';
        
        // Store original game state to restore later
        this.originalState = {
            alienSpawning: true,
            mysteryBoxSpawning: true,
            playerShooting: true,
            infoBarVisible: true,
            shopButtonVisible: true
        };
        
        // Tutorial dialogue steps
        this.tutorialSteps = [
            {
                text: "AI: Good. You're aboard in one piece."
            },
            {
                text: "Commander: What the hell just happened?"
            },
            {
                text: "AI: The emergency protocol kicked in. You were teleported!"
            },
            {
                text: "AI: The Blaster's sensors are picking up incoming alien ships."
            },
            {
                text: "Commander: How long?"
            },
            {
                text: "AI: Too late. They're here! Hold them off while I bring the systems online!",
                action: "spawnAliensAndEnableShooting"
            }
        ];
        
        // Tutorial completion dialogue after all aliens are killed
        this.completionDialogue = [
            {
                text: "AI: Nice work, Commander. I managed to restore some of the Blaster's systems and im working on getting everything else online.",
                action: "showInfoBar"
            }
        ];
        
        // Final dialogue after info bar is shown
        this.finalDialogue = [
            {
                text: "AI: All systems operational. The upgrade shop is now available.",
                action: "prepareShopButton"
            },
            {
                text: "AI: I'll scan for more resources. Good luck, Commander—you'll need it."
            }
        ];
        
        // Upgrade drop dialogue that fades out after 3 seconds
        this.upgradeDropDialogue = [
            {
                text: "AI: Commander, I've managed to restore a supply system. I can generate random upgrades—but with my systems unstable, I can't guarantee what you'll get."
            }
        ];
        
        // Initialize the tutorial system
        this.initialize();
    }
    
    /**
     * Initialize the tutorial system
     */
    initialize() {
        try {
            console.log('Initializing tutorial system...');
            
            // Create tutorial dialogue elements if they don't exist
            this.createDialogueElements();
            
            // Get references to tutorial elements
            this.dialogueBox = document.getElementById('tutorial-dialogue');
            this.dialogueContent = document.getElementById('tutorial-content');
            this.nextButton = document.getElementById('tutorial-next');
            
            if (!this.dialogueBox) {
                console.error('Tutorial dialogue box not found');
                return;
            }
            
            // Add event listener to next button
            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => this.nextStep());
            }
            
            // Check if we already have a game instance
            if (window.gameInstance) {
                console.log('Found game instance in window.gameInstance');
                this.game = window.gameInstance;
                
                // Only start tutorial if it hasn't been seen today
                if (!this.hasTutorialBeenSeenToday()) {
                    setTimeout(() => this.start(), 1000);
                } else {
                    console.log('Tutorial already seen today, skipping');
                    // Make sure the game is fully started
                    this.completeWithMysteryBoxes();
                }
            } else {
                // Listen for game loaded event
                console.log('Waiting for game to load...');
                window.addEventListener('gameLoaded', (event) => {
                    console.log('Game loaded event received');
                    
                    // Get reference to game instance
                    if (event.detail && event.detail.game) {
                        this.game = event.detail.game;
                    } else if (window.gameInstance) {
                        this.game = window.gameInstance;
                    }
                    
                    if (!this.game) {
                        console.error('Game instance not found after load');
                        return;
                    }
                    
                    // Only start tutorial if it hasn't been seen today
                    if (!this.hasTutorialBeenSeenToday()) {
                        console.log('Starting tutorial...');
                        // Start tutorial after a short delay to ensure game is fully loaded
                        setTimeout(() => this.start(), 1000);
                    } else {
                        console.log('Tutorial already seen today, skipping');
                        // Make sure the game is fully started
                        this.completeWithMysteryBoxes();
                    }
                });
                
                // Fallback: Check for game instance after a delay
                setTimeout(() => {
                    if (!this.game && window.gameInstance) {
                        console.log('Found game instance in fallback');
                        this.game = window.gameInstance;
                        
                        // Only start tutorial if it hasn't been seen today
                        if (!this.hasTutorialBeenSeenToday()) {
                            this.start();
                        } else {
                            console.log('Tutorial already seen today, skipping');
                            // Make sure the game is fully started
                            this.completeWithMysteryBoxes();
                        }
                    }
                }, 2000);
            }
            
            console.log('Tutorial system initialized successfully');
        } catch (error) {
            console.error('Error initializing tutorial system:', error);
        }
    }
    
    /**
     * Create dialogue elements for the tutorial
     */
    createDialogueElements() {
        try {
            // Check if dialogue box already exists
            if (document.getElementById('tutorial-dialogue')) {
                console.log('Tutorial dialogue elements already exist');
                return;
            }
            
            console.log('Creating tutorial dialogue elements');
            
            // Create tutorial dialogue container
            const dialogueBox = document.createElement('div');
            dialogueBox.id = 'tutorial-dialogue';
            dialogueBox.className = 'tutorial-dialogue';
            dialogueBox.style.display = 'none'; // Initially hidden
            
            // Create dialogue content
            const dialogueContent = document.createElement('div');
            dialogueContent.id = 'tutorial-content';
            dialogueBox.appendChild(dialogueContent);
            
            // Create next button
            const nextButton = document.createElement('button');
            nextButton.id = 'tutorial-next';
            nextButton.textContent = 'CONTINUE';
            dialogueBox.appendChild(nextButton);
            
            // Add to document
            document.body.appendChild(dialogueBox);
            
            console.log('Tutorial dialogue elements created');
        } catch (error) {
            console.error('Error creating dialogue elements:', error);
        }
    }
    
    /**
     * Start the tutorial
     */
    start() {
        try {
            console.log('Starting tutorial');
            
            if (!this.game) {
                console.error('Game instance not found');
                return;
            }
            
            // Set tutorial as active
            this.active = true;
            this.currentStep = 0;
            this.aliensSpawned = 0;
            this.aliensKilled = 0;
            this.waitingForAliensToBeKilled = false;
            
            // Store original game state
            this.storeOriginalState();
            
            // Disable game mechanics during tutorial
            this.disableGameMechanics();
            
            // Set tutorial flag in game
            this.game.isTutorialActive = true;
            
            // Hide shop button immediately
            this.hideShopButton();
            
            // Show first dialogue step
            this.showDialogue();
            
            console.log('Tutorial started');
        } catch (error) {
            console.error('Error starting tutorial:', error);
        }
    }
    
    /**
     * Set up tracking for alien kills
     */
    setupAlienKillTracking() {
        try {
            if (this.game) {
                console.log('Setting up alien kill tracking');
                
                // Clear any existing interval to prevent duplicates
                if (this.alienCheckInterval) {
                    clearInterval(this.alienCheckInterval);
                    this.alienCheckInterval = null;
                }
                
                // Store reference to tutorial system for use in interval
                const self = this;
                
                // Set up interval to check for alien kills
                this.alienCheckInterval = setInterval(() => {
                    if (self.game && self.game.alienManager && self.waitingForAliensToBeKilled) {
                        // Count remaining aliens
                        const remainingAliens = self.game.alienManager.getAliens().length;
                        const killedAliens = self.aliensSpawned - remainingAliens;
                        
                        // Update killed count if it's higher
                        if (killedAliens > self.aliensKilled) {
                            self.aliensKilled = killedAliens;
                            console.log(`Aliens killed: ${self.aliensKilled}/${self.aliensSpawned}`);
                        }
                        
                        // Check if all aliens are killed
                        if (self.aliensKilled >= self.aliensSpawned && remainingAliens === 0) {
                            console.log('All aliens killed, showing completion dialogue');
                            
                            // Clear the interval once all aliens are killed
                            clearInterval(self.alienCheckInterval);
                            self.alienCheckInterval = null;
                            
                            // Reset the flag to prevent multiple calls
                            self.waitingForAliensToBeKilled = false;
                            
                            // Show the completion dialogue
                            self.showCompletionDialogue();
                        }
                    }
                }, 500); // Check every 500ms
                
                console.log('Alien kill tracking set up successfully');
            }
        } catch (error) {
            console.error('Error setting up alien kill tracking:', error);
        }
    }
    
    /**
     * Store the original game state to restore later
     */
    storeOriginalState() {
        try {
            if (this.game) {
                console.log('Storing original game state');
                
                // Store alien spawning state
                if (this.game.alienManager) {
                    this.originalState.alienSpawning = !this.game.alienManager.isPaused;
                }
                
                // Store mystery box spawning state
                if (this.game.mysteryBoxManager) {
                    this.originalState.mysteryBoxSpawning = !this.game.mysteryBoxManager.isPaused;
                }
                
                // Store player shooting state
                this.originalState.playerShooting = this.game.canPlayerShoot;
                
                // Store info bar visibility state
                this.originalState.infoBarVisible = this.game.infoBarVisible;
                
                // Store shop button visibility state
                this.originalState.shopButtonVisible = true; // Default to true
            }
        } catch (error) {
            console.error('Error storing original game state:', error);
        }
    }
    
    /**
     * Disable game mechanics during tutorial
     */
    disableGameMechanics() {
        try {
            if (this.game) {
                console.log('Disabling game mechanics for tutorial');
                
                // Disable alien spawning
                if (this.game.alienManager) {
                    console.log('Disabling alien spawning');
                    this.game.alienManager.isPaused = true;
                    
                    // Clear existing aliens
                    if (typeof this.game.alienManager.reset === 'function') {
                        this.game.alienManager.reset();
                    } else if (Array.isArray(this.game.alienManager.aliens)) {
                        this.game.alienManager.aliens = [];
                    }
                    
                    if (this.game.alienManager.alienSpawnerTimeout) {
                        clearTimeout(this.game.alienManager.alienSpawnerTimeout);
                    }
                }
                
                // Disable mystery box spawning
                if (this.game.mysteryBoxManager) {
                    console.log('Disabling mystery box spawning');
                    this.game.mysteryBoxManager.isPaused = true;
                    
                    if (this.game.mysteryBoxManager.mysteryBoxTimeout) {
                        clearTimeout(this.game.mysteryBoxManager.mysteryBoxTimeout);
                    }
                    
                    // Clear existing mystery boxes
                    if (Array.isArray(this.game.mysteryBoxManager.mysteryBoxes)) {
                        this.game.mysteryBoxManager.mysteryBoxes = [];
                    }
                }
                
                // Disable player shooting
                console.log('Disabling player shooting');
                this.game.canPlayerShoot = false;
                
                // Hide info bar
                console.log('Hiding info bar');
                this.game.infoBarVisible = false;
                
                // Hide shop button
                console.log('Hiding shop button');
                if (this.game.ui) {
                    this.game.ui.updateShopButtonVisibility(false);
                }
            }
        } catch (error) {
            console.error('Error disabling game mechanics:', error);
        }
    }
    
    /**
     * Show the current dialogue step
     */
    showDialogue() {
        try {
            if (!this.dialogueBox || !this.dialogueContent) {
                console.error('Dialogue elements not found');
                return;
            }
            
            // Get current step
            const step = this.tutorialSteps[this.currentStep];
            if (!step) {
                console.error('Tutorial step not found');
                return;
            }
            
            console.log('Showing dialogue step', this.currentStep);
            
            // Create dialogue content
            const content = document.createElement('div');
            
            // Add text
            const text = document.createElement('p');
            text.textContent = step.text;
            content.appendChild(text);
            
            // Clear previous content
            this.dialogueContent.innerHTML = '';
            this.dialogueContent.appendChild(content);
            
            // Show dialogue box
            this.dialogueBox.style.display = 'block';
            
            console.log('Dialogue displayed');
        } catch (error) {
            console.error('Error showing dialogue:', error);
        }
    }
    
    /**
     * Show the completion dialogue after all aliens are killed
     */
    showCompletionDialogue() {
        try {
            console.log('Showing completion dialogue');
            
            // Make sure we're not already showing the completion dialogue
            if (!this.showingCompletionDialogue) {
                this.showingCompletionDialogue = true;
                
                // Make sure the info bar is hidden
                if (this.game) {
                    this.game.infoBarVisible = false;
                    if (this.game.ui) {
                        this.game.ui.updateInfoBarVisibility(false);
                    }
                }
                
                // Show the dialogue box
                if (this.dialogueBox) {
                    this.dialogueBox.style.display = 'block';
                    
                    // Set the dialogue text
                    if (this.dialogueContent && this.completionDialogue && this.completionDialogue.length > 0) {
                        this.dialogueContent.innerHTML = '';
                        const text = document.createElement('p');
                        text.textContent = this.completionDialogue[0].text;
                        this.dialogueContent.appendChild(text);
                        
                        // Execute action if present
                        if (this.completionDialogue[0].action) {
                            this.executeAction(this.completionDialogue[0].action);
                        }
                    }
                }
                
                // Make sure the shop button is hidden
                this.hideShopButton();
            }
        } catch (error) {
            console.error('Error showing completion dialogue:', error);
        }
    }
    
    /**
     * Move to the next tutorial step
     */
    nextStep() {
        try {
            // Check if tutorial is active
            if (!this.active) return;
            
            console.log('Moving to next step');
            
            // If we're showing the final dialogue, handle it
            if (this.showingFinalDialogue) {
                // Check if we need to show the shop button
                if (this.showShopButtonOnContinue && this.finalDialogueStep === 0) {
                    console.log('Showing shop button with fade effect');
                    this.showShopButtonOnContinue = false; // Reset the flag
                    
                    // Show the shop button with fade effect
                    if (this.game && this.game.ui) {
                        this.game.ui.updateShopButtonVisibility(true, true); // Use fade effect
                    }
                }
                
                this.finalDialogueStep++;
                
                // If we've reached the end of the final dialogue, start the game but wait 10 seconds before showing the upgrade drop dialogue
                if (this.finalDialogueStep >= this.finalDialogue.length) {
                    console.log('Final dialogue completed, starting game without mystery boxes');
                    
                    // Hide the dialogue box
                    if (this.dialogueBox) {
                        this.dialogueBox.style.display = 'none';
                    }
                    
                    // Reset the flag
                    this.showingFinalDialogue = false;
                    
                    // Start the game without mystery boxes
                    this.startGameWithoutMysteryBoxes();
                    
                    // Wait 10 seconds and then show the upgrade drop dialogue
                    setTimeout(() => {
                        console.log('Showing upgrade drop dialogue after delay');
                        this.showUpgradeDropDialogue();
                    }, 10000);
                    
                    return;
                }
                
                // Otherwise, show the next final dialogue step
                this.showFinalDialogueStep(this.finalDialogueStep);
                return;
            }
            
            // If we're showing the completion dialogue, show the info bar and then the final dialogue
            if (this.showingCompletionDialogue) {
                console.log('Completion dialogue acknowledged, showing info bar');
                
                // Show info bar with fade effect if flagged
                if (this.showInfoBarOnContinue && this.game) {
                    console.log('Showing info bar with fade effect');
                    this.game.infoBarVisible = true;
                    if (this.game.ui) {
                        this.game.ui.updateInfoBarVisibility(true, true); // Use fade effect
                    }
                    
                    // Make sure the shop button stays hidden
                    this.hideShopButton();
                    
                    // Hide the dialogue box temporarily
                    if (this.dialogueBox) {
                        this.dialogueBox.style.display = 'none';
                    }
                    
                    // Wait 1 second and then show the final dialogue
                    setTimeout(() => {
                        this.showFinalDialogue();
                    }, 1000);
                }
                
                return;
            }
            
            // Get current step
            const currentStep = this.tutorialSteps[this.currentStep];
            
            // Move to next step
            this.currentStep++;
            
            // Execute action for previous step if it exists
            if (currentStep && currentStep.action) {
                console.log('Executing action:', currentStep.action);
                this.executeAction(currentStep.action);
            }
            
            // Check if tutorial is complete
            if (this.currentStep >= this.tutorialSteps.length) {
                console.log('Tutorial dialogue complete, waiting for aliens to be killed');
                // Hide dialogue until all aliens are killed
                if (this.dialogueBox) {
                    this.dialogueBox.style.display = 'none';
                }
                return;
            }
            
            // Show next dialogue
            this.showDialogue();
        } catch (error) {
            console.error('Error moving to next step:', error);
        }
    }
    
    /**
     * Execute action for the current step
     */
    executeAction(action) {
        try {
            switch (action) {
                case 'spawnAliensAndEnableShooting':
                    console.log('Action: Spawning aliens and enabling shooting');
                    
                    // Enable player shooting
                    if (this.game) {
                        this.game.canPlayerShoot = true;
                        
                        // Spawn 10 aliens
                        if (this.game.alienManager) {
                            // Make sure alien manager is not paused
                            this.game.alienManager.isPaused = false;
                            
                            // Set flag to track alien kills
                            this.waitingForAliensToBeKilled = true;
                            this.aliensSpawned = 10;
                            this.aliensKilled = 0;
                            
                            // Spawn 10 aliens
                            for (let i = 0; i < 10; i++) {
                                setTimeout(() => {
                                    if (this.game && this.game.alienManager && this.game.alienManager.spawnAlien) {
                                        this.game.alienManager.spawnAlien();
                                    }
                                }, i * 200); // Spawn each alien with a small delay
                            }
                            
                            // Make sure alien kill tracking is set up
                            this.setupAlienKillTracking();
                        }
                    }
                    break;
                    
                case 'showInfoBar':
                    console.log('Action: Preparing to show info bar on continue');
                    
                    // Set flag to show info bar when player clicks continue
                    this.showInfoBarOnContinue = true;
                    
                    // Do NOT set the info bar visible here, it will be shown when the player clicks continue
                    break;
                    
                case 'prepareShopButton':
                    console.log('Action: Preparing to show shop button on continue');
                    
                    // Set flag to show shop button when player clicks continue
                    this.showShopButtonOnContinue = true;
                    break;
                    
                default:
                    console.warn('Unknown action:', action);
                    break;
            }
        } catch (error) {
            console.error('Error executing action:', error);
        }
    }
    
    /**
     * Complete the tutorial
     */
    complete() {
        // Call the implementation method
        this.completeWithoutInfoBarChange();
    }
    
    /**
     * Complete the tutorial without changing info bar visibility
     */
    completeWithoutInfoBarChange() {
        try {
            console.log('Completing tutorial');
            
            // Set tutorial as inactive
            this.active = false;
            
            // Hide dialogue box
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'none';
            }
            
            // Restore original game state except for mystery boxes, aliens, and shop button
            this.restoreGameStateKeepShopButton();
            
            // Set tutorial flag in game
            if (this.game) {
                this.game.isTutorialActive = false;
            }
            
            // Clear alien check interval if it exists
            if (this.alienCheckInterval) {
                clearInterval(this.alienCheckInterval);
                this.alienCheckInterval = null;
            }
            
            console.log('Tutorial completed');
        } catch (error) {
            console.error('Error completing tutorial:', error);
        }
    }
    
    /**
     * Restore the original game state
     */
    restoreGameState() {
        try {
            if (this.game) {
                console.log('Restoring game state');
                
                // Keep alien spawning disabled
                if (this.game.alienManager) {
                    console.log('Keeping alien spawning disabled');
                    this.game.alienManager.isPaused = true;
                }
                
                // Keep mystery box spawning disabled
                if (this.game.mysteryBoxManager) {
                    console.log('Keeping mystery box spawning disabled');
                    this.game.mysteryBoxManager.isPaused = true;
                }
                
                // Restore player shooting
                this.game.canPlayerShoot = this.originalState.playerShooting;
                
                // Restore info bar visibility
                this.game.infoBarVisible = this.originalState.infoBarVisible;
                
                // Keep shop button hidden - direct DOM manipulation
                console.log('Keeping shop button hidden');
                this.hideShopButton();
            }
        } catch (error) {
            console.error('Error restoring game state:', error);
        }
    }
    
    /**
     * Restore the original game state but keep the shop button visible
     */
    restoreGameStateKeepShopButton() {
        try {
            if (this.game) {
                console.log('Restoring game state but keeping shop button visible');
                
                // Enable alien spawning to start the game as normal
                if (this.game.alienManager) {
                    console.log('Enabling alien spawning');
                    this.game.alienManager.isPaused = false;
                    
                    // Restart the alien spawner
                    this.game.alienManager.startAlienSpawner();
                }
                
                // Enable mystery box spawning to start the game as normal
                if (this.game.mysteryBoxManager) {
                    console.log('Enabling mystery box spawning');
                    this.game.mysteryBoxManager.isPaused = false;
                    
                    // Restart the mystery box spawner
                    this.game.mysteryBoxManager.scheduleMysteryBoxSpawn();
                }
                
                // Enable cloud spawning
                if (this.game.cloudManager) {
                    console.log('Enabling cloud spawning');
                    this.game.cloudManager.startCloudSpawner();
                }
                
                // Restore player shooting
                this.game.canPlayerShoot = this.originalState.playerShooting;
                
                // Restore info bar visibility
                this.game.infoBarVisible = this.originalState.infoBarVisible;
                
                // Do NOT hide the shop button - it should stay visible
                
                // Set tutorial flag to false
                this.game.isTutorialActive = false;
                
                console.log('Game started normally');
            }
        } catch (error) {
            console.error('Error restoring game state:', error);
        }
    }
    
    /**
     * Start the game without mystery boxes
     */
    startGameWithoutMysteryBoxes() {
        try {
            if (this.game) {
                console.log('Starting game without mystery boxes');
                
                // Enable alien spawning to start the game as normal
                if (this.game.alienManager) {
                    console.log('Enabling alien spawning');
                    this.game.alienManager.isPaused = false;
                    
                    // Restart the alien spawner
                    this.game.alienManager.startAlienSpawner();
                }
                
                // Disable mystery box spawning
                if (this.game.mysteryBoxManager) {
                    console.log('Disabling mystery box spawning');
                    this.game.mysteryBoxManager.isPaused = true;
                    
                    // Clear existing mystery boxes
                    if (Array.isArray(this.game.mysteryBoxManager.mysteryBoxes)) {
                        this.game.mysteryBoxManager.mysteryBoxes = [];
                    }
                }
                
                // Enable cloud spawning
                if (this.game.cloudManager) {
                    console.log('Enabling cloud spawning');
                    this.game.cloudManager.startCloudSpawner();
                }
                
                // Restore player shooting
                this.game.canPlayerShoot = this.originalState.playerShooting;
                
                // Restore info bar visibility
                this.game.infoBarVisible = this.originalState.infoBarVisible;
                
                // Do NOT hide the shop button - it should stay visible
                
                // Keep the tutorial active until the mystery box dialogue is shown
                // We'll set it to false in completeWithMysteryBoxes
                this.game.isTutorialActive = true;
                
                console.log('Game started without mystery boxes');
            }
        } catch (error) {
            console.error('Error starting game without mystery boxes:', error);
        }
    }
    
    /**
     * Hide the shop button
     */
    hideShopButton() {
        try {
            console.log('Hiding shop button');
            const shopButton = document.getElementById('shopButton');
            if (shopButton) {
                shopButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error hiding shop button:', error);
        }
    }
    
    /**
     * Show the shop button
     */
    showShopButton() {
        try {
            console.log('Showing shop button');
            const shopButton = document.getElementById('shopButton');
            if (shopButton) {
                shopButton.style.display = 'block';
            }
        } catch (error) {
            console.error('Error showing shop button:', error);
        }
    }
    
    /**
     * Prepare the shop button
     */
    prepareShopButton() {
        try {
            console.log('Preparing shop button');
            const shopButton = document.getElementById('shopButton');
            if (shopButton) {
                shopButton.style.display = 'block';
            }
        } catch (error) {
            console.error('Error preparing shop button:', error);
        }
    }
    
    /**
     * Show the final dialogue
     */
    showFinalDialogue() {
        try {
            console.log('Showing final dialogue');
            
            // Make sure we're not already showing the final dialogue
            if (!this.showingFinalDialogue) {
                this.showingFinalDialogue = true;
                
                // Show the first step of the final dialogue
                this.showFinalDialogueStep(0);
            }
        } catch (error) {
            console.error('Error showing final dialogue:', error);
        }
    }
    
    /**
     * Show a step of the final dialogue
     */
    showFinalDialogueStep(stepIndex) {
        try {
            console.log('Showing final dialogue step', stepIndex);
            
            // Make sure the dialogue box is visible
            if (this.dialogueBox) {
                this.dialogueBox.style.display = 'block';
            }
            
            // Set the dialogue text
            if (this.dialogueContent && this.finalDialogue && this.finalDialogue.length > stepIndex) {
                this.dialogueContent.innerHTML = '';
                const text = document.createElement('p');
                text.textContent = this.finalDialogue[stepIndex].text;
                this.dialogueContent.appendChild(text);
                
                // Execute action if present
                if (this.finalDialogue[stepIndex].action) {
                    this.executeAction(this.finalDialogue[stepIndex].action);
                }
                
                // Always show the continue button
                if (this.nextButton) {
                    this.nextButton.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error showing final dialogue step:', error);
        }
    }
    
    /**
     * Show the upgrade drop dialogue
     */
    showUpgradeDropDialogue() {
        try {
            console.log('Showing upgrade drop dialogue');
            
            // Make sure we're not already showing the upgrade drop dialogue
            if (!this.showingUpgradeDropDialogue) {
                this.showingUpgradeDropDialogue = true;
                
                // Show the dialogue box
                if (this.dialogueBox) {
                    this.dialogueBox.style.display = 'block';
                    
                    // Set the dialogue text
                    if (this.dialogueContent && this.upgradeDropDialogue && this.upgradeDropDialogue.length > 0) {
                        this.dialogueContent.innerHTML = '';
                        const text = document.createElement('p');
                        text.textContent = this.upgradeDropDialogue[0].text;
                        this.dialogueContent.appendChild(text);
                    }
                    
                    // Hide the continue button
                    if (this.nextButton) {
                        this.nextButton.style.display = 'none';
                    }
                }
                
                // Wait 5 seconds and then hide the dialogue box and complete the tutorial
                setTimeout(() => {
                    if (this.dialogueBox) {
                        this.dialogueBox.style.display = 'none';
                    }
                    this.showingUpgradeDropDialogue = false;
                    
                    // Complete the tutorial and start the game with mystery boxes
                    this.completeWithMysteryBoxes();
                }, 5000);
            } else {
                // If the dialogue is already showing, just ensure mystery boxes are enabled
                this.enableMysteryBoxes();
            }
        } catch (error) {
            console.error('Error showing upgrade drop dialogue:', error);
        }
    }
    
    /**
     * Complete the tutorial and start mystery boxes
     */
    completeWithMysteryBoxes() {
        try {
            console.log('Completing tutorial and starting mystery boxes');
            
            // Set tutorial as inactive
            this.active = false;
            
            // Enable mystery boxes
            this.enableMysteryBoxes();
            
            // Enable alien spawning
            if (this.game && this.game.alienManager) {
                console.log('Enabling alien spawning');
                this.game.alienManager.isPaused = false;
                
                // Restart the alien spawner
                this.game.alienManager.startAlienSpawner();
            }
            
            // Clear alien check interval if it exists
            if (this.alienCheckInterval) {
                clearInterval(this.alienCheckInterval);
                this.alienCheckInterval = null;
            }
            
            // Set the game's tutorial flag to false
            if (this.game) {
                this.game.isTutorialActive = false;
            }
            
            // Set cookie to indicate tutorial has been seen today
            this.setTutorialSeenCookie();
            
            console.log('Tutorial completed with mystery boxes enabled');
        } catch (error) {
            console.error('Error completing tutorial with mystery boxes:', error);
        }
    }
    
    /**
     * Enable only the mystery boxes
     */
    enableMysteryBoxes() {
        try {
            if (this.game && this.game.mysteryBoxManager) {
                console.log('Enabling mystery box spawning');
                this.game.mysteryBoxManager.isPaused = false;
                
                // Restart the mystery box spawner
                this.game.mysteryBoxManager.scheduleMysteryBoxSpawn();
                
                console.log('Mystery boxes enabled');
            }
        } catch (error) {
            console.error('Error enabling mystery boxes:', error);
        }
    }
    
    /**
     * Check if the tutorial has been seen today
     * @returns {boolean} True if the tutorial has been seen today
     */
    hasTutorialBeenSeenToday() {
        try {
            // Get all cookies
            const cookies = document.cookie.split(';');
            
            // Look for the tutorial cookie
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                
                // Check if this is the tutorial cookie
                if (cookie.indexOf(this.tutorialCookieName + '=') === 0) {
                    console.log('Tutorial cookie found');
                    return true;
                }
            }
            
            console.log('Tutorial cookie not found');
            return false;
        } catch (error) {
            console.error('Error checking tutorial cookie:', error);
            return false; // Default to showing tutorial if there's an error
        }
    }
    
    /**
     * Set a cookie to indicate the tutorial has been seen today
     */
    setTutorialSeenCookie() {
        try {
            // Get current date
            const now = new Date();
            
            // Set expiration to end of the current day
            const expires = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
            
            // Set the cookie
            document.cookie = `${this.tutorialCookieName}=true; expires=${expires.toUTCString()}; path=/`;
            
            console.log('Tutorial cookie set, expires at end of day');
        } catch (error) {
            console.error('Error setting tutorial cookie:', error);
        }
    }
}

// Create tutorial instance when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('DOM loaded, creating tutorial system');
        
        // Create tutorial instance
        window.tutorialSystem = new TutorialSystem();
        
        // Force start tutorial after a delay if it hasn't started automatically
        // and only if it hasn't been seen today
        setTimeout(() => {
            if (window.tutorialSystem && !window.tutorialSystem.active && window.gameInstance && !window.tutorialSystem.hasTutorialBeenSeenToday()) {
                console.log('Force starting tutorial');
                window.tutorialSystem.game = window.gameInstance;
                window.tutorialSystem.start();
            }
        }, 3000);
    } catch (error) {
        console.error('Error creating tutorial system:', error);
    }
});
