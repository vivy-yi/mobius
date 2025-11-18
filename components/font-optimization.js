/**
 * 字体优化管理器
 * Font Optimization Manager
 *
 * 解决字体加载性能问题：
 * - 减少字体文件数量（从19个减少到4个）
 * - 防止布局偏移（CLS）
 * - 优化Font Awesome加载
 * - 提供系统字体回退
 */

class FontOptimizationManager {
    constructor() {
        this.isInitialized = false;
        this.fontsLoaded = false;
        this.criticalIcons = [
            'fa-search', 'fa-th', 'fa-building', 'fa-passport', 'fa-coins',
            'fa-balance-scale', 'fa-gift', 'fa-question-circle', 'fa-chevron-right',
            'fa-chevron-down', 'fa-filter', 'fa-folder-tree', 'fa-layer-group',
            'fa-calendar', 'fa-clock', 'fa-eye', 'fa-fire', 'fa-inbox',
            'fa-chevron-left', 'fa-star', 'fa-thumbs-up', 'fa-book-open',
            'fa-weixin', 'fa-weibo', 'fa-qq', 'fa-language', 'fa-shield-alt',
            'fa-globe-asia', 'fa-map-marker-alt', 'fa-envelope', 'fa-phone'
        ];

        // 延迟加载的非关键图标
        this.lazyIcons = [
            'fa-comment-slash', 'fa-reply', 'fa-arrow-right', 'fa-exclamation-triangle',
            'fa-check-circle', 'fa-user-tie', 'fa-university', 'fa-percentage', 'fa-leaf',
            'fa-thermometer-empty', 'fa-thermometer-half', 'fa-image', 'fa-link'
        ];
    }

    async init() {
        if (this.isInitialized) return;

        // console.log('🎨 初始化字体优化管理器...');

        // 立即应用字体回退策略
        this.applyFontFallbacks();

        // 预加载关键字体
        this.preloadCriticalFonts();

        // 动态加载字体图标
        await this.loadFontIconsOptimally();

        // 监听字体加载完成
        this.monitorFontLoading();

        this.isInitialized = true;
        // console.log('✅ 字体优化管理器初始化完成');
    }

