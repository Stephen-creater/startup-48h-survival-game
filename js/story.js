// 剧情节点数据（MVP版本：6个关键节点）
const storyNodes = [
  {
    id: 'hour_0',
    hour: 0,
    title: '辞职的夜晚',
    scene: '你的出租屋，深夜 23:47',
    image: 'assets/images/scenes/hour_0.jpg',
    description: '你刚刚按下了辞职信的发送键。手指还在颤抖。\n\n银行余额：¥8,000\n距离房租到期：48小时\n\n你知道，这是一场赌博。',
    choices: [
      {
        text: '立刻开始写商业计划书',
        cost: { energy: 20, time: 4 },
        consequence: '凌晨4点，你完成了一份粗糙的BP。\n\n你的眼睛布满血丝，但至少有了一个开始。',
        nextNode: 'hour_8',
        flags: ['has_bp']
      },
      {
        text: '先睡一觉，明天再说',
        cost: { time: 8 },
        gain: { energy: 30 },
        consequence: '你睡了一觉，恢复了精力。\n\n但当你醒来时，已经是早上8点了。\n\n你浪费了宝贵的时间。',
        nextNode: 'hour_8',
        flags: []
      },
      {
        text: '给大学同学打电话，拉他入伙',
        cost: { network: 1, time: 2 },
        consequence: '你的同学犹豫了很久。\n\n"我考虑一下吧。"\n\n你知道这意味着什么。',
        nextNode: 'hour_8',
        flags: ['contacted_friend']
      },
      {
        text: '算了，还是找工作吧',
        cost: {},
        consequence: '你打开了招聘网站。\n\n鼠标悬停在"投递简历"按钮上。\n\n然后你关掉了页面。',
        nextNode: 'gave_up',
        flags: ['gave_up']
      }
    ],
    blackMirrorText: '你的前老板看到了辞职信。\n他没有回复。\n\n凌晨2点，你还在盯着空白的文档。'
  },

  {
    id: 'hour_8',
    hour: 8,
    title: '第一个考验',
    scene: '咖啡厅，早上8点',
    image: 'assets/images/scenes/hour_8.jpg',
    description: '你需要一个技术合伙人。\n\n没有技术，你的想法只是空中楼阁。\n\n但你没有钱，也没有时间。',
    choices: [
      {
        text: '花¥5000找外包开发',
        cost: { money: 5000, time: 4 },
        consequence: '外包接了单。\n\n但3天后，他消失了。\n\n钱打了水漂。',
        nextNode: 'hour_16',
        flags: ['outsource_failed']
      },
      {
        text: '去技术社区发帖招人',
        cost: { time: 6, energy: 15 },
        consequence: '你在各个社区发了帖子。\n\n收到了20多个回复。\n\n但大多数人只是来看热闹的。',
        nextNode: 'hour_16',
        flags: ['posted_recruitment']
      },
      {
        text: '自己学编程',
        cost: { time: 12, energy: 30 },
        requirements: { energy: 45, time: 18 },
        unavailableReason: '你现在的精力和时间窗口都不够，再硬啃技术只会把自己拖垮。',
        consequence: '你打开了编程教程。\n\n12小时后，你写出了第一行代码。\n\n然后发现，根本跑不起来。',
        nextNode: 'hour_16',
        flags: ['tried_coding']
      },
      {
        text: '联系前公司的技术同事',
        cost: { network: 2, time: 4 },
        requirements: { network: 2 },
        unavailableReason: '你手里的可用人情已经不够了，这一步没人会替你兜底。',
        consequence: '他答应了。\n\n但他有全职工作，只能晚上帮你。\n\n总比没有强。',
        nextNode: 'hour_16',
        flags: ['has_tech_partner']
      }
    ],
    blackMirrorText: '你的银行卡收到了一条短信。\n\n"您的余额已不足¥10,000。"\n\n房东明天会来收房租。'
  },

  {
    id: 'hour_16',
    hour: 16,
    title: '道德困境',
    scene: '你的出租屋，下午4点',
    image: 'assets/images/scenes/hour_16.jpg',
    description: '16小时过去了。\n\n你的项目毫无进展。\n\n这时，你想起了前公司的客户资源。\n\n你有他们的联系方式。',
    choices: [
      {
        text: '联系前公司客户（违反竞业协议）',
        cost: { network: 1, time: 4 },
        requirements: { network: 2 },
        unavailableReason: '你已经没有多余的人情去冒这个险了。',
        consequence: '你发了消息。\n\n有3个客户回复了。\n\n你知道这是不对的。\n\n但你也知道，创业没有对错，只有生存。',
        nextNode: 'hour_24',
        flags: ['broke_rules', 'has_customer']
      },
      {
        text: '从零开始找客户',
        cost: { time: 8, energy: 25 },
        requirements: { energy: 40 },
        unavailableReason: '陌生开发太吃体力了，你现在已经没有状态去硬打50个电话。',
        consequence: '你打了50个陌生电话。\n\n49个人挂断了。\n\n1个人说"发个资料我看看"。\n\n然后就没有然后了。',
        nextNode: 'hour_24',
        flags: ['cold_call']
      },
      {
        text: '放弃B2B，转做C端产品',
        cost: { time: 8, energy: 20 },
        requirements: { time: 20 },
        unavailableReason: '转向意味着重开一局，但你的时间窗口已经不支持你这么做了。',
        consequence: '你决定换方向。\n\n重新开始。\n\n但时间已经不多了。',
        nextNode: 'hour_24',
        flags: ['pivoted']
      },
      {
        text: '回去求前老板，撤回辞职',
        cost: {},
        consequence: '你拨通了前老板的电话。\n\n"我..."\n\n你说不出口。',
        nextNode: 'gave_up',
        flags: ['gave_up']
      }
    ],
    blackMirrorText: '你的手指悬停在前客户的微信上。\n\n你知道这是不对的。\n\n但你的银行余额只剩¥3000了。\n\n房租是¥4000。'
  },

  {
    id: 'hour_24',
    hour: 24,
    title: '中点危机',
    scene: '你的出租屋，深夜12点',
    image: 'assets/images/scenes/hour_24.jpg',
    description: '24小时过去了。\n\n你已经一天没吃饭了。\n\n你的精力即将耗尽。\n\n但你不能停下来。',
    choices: [
      {
        text: '继续死磕当前方向',
        cost: { energy: 25, time: 8 },
        requirements: { energy: 35 },
        unavailableReason: '你现在的精力已经不足以再硬扛 8 小时了。',
        consequence: '你咬牙坚持。\n\n8小时后，你有了一个粗糙的原型。\n\n虽然很丑，但至少能用。',
        nextNode: 'hour_36',
        flags: ['has_prototype']
      },
      {
        text: '找投资人，试图融资',
        cost: { network: 2, time: 6, energy: 20 },
        requirements: { network: 3 },
        unavailableReason: '融资不是发愿望清单，你现在的人脉厚度还不够支撑这一步。',
        consequence: '你约了3个投资人。\n\n2个没回复。\n\n1个说"太早期了，等你有数据再聊"。',
        nextNode: 'hour_36',
        flags: ['tried_fundraising']
      },
      {
        text: '接一个外包项目赚钱',
        cost: { time: 16, energy: 30 },
        requirements: { energy: 45 },
        unavailableReason: '这种高强度外包会直接把你榨干，你现在的状态扛不住。',
        gain: { money: 8000 },
        consequence: '你接了一个紧急外包项目。\n\n16小时不眠不休。\n\n赚了¥8000。\n\n但你的创业项目停滞了。',
        nextNode: 'hour_36',
        flags: ['did_outsource']
      },
      {
        text: '睡2小时，恢复精力',
        cost: { time: 2 },
        gain: { energy: 40 },
        consequence: '你倒在床上。\n\n2小时后，闹钟响了。\n\n你感觉好多了。',
        nextNode: 'hour_36',
        flags: []
      }
    ],
    blackMirrorText: '系统提示：只有18%的玩家能活过24小时。\n\n你是其中之一。\n\n但接下来会更难。'
  },

  {
    id: 'hour_36',
    hour: 36,
    title: '极限时刻',
    scene: '你的出租屋，中午12点',
    image: 'assets/images/scenes/hour_36.jpg',
    description: '36小时。\n\n你已经30小时没睡觉了。\n\n你的手在发抖。\n\n你开始出现幻觉。',
    choices: [
      {
        text: '喝咖啡硬撑',
        cost: { money: 50, energy: 10 },
        gain: { energy: 20 },
        requirements: { energy: 15 },
        unavailableReason: '你已经不是困了，是身体快要断电了，咖啡顶不上来。',
        consequence: '你喝了第5杯咖啡。\n\n心跳加速。\n\n你感觉自己快要爆炸了。',
        nextNode: 'hour_48',
        flags: ['overdose_caffeine']
      },
      {
        text: '睡4小时',
        cost: { time: 4 },
        gain: { energy: 50 },
        consequence: '你倒头就睡。\n\n4小时后，你醒了。\n\n时间只剩8小时了。',
        nextNode: 'hour_48',
        flags: []
      },
      {
        text: '吃药（安非他明）',
        cost: { money: 200, energy: 20 },
        gain: { energy: 40 },
        requirements: { energy: 20 },
        unavailableReason: '你已经太虚了，这一步不是提神，是把自己推向崩溃。',
        consequence: '你吃了药。\n\n瞬间清醒。\n\n但你知道，这是在透支生命。',
        nextNode: 'hour_48',
        flags: ['took_drugs']
      },
      {
        text: '我撑不住了...',
        cost: {},
        consequence: '你倒在了电脑前。\n\n醒来时，你在医院。',
        nextNode: 'burnout',
        flags: ['burnout']
      }
    ],
    blackMirrorText: '你的父母打来了电话。\n\n你没有接。\n\n你知道他们会说什么。\n\n"回来吧，别折腾了。"'
  },

  {
    id: 'hour_48',
    hour: 48,
    title: '终局',
    scene: '你的出租屋，晚上11点',
    image: 'assets/images/scenes/hour_48.jpg',
    description: '48小时到了。\n\n房东在敲门。\n\n这是最后的时刻。',
    choices: [
      {
        text: '交房租，继续战斗',
        cost: { money: 4000 },
        consequence: '你交了房租。\n\n银行余额：¥' + (8000 - 4000) + '\n\n你还活着。',
        nextNode: 'ending',
        flags: ['paid_rent']
      },
      {
        text: '跟房东求情，再给我一周',
        cost: { network: 1 },
        consequence: '房东看着你。\n\n"一周。最后一周。"\n\n你赢得了时间。',
        nextNode: 'ending',
        flags: ['negotiated_rent']
      },
      {
        text: '我没钱了...',
        cost: {},
        consequence: '房东换了门锁。\n\n你的东西被扔在了楼下。',
        nextNode: 'broke',
        flags: ['broke']
      }
    ],
    blackMirrorText: '48小时前，你按下了辞职信的发送键。\n\n48小时后，你站在这里。\n\n这就是创业。'
  }
];

// 获取节点
function getNode(nodeId) {
  return storyNodes.find(node => node.id === nodeId);
}

// 获取下一个节点
function getNextNode(currentNodeId, choiceIndex) {
  const currentNode = getNode(currentNodeId);
  if (!currentNode) return null;

  const choice = currentNode.choices[choiceIndex];
  if (!choice) return null;

  return choice.nextNode;
}
