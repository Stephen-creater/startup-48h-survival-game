// 资源管理系统
class ResourceManager {
  constructor() {
    this.initialMoney = 8000;
    this.initialTime = 48;
    this.initialEnergy = 100;
    this.initialNetwork = 5;

    this.money = this.initialMoney;
    this.time = this.initialTime;
    this.energy = this.initialEnergy;
    this.network = this.initialNetwork;
    this.hour = 0;

    // 用于记录用户的选择路径
    this.flags = [];
    this.choices = [];
  }

  // 消耗资源
  consume(cost) {
    if (cost.money) this.money -= cost.money;
    if (cost.time) this.time -= cost.time;
    if (cost.energy) this.energy -= cost.energy;
    if (cost.network) this.network -= cost.network;

    // 确保资源不为负数（除了检查游戏结束）
    this.money = Math.max(0, this.money);
    this.time = Math.max(0, this.time);
    this.energy = Math.max(0, this.energy);
    this.network = Math.max(0, this.network);

    this.updateUI();
    return this.checkGameOver();
  }

  // 增加资源
  gain(gain) {
    if (gain.money) this.money += gain.money;
    if (gain.time) this.time += gain.time;
    if (gain.energy) this.energy += gain.energy;
    if (gain.network) this.network += gain.network;

    this.updateUI();
  }

  // 添加标记（用于结局判定）
  addFlag(flag) {
    if (!this.flags.includes(flag)) {
      this.flags.push(flag);
    }
  }

  // 记录选择
  recordChoice(nodeId, choiceIndex) {
    this.choices.push({ nodeId, choiceIndex, hour: this.hour });
  }

  // 更新当前小时
  setHour(hour) {
    this.hour = hour;
    document.getElementById('current-hour').textContent = hour;
  }

  // 检查游戏结束条件
  checkGameOver() {
    if (this.money <= 0) return 'broke';
    if (this.energy <= 0) return 'burnout';
    if (this.time <= 0) return 'timeup';
    return null;
  }

  // 更新UI
  updateUI() {
    // 更新金钱
    const moneyPercent = (this.money / this.initialMoney) * 100;
    const moneyFill = document.getElementById('money-fill');
    const moneyValue = document.getElementById('money-value');
    moneyFill.style.width = moneyPercent + '%';
    moneyValue.textContent = '¥' + this.money.toLocaleString();

    // 更新时间
    const timePercent = (this.time / this.initialTime) * 100;
    const timeFill = document.getElementById('time-fill');
    const timeValue = document.getElementById('time-value');
    timeFill.style.width = timePercent + '%';
    timeValue.textContent = this.time + 'h';

    // 更新精力
    const energyPercent = (this.energy / this.initialEnergy) * 100;
    const energyFill = document.getElementById('energy-fill');
    const energyValue = document.getElementById('energy-value');
    energyFill.style.width = energyPercent + '%';
    energyValue.textContent = this.energy;

    // 更新人脉
    const networkPercent = (this.network / this.initialNetwork) * 100;
    const networkFill = document.getElementById('network-fill');
    const networkValue = document.getElementById('network-value');
    networkFill.style.width = networkPercent + '%';
    networkValue.textContent = this.network;

    // 添加危险状态样式
    this.updateDangerState('money', moneyPercent);
    this.updateDangerState('time', timePercent);
    this.updateDangerState('energy', energyPercent);
    this.updateDangerState('network', networkPercent);
  }

  // 更新危险状态
  updateDangerState(resource, percent) {
    const bar = document.getElementById(resource + '-fill').parentElement;
    if (percent <= 30) {
      bar.classList.add('danger');
      // 播放警告音效
      if (typeof audioManager !== 'undefined') {
        audioManager.playWarningSound();
      }
    } else {
      bar.classList.remove('danger');
    }
  }

  // 获取当前状态（用于保存/加载）
  getState() {
    return {
      money: this.money,
      time: this.time,
      energy: this.energy,
      network: this.network,
      hour: this.hour,
      flags: [...this.flags],
      choices: [...this.choices]
    };
  }

  // 恢复状态
  setState(state) {
    this.money = state.money;
    this.time = state.time;
    this.energy = state.energy;
    this.network = state.network;
    this.hour = state.hour;
    this.flags = [...state.flags];
    this.choices = [...state.choices];
    this.updateUI();
    this.setHour(this.hour);
  }

  // 重置资源
  reset() {
    this.money = this.initialMoney;
    this.time = this.initialTime;
    this.energy = this.initialEnergy;
    this.network = this.initialNetwork;
    this.hour = 0;
    this.flags = [];
    this.choices = [];
    this.updateUI();
    this.setHour(0);
  }
}
