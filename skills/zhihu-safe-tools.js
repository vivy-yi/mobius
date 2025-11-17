/**
 * 知乎风格转换安全工具集
 * Zhihu-Style Transformation Safe Tools
 * 完全避免XSS漏洞，使用安全的DOM操作方法
 */

class ZhihuSafeTransformationTools {
    constructor() {
        this.version = '1.0.0';
        this.config = {
            brandColors: {
                primary: '#1e3a8a',
                secondary: '#0084FF',
                accent: '#dc2626'
            }
        };
    }

    // 主入口：安全转换
    safeTransform() {
        console.log('🚀 开始安全转换...');

        try {
            this.addSafeStyles();
            this.transformHTMLSafe();
            this.addSafeInteractions();
            this.generateSafeTOC();
            console.log('✅ 安全转换完成！');
            return true;
        } catch (error) {
            console.error('❌ 转换失败:', error);
            return false;
        }
    }

    // 安全的样式注入
    addSafeStyles() {
        if (!document.querySelector('#zhihu-styles')) {
            const style = document.createElement('style');
            style.id = 'zhihu-styles';

            // 安全的CSS内容
            const cssText = `
                :root{--zhihu-blue:#0084FF;--zhihu-gray:#8590A6;--zhihu-bg:#F6F6F6;--zhihu-border:#EBEEF0;}
                .zhihu-article-wrapper{max-width:1000px;margin:0 auto;padding:32px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
                .zhihu-interaction-btn{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border:1px solid var(--zhihu-border);border-radius:8px;background:white;cursor:pointer;transition:all .2s;}
                .zhihu-interaction-btn:hover{border-color:var(--zhihu-blue);color:var(--zhihu-blue);}
                .zhihu-interaction-btn.active{background:var(--zhihu-blue);color:white;}
                @media(max-width:1023px){.zhihu-article-wrapper{padding:16px;}}
                @media(max-width:640px){.zhihu-article-wrapper{padding:8px;}}
            `;

            style.appendChild(document.createTextNode(cssText));
            document.head.appendChild(style);
        }
    }

    // 安全的HTML转换
    transformHTMLSafe() {
        const article = document.querySelector('article, .content, .post, .entry, main');
        if (article) {
            article.classList.add('zhihu-article-wrapper');
        }

        this.addSafeAuthorInfo();
        this.addSafeInteractionBar();
    }

    // 安全添加作者信息
    addSafeAuthorInfo() {
        const wrapper = document.querySelector('.zhihu-article-wrapper');
        if (!wrapper || wrapper.querySelector('.zhihu-author-info')) return;

        const authorInfo = this.createElement('div', 'zhihu-author-info');
        const avatar = this.createElement('div', 'zhihu-author-avatar');
        avatar.textContent = 'M';

        const details = this.createElement('div', 'zhihu-author-details');
        const name = this.createElement('div', 'zhihu-author-name');
        name.textContent = 'Mobius专业团队';

        const meta = this.createElement('div', 'zhihu-article-meta');
        const date = this.createElement('span', 'zhihu-article-date');
        date.textContent = new Date().toLocaleDateString('zh-CN');

        const reading = this.createElement('span', 'zhihu-article-reading');
        reading.textContent = '5分钟阅读';

        meta.appendChild(date);
        meta.appendChild(reading);
        details.appendChild(name);
        details.appendChild(meta);
        authorInfo.appendChild(avatar);
        authorInfo.appendChild(details);

        wrapper.insertBefore(authorInfo, wrapper.firstChild);
    }

    // 安全创建元素
    createElement(tag, className) {
        const element = document.createElement(tag);
        if (className) {
            element.className = className;
        }
        return element;
    }

    // 安全添加互动栏
    addSafeInteractionBar() {
        const wrapper = document.querySelector('.zhihu-article-wrapper');
        if (!wrapper || wrapper.querySelector('.zhihu-interaction-bar')) return;

        this.addSafeFontAwesome();

        const interactionBar = this.createElement('div', 'zhihu-interaction-bar');
        const buttonsContainer = this.createElement('div', 'zhihu-interaction-buttons');

        const buttonConfigs = [
            { class: 'zhihu-like-btn', icon: 'fa-thumbs-up', text: '赞同' },
            { class: 'zhihu-collect-btn', icon: 'fa-bookmark', text: '收藏' },
            { class: 'zhihu-comment-btn', icon: 'fa-comment', text: '评论' },
            { class: 'zhihu-share-btn', icon: 'fa-share', text: '分享' }
        ];

        buttonConfigs.forEach(config => {
            const button = this.createSafeButton(config.class, config.icon, config.text);
            buttonsContainer.appendChild(button);
        });

        interactionBar.appendChild(buttonsContainer);
        wrapper.appendChild(interactionBar);
    }

