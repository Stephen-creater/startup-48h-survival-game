# 项目：创业者48小时生存实验

## 项目定位
黑镜风格创业叙事游戏，纯前端实现。

核心目标不是复杂系统，而是：
- 强叙事
- 强情绪
- 强分享传播
- 极低部署成本

## 当前状态
MVP 可运行，主界面布局已经过一轮较大重构，当前结构稳定，可继续在此基础上迭代。

当前 UI 重点：
- 图片现在放在主内容区下方
- 图片上方是统一的大框
- 大框内部左侧为文字/选择/结果区域
- 大框内部右侧为 4 个资源条
- 资源不再只是展示数字，已经开始真实影响选项可用性
- `consequence` 结果层会覆盖左侧正文区，但不会遮住标题区
- 结果层显示时，左侧正文区高度会自动扩展，避免内容溢出外框

## 当前页面结构

### 1. 主界面结构
`index.html`

当前 `#game-screen` 的主内容结构是：

```html
.game-content
  .story-main
    .story-lower
      .story-panel
        .story-title
        .story-scene
        .story-body
          .story-description
          .choices-container
          .consequence-panel
            .consequence-card
          .black-mirror-text
      .resources-panel
    .scene-frame
```

注意：
- `scene-frame` 在 `story-main` 最下方，也就是图片显示在文字/资源区域下方
- `resources-panel` 已经被收进统一大框 `story-lower` 内，不能再当成独立外挂面板处理

### 2. 结果层结构
`consequence-panel` 不是弹窗，不是页面底部块，也不是独立页面。

它的设计目标是：
- 只覆盖左侧正文区 `story-body`
- 保留标题 `story-title` 和场景信息 `story-scene`
- 让用户在同一阅读位置完成“剧情 -> 结果 -> 继续”

## 当前关键行为

### 1. 场景图插入逻辑
`js/game.js`

图片不是写死在 HTML 里的，而是在 `loadNode()` 中动态插入 `#scene-frame`。

当前逻辑：
- 若不存在 `#scene-image`，就创建
- 创建后 append 到 `#scene-frame`
- 后续节点只更新 `src` 和 `alt`

不要再把图片插回 `.story-panel`，否则布局会重新乱掉。

### 2. consequence 显示逻辑
`js/game.js`

`showConsequence()` 当前会做这些事：
- 隐藏 `choices-container`
- 给 `#story-body` 添加 `consequence-active`
- 设置结果文案
- 设置 `#consequence-impact`，把这一步的资源交换翻译成人话
- 显示 `#consequence-panel`
- 用 `requestAnimationFrame()` 读取结果层高度，并把高度写入 `--consequence-height`
- 调用 `scrollIntoView()`，把左侧内容区滚到合适位置

`loadNode()` 当前会做这些收尾：
- 移除 `consequence-active`
- 清掉 `--consequence-height`
- 隐藏 `#consequence-panel`
- 重建按钮列表

这套机制是为了解决两个问题：
- 结果文案过长时按钮被裁掉
- 结果层完整显示后冲出外框

### 3. 左侧正文区高度联动
`css/style.css`

关键点：
- `.story-body` 有基础 `min-height`
- `.story-body.consequence-active` 会读取 JS 写入的 `--consequence-height`
- 结果层显示时，正文区最小高度会随结果层真实高度扩展

不要简单删掉这个 CSS 变量机制，否则会回到“按钮显示不全”或“超出边框”的老问题。

### 4. 资源门槛逻辑
`js/resources.js` + `js/story.js`

现在资源系统已经不是单纯显示条：
- `js/story.js` 里的部分 choice 带有 `requirements`
- `js/resources.js` 里的 `getChoiceAvailability()` 会同时检查：
  - 是否付得起 cost
  - 是否达到 requirements 门槛
- `js/game.js` 在渲染按钮时会把不可选项渲染成 disabled 状态，并显示中文原因

这套机制是这次改动的核心之一。不要把 disabled 状态简单删掉，否则资源又会退回“只在旁边变化一下”的弱感知状态。

## 当前视觉设计结论

### 已确定的方向
- 黑色大底
- 霓虹绿为主强调色
- 红色只用于警告/代价/旁白危险信息
- 图片下方的主阅读区使用一个统一大框
- 左侧内容区尽量弱化独立边框，让视觉焦点回到外层统一框
- 右侧资源区是统一框内部的功能模块，不再是外挂式侧栏

