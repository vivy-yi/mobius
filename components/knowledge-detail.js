/**
 * 知识详情页面管理器 - 安全版本
 * 负责动态加载知识内容、目录生成、评论系统等功能
 */

class KnowledgeDetail {
    constructor() {
        this.currentArticle = null;
        this.articleId = this.getArticleIdFromURL();
        this.baseUrl = this.getBaseUrl();
        this.comments = [];
        this.ratings = [];
        this.init();
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/data/knowledgeCard/')) {
            return '../';
        }
        return './';
    }

    /**
     * 从URL获取文章ID
     */
    getArticleIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id') || null;
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
     * 初始化知识详情页面
     */
    async init() {
        if (!this.articleId) {
            this.showError('未找到文章ID');
            return;
        }

        try {
            await this.loadArticleData();
            await this.renderArticle();
            this.initializeInteractions();
            this.initializeScrollEffects();
        } catch (error) {
            console.error('知识详情页面初始化失败:', error);
            this.showError('加载文章内容失败');
        }
    }

    /**
     * 加载文章数据
     */
    async loadArticleData() {
        // 直接从旧的数据结构加载，因为我们使用静态文章文件
        try {
            await this.loadFromLegacyData();
        } catch (legacyError) {
            throw new Error(`无法从数据源加载文章: ${this.articleId}`);
        }
    }

    /**
     * 从新的CMS数据加载文章
     */
    async loadFromCMSData() {
        const metadataResponse = await fetch(`${this.baseUrl}content/metadata/articles.json`);
        if (!metadataResponse.ok) {
            throw new Error(`CMS元数据加载失败: ${metadataResponse.status}`);
        }

        const cmsArticles = await metadataResponse.json();
        const article = cmsArticles.find(art => art.id === this.articleId);

        if (article) {
            this.currentArticle = {
                ...article,
                source: 'cms'
            };
            return;
        }

        throw new Error(`文章未在CMS数据中找到: ${this.articleId}`);
    }

    /**
     * 从旧的articles.json数据加载文章
     */
    async loadFromLegacyData() {
        const response = await fetch(`${this.baseUrl}data/articles.json`);
        if (!response.ok) {
            throw new Error(`旧数据源加载失败: ${response.status}`);
        }

        const data = await response.json();

        // 首先尝试通过文件名映射查找
        const mappedArticle = this.findArticleByMapping();
        if (mappedArticle) {
            this.currentArticle = {
                ...mappedArticle,
                source: 'mapped'
            };
            return;
        }

        // 然后在旧数据结构中查找
        for (const category of data.navigation.structure) {
            if (category.children) {
                for (const subcategory of category.children) {
                    if (subcategory.articles) {
                        const article = subcategory.articles.find(art => art.id === this.articleId);
                        if (article) {
                            this.currentArticle = {
                                ...article,
                                category: category.id,
                                categoryName: category.name,
                                subcategory: subcategory.id,
                                subcategoryName: subcategory.name,
                                source: 'legacy'
                            };
                            return;
                        }
                    }
                }
            }
        }

        throw new Error(`Article not found: ${this.articleId}`);
    }

    /**
     * 通过文件名映射查找文章
     */
    findArticleByMapping() {
        const fileMappings = {
            // 业务相关文章映射 - 添加完整ID映射
            'business-registration-01': {
                id: 'business-registration-01',
                title: '日本公司注册指南',
                description: '详细介绍在日本注册公司的完整流程和法律要求',
                url: '/data/knowledgeCard/business-registration-01.html',
                categoryName: '企业落地'
            },
            'business-registration': {
                id: 'business-registration-01',
                title: '日本公司注册指南',
                description: '详细介绍在日本注册公司的完整流程和法律要求',
                url: '/data/knowledgeCard/business-registration-01.html',
                categoryName: '企业落地'
            },
            'business-setupguide-01': {
                id: 'business-setupguide-01',
                title: '日本企业落地服务指南',
                description: '一站式企业落地解决方案和服务流程',
                url: '/data/knowledgeCard/business-setupguide-01.html',
                categoryName: '企业落地'
            },
            'business-setupguide': {
                id: 'business-setupguide-01',
                title: '日本企业落地服务指南',
                description: '一站式企业落地解决方案和服务流程',
                url: '/data/knowledgeCard/business-setupguide-01.html',
                categoryName: '企业落地'
            },
            'business-faq-01': {
                id: 'business-faq-01',
                title: '开店咨询常见问题',
                description: '餐厅、美容院、贸易公司开店咨询',
                url: '/data/knowledgeCard/business-faq-01.html',
                categoryName: '企业落地'
            },
            'business-faq': {
                id: 'business-faq-01',
                title: '开店咨询常见问题',
                description: '餐厅、美容院、贸易公司开店咨询',
                url: '/data/knowledgeCard/business-faq-01.html',
                categoryName: '企业落地'
            },

            // 签证相关文章映射
            'visa-guide-01': {
                id: 'visa-guide-01',
                title: '日本签证申请指南',
                description: '经营管理签证和高级人才签证申请流程',
                url: '/data/knowledgeCard/visa-guide-01.html',
                categoryName: '签证政策'
            },
            'visa-guide': {
                id: 'visa-guide-01',
                title: '日本签证申请指南',
                description: '经营管理签证和高级人才签证申请流程',
                url: '/data/knowledgeCard/visa-guide-01.html',
                categoryName: '签证政策'
            },
            'visa-faq-01': {
                id: 'visa-faq-01',
                title: '签证申请常见问题',
                description: '签证申请、在留资格和续签问题解答',
                url: '/data/knowledgeCard/visa-faq-01.html',
                categoryName: '签证政策'
            },
            'visa-faq': {
                id: 'visa-faq-01',
                title: '签证申请常见问题',
                description: '签证申请、在留资格和续签问题解答',
                url: '/data/knowledgeCard/visa-faq-01.html',
                categoryName: '签证政策'
            },

            // 税务相关文章映射
            'tax-article-01': {
                id: 'tax-article-01',
                title: '税务筹划指南',
                description: '日本税务制度和节税策略详解',
                url: '/data/knowledgeCard/tax-article-01.html',
                categoryName: '税务筹划'
            },
            'tax-article': {
                id: 'tax-article-01',
                title: '税务筹划指南',
                description: '日本税务制度和节税策略详解',
                url: '/data/knowledgeCard/tax-article-01.html',
                categoryName: '税务筹划'
            },
            'tax-consumption-01': {
                id: 'tax-consumption-01',
                title: '消费税申报指南',
                description: '消费税计算和申报流程详解',
                url: '/data/knowledgeCard/tax-consumption-01.html',
                categoryName: '税务筹划'
            },
            'tax-consumption': {
                id: 'tax-consumption-01',
                title: '消费税申报指南',
                description: '消费税计算和申报流程详解',
                url: '/data/knowledgeCard/tax-consumption-01.html',
                categoryName: '税务筹划'
            },
            'tax-faq-02': {
                id: 'tax-faq-02',
                title: '税务申报常见问题',
                description: '税务申报过程中的常见问题解答',
                url: '/data/knowledgeCard/tax-faq-02.html',
                categoryName: '税务筹划'
            },
            'tax-faq': {
                id: 'tax-faq-02',
                title: '税务申报常见问题',
                description: '税务申报过程中的常见问题解答',
                url: '/data/knowledgeCard/tax-faq-02.html',
                categoryName: '税务筹划'
            },
            'tax-guide-02': {
                id: 'tax-guide-02',
                title: '节税实用指南',
                description: '企业节税策略和实用技巧',
                url: '/data/knowledgeCard/tax-guide-02.html',
                categoryName: '税务筹划'
            },
            'tax-guide': {
                id: 'tax-guide-02',
                title: '节税实用指南',
                description: '企业节税策略和实用技巧',
                url: '/data/knowledgeCard/tax-guide-02.html',
                categoryName: '税务筹划'
            },

            // 法务相关文章映射 - 添加完整ID映射
            'legal-dataprotection-02': {
                id: 'legal-dataprotection-02',
                title: '个人信息保护法指南',
                description: '日本个人信息保护法合规要求',
                url: '/data/knowledgeCard/legal-dataprotection-02.html',
                categoryName: '法务・合同'
            },
            'legal-dataprotection': {
                id: 'legal-dataprotection-02',
                title: '个人信息保护法指南',
                description: '日本个人信息保护法合规要求',
                url: '/data/knowledgeCard/legal-dataprotection-02.html',
                categoryName: '法务・合同'
            },
            'legal-faq-01': {
                id: 'legal-faq-01',
                title: '法务合同常见问题',
                description: '合同审核和法律风险防范',
                url: '/data/knowledgeCard/legal-faq-01.html',
                categoryName: '法务・合同'
            },
            'legal-faq': {
                id: 'legal-faq-01',
                title: '法务合同常见问题',
                description: '合同审核和法律风险防范',
                url: '/data/knowledgeCard/legal-faq-01.html',
                categoryName: '法务・合同'
            },
            'legal-labor-01': {
                id: 'legal-labor-01',
                title: '日本劳动法指南',
                description: '雇佣关系和劳动合同法详解',
                url: '/data/knowledgeCard/legal-labor-01.html',
                categoryName: '法务・合同'
            },
            'legal-labor': {
                id: 'legal-labor-01',
                title: '日本劳动法指南',
                description: '雇佣关系和劳动合同法详解',
                url: '/data/knowledgeCard/legal-labor-01.html',
                categoryName: '法务・合同'
            },
            'legal-faq-02': {
                id: 'legal-faq-02',
                title: '法务常见问题(第2部分)',
                description: '更多法务合同相关问题解答',
                url: '/data/knowledgeCard/legal-faq-02.html',
                categoryName: '法务・合同'
            },

            // 生活相关文章映射 - 添加完整ID映射
            'life-banking-01': {
                id: 'life-banking-01',
                title: '日本银行开户指南',
                description: '外国人银行账户开设流程和注意事项',
                url: '/data/knowledgeCard/life-banking-01.html',
                categoryName: '生活支援'
            },
            'life-banking': {
                id: 'life-banking-01',
                title: '日本银行开户指南',
                description: '外国人银行账户开设流程和注意事项',
                url: '/data/knowledgeCard/life-banking-01.html',
                categoryName: '生活支援'
            },
            'life-housing-02': {
                id: 'life-housing-02',
                title: '日本住房租赁指南',
                description: '外国人住房租赁流程和注意事项',
                url: '/data/knowledgeCard/life-housing-02.html',
                categoryName: '生活支援'
            },
            'life-housing': {
                id: 'life-housing-02',
                title: '日本住房租赁指南',
                description: '外国人住房租赁流程和注意事项',
                url: '/data/knowledgeCard/life-housing-02.html',
                categoryName: '生活支援'
            },
            'life-faq-01': {
                id: 'life-faq-01',
                title: '生活常见问题(第1部分)',
                description: '在日本生活的常见问题解答',
                url: '/data/knowledgeCard/life-faq-01.html',
                categoryName: '生活支援'
            },

            // 补助金相关文章映射 - 添加完整ID映射
            'subsidy-guide-02': {
                id: 'subsidy-guide-02',
                title: '补助金申请指南',
                description: '各类政府补助金申请流程详解',
                url: '/data/knowledgeCard/subsidy-guide-02.html',
                categoryName: '补助金申请'
            },
            'subsidy-guide': {
                id: 'subsidy-guide-02',
                title: '补助金申请指南',
                description: '各类政府补助金申请流程详解',
                url: '/data/knowledgeCard/subsidy-guide-02.html',
                categoryName: '补助金申请'
            },
            'subsidy-greengift-01': {
                id: 'subsidy-greengift-01',
                title: '绿色环保补助金',
                description: '环保相关补助金申请指南',
                url: '/data/knowledgeCard/subsidy-greengift-01.html',
                categoryName: '补助金申请'
            },

            // 旧文件名映射（向后兼容）
            'business-article-company-registration': {
                id: 'business-registration-01',
                title: '日本公司注册指南',
                description: '详细介绍在日本注册公司的完整流程和法律要求',
                url: '/data/knowledgeCard/business-registration-01.html',
                categoryName: '企业落地'
            }
        };

        return fileMappings[this.articleId] || null;
    }

    /**
     * 渲染文章内容
     */
    async renderArticle() {
        if (!this.currentArticle) {
            throw new Error('No article data available');
        }

        // 更新页面标题和元信息
        this.updatePageMeta();

        // 更新面包屑导航
        this.updateBreadcrumb();

        // 加载文章内容
        await this.loadArticleContent();

        // 生成目录
        this.generateTOC();

        // 加载相关知识
        this.loadRelatedKnowledge();

        // 加载标签
        this.loadTags();

        // 加载评论
        this.loadComments();
    }

    /**
     * 更新页面元信息
     */
    updatePageMeta() {
        document.title = `${this.currentArticle.title} - Mobius知识库`;

        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.currentArticle.description;
        }

        // 更新头部信息
        const currentTitle = document.getElementById('current-title');
        const currentCategory = document.getElementById('current-category');
        const articleTitle = document.getElementById('articleTitle');
        const articleExcerpt = document.getElementById('articleExcerpt');
        const articleDate = document.getElementById('articleDate');
        const readingTime = document.getElementById('readingTime');
        const articleCategory = document.getElementById('articleCategory');

        if (currentTitle) currentTitle.textContent = this.currentArticle.title;
        if (currentCategory) currentCategory.textContent = this.currentArticle.categoryName;
        if (articleTitle) articleTitle.textContent = this.currentArticle.title;
        if (articleExcerpt) articleExcerpt.textContent = this.currentArticle.description;
        if (articleDate) articleDate.textContent = this.currentArticle.date || '2024年1月15日';
        if (readingTime) readingTime.textContent = this.currentArticle.readingTime || '5分钟阅读';
        if (articleCategory) articleCategory.textContent = this.currentArticle.categoryName;
    }

    /**
     * 更新面包屑导航
     */
    updateBreadcrumb() {
        const currentCategory = document.getElementById('current-category');
        const currentTitle = document.getElementById('current-title');

        if (currentCategory && currentTitle && this.currentArticle) {
            currentCategory.textContent = this.currentArticle.categoryName;
            currentTitle.textContent = this.currentArticle.title;
        }
    }

    /**
     * 加载文章内容
     */
    async loadArticleContent() {
        const articleBody = document.getElementById('articleBody');

        try {
            let contentUrl;

            // 根据文章来源确定内容URL
            if (this.currentArticle.source === 'cms') {
                // 从CMS数据加载Markdown内容
                contentUrl = `${this.baseUrl}content/articles/${this.currentArticle.fileName}`;
            } else if (this.currentArticle.source === 'mapped') {
                // 使用映射后的URL
                contentUrl = `${this.baseUrl}data/knowledgeCard/${this.currentArticle.id}.html`;
            } else {
                // 默认使用文章ID
                contentUrl = `${this.baseUrl}data/knowledgeCard/${this.articleId}.html`;
            }

            const response = await fetch(contentUrl);
            if (!response.ok) {
                throw new Error(`Failed to load article content: ${response.status}`);
            }

            const content = await response.text();

            // 清空现有内容
            while (articleBody.firstChild) {
                articleBody.removeChild(articleBody.firstChild);
            }

            // 检查内容类型并相应处理
            if (this.currentArticle.source === 'cms' && contentUrl.endsWith('.md')) {
                // 处理Markdown内容
                await this.renderMarkdownContent(content, articleBody);
            } else {
                // 处理HTML内容
                this.renderHtmlContent(content, articleBody);
            }

        } catch (error) {
            console.error('加载文章内容失败:', error);
            this.showError('无法加载文章内容，请稍后重试。');
        }
    }

    /**
     * 渲染Markdown内容
     */
    async renderMarkdownContent(markdownContent, container) {
        try {
            // 检查marked库是否可用
            if (typeof marked !== 'undefined') {
                const htmlContent = marked.parse(markdownContent);
                this.renderHtmlContent(htmlContent, container);
            } else {
                // 简单的Markdown解析器（备用方案）
                const htmlContent = this.parseMarkdownSimple(markdownContent);
                this.renderHtmlContent(htmlContent, container);
            }
        } catch (error) {
            console.error('Markdown渲染失败:', error);
            // 显示原始内容
            const pre = this.createElement('pre', '', markdownContent);
            container.appendChild(pre);
        }
    }

    /**
     * 简单的Markdown解析器
     */
    parseMarkdownSimple(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/\n/g, '<br>');
    }

    /**
     * 安全地渲染HTML内容
     */
    renderHtmlContent(htmlContent, container) {
        // 解析HTML并提取正文内容
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // 查找正文内容
        const contentElement = doc.querySelector('.mobius-article-wrapper') ||
                             doc.querySelector('.mobius-article-body') ||
                             doc.querySelector('article') ||
                             doc.querySelector('main') ||
                             doc.body;

        if (contentElement) {
            // 安全地复制内容
            this.safelyCopyContent(contentElement, container);
        } else {
            // 如果找不到特定容器，使用整个文档内容
            this.safelyCopyContent(doc.body, container);
        }

        // 移除加载占位符
        const loadingPlaceholder = container.querySelector('.loading-placeholder');
        if (loadingPlaceholder) {
            loadingPlaceholder.remove();
        }
    }

    /**
     * 安全地复制内容，避免XSS
     */
    safelyCopyContent(source, target) {
        // 获取所有子元素
        const elements = source.children;

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            // 检查元素是否安全
            if (this.isElementSafe(element)) {
                const clonedElement = element.cloneNode(true);

                // 清理可能的危险属性
                this.sanitizeElement(clonedElement);

                target.appendChild(clonedElement);
            }
        }
    }

    /**
     * 检查元素是否安全
     */
    isElementSafe(element) {
        const tagName = element.tagName.toLowerCase();
        const allowedTags = [
            'div', 'section', 'article', 'header', 'footer', 'nav', 'aside',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'span', 'strong', 'em', 'b', 'i', 'u',
            'ul', 'ol', 'li', 'dl', 'dt', 'dd',
            'a', 'img', 'br', 'hr',
            'blockquote', 'pre', 'code',
            'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ];

        if (!allowedTags.includes(tagName)) {
            return false;
        }

        // 检查危险属性
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover'];
        for (const attr of dangerousAttrs) {
            if (element.hasAttribute(attr)) {
                return false;
            }
        }

        // 检查链接安全性
        if (tagName === 'a') {
            const href = element.getAttribute('href');
            if (href && (href.startsWith('javascript:') || href.startsWith('data:'))) {
                return false;
            }
        }

        return true;
    }

    /**
     * 清理元素的危险属性
     */
    sanitizeElement(element) {
        // 移除所有事件处理器属性
        const attributes = element.attributes;
        const toRemove = [];

        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.name.startsWith('on')) {
                toRemove.push(attr.name);
            }
        }

        toRemove.forEach(attrName => {
            element.removeAttribute(attrName);
        });

        // 递归清理子元素
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
            this.sanitizeElement(children[i]);
        }
    }

    /**
     * 生成文章目录
     */
    generateTOC() {
        const tocContainer = document.getElementById('detailToc');
        const articleBody = document.getElementById('articleBody');

        if (!tocContainer || !articleBody) return;

        // 查找所有标题
        const headings = articleBody.querySelectorAll('h1, h2, h3, h4, h5, h6');

        // 清空现有目录内容
        while (tocContainer.firstChild) {
            tocContainer.removeChild(tocContainer.firstChild);
        }

        if (headings.length === 0) {
            const noToc = this.createElement('p', 'no-toc', '本文无目录');
            tocContainer.appendChild(noToc);
            return;
        }

        const tocList = this.createElement('ul');
        tocContainer.appendChild(tocList);

        headings.forEach((heading, index) => {
            const text = heading.textContent.trim();
            const id = `heading-${index}`;
            const level = parseInt(heading.tagName.substring(1));

            // 为标题设置ID
            heading.id = id;

            // 创建目录项
            const li = this.createElement('li');
            li.style.marginLeft = `${(level - 1) * 16}px`;

            const link = this.createElement('a', 'toc-link', text);
            link.href = `#${id}`;
            link.dataset.target = id;

            li.appendChild(link);
            tocList.appendChild(li);
        });

        // 添加目录点击事件
        tocContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('toc-link')) {
                e.preventDefault();
                const targetId = e.target.dataset.target;
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });

        // 高亮当前目录项
        this.highlightCurrentTOC();
    }

    /**
     * 高亮当前目录项
     */
    highlightCurrentTOC() {
        const tocLinks = document.querySelectorAll('.toc-link');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`[data-target="${id}"]`);

                if (tocLink) {
                    if (entry.isIntersecting) {
                        // 移除所有active类
                        tocLinks.forEach(link => link.classList.remove('active'));
                        // 添加active类到当前链接
                        tocLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-100px 0px -100px 0px'
        });

        // 观察所有标题元素
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            observer.observe(heading);
        });
    }

    /**
     * 加载相关知识
     */
    loadRelatedKnowledge() {
        const relatedList = document.getElementById('relatedKnowledgeList');

        if (!relatedList || !this.currentArticle) return;

        // 根据当前文章分类，推荐相关知识
        const relatedArticles = this.getRelatedArticlesByCategory(this.currentArticle.category, this.currentArticle.id);

        if (relatedArticles.length === 0) {
            const noRelated = this.createElement('li', '', '暂无相关知识');
            relatedList.appendChild(noRelated);
            return;
        }

        relatedArticles.forEach(article => {
            const li = this.createElement('li');
            const a = this.createElement('a', '', article.title);
            a.href = `./knowledge-detail-new.html?id=${article.id}`;
            li.appendChild(a);
            relatedList.appendChild(li);
        });
    }

    /**
     * 加载标签
     */
    loadTags() {
        const tagsList = document.getElementById('tagsList');

        if (!tagsList || !this.currentArticle) return;

        const tags = this.currentArticle.tags || [
            '日本创业', '税务', '商业', '外国人', '公司设立'
        ];

        tags.forEach(tag => {
            const a = this.createElement('a', 'tag', tag);
            a.href = '#';
            a.dataset.tag = tag;
            tagsList.appendChild(a);
        });
    }

    /**
     * 加载评论
     */
    loadComments() {
        // 模拟评论数据
        this.comments = [
            {
                id: 1,
                author: '张先生',
                content: '内容很详细，对我很有帮助！',
                rating: 5,
                date: '2024年1月15日',
                helpful: 12
            },
            {
                id: 2,
                author: '李女士',
                content: '实用的指南，步骤清晰，推荐收藏。',
                rating: 4,
                date: '2024年1月14日',
                helpful: 8
            }
        ];

        this.renderComments();
        this.updateCommentStats();
    }

    /**
     * 渲染评论列表
     */
    renderComments() {
        const commentsList = document.getElementById('commentsList');

        if (!commentsList) return;

        // 清空现有评论
        while (commentsList.firstChild) {
            commentsList.removeChild(commentsList.firstChild);
        }

        if (this.comments.length === 0) {
            const noComments = this.createElement('div', 'no-comments');

            const icon = this.createIcon('fas fa-comment-slash');
            const text = this.createElement('p', '', '暂无评论，成为第一个评论者吧！');

            noComments.appendChild(icon);
            noComments.appendChild(text);
            commentsList.appendChild(noComments);
            return;
        }

        this.comments.forEach(comment => {
            const commentItem = this.createElement('div', 'comment-item');
            commentItem.dataset.id = comment.id;

            // 评论头部
            const commentHeader = this.createElement('div', 'comment-header');

            const author = this.createElement('div', 'comment-author', comment.author);
            const meta = this.createElement('div', 'comment-meta');

            const date = this.createElement('span', 'comment-date', comment.date);
            const rating = this.createElement('div', 'comment-rating');

            // 安全地生成星级HTML
            this.generateStarsSafe(comment.rating, rating);

            meta.appendChild(date);
            meta.appendChild(rating);
            commentHeader.appendChild(author);
            commentHeader.appendChild(meta);

            // 评论内容
            const content = this.createElement('div', 'comment-content');
            const p = this.createElement('p', '', comment.content);
            content.appendChild(p);

            // 评论操作
            const actions = this.createElement('div', 'comment-actions');

            const helpfulBtn = this.createElement('button', 'comment-helpful-btn');
            helpfulBtn.dataset.id = comment.id;

            const helpfulIcon = this.createIcon('fas fa-thumbs-up');
            const helpfulText = document.createTextNode(` 有帮助 (${comment.helpful})`);
            helpfulBtn.appendChild(helpfulIcon);
            helpfulBtn.appendChild(helpfulText);

            const replyBtn = this.createElement('button', 'comment-reply-btn');
            const replyIcon = this.createIcon('fas fa-reply');
            const replyText = document.createTextNode(' 回复');
            replyBtn.appendChild(replyIcon);
            replyBtn.appendChild(replyText);

            actions.appendChild(helpfulBtn);
            actions.appendChild(replyBtn);

            commentItem.appendChild(commentHeader);
            commentItem.appendChild(content);
            commentItem.appendChild(actions);
            commentsList.appendChild(commentItem);

            // 添加事件监听器
            helpfulBtn.addEventListener('click', () => {
                this.markHelpful(comment.id, helpfulBtn);
            });
        });
    }

    /**
     * 生成星级评分
     */
    generateStars(rating) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        return starsHTML;
    }

    /**
     * 安全地生成星级评分DOM
     */
    generateStarsSafe(rating, container) {
        // 清空现有内容
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }

        for (let i = 1; i <= 5; i++) {
            const star = this.createIcon(i <= rating ? 'fas fa-star' : 'far fa-star');
            container.appendChild(star);
        }
    }

    /**
     * 更新评论统计
     */
    updateCommentStats() {
        const commentCount = document.getElementById('commentCount');
        const avgRating = document.getElementById('avgRating');

        if (commentCount) {
            commentCount.textContent = this.comments.length;
        }

        if (avgRating && this.comments.length > 0) {
            const average = this.comments.reduce((sum, comment) => sum + comment.rating, 0) / this.comments.length;
            avgRating.textContent = average.toFixed(1);
        }
    }

    /**
     * 初始化交互功能
     */
    initializeInteractions() {
        // 发表评论按钮
        const addCommentBtn = document.getElementById('addCommentBtn');
        const commentForm = document.getElementById('commentForm');
        const cancelCommentBtn = document.getElementById('cancelCommentBtn');
        const submitCommentBtn = document.getElementById('submitCommentBtn');
        const commentText = document.getElementById('commentText');

        if (addCommentBtn && commentForm) {
            addCommentBtn.addEventListener('click', () => {
                commentForm.style.display = 'block';
                addCommentBtn.style.display = 'none';
            });
        }

        if (cancelCommentBtn && commentForm && addCommentBtn) {
            cancelCommentBtn.addEventListener('click', () => {
                commentForm.style.display = 'none';
                addCommentBtn.style.display = 'flex';
                this.resetCommentForm();
            });
        }

        if (submitCommentBtn) {
            submitCommentBtn.addEventListener('click', () => {
                this.submitComment();
            });
        }

        // 评分星星
        const ratingStars = document.querySelectorAll('.rating-stars i');
        ratingStars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setRating(rating);
            });

            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.dataset.rating);
                this.previewRating(rating);
            });
        });

        const ratingStarsContainer = document.querySelector('.rating-stars');
        if (ratingStarsContainer) {
            ratingStarsContainer.addEventListener('mouseleave', () => {
                const currentRating = this.getCurrentRating();
                this.setRating(currentRating);
            });
        }

        // 有帮助按钮
        document.querySelectorAll('.comment-helpful-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const commentId = parseInt(btn.dataset.id);
                this.markHelpful(commentId, btn);
            });
        });

        // 文章互动按钮
        this.initializeArticleInteractions();
    }

    /**
     * 初始化文章互动功能
     */
    initializeArticleInteractions() {
        const helpfulBtn = document.getElementById('helpfulBtn');
        const bookmarkBtn = document.getElementById('bookmarkBtn');
        const shareBtn = document.getElementById('shareBtn');

        if (helpfulBtn) {
            helpfulBtn.addEventListener('click', () => {
                this.toggleHelpful(helpfulBtn);
            });
        }

        if (bookmarkBtn) {
            bookmarkBtn.addEventListener('click', () => {
                this.toggleBookmark(bookmarkBtn);
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareArticle();
            });
        }
    }

    /**
     * 初始化滚动效果
     */
    initializeScrollEffects() {
        const backToTop = document.getElementById('backToTop');

        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                if (backToTop) backToTop.style.display = 'block';
            } else {
                if (backToTop) backToTop.style.display = 'none';
            }
        });

        // 返回顶部按钮点击事件
        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * 提交评论
     */
    submitComment() {
        const commentText = document.getElementById('commentText');
        const rating = this.getCurrentRating();
        const text = commentText.value.trim();

        if (!text) {
            alert('请输入评论内容');
            return;
        }

        const newComment = {
            id: Date.now(),
            author: '访客用户',
            content: text,
            rating: rating,
            date: new Date().toISOString().split('T')[0],
            helpful: 0
        };

        this.comments.unshift(newComment);
        this.renderComments();
        this.updateCommentStats();
        this.resetCommentForm();

        // 隐藏评论表单
        const commentForm = document.getElementById('commentForm');
        const addCommentBtn = document.getElementById('addCommentBtn');
        if (commentForm && addCommentBtn) {
            commentForm.style.display = 'none';
            addCommentBtn.style.display = 'flex';
        }

        this.showSuccess('评论发表成功！');
    }

    /**
     * 重置评论表单
     */
    resetCommentForm() {
        const commentText = document.getElementById('commentText');
        if (commentText) {
            commentText.value = '';
        }
        this.setRating(0);
    }

    /**
     * 设置评分
     */
    setRating(rating) {
        const stars = document.querySelectorAll('.rating-stars i');
        stars.forEach((star, index) => {
            star.className = 'fa-star';
            if (index < rating) {
                star.classList.add('fas');
                star.classList.add('active');
            } else {
                star.classList.add('far');
                star.classList.remove('fas');
                star.classList.remove('active');
            }
        });
    }

    /**
     * 预览评分
     */
    previewRating(rating) {
        const stars = document.querySelectorAll('.rating-stars i');
        stars.forEach((star, index) => {
            star.className = 'fa-star';
            if (index < rating) {
                star.classList.add('fas');
                star.classList.remove('far');
            } else {
                star.classList.add('far');
                star.classList.remove('fas');
            }
        });
    }

    /**
     * 获取当前评分
     */
    getCurrentRating() {
        const activeStars = document.querySelectorAll('.rating-stars i.active');
        return activeStars.length;
    }

    /**
     * 标记为有帮助
     */
    markHelpful(commentId, button) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.helpful++;

            // 安全地更新按钮内容
            while (button.firstChild) {
                button.removeChild(button.firstChild);
            }
            const icon = this.createIcon('fas fa-thumbs-up');
            const text = document.createTextNode(` 有帮助 (${comment.helpful})`);
            button.appendChild(icon);
            button.appendChild(text);
            button.disabled = true;

            // 保存到本地存储
            this.saveHelpfulCount(commentId, comment.helpful);
        }
    }

    /**
     * 保存有帮助数量
     */
    saveHelpfulCount(commentId, count) {
        const key = `helpful_${commentId}`;
        localStorage.setItem(key, count.toString());
    }

    /**
     * 切换有帮助状态
     */
    toggleHelpful(button) {
        const isActive = button.classList.contains('active');

        if (isActive) {
            button.classList.remove('active');
            const count = button.querySelector('.interaction-count');
            if (count) count.textContent = '有帮助';
        } else {
            button.classList.add('active');
            const count = button.querySelector('.interaction-count');
            if (count) count.textContent = '已帮助';
        }
    }

    /**
     * 切换收藏状态
     */
    toggleBookmark(button) {
        const isActive = button.classList.contains('active');

        if (isActive) {
            button.classList.remove('active');
            const count = button.querySelector('.interaction-count');
            if (count) count.textContent = '收藏';
        } else {
            button.classList.add('active');
            const count = button.querySelector('.interaction-count');
            if (count) count.textContent = '已收藏';
        }
    }

    /**
     * 分享文章
     */
    shareArticle() {
        if (navigator.share) {
            navigator.share({
                title: this.currentArticle.title,
                text: this.currentArticle.description,
                url: window.location.href
            }).catch(err => {
                console.log('分享失败:', err);
                this.fallbackShare();
            });
        } else {
            this.fallbackShare();
        }
    }

    /**
     * 备用分享方法
     */
    fallbackShare() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showSuccess('链接已复制到剪贴板！');
            });
        } else {
            // 创建临时输入框
            const tempInput = document.createElement('input');
            tempInput.value = window.location.href;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            this.showSuccess('链接已复制！');
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        const articleBody = document.getElementById('articleBody');
        if (articleBody) {
            // 安全地清空现有内容
            while (articleBody.firstChild) {
                articleBody.removeChild(articleBody.firstChild);
            }

            // 使用安全的DOM方法创建错误信息
            const errorDiv = this.createElement('div', 'error-message');

            const icon = this.createIcon('fas fa-exclamation-triangle');
            const title = this.createElement('h3', '', '加载失败');
            const description = this.createElement('p', '', message);

            errorDiv.appendChild(icon);
            errorDiv.appendChild(title);
            errorDiv.appendChild(description);
            articleBody.appendChild(errorDiv);
        }
    }

    /**
     * 显示成功信息
     */
    showSuccess(message) {
        // 创建临时成功提示
        const successDiv = this.createElement('div', 'success-toast');

        const icon = this.createIcon('fas fa-check-circle');
        const text = this.createElement('span', '', message);

        successDiv.appendChild(icon);
        successDiv.appendChild(text);

        // 设置样式
        successDiv.style.position = 'fixed';
        successDiv.style.top = '20px';
        successDiv.style.right = '20px';
        successDiv.style.background = 'var(--accent-red, #dc2626)';
        successDiv.style.color = 'white';
        successDiv.style.padding = '1rem 1.5rem';
        successDiv.style.borderRadius = '8px';
        successDiv.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        successDiv.style.zIndex = '10000';
        successDiv.style.display = 'flex';
        successDiv.style.alignItems = 'center';
        successDiv.style.gap = '0.5rem';
        successDiv.style.animation = 'slideIn 0.3s ease';

        document.body.appendChild(successDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 3000);
    }

    /**
     * 根据分类获取相关知识
     */
    getRelatedArticlesByCategory(category, currentArticleId) {
        const allArticles = this.getAllArticles();

        // 根据分类推荐相关知识 - 使用实际文件名
        const categoryArticles = {
            'business': [
                { id: 'business-faq-01', title: '开店咨询常见问题(第1部分)', category: 'business' },
                { id: 'business-registration-01', title: '日本公司注册指南', category: 'business' },
                { id: 'business-restaurant-02', title: '日本餐厅开设指南', category: 'business' },
                { id: 'business-setupguide-01', title: '企业落地服务指南', category: 'business' }
            ],
            'visa': [
                { id: 'visa-faq-01', title: '签证申请常见问题', category: 'visa' },
                { id: 'visa-guide-01', title: '日本签证申请指南(第1部分)', category: 'visa' },
                { id: 'visa-guide-02', title: '日本签证申请指南(第2部分)', category: 'visa' }
            ],
            'tax': [
                { id: 'tax-article-01', title: '日本税务基础指南', category: 'tax' },
                { id: 'tax-consumption-01', title: '消费税申报指南', category: 'tax' },
                { id: 'tax-faq-02', title: '税务常见问题(第2部分)', category: 'tax' },
                { id: 'tax-faq-03', title: '税务常见问题(第3部分)', category: 'tax' },
                { id: 'tax-guide-02', title: '日本税务规划指南', category: 'tax' }
            ],
            'legal': [
                { id: 'legal-faq-01', title: '法务常见问题(第1部分)', category: 'legal' },
                { id: 'legal-faq-02', title: '法务常见问题(第2部分)', category: 'legal' },
                { id: 'legal-labor-01', title: '日本劳动法指南', category: 'legal' },
                { id: 'legal-dataprotection-02', title: '数据保护合规指南', category: 'legal' }
            ],
            'subsidy': [
                { id: 'subsidy-guide-02', title: '日本补助金申请指南', category: 'subsidy' },
                { id: 'subsidy-greengift-01', title: '日本环保补助项目', category: 'subsidy' }
            ],
            'life': [
                { id: 'life-banking-01', title: '日本银行开户指南', category: 'life' },
                { id: 'life-faq-01', title: '生活常见问题(第1部分)', category: 'life' },
                { id: 'life-housing-02', title: '日本住房指南', category: 'life' }
            ]
        };

        // 获取当前分类的相关文章
        const relatedArticles = categoryArticles[category] || [];

        // 过滤掉当前文章
        return relatedArticles.filter(article => article.id !== currentArticleId).slice(0, 5);
    }

    /**
     * 获取所有可用文章列表
     */
    getAllArticles() {
        return [
            // 企业落地 - 使用实际文件名
            { id: 'business-faq-01', title: '开店咨询常见问题(第1部分)', category: 'business' },
            { id: 'business-registration-01', title: '日本公司注册指南', category: 'business' },
            { id: 'business-restaurant-02', title: '日本餐厅开设指南', category: 'business' },
            { id: 'business-setupguide-01', title: '企业落地服务指南', category: 'business' },

            // 签证
            { id: 'visa-faq-01', title: '签证申请常见问题', category: 'visa' },
            { id: 'visa-guide-01', title: '日本签证申请指南(第1部分)', category: 'visa' },
            { id: 'visa-guide-02', title: '日本签证申请指南(第2部分)', category: 'visa' },

            // 税务
            { id: 'tax-article-01', title: '日本税务基础指南', category: 'tax' },
            { id: 'tax-consumption-01', title: '消费税申报指南', category: 'tax' },
            { id: 'tax-faq-02', title: '税务常见问题(第2部分)', category: 'tax' },
            { id: 'tax-faq-03', title: '税务常见问题(第3部分)', category: 'tax' },
            { id: 'tax-guide-02', title: '日本税务规划指南', category: 'tax' },

            // 法务
            { id: 'legal-faq-01', title: '法务常见问题(第1部分)', category: 'legal' },
            { id: 'legal-faq-02', title: '法务常见问题(第2部分)', category: 'legal' },
            { id: 'legal-labor-01', title: '日本劳动法指南', category: 'legal' },
            { id: 'legal-dataprotection-02', title: '数据保护合规指南', category: 'legal' },

            // 补助金
            { id: 'subsidy-guide-02', title: '日本补助金申请指南', category: 'subsidy' },
            { id: 'subsidy-greengift-01', title: '日本环保补助项目', category: 'subsidy' },

            // 生活
            { id: 'life-banking-01', title: '日本银行开户指南', category: 'life' },
            { id: 'life-faq-01', title: '生活常见问题(第1部分)', category: 'life' },
            { id: 'life-housing-02', title: '日本住房指南', category: 'life' }
        ];
    }
}

