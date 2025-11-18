/**
 * 服务页面FAQ组件管理器
 * 支持动态加载、热度显示、搜索筛选、分类管理
 * 使用安全DOM操作，避免XSS攻击
 */

class ServiceFAQ {
    constructor(containerId, category) {
        this.containerId = containerId;
        this.category = category;
        this.container = document.getElementById(containerId);
        this.faqData = null;
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.baseUrl = this.getBaseUrl();
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/services/')) {
            return '../';
        }
        return './';
    }

    /**
     * 安全地创建元素
     */
    createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    /**
     * 安全地创建图标元素
     */
    createIcon(iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        return icon;
    }

    /**
     * 转义HTML特殊字符
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 初始化FAQ组件
     */
    async initialize() {
        try {
            await this.loadFAQData();
            this.renderFAQ();
            this.bindEvents();
            console.log(`✅ FAQ组件初始化完成: ${this.category}`);
        } catch (error) {
            console.error('❌ FAQ组件初始化失败:', error);
            this.renderErrorState();
        }
    }

    /**
     * 加载FAQ数据
     */
    async loadFAQData() {
        const jsonUrl = `${this.baseUrl}data/service-faq.json`;
        const response = await fetch(jsonUrl);

        if (!response.ok) {
            throw new Error(`Failed to load FAQ data: ${response.status}`);
        }

        const data = await response.json();
        this.faqData = data.faq[this.category];

        if (!this.faqData) {
            throw new Error(`FAQ category not found: ${this.category}`);
        }
    }

    /**
     * 渲染FAQ内容 - 使用安全DOM操作
     */
    renderFAQ() {
        if (!this.container) return;

        // 清空容器
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        // 创建FAQ内容
        const faqFragment = this.createFAQFragment();
        this.container.appendChild(faqFragment);
    }

    /**
     * 创建FAQ片段 - 安全的DOM构建
     */
    createFAQFragment() {
        const fragment = document.createDocumentFragment();
        const categoryData = this.faqData;
        const hotQuestions = this.getHotQuestions();

        // 添加标题区域
        fragment.appendChild(this.createSectionHeader(categoryData));

        // 添加热门问题横幅
        if (hotQuestions.length > 0) {
            fragment.appendChild(this.createHotQuestionsBanner(hotQuestions));
        }

        // 添加控制区域
        fragment.appendChild(this.createControls());

        // 添加FAQ网格
        fragment.appendChild(this.createFAQGrid(categoryData.items));

        return fragment;
    }

    /**
     * 创建标题区域
     */
    createSectionHeader(categoryData) {
        const header = this.createElement('div', 'faq-section-header');

        const title = this.createElement('h2', 'faq-section-title');
        const icon = this.createIcon(categoryData.icon);
        icon.style.marginRight = '15px';
        icon.style.color = categoryData.color;

        const titleText = document.createTextNode(categoryData.title);
        title.appendChild(icon);
        title.appendChild(titleText);

        const subtitle = this.createElement('p', 'faq-section-subtitle');
        subtitle.textContent = '解答您最关心的问题，助您顺利开展日本业务';

        header.appendChild(title);
        header.appendChild(subtitle);

        return header;
    }

    /**
     * 创建热门问题横幅
     */
    createHotQuestionsBanner(hotQuestions) {
        const banner = this.createElement('div', 'hot-questions-banner');

        const bannerTitle = this.createElement('div', 'hot-questions-title');
        bannerTitle.innerHTML = '<i class="fas fa-fire"></i> 🔥 本类热门问题TOP' + hotQuestions.length;

        const list = this.createElement('div', 'hot-questions-list');

        hotQuestions.forEach((item, index) => {
            const questionItem = this.createElement('div', 'hot-question-item');
            questionItem.dataset.faqId = item.id;

            const rank = this.createElement('span', 'hot-rank');
            rank.textContent = index + 1;

            const text = document.createTextNode(this.truncateText(item.question, 30));

            questionItem.appendChild(rank);
            questionItem.appendChild(text);
            list.appendChild(questionItem);
        });

        banner.appendChild(bannerTitle);
        banner.appendChild(list);

        return banner;
    }

    /**
     * 创建控制区域
     */
    createControls() {
        const controls = this.createElement('div', 'faq-controls');

        // 搜索框
        const searchContainer = this.createElement('div', 'faq-search');
        const searchInput = this.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索问题...';
        searchInput.id = 'faqSearchInput';

        const searchIcon = this.createIcon('fas fa-search');
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchIcon);

        // 筛选按钮
        const filtersContainer = this.createElement('div', 'faq-filters');
        const filterOptions = [
            { key: 'all', text: '全部' },
            { key: 'featured', text: '热门' },
            { key: 'beginner', text: '初级' },
            { key: 'intermediate', text: '中级' },
            { key: 'advanced', text: '高级' }
        ];

        filterOptions.forEach(option => {
            const btn = this.createElement('button', 'faq-filter-btn' + (option.key === 'all' ? ' active' : ''));
            btn.textContent = option.text;
            btn.dataset.filter = option.key;
            filtersContainer.appendChild(btn);
        });

        controls.appendChild(searchContainer);
        controls.appendChild(filtersContainer);

        return controls;
    }

    /**
     * 创建FAQ网格
     */
    createFAQGrid(items) {
        const grid = this.createElement('div', 'faq-grid');

        items.forEach(item => {
            const faqItem = this.createFAQItem(item);
            grid.appendChild(faqItem);
        });

        return grid;
    }

    /**
     * 创建单个FAQ项
     */
    createFAQItem(item) {
        const popularity = item.popularity || {};
        const hotScore = popularity.hotScore || 0;
        const isHot = hotScore >= 95;
        const isFeatured = item.featured;

        const faqItem = this.createElement('div', 'faq-item');
        if (isHot) faqItem.classList.add('hot');
        if (isFeatured) faqItem.classList.add('featured');

        // 设置数据属性
        faqItem.dataset.faqId = item.id;
        faqItem.dataset.difficulty = item.difficulty || 'beginner';
        faqItem.dataset.featured = isFeatured;
        faqItem.dataset.hotScore = hotScore;

        // 创建问题标题
        const question = this.createElement('h3');
        question.appendChild(this.createIcon('fas fa-question-circle'));
        question.appendChild(document.createTextNode(this.escapeHtml(item.question)));

        // 创建答案
        const answer = this.createElement('p');
        answer.textContent = this.escapeHtml(item.answer);

        // 创建标签
        let tagsContainer = null;
        if (item.tags && item.tags.length > 0) {
            tagsContainer = this.createElement('div', 'faq-tags');
            item.tags.forEach(tag => {
                const tagElement = this.createElement('span', 'faq-tag');
                tagElement.textContent = this.escapeHtml(tag);
                tagElement.dataset.tag = tag;
                tagsContainer.appendChild(tagElement);
            });
        }

        // 创建热度指标
        const popularityDiv = this.createElement('div', 'faq-popularity');

        // 浏览量
        const viewsMetric = this.createElement('div', 'popularity-metric');
        viewsMetric.appendChild(this.createIcon('fas fa-eye'));
        viewsMetric.appendChild(document.createTextNode((popularity.views || 0).toLocaleString()));

        // 有帮助数
        const helpfulMetric = this.createElement('div', 'popularity-metric');
        helpfulMetric.appendChild(this.createIcon('fas fa-thumbs-up'));
        helpfulMetric.appendChild(document.createTextNode(popularity.helpful || 0));

        // 评分
        const ratingMetric = this.createElement('div', 'popularity-metric');
        ratingMetric.appendChild(this.createIcon('fas fa-star'));
        ratingMetric.appendChild(document.createTextNode(popularity.rating || '4.5'));

        // 热度分数
        const hotScoreDiv = this.createElement('div', 'popularity-score ' + this.getHotScoreClass(hotScore));
        hotScoreDiv.textContent = '热度: ' + hotScore;

        // 难度标签
        const difficultyDiv = this.createElement('div', 'faq-difficulty ' + (item.difficulty || 'beginner'));
        difficultyDiv.textContent = this.getDifficultyText(item.difficulty);

        popularityDiv.appendChild(viewsMetric);
        popularityDiv.appendChild(helpfulMetric);
        popularityDiv.appendChild(ratingMetric);
        popularityDiv.appendChild(hotScoreDiv);
        popularityDiv.appendChild(difficultyDiv);

        // 组装元素
        faqItem.appendChild(question);
        faqItem.appendChild(answer);
        if (tagsContainer) faqItem.appendChild(tagsContainer);
        faqItem.appendChild(popularityDiv);

        return faqItem;
    }

    /**
     * 获取热度分数等级
     */
    getHotScoreClass(score) {
        if (score >= 90) return 'high';
        if (score >= 70) return 'medium';
        return 'low';
    }

    /**
     * 获取难度文本
     */
    getDifficultyText(difficulty) {
        const map = {
            'beginner': '初级',
            'intermediate': '中级',
            'advanced': '高级'
        };
        return map[difficulty] || '初级';
    }

    /**
     * 截断文本
     */
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * 获取热门问题
     */
    getHotQuestions() {
        if (!this.faqData || !this.faqData.items) return [];

        return this.faqData.items
            .filter(item => item.featured || (item.popularity && item.popularity.hotScore >= 85))
            .sort((a, b) => (b.popularity?.hotScore || 0) - (a.popularity?.hotScore || 0))
            .slice(0, 3);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('faqSearchInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchTerm = e.target.value.trim().toLowerCase();
                    this.filterFAQ();
                }, 300);
            });
        }

        // 筛选按钮
        const filterButtons = this.container.querySelectorAll('.faq-filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有active类
                filterButtons.forEach(b => b.classList.remove('active'));
                // 添加active类到当前按钮
                btn.classList.add('active');
                // 更新筛选条件
                this.currentFilter = btn.dataset.filter;
                this.filterFAQ();
            });
        });

        // 标签点击
        const tagElements = this.container.querySelectorAll('.faq-tag');
        tagElements.forEach(tag => {
            tag.addEventListener('click', () => {
                this.searchTerm = tag.dataset.tag;
                this.filterFAQ();

                // 更新搜索输入框
                if (searchInput) {
                    searchInput.value = tag.dataset.tag;
                }
            });
        });

        // 热门问题点击
        const hotQuestions = this.container.querySelectorAll('.hot-question-item');
        hotQuestions.forEach(item => {
            item.addEventListener('click', () => {
                const faqId = item.dataset.faqId;
                this.scrollToFAQ(faqId);
            });
        });
    }

    /**
     * 筛选FAQ
     */
    filterFAQ() {
        const faqItems = this.container.querySelectorAll('.faq-item');
        let visibleCount = 0;

        faqItems.forEach(item => {
            const isVisible = this.isItemVisible(item);
            item.style.display = isVisible ? 'block' : 'none';
            if (isVisible) visibleCount++;
        });

        // 显示无结果提示
        this.showNoResultsMessage(visibleCount === 0);
    }

    /**
     * 检查FAQ项是否可见
     */
    isItemVisible(item) {
        // 搜索筛选
        if (this.searchTerm) {
            const question = item.querySelector('h3')?.textContent.toLowerCase() || '';
            const answer = item.querySelector('p')?.textContent.toLowerCase() || '';
            const tags = Array.from(item.querySelectorAll('.faq-tag')).map(tag => tag.textContent.toLowerCase()).join(' ');

            if (!question.includes(this.searchTerm) &&
                !answer.includes(this.searchTerm) &&
                !tags.includes(this.searchTerm)) {
                return false;
            }
        }

        // 分类筛选
        if (this.currentFilter !== 'all') {
            switch (this.currentFilter) {
                case 'featured':
                    return item.dataset.featured === 'true';
                case 'beginner':
                case 'intermediate':
                case 'advanced':
                    return item.dataset.difficulty === this.currentFilter;
                default:
                    return true;
            }
        }

        return true;
    }

    /**
     * 滚动到指定FAQ
     */
    scrollToFAQ(faqId) {
        const faqItem = document.querySelector(`[data-faq-id="${faqId}"]`);
        if (faqItem) {
            faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // 添加高亮效果
            faqItem.classList.add('highlighted');
            setTimeout(() => {
                faqItem.classList.remove('highlighted');
            }, 2000);
        }
    }

    /**
     * 显示无结果消息
     */
    showNoResultsMessage(show) {
        let messageElement = this.container.querySelector('.no-results-message');

        if (show && !messageElement) {
            messageElement = this.createElement('div', 'no-results-message');
            messageElement.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--light-text, #6b7280);">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                    <h3 style="font-size: 1.5rem; margin-bottom: 10px;">未找到相关问题</h3>
                    <p>尝试调整搜索关键词或筛选条件</p>
                </div>
            `;
            this.container.querySelector('.faq-grid').appendChild(messageElement);
        } else if (!show && messageElement) {
            messageElement.remove();
        }
    }

    /**
     * 渲染错误状态
     */
    renderErrorState() {
        if (!this.container) return;

        // 清空容器
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }

        const errorDiv = this.createElement('div');
        errorDiv.style.cssText = 'text-align: center; padding: 60px 20px; color: var(--accent-red, #dc2626);';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
            <h3 style="font-size: 1.5rem; margin-bottom: 10px;">加载失败</h3>
            <p>FAQ内容加载失败，请刷新页面重试</p>
        `;
        this.container.appendChild(errorDiv);
    }
}

// 添加高亮动画样式（避免重复创建）
if (!document.querySelector('#faq-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'faq-highlight-styles';
    style.textContent = `
        .faq-item.highlighted {
            animation: highlightPulse 2s ease-in-out;
        }

        @keyframes highlightPulse {
            0%, 100% {
                background: white;
                transform: scale(1);
            }
            50% {
                background: var(--warning-yellow-light, #fef3c7);
                transform: scale(1.02);
            }
        }
    `;
    document.head.appendChild(style);
}

// 暴露类到全局作用域
window.ServiceFAQ = ServiceFAQ;