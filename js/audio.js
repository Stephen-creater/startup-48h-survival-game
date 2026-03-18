// 音效管理系统
class AudioManager {
  constructor() {
    this.enabled = true;
    this.sounds = {};
    this.audioContext = null;
    this.initialized = false;
  }

  // 初始化音效（使用Web Audio API生成）
  initSounds() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    // 恢复AudioContext（如果被暂停）
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.initialized = true;
  }

  // 生成打字音效
  playTypingSound() {
    if (!this.enabled) return;

    // 确保AudioContext已初始化
    if (!this.initialized) {
      this.initSounds();
    }

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 800 + Math.random() * 200;
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }

  // 生成警告音效
  playWarningSound() {
    if (!this.enabled) return;

    // 确保AudioContext已初始化
    if (!this.initialized) {
      this.initSounds();
    }

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 400;
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }

  // 生成选择音效
  playChoiceSound() {
    if (!this.enabled) return;

    // 确保AudioContext已初始化
    if (!this.initialized) {
      this.initSounds();
    }

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 600;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }

  // 生成资源消耗音效
  playResourceSound() {
    if (!this.enabled) return;

    // 确保AudioContext已初始化
    if (!this.initialized) {
      this.initSounds();
    }

    try {
      const ctx = this.audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = 300;
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }

  // 切换音效开关
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // 设置音效状态
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// 创建全局音效管理器
const audioManager = new AudioManager();
