/**
 * 组件管理器 - 统一管理网站重复组件
 */
class ComponentManager {
    constructor() {
        this.version = '2.1'; // 版本号，用于强制更新
        this.baseUrl = this.getBaseUrl();
        this.componentsPath = this.baseUrl + 'components/';
        this.currentPage = this.getCurrentPage();

        // 立即显示版本信息
        // console.log(`🚀 ComponentManager v${this.version} 已加载 - Logo已更新为图片!`);
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        // 如果在根目录或子目录中，返回正确的相对路径
        if (path.includes('/services/') || path.includes('/components/')) {
            return '../';
        }
        return './';
    }

    /**
     * 获取当前页面信息
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        return {
            isServicePage: path.includes('/services/'),
            filename: filename,
            isIndex: filename === '' || filename === 'index.html'
        };
    }

    /**
     * 创建统一的导航栏组件
     */
    createNavigation() {
        const nav = document.createElement('nav');
        nav.className = 'navbar';
        nav.id = 'navbar';

        const container = document.createElement('div');
        container.className = 'container nav-container';

        // Logo部分
        const brand = document.createElement('div');
        brand.className = 'nav-brand';
        brand.innerHTML = `
            <div class="logo-container">
                <a href="index.html" class="logo-link" title="返回首页">
                    <div class="mobius-logo">
                        <picture>
                            <source srcset="${this.baseUrl}assets/imgs/logo-medium.webp" type="image/webp">
                            <source srcset="${this.baseUrl}assets/imgs/logo-tiny.png" type="image/png">
                            <img src="${this.baseUrl}assets/imgs/logo-tiny.png" alt="Mobius Logo" class="logo-image" width="120" height="40" loading="lazy">
                        </picture>
                    </div>
                </a>
                <a href="index.html" class="brand-link" title="返回首页">
                    <span class="brand-text">Mobius</span>
                </a>
            </div>
        `;

        // 导航菜单
        const menu = document.createElement('ul');
        menu.className = 'nav-menu';
        menu.innerHTML = this.generateNavMenuItems();

        // 汉堡菜单
        const hamburger = document.createElement('div');
        hamburger.className = 'hamburger';
        hamburger.id = 'hamburger';
        hamburger.innerHTML = '<span></span><span></span><span></span>';

        container.appendChild(brand);
        container.appendChild(menu);
        container.appendChild(hamburger);
        nav.appendChild(container);

        return nav;
    }

    
    /**
     * 生成导航菜单项
     */
    generateNavMenuItems() {
        const homeLink = this.currentPage.isIndex ? '#home' : `${this.baseUrl}index.html#home`;
        const servicesLink = this.currentPage.isIndex ? '#services' : `${this.baseUrl}index.html#services`;
        const knowledgeLink = this.currentPage.isIndex ? 'knowledge.html' : `${this.baseUrl}knowledge.html`;
        const communityLink = this.currentPage.isIndex ? 'community.html' : `${this.baseUrl}community.html`;
        const teamLink = this.currentPage.isIndex ? 'team.html' : `${this.baseUrl}team.html`;
        const contactLink = this.currentPage.isIndex ? '#contact' : `${this.baseUrl}index.html#contact`;

        return `
            <li><a href="${homeLink}" class="nav-link">首页</a></li>
            <li class="nav-dropdown">
                <a href="${servicesLink}" class="nav-link dropdown-toggle">
                    核心服务 <i class="fas fa-chevron-down"></i>
                </a>
                <div class="dropdown-menu">
                    <a href="${this.baseUrl}services/setup.html" class="dropdown-item">
                        <i class="fas fa-building"></i>
                        <div>
                            <span class="item-title">企业落地服务</span>
                            <span class="item-desc">公司设立、银行开户、税务登记</span>
                        </div>
                    </a>
                    <a href="${this.baseUrl}services/visa.html" class="dropdown-item">
                        <i class="fas fa-passport"></i>
                        <div>
                            <span class="item-title">签证服务</span>
                            <span class="item-desc">经营管理、高端人才、家族滞在</span>
                        </div>
                    </a>
                    <a href="${this.baseUrl}services/tax.html" class="dropdown-item">
                        <i class="fas fa-coins"></i>
                        <div>
                            <span class="item-title">财税・补助金</span>
                            <span class="item-desc">税务流程、补助金申请、记账服务</span>
                        </div>
                    </a>
                    <a href="${this.baseUrl}services/legal.html" class="dropdown-item">
                        <i class="fas fa-balance-scale"></i>
                        <div>
                            <span class="item-title">法务・合同</span>
                            <span class="item-desc">合同审核、法律风险、合规咨询</span>
                        </div>
                    </a>
                    <a href="${this.baseUrl}services/life.html" class="dropdown-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <span class="item-title">生活支援</span>
                            <span class="item-desc">银行卡、手机、住所、医疗协助</span>
                        </div>
                    </a>
                    <a href="${this.baseUrl}services/business.html" class="dropdown-item">
                        <i class="fas fa-store"></i>
                        <div>
                            <span class="item-title">开店咨询</span>
                            <span class="item-desc">餐饮、零售、美容、贸易等</span>
                        </div>
                    </a>
                </div>
            </li>
            <li><a href="${knowledgeLink}" class="nav-link">知识库</a></li>
            <li><a href="${communityLink}" class="nav-link">社群</a></li>
            <li><a href="${teamLink}" class="nav-link">专业团队</a></li>
            <li><a href="${contactLink}" class="nav-link">联系我们</a></li>
        `;
    }

