/**
 * SEO和可访问性优化器 - SEO and Accessibility Optimizer
 * 提升搜索引擎优化和用户可访问性
 */

class SeoAccessibilityOptimizer {
    constructor() {
        this.isInitialized = false;
        this.options = {
            enableStructuredData: true,
            enableAriaLabels: true,
            enableKeyboardNavigation: true,
            enableFocusManagement: true
        };

        // 语言检测
        this.language = 'zh-CN';
    }

    init() {
        if (this.isInitialized) return;

        console.log('初始化SEO和可访问性优化器...');

        this.detectLanguage();
        this.addStructuredData();
        this.optimizeAccessibility();
        this.setupKeyboardNavigation();
        this.addAriaLabels();
        this.optimizeFocus();
        this.addSkipLinks();
        this.optimizeImages();
        this.addReadingTime();

        this.isInitialized = true;
        console.log('SEO和可访问性优化器初始化完成');
    }

    /**
     * 检测页面语言
     */
    detectLanguage() {
        const html = document.documentElement;
        this.language = html.lang || 'zh-CN';

        // 如果没有设置语言，根据内容检测
        if (!html.lang) {
            const content = document.body.textContent;
            if (/[\u4e00-\u9fa5]/.test(content)) {
                this.language = 'zh-CN';
            } else if (/[a-zA-Z]/.test(content)) {
                this.language = 'en-US';
            }
            html.lang = this.language;
        }
    }

    /**
     * 添加结构化数据
     */
    addStructuredData() {
        if (!this.options.enableStructuredData) return;

        // 文章结构化数据
        const articleData = this.createArticleStructuredData();
        if (articleData) {
            this.insertStructuredData(articleData);
        }

        // 面包屑导航数据
        const breadcrumbData = this.createBreadcrumbStructuredData();
        if (breadcrumbData) {
            this.insertStructuredData(breadcrumbData);
        }

        // 组织信息数据
        const organizationData = this.createOrganizationStructuredData();
        if (organizationData) {
            this.insertStructuredData(organizationData);
        }

        console.log('结构化数据已添加');
    }

    /**
     * 创建文章结构化数据
     */
    createArticleStructuredData() {
        const title = document.querySelector('title')?.textContent;
        const author = document.querySelector('.zhihu-author-name')?.textContent;
        const publishDate = document.querySelector('.zhihu-article-date')?.textContent;
        const articleBody = document.querySelector('.zhihu-article-body')?.textContent;

        if (!title) return null;

        return {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            author: {
                '@type': 'Organization',
                name: author || 'Mobius专业团队'
            },
            datePublished: this.parseDate(publishDate) || new Date().toISOString(),
            dateModified: new Date().toISOString(),
            mainEntityOfPage: {
                '@type': 'WebPage',
                '@id': window.location.href
            },
            publisher: {
                '@type': 'Organization',
                name: 'Mobius',
                url: 'https://mobius-service.com'
            },
            articleBody: articleBody?.substring(0, 200) + '...',
            inLanguage: this.language
        };
    }

