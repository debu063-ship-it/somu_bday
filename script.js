// ==================== FLOATING HEARTS BACKGROUND ====================
function createFloatingHearts() {
    const container = document.getElementById('floating-hearts');
    const hearts = ['💕', '💗', '💖', '💝', '❤️', '🩷', '🤍', '♥️'];
    
    for (let i = 0; i < 20; i++) {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (8 + Math.random() * 12) + 's';
        heart.style.animationDelay = (Math.random() * 10) + 's';
        heart.style.fontSize = (14 + Math.random() * 18) + 'px';
        container.appendChild(heart);
    }
}

createFloatingHearts();

// ==================== PASSWORD CHECK ====================
const CORRECT_PASSWORD = 'SOOMUUU';

function checkPassword() {
    const input = document.getElementById('password-input');
    const errorMsg = document.getElementById('error-msg');
    const enteredPassword = input.value.toUpperCase().trim();
    
    if (enteredPassword === CORRECT_PASSWORD) {
        // Success! Transition to love meter
        errorMsg.classList.remove('show');
        transitionToScreen('password-screen', 'love-meter-screen');
    } else {
        // Wrong password
        errorMsg.classList.add('show');
        input.classList.add('shake');
        input.value = '';
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);
    }
}

// Allow Enter key to submit
document.getElementById('password-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkPassword();
    }
});

// ==================== SCREEN TRANSITIONS ====================
function transitionToScreen(fromId, toId) {
    const fromScreen = document.getElementById(fromId);
    const toScreen = document.getElementById(toId);
    
    fromScreen.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    fromScreen.style.opacity = '0';
    fromScreen.style.transform = 'scale(0.97)';
    
    setTimeout(() => {
        fromScreen.classList.remove('active');
        fromScreen.style.opacity = '';
        fromScreen.style.transform = '';
        
        toScreen.scrollTop = 0;
        toScreen.classList.add('active');
        toScreen.style.opacity = '0';
        toScreen.style.transform = 'scale(1.02)';
        
        // Ensure love meter is positioned at 0% as soon as it opens
        if (toId === 'love-meter-screen') {
            const slider = document.getElementById('love-slider');
            updateLoveMeter(slider ? slider.value : 0);
        }
        
        requestAnimationFrame(() => {
            toScreen.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            toScreen.style.opacity = '1';
            toScreen.style.transform = 'scale(1)';
        });
    }, 200);
}

// ==================== LOVE METER ====================
let currentLoveValue = 0;
let hasReached100 = false;
let isGaugeDragging = false;

function updateLoveMeter(value) {
    currentLoveValue = parseInt(value);
    
    // Update percentage display
    document.getElementById('love-percentage').textContent = currentLoveValue + '%';
    
    // Update needle rotation (-90deg at 0% pointing left, +90deg at 100% pointing right, pivot at local 0,0)
    const angle = -90 + (currentLoveValue / 100) * 180;
    const needle = document.getElementById('gauge-needle');
    if (needle) {
        needle.setAttribute('transform', `rotate(${angle})`);
    }
    
    // Highlight segments up to current progress
    const activeIndex = currentLoveValue === 0 ? 0 : Math.min(6, Math.floor((currentLoveValue / 100) * 7));
    for (let i = 0; i < 7; i++) {
        const seg = document.getElementById(`gauge-seg-${i}`);
        if (seg) {
            if (i <= activeIndex && currentLoveValue > 0) {
                seg.classList.add('active');
            } else {
                seg.classList.remove('active');
            }
        }
    }
    
    // Update cat and message
    const catCrying = document.getElementById('cat-crying');
    const catHappy = document.getElementById('cat-happy');
    const catMessage = document.getElementById('cat-message');
    
    if (currentLoveValue < 30) {
        catCrying.classList.add('active');
        catHappy.classList.remove('active');
        catMessage.textContent = 'Only that much? 😢';
        catMessage.style.color = '#4a1a2e';
    } else if (currentLoveValue < 60) {
        catCrying.classList.add('active');
        catHappy.classList.remove('active');
        catMessage.textContent = 'Come on, you can do better! 🥺';
        catMessage.style.color = '#8b4a6b';
    } else if (currentLoveValue < 90) {
        catCrying.classList.remove('active');
        catHappy.classList.add('active');
        catMessage.textContent = 'Getting warmer! 💕';
        catMessage.style.color = '#e91e63';
    } else if (currentLoveValue < 100) {
        catCrying.classList.remove('active');
        catHappy.classList.add('active');
        catMessage.textContent = 'Almost there! 🥰';
        catMessage.style.color = '#c94b6e';
    } else {
        catCrying.classList.remove('active');
        catHappy.classList.add('active');
        catMessage.textContent = 'Correct answer! 💖';
        catMessage.style.color = '#e91e63';
        
        if (!hasReached100) {
            hasReached100 = true;
            showNextButton();
        }
    }
    
    // Update slider track gradient
    const slider = document.getElementById('love-slider');
    if (slider) {
        slider.style.background = `linear-gradient(90deg, #c94b6e 0%, #c94b6e ${currentLoveValue}%, #fce4ec ${currentLoveValue}%, #fce4ec 100%)`;
    }
}

