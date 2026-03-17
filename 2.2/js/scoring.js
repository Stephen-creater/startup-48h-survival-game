// 评分系统
class ScoringSystem {
  constructor() {
    this.score = 3.5; // 初始分数
    this.history = []; // 决策历史
    this.maxScore = 5.0;
    this.minScore = 0.0;
  }

  // 更新分数
  updateScore(sceneId, choiceIndex, value, choiceText) {
    this.score += value;
    this.score = Math.max(this.minScore, Math.min(this.maxScore, this.score));

    this.history.push({
      sceneId: sceneId,
      choiceIndex: choiceIndex,
      choiceText: choiceText,
      value: value,
      newScore: this.score,
      timestamp: Date.now()
    });
  }

  // 获取当前分数
  getScore() {
    return this.score;
  }

  // 获取投资人态度
  getAttitude() {
    if (this.score >= 4.5) return 'enthusiastic';
    if (this.score >= 3.5) return 'neutral';
    if (this.score >= 2.5) return 'cold';
    return 'blocked';
  }

  // 获取态度描述
  getAttitudeDescription() {
    const attitude = this.getAttitude();
    const descriptions = {
      enthusiastic: {
        status: '正在输入...',
        mood: '😊',
        bgColor: '#1a1a2e'
      },
      neutral: {
        status: '3分钟后',
        mood: '😐',
        bgColor: '#16213e'
      },
      cold: {
        status: '已读',
        mood: '😒',
        bgColor: '#0f1419'
      },
      blocked: {
        status: '对方已将你拉黑',
        mood: '😠',
        bgColor: '#000000'
      }
    };
    return descriptions[attitude];
  }

  // 获取结局等级
  getEnding() {
    if (this.score >= 4.5) return 'S';
    if (this.score >= 3.5) return 'A';
    if (this.score >= 2.5) return 'B';
    return 'C';
  }

  // 获取结局内容
  getEndingContent() {
    const ending = this.getEnding();
    const contents = {
      S: {
        title: '🎉 恭喜,你获得了投资!',
        message: '但这只是个游戏。\n\n真实世界里,你准备好了吗?\n\n你展现了出色的判断力、清晰的思维和坚定的价值观。这些正是优秀创业者的特质。',
        action: '留下你的联系方式,董科含可能会联系你',
        showContact: true
      },
      A: {
        title: '👍 投资人对你有兴趣',
        message: '但还需要观察。\n\n你在某些问题上展现了潜力,但还有提升空间。继续打磨你的想法,我们会关注你。',
        action: '查看你的评分轨迹',
        showContact: false
      },
      B: {
        title: '😔 很遗憾,投资人拒绝了你',
        message: '但你在某些问题上展现了潜力。\n\n创业是一个学习的过程,没有人一开始就是完美的。看看你的短板在哪里,继续成长。',
        action: '查看详细分析',
        showContact: false
      },
      C: {
        title: '❌ 投资人拉黑了你',
        message: '你在关键问题上犯了致命错误。\n\n创业不适合所有人,这不丢人。但如果你真的想做,需要重新审视自己的认知和价值观。',
        action: '查看你错在哪里',
        showContact: false
      }
    };
    return contents[ending];
  }

  // 获取决策历史
  getHistory() {
    return this.history;
  }

  // 获取关键转折点
  getKeyMoments() {
    return this.history.filter(h => Math.abs(h.value) >= 0.5);
  }

  // 重置游戏
  reset() {
    this.score = 3.5;
    this.history = [];
  }
}
