// 游戏核心逻辑
let resourceManager;
let currentNodeId = 'hour_0';

// 初始化游戏
function initGame() {
  resourceManager = new ResourceManager();

  // 绑定点击开始按钮
  document.getElementById('click-to-start').addEventListener('click', () => {
    // 切换到独立的打字页面
    document.getElementById('intro-landing').classList.add('hidden');
    document.getElementById('intro-sequence').classList.remove('hidden');
    // 播放开场动画
    playIntroAnimation();
  });

  // 绑定开始按钮
  document.getElementById('start-btn').addEventListener('click', startGame);

  // 绑定继续按钮
  document.getElementById('continue-btn').addEventListener('click', continueGame);

  // 绑定结局按钮
  document.getElementById('share-btn').addEventListener('click', shareResult);
  document.getElementById('restart-btn').addEventListener('click', restartGame);
  document.getElementById('contact-btn').addEventListener('click', contactAssistant);
}

// 开场动画
function playIntroAnimation() {
  const texts = [
    '这是一场实验。',
    '我们想知道，当一个人决定创业时...',
    '他能在真实世界中存活多久。',
    '现在是 2026年3月17日，晚上11:47',
    '你刚刚按下了辞职信的发送键。',
    '距离房租到期：48小时',
    '银行余额：¥8,000',
    '游戏开始。'
  ];

  // 加载网页2秒后开始播放打字音效
  setTimeout(() => {
    if (audioManager) {
      audioManager.startTypingSound();
    }
  }, 2000);

  let index = 0;
  const interval = setInterval(() => {
    if (index < texts.length) {
      const elementIndex = Math.min(index + 1, 6);
      const element = document.getElementById(`intro-text-${elementIndex}`);
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
  // 播放按钮音效
  if (audioManager) {
    audioManager.playButtonSound();
  }

  // 切换到游戏界面
  document.getElementById('intro-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  resourceManager.updateUI();

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

  // 更新场景图片
  if (node.image) {
    const sceneFrame = document.getElementById('scene-frame');
    let sceneImage = document.getElementById('scene-image');

    if (!sceneImage) {
      sceneImage = document.createElement('img');
      sceneImage.id = 'scene-image';
      sceneImage.className = 'scene-image';
      sceneFrame.appendChild(sceneImage);
    }

    sceneImage.src = node.image;
    sceneImage.alt = node.title;
  }

  // 更新剧情内容
  document.getElementById('story-title').textContent = node.title;
  document.getElementById('story-scene').textContent = node.scene;
  document.getElementById('story-description').textContent = node.description;
  document.getElementById('black-mirror-text').textContent = node.blackMirrorText || '';
  const storyBody = document.getElementById('story-body');
  storyBody.classList.remove('consequence-active');
  storyBody.style.removeProperty('--consequence-height');
  document.getElementById('consequence-impact').textContent = '';

  // 清空选择容器
  const choicesContainer = document.getElementById('choices-container');
  choicesContainer.innerHTML = '';

  // 创建选择按钮
  let availableChoices = 0;
  node.choices.forEach((choice, index) => {
    const availability = resourceManager.getChoiceAvailability(choice);
    const button = document.createElement('button');
    button.className = 'choice-btn';
    button.innerHTML = choice.text;
    button.dataset.available = availability.available ? 'true' : 'false';

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

    const tradeSpan = document.createElement('span');
    tradeSpan.className = 'choice-trade';
    tradeSpan.textContent = resourceManager.getChoiceTradeSummary(choice);
    button.appendChild(tradeSpan);

    if (!availability.available) {
      button.classList.add('choice-btn-disabled');
      button.disabled = true;
      const warningSpan = document.createElement('span');
      warningSpan.className = 'choice-warning';
      warningSpan.textContent = '不可选：' + availability.reason;
      button.appendChild(warningSpan);
    } else {
      availableChoices++;

      button.addEventListener('click', () => {
        // 播放选择音效
        if (audioManager) {
          audioManager.playChoiceSound();
        }
        makeChoice(index);
      });

      // 添加悬停音效
      button.addEventListener('mouseenter', () => {
        if (audioManager) {
          audioManager.playHoverSound();
        }
      });
    }

    choicesContainer.appendChild(button);
  });

  // 隐藏后果面板
  document.getElementById('consequence-panel').classList.add('hidden');

  if (availableChoices === 0 && resourceManager.hasResourceLock()) {
    showResourceLock();
  }
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

function resolveConsequenceText(choice) {
  if (typeof choice.consequence === 'function') {
    return choice.consequence(resourceManager.getState(), resourceManager);
  }
  return choice.consequence;
}

function normalizeEndingState(endingId, rawState) {
  const state = {
    ...rawState,
    flags: [...rawState.flags],
    choices: [...rawState.choices]
  };

  if (endingId === 'broke') {
    state.money = 0;
  }

  if (endingId === 'burnout') {
    state.energy = 0;
  }

  return state;
}

function calculateSurvivalTime(state) {
  return Math.max(0, resourceManager.initialTime - state.time);
}

function buildEndingDiagnosis(ending, state, resourceStory) {
  const causeByEnding = {
    broke: {
      kicker: 'FAILURE CAUSE',
      title: '你死在现金断流',
      text: '不是想法先死了，是现金流先断了。账单比愿景更早落地，而你没能把下一笔筹码接上。'
    },
    burnout: {
      kicker: 'FAILURE CAUSE',
      title: '你死在体力透支',
      text: '不是机会不够，而是身体先退出了牌桌。你把意志当燃料，但身体从来不接受赊账。'
    },
    gave_up: {
      kicker: 'FAILURE CAUSE',
      title: '你死在判断先撤',
      text: '真正先熄火的不是资源，而是继续下注的判断。你在结果出来之前，先把自己从牌桌上撤了下来。'
    },
    cornered: {
      kicker: 'FAILURE CAUSE',
      title: state.network <= 0 ? '你死在没人可求' : '你死在选择空间归零',
      text: state.network <= 0
        ? '最后不是项目先死，而是最后一个会接你电话的人消失了。资源还有残渣，但已经没有人帮你把它们变成机会。'
        : '你不是被一个错误击倒的，而是被一连串代价挤到没有任何可执行选项。'
    },
    no_ethics: {
      kicker: 'SURVIVAL COST',
      title: '你活下来，但判断越过了底线',
      text: '你不是没能力活下去，而是把最贵的成本换成了底线本身。结果成立了，代价也成立了。'
    },
    survive: {
      kicker: 'SURVIVAL COST',
      title: '你活下来，但只是续命',
      text: '这不是赢，只是勉强把自己留在牌桌上。真正的问题没有解决，你只是多换到了一点时间。'
    },
    success: {
      kicker: 'SURVIVAL COST',
      title: '你活下来，因为判断踩对了',
      text: '这次不是资源特别宽裕，而是你把有限筹码押在了更有效的方向上。活下来的关键是判断，不是运气。'
    }
  };

  const cause = causeByEnding[ending.id] || {
    kicker: 'FAILURE CAUSE',
    title: '你死在最后一层薄弱点',
    text: '看起来像很多问题同时发生，但真正先崩掉的，永远是最薄的那一层。'
  };

  const costIntro = {
    money: '你把现金压到了极限',
    time: '你把时间窗口压到了极限',
    energy: '你把体力压到了极限',
    network: '你把人情压到了极限'
  };

  const survivalCost = {
    kicker: ending.id === 'success' ? 'SURVIVAL COST' : 'PRICE PAID',
    title: costIntro[resourceStory.weakestResource] || `你把${resourceStory.weakestLabel}压到了极限`,
    text: `${resourceStory.detail} 最后最脆的那层是${resourceStory.weakestLabel}，而你保住的是${resourceStory.strongestLabel}。`
  };

  return { cause, survivalCost };
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
  showConsequence(resolveConsequenceText(choice), choice.nextNode, choice);
}

// 显示后果
function showConsequence(consequenceText, nextNode, choice) {
  // 隐藏选择
  document.getElementById('choices-container').style.display = 'none';

  // 显示后果
  const storyBody = document.getElementById('story-body');
  const consequencePanel = document.getElementById('consequence-panel');
  storyBody.classList.add('consequence-active');
  document.getElementById('consequence-text').textContent = consequenceText;
  document.getElementById('consequence-impact').textContent = resourceManager.getChoiceImpactSummary(choice);
  consequencePanel.classList.remove('hidden');
  requestAnimationFrame(() => {
    storyBody.style.setProperty('--consequence-height', `${consequencePanel.offsetHeight}px`);
  });
  document.querySelector('.story-panel').scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // 保存下一个节点
  consequencePanel.dataset.nextNode = nextNode;
}

function showResourceLock() {
  resourceManager.addFlag('resource_locked');
  const narrative = resourceManager.getResourceLockNarrative();
  showConsequence(narrative.text, 'resource_locked', {
    cost: {},
    gain: {},
    text: '无路可走'
  });
  document.getElementById('consequence-impact').textContent = narrative.impact;
}

// 继续游戏
function continueGame() {
  const nextNode = document.getElementById('consequence-panel').dataset.nextNode;

  // 检查是否是特殊结局节点
  if (nextNode === 'gave_up' || nextNode === 'broke' || nextNode === 'burnout') {
    showEnding();
    return;
  }

  if (nextNode === 'resource_locked') {
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
  const state = normalizeEndingState(ending.id, resourceManager.getState());
  const resourceStory = resourceManager.getResourceStory(state);
  const diagnosis = buildEndingDiagnosis(ending, state, resourceStory);

  // 切换到结局界面
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('ending-screen').classList.add('active');

  // 显示结局信息
  document.getElementById('ending-title').textContent = ending.title;
  document.getElementById('survival-time').textContent = calculateSurvivalTime(state);
  document.getElementById('beat-percentage').textContent = ending.percentage;

  // 显示结局描述
  const descriptionDiv = document.getElementById('ending-description');
  descriptionDiv.innerHTML = '';
  ending.description.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    descriptionDiv.appendChild(p);
  });

  document.getElementById('ending-cause-kicker').textContent = diagnosis.cause.kicker;
  document.getElementById('ending-cause-title').textContent = diagnosis.cause.title;
  document.getElementById('ending-cause-text').textContent = diagnosis.cause.text;
  document.getElementById('ending-cost-kicker').textContent = diagnosis.survivalCost.kicker;
  document.getElementById('ending-cost-title').textContent = diagnosis.survivalCost.title;
  document.getElementById('ending-cost-text').textContent = diagnosis.survivalCost.text;

  // 显示最终资源
  document.getElementById('final-money').textContent = '¥' + state.money.toLocaleString();
  document.getElementById('final-time').textContent = state.time + 'h';
  document.getElementById('final-energy').textContent = state.energy;
  document.getElementById('final-network').textContent = state.network;
  document.getElementById('final-state-summary').textContent = resourceStory.detail;

  // 保存到localStorage（用于统计）
  saveGameResult(ending, state, resourceStory);
}

// 保存游戏结果
function saveGameResult(ending, state, resourceStory) {
  const result = {
    endingId: ending.id,
    survivalTime: calculateSurvivalTime(state),
    finalResources: {
      money: state.money,
      time: state.time,
      energy: state.energy,
      network: state.network
    },
    resourceStory,
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
async function shareResult() {
  const latestResult = JSON.parse(localStorage.getItem('latestResult'));
  if (!latestResult) return;

  const ending = getEnding(latestResult.endingId);

  // 显示加载提示
  const shareBtn = document.getElementById('share-btn');
  const originalText = shareBtn.textContent;
  shareBtn.textContent = '生成图片中...';
  shareBtn.disabled = true;

  try {
    // 截取结局界面生成图片
    const endingContent = document.querySelector('.ending-content');
    const canvas = await html2canvas(endingContent, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false
    });

    // 转换为blob和dataURL
    const dataURL = canvas.toDataURL('image/png');

    canvas.toBlob(async (blob) => {
      try {
        // 显示预览弹窗
        showImagePreview(dataURL, blob);

        shareBtn.textContent = originalText;
        shareBtn.disabled = false;
      } catch (err) {
        console.error('处理失败:', err);
        shareBtn.textContent = originalText;
        shareBtn.disabled = false;
      }
    }, 'image/png');
  } catch (error) {
    console.error('生成图片失败:', error);
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
    alert('生成图片失败，请重试');
  }
}

// 显示图片预览弹窗
function showImagePreview(dataURL, blob) {
  // 创建预览弹窗
  const modal = document.createElement('div');
  modal.className = 'image-preview-modal';

  const latestResult = JSON.parse(localStorage.getItem('latestResult'));
  const ending = getEnding(latestResult.endingId);

  modal.innerHTML = `
    <div class="preview-content">
      <div class="preview-header">
        <h3>分享预览</h3>
        <button class="close-preview">×</button>
      </div>
      <div class="preview-image-container">
        <div class="share-card-enhanced">
          <div class="share-header">
            <h2 class="share-game-title">创业者48小时生存实验</h2>
            <p class="share-subtitle">创业模拟 | 你能活多久?</p>
          </div>

          <div class="share-result">
            <h3 class="share-ending-title">${ending.title}</h3>
            <div class="share-stats">
              <div class="share-stat-item">
                <span class="share-stat-label">存活时长</span>
                <span class="share-stat-value">${latestResult.survivalTime}小时</span>
              </div>
              <div class="share-stat-item">
                <span class="share-stat-label">击败玩家</span>
                <span class="share-stat-value">${ending.percentage}%</span>
              </div>
            </div>

            <div class="share-resources">
              <div class="share-resource">💰 ¥${latestResult.finalResources.money.toLocaleString()}</div>
              <div class="share-resource">⏰ ${latestResult.finalResources.time}h</div>
              <div class="share-resource">⚡ ${latestResult.finalResources.energy}</div>
              <div class="share-resource">👥 ${latestResult.finalResources.network}</div>
            </div>

            <p class="share-summary">${latestResult.resourceStory?.share || '你活下来了，但每一项资源都付出了代价。'}</p>
          </div>

          <div class="share-footer">
            <p class="share-challenge">你能活过我吗？</p>
            <div class="share-qr-placeholder">
              <div class="qr-box">扫码挑战</div>
            </div>
          </div>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn-primary copy-image-btn">复制图片</button>
        <button class="btn-secondary download-image-btn">下载图片</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // 等待DOM渲染后生成真实图片
  setTimeout(async () => {
    const shareCard = modal.querySelector('.share-card-enhanced');
    const canvas = await html2canvas(shareCard, {
      backgroundColor: '#0a0a0a',
      scale: 2,
      logging: false
    });

    const newDataURL = canvas.toDataURL('image/png');
    canvas.toBlob((newBlob) => {
      // 更新按钮事件
      modal.querySelector('.copy-image-btn').onclick = async () => {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              'image/png': newBlob
            })
          ]);
          alert('图片已复制到剪贴板！\n\n可以直接粘贴到微信、朋友圈等社交媒体分享。');
          document.body.removeChild(modal);
        } catch (err) {
          console.error('复制失败:', err);
          alert('复制失败，请尝试下载图片');
        }
      };

      modal.querySelector('.download-image-btn').onclick = () => {
        const link = document.createElement('a');
        link.download = '创业者48小时生存实验-我的结局.png';
        link.href = newDataURL;
        link.click();
        alert('图片已下载！');
        document.body.removeChild(modal);
      };
    }, 'image/png');
  }, 100);

  // 关闭按钮
  modal.querySelector('.close-preview').onclick = () => {
    document.body.removeChild(modal);
  };

  // 点击背景关闭
  modal.onclick = (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  };
}

// 下载图片（降级方案）
function downloadImage(canvas) {
  const link = document.createElement('a');
  link.download = '创业者48小时生存实验-我的结局.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
  alert('图片已下载到本地！\n\n可以从相册中分享到社交媒体。');
}

// 备用分享方式（已废弃，保留以防需要）
function fallbackShare(text) {
  // 现在主要使用图片分享，此函数作为备用
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert('分享文案已复制到剪贴板！\n\n请粘贴到朋友圈或社交媒体分享。');
    });
  } else {
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

  // 隐藏后果面板
  document.getElementById('consequence-panel').classList.add('hidden');

  // 显示选择容器
  document.getElementById('choices-container').style.display = 'flex';

  // 加载第一个节点
  loadNode('hour_0');
}

// 联系小助手
function contactAssistant() {
  alert('添加小助手微信：[请填写你的微信号]\n\n我们会给你更详细的创业建议和反馈。');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