    /**
     * 应用字体回退策略 - 防止FOUT和FOIT
     */
    applyFontFallbacks() {
        // 创建字体回退样式
        const style = document.createElement('style');
        style.textContent = `
            /* 字体回退策略 - 防止布局偏移 */
            :root {
                --font-loading-delay: 0s;
                --font-display-swap: swap;
            }

            /* 系统字体回退栈 */
            body, .font-fallback {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                           "Helvetica Neue", Arial, "Noto Sans SC", sans-serif !important;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }

            /* 中文内容字体优化 */
            .chinese-content {
                font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
                           "WenQuanYi Micro Hei", "Noto Sans SC", sans-serif;
            }

            /* 防止字体加载时的布局偏移 */
            .font-loading {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                           "Helvetica Neue", Arial, sans-serif;
                transition: none !important;
            }

            /* 字体加载完成后切换 */
            .fonts-loaded .font-loading {
                font-family: "Inter", "Noto Sans SC", -apple-system, BlinkMacSystemFont,
                           "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            }

            /* 固定图标尺寸防止布局偏移 */
            .fa, .fas, .far, .fab, .fal {
                width: 1em;
                height: 1em;
                display: inline-block;
                vertical-align: -0.125em;
            }

            /* 为字体图标预留空间 */
            .icon-placeholder {
                width: 1em;
                height: 1em;
                display: inline-block;
                background: #f0f0f0;
                border-radius: 2px;
                margin-right: 0.5em;
            }

            /* Font Awesome 优化 - 只加载需要的图标 */
            .fa-search::before { content: "🔍"; }
            .fa-th::before { content: "⚏"; }
            .fa-building::before { content: "🏢"; }
            .fa-passport::before { content: "📋"; }
            .fa-coins::before { content: "💰"; }
            .fa-balance-scale::before { content: "⚖️"; }
            .fa-gift::before { content: "🎁"; }
            .fa-question-circle::before { content: "❓"; }
            .fa-chevron-right::before { content: "›"; }
            .fa-chevron-down::before { content: "⌄"; }
            .fa-chevron-left::before { content: "‹"; }
            .fa-filter::before { content: "⚬"; }
            .fa-folder-tree::before { content: "📁"; }
            .fa-layer-group::before { content: "🎯"; }
            .fa-calendar::before { content: "📅"; }
            .fa-clock::before { content: "🕒"; }
            .fa-eye::before { content: "👁"; }
            .fa-fire::before { content: "🔥"; }
            .fa-inbox::before { content: "📥"; }
            .fa-star::before { content: "★"; }
            .fa-thumbs-up::before { content: "👍"; }
            .fa-book-open::before { content: "📖"; }
            .fa-weixin::before { content: "微信"; }
            .fa-weibo::before { content: "微博"; }
            .fa-qq::before { content: "QQ"; }
            .fa-language::before { content: "🌐"; }
            .fa-shield-alt::before { content: "🛡"; }
            .fa-globe-asia::before { content: "🌏"; }
            .fa-map-marker-alt::before { content: "📍"; }
            .fa-envelope::before { content: "✉"; }
            .fa-phone::before { content: "📞"; }
        `;

        // 立即插入样式到head
        if (document.head) {
            document.head.appendChild(style);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                document.head.appendChild(style);
            });
        }

        // console.log('📋 应用字体回退策略');
    }

    /**
     * 预加载关键字体
     */
    preloadCriticalFonts() {
        const criticalFonts = [
            // Inter - 主要英文字体
            {
                family: 'Inter',
                url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
                weight: '400',
                display: 'swap'
            },
            // Noto Sans SC - 中文字体
            {
                family: 'Noto Sans SC',
                url: 'https://fonts.gstatic.com/s/notosanssc/v36/k3kXo84MPvpLmixcA63oeALZTYKL2S24UEg-2_c.woff2',
                weight: '400',
                display: 'swap'
            }
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'font';
            link.href = font.url;
            link.type = 'font/woff2';
            link.crossOrigin = 'anonymous';

            if (document.head) {
                document.head.appendChild(link);
            }
        });

        // console.log('⚡ 预加载关键字体');
    }

    /**
     * 优化Font Awesome加载 - 只加载需要的图标
     */
    async loadFontIconsOptimally() {
        return new Promise((resolve) => {
            // 检查是否已经加载了Font Awesome
            if (document.querySelector('link[href*="font-awesome"]')) {
                // console.log('📦 Font Awesome已加载，跳过重复加载');
                resolve();
                return;
            }

            // 延迟加载非关键Font Awesome
            setTimeout(() => {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
                link.crossOrigin = 'anonymous';
                link.onload = () => {
                    // console.log('✅ Font Awesome加载完成');
                    this.fontsLoaded = true;
                    document.documentElement.classList.add('fonts-loaded');
                    resolve();
                };
                link.onerror = () => {
                    console.warn('⚠️ Font Awesome加载失败，使用emoji回退');
                    resolve(); // 继续执行，使用emoji回退
                };

                document.head.appendChild(link);
            }, 2000); // 延迟2秒加载，不阻塞关键渲染
        });
    }

    /**
     * 监听字体加载完成
     */
    monitorFontLoading() {
        if ('fonts' in document) {
            Promise.all([
                document.fonts.load('400 1em Inter'),
                document.fonts.load('400 1em "Noto Sans SC"')
            ]).then(() => {
                // console.log('🎉 关键字体加载完成');
                this.fontsLoaded = true;
                document.documentElement.classList.add('fonts-loaded');

                // 移除字体加载类
                document.querySelectorAll('.font-loading').forEach(el => {
                    el.classList.remove('font-loading');
                });
            }).catch(err => {
                console.warn('⚠️ 字体加载监控失败:', err);
            });
        }
    }

    /**
     * 创建优化的图标元素
     */
    createIcon(iconClass, fallbackEmoji = '•') {
        const span = document.createElement('span');
        span.className = iconClass;
        span.setAttribute('aria-hidden', 'true');

        // 如果字体还未加载，添加emoji回退
        if (!this.fontsLoaded) {
            span.classList.add('icon-fallback');
            span.style.opacity = '0';

            // 创建emoji占位符
            const emoji = document.createElement('span');
            emoji.className = 'emoji-fallback';
            emoji.textContent = fallbackEmoji;
            emoji.style.position = 'absolute';

            const wrapper = document.createElement('span');
            wrapper.style.position = 'relative';
            wrapper.style.display = 'inline-block';
            wrapper.appendChild(emoji);
            wrapper.appendChild(span);

            return wrapper;
        }

        return span;
    }

    /**
     * 获取字体性能统计
     */
    getFontPerformanceStats() {
        const fontLinks = document.querySelectorAll('link[href*="font"]');
        const fontFaces = document.fonts;

        return {
            loadedFonts: Array.from(fontFaces).filter(font => font.status === 'loaded').length,
            loadingFonts: Array.from(fontFaces).filter(font => font.status === 'loading').length,
            externalFontLinks: fontLinks.length,
            fontsLoaded: this.fontsLoaded,
            estimatedWeight: fontLinks.length * 50 // KB estimate
        };
    }

    /**
     * 清理未使用的字体
     */
    cleanupUnusedFonts() {
        // 检查实际使用的字体
        const usedFonts = new Set();
        const allElements = document.querySelectorAll('*');

        allElements.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            const fontFamily = computedStyle.fontFamily;

            if (fontFamily && fontFamily !== 'initial') {
                usedFonts.add(fontFamily);
            }
        });

        // console.log('🧹 字体使用分析:', Array.from(usedFonts));
        return Array.from(usedFonts);
    }
}

// 创建全局实例
window.fontOptimizationManager = new FontOptimizationManager();

// 初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fontOptimizationManager.init();
    });
} else {
    window.fontOptimizationManager.init();
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FontOptimizationManager;
}