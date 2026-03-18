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
    } else {
      bar.classList.remove('danger');
    }
  }

  // 获取单个资源标签
  getResourceLabel(resource) {
    const labels = {
      money: '资金',
      time: '时间',
      energy: '精力',
      network: '人脉'
    };
    return labels[resource] || resource;
  }

  // 格式化资源变化文案
  formatResourceDelta(resource, value) {
    if (resource === 'money') return `¥${value.toLocaleString()}`;
    if (resource === 'time') return `${value}小时`;
    return `${value}${resource === 'network' ? '点人脉' : '点精力'}`;
  }

  // 判断当前选择是否可执行
  getChoiceAvailability(choice) {
    const cost = choice.cost || {};
    const requirements = choice.requirements || {};

    for (const [resource, amount] of Object.entries(cost)) {
      if (amount > 0 && this[resource] < amount) {
        return {
          available: false,
          reason: `${this.getResourceLabel(resource)}不够，这一步你现在付不起。`
        };
      }
    }

    for (const [resource, minimum] of Object.entries(requirements)) {
      if (this[resource] < minimum) {
        return {
          available: false,
          reason: choice.unavailableReason || `${this.getResourceLabel(resource)}还没到线，这一步现在扛不住。`
        };
      }
    }

    return { available: true, reason: '' };
  }

  // 获取当前最危险的资源
  getPrimaryPressure() {
    const ratios = [
      { resource: 'money', ratio: this.money / this.initialMoney },
      { resource: 'time', ratio: this.time / this.initialTime },
      { resource: 'energy', ratio: this.energy / this.initialEnergy },
      { resource: 'network', ratio: this.network / this.initialNetwork }
    ].sort((a, b) => a.ratio - b.ratio);

    return ratios[0];
  }

  // 选择代价的人话总结
  getChoiceImpactSummary(choice) {
    const cost = choice.cost || {};
    const gain = choice.gain || {};
    const spent = [];
    const gained = [];

    Object.entries(cost).forEach(([resource, amount]) => {
      if (amount > 0) {
        spent.push(this.formatResourceDelta(resource, amount));
      }
    });

    Object.entries(gain).forEach(([resource, amount]) => {
      if (amount > 0) {
        gained.push(this.formatResourceDelta(resource, amount));
      }
    });

    let summary = '';
    if (spent.length && gained.length) {
      summary = `你用${spent.join('、')}，换来了${gained.join('、')}。`;
    } else if (spent.length) {
      summary = `你付出了${spent.join('、')}，暂时还看不到直接回报。`;
    } else if (gained.length) {
      summary = `你暂时补回了${gained.join('、')}。`;
    } else {
      summary = '这一步没有直接改变量化资源，但会改变你后面的路。';
    }

    const pressure = this.getPrimaryPressure();
    if (pressure.ratio <= 0.45) {
      const pressureText = {
        money: '现在最危险的是资金，你离账单只差最后一点缓冲。',
        time: '现在最危险的是时间，你几乎没有试错空间了。',
        energy: '现在最危险的是精力，你已经快把自己烧空了。',
        network: '现在最危险的是人脉，你快把能求的人都求完了。'
      };
      summary += ` ${pressureText[pressure.resource]}`;
    }

    return summary;
  }

  // 结算页/分享页的人话资源总结
  getResourceStory() {
    const ratios = [
      { resource: 'money', ratio: this.money / this.initialMoney },
      { resource: 'time', ratio: this.time / this.initialTime },
      { resource: 'energy', ratio: this.energy / this.initialEnergy },
      { resource: 'network', ratio: this.network / this.initialNetwork }
    ].sort((a, b) => a.ratio - b.ratio);

    const weakest = ratios[0].resource;
    const strongest = ratios[ratios.length - 1].resource;
    const labels = {
      money: '现金',
      time: '时间',
      energy: '精力',
      network: '人脉'
    };
    const weakNarratives = {
      money: '账单随时都能把你赶出牌桌',
      time: '你的试错窗口已经被压得很窄',
      energy: '你的身体已经快被你烧空了',
      network: '你几乎把能借的人情都借完了'
    };
    const strongNarratives = {
      money: '至少你手里还有一点继续下注的筹码',
      time: '至少你还保留了一点回旋余地',
      energy: '至少你还没先把自己熬垮',
      network: '至少还有人愿意接你的电话'
    };

    return {
      summary: `你保住了${labels[strongest]}，但几乎耗空了${labels[weakest]}。`,
      detail: `${strongNarratives[strongest]}，但${weakNarratives[weakest]}。`,
      share: `你保住了${labels[strongest]}，却把${labels[weakest]}压到了极限。`
    };
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
