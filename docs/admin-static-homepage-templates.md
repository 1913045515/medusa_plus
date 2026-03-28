# Admin 静态 HTML 首页模板说明

## 背景

项目首页已经调整为基于 Admin 后台管理静态 HTML 模板的模式。

这套方案适合以下场景：

- 首页是纯静态营销页或品牌页
- 页面不依赖商品、课程、价格等实时业务数据
- 外部设计或前端同学可以直接交付一份静态 HTML 和 CSS
- 运营希望在后台切换草稿、发布和活动版本，而不是每次都发版前端

## 功能概览

当前首页模板能力支持：

- 在 Admin 中创建多份首页模板记录
- 为每份模板维护标题、handle、HTML 和 CSS
- 保存草稿
- 发布某一份模板为当前生效首页
- 在后台查看清洗后的实时预览
- storefront 优先渲染已发布模板，失败时回退到默认首页

## 使用入口

后台入口：

- Admin 首页模板管理页

前台表现：

- 若存在已发布静态模板，则 storefront 首页直接渲染模板内容
- 若模板为空、不可用或接口失败，则 storefront 使用默认首页兜底

## 模板内容规则

### 支持内容

- 纯 HTML 结构
- 独立 CSS 样式
- 图片、链接、普通文案区块
- 纯展示型页面布局

### 不支持内容

- 自定义 JavaScript
- script 标签
- HTML 中内联 style 标签
- onClick、onLoad 等事件属性
- javascript: 链接

### 建议约束

建议所有首页模板都使用统一根节点，例如：

```html
<div class="cms-homepage your-page-name">
  ...
</div>
```

这样可以降低样式污染 storefront 其他区域的风险。

## 推荐工作流

1. 设计或前端同学输出一份静态首页 HTML 和 CSS
2. 将 HTML 粘贴到 Admin 的 HTML 输入区
3. 将 CSS 粘贴到 Admin 的 CSS 输入区
4. 在右侧预览区检查页面效果
5. 保存为草稿
6. 确认无误后发布为当前首页

## 武术课程网站首页示例

下面是一份适合武术课程网站的经典首页示例，风格是深色底、金色点缀、传统感和招生转化兼顾。

### HTML

