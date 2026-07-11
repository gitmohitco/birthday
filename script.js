/* =============================================
   BIRTHDAY WISHING WEBSITE — SCRIPT
   ============================================= */

// --- Configuration ---
const BIRTHDAY_NAME = 'Rosy';
const LETTER_CONTENT = `Dear ${BIRTHDAY_NAME},

Happy Birthday to someone truly special! 🎂

You are someone who lights up every room you walk into. Your smile is contagious, your heart is pure gold.

I feel so blessed to have you in my life. Every moment with you feels like a gift.

May this year bring you all the happiness, love, and joy you deserve. You make the world a better place just by being in it.

With all my love 💝`;

// --- State ---
let currentScreen = 0;
let balloonsPopped = 0;
let isMuted = false;
let audioContext = null;
let musicInterval = null;
let heartInterval = null;
let letterTimeout = null;

// --- Screen IDs ---
const screens = [
  'screen-landing',
  'screen-balloons',
  'screen-candle',
  'screen-bouquet',
  'screen-letter',
  'screen-gift',
  'screen-final'
];

// =============================================
// AUDIO SYSTEM — Web Audio API Birthday Tune
// =============================================

function initAudio() {
  if (audioContext) return;
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    playBirthdayTune();
  } catch (e) {
    console.log('Audio not supported');
  }
}

