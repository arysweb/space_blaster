let player;
let watchedEnough = false;
let rewardClaimed = false;
let lastWatchTime = 0;
const REWARD_AMOUNT = 50;
const REQUIRED_WATCH_TIME = 15;
const COOLDOWN_TIME = 120; // 120 seconds cooldown

function initVideoModal() {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Start cooldown check
    updateCooldownTimer();
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtubePlayer', {
        videoId: 'FUiu-cdu6mA',
        playerVars: {
            'autoplay': 0,
            'controls': 1,
            'rel': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'fs': 0
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startRewardTimer();
        startProgressBar();
    } else if (event.data === YT.PlayerState.PAUSED) {
        stopProgressBar();
    } else if (event.data === YT.PlayerState.ENDED) {
        if (watchedEnough) {
            giveReward();
        }
        resetVideoModal();
    }
}

function startRewardTimer() {
    setTimeout(() => {
        watchedEnough = true;
        const closeButton = document.getElementById('closeVideoButton');
        closeButton.textContent = 'CLAIM REWARD';
        closeButton.classList.add('claim');
    }, REQUIRED_WATCH_TIME * 1000);
}

function startProgressBar() {
    const progressBar = document.getElementById('videoProgress');
    progressBar.style.width = '0%';
    progressBar.style.transition = 'width 30s linear';
    setTimeout(() => progressBar.style.width = '100%', 50);
}

function stopProgressBar() {
    const progressBar = document.getElementById('videoProgress');
    const width = getComputedStyle(progressBar).width;
    progressBar.style.transition = 'none';
    progressBar.style.width = width;
}

function giveReward() {
    if (!rewardClaimed) {
        rewardClaimed = true;
        const game = window.gameInstance;
        if (game) {
            game.coins += REWARD_AMOUNT;
            game.ui.updateCoins(game.coins);
            // Only update shop if it exists and is open
            if (game.shop?.isOpen && typeof game.shop.updateShopCoins === 'function') {
                game.shop.updateShopCoins();
            }
            showRewardNotification();
            lastWatchTime = Date.now(); // Start cooldown
            updateCooldownTimer();
            setTimeout(resetVideoModal, 2000); // Close after notification
        }
    }
}

function showRewardNotification() {
    const notification = document.getElementById('rewardNotification');
    notification.style.display = 'block';
    
    // Hide notification after animation
    setTimeout(() => {
        notification.style.display = 'none';
    }, 1500);
}

function resetVideoModal() {
    document.getElementById('videoModal').style.display = 'none';
    if (player) {
        player.stopVideo();
    }
    watchedEnough = false;
    rewardClaimed = false;
    const closeButton = document.getElementById('closeVideoButton');
    closeButton.textContent = 'CLOSE';
    closeButton.classList.remove('claim');
    const progressBar = document.getElementById('videoProgress');
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';
}

function showVideoModal() {
    // Check cooldown first
    const now = Date.now();
    const timeLeft = (COOLDOWN_TIME * 1000) - (now - lastWatchTime);
    if (timeLeft > 0) {
        return; // Still on cooldown
    }
    
    document.getElementById('videoModal').style.display = 'flex';
    if (player) {
        const progressBar = document.getElementById('videoProgress');
        progressBar.style.width = '0%';
        progressBar.style.transition = 'none';
        player.playVideo();
    }
}

function updateCooldownTimer() {
    const watchButton = document.getElementById('watchVideoBtn');
    const now = Date.now();
    const timeLeft = (COOLDOWN_TIME * 1000) - (now - lastWatchTime);
    
    if (timeLeft > 0) {
        const seconds = Math.ceil(timeLeft / 1000);
        watchButton.classList.add('cooldown');
        watchButton.disabled = true;
        watchButton.setAttribute('data-cooldown', `WAIT ${seconds}s`);
        setTimeout(updateCooldownTimer, 1000);
    } else {
        watchButton.classList.remove('cooldown');
        watchButton.disabled = false;
        watchButton.removeAttribute('data-cooldown');
    }
}

// Event Listeners
document.getElementById('closeVideoButton').addEventListener('click', function() {
    if (watchedEnough) {
        giveReward();
    }
    resetVideoModal();
});

document.getElementById('watchVideoBtn').addEventListener('click', function() {
    showVideoModal();
});

// Initialize
initVideoModal();