```html
<div class="cms-homepage martial-home">
  <section class="martial-hero">
    <div class="martial-hero__overlay"></div>
    <div class="martial-shell martial-hero__content">
      <div class="martial-hero__badge">传武体系课程平台</div>
      <h1>以武修身，以术立骨</h1>
      <p class="martial-hero__lead">
        从少儿武术启蒙、散打实战、防身训练，到成人养生功法与传统拳械体系，
        打造一套兼顾精神、体能、技法与气质的现代武术课程体系。
      </p>
      <div class="martial-hero__actions">
        <a href="/courses" class="martial-btn martial-btn--primary">查看课程体系</a>
        <a href="/contact" class="martial-btn martial-btn--ghost">预约体验课</a>
      </div>
      <div class="martial-hero__stats">
        <div class="martial-stat">
          <strong>12+</strong>
          <span>核心课程模块</span>
        </div>
        <div class="martial-stat">
          <strong>8年</strong>
          <span>教学体系沉淀</span>
        </div>
        <div class="martial-stat">
          <strong>3000+</strong>
          <span>累计学员训练</span>
        </div>
      </div>
    </div>
  </section>

  <section class="martial-intro">
    <div class="martial-shell">
      <div class="martial-section-head">
        <span>宗旨理念</span>
        <h2>不止教动作，更重视人的精神、筋骨与气息</h2>
        <p>
          武术不是单一的表演，也不是简单的体能课。我们以传统武学精神为根，
          结合现代训练方法，让初学者学得稳、学得正，也让进阶者练得深、练得久。
        </p>
      </div>

      <div class="martial-values">
        <article class="martial-card">
          <h3>正身</h3>
          <p>重视站姿、步法、身法和发力结构，建立扎实的身体控制能力。</p>
        </article>
        <article class="martial-card">
          <h3>养气</h3>
          <p>通过呼吸、节奏与功法训练，提升专注力、耐心与稳定情绪。</p>
        </article>
        <article class="martial-card">
          <h3>明礼</h3>
          <p>以礼入武，以武养德，让课程不仅培养技艺，也塑造品格。</p>
        </article>
      </div>
    </div>
  </section>

  <section class="martial-programs">
    <div class="martial-shell">
      <div class="martial-section-head">
        <span>课程体系</span>
        <h2>从入门到进阶，兼顾少儿、成人与实战训练</h2>
      </div>

      <div class="martial-grid martial-grid--three">
        <article class="martial-program">
          <div class="martial-program__tag">少儿启蒙</div>
          <h3>少儿武术基础班</h3>
          <p>培养专注力、协调性、柔韧性与礼仪习惯，让孩子建立自信和纪律感。</p>
        </article>

        <article class="martial-program">
          <div class="martial-program__tag">成人进修</div>
          <h3>传统拳法系统班</h3>
          <p>系统学习基本功、单练套路、对练方法与拳理结构，重在完整传承。</p>
        </article>

        <article class="martial-program">
          <div class="martial-program__tag">实战方向</div>
          <h3>散打与防身应用班</h3>
          <p>围绕步法、距离、反应、攻防转换与自我保护建立实用能力。</p>
        </article>

        <article class="martial-program">
          <div class="martial-program__tag">养生训练</div>
          <h3>功法与体能修复班</h3>
          <p>适合长期久坐、体态失衡或需要恢复训练的人群，兼顾养生与体质提升。</p>
        </article>

        <article class="martial-program">
          <div class="martial-program__tag">兵器专项</div>
          <h3>刀枪剑棍专项课</h3>
          <p>学习传统器械基础，训练节奏、线路、身械配合与演练气势。</p>
        </article>

        <article class="martial-program">
          <div class="martial-program__tag">高阶沉淀</div>
          <h3>教练成长班</h3>
          <p>面向长期学习者，强化教学表达、动作拆解与课程带练能力。</p>
        </article>
      </div>
    </div>
  </section>

  <section class="martial-masters">
    <div class="martial-shell martial-masters__wrap">
      <div class="martial-masters__image">
        <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80" alt="武术导师训练展示">
      </div>
      <div class="martial-masters__content">
        <span>师资团队</span>
        <h2>有传承，也有教学方法</h2>
        <p>
          教学团队由传统武术教练、散打训练师和体能导师共同组成。
          既注重动作标准和拳术逻辑，也强调教学节奏、个体差异与长期成长路径。
        </p>
        <ul class="martial-list">
          <li>小班教学，关注每位学员动作纠正</li>
          <li>阶段式训练目标，避免盲练与乱练</li>
          <li>基础、进阶、专项课清晰分层</li>
        </ul>
      </div>
    </div>
  </section>

  <section class="martial-benefits">
    <div class="martial-shell">
      <div class="martial-section-head">
        <span>训练收获</span>
        <h2>练武之后，改变的不只是力量</h2>
      </div>

      <div class="martial-grid martial-grid--four">
        <article class="martial-benefit">
          <h3>体能提升</h3>
          <p>增强力量、速度、柔韧与耐力，改善日常身体状态。</p>
        </article>
        <article class="martial-benefit">
          <h3>专注稳定</h3>
          <p>通过重复打磨动作与节奏控制，提升注意力和心性稳定度。</p>
        </article>
        <article class="martial-benefit">
          <h3>防身意识</h3>
          <p>建立距离感、反应能力与基本自护逻辑，更有安全感。</p>
        </article>
        <article class="martial-benefit">
          <h3>文化气质</h3>
          <p>在礼仪、克制与坚持中，形成从容、有分寸的精神面貌。</p>
        </article>
      </div>
    </div>
  </section>

  <section class="martial-cta">
    <div class="martial-shell martial-cta__box">
      <div>
        <span>现在开始</span>
        <h2>预约一节体验课，走进真正的武术训练</h2>
        <p>
          不论你是零基础初学者、希望孩子接受系统训练，还是想重新找回身体状态，
          都可以从一节体验课开始。
        </p>
      </div>
      <div class="martial-cta__actions">
        <a href="/contact" class="martial-btn martial-btn--primary">立即预约</a>
        <a href="/courses" class="martial-btn martial-btn--ghost">浏览全部课程</a>
      </div>
    </div>
  </section>
</div>
```

### CSS

