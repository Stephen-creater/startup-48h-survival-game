# 项目：创业者48小时生存实验

## 项目定位
黑镜气质的创业叙事游戏，纯前端实现，重点不是复杂系统，而是：
- 强叙事
- 强情绪
- 强传播
- 低部署成本

## 当前产品状态
当前版本已经完成一轮较完整的体验优化，基础流程稳定：
- 首页、打字页、主游戏页、结尾页、分享预览页都已跑通
- 移动端是最高优先级
- 分享、BGM、结尾收束、资源危机反馈都已经接入
- 后续继续按“小步慢跑”方式迭代

## 迭代原则
- 一次只改一个小点
- 优先保住现有体验，不为了新效果破坏老流程
- 接近结尾的氛围增强要逐层加，不要一口气堆满
- 任何视觉/音效反馈都不能影响：
  - 选择点击
  - 节点跳转
  - 结局判定
  - 分享生成

## 当前页面结构

### 1. 首页
目标：
- 手机端首屏感
- 赛博黑镜气质
- 人物主视觉
- 极少文字

当前状态：
- 首页内容首屏居中
- 人物图是 `assets/images/Image 2.png`
- 首页已经去掉大面积脏色晕，只保留干净黑底 + 人物 + 标题 + CTA
- 首页 BGM 不会在这里自动播放

### 2. 打字页
目标：
- 垂直居中
- 不可滚动
- 作为进入游戏前的情绪铺垫

当前状态：
- 用户点击首页 CTA 后进入打字页
- 打字音效会播放
- 打字页是独立界面，不应出现顶部对齐或额外滚动空间
- 只有用户点击“启动实验”后，才会真正开始 BGM

### 3. 游戏主界面
当前结构：

```html
#game-screen
  .hour-display
  .resources-panel
  .game-content
    .story-main
      .scene-frame
      .resources-panel
      .story-lower
        .story-panel
          .story-title
          .story-scene
          .story-body
            .story-description
            .choices-container
            .consequence-panel
            .black-mirror-text
```

注意：
- `ensureGameLayoutOrder()` 会把图片、资源条、正文区重新排到正确顺序
- 场景图在上，资源条在中，正文区在下
- 不要再把资源条/图片随便插回老结构

## 当前关键行为

### 1. 资源系统
文件：
- `js/resources.js`
- `css/style.css`

当前已实现：
- 4维资源：金钱、时间、精力、人脉
- 资源会影响选项是否可执行
- `getResourceStatus()` 已统一输出：
  - `normal`
  - `warning`
  - `critical`
  - `depleted`
- 最危险资源会写入 `#game-screen` 的 `data-crisis-resource / data-crisis-level`

当前危机反馈：
- `critical` 时页面会短暂轻震
- 核心资源第一次归零时会触发更强的短震
- 归零时会叠一层短暂的“裂开 / 故障”遮罩
- 资源条本身已有 `critical / depleted` 呼吸与报警感

注意：
- 这层反馈只能增强感知，不能改动主流程
- 不能再出现旧问题：
  - 资源归零后卡死不跳节点
  - 重复点击导致多次扣资源
  - 页面长时间模糊

### 2. 选择与 consequence
文件：
- `js/game.js`
- `js/resources.js`
- `css/style.css`

当前状态：
- 选择后先显示 consequence
- consequence 覆盖正文区，不是独立弹窗
- consequence 出现后，玩家点击“继续”才会进入下一个节点
- consequence 里会显示资源交换的人话总结

关键要求：
- consequence 依然是“同位置阅读”，不要改成跳来跳去
- 点“继续”进入下一个节点时，应回到新节点顶部先看到场景图

### 3. 结尾切换
文件：
- `js/game.js`
- `css/style.css`

当前状态：
- 最后一跳进入结尾前，不再直接切屏
- 会先走 `ending-transition`
- 当前过渡风格是“收束坍缩”
- 过渡文案是结算提示
- 过渡时长目前已被拉长，明显区别于普通节点切换

### 4. BGM 与音效
文件：
- `js/audio.js`
- `js/game.js`
- `assets/sounds/压迫感紧张_爱给网_aigei_com.mp3`

当前规则：
- 首页：不自动播 BGM
- 打字页：不自动播 BGM
- 用户点击“启动实验”后：开始播 BGM
- 进入结算页时：停止 BGM
- 用户点“重新开始”后：当前实现会再次启动 BGM

交互音效：
- 按钮音效、选择音效、悬停音效已接入
- 为了避免被 BGM 压住，触发交互音效时会对 BGM 做短暂 duck

### 5. 分享预览页
文件：
- `js/game.js`
- `css/preview.css`
- `assets/qrcode.png`

当前方向：
- 分享图是“结果海报”，不是“结算截屏”
- 已删除资源条
- 中间主视觉替换为首页人物图
- 文案已减负，只保留核心结果信息
- 二维码已经替换为 `assets/qrcode.png`
- “分享链接”复制的地址应为正式站点：
  - `https://startup-48h-survival-game.vercel.app/`

注意：
- 移动端和桌面端的分享预览比例要分别看
- 最近修过桌面端按钮遮挡、移动端预览过窄、二维码白边问题

## 当前视觉结论

### 已确认方向
- 黑底
- 霓虹绿是主强调色
- 红色只用于危险、代价、结局冲击
- 首页偏克制，不要脏色晕
- 游戏主界面是信息密度更高的系统界面
- 结尾和分享页可以更海报化

### 已明确不要的东西
- 首页大面积脏红绿光晕
- 重复边框语言
- 分享图里大段解释性文字
- 资源条出现在分享海报里
- 一次性改太多，导致旧功能失效

## 当前部署与传播入口
- GitHub 仓库：`Stephen-creater/startup-48h-survival-game`
- 当前线上正式域名：`https://startup-48h-survival-game.vercel.app/`

注意：
- Vercel 只认已推送到 GitHub 的提交
- 本地 `git add` 但未 `git commit` 时，Vercel 不会更新

## 后续推荐迭代顺序
1. 继续细调危机感，但一次只加一层
2. 分享图继续减字、提传播感
3. 检查所有节点的“文案-图片-情绪”一致性
4. 保持版本管理，每次小改后都及时提交
