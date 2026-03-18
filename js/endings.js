// 结局判定系统
const endings = {
  broke: {
    id: 'broke',
    title: '破产',
    percentage: 35,  // 击败35%的玩家（比崩溃和放弃好）
    description: [
      '第48小时，你的银行卡被冻结了。',
      '房东换了门锁。',
      '你的合伙人不再回你的消息。',
      '',
      '这就是创业。',
      '大多数人的故事，都是这样结束的。',
      '',
      '你活了48小时。',
      '只有12%的真实创业者，能活过第一年。'
    ],
    shareText: '我破产了，你能活多久？'
  },

  burnout: {
    id: 'burnout',
    title: '崩溃',
    percentage: 15,  // 击败15%的玩家（比放弃好）
    description: [
      '第36小时，你晕倒在电脑前。',
      '醒来时，你在医院。',
      '医生说你过度劳累。',
      '',
      '你的父母来了。',
      '他们什么都没说，只是抱着你哭。',
      '',
      '创业不是不可以。',
      '但不是用命换。'
    ],
    shareText: '我崩溃了，你能坚持多久？'
  },

  gave_up: {
    id: 'gave_up',
    title: '放弃',
    percentage: 0,  // 最差结局，击败0%
    description: [
      '你重新打开了招聘网站。',
      '你的前老板同意你回去。',
      '一切好像没有发生过。',
      '',
      '但你知道，有些东西变了。',
      '你曾经那么接近梦想。',
      '然后你选择了安全。',
      '',
      '这不是失败。',
      '这只是，你还没准备好。'
    ],
    shareText: '我放弃了，你会怎么选？'
  },

  survive: {
    id: 'survive',
    title: '勉强生存',
    percentage: 95,  // 击败95%的玩家
    description: [
      '第48小时，你交了房租。',
      '你的产品上线了。',
      '虽然只有3个用户。',
      '',
      '但你活下来了。',
      '这比90%的创业者都强。',
      '',
      '接下来呢？',
      '没人知道。',
      '但至少，你还在牌桌上。'
    ],
    shareText: '我活下来了，你能吗？'
  },

  success: {
    id: 'success',
    title: '初步成功',
    percentage: 99.2,  // 击败99.2%的玩家
    description: [
      '第48小时，你拿到了第一笔收入。',
      '¥2000。',
      '不多，但足够让你再活一个月。',
      '',
      '你给父母打了电话。',
      '你说：我可以的。',
      '',
      '这只是开始。',
      '真正的战斗，才刚刚开始。'
    ],
    shareText: '我成功了，只有1%的人能做到'
  },

  no_ethics: {
    id: 'no_ethics',
    title: '不择手段',
    percentage: 99,  // 击败99%的玩家
    description: [
      '你活下来了。',
      '通过违反竞业协议。',
      '通过一些灰色地带的操作。',
      '通过突破了自己的底线。',
      '',
      '你有钱了。',
      '你有客户了。',
      '你也知道自己付出了什么代价。',
      '',
      '创业就是这样。',
      '有时候，生存比规则更重要。'
    ],
    shareText: '我用特殊方式活下来了'
  }
};

// 判定结局
function determineEnding(resources) {
  const { money, energy, time, flags } = resources.getState();

  // 特殊结局：放弃
  if (flags.includes('gave_up')) {
    return endings.gave_up;
  }

  // 特殊结局：崩溃
  if (flags.includes('burnout') || energy <= 0) {
    return endings.burnout;
  }

  // 特殊结局：破产
  if (flags.includes('broke') || money <= 0) {
    return endings.broke;
  }

  // 隐藏结局：不择手段
  if (flags.includes('broke_rules') && flags.includes('has_customer')) {
    return endings.no_ethics;
  }

  // 成功结局：有客户且有钱
  if (money > 5000 && flags.includes('has_customer')) {
    return endings.success;
  }

  // 成功结局：有原型且有钱
  if (money > 3000 && flags.includes('has_prototype') && flags.includes('paid_rent')) {
    return endings.success;
  }

  // 勉强生存：交了房租
  if (flags.includes('paid_rent') || flags.includes('negotiated_rent')) {
    return endings.survive;
  }

  // 默认：破产
  return endings.broke;
}

// 获取结局数据
function getEnding(endingId) {
  return endings[endingId];
}
