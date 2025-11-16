/**
 * Knowledge Preview 组件管理器
 * 统一管理首页知识库分类概览卡片组件
 */

class KnowledgePreviewManager {
    constructor() {
        this.categories = this.initializeCategories();
        this.baseUrl = this.getBaseUrl();
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        return './';
    }

    /**
     * 创建DOM元素的安全方法
     */
    createElement(tag, className = '', textContent = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }

    /**
     * 创建文本节点
     */
    createTextNode(text) {
        return document.createTextNode(text);
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
     * 初始化知识库分类数据
     */
    initializeCategories() {
        return {
            business: {
                id: 'business',
                title: '日本企业落地指南',
                icon: 'fas fa-book-open',
                color: '#3b82f6',
                items: [
                    '日本公司设立图解',
                    '合同会社 vs 株式会社对比',
                    '日本银行开户攻略',
                    '税务署注意事项'
                ],
                articleCount: 2,
                link: 'knowledge.html#business'
            },
            visa: {
                id: 'visa',
                title: '签证攻略',
                icon: 'fas fa-passport',
                color: '#dc2626',
                items: [
                    '经营管理签证常见拒签理由',
                    '日本永住权申请条件',
                    '签证与公司规模关系',
                    '续签注意事项'
                ],
                articleCount: 2,
                link: 'knowledge.html#visa'
            },
            tax: {
                id: 'tax',
                title: '税务・补助金',
                icon: 'fas fa-coins',
                color: '#16a34a',
                items: [
                    '日本补助金申请攻略',
                    '税务调查常见问题',
                    '消费税政策变化',
                    '免税政策详解'
                ],
                articleCount: 2,
                link: 'knowledge.html#tax'
            },
            subsidy: {
                id: 'subsidy',
                title: '补助金申请',
                icon: 'fas fa-gift',
                color: '#ea580c',
                items: [
                    'IT化补助金申请指南',
                    '绿色环保补助金策略',
                    '中小企业支援政策',
                    '创业补助金机会'
                ],
                articleCount: 2,
                link: 'knowledge.html#subsidy'
            },
            legal: {
                id: 'legal',
                title: '法务合规',
                icon: 'fas fa-balance-scale',
                color: '#7c3aed',
                items: [
                    '劳动合同法要点解析',
                    '个人情报保护法合规',
                    '知识产权保护策略',
                    '合规风险防范指南'
                ],
                articleCount: 2,
                link: 'knowledge.html#legal'
            }
        };
    }

    /**
     * 创建单个知识库分类卡片
     */
    createKnowledgeCard(category) {
        const card = this.createElement('div', 'knowledge-card');

        // 创建图标区域
        const iconContainer = this.createElement('div', 'knowledge-icon');
        iconContainer.style.background = `linear-gradient(135deg, ${category.color}dd, ${category.color})`;
        iconContainer.style.color = 'white';

        const icon = this.createIcon(category.icon);
        iconContainer.appendChild(icon);
        card.appendChild(iconContainer);

        // 创建标题
        const title = this.createElement('h3');
        title.appendChild(this.createTextNode(category.title));
        card.appendChild(title);

        // 创建内容列表
        const list = this.createElement('ul', 'knowledge-list');
        category.items.forEach(item => {
            const listItem = this.createElement('li');
            listItem.appendChild(this.createTextNode(item));
            list.appendChild(listItem);
        });
        card.appendChild(list);

        // 创建链接
        const link = this.createElement('a', 'knowledge-link');
        link.href = category.link;
        link.style.color = category.color;

        const linkText = this.createTextNode('查看全部 ');
        link.appendChild(linkText);

        const arrowIcon = this.createIcon('fas fa-arrow-right');
        link.appendChild(arrowIcon);

        card.appendChild(link);

        // 添加点击事件
        card.onclick = (e) => {
            if (!e.target.closest('a')) {
                window.location.href = category.link;
            }
        };
        card.style.cursor = 'pointer';

        return card;
    }

    /**
     * 生成首页知识库分类网格
     */
    generateKnowledgeGrid(containerId, categoriesToShow = ['business', 'visa', 'tax']) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        // 安全清空容器内容
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        categoriesToShow.forEach(categoryId => {
            const category = this.categories[categoryId];
            if (category) {
                const card = this.createKnowledgeCard(category);
                container.appendChild(card);
            }
        });

        // 添加动画效果
        this.addAnimationEffects(container);
    }

