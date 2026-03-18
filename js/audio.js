// 音效管理系统
class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.audioContext = null;
    this.typingInterval = null;

    // 初始化
    this.init();
  }

  init() {
    // 立即初始化AudioContext
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('AudioContext初始化失败:', e);
    }

    // 如果浏览器需要用户交互才能播放音频，在首次点击时恢复
    document.addEventListener('click', () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }, { once: true });
  }

  // 生成单次打字音效
  playTypingSound() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 更短促、更轻的打字音
    oscillator.frequency.value = 1200 + Math.random() * 200; // 随机频率增加真实感
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.03, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.03);
  }

  // 开始连续打字音效
  startTypingSound(duration = 1000) {
    if (!this.enabled || !this.audioContext) return;

    this.stopTypingSound(); // 先停止之前的

    const charDelay = 50; // 每50ms一个字符音效
    let elapsed = 0;

    this.typingInterval = setInterval(() => {
      if (elapsed >= duration) {
        this.stopTypingSound();
        return;
      }
      this.playTypingSound();
      elapsed += charDelay;
    }, charDelay);
  }

  // 停止连续打字音效
  stopTypingSound() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  // 生成选择音效（已优化）
  playChoiceSound() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 更柔和的音效
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // 生成按钮音效（用于启动实验等重要按钮）
  playButtonSound() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 柔和的确认音
    oscillator.frequency.value = 500;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // 生成悬停音效
  playHoverSound() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.08);
  }

  // 生成警告音效
  playWarningSound() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 300;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // 切换音效开关
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// 创建全局音效管理器
const audioManager = new AudioManager();