function playNote(frequency, startTime, duration, type = 'sine') {
  if (!audioContext || isMuted) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
  gain.gain.setValueAtTime(0.08, startTime + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playBirthdayTune() {
  if (!audioContext || isMuted) return;

  // Happy Birthday melody (simplified)
  // Notes: C4=262, D4=294, E4=330, F4=349, G4=392, A4=440, B4=494, C5=523
  const C4 = 262, D4 = 294, E4 = 330, F4 = 349, G4 = 392, A4 = 440, Bb4 = 466, C5 = 523;

  const melody = [
    // Happy Birthday to you
    { note: C4, dur: 0.3 }, { note: C4, dur: 0.3 }, { note: D4, dur: 0.6 }, { note: C4, dur: 0.6 },
    { note: F4, dur: 0.6 }, { note: E4, dur: 1.0 },
    // Happy Birthday to you
    { note: C4, dur: 0.3 }, { note: C4, dur: 0.3 }, { note: D4, dur: 0.6 }, { note: C4, dur: 0.6 },
    { note: G4, dur: 0.6 }, { note: F4, dur: 1.0 },
    // Happy Birthday dear Name
    { note: C4, dur: 0.3 }, { note: C4, dur: 0.3 }, { note: C5, dur: 0.6 }, { note: A4, dur: 0.6 },
    { note: F4, dur: 0.6 }, { note: E4, dur: 0.6 }, { note: D4, dur: 1.0 },
    // Happy Birthday to you
    { note: Bb4, dur: 0.3 }, { note: Bb4, dur: 0.3 }, { note: A4, dur: 0.6 }, { note: F4, dur: 0.6 },
    { note: G4, dur: 0.6 }, { note: F4, dur: 1.2 },
  ];

  const now = audioContext.currentTime + 0.1;
  let t = now;

  melody.forEach(({ note, dur }) => {
    playNote(note, t, dur, 'triangle');
    // Add a soft harmony
    playNote(note * 0.5, t, dur, 'sine');
    t += dur + 0.05;
  });

  const totalDuration = t - now + 1;

  // Loop the tune
  if (musicInterval) clearTimeout(musicInterval);
  musicInterval = setTimeout(() => {
    if (!isMuted) playBirthdayTune();
  }, totalDuration * 1000);
}

function toggleMute() {
  isMuted = !isMuted;
  const btn = document.getElementById('mute-btn');
  btn.textContent = isMuted ? '🔇' : '🔊';

  if (isMuted) {
    if (musicInterval) {
      clearTimeout(musicInterval);
      musicInterval = null;
    }
    if (audioContext) {
      audioContext.suspend();
    }
  } else {
    if (audioContext) {
      audioContext.resume();
      playBirthdayTune();
    } else {
      initAudio();
    }
  }
}

document.getElementById('mute-btn').addEventListener('click', toggleMute);

// =============================================
// FLOATING HEARTS
// =============================================

function createHeart() {
  const container = document.getElementById('hearts-container');
  if (!container) return;

  const heart = document.createElement('div');
  heart.classList.add('floating-heart');
  heart.innerHTML = ['♥', '♡', '💕', '💗', '❤'][Math.floor(Math.random() * 5)];

  const size = Math.random() * 20 + 12;
  const left = Math.random() * 100;
  const duration = Math.random() * 6 + 6;

  heart.style.cssText = `
    left: ${left}%;
    font-size: ${size}px;
    animation-duration: ${duration}s;
    color: hsl(${340 + Math.random() * 30}, 80%, ${65 + Math.random() * 20}%);
  `;

  container.appendChild(heart);

  setTimeout(() => {
    if (heart.parentNode) heart.parentNode.removeChild(heart);
  }, duration * 1000);
}

function startHearts() {
  if (heartInterval) clearInterval(heartInterval);
  heartInterval = setInterval(createHeart, 400);
}

function stopHearts() {
  if (heartInterval) {
    clearInterval(heartInterval);
    heartInterval = null;
  }
}

// Start hearts on load
startHearts();

// =============================================
// SCREEN MANAGEMENT
// =============================================

function goToScreen(index) {
  if (index < 0 || index >= screens.length) return;

  // Start audio on first interaction
  if (!audioContext) initAudio();

  const current = document.getElementById(screens[currentScreen]);
  const next = document.getElementById(screens[index]);

  current.classList.remove('active');

  // Small delay for fade transition
  setTimeout(() => {
    next.classList.add('active');
    currentScreen = index;

    // Init screen-specific logic
    switch (index) {
      case 1: initBalloons(); break;
      case 2: initCandle(); break;
      case 3: initBouquet(); break;
      case 4: initLetter(); break;
      case 5: initGift(); break;
      case 6: initFinal(); break;
    }
  }, 300);
}

// =============================================
// SCREEN 1 — LANDING (No button dodge)
// =============================================

(function initLanding() {
  const btnNo = document.getElementById('btn-no');
  const btnGroup = document.getElementById('btn-group');

  function dodgeButton(e) {
    e.preventDefault();
    e.stopPropagation();

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = btnNo.offsetWidth;
    const btnH = btnNo.offsetHeight;

    // Switch to fixed positioning for dodging
    btnNo.classList.add('dodging');

    // Calculate random position within safe viewport bounds
    const padding = 20;
    const maxX = vw - btnW - padding;
    const maxY = vh - btnH - padding;

    let newX = Math.random() * maxX + padding;
    let newY = Math.random() * maxY + padding;

    // Ensure it doesn't overlap with Yes button
    const btnYes = document.getElementById('btn-yes');
    const yesRect = btnYes.getBoundingClientRect();
    const buffer = 80;

    if (
      newX < yesRect.right + buffer &&
      newX + btnW > yesRect.left - buffer &&
      newY < yesRect.bottom + buffer &&
      newY + btnH > yesRect.top - buffer
    ) {
      newX = (newX + vw / 2) % maxX + padding;
      newY = (newY + vh / 3) % maxY + padding;
    }

    btnNo.style.left = `${newX}px`;
    btnNo.style.top = `${newY}px`;
  }

  // Desktop
  btnNo.addEventListener('mouseenter', dodgeButton);
  // Mobile
  btnNo.addEventListener('touchstart', dodgeButton, { passive: false });
  // Also on click just in case
  btnNo.addEventListener('click', dodgeButton);
})();

// =============================================
// SCREEN 2 — BALLOON POP
// =============================================

function initBalloons() {
  balloonsPopped = 0;
  const wrappers = document.querySelectorAll('.balloon-wrapper');
  wrappers.forEach(w => w.classList.remove('popped'));
  document.getElementById('btn-balloons-continue').classList.remove('btn-visible');
  document.getElementById('btn-balloons-continue').classList.add('btn-hidden');
}

function popBalloon(wrapper) {
  if (wrapper.classList.contains('popped')) return;

  wrapper.classList.add('popped');
  balloonsPopped++;

  // Pop sound effect
  playPopSound();

  // Create confetti burst from balloon position
  const rect = wrapper.getBoundingClientRect();
  createConfettiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

  // Check if all popped
  if (balloonsPopped >= 4) {
    setTimeout(() => {
      const btn = document.getElementById('btn-balloons-continue');
      btn.classList.remove('btn-hidden');
      btn.classList.add('btn-visible');
    }, 800);
  }
}

function playPopSound() {
  if (!audioContext || isMuted) return;
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(600, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.15);

  gain.gain.setValueAtTime(0.1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(audioContext.currentTime);
  osc.stop(audioContext.currentTime + 0.15);
}

function createConfettiBurst(x, y) {
  const colors = ['#e91e63', '#9c27b0', '#ff5722', '#ffc107', '#4caf50', '#2196f3', '#f48fb1'];
  const count = 20;

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.classList.add('confetti-particle');

    const angle = (Math.PI * 2 * i) / count;
    const distance = 60 + Math.random() * 80;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 30;

    particle.style.cssText = `
      left: ${x}px;
      top: ${y}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --tx: ${tx}px;
      --ty: ${ty}px;
      width: ${4 + Math.random() * 6}px;
      height: ${4 + Math.random() * 6}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${0.6 + Math.random() * 0.4}s;
    `;

    document.body.appendChild(particle);
    setTimeout(() => {
      if (particle.parentNode) particle.parentNode.removeChild(particle);
    }, 1200);
  }
}

// =============================================
// SCREEN 3 — CANDLE BLOW
// =============================================

function initCandle() {
  // Reset candle
  const flame = document.getElementById('flame');
  const wishText = document.getElementById('wish-text');
  const blowBtn = document.getElementById('btn-blow');

  if (flame) {
    flame.classList.remove('extinguished');
    flame.style.display = '';
  }
  wishText.classList.remove('visible');
  blowBtn.style.display = '';

  // Remove any leftover smoke
  document.querySelectorAll('.smoke-particle').forEach(s => s.remove());
}

function blowCandle() {
  const flame = document.getElementById('flame');
  const wishText = document.getElementById('wish-text');
  const blowBtn = document.getElementById('btn-blow');

  if (!flame || flame.classList.contains('extinguished')) return;

  // Play blow sound
  playBlowSound();

  // Extinguish flame
  flame.classList.add('extinguished');
  blowBtn.style.display = 'none';

  // Create smoke
  const flameContainer = document.getElementById('flame-container');
  const rect = flameContainer.getBoundingClientRect();
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      const smoke = document.createElement('div');
      smoke.classList.add('smoke-particle');
      smoke.style.cssText = `
        left: ${rect.left + rect.width / 2 - 4 + (Math.random() - 0.5) * 10}px;
        top: ${rect.top - 5}px;
        --sx: ${(Math.random() - 0.5) * 30}px;
        position: fixed;
        z-index: 100;
      `;
      document.body.appendChild(smoke);
      setTimeout(() => {
        if (smoke.parentNode) smoke.parentNode.removeChild(smoke);
      }, 1500);
    }, i * 150);
  }

  // Show wish text
  setTimeout(() => {
    wishText.classList.add('visible');
  }, 800);

  // Auto advance
  setTimeout(() => {
    goToScreen(3);
  }, 3500);
}

