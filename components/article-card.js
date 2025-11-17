/**
 * Article Card 组件管理器
 * 重构为纯内容渲染组件，只负责内容生成和DOM渲染
 */

// 导入事件总线和状态管理器
import globalEventBus, { EVENT_TYPES } from './event-bus.js';
import { KnowledgeStateManager } from './state-manager.js';

class ArticleCardManager {
    constructor(eventBus = null, stateManager = null) {
        // 注入依赖的事件总线和状态管理器
        this.eventBus = eventBus || globalEventBus;
        this.stateManager = stateManager || new KnowledgeStateManager(this.eventBus);

        this.articles = {};           // 原始数据容器（全部数据）
        this.metadata = {};
        this.baseUrl = this.getBaseUrl();
        this.dataLoaded = false;

        // 分页配置
        this.pagination = {
            itemsPerPage: 12,
            currentPage: 1,
            totalPages: 1,
            totalItems: 0
        };

        this.currentPageStates = {};
        this.cache = new Map(); // 内容缓存

        // 绑定方法
        this.render = this.render.bind(this);
        this.handleDataLoaded = this.handleDataLoaded.bind(this);
        this.handleFilterChange = this.handleFilterChange.bind(this);

        // 初始化事件监听
        this.initEventListeners();

        // 数据加载将由外部调用，避免重复加载
        // this.loadArticlesFromJSON();

        console.log('📄 ArticleCardManager initialized with event-driven architecture');
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/knowledge/')) {
            return '../';
        }
        return './';
    }

    /**
     * 初始化事件监听
     */
  initEventListeners() {
    // 监听导航事件
    this.eventBus.on(EVENT_TYPES.NAV_CATEGORY_CLICK, this.handleFilterChange);
    this.eventBus.on(EVENT_TYPES.NAV_TAG_CLICK, this.handleFilterChange);
    this.eventBus.on(EVENT_TYPES.NAV_DIFFICULTY_CLICK, this.handleFilterChange);
    this.eventBus.on(EVENT_TYPES.NAV_SEARCH, this.handleFilterChange);

    // 监听状态变化 - 只监听过滤器变化，避免分页更新循环
    this.stateManager.subscribe(this.render, ['filters'], {
      immediate: false // 不立即执行，等待数据加载完成
    });

    console.log('🎧 Event listeners initialized for content rendering');
  }

  /**
     * 创建DOM元素的完全安全方法
     * @param {string} tag - HTML标签名
     * @param {string} className - CSS类名
     * @param {string|Node} content - 内容（文本或节点），安全替代innerHTML
     */
    createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;

        if (content) {
            if (typeof content === 'string') {
                // 安全：使用textContent而不是innerHTML
                element.textContent = content;
            } else if (content instanceof Node) {
                // 安全：直接添加DOM节点
                element.appendChild(content);
            }
        }

        return element;
    }

    /**
     * 创建文本节点
     */
    createTextNode(text) {
        return document.createTextNode(text);
    }

    /**
     * 安全地清空容器内容
     * @param {Element} container - 要清空的容器元素
     */
    safeClearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * 安全地设置容器内容
     * @param {Element} container - 容器元素
     * @param {string|Node|NodeList} content - 新内容
     */
    safeSetContainerContent(container, content) {
        // 清空现有内容
        this.safeClearContainer(container);

        if (typeof content === 'string') {
            // 如果内容包含HTML，创建临时div来解析，然后验证安全性
            if (content.includes('<')) {
                const tempDiv = document.createElement('div');
                tempDiv.textContent = content; // 安全转义
                container.appendChild(tempDiv);
            } else {
                container.textContent = content;
            }
        } else if (content instanceof Node) {
            container.appendChild(content);
        } else if (content instanceof NodeList || Array.isArray(content)) {
            content.forEach(node => {
                if (node instanceof Node) {
                    container.appendChild(node);
                }
            });
        }
    }

    /**
     * 创建图标元素
     */
    createIcon(iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        return icon;
    }

    /**
     * 从JSON文件加载文章数据
     */
    async loadArticlesFromJSON() {
        try {
            const jsonUrl = `${this.baseUrl}data/articles.json`;
            const response = await fetch(jsonUrl);

            if (!response.ok) {
                throw new Error(`Failed to load articles: ${response.status}`);
            }

            const data = await response.json();
            this.articles = data.categories;
            this.metadata = data.metadata;
            this.dataLoaded = true;

            // 数据加载完成后触发事件
            this.eventBus.emit(EVENT_TYPES.DATA_LOADED, {
                articles: this.articles,
                metadata: this.metadata,
                timestamp: Date.now()
            });

            // 更新状态管理器
            this.stateManager.updateState({
                data: {
                    articles: Object.values(this.articles).flat(),
                    categories: Object.keys(this.articles),
                    isLoaded: true,
                    isLoading: false,
                    lastUpdated: new Date().toISOString()
                }
            });

          } catch (error) {
            console.error('❌ 加载文章数据失败:', error);
            // 降级处理：使用默认数据
            this.loadDefaultArticles();
        }
    }

    /**
     * 降级处理：加载默认文章数据
     */
    loadDefaultArticles() {
        console.warn('⚠️ 使用默认文章数据');
        this.articles = {
            business: [
                {
                    id: 'japan-company-registration-2024',
                    title: '2024年日本公司注册完整流程',
                    excerpt: '详细解析2024年在日本设立株式会社和合同公司的完整流程、所需材料、费用和时间周期...',
                    date: '2024年1月15日',
                    readingTime: '15分钟阅读',
                    views: '1,245',
                    icon: 'fas fa-building',
                    tags: ['公司注册', '株式会社'],
                    url: 'knowledge/japan-company-registration-2024.html'
                }
            ]
        };
        this.metadata = {
            totalArticles: 1,
            lastUpdated: '2024-01-15',
            version: '1.0.0'
        };
        this.dataLoaded = true;

        // 触发数据容器变化事件（容器1初始化 - 备用数据）
        this.triggerPageRefresh('container1-initialized-fallback', {
            articles: this.articles,
            metadata: this.metadata
        });
    }

    /**
     * 等待数据加载完成
     */
    async waitForDataLoad() {
        if (this.dataLoaded) {
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const checkData = setInterval(() => {
                if (this.dataLoaded) {
                    clearInterval(checkData);
                    resolve();
                }
            }, 100);

            // 超时处理
            setTimeout(() => {
                clearInterval(checkData);
                console.warn('⚠️ 数据加载超时，使用默认数据');
                resolve();
            }, 5000);
        });
    }

    /**
     * 初始化文章数据 (已弃用，保留作为备用)
     */
    initializeArticles() {
        return {
            business: [
                {
                    id: 'japan-company-registration-2024',
                    title: '2024年日本公司注册完整流程',
                    excerpt: '详细解析2024年在日本设立株式会社和合同公司的完整流程、所需材料、费用和时间周期，助您顺利开展日本业务...',
                    date: '2024年1月15日',
                    readingTime: '15分钟阅读',
                    views: '1,245',
                    icon: 'fas fa-building',
                    tags: ['公司注册', '株式会社', '合同公司'],
                    url: 'knowledge/japan-company-registration-2024.html'
                },
                {
                    id: 'japan-business-setup-guide',
                    title: '日本企业落地服务指南',
                    excerpt: '为中日企业提供全方位的日本市场进入解决方案，包括公司注册、银行开户、税务登记等一站式服务...',
                    date: '2024年1月12日',
                    readingTime: '10分钟阅读',
                    views: '892',
                    icon: 'fas fa-university',
                    tags: ['企业落地', '银行开户', '税务登记'],
                    url: 'knowledge/japan-business-setup-guide.html'
                }
            ],
            visa: [
                {
                    id: 'japan-visa-guide-2024',
                    title: '2024年日本经营管理签证申请指南',
                    excerpt: '全面解析2024年日本经营管理签证的申请条件、流程、材料准备和成功要点，助您顺利获得在留资格...',
                    date: '2024年1月20日',
                    readingTime: '12分钟阅读',
                    views: '892',
                    icon: 'fas fa-passport',
                    tags: ['经营管理签证', '日本投资', '在留资格'],
                    url: 'knowledge/japan-visa-guide-2024.html'
                },
                {
                    id: 'japan-high-talent-visa',
                    title: '高度人才签证积分计算详解',
                    excerpt: '详细解析高度人才签证的积分计算方式，如何最大化积分获得永住权，快速通道申请攻略...',
                    date: '2024年1月18日',
                    readingTime: '10分钟阅读',
                    views: '756',
                    icon: 'fas fa-user-tie',
                    tags: ['高度人才', '积分计算', '永住权'],
                    url: '../services/visa.html'
                }
            ],
            tax: [
                {
                    id: 'japan-tax-guide-2024',
                    title: '2024年日本税务申报指南',
                    excerpt: '详细解析2024年日本法人税、消费税、源泉税等各类税务申报流程、时间节点和注意事项...',
                    date: '2024年1月25日',
                    readingTime: '18分钟阅读',
                    views: '756',
                    icon: 'fas fa-coins',
                    tags: ['税务申报', '法人税', '消费税'],
                    url: 'knowledge/japan-tax-guide-2024.html'
                },
                {
                    id: 'japan-consumption-tax',
                    title: '中小企业税务优惠策略',
                    excerpt: '合理利用日本税法中的优惠政策，为中小企业节省税务成本，提升企业竞争力...',
                    date: '2024年1月22日',
                    readingTime: '6分钟阅读',
                    views: '623',
                    icon: 'fas fa-percentage',
                    tags: ['税务优惠', '中小企业', '节税策略'],
                    url: '../services/tax.html'
                }
            ],
            subsidy: [
                {
                    id: 'japan-it-subsidy-2024',
                    title: '2024年IT化补助金申请指南',
                    excerpt: '详细介绍IT化补助金的申请条件、申请流程和成功案例，助您的企业数字化转型成功...',
                    date: '2024年1月30日',
                    readingTime: '6分钟阅读',
                    views: '445',
                    icon: 'fas fa-gift',
                    tags: ['IT化补助', '数字化转型', '申请指南'],
                    url: '../services/tax.html'
                },
                {
                    id: 'japan-green-subsidy',
                    title: '绿色环保补助金申请策略',
                    excerpt: '针对环保企业和绿色项目的补助金申请技巧，如何提高申请成功率...',
                    date: '2024年1月28日',
                    readingTime: '8分钟阅读',
                    views: '367',
                    icon: 'fas fa-leaf',
                    tags: ['环保补助', '绿色项目', '申请策略'],
                    url: '../services/tax.html'
                }
            ],
            legal: [
                {
                    id: 'japan-labor-law-guide-2024',
                    title: '日本劳动合同法要点解析',
                    excerpt: '了解日本劳动合同的基本要求、解雇规定、员工权益保护等重要法律条款...',
                    date: '2024年1月28日',
                    readingTime: '9分钟阅读',
                    views: '521',
                    icon: 'fas fa-balance-scale',
                    tags: ['劳动法', '劳动合同', '员工权益'],
                    url: '../services/legal.html'
                },
                {
                    id: 'japan-personal-data-protection',
                    title: '个人情报保护法合规指南',
                    excerpt: '企业在处理客户和员工个人信息时必须遵守的法律要求和合规措施...',
                    date: '2024年1月24日',
                    readingTime: '7分钟阅读',
                    views: '438',
                    icon: 'fas fa-shield-alt',
                    tags: ['个人情报', '数据保护', '合规指南'],
                    url: '../services/legal.html'
                }
            ]
        };
    }

    /**
     * 创建单个文章卡片
     */
    createArticleCard(article) {
        const card = this.createElement('article', 'article-card');

        // 添加类型标识
        if (article.type === 'faq') {
            card.classList.add('faq-card');
        }
        if (article.featured) {
            card.classList.add('featured');
        }

        card.onclick = () => this.handleCardClick(article);
        card.style.cursor = 'pointer';

        // 创建文章图片区域
        const articleImage = this.createElement('div', 'article-image');

        // 添加类型标签
        if (article.type === 'faq') {
            const typeLabel = this.createElement('span', 'article-type-label');
            typeLabel.textContent = 'FAQ';
            typeLabel.appendChild(this.createIcon('fas fa-question-circle'));
            articleImage.appendChild(typeLabel);
        }

        const icon = this.createIcon(article.icon);
        articleImage.appendChild(icon);

        // 创建文章内容区域
        const articleContent = this.createElement('div', 'article-content');

        // 创建文章元信息
        const articleMeta = this.createElement('div', 'article-meta');

        const dateSpan = this.createElement('span');
        dateSpan.appendChild(this.createIcon('fas fa-calendar'));
        dateSpan.appendChild(this.createTextNode(' ' + article.date));
        articleMeta.appendChild(dateSpan);

        const timeSpan = this.createElement('span');
        timeSpan.appendChild(this.createIcon('fas fa-clock'));
        timeSpan.appendChild(this.createTextNode(' ' + article.readingTime));
        articleMeta.appendChild(timeSpan);

        if (article.views) {
            const viewsSpan = this.createElement('span');
            viewsSpan.appendChild(this.createIcon('fas fa-eye'));
            viewsSpan.appendChild(this.createTextNode(' ' + article.views + ' 阅读'));
            articleMeta.appendChild(viewsSpan);
        }

        // 添加热度指标
        if (article.popularity && article.popularity.hotScore) {
            const hotScoreSpan = this.createElement('span', 'hot-score');
            const hotScore = article.popularity.hotScore;

            // 根据热度分数显示不同的图标和颜色
            let hotIcon = 'fas fa-thermometer-empty';
            let hotClass = 'low';

            if (hotScore >= 90) {
                hotIcon = 'fas fa-fire';
                hotClass = 'high';
            } else if (hotScore >= 70) {
                hotIcon = 'fas fa-thermometer-half';
                hotClass = 'medium';
            }

            hotScoreSpan.appendChild(this.createIcon(hotIcon));
            hotScoreSpan.appendChild(this.createTextNode(' 热度:' + hotScore));
            hotScoreSpan.classList.add(hotClass);
            articleMeta.appendChild(hotScoreSpan);
        }

        // 创建文章标题
        const articleTitle = this.createElement('h3', 'article-title');
        articleTitle.appendChild(this.createTextNode(article.title));

        // 创建文章摘要
        const articleExcerpt = this.createElement('p', 'article-excerpt');
        articleExcerpt.appendChild(this.createTextNode(article.excerpt));

        // 创建文章标签
        const articleTags = this.createElement('div', 'article-tags');

        // 添加难度标签
        if (article.difficulty) {
            const difficultySpan = this.createElement('span', 'article-tag difficulty-tag');
            difficultySpan.textContent = this.getDifficultyText(article.difficulty);
            difficultySpan.classList.add(article.difficulty);
            articleTags.appendChild(difficultySpan);
        }

        // 添加普通标签
        if (article.tags) {
            article.tags.forEach(tag => {
                const tagSpan = this.createElement('span', 'article-tag');
                tagSpan.appendChild(this.createTextNode(tag));
                articleTags.appendChild(tagSpan);
            });
        }

        // 组装文章内容
        articleContent.appendChild(articleMeta);
        articleContent.appendChild(articleTitle);
        articleContent.appendChild(articleExcerpt);
        articleContent.appendChild(articleTags);

        // 组装卡片
        card.appendChild(articleImage);
        card.appendChild(articleContent);

        // 添加dataset属性用于筛选
        if (article.difficulty) {
            // 将中文难度转换为英文ID用于筛选
            card.dataset.difficulty = this.getDifficultyId(article.difficulty);
        }

        // 添加文章ID用于二级标签筛选
        if (article.id) {
            card.dataset.articleId = article.id;
        }

        return card;
    }

    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
        const map = {
            '初级': '初级',
            '中级': '中级',
            '高级': '高级'
        };
        return map[difficulty] || '初级';
    }

    /**
     * 获取难度英文ID
     */
    getDifficultyId(difficulty) {
        const map = {
            '初级': 'beginner',
            '中级': 'intermediate',
            '高级': 'advanced'
        };
        return map[difficulty] || 'beginner';
      }

    /**
     * 生成指定分类的分页文章网格
     * @param {string} category - 分类名称
     * @param {string} containerId - 容器ID
     * @param {number} currentPage - 当前页码
     * @param {boolean} useContainer1 - 是否强制使用容器1
     */
    async generatePaginatedArticleGrid(category, containerId, currentPage = 1, useContainer1 = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        // 显示加载状态
        container.innerHTML = this.createLoadingSpinner();

        // 等待数据加载完成
        await this.waitForDataLoad();

        // 获取分页数据
        const paginationData = this.getCategoryPaginatedData(category, currentPage, useContainer1);

        container.innerHTML = '';

        if (paginationData.items.length === 0) {
            container.innerHTML = this.createEmptyState(category);
            return;
        }

        // 生成文章卡片
        paginationData.items.forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });

        // 清理现有的分页控件
        this.removeExistingPaginationControls(containerId);

        // 生成分页控件
        const paginationControls = this.generatePaginationControls(paginationData, containerId, category, useContainer1);
        container.insertAdjacentHTML('afterend', paginationControls);

        // 添加动画效果
        this.addAnimationEffects(container);

        console.log(`✅ 已生成分页内容: ${category}, 页面 ${currentPage}, ${paginationData.items.length} 篇文章`);
    }

    /**
     * 生成所有分类的分页文章网格（用于"全部"显示）
     * @param {string} containerId - 容器ID
     * @param {number} currentPage - 当前页码
     * @param {boolean} useContainer1 - 是否强制使用容器1
     */
    async generatePaginatedAllArticleGrid(containerId, currentPage = 1, useContainer1 = false) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        // 显示加载状态
        container.innerHTML = this.createLoadingSpinner();

        // 等待数据加载完成
        await this.waitForDataLoad();

        // 获取所有分类的分页数据
        const paginationData = this.getAllCategoriesPaginatedData(currentPage, useContainer1);

        container.innerHTML = '';

        if (paginationData.items.length === 0) {
            container.innerHTML = this.createEmptyState('全部内容');
            return;
        }

        // 生成文章卡片
        paginationData.items.forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });

        // 清理现有的分页控件
        this.removeExistingPaginationControls(containerId);

        // 生成分页控件
        const paginationControls = this.generatePaginationControls(paginationData, containerId, 'all', useContainer1);
        container.insertAdjacentHTML('afterend', paginationControls);

        // 调试信息：确认分页控件已插入
        console.log('📄 分页控件HTML:', paginationControls.substring(0, 100) + '...');
        console.log('📄 容器ID:', containerId);
        console.log('📄 容器的下一个兄弟元素:', container.nextElementSibling);

        // 添加动画效果
        this.addAnimationEffects(container);

        console.log(`✅ 已生成分页内容: 全部内容, 页面 ${currentPage}, ${paginationData.items.length} 篇文章`);
    }

    /**
     * 处理卡片点击事件
     */
    handleCardClick(article) {
        console.log('🔍 卡片点击调试信息:', {
            id: article.id,
            url: article.url,
            title: article.title
        });

        // 优先使用URL直接跳转（最可靠）
        if (article.url) {
            console.log('✅ 使用URL直接跳转:', article.url);
            window.location.href = article.url;
            return;
        }

        // 备选方案：提取文章ID
        let articleId = '';

        if (article.id) {
            articleId = article.id;
        }

        // 跳转到知识详情页面
        if (articleId) {
            console.log('⚠️ 使用ID跳转（不推荐）:', articleId);
            window.location.href = `./knowledge-detail.html?id=${encodeURIComponent(articleId)}`;
        } else {
            console.error('❌ 无法获取文章信息:', article);
            alert('文章信息不完整，请稍后重试');
        }
    }

    /**
     * 生成指定分类的文章网格 (支持异步数据加载)
     */
    async generateArticleGrid(category, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        // 显示加载状态
        container.innerHTML = this.createLoadingSpinner();

        // 等待数据加载完成
        await this.waitForDataLoad();

        container.innerHTML = '';

        const articles = this.getCategoryDataSafely(category);

        if (articles.length === 0) {
            container.innerHTML = this.createEmptyState(category);
            return;
        }

        articles.forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });

        // 添加动画效果
        this.addAnimationEffects(container);

      }

    /**
     * 创建加载状态指示器
     */
    createLoadingSpinner() {
        return `
            <div style="display: flex; justify-content: center; align-items: center; height: 200px; color: var(--primary-blue);">
                <div style="text-align: center;">
                    <div class="loading-spinner" style="
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid var(--primary-blue);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <p>正在加载文章数据...</p>
                </div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }

    /**
     * 创建空状态提示
     */
    createEmptyState(category) {
        return `
            <div style="display: flex; justify-content: center; align-items: center; height: 200px; color: var(--light-text);">
                <div style="text-align: center;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                    <h3>暂无文章</h3>
                    <p>分类 "${category}" 中暂时没有文章</p>
                </div>
            </div>
        `;
    }

    /**
     * 添加动画效果
     */
    addAnimationEffects(container) {
        const cards = container.querySelectorAll('.article-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    /**
     * 搜索文章
     */
    searchArticles(keyword) {
        const results = [];

        Object.keys(this.articles).forEach(category => {
            this.articles[category].forEach(article => {
                if (this.isMatch(article, keyword)) {
                    results.push({...article, category});
                }
            });
        });

        return results;
    }

    /**
     * 检查文章是否匹配关键词
     */
    isMatch(article, keyword) {
        const searchTerm = keyword.toLowerCase();
        return (
            article.title.toLowerCase().includes(searchTerm) ||
            article.excerpt.toLowerCase().includes(searchTerm) ||
            article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * 生成搜索结果网格
     */
    generateSearchResults(keyword, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const results = this.searchArticles(keyword);

        container.innerHTML = '';

        if (results.length === 0) {
            const noResults = this.createElement('div', 'no-results');
            noResults.appendChild(this.createIcon('fas fa-search'));

            const title = this.createElement('h3');
            title.appendChild(this.createTextNode('未找到相关文章'));
            noResults.appendChild(title);

            const desc = this.createElement('p');
            desc.appendChild(this.createTextNode('请尝试其他关键词'));
            noResults.appendChild(desc);

            container.appendChild(noResults);
            return;
        }

        results.forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });

        this.addAnimationEffects(container);
    }

    /**
     * 添加新文章
     */
    addArticle(category, article) {
        if (!this.articles[category]) {
            this.articles[category] = [];
        }

        this.articles[category].unshift(article);
    }

    /**
     * 获取文章总数
     */
    getTotalArticleCount() {
        return Object.values(this.articles).reduce((total, category) => total + category.length, 0);
    }

    /**
     * 从数据容器2生成文章网格
     */
    async generateArticleGridFromContainer(category, containerId) {
        console.log(`🎯 从数据容器2生成${category}分类文章网格到${containerId}`);

        if (!this.hasFilteredData) {
            console.warn('⚠️ 数据容器2不存在，回退到常规方法');
            return this.generateArticleGrid(category, containerId);
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ 找不到容器: ${containerId}`);
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 从数据容器2获取分类数据
        const categoryArticles = this.filteredArticles[category] || [];

        console.log(`📊 数据容器2中${category}分类有 ${categoryArticles.length} 篇文章`);

        if (categoryArticles.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.innerHTML = `
                <h3>暂无相关内容</h3>
                <p>该分类下暂时没有符合条件的文章</p>
            `;
            container.appendChild(noResults);
            return;
        }

        categoryArticles.forEach(article => {
            const card = this.createArticleCard(article);
            container.appendChild(card);
        });

        this.addAnimationEffects(container);
        console.log(`✅ 已从数据容器2生成 ${categoryArticles.length} 篇${category}分类文章`);
    }

    /**
     * 获取指定分类的文章数量
     */
    getArticleCount(category) {
        return this.articles[category] ? this.articles[category].length : 0;
    }

    /**
     * 生成所有文章的网格
     */
    async generateAllArticlesGrid() {
        console.log('🎯 生成所有文章网格到all-articles容器');

        const container = document.getElementById('all-articles');
        if (!container) {
            console.warn('❌ 找不到all-articles容器');
            return;
        }

        // 等待数据加载完成
        await this.waitForDataLoad();

        try {
            // 合并所有分类的文章
            const allArticles = [];
            const categories = ['business', 'visa', 'tax', 'subsidy', 'legal', 'life'];

            categories.forEach(category => {
                if (this.articles[category]) {
                    allArticles.push(...this.articles[category]);
                }
            });

            // 按日期排序（最新的在前）
            allArticles.sort((a, b) => {
                const dateA = new Date(a.date || '2024-01-01');
                const dateB = new Date(b.date || '2024-01-01');
                return dateB - dateA;
            });

            // 清空容器
            this.safeClearContainer(container);

            // 渲染文章卡片
            if (allArticles.length > 0) {
                const articleElements = allArticles.map(article =>
                    this.createArticleCard(article, 'all')
                );

                // 添加到容器
                articleElements.forEach(element => {
                    container.appendChild(element);
                });

                console.log(`✅ all-articles容器渲染完成，共 ${allArticles.length} 篇文章`);
            } else {
                // 显示空状态
                const emptyState = this.createElement('div', 'empty-state');
                emptyState.innerHTML = `
                    <div class="empty-state-icon">📚</div>
                    <h3>暂无文章</h3>
                    <p>还没有发布任何文章，请稍后再来查看。</p>
                `;
                container.appendChild(emptyState);
            }

        } catch (error) {
            console.error('❌ 生成所有文章网格失败:', error);
            this.showErrorState(container, '加载文章失败');
        }
    }

    /**
     * 处理数据加载完成事件
     */
  handleDataLoaded(eventData) {
    console.log('📚 数据加载完成:', eventData);
    this.dataLoaded = true;

    // 触发初始渲染 - 显示所有文章
    setTimeout(() => {
      this.stateManager.updateFilter('category', 'all');
    }, 100);
  }

  /**
     * 处理过滤变化事件 - 新的事件驱动架构
     */
  handleFilterChange(eventData) {
    console.log('🔄 处理过滤变化:', eventData);

    // 更新状态管理器中的过滤器
    switch (eventData.type) {
      case 'category':
        this.stateManager.updateFilter('category', eventData.value);
        break;
      case 'subcategory':
        this.stateManager.updateFilter('subcategory', eventData.value);
        break;
      case 'quickFilter':
        this.stateManager.updateFilter('quickFilter', eventData.value);
        break;
      case 'difficulty':
        this.stateManager.updateFilter('difficulty', eventData.value);
        break;
      case 'search':
        this.stateManager.updateFilter('search', eventData.value);
        break;
      default:
        console.warn('未知的过滤器类型:', eventData.type);
    }
  }

  /**
     * 渲染方法 - 根据当前状态渲染内容
     */
  render(state) {
    console.log('🎨 渲染内容:', state);

    if (!this.dataLoaded) {
      console.log('⏳ 数据未加载完成，跳过渲染');
      return;
    }

    const { filters, pagination } = state;

    // 获取过滤后的文章
    const filteredArticles = this.applyFilters(this.articles, filters);

    // 计算分页数据
    const paginatedData = this.calculatePagination(filteredArticles, pagination.page, pagination.limit);

    // 确定要渲染的容器
    const targetContainer = this.getTargetContainer(filters.category);

    // 渲染内容到容器
    this.renderArticlesToContainer(paginatedData.items, targetContainer);

    // 更新分页状态（不会触发循环，因为render不再监听pagination变化）
    this.stateManager.updatePagination({
      ...paginatedData,
      page: pagination.page
    });

    console.log(`✅ 渲染完成: ${paginatedData.items.length} 篇文章到容器 ${targetContainer}`);
  }

    /**
     * 应用过滤器到文章数据
     */
  applyFilters(articles, filters) {
    let filtered = Object.values(articles).flat();

    // 分类过滤
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(article => {
        // 分类映射：英文ID -> 中文分类名
        const categoryMap = {
          'business': '企业落地',
          'visa': '签证政策',
          'tax': '税务筹划',
          'subsidy': '补助金申请',
          'legal': '法务合规',
          'life': '生活支援'
        };

        const targetCategory = categoryMap[filters.category] || filters.category;
        return article.category === targetCategory;
      });
    }

    // 标签过滤
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(article =>
        filters.tags.some(tag => article.tags.includes(tag))
      );
    }

    // 难度过滤
    if (filters.difficulty) {
      filtered = filtered.filter(article => article.difficulty === filters.difficulty);
    }

    // 搜索过滤
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm) ||
        article.excerpt.toLowerCase().includes(searchTerm) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // 快速过滤器
    if (filters.quickFilter) {
      filtered = this.applyQuickFilter(filtered, filters.quickFilter);
    }

    return filtered;
  }

  /**
     * 应用快速过滤器
     */
  applyQuickFilter(articles, quickFilter) {
    switch (quickFilter) {
      case 'featured':
        return articles.filter(article => article.featured);
      case 'articles':
        return articles.filter(article => article.type === 'article');
      case 'faq':
        return articles.filter(article => article.type === 'faq');
      case 'recent':
        return articles
          .slice()
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 20);
      case 'popular':
        return articles
          .filter(article => article.popularity?.hotScore >= 80)
          .sort((a, b) => (b.popularity?.hotScore || 0) - (a.popularity?.hotScore || 0));
      default:
        return articles;
    }
  }

  /**
     * 获取目标容器ID
     */
  getTargetContainer(category) {
    if (category === 'all') {
      return 'all-articles';
    }
    return `${category}-articles`;
  }

  /**
     * 渲染文章到指定容器
     */
  renderArticlesToContainer(articles, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`⚠️ 找不到容器: ${containerId}`);
      return;
    }

    // 隐藏所有容器
    this.hideAllContainers();

    // 显示目标容器
    container.style.display = 'block';
    container.classList.add('active');

    // 清空容器
    container.innerHTML = '';

    if (articles.length === 0) {
      this.renderEmptyState(container);
      return;
    }

    // 渲染文章卡片
    articles.forEach(article => {
      const card = this.createArticleCard(article);
      container.appendChild(card);
    });

    // 添加动画效果
    this.addAnimationEffects(container);
  }

  /**
     * 隐藏所有内容容器
     */
  hideAllContainers() {
    const allContainers = ['all-articles', 'business-articles', 'visa-articles',
                          'tax-articles', 'subsidy-articles', 'legal-articles', 'life-articles'];

    allContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.style.display = 'none';
        container.classList.remove('active');
      }
    });
  }

  /**
     * 渲染空状态
     */
  renderEmptyState(container) {
    const emptyState = this.createElement('div');
    emptyState.style.cssText = 'text-align: center; padding: 40px; color: #6b7280;';

    const icon = this.createIcon('fas fa-inbox');
    icon.style.cssText = 'font-size: 3rem; margin-bottom: 15px; opacity: 0.5; display: block;';
    emptyState.appendChild(icon);

    const title = this.createElement('h3');
    title.textContent = '暂无文章';
    emptyState.appendChild(title);

    const desc = this.createElement('p');
    desc.textContent = '当前筛选条件下没有找到相关文章';
    emptyState.appendChild(desc);

    this.safeSetContainerContent(container, emptyState);
  }

    /**
     * 显示错误状态
     */
    showErrorState(container, message) {
        this.safeClearContainer(container);

        const errorState = this.createElement('div', 'error-state');
        errorState.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h3>加载失败</h3>
            <p>${message}</p>
            <button class="btn-secondary" onclick="location.reload()">
                <i class="fas fa-redo"></i> 重新加载
            </button>
        `;

        container.appendChild(errorState);
    }

    
    /**
     * 获取文章元数据
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * 获取所有分类统计信息
     */
    getCategoryStats() {
        const stats = {};
        Object.keys(this.articles).forEach(category => {
            stats[category] = {
                count: this.articles[category].length,
                articles: this.articles[category]
            };
        });
        return stats;
    }

    /**
     * 搜索文章 (增强版)
     */
    async searchArticlesEnhanced(keyword) {
        await this.waitForDataLoad();

        if (!keyword || keyword.trim() === '') {
            return [];
        }

        const searchTerm = keyword.toLowerCase();
        const results = [];

        Object.keys(this.articles).forEach(category => {
            this.articles[category].forEach(article => {
                const matchScore = this.calculateMatchScore(article, searchTerm);
                if (matchScore > 0) {
                    results.push({
                        ...article,
                        category,
                        score: matchScore
                    });
                }
            });
        });

        // 按匹配分数排序
        return results.sort((a, b) => b.score - a.score);
    }

    /**
     * 计算文章匹配分数
     */
    calculateMatchScore(article, searchTerm) {
        let score = 0;

        // 标题匹配权重最高
        if (article.title.toLowerCase().includes(searchTerm)) {
            score += 10;
        }

        // 摘要匹配
        if (article.excerpt.toLowerCase().includes(searchTerm)) {
            score += 5;
        }

        // 标签匹配
        article.tags.forEach(tag => {
            if (tag.toLowerCase().includes(searchTerm)) {
                score += 3;
            }
        });

        // 分类匹配
        if (article.category && article.category.toLowerCase().includes(searchTerm)) {
            score += 2;
        }

        return score;
    }

    /**
     * 设置数据容器2（导航栏筛选后的数据）
     */
    setFilteredData(categories, categoryData = null) {
        console.log('🗂️ 设置数据容器2:', categories);
        this.filteredArticles = {};
        this.hasFilteredData = true;

        if (categoryData) {
            // 如果指定了特定分类数据，直接使用
            this.filteredArticles[categoryData] = this.articles[categoryData] || [];
        } else {
            // 否则复制指定的分类数据
            categories.forEach(category => {
                if (this.articles[category]) {
                    this.filteredArticles[category] = this.articles[category];
                }
            });
        }

        // 触发页面刷新事件
        this.triggerPageRefresh('container2-updated', { categories, categoryData });
    }

    /**
     * 清空数据容器2
     */
    clearFilteredData() {
            this.filteredArticles = {};
        this.hasFilteredData = false;

        // 触发页面刷新事件
        this.triggerPageRefresh('container2-cleared', {});
    }

    /**
     * 获取当前活跃的数据容器
     */
    getActiveDataContainer() {
        return this.hasFilteredData ? this.filteredArticles : this.articles;
    }

    /**
     * 触发页面刷新事件
     */
    triggerPageRefresh(eventType, data) {
      
        // 发送自定义事件到页面
        const refreshEvent = new CustomEvent('dataContainerChanged', {
            detail: {
                eventType,
                data,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(refreshEvent);
    }

    /**
     * 安全获取分类数据，自动处理容器选择和降级
     * @param {string} category - 分类名称
     * @param {boolean} forceContainer1 - 是否强制使用容器1
     * @returns {Array} - 分类数据数组
     */
    getCategoryDataSafely(category, forceContainer1 = false) {
        if (forceContainer1 || !this.hasFilteredData) {
                    return this.articles[category] || [];
        }

        // 优先从容器2获取，如果为空则降级到容器1
        const container2Data = this.filteredArticles[category] || [];
        if (container2Data.length > 0) {
                    return container2Data;
        } else {
                  return this.articles[category] || [];
        }
    }

    /**
     * 检查是否有数据容器2
     */
    hasDataContainer2() {
        return this.hasFilteredData;
    }

    /**
     * 根据分类查找文章数据（用于二级标签筛选）
     */
    findArticleData(category, articleElement) {
        // 从articleElement的数据属性获取文章ID
        const articleId = articleElement.dataset.articleId;
        if (!articleId) {
            console.warn('⚠️ 文章元素缺少articleId');
            return null;
        }

        // 从对应分类的文章数组中查找
        const categoryArticles = this.getCategoryDataSafely(category);
        return categoryArticles.find(article => article.id === articleId);
    }

    /**
     * 获取指定分类的当前数据
     */
    getCategoryData(category) {
        if (this.hasFilteredData && this.filteredArticles[category]) {
            return this.filteredArticles[category];
        }
        return this.articles[category] || [];
    }

    // ================================
    // 分页功能方法
    // ================================

    /**
     * 计算分页信息
     * @param {Array} items - 需要分页的项目数组
     * @param {number} currentPage - 当前页码（从1开始）
     * @param {number} itemsPerPage - 每页项目数
     * @returns {Object} 分页信息
     */
    calculatePagination(items, currentPage = 1, itemsPerPage = null) {
        const perPage = itemsPerPage || this.pagination.itemsPerPage;
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / perPage);

        // 确保页码在有效范围内
        const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

        const startIndex = (validCurrentPage - 1) * perPage;
        const endIndex = Math.min(startIndex + perPage, totalItems);

        const paginationData = {
            items: items.slice(startIndex, endIndex),
            currentPage: validCurrentPage,
            totalPages: totalPages,
            totalItems: totalItems,
            itemsPerPage: perPage,
            hasNextPage: validCurrentPage < totalPages,
            hasPrevPage: validCurrentPage > 1,
            startIndex: startIndex,
            endIndex: endIndex
        };

        // 更新类中的分页状态
        this.pagination = { ...paginationData };

        console.log('📄 分页计算结果:', paginationData);
        return paginationData;
    }

    /**
     * 获取分类的分页数据
     * @param {string} category - 分类名称
     * @param {number} currentPage - 当前页码
     * @param {boolean} useContainer1 - 是否强制使用容器1
     * @returns {Object} 分页数据
     */
    getCategoryPaginatedData(category, currentPage = 1, useContainer1 = false) {
        const allData = this.getCategoryDataSafely(category, useContainer1);
        console.log(`📄 获取${category}分类分页数据，总数: ${allData.length}`);

        return this.calculatePagination(allData, currentPage);
    }

    /**
     * 获取所有分类的分页数据（用于"全部"显示）
     * @param {number} currentPage - 当前页码
     * @param {boolean} useContainer1 - 是否强制使用容器1
     * @returns {Object} 分页数据
     */
    getAllCategoriesPaginatedData(currentPage = 1, useContainer1 = false) {
        const allCategories = ['business', 'tax', 'legal', 'visa', 'life'];
        let allData = [];

        allCategories.forEach(category => {
            const categoryData = this.getCategoryDataSafely(category, useContainer1);
            allData = allData.concat(categoryData);
        });

        // 按热度排序
        allData.sort((a, b) => {
            const scoreA = a.popularity?.hotScore || a.popularity?.views || 0;
            const scoreB = b.popularity?.hotScore || b.popularity?.views || 0;
            return scoreB - scoreA;
        });

        console.log(`📄 获取所有分类分页数据，总数: ${allData.length}`);
        return this.calculatePagination(allData, currentPage);
    }

    /**
     * 生成分页控件HTML
     * @param {Object} paginationData - 分页数据
     * @param {string} containerId - 目标容器ID
     * @param {string} category - 分类名称
     * @param {boolean} useContainer1 - 是否使用数据容器1
     * @returns {string} 分页控件HTML
     */
    generatePaginationControls(paginationData, containerId, category = null, useContainer1 = true) {
        const { currentPage, totalPages, hasNextPage, hasPrevPage } = paginationData;

        let controls = `
            <div class="pagination-controls" data-container="${containerId}">
                <div class="pagination-info">
                    <span>显示 ${paginationData.startIndex + 1}-${paginationData.endIndex} 共 ${paginationData.totalItems} 篇文章</span>
                </div>
                <div class="pagination-buttons">
        `;

        // 上一页按钮
        if (hasPrevPage) {
            controls += `
                <button class="pagination-btn prev-btn" onclick="window.articleCardManager.goToPage('${containerId}', ${currentPage - 1}, '${category}', ${useContainer1})">
                    <i class="fas fa-chevron-left"></i>
                    上一页
                </button>
            `;
        }

        // 页码按钮
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            controls += `<button class="pagination-btn page-btn" onclick="window.articleCardManager.goToPage('${containerId}', 1, '${category}', ${useContainer1})">1</button>`;
            if (startPage > 2) {
                controls += `<span class="pagination-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            controls += `
                <button class="pagination-btn page-btn ${activeClass}" onclick="window.articleCardManager.goToPage('${containerId}', ${i}, '${category}', ${useContainer1})">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                controls += `<span class="pagination-ellipsis">...</span>`;
            }
            controls += `<button class="pagination-btn page-btn" onclick="window.articleCardManager.goToPage('${containerId}', ${totalPages}, '${category}', ${useContainer1})">${totalPages}</button>`;
        }

        // 下一页按钮
        if (hasNextPage) {
            controls += `
                <button class="pagination-btn next-btn" onclick="window.articleCardManager.goToPage('${containerId}', ${currentPage + 1}, '${category}', ${useContainer1})">
                    下一页
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        controls += `
                </div>
            </div>
        `;

        return controls;
    }

    /**
     * 跳转到指定页码
     * @param {string} containerId - 容器ID
     * @param {number} page - 目标页码
     * @param {string} category - 分类名称
     * @param {boolean} useContainer1 - 是否使用数据容器1
     */
    goToPage(containerId, page, category = null, useContainer1 = true) {
        console.log(`📄 跳转到页面: ${page}, 容器: ${containerId}, 分类: ${category}`);

        // 错误处理：验证容器存在
        if (!document.getElementById(containerId)) {
            console.error(`❌ 容器不存在: ${containerId}`);
            return;
        }

        // 错误处理：验证页码有效性
        if (page < 1) {
            console.warn(`⚠️ 无效页码: ${page}, 使用页码1`);
            page = 1;
        }

        // 存储当前页状态
        this.currentPageStates = this.currentPageStates || {};
        this.currentPageStates[containerId] = {
            page,
            category,
            useContainer1,
            timestamp: Date.now()
        };

        // 触发分页变化事件
        const paginationEvent = new CustomEvent('paginationChanged', {
            detail: {
                containerId: containerId,
                page: page,
                category: category,
                useContainer1: useContainer1,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(paginationEvent);
    }

    /**
     * 移除现有的分页控件
     * @param {string} containerId - 容器ID
     */
    removeExistingPaginationControls(containerId) {
        // 查找该容器相关的所有分页控件
        const existingControls = document.querySelectorAll(`.pagination-controls[data-container="${containerId}"]`);
        console.log(`🧹 清理 ${existingControls.length} 个现有分页控件: ${containerId}`);

        existingControls.forEach(control => {
            control.remove();
        });
    }

    /**
     * 更新分页状态
     * @param {string} category - 分类名称
     * @param {number} page - 页码
     */
    updatePaginationState(category, page) {
        if (!this.currentPageStates) {
            this.currentPageStates = {};
        }
        this.currentPageStates[category] = page;
        console.log(`📄 更新${category}分类分页状态: 第${page}页`);
    }

    /**
     * 设置每页显示数量
     * @param {number} itemsPerPage - 每页项目数
     */
    setItemsPerPage(itemsPerPage) {
        this.pagination.itemsPerPage = itemsPerPage;
        console.log(`📄 设置每页显示数量: ${itemsPerPage}`);

        // 触发配置变化事件
        const configEvent = new CustomEvent('paginationConfigChanged', {
            detail: {
                itemsPerPage: itemsPerPage,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(configEvent);
    }

    /**
     * 重置分页到第一页
     */
    resetPagination() {
        this.pagination.currentPage = 1;
        console.log('📄 分页已重置到第一页');
    }
}

// 在新架构中不创建全局实例，由初始化脚本负责
// 保留全局实例创建作为后备方案
if (!window.articleCardManager) {
    window.articleCardManager = new ArticleCardManager();
}

// 新架构下不需要自动初始化，由初始化脚本负责
// 如果在非新架构环境下使用，可以取消注释下面的代码
// document.addEventListener('DOMContentLoaded', () => {
//     window.articleCardManager = new ArticleCardManager();
// });

// ES6 模块导出
export { ArticleCardManager };
export default ArticleCardManager;