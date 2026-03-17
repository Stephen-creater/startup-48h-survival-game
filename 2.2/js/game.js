// 游戏主控制器
class Game {
  constructor() {
    this.currentScene = 0;
    this.scoring = new ScoringSystem();
    this.story = new Story();
    this.isAnimating = false;
  }

  // 开始游戏
  start() {
    this.showWelcome();
  }

  // 显示欢迎页面
  showWelcome() {
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="welcome-screen">
        <h1 class="welcome-title">投资人模拟器</h1>
        <p class="welcome-subtitle">你能通过AI投资人的考验吗?</p>
        <div class="welcome-description">
          <p>在这个游戏里,你会遇到一个AI投资人。</p>
          <p>他会问你10个问题。</p>
          <p>你的每个回答,都会被打分。</p>
          <p class="highlight">但你看不到分数。</p>
          <p>你只能通过他的态度变化,猜测自己表现如何。</p>
        </div>
        <button class="start-btn" onclick="game.startGame()">开始游戏</button>
        <p class="warning">⚠️ 警告:游戏中有一道"送命题",选错会直接出局</p>
      </div>
    `;
  }

  // 开始游戏主流程
  startGame() {
    this.currentScene = 0;
    this.scoring.reset();
    this.showGameInterface();
    setTimeout(() => this.showScene(0), 500);
  }

  // 显示游戏界面
  showGameInterface() {
    const container = document.getElementById('game-container');
    container.innerHTML = `
      <div class="game-interface">
        <!-- 进度条 -->
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill"></div>
          <span class="progress-text" id="progress-text">1/10</span>
        </div>

        <!-- 投资人区域 -->
        <div class="investor-area" id="investor-area">
          <div class="investor-avatar" id="investor-avatar">
            <div class="avatar-emoji" id="avatar-emoji">😐</div>
          </div>
          <div class="investor-status" id="investor-status">正在输入...</div>
          <div class="investor-message" id="investor-message"></div>
        </div>

        <!-- 选项区域 -->
        <div class="choices-area" id="choices-area"></div>

        <!-- 调试信息(可选) -->
        <div class="debug-info" id="debug-info" style="display:none;">
          当前分数: <span id="debug-score">3.5</span>
        </div>
      </div>
    `;
  }

  // 显示场景
  showScene(index) {
    if (this.isAnimating) return;

    const scene = this.story.getScene(index);
    if (!scene) {
      this.showEnding();
      return;
    }

    // 更新进度
    this.updateProgress(index + 1);

    // 显示投资人消息
    this.displayInvestorMessage(scene.message);

    // 延迟显示选项
    setTimeout(() => {
      this.displayChoices(scene.choices, scene.id);
    }, 1000);
  }

  // 更新进度条
  updateProgress(current) {
    const total = this.story.getTotalScenes();
    const percentage = (current / total) * 100;

    document.getElementById('progress-fill').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = `${current}/${total}`;
  }

  // 显示投资人消息
  displayInvestorMessage(message) {
    const messageEl = document.getElementById('investor-message');
    messageEl.style.opacity = '0';

    setTimeout(() => {
      messageEl.textContent = message;
      messageEl.style.opacity = '1';
    }, 300);
  }

  // 显示选项
  displayChoices(choices, sceneId) {
    const choicesArea = document.getElementById('choices-area');
    choicesArea.innerHTML = '';

    choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.className = 'choice-btn';
      button.textContent = choice.text;
      button.onclick = () => this.handleChoice(sceneId, index, choice);
      choicesArea.appendChild(button);
    });
  }

  // 处理选择
  handleChoice(sceneId, choiceIndex, choice) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // 禁用所有按钮
    const buttons = document.querySelectorAll('.choice-btn');
    buttons.forEach(btn => btn.disabled = true);

    // 高亮选中的按钮
    buttons[choiceIndex].classList.add('selected');

    // 更新评分
    this.scoring.updateScore(sceneId, choiceIndex, choice.value, choice.text);

    // 显示反馈
    this.showFeedback(choice.feedback);

    // 更新投资人态度
    setTimeout(() => {
      this.updateInvestorAttitude();

      // 检查是否被拉黑
      if (this.scoring.getScore() < 2.5) {
        setTimeout(() => this.showEnding(), 2000);
        return;
      }

      // 下一个场景
      this.currentScene++;
      if (this.currentScene >= this.story.getTotalScenes()) {
        setTimeout(() => this.showEnding(), 2000);
      } else {
        setTimeout(() => {
          this.isAnimating = false;
          this.showScene(this.currentScene);
        }, 2000);
      }
    }, 1500);
  }

  // 显示反馈
  showFeedback(feedback) {
    const investorArea = document.getElementById('investor-area');
    const feedbackEl = document.createElement('div');
    feedbackEl.className = 'feedback-message';
    feedbackEl.textContent = feedback;
    investorArea.appendChild(feedbackEl);

    setTimeout(() => {
      feedbackEl.style.opacity = '0';
      setTimeout(() => feedbackEl.remove(), 300);
    }, 1500);
  }

  // 更新投资人态度
  updateInvestorAttitude() {
    const attitude = this.scoring.getAttitudeDescription();

    // 更新表情
    document.getElementById('avatar-emoji').textContent = attitude.mood;

    // 更新状态文字
    document.getElementById('investor-status').textContent = attitude.status;

    // 更新背景色
    document.getElementById('investor-area').style.backgroundColor = attitude.bgColor;

    // 更新头像样式
    const avatar = document.getElementById('investor-avatar');
    avatar.className = 'investor-avatar ' + this.scoring.getAttitude();

    // 更新调试信息
    const debugScore = document.getElementById('debug-score');
    if (debugScore) {
      debugScore.textContent = this.scoring.getScore().toFixed(2);
    }
  }

  // 显示结局
  showEnding() {
    const ending = this.scoring.getEndingContent();
    const container = document.getElementById('game-container');

    container.innerHTML = `
      <div class="ending-screen">
        <h1 class="ending-title">${ending.title}</h1>
        <p class="ending-message">${ending.message.replace(/\n/g, '<br>')}</p>

        <div class="final-score">
          <div class="score-label">你的最终评分</div>
          <div class="score-value">${this.scoring.getScore().toFixed(1)}</div>
          <div class="score-rank">${this.scoring.getEnding()}级</div>
        </div>

        ${ending.showContact ? this.getContactForm() : ''}

        <div class="score-history">
          <h3>你的评分轨迹</h3>
          ${this.getScoreHistoryHTML()}
        </div>

        <div class="ending-actions">
          <button class="action-btn primary" onclick="game.shareResult()">分享结果</button>
          <button class="action-btn secondary" onclick="game.restart()">再玩一次</button>
        </div>
      </div>
    `;
  }

  // 获取联系表单
  getContactForm() {
    return `
      <div class="contact-form">
        <h3>留下你的联系方式</h3>
        <input type="text" id="contact-name" placeholder="你的姓名" class="contact-input">
        <input type="text" id="contact-wechat" placeholder="微信号" class="contact-input">
        <input type="email" id="contact-email" placeholder="邮箱(可选)" class="contact-input">
        <button class="submit-btn" onclick="game.submitContact()">提交</button>
      </div>
    `;
  }

  // 获取评分历史HTML
  getScoreHistoryHTML() {
    const history = this.scoring.getHistory();
    let html = '<div class="history-list">';

    history.forEach((item, index) => {
      const valueClass = item.value > 0 ? 'positive' : 'negative';
      const valueSign = item.value > 0 ? '+' : '';
      html += `
        <div class="history-item">
          <div class="history-scene">问题 ${item.sceneId}</div>
          <div class="history-choice">${item.choiceText.substring(0, 30)}...</div>
          <div class="history-value ${valueClass}">${valueSign}${item.value.toFixed(1)}</div>
          <div class="history-score">→ ${item.newScore.toFixed(1)}</div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  // 提交联系方式
  submitContact() {
    const name = document.getElementById('contact-name').value;
    const wechat = document.getElementById('contact-wechat').value;
    const email = document.getElementById('contact-email').value;

    if (!name || !wechat) {
      alert('请填写姓名和微信号');
      return;
    }

    // 这里可以添加数据收集逻辑
    console.log('联系方式:', { name, wechat, email, score: this.scoring.getScore() });

    alert('提交成功!我们会尽快联系你。');
  }

  // 分享结果
  shareResult() {
    const score = this.scoring.getScore().toFixed(1);
    const rank = this.scoring.getEnding();
    const text = `我在《投资人模拟器》中获得了${score}分(${rank}级)!你能超过我吗?`;

    // 复制到剪贴板
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        alert('已复制到剪贴板,快去分享吧!');
      });
    } else {
      alert(text);
    }
  }

  // 重新开始
  restart() {
    this.start();
  }
}

// 初始化游戏
let game;
window.onload = () => {
  game = new Game();
  game.start();
};