### consequence 的当前视觉策略
- 背景遮罩只做弱化，不做强烈的整屏发绿效果
- 结果内容放在深色卡片中，保证可读性
- 结果按钮放在卡片内，和文案归为一个阅读单元
- 结果卡内会额外显示一条资源交换总结，让玩家知道自己到底拿什么换了什么

## 本次已完成的 UI 重构

### 布局层面
- 把“文字区 + 资源区”收进同一个统一外框
- 把图片移动到主内容区下方
- 让资源条与左侧内容区位于同一视觉系统中

### 交互层面
- `consequence` 改为覆盖左侧正文区，而不是单独悬浮在页面其他位置
- 结果出现时自动滚动到合适阅读位置
- 结果区域高度与正文区联动，避免溢出
- 选择按钮现在会根据资源阈值出现真实的不可选状态
- 结算页和分享页会把资源状态翻译成人话

### 视觉层面
- 去掉了多余的绿色空框
- 去掉了“资源条在框外”的割裂感
- 结果卡不再居中悬浮，而是从正文区顶部展开，更符合阅读节奏

## 当前关键文件说明
- `index.html`
  主结构。若后续继续改布局，优先看这里。

- `css/style.css`
  所有关键 UI 都在这里。当前最重要的区块是：
  - `.story-main`
  - `.story-lower`
  - `.story-panel`
  - `.story-body`
  - `.resources-panel`
  - `.consequence-panel`
  - `.consequence-card`

- `js/game.js`
  当前与 UI 强耦合的逻辑主要有两块：
  - `loadNode()` 里的图片挂载、结果状态清理、按钮禁用态渲染
  - `showConsequence()` 里的结果展开、高度同步、自动滚动、资源交换总结

- `js/story.js`
  节点数据。当前所有主节点都有 `image` 字段，布局默认依赖这一点。
  部分 choice 已新增 `requirements` 和 `unavailableReason`。

- `js/resources.js`
  现在不仅负责数值变更，还负责：
  - choice 可用性判断
  - 当前最危险资源识别
  - consequence 资源交换总结
  - ending/share 的资源叙事总结

## 交接给下一个 AI 时最重要的上下文

### 1. 哪些问题已经解决
- 资源条不再在外侧
- 图片与内容的上下顺序已经调整
- consequence 不再是突兀蓝框
- consequence 文案不会被截断
- consequence 不会冲出主外框
- 资源条不再只是摆设，已经会真实阻止部分高强度选择
- 结算和分享不再只给数字，已经开始输出可读的人话总结

### 2. 哪些结构不要轻易推翻
- `story-lower` 统一外框
- `story-body` 和 `consequence-panel` 的覆盖关系
- JS 写入 `--consequence-height` 的高度同步机制
- `scene-frame` 作为图片唯一挂载点
- `requirements -> getChoiceAvailability() -> disabled button` 这一整条资源门槛链路
- `getChoiceImpactSummary()` 和 `getResourceStory()` 这两个资源叙事出口

### 3. 如果要继续优化，优先级建议
1. 把资源门槛做得更精细，不再只靠静态 requirements
2. 让不同资源危险状态反向影响标题、文案语气或音效
3. 资源区与左侧正文首行的纵向对齐微调
4. consequence 成功/危险状态的视觉区分
5. 移动端细节打磨

## 设计原则
- 极简代码
- 不做无意义抽象
- 保留黑镜式压迫感，但阅读必须舒服
- 视觉层级优先于花哨效果
- 所有布局调整优先服务“阅读顺序清晰”

## Git / 工作区提醒
当前工作区不是干净状态，接手时先看 `git status`。

尤其注意：
- 不要回滚不属于自己任务的文件改动
- 如果看到 `assets/images/export.zip`、`小游戏ui/skill.md` 处于删除状态，先假定那是用户已有改动，不要擅自恢复

## 一句话交接摘要
当前版本已经把主界面稳定成“上方小时数，中间统一内容大框，框内左文右资源，图片在下，结果覆盖左侧正文区”的结构；下一个 AI 应该在这个结构上微调，而不是重新推翻布局。