    /**
     * 替换或添加导航栏
     */
    replaceNavigation() {
        const existingNav = document.querySelector('nav.navbar');
        const newNav = this.createNavigation();

        if (existingNav) {
            existingNav.parentNode.replaceChild(newNav, existingNav);
        } else {
            // 在body开头添加导航栏
            document.body.insertBefore(newNav, document.body.firstChild);
        }
    }

    /**
     * 创建统一的footer组件
     */
    createFooter() {
        const footer = document.createElement('footer');
        footer.className = 'footer';

        const container = document.createElement('div');
        container.className = 'container nav-container';

        // 创建footer内容
        const footerContent = document.createElement('div');
        footerContent.className = 'footer-content';
        footerContent.innerHTML = `
            <div class="footer-section">
                <div class="footer-logo">
                    <div class="logo-container">
                        <a href="index.html" class="logo-link" title="返回首页">
                            <div class="mobius-logo">
                                <picture>
                                    <source srcset="${this.baseUrl}assets/imgs/logo-medium.webp" type="image/webp">
                                    <source srcset="${this.baseUrl}assets/imgs/logo-tiny.png" type="image/png">
                                    <img src="${this.baseUrl}assets/imgs/logo-tiny.png" alt="Mobius Logo" class="logo-image" width="120" height="40" loading="lazy">
                                </picture>
                            </div>
                        </a>
                        <a href="index.html" class="brand-link" title="返回首页">
                            <h3>Mobius</h3>
                        </a>
                    </div>
                </div>
                <p class="footer-description">
                    无断点连接，一站式日本落地解决方案。我们致力于为中日企业提供无缝、稳定的落地与经营支持，助力企业在日本市场取得成功。
                </p>
            </div>
            <div class="footer-section">
                <h4>核心服务</h4>
                <ul class="footer-links">
                    <li><a href="${this.baseUrl}services/setup.html">企业落地服务</a></li>
                    <li><a href="${this.baseUrl}services/visa.html">签证服务</a></li>
                    <li><a href="${this.baseUrl}services/tax.html">财税・补助金</a></li>
                    <li><a href="${this.baseUrl}services/legal.html">法务・合同</a></li>
                    <li><a href="${this.baseUrl}services/life.html">生活支援</a></li>
                    <li><a href="${this.baseUrl}services/business.html">开店咨询</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>知识库</h4>
                <ul class="footer-links">
                    <li><a href="${this.baseUrl}knowledge.html#business">日本企业落地指南</a></li>
                    <li><a href="${this.baseUrl}knowledge.html#visa">签证攻略</a></li>
                    <li><a href="${this.baseUrl}knowledge.html#tax">税务・补助金</a></li>
                    <li><a href="${this.baseUrl}knowledge.html#business">行业落地指南</a></li>
                </ul>
            </div>
            <div class="footer-section">
                <h4>联系我们</h4>
                <ul class="footer-links">
                    <li><a href="${this.baseUrl}#contact">微信咨询</a></li>
                    <li><a href="${this.baseUrl}#contact">邮箱联系</a></li>
                    <li><a href="${this.baseUrl}community.html">加入社群</a></li>
                    <li><a href="${this.baseUrl}#contact">预约咨询</a></li>
                    <li><i class="fas fa-map-marker-alt"></i> 东京都涩谷区</li>
                </ul>
            </div>
        `;

        // 创建footer底部
        const footerBottom = document.createElement('div');
        footerBottom.className = 'footer-bottom';
        footerBottom.innerHTML = `
            <div class="copyright">
                <p>&copy; 2024 Mobius 中日企业服务. 保留所有权利.</p>
            </div>
            <div class="footer-social">
                <a href="#" aria-label="WeChat"><i class="fab fa-weixin"></i></a>
                <a href="#" aria-label="Email"><i class="fas fa-envelope"></i></a>
                <a href="#" aria-label="Phone"><i class="fas fa-phone"></i></a>
            </div>
        `;

        container.appendChild(footerContent);
        container.appendChild(footerBottom);
        footer.appendChild(container);

        return footer;
    }

