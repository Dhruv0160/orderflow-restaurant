/**
 * Web Audio API notification sounds
 * No external sound files needed — works entirely offline
 */

let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

/**
 * Play a notification beep
 * @param {'newOrder' | 'orderReady' | 'success'} type
 */
export function playSound(type = "newOrder") {
  try {
    const ctx = getAudioContext();

    switch (type) {
      case "newOrder":
        // Urgent double beep — higher pitch
        playBeep(ctx, 880, 0.15, 0);
        playBeep(ctx, 880, 0.15, 0.2);
        playBeep(ctx, 1100, 0.2, 0.45);
        break;

      case "orderReady":
        // Pleasant ascending chime
        playBeep(ctx, 523, 0.12, 0);
        playBeep(ctx, 659, 0.12, 0.15);
        playBeep(ctx, 784, 0.2, 0.3);
        break;

      case "success":
        // Quick confirmation blip
        playBeep(ctx, 600, 0.08, 0);
        playBeep(ctx, 900, 0.12, 0.1);
        break;

      default:
        playBeep(ctx, 660, 0.15, 0);
    }
  } catch (e) {
    // Audio not supported or blocked — fail silently
    console.warn("Audio playback failed:", e);
  }
}

function playBeep(ctx, frequency, duration, startDelay) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";

  // Smooth envelope to avoid clicks
  const now = ctx.currentTime + startDelay;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);

  oscillator.start(now);
  oscillator.stop(now + duration);
}

/**
 * Setup listener for new order notifications
 */
export function setupNewOrderSound() {
  const handler = () => playSound("newOrder");
  window.addEventListener("newOrderArrived", handler);
  return () => window.removeEventListener("newOrderArrived", handler);
}