// Dial Interactive Dragging/Clicking on the Gauge Arc
function handleGaugeInteraction(e) {
    const svg = document.getElementById('love-gauge');
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Relative coordinates in SVG viewBox (300 x 170)
    const scaleX = 300 / rect.width;
    const scaleY = 170 / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const dx = x - 150;
    const dy = 145 - y; // positive upwards
    
    if (dy >= -20) {
        let angleRad = Math.atan2(dy, dx);
        if (angleRad < 0) angleRad = 0;
        if (angleRad > Math.PI) angleRad = Math.PI;
        // Percentage: left (PI) = 0%, right (0) = 100%
        const pct = Math.round(((Math.PI - angleRad) / Math.PI) * 100);
        const clampedPct = Math.max(0, Math.min(100, pct));
        
        const slider = document.getElementById('love-slider');
        if (slider) slider.value = clampedPct;
        updateLoveMeter(clampedPct);
    }
}

const gaugeSvg = document.getElementById('love-gauge');
if (gaugeSvg) {
    gaugeSvg.addEventListener('mousedown', (e) => {
        isGaugeDragging = true;
        handleGaugeInteraction(e);
    });
    window.addEventListener('mousemove', (e) => {
        if (isGaugeDragging) handleGaugeInteraction(e);
    });
    window.addEventListener('mouseup', () => {
        isGaugeDragging = false;
    });
    gaugeSvg.addEventListener('touchstart', (e) => {
        isGaugeDragging = true;
        handleGaugeInteraction(e);
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
        if (isGaugeDragging) handleGaugeInteraction(e);
    }, { passive: true });
    window.addEventListener('touchend', () => {
        isGaugeDragging = false;
    });
}

function showNextButton() {
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.classList.add('show');
    }
}

// ==================== GIFTS SCREEN ====================
function showGiftsScreen() {
    transitionToScreen('love-meter-screen', 'gifts-screen');
    
    // Show birthday pop overlay after transition
    setTimeout(() => {
        showBirthdayPop();
    }, 800);
}

function showBirthdayPop() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'birthday-pop-overlay';
    overlay.innerHTML = `
        <div class="birthday-pop-content">
            <h1>🎉 Happy Birthday Somuuu! 🎉</h1>
            <p>Your surprises are waiting for you 💕</p>
            <button onclick="closeBirthdayPop(this)">Open My Gifts! 🎁</button>
        </div>
    `;
    document.body.appendChild(overlay);
    
    // Launch confetti
    launchConfetti();
}

function closeBirthdayPop(btn) {
    const overlay = btn.closest('.birthday-pop-overlay');
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
}

// ==================== CONFETTI ====================
function launchConfetti() {
    const colors = ['#e91e63', '#f48fb1', '#fce4ec', '#ff4081', '#f8bbd0', '#c2185b', '#f06292', '#ffcdd2'];
    const shapes = ['circle', 'square', 'triangle'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + 'vw';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.borderRadius = shapes[Math.floor(Math.random() * shapes.length)] === 'circle' ? '50%' : '2px';
            piece.style.width = (6 + Math.random() * 10) + 'px';
            piece.style.height = (6 + Math.random() * 10) + 'px';
            piece.style.animationDuration = (2 + Math.random() * 3) + 's';
            document.body.appendChild(piece);
            
            setTimeout(() => piece.remove(), 5000);
        }, Math.random() * 1500);
    }
}

// ==================== GIFT OPENING ====================
function openGift(giftNumber) {
    const giftBox = document.querySelector(`.gift-box[data-gift="${giftNumber}"]`);
    
    // Animate gift box
    giftBox.style.transition = 'transform 0.3s ease';
    giftBox.style.transform = 'scale(1.15) rotate(-5deg)';
    
    setTimeout(() => {
        giftBox.style.transform = 'scale(0.8) rotate(5deg)';
    }, 150);
    
    setTimeout(() => {
        let targetScreen;
        switch(giftNumber) {
            case 1: targetScreen = 'gift-bouquet'; break;
            case 2: targetScreen = 'gift-music'; break;
            case 3: targetScreen = 'gift-birthday'; break;
        }
        
        giftBox.style.transform = '';
        transitionToScreen('gifts-screen', targetScreen);
    }, 400);
}

function backToGifts() {
    // Find current active gift screen
    const activeGift = document.querySelector('.gift-screen.active');
    if (activeGift) {
        transitionToScreen(activeGift.id, 'gifts-screen');
    }
}

// ==================== MUSIC PLAYER (Visual only) ====================
let isPlaying = false;
let progressInterval = null;
let progressValue = 0;

function togglePlay() {
    const btn = document.getElementById('play-btn');
    const fill = document.getElementById('progress-fill');
    
    isPlaying = !isPlaying;
    
    if (isPlaying) {
        btn.textContent = '⏸️';
        // Animate progress bar
        progressInterval = setInterval(() => {
            progressValue += 0.5;
            if (progressValue > 100) {
                progressValue = 0;
            }
            fill.style.width = progressValue + '%';
        }, 100);
    } else {
        btn.textContent = '▶️';
        clearInterval(progressInterval);
    }
}

// ==================== INITIAL SETUP ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize love meter immediately
    updateLoveMeter(0);
    
    // Focus password input
    setTimeout(() => {
        const passInput = document.getElementById('password-input');
        if (passInput) passInput.focus();
    }, 300);
});