```css
.cms-homepage-template,
.cms-homepage {
  width: 100%;
}

.martial-home {
  background:
    radial-gradient(circle at top, rgba(197, 155, 95, 0.12), transparent 32%),
    linear-gradient(180deg, #120f0d 0%, #1c1713 40%, #0e0c0a 100%);
  color: #f4ead7;
  font-family: "Noto Serif SC", "Source Han Serif SC", "Songti SC", serif;
  line-height: 1.6;
}

.martial-home * {
  box-sizing: border-box;
}

.martial-home a {
  color: inherit;
  text-decoration: none;
}

.martial-shell {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

.martial-section-head {
  max-width: 760px;
  margin-bottom: 42px;
}

.martial-section-head span,
.martial-masters__content span,
.martial-cta__box span {
  display: inline-block;
  margin-bottom: 14px;
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #c9a36a;
}

.martial-section-head h2,
.martial-masters__content h2,
.martial-cta__box h2 {
  margin: 0 0 16px;
  font-size: clamp(30px, 4vw, 52px);
  line-height: 1.15;
  color: #fff6e8;
}

.martial-section-head p,
.martial-masters__content p,
.martial-cta__box p {
  margin: 0;
  font-size: 17px;
  color: rgba(244, 234, 215, 0.78);
}

.martial-hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  background:
    linear-gradient(rgba(10, 8, 7, 0.45), rgba(10, 8, 7, 0.7)),
    url("https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1600&q=80") center/cover no-repeat;
  border-bottom: 1px solid rgba(201, 163, 106, 0.18);
}

.martial-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(201, 163, 106, 0.16), transparent 24%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.42));
}

.martial-hero__content {
  position: relative;
  z-index: 1;
  padding: 92px 0;
  max-width: 860px;
}

.martial-hero__badge {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border: 1px solid rgba(201, 163, 106, 0.45);
  border-radius: 999px;
  background: rgba(17, 14, 11, 0.58);
  color: #e5c48c;
  font-size: 13px;
  letter-spacing: 0.16em;
  margin-bottom: 22px;
}

.martial-hero h1 {
  margin: 0 0 18px;
  font-size: clamp(44px, 7vw, 82px);
  line-height: 1.02;
  color: #fff8ed;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
}

.martial-hero__lead {
  margin: 0;
  max-width: 720px;
  font-size: clamp(18px, 2vw, 22px);
  color: rgba(255, 245, 228, 0.86);
}

.martial-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 34px;
}

.martial-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 0 24px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  transition: transform 0.25s ease, opacity 0.25s ease, background 0.25s ease;
}

.martial-btn:hover {
  transform: translateY(-2px);
  opacity: 0.96;
}

.martial-btn--primary {
  background: linear-gradient(135deg, #c79b5f, #e3c38e);
  color: #21180f;
  box-shadow: 0 10px 28px rgba(199, 155, 95, 0.25);
}

.martial-btn--ghost {
  border: 1px solid rgba(255, 238, 209, 0.35);
  background: rgba(255, 255, 255, 0.04);
  color: #fff3de;
}

.martial-hero__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-top: 42px;
  max-width: 720px;
}

.martial-stat {
  padding: 20px;
  border: 1px solid rgba(201, 163, 106, 0.18);
  background: rgba(17, 14, 11, 0.55);
  backdrop-filter: blur(4px);
  border-radius: 18px;
}

.martial-stat strong {
  display: block;
  font-size: 30px;
  color: #f2d09b;
  margin-bottom: 6px;
}

.martial-stat span {
  font-size: 14px;
  color: rgba(255, 240, 214, 0.72);
}

.martial-intro,
.martial-programs,
.martial-masters,
.martial-benefits,
.martial-cta {
  padding: 88px 0;
}

.martial-values,
.martial-grid {
  display: grid;
  gap: 22px;
}

.martial-values {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.martial-grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.martial-grid--four {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.martial-card,
.martial-program,
.martial-benefit {
  border: 1px solid rgba(201, 163, 106, 0.16);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(34, 27, 21, 0.92), rgba(19, 15, 12, 0.96));
  padding: 28px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

.martial-card h3,
.martial-program h3,
.martial-benefit h3 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #fff6e8;
}

.martial-card p,
.martial-program p,
.martial-benefit p {
  margin: 0;
  color: rgba(244, 234, 215, 0.72);
  font-size: 15px;
}

.martial-program__tag {
  display: inline-block;
  margin-bottom: 14px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(201, 163, 106, 0.12);
  color: #ddb67b;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.martial-masters__wrap {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 36px;
  align-items: center;
}

.martial-masters__image img {
  width: 100%;
  height: 100%;
  min-height: 520px;
  object-fit: cover;
  border-radius: 28px;
  border: 1px solid rgba(201, 163, 106, 0.18);
  display: block;
}

.martial-list {
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
}

.martial-list li {
  position: relative;
  padding-left: 22px;
  margin-bottom: 12px;
  color: rgba(255, 243, 219, 0.78);
}

.martial-list li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 11px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #c79b5f;
  box-shadow: 0 0 0 4px rgba(199, 155, 95, 0.12);
}

.martial-cta__box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 28px;
  padding: 38px;
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(201, 163, 106, 0.12), rgba(255, 255, 255, 0.03)),
    #17120e;
  border: 1px solid rgba(201, 163, 106, 0.2);
}

.martial-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  min-width: 240px;
  justify-content: flex-end;
}

@media (max-width: 1100px) {
  .martial-values,
  .martial-grid--three,
  .martial-grid--four,
  .martial-masters__wrap,
  .martial-hero__stats,
  .martial-cta__box {
    grid-template-columns: 1fr;
  }

  .martial-masters__wrap,
  .martial-cta__box {
    display: grid;
  }

  .martial-cta__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .martial-shell {
    width: min(100% - 28px, 1180px);
  }

  .martial-hero {
    min-height: auto;
  }

  .martial-intro,
  .martial-programs,
  .martial-masters,
  .martial-benefits,
  .martial-cta {
    padding: 64px 0;
  }

  .martial-card,
  .martial-program,
  .martial-benefit,
  .martial-cta__box {
    padding: 22px;
  }

  .martial-masters__image img {
    min-height: 320px;
  }
}
```

## 后续可扩展方向

如果后续要继续扩展武术课程站首页，可以继续迭代这些版本：

- 少林黑金版
- 新中式高端武馆版
- 少儿武术招生转化版
- 散打实战训练营版

## 注意事项

- HTML 和 CSS 应分别粘贴到 Admin 的两个输入框
- 不要把 CSS 写进 HTML 的 style 标签中
- 不要在模板中使用 JavaScript
- 若预览内容被清洗，优先检查是否包含 script、事件属性或危险链接