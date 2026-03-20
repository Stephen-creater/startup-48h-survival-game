// 音效管理系统
class AudioManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.audioContext = null;
    this.typingAudio = null;
    this.bgmAudio = null;
    this.bgmPrimed = false;
    this.bgmBaseVolume = 0.18;
    this.bgmDuckVolume = 0.08;

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

    // 创建打字音效Audio元素，预加载
    this.typingAudio = new Audio();
    this.typingAudio.src = 'assets/sounds/mixkit-hard-laptop-keyboard-typing-2538.wav';
    this.typingAudio.volume = 0.1;
    this.typingAudio.preload = 'auto';

    this.bgmAudio = new Audio();
    this.bgmAudio.src = encodeURI('assets/sounds/压迫感紧张_爱给网_aigei_com.mp3');
    this.bgmAudio.volume = this.bgmBaseVolume;
    this.bgmAudio.loop = true;
    this.bgmAudio.preload = 'auto';

    // 如果浏览器需要用户交互才能播放音频，在首次点击时恢复
    document.addEventListener('click', () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }, { once: true });
  }

  // 播放打字音效（使用Audio元素）
  playTypingSound() {
    if (!this.enabled || !this.typingAudio) return;

    try {
      // 克隆音频以支持快速连续播放
      const sound = this.typingAudio.cloneNode();
      sound.volume = 0.05;
      sound.play().catch(e => console.log('音效播放失败:', e));
    } catch (e) {
      // 如果失败，使用Web Audio API备用方案
      this.playTypingSoundFallback();
    }
  }

  // 备用打字音效（Web Audio API）
  playTypingSoundFallback() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 1200 + Math.random() * 200;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.03);
  }

  // 开始连续打字音效（直接播放完整音频）
  startTypingSound() {
    if (!this.enabled || !this.typingAudio) return;

    this.typingAudio.currentTime = 0;
    this.typingAudio.volume = 0.15;
    // 手机浏览器忽略preload，需在用户手势中直接play()触发加载+播放
    this.typingAudio.play().catch(e => console.log('打字音效播放失败:', e));
  }

  // 停止打字音效
  stopTypingSound() {
    if (this.typingAudio) {
      this.typingAudio.pause();
      this.typingAudio.currentTime = 0;
    }
  }

  primeBgm() {
    if (!this.enabled || !this.bgmAudio || this.bgmPrimed) return;

    this.bgmAudio.muted = true;
    this.bgmAudio.currentTime = 0;
    this.bgmAudio.play()
      .then(() => {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.muted = false;
        this.bgmPrimed = true;
      })
      .catch(() => {
        this.bgmAudio.muted = false;
      });
  }

  startBgm() {
    if (!this.enabled || !this.bgmAudio) return;

    this.bgmAudio.muted = false;
    this.bgmAudio.volume = this.bgmBaseVolume;
    this.bgmAudio.play().catch(e => console.log('BGM播放失败:', e));
  }

  stopBgm() {
    if (!this.bgmAudio) return;

    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
  }

  duckBgm(duration = 260) {
    if (!this.bgmAudio || this.bgmAudio.paused) return;

    this.bgmAudio.volume = this.bgmDuckVolume;
    window.clearTimeout(this.bgmDuckTimer);
    this.bgmDuckTimer = window.setTimeout(() => {
      if (this.bgmAudio) {
        this.bgmAudio.volume = this.bgmBaseVolume;
      }
    }, duration);
  }

  // 生成选择音效（已优化）
  playChoiceSound() {
    if (!this.enabled || !this.audioContext) return;
    this.duckBgm(240);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 更柔和的音效
    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);
  }

  // 生成按钮音效（用于启动实验等重要按钮）
  playButtonSound() {
    if (!this.enabled || !this.audioContext) return;
    this.duckBgm(340);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // 极其柔和的确认音
    oscillator.frequency.value = 300;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.06, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  // 生成悬停音效
  playHoverSound() {
    if (!this.enabled || !this.audioContext) return;
    this.duckBgm(120);

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = 400;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.07, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.08);
  }

  // 生成警告音效
  playWarningSound() {
    if (!this.enabled || !this.audioContext) return;
    this.duckBgm(320);

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
