// 游戏核心逻辑
let resourceManager;
let currentNodeId = 'hour_0';

// 初始化游戏
function initGame() {
  resourceManager = new ResourceManager();

  // 绑定开始按钮
  document.getElementById('start-btn').addEventListener('click', startGame);

  // 绑定继续按钮
  document.getElementById('continue-btn').addEventListener('click', continueGame);

  // 绑定结局按钮
  document.getElementById('share-btn').addEventListener('click', shareResult);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.getElementById('contact-btn').addEventListener('click', contactAssistant);

  // 播放开场动画
  playIntroAnimation();
}

// 开场动画
function playIntroAnimation() {
  const texts = [
    '这是一场实验。',
    '我们想知道，当一个人决定创业时...',
    '他能在真实世界中存活多久。',
    '',
    '现在是 2026年3月17日，晚上11:47',
    '你刚刚按下了辞职信的发送键。',
    '距离房租到期：48小时',
    '银行余额：¥8,000',
    '',
    '游戏开始。'
  ];

  let index = 0;
  const interval = setInterval(() => {
    if (index < texts.length) {
      const element = document.getElementById(`intro-text-${Math.floor(index / 2) + 1}`);
      if (element) {
        element.textContent = texts[index];
        element.classList.add('typing');

        setTimeout(() => {
          element.classList.remove('typing');
          element.classList.add('typed');
        }, 1000);
      }
      index++;
    } else {
      clearInterval(interval);
      // 显示开始按钮
      setTimeout(() => {
        document.getElementById('start-btn').classList.remove('hidden');
      }, 500);
    }
  }, 1500);
}

// 开始游戏
function startGame() {
  // 切换到游戏界面
  document.getElementById('intro-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  // 加载第一个节点
  loadNode('hour_0');
}

// 加载节点
function loadNode(nodeId) {
  const node = getNode(nodeId);
  if (!node) {
    console.error('节点不存在:', nodeId);
    return;
  }

  currentNodeId = nodeId;

  // 更新小时
  resourceManager.setHour(node.hour);

  // 更新剧情内容
  document.getElementById('story-title').textContent = node.title;
  document.getElementById('story-scene').textContent = node.scene;
  document.getElementById('story-description').textContent = node.description;
  document.getElementById('black-mirror-text').textContent = node.blackMirrorText || '';

  // 清空选择容器
  const choicesContainer = document.getElementById('choices-container');
  choicesContainer.innerHTML = '';

  // 创建选择按钮
  node.choices.forEach((choice, index) => {
    const button = document.createElement('button');
    button.className = 'choice-btn';
    button.innerHTML = choice.text;

    // 显示消耗和获得
    if (choice.cost && Object.keys(choice.cost).length > 0) {
      const costText = formatCost(choice.cost);
      const costSpan = document.createElement('span');
      costSpan.className = 'choice-cost';
      costSpan.textContent = '消耗：' + costText;
      button.appendChild(costSpan);
    }

    if (choice.gain && Object.keys(choice.gain).length > 0) {
      const gainText = formatCost(choice.gain);
      const gainSpan = document.createElement('span');
      gainSpan.className = 'choice-gain';
      gainSpan.textContent = '获得：' + gainText;
      button.appendChild(gainSpan);
    }

    button.addEventListener('click', () => makeChoice(index));
    choicesContainer.appendChild(button);
  });

  // 隐藏后果面板
  document.getElementById('consequence-panel').classList.add('hidden');
}

// 格式化消耗/获得
function formatCost(cost) {
  const parts = [];
  if (cost.money) parts.push(`💰 ¥${cost.money}`);
  if (cost.time) parts.push(`⏰ ${cost.time}h`);
  if (cost.energy) parts.push(`⚡ ${cost.energy}`);
  if (cost.network) parts.push(`👥 ${cost.network}`);
  return parts.join(', ');
}

// 做出选择
function makeChoice(choiceIndex) {
  const node = getNode(currentNodeId);
  const choice = node.choices[choiceIndex];

  // 记录选择
  resourceManager.recordChoice(currentNodeId, choiceIndex);

  // 消耗资源
  if (choice.cost) {
    resourceManager.consume(choice.cost);
  }

  // 获得资源
  if (choice.gain) {
    resourceManager.gain(choice.gain);
  }

  // 添加标记
  if (choice.flags) {
    choice.flags.forEach(flag => resourceManager.addFlag(flag));
  }

  // 显示后果
  showConsequence(choice.consequence, choice.nextNode);
}

// 显示后果
function showConsequence(consequenceText, nextNode) {
  // 隐藏选择
  document.getElementById('choices-container').style.display = 'none';

  // 显示后果
  const consequencePanel = document.getElementById('consequence-panel');
  document.getElementById('consequence-text').textContent = consequenceText;
  consequencePanel.classList.remove('hidden');

  // 保存下一个节点
  consequencePanel.dataset.nextNode = nextNode;
}

// 继续游戏
function continueGame() {
  const nextNode = document.getElementById('consequence-panel').dataset.nextNode;

  // 检查是否是特殊结局节点
  if (nextNode === 'gave_up' || nextNode === 'broke' || nextNode === 'burnout') {
    showEnding();
    return;
  }

  // 检查是否到达终局
  if (nextNode === 'ending') {
    showEnding();
    return;
  }

  // 检查游戏是否结束
  const gameOverReason = resourceManager.checkGameOver();
  if (gameOverReason) {
    showEnding();
    return;
  }

  // 显示选择
  document.getElementById('choices-container').style.display = 'flex';

  // 加载下一个节点
  loadNode(nextNode);
}

// 显示结局
function showEnding() {
  // 判定结局
  const ending = determineEnding(resourceManager);

  // 切换到结局界面
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('ending-screen').classList.add('active');

  // 显示结局信息
  document.getElementById('ending-title').textContent = ending.title;
  document.getElementById('survival-time').textContent = resourceManager.hour;
  document.getElementById('beat-percentage').textContent = ending.percentage;

  // 显示结局描述
  const descriptionDiv = document.getElementById('ending-description');
  descriptionDiv.innerHTML = '';
  ending.description.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    descriptionDiv.appendChild(p);
  });

  // 显示最终资源
  const state = resourceManager.getState();
  document.getElementById('final-money').textContent = '¥' + state.money.toLocaleString();
  document.getElementById('final-time').textContent = state.time + 'h';
  document.getElementById('final-energy').textContent = state.energy;
  document.getElementById('final-network').textContent = state.network;

  // 保存到localStorage（用于统计）
  saveGameResult(ending, state);
}

