// 剧情节点数据
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
        cost: { energy: 25, time: 4 },
        consequence: '凌晨4点，你完成了一份粗糙的BP。\n\n逻辑漏洞很多，但至少有了一个框架。\n\n你的眼睛布满血丝。',
        nextNode: 'hour_8',
        flags: ['has_bp']
      },
      {
        text: '先睡一觉，明天再说',
        cost: { time: 8 },
        gain: { energy: 25 },
        consequence: '你睡了一觉。\n\n醒来是早上8点，窗外已经大亮。\n\n你比别人晚了整整一个夜晚。',
        nextNode: 'hour_8',
        flags: ['late_start']
      },
      {
        text: '给大学同学打电话，拉他入伙',
        cost: { network: 1, time: 2 },
        consequence: '电话打了40分钟。\n\n他说"我考虑一下"。\n\n你知道这意味着什么，但你还是把他记在了备选名单里。',
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
    title: '第一道墙',
    scene: '咖啡厅，早上',
    image: 'assets/images/scenes/hour_8.jpg',
    description: {
      default: '你需要一个能做事的人。\n\n没有技术，你的想法只是想法。\n\n但你没有钱，也没有时间。',
      overrides: [
        {
          requiredFlag: 'late_start',
          text: '你比预期晚了整整一个夜晚。\n\n咖啡厅里已经坐满了人，你找了个角落。\n\n你需要一个能做事的人，但时间已经不多了。'
        },
        {
          requiredFlag: 'has_bp',
          text: '你带着昨晚写的BP来到咖啡厅。\n\n它很粗糙，但至少说明你认真想过。\n\n现在你需要一个能把它变成现实的人。'
        }
      ]
    },
    choices: [
      {
        text: '用BP吸引技术合伙人（免费入股）',
        requiredFlag: 'has_bp',
        cost: { time: 4, energy: 10 },
        consequence: '你在创业社群里发了BP摘要。\n\n有两个人回复了，其中一个看起来是认真的。\n\n他说需要再聊聊。',
        nextNode: 'hour_16',
        flags: ['has_tech_lead']
      },
      {
        text: '花¥5000找外包开发',
        excludedFlag: 'late_start',
        cost: { money: 5000, time: 4 },
        consequence: '外包接了单，说两周交付。\n\n你松了口气。\n\n但你不知道，他同时接了另外三个单。',
        nextNode: 'hour_16',
        flags: ['hired_outsource']
      },
      {
        text: '去技术社区发帖招人',
        cost: { time: 6, energy: 18 },
        consequence: '你在各个社区发了帖子。\n\n收到了20多个回复，大多数是来看热闹的。\n\n但有一个人的留言让你多看了两眼。',
        nextNode: 'hour_16',
        flags: ['posted_recruitment']
      },
      {
        text: '联系那个大学同学',
        requiredFlag: 'contacted_friend',
        cost: { time: 2 },
        consequence: '他接了电话。\n\n"好吧，我帮你。但我只能晚上有空。"\n\n你知道这不够，但总比没有强。',
        nextNode: 'hour_16',
        flags: ['has_tech_partner']
      },
      {
        text: '自己学编程，从零开始',
        cost: { time: 16, energy: 40 },
        requirements: { energy: 50, time: 20 },
        unavailableReason: '你现在的精力和时间都不够，硬啃技术只会把自己拖垮。',
        consequence: '你关掉了所有社交软件，打开了编程教程。\n\n16小时后，你写出了一个能跑的最简版本。\n\n它很烂，但它是你的。',
        nextNode: 'hour_24',
        flags: ['self_coded', 'has_prototype']
      }
    ],
    blackMirrorText: {
      default: '你的银行卡收到了一条短信。\n\n"您的余额已不足¥10,000。"\n\n房东明天会来收房租。',
      overrides: [
        {
          requiredFlag: 'late_start',
          text: '你比别人晚了一个夜晚。\n\n在创业这件事上，一个夜晚可以是一切。\n\n也可以什么都不是。'
        }
      ]
    }
  },

  {
    id: 'hour_16',
    hour: 16,
    title: '第一个裂缝',
    scene: '你的出租屋，下午',
    image: 'assets/images/scenes/investor_meeting_setback_afternoon.jpg',
    description: {
      default: '16小时过去了。\n\n进展比你预期的慢。\n\n钱在流失，时间在流失，你开始感到慌了。',
      overrides: [
        {
          requiredFlag: 'hired_outsource',
          text: '你付出去的¥5000还没有任何回音。\n\n外包的微信头像还亮着，但消息已读不回。\n\n你开始意识到可能出了问题。'
        },
        {
          requiredFlag: 'has_tech_lead',
          text: '那个对BP感兴趣的人约你见面了。\n\n他问了很多尖锐的问题。\n\n你答上来了一半。'
        }
      ]
    },
    choices: [
      {
        text: '追外包要进度，否则退款',
        requiredFlag: 'hired_outsource',
        cost: { time: 2, energy: 10 },
        consequence: '你发了一条措辞强硬的消息。\n\n外包回复了："代码写了一半，退款不可能。"\n\n你意识到钱已经打了水漂。',
        nextNode: 'hour_24',
        flags: ['outsource_failed']
      },
      {
        text: '继续推进，咬牙把产品做出来',
        cost: { time: 8, energy: 25 },
        consequence: '你把自己关在房间里。\n\n8小时后，你有了一个能演示的原型。\n\n它很粗糙，但它能跑。',
        nextNode: 'hour_24',
        flags: ['has_prototype']
      },
      {
        text: '去找潜在客户，先验证需求',
        cost: { time: 6, energy: 15, network: 1 },
        consequence: '你联系了几个可能有需求的人。\n\n有一个人说"如果真能做出来，我愿意付钱试试"。\n\n这是你第一个真实的信号。',
        nextNode: 'hour_24',
        flags: ['has_lead']
      },
      {
        text: '接一个小外包项目，先把钱补回来',
        cost: { time: 8, energy: 10 },
        gain: { money: 3000 },
        consequence: '你接了一个朋友介绍的小活。\n\n钱补回来了一些。\n\n但你的项目又停了8小时。',
        nextNode: 'hour_24',
        flags: ['did_freelance']
      },
      {
        text: '回去找前老板，撤回辞职',
        cost: {},
        consequence: '你发了一条消息："我想撤回辞职。"\n\n对方回复："位置已经给别人了。"\n\n你盯着屏幕看了很久。',
        nextNode: 'gave_up',
        flags: ['gave_up']
      }
    ],
    blackMirrorText: {
      default: '你的朋友圈里，前同事们在讨论今天的午饭。\n\n你已经不记得自己上次好好吃饭是什么时候了。',
      overrides: [
        {
          requiredFlag: 'hired_outsource',
          text: '¥5000。\n\n那是你银行卡里将近一半的钱。\n\n你开始明白，创业最贵的学费，往往是交给骗子的。'
        }
      ]
    }
  },

  {
    id: 'hour_24',
    hour: 24,
    title: '道德岔路口',
    scene: '回出租屋晚上，深夜',
    image: 'assets/images/scenes/hour_24.jpg',
    description: {
      default: '24小时。\n\n你盯着手机里前公司客户的联系方式。\n\n那是一条捷径。\n\n但你签过竞业协议。',
      overrides: [
        {
          requiredFlag: 'outsource_failed',
          text: '24小时。¥5000没了。\n\n你盯着手机里前公司客户的联系方式。\n\n你已经没有资格挑路了。'
        },
        {
          requiredFlag: 'has_prototype',
          text: '24小时。你手里有一个能跑的原型。\n\n但没有客户，原型只是玩具。\n\n你盯着手机里前公司客户的联系方式。'
        }
      ]
    },
    choices: [
      {
        text: '联系前公司客户（违反竞业协议）',
        cost: { network: 1, time: 4 },
        requirements: { network: 1 },
        unavailableReason: '你已经没有多余的人情去冒这个险了。',
        consequence: '你发了消息。\n\n有两个客户回复了。\n\n你知道这是不对的。\n\n但你也知道，你已经没有别的路了。',
        nextNode: 'hour_36',
        flags: ['broke_rules', 'has_customer']
      },
      {
        text: '老实从零开始找客户',
        cost: { time: 8, energy: 30 },
        requirements: { energy: 40 },
        unavailableReason: '你现在已经没有状态去硬打50个电话了。',
        consequence: '你打了50个mobile电话。\n\n49个人挂断了。\n\n1个人说"发个资料我看看"。\n\n然后就没有然后了。',
        nextNode: 'hour_36',
        flags: ['cold_called']
      },
      {
        text: '接大外包项目回血（¥8000，但要16小时）',
        cost: { time: 16, energy: 35 },
        gain: { money: 8000 },
        requirements: { energy: 40 },
        unavailableReason: '你已经没有精力再接一个16小时的活了。',
        consequence: '你接了一个大外包。\n\n16小时后，钱到账了。\n\n但窗外已经是第三天的早晨。\n\n房东今晚就会来。',
        nextNode: 'hour_36_rich',
        flags: ['did_big_freelance', 'has_money']
      },
      {
        text: '我撑不住了，回去找工作',
        cost: {},
        consequence: '你打开了招聘网站。\n\n这一次，你真的投了简历。',
        nextNode: 'gave_up',
        flags: ['gave_up']
      }
    ],
    blackMirrorText: {
      default: '你的前同事发了一条朋友圈：\n\n"新公司第一天，感觉不错。"\n\n你点了个赞，然后关掉了手机。',
      overrides: [
        {
          requiredFlag: 'has_lead',
          text: '那个说"愿意付钱试试"的人，今天没有回你消息。\n\n你发了一条跟进，对方已读。\n\n没有回复。'
        }
      ]
    }
  },

  {
    id: 'hour_36',
    hour: 36,
    title: '身体极限',
    scene: '你的出租屋，中午',
    image: 'assets/images/scenes/hour_36_apartment_noon.jpg.png',
    description: {
      default: '36小时。\n\n你已经超过30小时没有睡觉了。\n\n手在发抖。\n\n你开始出现幻觉。',
      overrides: [
        {
          requiredFlag: 'broke_rules',
          text: '36小时。\n\n那两个前公司客户还没有明确答复。\n\n你的手在发抖，不知道是因为没睡，还是因为等待。'
        },
        {
          requiredFlag: 'has_customer',
          text: '36小时。\n\n客户说明天要看演示。\n\n你的手在发抖。\n\n你不知道自己能不能撑到明天。'
        }
      ]
    },
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
        gain: { energy: 40 },
        consequence: '你倒头就睡。\n\n4小时后，你醒了。\n\n时间只剩8小时了。\n\n但你的头脑清醒了一些。',
        nextNode: 'hour_48',
        flags: ['took_rest']
      },
      {
        text: '吃药（兴奋作用）',
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
        consequence: '你倒在了电脑前。\n\n醒来时，你在医院。\n\n护士说你是低血糖晕倒的。',
        nextNode: 'burnout',
        flags: ['burnout']
      }
    ],
    blackMirrorText: '你的父母打来了电话。\n\n你没有接。\n\n你知道他们会说什么。\n\n"回来吧，别折腾了。"'
  },

  {
    id: 'hour_36_rich',
    hour: 36,
    title: '有钱，没进展',
    scene: '你的出租屋，清晨',
    image: 'assets/images/scenes/hour_36_rich_apartment_dawn.jpg.png',
    description: '外包的钱到账了。\n\n但你的项目在过去16小时里原地踏步。\n\n房东今晚就来。\n\n你有钱，但你没有任何可以展示的东西。',
    choices: [
      {
        text: '用钱找人，今天内把原型做出来',
        cost: { money: 3000, time: 4, energy: 25 },
        requirements: { energy: 30 },
        unavailableReason: '你已经没有精力去协调一个临时团队了。',
        consequence: '你在自由职业平台上发了一个紧急需求。\n\n有人接了。\n\n4小时后，你有了一个能演示的原型。',
        nextNode: 'hour_48',
        flags: ['has_prototype', 'bought_prototype']
      },
      {
        text: '自己硬做，能做多少做多少',
        cost: { time: 8, energy: 35 },
        requirements: { energy: 40 },
        unavailableReason: '你的身体已经不支持再连续工作8小时了。',
        consequence: '你坐在电脑前，把能做的都做了。\n\n结果比你预期的差，但比什么都没有强。',
        nextNode: 'hour_48',
        flags: ['has_prototype']
      },
      {
        text: '放弃产品，直接用钱交房租撑过去',
        cost: {},
        consequence: '你决定先活下来。\n\n产品的事，以后再说。\n\n如果还有以后的话。',
        nextNode: 'hour_48',
        flags: ['gave_up_product']
      },
      {
        text: '我撑不住了...',
        cost: {},
        consequence: '你倒在了电脑前。\n\n醒来时，你在医院。\n\n护士说你是低血糖晕倒的。',
        nextNode: 'burnout',
        flags: ['burnout']
      }
    ],
    blackMirrorText: '钱是有了。\n\n但你突然意识到，你已经不记得自己为什么要创业了。\n\n是为了钱吗？\n\n还是为了别的什么？'
  },

  {
    id: 'hour_48',
    hour: 48,
    title: '终局',
    scene: '出租屋门口，晚上',
    image: 'assets/images/scenes/hour_48.jpg',
    description: {
      default: '48小时到了。\n\n房东在敲门。\n\n这是最后的时刻。',
      overrides: [
        {
          requiredFlag: 'has_prototype',
          text: '48小时到了。\n\n房东在敲门。\n\n你的电脑屏幕上，还开着那个粗糙的原型。\n\n至少你有了一个开始。'
        },
        {
          requiredFlag: 'broke_rules',
          text: '48小时到了。\n\n房东在敲门。\n\n你的手机里，还有那两个前公司客户的聊天记录。\n\n你不知道这条路会把你带到哪里。'
        },
        {
          requiredFlag: 'gave_up_product',
          text: '48小时到了。\n\n房东在敲门。\n\n你的电脑屏幕是黑的。\n\n你选择了活下来，但你不确定这算不算赢。'
        }
      ]
    },
    choices: [
      {
        text: '交房租，继续战斗',
        cost: { money: 4000 },
        consequence: (state) => `你交了房租。\n\n银行余额：¥${(state.money).toLocaleString()}\n\n房东走了。\n\n你还活着。`,
        nextNode: 'ending',
        flags: ['paid_rent']
      },
      {
        text: '跟房东求情，再给我一周',
        cost: { network: 1 },
        requirements: { network: 1 },
        unavailableReason: '你已经没有多余的人情了，房东不会再信任你。',
        consequence: '房东看着你。\n\n沉默了很久。\n\n"一周。最后一周。"\n\n你赢得了时间。',
        nextNode: 'ending',
        flags: ['negotiated_rent']
      },
      {
        text: '我没钱了...',
        cost: {},
        consequence: '房东换了门锁。\n\n你的东西被扔在了楼下。\n\n你坐在路边，不知道该打给谁。',
        nextNode: 'broke',
        flags: ['broke']
      }
    ],
    blackMirrorText: {
      default: '48小时前，你按下了辞职信的发送键。\n\n48小时后，你站在这里。\n\n这就是创业。',
      overrides: [
        {
          requiredFlag: 'has_prototype',
          text: '48小时前，你什么都没有。\n\n48小时后，你有了一个原型。\n\n它很烂。\n\n但它存在。'
        },
        {
          requiredFlag: 'broke_rules',
          text: '48小时前，你是一个遵守规则的人。\n\n48小时后，你不确定自己还是不是。\n\n创业改变了你，你只是还不知道改变了多少。'
        }
      ]
    }
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