    /**
     * 创建面包屑结构化数据
     */
    createBreadcrumbStructuredData() {
        const breadcrumbItems = [
            {
                name: '首页',
                url: 'https://mobius-service.com'
            },
            {
                name: '知识库',
                url: 'https://mobius-service.com/knowledge.html'
            }
        ];

        const title = document.querySelector('.zhihu-article-title')?.textContent;
        if (title) {
            breadcrumbItems.push({
                name: title,
                url: window.location.href
            });
        }

        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbItems.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url
            }))
        };
    }

    /**
     * 创建组织信息结构化数据
     */
    createOrganizationStructuredData() {
        return {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Mobius',
            url: 'https://mobius-service.com',
            logo: 'https://mobius-service.com/assets/imgs/logo.png',
            description: '专业的中日企业服务平台',
            contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+81-3-1234-5678',
                contactType: 'customer service',
                availableLanguage: ['Chinese', 'Japanese', 'English']
            }
        };
    }

    /**
     * 插入结构化数据
     */
    insertStructuredData(data) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    /**
     * 解析日期
     */
    parseDate(dateString) {
        if (!dateString) return null;

        // 简单的日期解析
        const match = dateString.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (match) {
            return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}T00:00:00+09:00`;
        }

        return new Date(dateString).toISOString();
    }

    /**
     * 优化可访问性
     */
    optimizeAccessibility() {
        // 设置颜色对比度
        this.optimizeColorContrast();

        // 设置字体大小
        this.optimizeFontSize();

        // 添加标题层级
        this.validateHeadingStructure();

        // 优化表单
        this.optimizeForms();
    }

    /**
     * 优化颜色对比度
     */
    optimizeColorContrast() {
        const style = document.createElement('style');
        style.textContent = `
            .zhihu-interaction-btn:hover,
            .zhihu-interaction-btn:focus {
                outline: 2px solid #0084FF;
                outline-offset: 2px;
            }

            @media (prefers-contrast: high) {
                .zhihu-article-wrapper {
                    border: 1px solid #000;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 优化字体大小
     */
    optimizeFontSize() {
        const style = document.createElement('style');
        style.textContent = `
            @media (min-resolution: 120dpi) {
                .zhihu-article-body {
                    font-size: 17px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 验证标题结构
     */
    validateHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let hasH1 = false;

        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));

            // 确保只有一个h1
            if (level === 1) {
                if (hasH1) {
                    // 降级重复的h1
                    heading.tagName = 'h2';
                }
                hasH1 = true;
            }

            // 添加跳转链接
            if (heading.id) {
                const link = document.createElement('a');
                link.href = `#${heading.id}`;
                link.className = 'heading-link';
                link.setAttribute('aria-label', `跳转到 ${heading.textContent}`);
                link.textContent = '#';
                heading.appendChild(link);
            }
        });
    }

    /**
     * 优化表单
     */
    optimizeForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                // 确保有标签
                if (!input.labels || input.labels.length === 0) {
                    const label = document.createElement('label');
                    label.textContent = input.placeholder || input.name;
                    label.htmlFor = input.id || `input_${Date.now()}`;
                    input.id = label.htmlFor;
                    input.parentNode.insertBefore(label, input);
                }

                // 添加必需标记
                if (input.required && !input.getAttribute('aria-required')) {
                    input.setAttribute('aria-required', 'true');
                }
            });
        });
    }

    /**
     * 设置键盘导航
     */
    setupKeyboardNavigation() {
        if (!this.options.enableKeyboardNavigation) return;

        // 为主导航添加键盘支持
        const mainNav = document.querySelector('#nav-menu');
        if (mainNav) {
            mainNav.setAttribute('role', 'navigation');
            mainNav.setAttribute('aria-label', '主导航');
        }

        // 为互动按钮添加键盘事件
        const interactiveButtons = document.querySelectorAll('.zhihu-interaction-btn');
        interactiveButtons.forEach((button, index) => {
            button.setAttribute('tabindex', '0');
            button.setAttribute('role', 'button');

            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }

                // 方向键导航
                if (e.key === 'ArrowRight' && index < interactiveButtons.length - 1) {
                    e.preventDefault();
                    interactiveButtons[index + 1].focus();
                }
                if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    interactiveButtons[index - 1].focus();
                }
            });
        });

        // 目录键盘导航
        this.setupTocKeyboardNavigation();
    }

    /**
     * 设置目录键盘导航
     */
    setupTocKeyboardNavigation() {
        const tocLinks = document.querySelectorAll('.zhihu-toc-link');
        tocLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    link.click();
                }

                if (e.key === 'ArrowDown' && index < tocLinks.length - 1) {
                    e.preventDefault();
                    tocLinks[index + 1].focus();
                }
                if (e.key === 'ArrowUp' && index > 0) {
                    e.preventDefault();
                    tocLinks[index - 1].focus();
                }
            });
        });
    }

    /**
     * 添加ARIA标签
     */
    addAriaLabels() {
        if (!this.options.enableAriaLabels) return;

        // 文章区域
        const article = document.querySelector('.zhihu-article-wrapper');
        if (article) {
            article.setAttribute('role', 'main');
            article.setAttribute('aria-label', '文章内容');
        }

        // 侧边栏
        const sidebar = document.querySelector('.zhihu-sidebar');
        if (sidebar) {
            sidebar.setAttribute('role', 'complementary');
            sidebar.setAttribute('aria-label', '相关内容');
        }

        // 导航区域
        const nav = document.querySelector('.zhihu-toc');
        if (nav) {
            nav.setAttribute('role', 'navigation');
            nav.setAttribute('aria-label', '文章目录');
        }

        // 互动按钮
        this.addInteractionAriaLabels();

        // 模态框标签
        this.addModalAriaLabels();
    }

    /**
     * 为互动按钮添加ARIA标签
     */
    addInteractionAriaLabels() {
        const likeBtn = document.querySelector('.zhihu-like-btn');
        if (likeBtn) {
            likeBtn.setAttribute('aria-label', '点赞这篇文章');
            likeBtn.setAttribute('aria-pressed', 'false');
        }

        const collectBtn = document.querySelector('.zhihu-collect-btn');
        if (collectBtn) {
            collectBtn.setAttribute('aria-label', '收藏这篇文章');
            collectBtn.setAttribute('aria-pressed', 'false');
        }

        const commentBtn = document.querySelector('.zhihu-comment-btn');
        if (commentBtn) {
            commentBtn.setAttribute('aria-label', '评论这篇文章');
        }

        const shareBtn = document.querySelector('.zhihu-share-btn');
        if (shareBtn) {
            shareBtn.setAttribute('aria-label', '分享这篇文章');
        }
    }

    /**
     * 为模态框添加ARIA标签
     */
    addModalAriaLabels() {
        // 评论模态框
        const commentModal = document.querySelector('.zhihu-comment-modal');
        if (commentModal) {
            commentModal.setAttribute('role', 'dialog');
            commentModal.setAttribute('aria-modal', 'true');
            commentModal.setAttribute('aria-label', '发表评论');
        }
    }

    /**
     * 优化焦点管理
     */
    optimizeFocus() {
        if (!this.options.enableFocusManagement) return;

        // 焦点陷阱
        this.setupFocusTrap();

        // 跳过链接焦点
        this.setupSkipLinks();

        // 焦点指示器
        this.enhanceFocusVisibility();
    }

    /**
     * 设置焦点陷阱
     */
    setupFocusTrap() {
        // 为模态框设置焦点陷阱
        document.addEventListener('click', (e) => {
            const modal = e.target.closest('.zhihu-comment-modal, .zhihu-share-menu');
            if (modal) {
                this.trapFocus(modal);
            }
        });
    }

    /**
     * 焦点陷阱实现
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])'
        );

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    /**
     * 设置跳过链接
     */
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = '跳过到主要内容';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #0084FF;
            color: white;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
            transition: top 0.3s ease;
        `;

        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });

        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // 添加主内容ID
        const mainContent = document.querySelector('.zhihu-main-content');
        if (mainContent) {
            mainContent.id = 'main-content';
        }
    }

    /**
     * 增强焦点可见性
     */
    enhanceFocusVisibility() {
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #0084FF;
                outline-offset: 2px;
            }

            button:focus,
            .zhihu-interaction-btn:focus {
                outline: 3px solid #0084FF;
                outline-offset: 2px;
            }

            /* 高对比度模式 */
            @media (prefers-contrast: high) {
                *:focus {
                    outline-width: 3px;
                    outline-color: #000;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 优化图片SEO和可访问性
     */
    optimizeImages() {
        const images = document.querySelectorAll('.zhihu-article-body img');
        images.forEach((img, index) => {
            // 添加alt属性
            if (!img.alt) {
                const context = this.getImageContext(img);
                img.alt = context || `图片 ${index + 1}`;
            }

            // 添加title属性
            if (!img.title && img.alt) {
                img.title = img.alt;
            }

            // 添加loading属性
            if (!img.loading) {
                img.loading = 'lazy';
            }

            // 优化图片尺寸
            this.optimizeImageSize(img);
        });
    }

    /**
     * 获取图片上下文
     */
    getImageContext(img) {
        const prevSibling = img.previousElementSibling;
        const nextSibling = img.nextElementSibling;
        const parent = img.parentElement;

        if (prevSibling && prevSibling.tagName === 'P') {
            return prevSibling.textContent.substring(0, 50);
        }

        if (nextSibling && nextSibling.tagName === 'P') {
            return nextSibling.textContent.substring(0, 50);
        }

        if (parent && parent.tagName === 'FIGURE') {
            const caption = parent.querySelector('figcaption');
            return caption ? caption.textContent : '';
        }

        return '';
    }

    /**
     * 优化图片尺寸
     */
    optimizeImageSize(img) {
        // 添加width和height属性
        if (!img.width && !img.height) {
            const rect = img.getBoundingClientRect();
            img.setAttribute('width', rect.width);
            img.setAttribute('height', rect.height);
        }

        // 添加sizes属性
        if (!img.sizes) {
            img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 690px';
        }
    }

    /**
     * 添加阅读时间估算
     */
    addReadingTime() {
        const content = document.querySelector('.zhihu-article-body');
        if (!content) return;

        const text = content.textContent;
        const wordsPerMinute = this.language === 'zh-CN' ? 250 : 200;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);

        // 查找现有的阅读时间显示
        const readingTimeElement = document.querySelector('.zhihu-article-reading');
        if (readingTimeElement) {
            readingTimeElement.textContent = `${readingTime} 分钟阅读`;
        }
    }

    /**
     * 添加页面标题优化
     */
    optimizePageTitle() {
        const title = document.querySelector('title');
        const articleTitle = document.querySelector('.zhihu-article-title');

        if (title && articleTitle) {
            const siteName = 'Mobius';
            const articleText = articleTitle.textContent;
            title.textContent = `${articleText} - ${siteName}`;
        }
    }

    /**
     * 添加meta描述优化
     */
    optimizeMetaDescription() {
        const description = document.querySelector('meta[name="description"]');
        const content = document.querySelector('.zhihu-article-excerpt p');

        if (description && content) {
            const text = content.textContent.trim();
            if (text.length > 160) {
                description.content = text.substring(0, 157) + '...';
            } else {
                description.content = text;
            }
        }
    }
}

// 创建全局实例
window.SeoAccessibilityOptimizer = new SeoAccessibilityOptimizer();

// 页面加载完成后初始化SEO和可访问性优化器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SeoAccessibilityOptimizer.init();
    });
} else {
    window.SeoAccessibilityOptimizer.init();
}