    /**
     * 创建特性卡片网格内容
     */
    createFeaturesGridContent(baseUrl = this.getBaseUrl()) {
        const features = [
            {
                icon: 'fas fa-language',
                title: '无语言障碍',
                description: '中日双语专业团队，确保沟通精准无误',
                details: ['母语级中日双语服务', '专业术语精准翻译', '文化差异桥梁'],
                badge: '语言优势'
            },
            {
                icon: 'fas fa-shield-alt',
                title: '全程护航',
                description: '从规划到落地，全程专业支持',
                details: ['7×24小时快速响应', '一站式服务流程', '专属顾问对接'],
                badge: '全程服务'
            },
            {
                icon: 'fas fa-globe-asia',
                title: '本土化经验',
                description: '深度理解日本商业环境与文化',
                details: ['10年+日本本土经验', '深厚政商人脉资源', '熟悉行业监管政策'],
                badge: '本土专家'
            }
        ];

        return features.map(feature => `
            <div class="feature-card">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
                <div class="feature-details">
                    <ul>
                        ${feature.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
                <div class="feature-badge">${feature.badge}</div>
            </div>
        `).join('');
    }

    /**
     * 创建特性卡片网格容器（完整版本）
     */
    createFeaturesGrid(baseUrl = this.getBaseUrl()) {
        const featuresContainer = document.createElement('div');
        featuresContainer.className = 'features-grid features-grid-container';
        featuresContainer.innerHTML = this.createFeaturesGridContent(baseUrl);
        return featuresContainer;
    }

    /**
     * 填充特性卡片网格
     */
    replaceFeaturesGrid() {
        const existingFeatures = document.querySelector('.features-grid');
        if (existingFeatures) {
            existingFeatures.innerHTML = this.createFeaturesGridContent(); // 只填充内容
            console.log('✅ Features Grid 内容已填充');
        } else {
            console.warn('⚠️ 未找到现有的 features-grid');
        }
    }

    /**
     * 替换或添加footer
     */
    replaceFooter() {
        const existingFooter = document.querySelector('footer.footer');
        const newFooter = this.createFooter();

        if (existingFooter) {
            existingFooter.parentNode.replaceChild(newFooter, existingFooter);
        } else {
            document.body.appendChild(newFooter);
        }
    }

    /**
     * 初始化所有组件
     */
    init() {
        // 等待DOM加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.replaceNavigation();
                this.replaceFooter();
                this.replaceFeaturesGrid(); // 添加特性卡片替换
            });
        } else {
            this.replaceNavigation();
            this.replaceFooter();
            this.replaceFeaturesGrid(); // 添加特性卡片替换
        }
    }
}

// 创建全局组件管理器实例
window.componentManager = new ComponentManager();

// 自动初始化
window.componentManager.init();

// 调试信息 - 确认logo更新
// console.log('📝 Mobius Components.js v2.0 - Logo已更新为图片版本');
// console.log('📱 当前时间:', new Date().toLocaleString());
// console.log('🖼️ Logo图片路径测试:', window.componentManager.baseUrl + 'assets/imgs/logo.png');