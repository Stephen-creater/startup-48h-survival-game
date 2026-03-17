// 分享功能
function initShare() {
  // 这个文件主要用于扩展分享功能
  // 目前基础分享功能已在game.js中实现
}

// 生成分享图片（使用html2canvas，可选功能）
async function generateShareImage() {
  const shareCard = document.getElementById('share-card');

  // 临时显示分享卡片
  shareCard.classList.remove('hidden');
  shareCard.style.position = 'fixed';
  shareCard.style.top = '50%';
  shareCard.style.left = '50%';
  shareCard.style.transform = 'translate(-50%, -50%)';
  shareCard.style.zIndex = '9999';

  try {
    // 如果有html2canvas库，可以生成图片
    if (typeof html2canvas !== 'undefined') {
      const canvas = await html2canvas(shareCard);
      const image = canvas.toDataURL('image/png');

      // 下载图片
      const link = document.createElement('a');
      link.download = '创业者48小时生存实验-我的结局.png';
      link.href = image;
      link.click();
    }
  } catch (error) {
    console.error('生成图片失败:', error);
  } finally {
    // 隐藏分享卡片
    shareCard.classList.add('hidden');
    shareCard.style.position = 'fixed';
    shareCard.style.top = '-9999px';
    shareCard.style.left = '-9999px';
  }
}

// 统计数据（用于显示"击败了X%的玩家"）
function getStatistics() {
  const results = JSON.parse(localStorage.getItem('gameResults') || '[]');

  if (results.length === 0) {
    return {
      totalPlays: 0,
      averageSurvivalTime: 0,
      endingDistribution: {}
    };
  }

  // 计算平均存活时间
  const totalTime = results.reduce((sum, r) => sum + r.survivalTime, 0);
  const averageSurvivalTime = totalTime / results.length;

  // 统计结局分布
  const endingDistribution = {};
  results.forEach(r => {
    endingDistribution[r.endingId] = (endingDistribution[r.endingId] || 0) + 1;
  });

  return {
    totalPlays: results.length,
    averageSurvivalTime: Math.round(averageSurvivalTime),
    endingDistribution
  };
}

// 分享到社交媒体的辅助函数
function shareToSocialMedia(platform) {
  const latestResult = JSON.parse(localStorage.getItem('latestResult'));
  if (!latestResult) return;

  const ending = getEnding(latestResult.endingId);
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`我在《创业者48小时生存实验》中获得了"${ending.title}"结局，存活了${latestResult.survivalTime}小时！你能活多久？`);

  let shareUrl = '';

  switch (platform) {
    case 'weibo':
      shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${text}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    default:
      return;
  }

  window.open(shareUrl, '_blank', 'width=600,height=400');
}

// 导出统计数据（用于后续分析）
function exportStatistics() {
  const stats = getStatistics();
  const results = JSON.parse(localStorage.getItem('gameResults') || '[]');

  const data = {
    statistics: stats,
    allResults: results,
    exportTime: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = 'game-statistics.json';
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
