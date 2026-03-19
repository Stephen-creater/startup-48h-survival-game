// 资源管理系统
class ResourceManager {
  constructor() {
    this.initialMoney = 8000;
    this.initialTime = 48;
    this.initialEnergy = 90;
    this.initialNetwork = 3;

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
    if (this.time <= 0) return 'timeup';
    return null;
  }

  // 更新UI
  updateUI() {
    const state = this.getState();

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

    this.updatePressureTone(state);
  }

  // 更新危险状态
  // 当该资源是当前最危险资源且已进入压力区（ratio <= 0.55），或任意资源 <= 30% 时变红
  updateDangerState(resource, percent) {
    const bar = document.getElementById(resource + '-fill').parentElement;
    const resourceItem = bar.closest('.resource-item');
    const ratio = percent / 100;
    const primaryPressure = this.getPrimaryPressure();
    const isPrimary = primaryPressure.resource === resource;
    const inPressureZone = ratio <= 0.55;
    const isDepleted = percent <= 0;
    if ((isPrimary && inPressureZone) || percent <= 30) {
      bar.classList.add('danger');
    } else {
      bar.classList.remove('danger');
    }

    if (resourceItem) {
      resourceItem.classList.toggle('depleted', isDepleted);
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
  getPrimaryPressure(state = this.getState()) {
    const ratios = [
      { resource: 'money', ratio: state.money / this.initialMoney },
      { resource: 'time', ratio: state.time / this.initialTime },
      { resource: 'energy', ratio: state.energy / this.initialEnergy },
      { resource: 'network', ratio: state.network / this.initialNetwork }
    ].sort((a, b) => a.ratio - b.ratio);

    return ratios[0];
  }

  getPressureProfile(state = this.getState()) {
    const pressure = this.getPrimaryPressure(state);

    if (pressure.ratio > 0.55) {
      return {
        resource: 'stable',
        level: 'stable',
        kicker: 'SYSTEM STABLE',
        text: '你暂时还能扛住，但每一个选择都在悄悄缩小你的回旋空间。'
      };
    }

    const level = pressure.ratio <= 0.25 ? 'critical' : 'warning';
    const profiles = {
      money: {
        kicker: level === 'critical' ? 'CASH COLLAPSE' : 'CASH PRESSURE',
        text: level === 'critical'
          ? '现金快断了。你现在不是在做最优解，而是在挑哪一种死法更慢。'
          : '资金开始勒住你的脖子。接下来每一步都像是在给账单让路。'
      },
      time: {
        kicker: level === 'critical' ? 'TIME COLLAPSE' : 'TIME PRESSURE',
        text: level === 'critical'
          ? '时间窗口几乎关死了。你现在做的不是规划，而是抢救。'
          : '时间开始变成敌人。你已经没多少试错空间了。'
      },
      energy: {
        kicker: level === 'critical' ? 'BODY FAILURE' : 'ENERGY PRESSURE',
        text: level === 'critical'
          ? '你的身体快要先退出牌桌了。再硬撑，代价不会只写在数字上。'
          : '精力正在漏光。你还能做选择，但已经很难做出好选择。'
      },
      network: {
        kicker: level === 'critical' ? 'SOCIAL DEBT' : 'NETWORK PRESSURE',
        text: level === 'critical'
          ? '你几乎把能求的人都求完了。接下来最先消失的，不是机会，是回应。'
          : '人脉开始见底。以后每一个求助动作都会更贵，也更难看。'
      }
    };

    return {
      resource: pressure.resource,
      level,
      ...profiles[pressure.resource]
    };
  }

  updatePressureTone(state = this.getState()) {
    const profile = this.getPressureProfile(state);
    const gameScreen = document.getElementById('game-screen');

    if (!gameScreen) {
      return;
    }

    gameScreen.dataset.crisisResource = profile.resource;
    gameScreen.dataset.crisisLevel = profile.level;
  }

  // 获取已耗尽的核心资源
  getDepletedCoreResources() {
    return ['money', 'energy', 'network'].filter(resource => this[resource] <= 0);
  }

  // 是否进入资源锁死状态
  hasResourceLock() {
    return this.getDepletedCoreResources().length > 0;
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

  getChoiceImpactMarkup(choice) {
    const cost = choice.cost || {};
    const gain = choice.gain || {};
    const spent = [];
    const gained = [];

    Object.entries(cost).forEach(([resource, amount]) => {
      if (amount > 0) spent.push(this.formatResourceDelta(resource, amount));
    });

    Object.entries(gain).forEach(([resource, amount]) => {
      if (amount > 0) gained.push(this.formatResourceDelta(resource, amount));
    });

    const parts = [];

    if (spent.length && gained.length) {
      parts.push(
        `<span class="impact-spent">你付出了${spent.join('、')}</span>，<span class="impact-gained">换来了${gained.join('、')}</span>。`
      );
    } else if (spent.length) {
      parts.push(
        `<span class="impact-spent">你付出了${spent.join('、')}</span>，暂时还看不到直接回报。`
      );
    } else if (gained.length) {
      parts.push(
        `<span class="impact-gained">你暂时补回了${gained.join('、')}</span>。`
      );
    } else {
      parts.push('这一步没有直接改变量化资源，但会改变你后面的路。');
    }

    const pressure = this.getPrimaryPressure();
    if (pressure.ratio <= 0.45) {
      const pressureText = {
        money: '现在最危险的是资金，你离账单只差最后一点缓冲。',
        time: '现在最危险的是时间，你几乎没有试错空间了。',
        energy: '现在最危险的是精力，你已经快把自己烧空了。',
        network: '现在最危险的是人脉，你快把能求的人都求完了。'
      };
      parts.push(`<span class="impact-pressure">${pressureText[pressure.resource]}</span>`);
    }

    return parts.join(' ');
  }

  getChoiceTradeSummary(choice) {
    const costs = Object.entries(choice.cost || {}).filter(([, amount]) => amount > 0);
    const gains = Object.entries(choice.gain || {}).filter(([, amount]) => amount > 0);
    const profile = this.getPressureProfile();

    const labelMap = {
      money: '现金流',
      time: '时间窗口',
      energy: '体力',
      network: '人情'
    };

    const choiceSignature = `${choice.text}|${costs.map(([resource]) => resource).join(',')}|${gains.map(([resource]) => resource).join(',')}`;
    const hash = Array.from(choiceSignature).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const pick = (variants) => variants[hash % variants.length];

    let summary = '';
    if (costs.length && gains.length) {
      const [spent] = costs.sort((a, b) => b[1] - a[1]);
      const [earned] = gains.sort((a, b) => b[1] - a[1]);
      summary = pick([
        `你是在拆${labelMap[spent[0]]}，换一口${labelMap[earned[0]]}。`,
        `这一步不轻松，本质上是拿${labelMap[spent[0]]}去换${labelMap[earned[0]]}。`,
        `你把${labelMap[spent[0]]}压下去，只为了把${labelMap[earned[0]]}抬上来。`,
        `眼下的交易很直接：少一点${labelMap[spent[0]]}，多一点${labelMap[earned[0]]}。`
      ]);
    } else if (costs.length) {
      const [spent] = costs.sort((a, b) => b[1] - a[1]);
      summary = pick([
        `这一步像预支${labelMap[spent[0]]}，回报得等后面兑现。`,
        `你先把${labelMap[spent[0]]}垫进去，结果要往后看。`,
        `这不是收获，是先烧一截${labelMap[spent[0]]}去搏后手。`,
        `眼前看不到进账，你只是在拿${labelMap[spent[0]]}换可能性。`
      ]);
    } else if (gains.length) {
      const [earned] = gains.sort((a, b) => b[1] - a[1]);
      summary = pick([
        `这一步更像喘口气，把${labelMap[earned[0]]}补回来。`,
        `你不是在猛冲，只是在给${labelMap[earned[0]]}续命。`,
        `先把${labelMap[earned[0]]}拉起来，后面才谈得上继续。`,
        `这一步的意义很单纯：先补一口${labelMap[earned[0]]}。`
      ]);
    } else {
      summary = pick([
        '这一步改的是路线，不是账面数字。',
        '眼前不会立刻变好，但方向会被改写。',
        '你押的不是收益，是接下来那条路怎么走。',
        '这一步没有立刻回报，真正下注的是判断本身。'
      ]);
    }

    if (profile.level !== 'stable') {
      const emphasisMap = {
        money: [
          '别忘了，现在最紧的是现金。',
          '此刻最贵的不是想法，是手上的钱。',
          '账单已经贴脸了，现金比判断更先见底。'
        ],
        time: [
          '最缺的不是狠劲，是时间。',
          '你现在真正烧不起的是时间窗口。',
          '时间已经不站你这边了。'
        ],
        energy: [
          '你现在最不该乱花的是体力。',
          '再往下烧，先散架的会是你自己。',
          '眼前真正见底的，是身体不是意志。'
        ],
        network: [
          '现在最贵的不是开口，是还能回应你的人。',
          '人情快见底了，这一步会比看上去更贵。',
          '再往下用，人脉就不是资源，是债。'
        ]
      };
      summary += ` ${pick(emphasisMap[profile.resource])}`;
    }

    return summary;
  }

  // 结算页/分享页的人话资源总结
  getResourceStory(state = this.getState(), endingId = '') {
    const ratios = [
      { resource: 'money', ratio: state.money / this.initialMoney },
      { resource: 'time', ratio: state.time / this.initialTime },
      { resource: 'energy', ratio: state.energy / this.initialEnergy },
      { resource: 'network', ratio: state.network / this.initialNetwork }
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

    const endingOverrides = {
      gave_up: {
        summary: '你没有把自己耗光，但你提前离场了。',
        detail: '你保住了人，也保住了退路，但那场你真正想打的仗，已经结束了。',
        share: '我没有输光资源，但我先退出了牌桌。'
      },
      burnout: {
        summary: '你不是输给了选择，你是先输给了身体。',
        detail: '钱和时间都还在流动，但你的身体先按下了停止键。',
        share: '我不是没想继续，是身体先撑不住了。'
      },
      broke: {
        summary: '你不是没有想法，你是现金先见底了。',
        detail: '当账单先于结果到来，很多路会在兑现前就被掐断。',
        share: '我不是先没了方向，是先没了现金。'
      },
      cornered: {
        summary: '你没有立刻倒下，但你已经没有下一步了。',
        detail: '最难受的不是输，而是你清楚地知道，自己已经没有可继续下注的筹码。',
        share: '我不是倒在某一步，我是卡在已经没有路可走。'
      }
    };

    if (endingOverrides[endingId]) {
      return {
        ...endingOverrides[endingId],
        weakestResource: weakest,
        strongestResource: strongest,
        weakestLabel: labels[weakest],
        strongestLabel: labels[strongest]
      };
    }

    return {
      summary: `你保住了${labels[strongest]}，但几乎耗空了${labels[weakest]}。`,
      detail: `${strongNarratives[strongest]}，但${weakNarratives[weakest]}。`,
      share: `我保住了${labels[strongest]}，却把${labels[weakest]}压到了极限。`,
      weakestResource: weakest,
      strongestResource: strongest,
      weakestLabel: labels[weakest],
      strongestLabel: labels[strongest]
    };
  }

  // 资源锁死时的叙事文案
  getResourceLockNarrative() {
    const depleted = this.getDepletedCoreResources();
    const labels = {
      money: '现金已经见底',
      energy: '精力已经归零',
      network: '人情已经借完'
    };
    const details = {
      money: '你连继续下注的最低成本都拿不出来了。',
      energy: '你不是不想继续，而是身体已经不再响应你了。',
      network: '你已经没有还能再打的那通电话了。'
    };

    const primaryLines = depleted.map(resource => labels[resource]);
    const detailLines = depleted.map(resource => details[resource]);

    if (primaryLines.length === 0) {
      const pressure = this.getPrimaryPressure();
      const fallbackLabels = {
        money: '现金不够支撑下一步',
        time: '时间已经不够再试一次',
        energy: '精力已经撑不起任何一个选项',
        network: '人脉已经不够再撬开下一扇门'
      };
      const fallbackDetails = {
        money: '每条路都需要成本，但你已经没有可继续下注的现金。',
        time: '你不是没有想法，而是已经没有时间把它执行出来。',
        energy: '你还能看见选项，但身体已经不再允许你去做。',
        network: '你知道该找谁，但你已经没有多余的人情去换下一次机会。'
      };
      primaryLines.push(fallbackLabels[pressure.resource]);
      detailLines.push(fallbackDetails[pressure.resource]);
    }

    return {
      text: `你盯着屏幕，发现所有还算像样的路都堵死了。\n\n${primaryLines.join('。\n')}。`,
      impact: `${detailLines.join(' ')} 现在不是你不肯选，而是你已经没有可执行的选择了。`
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