function playBlowSound() {
  if (!audioContext || isMuted) return;
  // White noise burst for blow
  const bufferSize = audioContext.sampleRate * 0.3;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const gain = audioContext.createGain();
  gain.gain.setValueAtTime(0.06, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  source.start();
}

// =============================================
// SCREEN 4 — BOUQUET
// =============================================

function initBouquet() {
  const bouquet = document.getElementById('bouquet-img');
  const bubbles = document.querySelectorAll('#messages-container .message-bubble');
  const continueBtn = document.getElementById('btn-bouquet-continue');
  const screen = document.getElementById('screen-bouquet');

  // Reset
  bouquet.classList.remove('show');
  bubbles.forEach(b => b.classList.remove('show'));
  continueBtn.classList.remove('btn-visible');
  continueBtn.classList.add('btn-hidden');
  screen.scrollTop = 0;

  // Animate bouquet in
  setTimeout(() => {
    bouquet.classList.add('show');
  }, 200);

  // Stagger message bubbles
  bubbles.forEach((bubble, i) => {
    const delay = parseInt(bubble.dataset.delay) || (i * 500 + 500);
    setTimeout(() => {
      bubble.classList.add('show');
    }, delay + 600); // +600 for bouquet animation
  });

  // Show continue after all messages
  const lastDelay = parseInt(bubbles[bubbles.length - 1]?.dataset.delay || 3000);
  setTimeout(() => {
    continueBtn.classList.remove('btn-hidden');
    continueBtn.classList.add('btn-visible');
    // Auto-scroll to make button visible
    setTimeout(() => {
      continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, lastDelay + 1500);
}

// =============================================
// SCREEN 5 — LETTER (Typewriter)
// =============================================

function initLetter() {
  const textEl = document.getElementById('letter-text');
  const cursor = document.getElementById('letter-cursor');
  const continueBtn = document.getElementById('btn-letter-continue');
  const screen = document.getElementById('screen-letter');

  // Reset
  textEl.textContent = '';
  cursor.style.display = 'inline-block';
  continueBtn.classList.remove('btn-visible');
  continueBtn.classList.add('btn-hidden');
  screen.scrollTop = 0;

  if (letterTimeout) clearTimeout(letterTimeout);

  let charIndex = 0;

  function typeNext() {
    if (charIndex < LETTER_CONTENT.length) {
      textEl.textContent += LETTER_CONTENT[charIndex];
      charIndex++;

      // Vary speed for natural feel
      const char = LETTER_CONTENT[charIndex - 1];
      let delay = 35;
      if (char === '\n') delay = 200;
      else if (char === '.' || char === '!' || char === '?') delay = 300;
      else if (char === ',') delay = 150;

      letterTimeout = setTimeout(typeNext, delay);
    } else {
      // Typing done
      cursor.style.display = 'none';
      setTimeout(() => {
        continueBtn.classList.remove('btn-hidden');
        continueBtn.classList.add('btn-visible');
        // Auto-scroll to make button visible
        setTimeout(() => {
          continueBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }, 600);
    }
  }

  // Start typing after a brief pause
  setTimeout(typeNext, 800);
}

// =============================================
// SCREEN 6 — GIFT
// =============================================

function initGift() {
  const container = document.getElementById('gift-container');
  container.classList.remove('opening');
}

function openGift() {
  const container = document.getElementById('gift-container');
  if (container.classList.contains('opening')) return;

  container.classList.add('opening');

  // Play a sparkle sound
  playSparkleSound();

  setTimeout(() => {
    goToScreen(6);
  }, 900);
}

function playSparkleSound() {
  if (!audioContext || isMuted) return;
  const now = audioContext.currentTime;

  // Ascending sparkle notes
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.06, now + i * 0.1 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.4);
  });
}

// =============================================
// SCREEN 7 — FINAL
// =============================================

let confettiInterval = null;

function initFinal() {
  // Start celebration confetti
  const container = document.getElementById('celebration-confetti');
  container.innerHTML = '';

  if (confettiInterval) clearInterval(confettiInterval);

  const colors = ['#e91e63', '#9c27b0', '#ff5722', '#ffc107', '#4caf50', '#2196f3', '#f48fb1', '#ff80ab', '#ea80fc'];

  confettiInterval = setInterval(() => {
    if (currentScreen !== 6) {
      clearInterval(confettiInterval);
      confettiInterval = null;
      return;
    }

    for (let i = 0; i < 3; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');

      const x = Math.random() * window.innerWidth;
      const drift = (Math.random() - 0.5) * 200;
      const dur = 3 + Math.random() * 3;
      const size = 6 + Math.random() * 8;
      const shapes = ['50%', '0', '30%'];

      piece.style.cssText = `
        left: ${x}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        --drift: ${drift}px;
        animation-duration: ${dur}s;
        width: ${size}px;
        height: ${size * (0.5 + Math.random())}px;
        border-radius: ${shapes[Math.floor(Math.random() * shapes.length)]};
      `;

      container.appendChild(piece);

      setTimeout(() => {
        if (piece.parentNode) piece.parentNode.removeChild(piece);
      }, dur * 1000);
    }
  }, 200);
}

// =============================================
// REPLAY
// =============================================

function replay() {
  // Stop confetti
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }

  // Clear letter timeout
  if (letterTimeout) {
    clearTimeout(letterTimeout);
    letterTimeout = null;
  }

  // Reset all screens
  balloonsPopped = 0;

  // Reset balloon wrappers
  document.querySelectorAll('.balloon-wrapper').forEach(w => w.classList.remove('popped'));

  // Reset buttons
  ['btn-balloons-continue', 'btn-bouquet-continue', 'btn-letter-continue'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.remove('btn-visible');
      btn.classList.add('btn-hidden');
    }
  });

  // Reset No button
  const btnNo = document.getElementById('btn-no');
  btnNo.classList.remove('dodging');
  btnNo.style.left = '';
  btnNo.style.top = '';

  // Reset gift
  const giftContainer = document.getElementById('gift-container');
  if (giftContainer) giftContainer.classList.remove('opening');

  // Clear celebration confetti
  const confettiContainer = document.getElementById('celebration-confetti');
  if (confettiContainer) confettiContainer.innerHTML = '';

  // Go to first screen
  const currentEl = document.getElementById(screens[currentScreen]);
  currentEl.classList.remove('active');

  setTimeout(() => {
    const landing = document.getElementById(screens[0]);
    landing.classList.add('active');
    currentScreen = 0;
  }, 300);
}

// =============================================
// INITIALIZATION
// =============================================

// Prevent double-tap zoom on iOS
document.addEventListener('touchstart', function () { }, { passive: true });

// Handle visibility change — pause/resume audio
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (audioContext) audioContext.suspend();
    if (musicInterval) clearTimeout(musicInterval);
  } else {
    if (audioContext && !isMuted) {
      audioContext.resume();
      playBirthdayTune();
    }
  }
});