    /**
     * 添加动画效果
     */
    addAnimationEffects(container) {
        const cards = container.querySelectorAll('.knowledge-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    /**
     * 添加新的知识库分类
     */
    addCategory(categoryId, categoryData) {
        this.categories[categoryId] = categoryData;
    }

    /**
     * 更新分类的文章数量
     */
    updateArticleCount(categoryId, count) {
        if (this.categories[categoryId]) {
            this.categories[categoryId].articleCount = count;
        }
    }

    /**
     * 获取分类总数
     */
    getTotalCategoryCount() {
        return Object.keys(this.categories).length;
    }

    /**
     * 获取所有分类
     */
    getAllCategories() {
        return this.categories;
    }

    /**
     * 根据ID获取分类
     */
    getCategory(categoryId) {
        return this.categories[categoryId] || null;
    }

    /**
     * 搜索知识库分类
     */
    searchCategories(keyword) {
        const results = [];
        const searchTerm = keyword.toLowerCase();

        Object.keys(this.categories).forEach(categoryId => {
            const category = this.categories[categoryId];
            const isMatch = (
                category.title.toLowerCase().includes(searchTerm) ||
                category.items.some(item => item.toLowerCase().includes(searchTerm))
            );

            if (isMatch) {
                results.push({...category, categoryId});
            }
        });

        return results;
    }

    /**
     * 生成搜索结果
     */
    generateSearchResults(keyword, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const results = this.searchCategories(keyword);

        // 安全清空容器
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        if (results.length === 0) {
            const noResults = this.createElement('div', 'no-results');
            noResults.style.textAlign = 'center';
            noResults.style.padding = '2rem';
            noResults.style.color = '#64748b';

            const icon = this.createIcon('fas fa-search');
            icon.style.fontSize = '2rem';
            icon.style.marginBottom = '1rem';
            icon.style.display = 'block';
            noResults.appendChild(icon);

            const title = this.createElement('h3');
            title.appendChild(this.createTextNode('未找到相关分类'));
            title.style.marginBottom = '0.5rem';
            noResults.appendChild(title);

            const desc = this.createElement('p');
            desc.appendChild(this.createTextNode('请尝试其他关键词'));
            noResults.appendChild(desc);

            container.appendChild(noResults);
            return;
        }

        results.forEach(category => {
            const card = this.createKnowledgeCard(category);
            container.appendChild(card);
        });

        this.addAnimationEffects(container);
    }

    /**
     * 初始化首页知识库网格
     */
    initializeHomepageKnowledgeGrid() {
        // 延迟执行确保DOM加载完成
        setTimeout(() => {
            this.generateKnowledgeGrid('homepage-knowledge-grid', ['business', 'visa', 'tax']);
        }, 100);
    }

    /**
     * 响应式调整
     */
    handleResponsive() {
        const container = document.getElementById('homepage-knowledge-grid');
        if (!container) return;

        const isMobile = window.innerWidth < 768;
        const categories = isMobile ? ['business', 'visa'] : ['business', 'visa', 'tax'];

        this.generateKnowledgeGrid('homepage-knowledge-grid', categories);
    }

    /**
     * 统计信息
     */
    getStatistics() {
        const totalArticles = Object.values(this.categories).reduce(
            (total, category) => total + (category.articleCount || 0), 0
        );

        return {
            totalCategories: this.getTotalCategoryCount(),
            totalArticles,
            categories: Object.keys(this.categories)
        };
    }
}

// 创建全局实例
window.knowledgePreviewManager = new KnowledgePreviewManager();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.knowledgePreviewManager.initializeHomepageKnowledgeGrid();

    // 响应式调整
    window.addEventListener('resize', () => {
        clearTimeout(window.resizeTimer);
        window.resizeTimer = setTimeout(() => {
            window.knowledgePreviewManager.handleResponsive();
        }, 250);
    });
});