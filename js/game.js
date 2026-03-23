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
    // 在用户手势中同步启动音效（手机浏览器autoplay policy要求）
    if (audioManager) {
      audioManager.startTypingSound();
    }
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
    '现在是 2026年3月21日，晚上11:47',
    '你已经做出了一款产品。',
    '你刚刚按下了辞职信的发送键。',
    '距离房租到期：48小时',
    '银行余额：¥8,000',
    '游戏开始。'
  ];

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
        if (audioManager) {
          audioManager.stopTypingSound();
        }
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
    audioManager.startBgm();
  }

  // 切换到游戏界面
  document.getElementById('intro-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  ensureGameLayoutOrder();
  resourceManager.updateUI();

  // 加载第一个节点
  loadNode('hour_0');
}

function ensureGameLayoutOrder() {
  const storyMain = document.querySelector('.story-main');
  const sceneFrame = document.getElementById('scene-frame');
  const resourcesPanel = document.querySelector('.resources-panel');
  const storyLower = document.querySelector('.story-lower');

  if (!storyMain || !sceneFrame || !resourcesPanel || !storyLower) return;

  storyMain.appendChild(sceneFrame);
  storyMain.appendChild(resourcesPanel);
  storyMain.appendChild(storyLower);
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

  // description 支持对象结构：{ default, overrides: [{ requiredFlag, text }] }
  const currentFlags = resourceManager.getState().flags;
  let descriptionText = '';
  if (typeof node.description === 'string') {
    descriptionText = node.description;
  } else if (node.description && node.description.overrides) {
    const matched = node.description.overrides.find(o => currentFlags.includes(o.requiredFlag));
    descriptionText = matched ? matched.text : node.description.default;
  }
  document.getElementById('story-description').textContent = descriptionText;

  // blackMirrorText 同样支持对象结构
  let blackMirrorText = '';
  if (typeof node.blackMirrorText === 'string') {
    blackMirrorText = node.blackMirrorText;
  } else if (node.blackMirrorText && node.blackMirrorText.overrides) {
    const matched = node.blackMirrorText.overrides.find(o => currentFlags.includes(o.requiredFlag));
    blackMirrorText = matched ? matched.text : node.blackMirrorText.default;
  }
  document.getElementById('black-mirror-text').textContent = blackMirrorText;
  const storyBody = document.getElementById('story-body');
  storyBody.classList.remove('consequence-active');
  storyBody.style.removeProperty('--consequence-height');
  document.getElementById('consequence-impact').textContent = '';

  // 清空选择容器
  const choicesContainer = document.getElementById('choices-container');
  choicesContainer.innerHTML = '';

  // 创建选择按钮
  let availableChoices = 0;
  let visibleChoiceCount = 0;
  node.choices.forEach((choice, index) => {
    // requiredFlag：需要拥有某个 flag 才显示此选项
    if (choice.requiredFlag && !currentFlags.includes(choice.requiredFlag)) {
      return;
    }
    // excludedFlag：拥有某个 flag 时隐藏此选项
    if (choice.excludedFlag && currentFlags.includes(choice.excludedFlag)) {
      return;
    }
    const availability = resourceManager.getChoiceAvailability(choice);
    const button = document.createElement('button');
    button.className = 'choice-btn';
    button.dataset.available = availability.available ? 'true' : 'false';
    visibleChoiceCount++;

    const indexBadge = document.createElement('span');
    indexBadge.className = 'choice-index';
    indexBadge.textContent = String(visibleChoiceCount).padStart(2, '0');
    button.appendChild(indexBadge);

    const ctaBadge = document.createElement('span');
    ctaBadge.className = 'choice-cta';
    ctaBadge.textContent = availability.available ? '选择' : '不可选';
    button.appendChild(ctaBadge);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'choice-title';
    titleSpan.textContent = choice.text;
    button.appendChild(titleSpan);

    const metaRow = document.createElement('div');
    metaRow.className = 'choice-meta';

    // 显示消耗和获得
    if (choice.cost && Object.keys(choice.cost).length > 0) {
      const costText = formatCost(choice.cost);
      const costSpan = document.createElement('span');
      costSpan.className = 'choice-cost';
      costSpan.textContent = '消耗：' + costText;
      metaRow.appendChild(costSpan);
    }

    if (choice.gain && Object.keys(choice.gain).length > 0) {
      const gainText = formatCost(choice.gain);
      const gainSpan = document.createElement('span');
      gainSpan.className = 'choice-gain';
      gainSpan.textContent = '获得：' + gainText;
      metaRow.appendChild(gainSpan);
    }

    if (!availability.available) {
      button.classList.add('choice-btn-disabled');
      button.disabled = true;
      const warningSpan = document.createElement('span');
      warningSpan.className = 'choice-warning';
      warningSpan.textContent = '不可选：' + availability.reason;
      metaRow.appendChild(warningSpan);
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

    if (metaRow.children.length > 0) {
      button.appendChild(metaRow);
    }

    choicesContainer.appendChild(button);
  });

  // 隐藏后果面板
  document.getElementById('consequence-panel').classList.add('hidden');

  if (availableChoices === 0) {
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

function inferEmotion(choice) {
  if (!choice) return null;
  const flags = choice.flags || [];
  const next = choice.nextNode || '';
  // 放弃/破产/崩溃路径
  if (next === 'gave_up' || next === 'broke' || next === 'burnout') return 'despair';
  // 身体崩溃
  if (flags.includes('burnout') || flags.includes('took_drugs')) return 'breakdown';
  // 道德风险
  if (flags.includes('broke_rules')) return 'anxiety';
  // 获得恢复（睡觉/回血）
  if (choice.gain && (choice.gain.energy >= 20 || choice.gain.money >= 3000)) return 'relief';
  // 高精力消耗
  if (choice.cost && choice.cost.energy >= 20) return 'exhausted';
  // 高金钱风险
  if (choice.cost && choice.cost.money >= 3000) return 'anxiety';
  return 'struggle';
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

  // 切换情绪图片
  const emotion = inferEmotion(choice);
  if (emotion) {
    const sceneImage = document.getElementById('scene-image');
    if (sceneImage) {
      sceneImage.src = `assets/images/emotions/${emotion}.jpg`;
      sceneImage.alt = emotion;
    }
  }

  // 显示后果
  const storyBody = document.getElementById('story-body');
  const consequencePanel = document.getElementById('consequence-panel');
  storyBody.classList.add('consequence-active');
  document.getElementById('consequence-text').textContent = consequenceText;
  document.getElementById('consequence-impact').innerHTML = resourceManager.getChoiceImpactMarkup(choice);
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
    startEndingTransition();
    return;
  }

  if (nextNode === 'resource_locked') {
    startEndingTransition();
    return;
  }

  // 检查是否到达终局
  if (nextNode === 'ending') {
    startEndingTransition();
    return;
  }

  // 检查游戏是否结束
  const gameOverReason = resourceManager.checkGameOver();
  if (gameOverReason) {
    startEndingTransition();
    return;
  }

  // 显示选择
  document.getElementById('choices-container').style.display = 'flex';

  // 加载下一个节点
  loadNode(nextNode);

  // 回到新节点顶部，先看到场景图
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startEndingTransition() {
  const transition = document.getElementById('ending-transition');
  if (!transition) {
    showEnding();
    return;
  }

  transition.classList.remove('hidden');

  window.setTimeout(() => {
    transition.classList.add('hidden');
    showEnding();
  }, 3600);
}

// 显示结局
function showEnding() {
  // 判定结局
  const ending = determineEnding(resourceManager);
  const state = normalizeEndingState(ending.id, resourceManager.getState());
  const resourceStory = resourceManager.getResourceStory(state, ending.id);

  if (audioManager) {
    audioManager.stopBgm();
  }

  // 切换到结局界面
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('ending-screen').classList.add('active');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.getElementById('ending-screen').scrollIntoView({
    behavior: 'auto',
    block: 'start'
  });

  // 显示结局图片
  const endingImageFrame = document.getElementById('ending-image-frame');
  endingImageFrame.innerHTML = '';
  const endingImg = document.createElement('img');
  endingImg.src = `assets/images/endings/${ending.id}.jpg`;
  endingImg.alt = ending.title;
  endingImg.className = 'ending-image';
  endingImg.onerror = () => { endingImageFrame.style.display = 'none'; };
  endingImageFrame.appendChild(endingImg);

  // 显示结局信息
  document.getElementById('ending-title').textContent = ending.title;
  document.getElementById('survival-time').textContent = calculateSurvivalTime(state);
  document.getElementById('beat-percentage').textContent = ending.percentage;
  document.getElementById('ending-share-hook').textContent = ending.shareText || '你活过了这一局，但代价已经写在资源条里。';

  // 显示结局描述
  const descriptionDiv = document.getElementById('ending-description');
  descriptionDiv.innerHTML = '';
  ending.description.forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    descriptionDiv.appendChild(p);
  });

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

  // 显示加载提示
  const shareBtn = document.getElementById('share-btn');
  const originalText = shareBtn.textContent;
  shareBtn.textContent = '生成图片中...';
  shareBtn.disabled = true;

  try {
    showImagePreview();
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
  } catch (error) {
    console.error('生成图片失败:', error);
    shareBtn.textContent = originalText;
    shareBtn.disabled = false;
    alert('生成图片失败，请重试');
  }
}

// 显示图片预览弹窗
function showImagePreview() {
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
            <h2 class="share-game-title">48小时生存实验</h2>
            <p class="share-subtitle">我的创业结局</p>
          </div>

          <div class="share-result">
            <div class="share-hero">
              <img class="share-hero-image" src="assets/images/Image%202.png" alt="">
            </div>
            <h3 class="share-ending-title">${ending.title}</h3>
            <p class="share-broadcast-line">${ending.shareText || '我活过了这48小时。'}</p>
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
          </div>

          <div class="share-footer">
            <p class="share-challenge">你能活过我吗？</p>
            <div class="share-qr-placeholder">
              <img class="qr-box" src="assets/qrcode.png" alt="扫码挑战">
            </div>
          </div>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn-secondary share-link-btn">分享链接</button>
        <button class="btn-primary download-image-btn">下载图片</button>
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
    canvas.toBlob(() => {
      modal.querySelector('.share-link-btn').onclick = async () => {
        try {
          await navigator.clipboard.writeText('https://startup-48h-survival-game.vercel.app/');
          alert('小游戏链接已复制到剪贴板！');
        } catch (err) {
          console.error('复制链接失败:', err);
          alert('复制链接失败，请手动复制地址栏链接。');
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

  if (audioManager) {
    audioManager.startBgm();
  }

  // 切换到游戏界面
  document.getElementById('ending-screen').classList.remove('active');
  document.getElementById('game-screen').classList.add('active');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  document.getElementById('game-screen').scrollIntoView({
    behavior: 'auto',
    block: 'start'
  });

  // 隐藏后果面板
  document.getElementById('consequence-panel').classList.add('hidden');

  // 显示选择容器
  document.getElementById('choices-container').style.display = 'flex';

  // 加载第一个节点
  loadNode('hour_0');
}

// 联系小助手
function contactAssistant() {
  window.open('https://lh9emykotk.feishu.cn/share/base/form/shrcnGjuoHFHzie3jfnBOSH0Wrb', '_blank', 'noopener,noreferrer');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initGame);
