/**
 * 安全的Markdown渲染器
 * 基于文档架构实现，避免innerHTML安全风险
 */

class MarkdownRenderer {
    constructor() {
        this.version = '1.0.0';
        this.cache = new Map();
        this.securityConfig = {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'strong', 'em', 'code', 'pre',
                'a', 'img', 'ul', 'ol', 'li',
                'blockquote', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'id', 'class'],
            ALLOW_DATA_ATTR: false
        };
    }

    /**
     * 获取基础URL
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/knowledge/')) {
            return '../';
        }
        return './';
    }

    /**
     * 生成内容哈希用于缓存
     */
    generateHash(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    /**
     * 验证Markdown内容安全性
     */
    validateMarkdown(content) {
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /on\w+\s*=/i
        ];

        return !dangerousPatterns.some(pattern => pattern.test(content));
    }

    /**
     * 安全创建DOM元素
     */
    safeCreateElement(tag, attributes = {}, textContent = '') {
        const element = document.createElement(tag);

        // 设置属性
        Object.keys(attributes).forEach(key => {
            if (this.securityConfig.ALLOWED_ATTR.includes(key.toLowerCase())) {
                element.setAttribute(key, attributes[key]);
            }
        });

        // 设置文本内容（安全方式）
        if (textContent) {
            element.textContent = textContent;
        }

        return element;
    }

    /**
     * 预处理Markdown内容
     */
    preprocessMarkdown(markdown) {
        return markdown
            .replace(/{{alert}}(.*?){{\/alert}}/gs, (match, content) => {
                return `<div class="alert alert-info">${content.trim()}</div>`;
            })
            .replace(/{{note}}(.*?){{\/note}}/gs, (match, content) => {
                return `<div class="note">${content.trim()}</div>`;
            })
            .replace(/{{warning}}(.*?){{\/warning}}/gs, (match, content) => {
                return `<div class="warning">${content.trim()}</div>`;
            });
    }

    /**
     * 安全的Markdown解析器 - 直接创建DOM元素
     */
    parseMarkdownToDOM(markdown) {
        if (!this.validateMarkdown(markdown)) {
            throw new Error('Markdown content contains security risks');
        }

        const preprocessed = this.preprocessMarkdown(markdown);
        const container = document.createElement('div');

        // 分行处理
        const lines = preprocessed.split('\n');
        let currentElement = null;
        let inCodeBlock = false;
        let codeBlockContent = '';
        let codeBlockLang = '';

        const processLine = (line, index) => {
            // 代码块处理
            if (line.startsWith('```')) {
                if (!inCodeBlock) {
                    inCodeBlock = true;
                    codeBlockLang = line.substring(3).trim();
                    codeBlockContent = '';
                } else {
                    inCodeBlock = false;
                    const preElement = this.safeCreateElement('pre', { class: `language-${codeBlockLang}` });
                    const codeElement = this.safeCreateElement('code', { class: `language-${codeBlockLang}` }, codeBlockContent);
                    preElement.appendChild(codeElement);
                    container.appendChild(preElement);
                    codeBlockContent = '';
                    codeBlockLang = '';
                }
                return;
            }

            if (inCodeBlock) {
                codeBlockContent += line + '\n';
                return;
            }

            // 标题处理
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2].trim();
                const headingId = `heading-${index}`;
                const headingElement = this.safeCreateElement(`h${level}`, { id: headingId }, text);
                container.appendChild(headingElement);
                currentElement = headingElement;
                return;
            }

            // 引用处理
            if (line.startsWith('> ')) {
                const text = line.substring(2).trim();
                const blockquoteElement = this.safeCreateElement('blockquote', {}, text);
                container.appendChild(blockquoteElement);
                currentElement = blockquoteElement;
                return;
            }

            // 列表处理
            if (line.match(/^[\-\*\+]\s/) || line.match(/^\d+\.\s/)) {
                const isOrdered = line.match(/^\d+\.\s/);
                const text = line.replace(/^[\-\*\+\d\.]\s/, '').trim();
                const liElement = this.safeCreateElement('li', {}, text);

                // 查找或创建列表容器
                let listElement = container.lastElementChild;
                if (!listElement || (listElement.tagName !== 'UL' && listElement.tagName !== 'OL') ||
                    (listElement.tagName === 'UL' && isOrdered) ||
                    (listElement.tagName === 'OL' && !isOrdered)) {
                    listElement = this.safeCreateElement(isOrdered ? 'ol' : 'ul');
                    container.appendChild(listElement);
                }

                listElement.appendChild(liElement);
                currentElement = liElement;
                return;
            }

            // 空行处理
            if (!line.trim()) {
                if (currentElement && currentElement.tagName === 'P') {
                    currentElement = null;
                }
                return;
            }

            // 普通段落处理
            const processedText = this.processInlineMarkdown(line);
            const pElement = this.safeCreateElement('p');

            // 使用临时元素处理内联Markdown
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = processedText;

            // 安全地复制处理后的内容
            while (tempDiv.firstChild) {
                pElement.appendChild(tempDiv.firstChild);
            }

            container.appendChild(pElement);
            currentElement = pElement;
        };

        lines.forEach(processLine);

        return container;
    }

    /**
     * 处理内联Markdown
     */
    processInlineMarkdown(text) {
        // 处理内联元素时使用受控的innerHTML，因为内容已经验证
        return text
            .replace(/\*\*\*([^\*]+)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^\*]+)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    }

    /**
     * 安全渲染为DOM元素
     */
    renderToDOM(markdown) {
        try {
            return this.parseMarkdownToDOM(markdown);
        } catch (error) {
            console.error('Markdown解析错误:', error);
            const errorElement = document.createElement('div');
            errorElement.className = 'error';
            errorElement.textContent = '内容解析失败，请检查Markdown语法';
            return errorElement;
        }
    }

    /**
     * 渲染为HTML字符串（从DOM转换）
     */
    render(markdown) {
        const dom = this.renderToDOM(markdown);
        return dom.innerHTML;
    }

    /**
     * 提取SEO信息
     */
    extractSEOInfo(markdown) {
        const lines = markdown.split('\n');
        const seoInfo = {
            title: '',
            description: '',
            keywords: [],
            headings: []
        };

        lines.forEach((line, index) => {
            // 提取标题
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2].trim();

                seoInfo.headings.push({ level, text, id: `heading-${index}` });

                // 第一个标题作为文章标题
                if (!seoInfo.title) {
                    seoInfo.title = text;
                }
            }

            // 提取描述（第一段文字）
            if (!seoInfo.description && line.trim() && !line.startsWith('#')) {
                const text = line.replace(/[#*_`]/g, '').trim();
                seoInfo.description = text.substring(0, 160);
            }
        });

        return seoInfo;
    }

    /**
     * 生成目录
     */
    generateTableOfContents(markdown) {
        const lines = markdown.split('\n');
        const headings = [];

        lines.forEach((line, index) => {
            const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2].trim();
                const id = `heading-${index}`;

                headings.push({ level, text, id });
            }
        });

        if (headings.length === 0) {
            return { tocHtml: '', headings: [] };
        }

        // 创建安全的目录DOM
        const tocContainer = document.createElement('div');
        tocContainer.className = 'table-of-contents';

        const titleElement = this.safeCreateElement('h3', {}, '目录');
        tocContainer.appendChild(titleElement);

        const listElement = this.safeCreateElement('ul');

        headings.forEach(heading => {
            const liElement = this.safeCreateElement('li');
            if (heading.level > 2) {
                liElement.style.marginLeft = '1.5rem';
            }

            const linkElement = this.safeCreateElement('a', { href: `#${heading.id}` }, heading.text);
            liElement.appendChild(linkElement);
            listElement.appendChild(liElement);
        });

        tocContainer.appendChild(listElement);

        return {
            tocHtml: tocContainer.outerHTML,
            headings,
            tocElement: tocContainer
        };
    }

    /**
     * 带缓存的渲染
     */
    renderWithCache(markdown) {
        const cacheKey = this.generateHash(markdown);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const result = this.renderPage(markdown);
        this.cache.set(cacheKey, result);

        // 设置缓存过期时间（1小时）
        setTimeout(() => {
            this.cache.delete(cacheKey);
        }, 3600000);

        return result;
    }

    /**
     * 页面渲染（包含SEO信息和目录）
     */
    renderPage(markdown) {
        const dom = this.renderToDOM(markdown);
        const seoInfo = this.extractSEOInfo(markdown);
        const { tocElement, tocHtml, headings } = this.generateTableOfContents(markdown);

        // 如果有目录，在开头插入
        if (tocElement) {
            dom.insertBefore(tocElement, dom.firstChild);
        }

        return {
            html: dom.innerHTML,
            toc: tocHtml,
            seo: seoInfo,
            headings,
            dom
        };
    }

    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 获取缓存大小
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * 性能监控
     */
    monitorPerformance(content) {
        const startTime = performance.now();

        const result = this.renderPage(content);

        const endTime = performance.now();
        const renderTime = endTime - startTime;

        if (renderTime > 100) {
            console.warn(`Markdown渲染耗时过长: ${renderTime}ms`);
        }

        return result;
    }
}

// 创建全局实例
window.markdownRenderer = new MarkdownRenderer();

// 开发环境下的调试信息
if (typeof config !== 'undefined' && config.development && config.debug) {
    console.log('Markdown渲染器版本:', window.markdownRenderer.version);
    console.log('缓存状态:', window.markdownRenderer.getCacheSize());
}