    // 安全创建按钮
    createSafeButton(className, iconClass, text) {
        const button = this.createElement('button', `zhihu-interaction-btn ${className}`);
        button.setAttribute('aria-label', text);
        button.setAttribute('type', 'button');

        const icon = document.createElement('i');
        icon.className = `fas ${iconClass}`;
        icon.setAttribute('aria-hidden', 'true');

        const span = this.createElement('span', 'zhihu-interaction-count');
        span.textContent = text;

        button.appendChild(icon);
        button.appendChild(span);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleSafeInteraction(button);
        });

        return button;
    }

    // 安全的交互处理
    handleSafeInteraction(button) {
        const type = button.className.includes('like') ? 'like' :
                     button.className.includes('collect') ? 'collect' :
                     button.className.includes('comment') ? 'comment' : 'share';

        if (type === 'like') {
            button.classList.toggle('active');
            const count = parseInt(button.dataset.count) || 0;
            button.dataset.count = button.classList.contains('active') ? count + 1 : count - 1;
        } else if (type === 'comment') {
            this.showSafeCommentModal();
        } else if (type === 'share') {
            this.showSafeSharePanel();
        }

        this.updateSafeButtonCount(button);
    }

    // 安全更新按钮计数
    updateSafeButtonCount(button) {
        const count = parseInt(button.dataset.count) || 0;
        const countElement = button.querySelector('.zhihu-interaction-count');
        if (countElement) {
            countElement.textContent = count > 0 ? ` (${count})` : button.textContent.includes('赞同') ? '赞同' : '收藏';
        }
    }

    // 安全的评论模态框
    showSafeCommentModal() {
        const modal = this.createSafeModal('发表评论');
        const form = this.createCommentForm();
        modal.appendChild(form);
        document.body.appendChild(modal);
        this.bindModalEvents(modal);
    }

    // 安全的分享面板
    showSafeSharePanel() {
        const panel = this.createElement('div');
        panel.className = 'zhihu-share-panel';
        this.setStyle(panel, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: '9999'
        });

        const title = this.createElement('h4');
        title.textContent = '分享文章';
        this.setStyle(title, {
            margin: '0 0 16px 0',
            color: '#333'
        });

        const platforms = ['微信', '微博', 'QQ', '复制链接'];
        const container = this.createElement('div');
        this.setStyle(container, {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
        });

        platforms.forEach(platform => {
            const button = this.createElement('button');
            button.textContent = platform;
            this.setStyle(button, {
                padding: '12px',
                border: '1px solid #EBEEF0',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s'
            });

            button.addEventListener('click', () => {
                this.handleSafeShare(platform);
                if (panel.parentNode) {
                    document.body.removeChild(panel);
                }
            });

            container.appendChild(button);
        });

        panel.appendChild(title);
        panel.appendChild(container);
        document.body.appendChild(panel);

        // 点击外部关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!panel.contains(e.target) && panel.parentNode) {
                    document.body.removeChild(panel);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 100);
    }

    // 安全的分享处理
    handleSafeShare(platform) {
        const url = window.location.href;
        const title = document.title;

        switch (platform) {
            case '微信':
                alert('请使用微信扫一扫分享');
                break;
            case '微博':
                window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                break;
            case 'QQ':
                window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                break;
            case '复制链接':
                this.copyToClipboard(url);
                break;
        }
    }

    // 安全的剪贴板操作
    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showSafeNotification('链接已复制到剪贴板');
            }).catch(err => {
                console.error('剪贴板操作失败:', err);
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    // 降级剪贴板操作
    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        this.setStyle(textarea, {
            position: 'fixed',
            opacity: '0',
            left: '-9999px'
        });

        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showSafeNotification('链接已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制链接');
        }

        document.body.removeChild(textarea);
    }

    // 安全的通知
    showSafeNotification(message) {
        const notification = this.createElement('div');
        notification.textContent = message;
        this.setStyle(notification, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#67C23A',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            zIndex: '10000'
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // 安全的模态框创建
    createSafeModal(title) {
        const modal = this.createElement('div', 'zhihu-modal');
        this.setStyle(modal, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '9999'
        });

        const contentDiv = this.createElement('div');
        this.setStyle(contentDiv, {
            background: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            position: 'relative'
        });

        const titleElement = this.createElement('h3');
        titleElement.textContent = title;
        this.setStyle(titleElement, {
            margin: '0 0 16px 0',
            color: '#333'
        });

        const closeButton = this.createElement('button');
        closeButton.textContent = '×';
        this.setStyle(closeButton, {
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#999'
        });
        closeButton.addEventListener('click', () => this.closeModal());

        contentDiv.appendChild(titleElement);
        contentDiv.appendChild(closeButton);
        modal.appendChild(contentDiv);

        return modal;
    }

    // 安全的评论表单
    createCommentForm() {
        const form = this.createElement('form');
        this.setStyle(form, {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        });

        const textarea = this.createElement('textarea');
        textarea.placeholder = '写下你的评论...';
        this.setStyle(textarea, {
            width: '100%',
            minHeight: '100px',
            padding: '12px',
            border: '1px solid #EBEEF0',
            borderRadius: '6px',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '14px'
        });

        const buttonContainer = this.createElement('div');
        this.setStyle(buttonContainer, {
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
        });

        const submitButton = this.createElement('button');
        submitButton.textContent = '发表评论';
        submitButton.type = 'submit';
        this.setStyle(submitButton, {
            background: '#0084FF',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
        });

        const cancelButton = this.createElement('button');
        cancelButton.textContent = '取消';
        cancelButton.type = 'button';
        this.setStyle(cancelButton, {
            background: '#F6F6F6',
            color: '#666',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
        });

        buttonContainer.appendChild(submitButton);
        buttonContainer.appendChild(cancelButton);

        form.appendChild(textarea);
        form.appendChild(buttonContainer);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (textarea.value.trim()) {
                this.submitSafeComment(textarea.value);
                this.closeModal();
            }
        });

        cancelButton.addEventListener('click', () => this.closeModal());

        return form;
    }

    // 安全的评论提交
    submitSafeComment(content) {
        console.log('提交评论:', content);
        this.showSafeNotification('评论发表成功！');
    }

    // 关闭模态框
    closeModal() {
        const modal = document.querySelector('.zhihu-modal');
        if (modal && modal.parentNode) {
            document.body.removeChild(modal);
        }
    }

    // 绑定模态框事件
    bindModalEvents(modal) {
        const overlay = modal;
        const closeButton = modal.querySelector('button');

        const close = () => {
            this.closeModal();
        };

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) close();
            });
        }

        if (closeButton) {
            closeButton.addEventListener('click', close);
        }

        // ESC键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                close();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // 安全的目录生成
    generateSafeTOC() {
        const headings = document.querySelectorAll('h1, h2, h3, h4');
        if (headings.length === 0) return;

        const toc = this.createElement('div', 'zhihu-toc');
        this.setStyle(toc, {
            background: 'white',
            border: '1px solid #EBEEF0',
            borderRadius: '8px',
            padding: '16px',
            margin: '20px 0'
        });

        const title = this.createElement('h3');
        title.textContent = '文章目录';
        this.setStyle(title, {
            margin: '0 0 12px 0',
            color: '#333',
            fontSize: '16px'
        });

        const list = this.createElement('ul');
        this.setStyle(list, {
            listStyle: 'none',
            padding: '0',
            margin: '0'
        });

        headings.forEach((heading, index) => {
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            const item = this.createElement('li');
            this.setStyle(item, {
                marginBottom: '8px'
            });

            const link = this.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            this.setStyle(link, {
                color: '#666',
                textDecoration: 'none',
                fontSize: '14px',
                lineHeight: '1.4',
                display: 'block',
                padding: '4px 0',
                borderRadius: '4px',
                transition: 'all 0.2s'
            });

            link.addEventListener('mouseover', () => {
                this.setStyle(link, {
                    color: '#0084FF',
                    background: '#F0F9FF'
                });
            });

            link.addEventListener('mouseout', () => {
                this.setStyle(link, {
                    color: '#666',
                    background: 'transparent'
                });
            });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(heading.id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });

            item.appendChild(link);
            list.appendChild(item);
        });

        toc.appendChild(title);
        toc.appendChild(list);

        // 插入到页面中
        const wrapper = document.querySelector('.zhihu-article-wrapper');
        if (wrapper) {
            const firstChild = wrapper.firstChild;
            wrapper.insertBefore(toc, firstChild);
        }
    }

    // 安全添加Font Awesome
    addSafeFontAwesome() {
        if (!document.querySelector('#font-awesome')) {
            const link = document.createElement('link');
            link.id = 'font-awesome';
            link.rel = 'stylesheet';
            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
            document.head.appendChild(link);
        }
    }

    // 安全的交互绑定
    addSafeInteractions() {
        const buttons = document.querySelectorAll('.zhihu-interaction-btn');
        buttons.forEach(button => {
            if (!button.hasAttribute('data-zhihu-bound')) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleSafeInteraction(button);
                });
                button.setAttribute('data-zhihu-bound', 'true');
            }
        });
    }

    // 安全的样式设置
    setStyle(element, styles) {
        Object.keys(styles).forEach(key => {
            element.style[key] = styles[key];
        });
    }

    // 性能分析
    performanceAnalysis() {
        const metrics = {
            loadTime: performance.now(),
            elements: document.querySelectorAll('*').length,
            images: document.querySelectorAll('img').length,
            links: document.querySelectorAll('a').length,
            title: document.title,
            url: window.location.href
        };

        return {
            metrics,
            score: this.calculatePerformanceScore(metrics),
            recommendations: this.generatePerformanceRecommendations(metrics)
        };
    }

    calculatePerformanceScore(metrics) {
        let score = 100;

        if (metrics.elements > 5000) score -= 10;
        if (metrics.images > 50) score -= 15;
        if (metrics.loadTime > 3000) score -= 20;

        return Math.max(0, score);
    }

    generatePerformanceRecommendations(metrics) {
        const recommendations = [];

        if (metrics.images > 30) {
            recommendations.push('考虑实现图片懒加载');
        }
        if (metrics.elements > 3000) {
            recommendations.push('页面元素较多，建议优化DOM结构');
        }
        if (metrics.loadTime > 2000) {
            recommendations.push('页面加载时间较长，建议优化资源');
        }

        return recommendations;
    }

    // 响应式测试
    responsiveTest() {
        const currentWidth = window.innerWidth;
        return {
            width: currentWidth,
            device: this.getDeviceType(currentWidth),
            breakpoints: {
                mobile: currentWidth <= 640,
                tablet: currentWidth > 640 && currentWidth <= 1024,
                desktop: currentWidth > 1024
            }
        };
    }

    getDeviceType(width) {
        if (width <= 640) return 'Mobile';
        if (width <= 1024) return 'Tablet';
        return 'Desktop';
    }

    // 导出数据
    exportData() {
        return {
            version: this.version,
            url: window.location.href,
            title: document.title,
            performance: this.performanceAnalysis(),
            responsive: this.responsiveTest(),
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
    }

    // 清理功能
    cleanup() {
        // 清理添加的样式
        const styles = document.querySelectorAll('#zhihu-styles');
        styles.forEach(style => {
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        });

        // 清理Font Awesome
        const fontAwesome = document.querySelector('#font-awesome');
        if (fontAwesome && fontAwesome.parentNode) {
            fontAwesome.parentNode.removeChild(fontAwesome);
        }

        console.log('清理完成');
    }
}