// 添加样式
if (!document.querySelector('#knowledge-detail-styles')) {
    const style = document.createElement('style');
    style.id = 'knowledge-detail-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        .error-message {
            text-align: center;
            padding: 60px 20px;
            color: #dc2626;
        }

        .error-message i {
            font-size: 3rem;
            margin-bottom: 20px;
            display: block;
        }

        .error-message h3 {
            font-size: 1.5rem;
            margin-bottom: 10px;
        }

        .no-comments {
            text-align: center;
            padding: 60px 20px;
            color: #9ca3af;
        }

        .no-comments i {
            font-size: 32px;
            margin-bottom: 16px;
            display: block;
        }

        .comment-item {
            border-bottom: 1px solid var(--article-border-color, #e5e7eb);
            padding: var(--article-spacing-md, 1rem) 0;
            margin-bottom: var(--article-spacing-sm, 1rem);
        }

        .comment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--article-spacing-xs, 0.5rem);
        }

        .comment-author {
            font-weight: var(--article-font-weight-medium, 500);
            color: var(--article-heading-color, #1f2937);
        }

        .comment-meta {
            display: flex;
            gap: var(--article-spacing-md, 1rem);
            align-items: center;
            font-size: 12px;
            color: var(--article-muted-text, #6b7280);
        }

        .comment-date {
            color: var(--article-muted-text, #6b7280);
        }

        .comment-rating {
            color: #fbbf24;
        }

        .comment-actions {
            display: flex;
            gap: var(--article-spacing-sm, 1rem);
            margin-top: var(--article-spacing-sm, 1rem);
            font-size: 14px;
        }

        .comment-helpful-btn,
        .comment-reply-btn {
            padding: 4px 12px;
            border: 1px solid var(--article-border-color, #e5e7eb);
            background: var(--article-white, #ffffff);
            border-radius: var(--article-radius-sm, 8px);
            color: var(--article-text-color, #374151);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
        }

        .comment-helpful-btn:hover,
        .comment-reply-btn:hover {
            border-color: var(--article-tech-blue, #3b82f6);
            color: var(--article-tech-blue, #3b82f6);
        }

        .comment-helpful-btn:disabled {
            background: #f9fafb;
            color: #9ca3af;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(style);
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    if (window.KnowledgeDetail) {
        window.knowledgeDetail = new KnowledgeDetail();
    }
});

// 暴露类到全局作用域
window.KnowledgeDetail = KnowledgeDetail;