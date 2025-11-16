# Mobius - 中日企业无缝连接桥梁

一个现代化、响应式的企业服务网站，专注于中日跨境业务支持。

## 🌟 项目特色

- **现代设计**: 采用渐变色彩、玻璃态效果和流畅动画
- **完全响应式**: 完美适配桌面、平板和手机设备
- **用户体验**: 流畅的交互效果和直观的导航体验
- **专业布局**: 清晰的服务展示和流程说明
- **SEO优化**: 结构良好的HTML和语义化标签

## 🎨 设计理念

### 色彩方案
- **主色调**: 深海蓝 (#1e3a8a) + 科技蓝 (#3b82f6)
- **强调色**: 渡边红 (#dc2626) - 体现日本元素
- **辅助色**: 浅灰蓝背景 + 深灰文字 + 纯白净色

### 视觉元素
- **Mobius环**: 3D动画效果，象征"无断点连接"
- **渐变按钮**: 现代感十足的交互元素
- **卡片设计**: 悬停动效和阴影变化
- **时间线**: 连接线动画和步骤高亮

## 📱 页面结构

### 1. 导航栏 (Navigation)
- 固定顶部，滚动时背景变化
- 移动端汉堡菜单
- 平滑滚动导航

### 2. 主视觉区 (Hero)
- 突出的Slogan和行动按钮
- Mobius环3D动画
- 中日国旗浮动效果
- 视差滚动背景

### 3. 品牌定位 (Brand Positioning)
- 服务特点展示
- 成功数据统计
- 专业形象建立

### 4. 核心服务 (Core Services)
- 6大服务模块卡片
- 详细服务列表
- 悬停动效和交互

### 5. 团队介绍 (Team Profile)
- 个人背景展示
- 专业技能标签
- 资质认证展示

### 6. 落地流程 (Process Timeline)
- 6步流程时间线
- 动态连接线效果
- 步骤高亮显示

### 7. 知识库 (Knowledge Base)
- 服务分类展示
- 快速导航链接
- 预览卡片设计

### 8. 社群区 (Community)
- 微信社群介绍
- 二维码展示
- 成员数据统计

### 9. 联系表单 (Contact Form)
- 完整的联系表单
- 表单验证
- 微信二维码

## 🛠️ 技术栈

- **HTML5**: 语义化标签和结构
- **CSS3**: 现代布局和动画
- **JavaScript ES6+**: 交互效果和表单处理
- **Font Awesome**: 图标库
- **Google Fonts**: Inter + Noto Sans SC

## 📁 文件结构

```
mobius/
├── index.html          # 主页面文件
├── style.css          # 完整样式表
├── script.js          # JavaScript交互
├── README.md          # 项目说明
├── services/          # 服务详情页面
│   ├── setup.html     # 企业落地服务
│   ├── visa.html      # 签证服务
│   ├── tax.html       # 财税・补助金
│   ├── legal.html     # 法务・合同
│   ├── life.html      # 生活支援
│   └── business.html  # 开店咨询
└── assets/            # 静态资源 (如果需要)
```

## 🚀 使用方法

### 直接使用
1. 下载所有文件到本地目录
2. 直接打开 `index.html` 文件
3. 推荐使用本地服务器查看最佳效果

### 使用本地服务器
```bash
# Python 3
python -m http.server 8000

# Node.js (需要安装 http-server)
npx http-server

# PHP
php -S localhost:8000
```

## 🎯 核心功能

### ✅ 已实现功能
- [x] 响应式布局设计
- [x] 导航栏滚动效果
- [x] 移动端汉堡菜单
- [x] **下拉菜单交互** (悬停显示六种服务)
- [x] 服务详情页面 (6个独立页面)
- [x] 服务卡片链接到详情页
- [x] 服务卡片悬停效果
- [x] 时间线动画
- [x] 表单验证
- [x] 平滑滚动
- [x] 数字计数动画
- [x] 视差滚动效果

### 🔄 可扩展功能
- [ ] 后端API集成
- [ ] 实际表单提交
- [ ] 微信支付集成
- [ ] 在线客服系统
- [ ] 多语言支持
- [ ] 深色模式

## 🎨 自定义配置

### 修改颜色主题
在 `style.css` 中修改CSS变量：

```css
:root {
    --primary-blue: #your-color;
    --tech-blue: #your-color;
    --accent-red: #your-color;
    /* ... */
}
```

### 修改内容信息
直接编辑 `index.html` 中的：
- 公司信息
- 服务描述
- 联系方式
- 团队介绍

### 添加新的服务模块
复制现有的服务卡片HTML结构，修改内容：
```html
<div class="service-card" data-service="new-service">
    <!-- 服务内容 -->
</div>
```

## 📱 浏览器兼容性

- ✅ Chrome (最新版本)
- ✅ Firefox (最新版本)
- ✅ Safari (最新版本)
- ✅ Edge (最新版本)
- ✅ 移动端浏览器

## 🚀 部署建议

### 静态托管平台
- **Netlify**: 拖拽部署，免费SSL
- **Vercel**: 自动部署，全球CDN
- **GitHub Pages**: 与GitHub集成
- **Cloudflare Pages**: 高性能CDN

### 服务器部署
上传所有文件到网站根目录即可

## 📞 联系信息

- **邮箱**: contact@mobius-service.com
- **微信**: (二维码展示)
- **响应时间**: 24小时内

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

---

**Mobius** - 中日企业无缝连接桥梁 🌉