// 创建全局实例
window.ZhihuSafeTools = new ZhihuSafeTransformationTools();

// 控制台命令
window.zhihuSafe = {
    transform: () => ZhihuSafeTools.safeTransform(),
    performance: () => ZhihuSafeTools.performanceAnalysis(),
    responsive: () => ZhihuSafeTools.responsiveTest(),
    export: () => ZhihuSafeTools.exportData(),
    cleanup: () => ZhihuSafeTools.cleanup()
};

console.log(`
🛡️ 知乎风格安全转换工具已加载！

可用安全命令:
  zhihuSafe.transform()      - 安全的一键转换
  zhihuSafe.performance()    - 性能分析
  zhihuSafe.responsive()     - 响应式测试
  zhihuSafe.export()         - 导出数据
  zhihuSafe.cleanup()        - 清理转换

安全特性:
  ✅ 完全避免innerHTML使用
  ✅ 安全的DOM操作方法
  ✅ XSS防护机制
  ✅ 安全的样式设置
  ✅ 安全的事件绑定
  ✅ 安全的剪贴板操作

使用示例:
  zhihuSafe.transform()
  const perf = zhihuSafe.performance()
  console.log(perf)

如需完全清理转换结果:
  zhihuSafe.cleanup()
`);

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZhihuSafeTransformationTools;
}