// 保存游戏结果
function saveGameResult(ending, state) {
  const result = {
    endingId: ending.id,
    survivalTime: state.hour,
    finalResources: {
      money: state.money,
      time: state.time,
      energy: state.energy,
      network: state.network
    },
    choices: state.choices,
    timestamp: new Date().toISOString()
  };

  // 保存到localStorage
  const results = JSON.parse(localStorage.getItem('gameResults') || '[]');
  results.push(result);
  localStorage.setItem('gameResults', JSON.stringify(results));

  // 保存最新结果
  localStorage.setItem('latestResult', JSON.stringify(result));
}

// 分享结果
function shareResult() {
  const latestResult = JSON.parse(localStorage.getItem('latestResult'));
  if (!latestResult) return;

  const ending = getEnding(latestResult.endingId);

  // 更新分享卡片
  document.getElementById('share-ending-title').textContent = ending.title;
  document.getElementById('share-survival-time').textContent = latestResult.survivalTime;
  document.getElementById('share-percentage').textContent = ending.percentage;

  // 生成分享文案
  const shareText = `【创业者48小时生存实验】\n\n我的结局：${ending.title}\n存活时间：${latestResult.survivalTime}小时\n击败了${ending.percentage}%的玩家\n\n${ending.shareText}\n\n立即挑战：${window.location.href}`;

  // 尝试使用Web Share API
  if (navigator.share) {
    navigator.share({
      title: '创业者48小时生存实验',
      text: shareText,
      url: window.location.href
    }).catch(err => {
      console.log('分享失败:', err);
      fallbackShare(shareText);
    });
  } else {
    fallbackShare(shareText);
  }
}

// 备用分享方式
function fallbackShare(text) {
  // 复制到剪贴板
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('分享文案已复制到剪贴板！\n\n请粘贴到朋友圈或社交媒体分享。');
    });
  } else {
    // 旧版浏览器
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('分享文案已复制到剪贴板！\n\n请粘贴到朋友圈或社交媒体分享。');
  }
}

// 重新开始
function restartGame() {
  // 重置资源
  resourceManager.reset();

  // 切换到游戏界面
  document.getElementById('ending-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');

  // 加载第一个节点
  loadNode('hour_0');
}

// 联系小助手
function contactAssistant() {
  alert('添加小助手微信：[请填写你的微信号]\n\n我们会给你更详细的创业建议和反馈。');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
