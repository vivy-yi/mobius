// 安全的DOM内容加载器 - 防止XSS攻击
class SafeDOMLoader {
    constructor() {
        this.allowedTags = new Set([
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'img', 'br', 'hr', 'strong', 'em',
            'section', 'article', 'aside', 'nav', 'header', 'footer'
        ]);

        this.allowedAttributes = new Set([
            'class', 'id', 'href', 'src', 'alt', 'title', 'data-*'
        ]);
    }

    // 安全创建元素
    createElement(tag, attributes = {}, textContent = '') {
        if (!this.allowedTags.has(tag.toLowerCase())) {
            console.warn(`不允许的标签: ${tag}`);
            return document.createElement('div');
        }

        const element = document.createElement(tag);

        // 安全设置属性
        Object.keys(attributes).forEach(attr => {
            if (this.isAllowedAttribute(attr)) {
                element.setAttribute(attr, this.sanitizeAttributeValue(attributes[attr]));
            }
        });

        // 安全设置文本内容
        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    // 检查属性是否被允许
    isAllowedAttribute(attribute) {
        return this.allowedAttributes.has(attribute) ||
               attribute.startsWith('data-');
    }

    // 清理属性值
    sanitizeAttributeValue(value) {
        if (typeof value !== 'string') return '';

        // 移除潜在的危险字符
        return value
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .replace(/<script/gi, '')
            .trim();
    }

    // 安全创建知识库卡片
    createKnowledgeCard(title, description, link = '#') {
        const card = this.createElement('div', { class: 'knowledge-card' });

        const titleElement = this.createElement('h3', {}, title);
        const descElement = this.createElement('p', {}, description);
        const linkElement = this.createElement('a', {
            href: link,
            class: 'card-link'
        }, '了解更多');

        card.appendChild(titleElement);
        card.appendChild(descElement);
        card.appendChild(linkElement);

        return card;
    }

    // 创建知识库网格
    createKnowledgeGrid(articles) {
        const grid = this.createElement('div', { class: 'knowledge-grid' });

        articles.forEach(article => {
            const card = this.createKnowledgeCard(
                this.escapeHtml(article.title),
                this.escapeHtml(article.description),
                this.escapeHtml(article.link || '#')
            );
            grid.appendChild(card);
        });

        return grid;
    }

    // HTML转义
    escapeHtml(text) {
        if (typeof text !== 'string') return '';

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 安全加载知识库内容
    loadKnowledgeContent(containerId, articles) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`容器未找到: ${containerId}`);
            return;
        }

        // 清空容器
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        // 创建加载指示器
        const loader = this.createElement('div', {
            class: 'loading-placeholder',
            'style': 'height: 400px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center;'
        });

        const loadingText = this.createElement('span', {}, '正在加载知识库内容...');
        loader.appendChild(loadingText);
        container.appendChild(loader);

        // 模拟异步加载
        setTimeout(() => {
            container.removeChild(loader);

            if (Array.isArray(articles) && articles.length > 0) {
                const grid = this.createKnowledgeGrid(articles);
                container.appendChild(grid);
            } else {
                // 默认内容
                const defaultArticles = [
                    {
                        title: '企业设立',
                        description: '日本公司注册流程和注意事项',
                        link: '/services/setup.html'
                    },
                    {
                        title: '签证申请',
                        description: '各类日本签证申请指南',
                        link: '/services/visa.html'
                    },
                    {
                        title: '税务筹划',
                        description: '日本税务制度和优化策略',
                        link: '/services/tax.html'
                    },
                    {
                        title: '法务合规',
                        description: '日本法律环境和合规要求',
                        link: '/services/legal.html'
                    }
                ];

                const grid = this.createKnowledgeGrid(defaultArticles);
                container.appendChild(grid);
            }
        }, 800);
    }
}

// 安全的JSON数据加载器
class SafeJSONLoader {
    constructor() {
        this.cache = new Map();
    }

    // 安全加载JSON数据
    async loadJSON(url) {
        // 检查缓存
        if (this.cache.has(url)) {
            return this.cache.get(url);
        }

        try {
            // 验证URL
            if (!this.isValidURL(url)) {
                throw new Error(`无效的URL: ${url}`);
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();

            // 验证数据结构
            if (!this.validateKnowledgeData(data)) {
                throw new Error('无效的数据结构');
            }

            // 缓存数据
            this.cache.set(url, data);
            return data;

        } catch (error) {
            console.error('加载JSON数据失败:', error);
            return this.getDefaultData();
        }
    }

    // 验证URL
    isValidURL(url) {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.origin === window.location.origin ||
                   urlObj.origin === 'https://localhost:3001';
        } catch {
            return false;
        }
    }

    // 验证知识库数据结构
    validateKnowledgeData(data) {
        if (!Array.isArray(data)) return false;

        return data.every(item =>
            typeof item === 'object' &&
            typeof item.title === 'string' &&
            typeof item.description === 'string'
        );
    }

    // 获取默认数据
    getDefaultData() {
        return [
            {
                title: '企业设立指南',
                description: '了解在日本设立公司的完整流程',
                category: 'business',
                link: '/data/knowledgeCard/business-article-company-registration.html'
            },
            {
                title: '签证申请须知',
                description: '日本各类签证的申请条件和流程',
                category: 'visa',
                link: '/data/knowledgeCard/visa-article-management-guide.html'
            },
            {
                title: '税务申报指南',
                description: '日本税务制度和申报流程详解',
                category: 'tax',
                link: '/data/knowledgeCard/tax-article-declaration-guide.html'
            },
            {
                title: '法律合规要点',
                description: '日本企业经营的法律要求和合规指南',
                category: 'legal',
                link: '/data/knowledgeCard/legal-article-labor-law.html'
            }
        ];
    }
}

// 初始化安全的DOM加载器
const safeDOMLoader = new SafeDOMLoader();
const safeJSONLoader = new SafeJSONLoader();

// 导出供外部使用
window.SafeDOM = {
    SafeDOMLoader,
    SafeJSONLoader,
    safeDOMLoader,
    safeJSONLoader
};

// 页面加载完成后自动加载知识库内容
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 尝试加载真实的知识库数据
        const knowledgeData = await safeJSONLoader.loadJSON('./data/knowledge-articles.json');
        safeDOMLoader.loadKnowledgeContent('knowledge-content', knowledgeData);
    } catch (error) {
        console.error('加载知识库失败，使用默认内容:', error);
        // 使用默认内容
        safeDOMLoader.loadKnowledgeContent('knowledge-content', []);
    }
});