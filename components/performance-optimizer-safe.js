/**
 * 安全的性能优化器 - Safe Performance Optimizer
 * 包含懒加载、图片优化、代码分割、缓存策略等功能
 * 使用安全的DOM方法，避免XSS漏洞
 */

class SafePerformanceOptimizer {
    constructor() {
        this.isInitialized = false;
        this.options = {
            lazyLoadImages: true,
            preloadCriticalResources: true,
            enableServiceWorker: false,
            cacheStrategy: 'memory'
        };

        // 性能监控
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            interactionTime: 0
        };
    }

    init() {
        if (this.isInitialized) return;

        console.log('初始化安全性能优化器...');

        this.measurePerformance();
        this.initLazyLoading();
        this.preloadCriticalResources();
        this.optimizeScroll();
        this.setupIntersectionObserver();

        this.isInitialized = true;
        console.log('安全性能优化器初始化完成');
    }

    /**
     * 性能测量
     */
    measurePerformance() {
        // 页面加载时间
        window.addEventListener('load', () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;

            console.log('页面加载时间:', this.metrics.loadTime + 'ms');
        });

        // 首次内容绘制
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        this.metrics.renderTime = entry.startTime;
                        console.log('首次内容绘制时间:', this.metrics.renderTime + 'ms');
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        }
    }

    /**
     * 初始化图片懒加载
     */
    initLazyLoading() {
        if (!this.options.lazyLoadImages) return;

        const images = document.querySelectorAll('.zhihu-article-body img');

        // 检查是否原生支持懒加载
        if ('loading' in HTMLImageElement.prototype) {
            images.forEach(img => {
                img.loading = 'lazy';
                img.classList.add('lazy-native');
            });
            console.log('使用原生图片懒加载');
            return;
        }

        // 使用Intersection Observer实现懒加载
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            images.forEach(img => {
                // 保存原始src
                if (!img.dataset.src) {
                    img.dataset.src = img.src;
                    img.src = this.createPlaceholderDataUrl();
                }
                imageObserver.observe(img);
            });

            console.log('使用Intersection Observer实现懒加载');
        } else {
            // 降级方案：立即加载所有图片
            images.forEach(img => this.loadImage(img));
            console.log('降级为立即加载图片');
        }
    }

    /**
     * 创建安全的数据URL占位符
     */
    createPlaceholderDataUrl() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
    }

    /**
     * 安全加载图片
     */
    loadImage(img) {
        return new Promise((resolve, reject) => {
            const tempImg = new Image();
            const src = img.dataset.src || img.src;

            tempImg.onload = () => {
                img.src = src;
                img.classList.add('loaded');
                img.classList.remove('loading');
                resolve();
            };

            tempImg.onerror = () => {
                img.classList.add('error');
                this.createImagePlaceholder(img);
                reject(new Error(`Failed to load image: ${src}`));
            };

            img.classList.add('loading');
            tempImg.src = src;
        });
    }

    /**
     * 创建安全的图片占位符
     */
    createImagePlaceholder(originalImg) {
        const placeholder = document.createElement('div');
        placeholder.className = 'zhihu-image-placeholder';
        placeholder.style.width = originalImg.width + 'px';
        placeholder.style.height = originalImg.height + 'px';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'zhihu-image-error';

        const icon = document.createElement('i');
        icon.className = 'fas fa-image';

        const text = document.createElement('span');
        text.textContent = '图片加载失败';

        errorDiv.appendChild(icon);
        errorDiv.appendChild(text);
        placeholder.appendChild(errorDiv);

        originalImg.parentNode.insertBefore(placeholder, originalImg);
    }

    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        if (!this.options.preloadCriticalResources) return;

        // 预加载关键CSS
        this.preloadResource('/components/zhihu-article.css', 'style');
        this.preloadResource('/components/zhihu-mobile.css', 'style');

        console.log('关键资源预加载完成');
    }

    /**
     * 安全预加载资源
     */
    preloadResource(url, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = url;
        link.as = as;

        document.head.appendChild(link);
    }

    /**
     * 优化滚动性能
     */
    optimizeScroll() {
        let ticking = false;

        const updateScroll = () => {
            this.updateScrollPosition();
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
        window.addEventListener('resize', requestTick, { passive: true });
    }

    /**
     * 更新滚动位置
     */
    updateScrollPosition() {
        // 更新阅读进度
        this.updateReadingProgress();

        // 更新目录高亮
        if (window.TocGenerator && window.TocGenerator.updateActiveToc) {
            window.TocGenerator.updateActiveToc();
        }
    }

    /**
     * 更新阅读进度
     */
    updateReadingProgress() {
        const progressBar = document.querySelector('.zhihu-reading-progress-bar');
        if (!progressBar) return;

        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;

        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    /**
     * 设置Intersection Observer
     */
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        // 观察相关文章
        const relatedItems = document.querySelectorAll('.zhihu-related-item');
        if (relatedItems.length > 0) {
            const interactionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('zhihu-animate-in');
                    }
                });
            }, {
                threshold: 0.1
            });

            relatedItems.forEach(item => {
                interactionObserver.observe(item);
            });
        }
    }

    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * 获取性能报告
     */
    getPerformanceReport() {
        return {
            metrics: this.metrics,
            options: this.options,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * 获取优化建议
     */
    getRecommendations() {
        const recommendations = [];

        if (this.metrics.loadTime > 3000) {
            recommendations.push('页面加载时间较长，建议优化图片大小');
        }

        if (this.metrics.renderTime > 1000) {
            recommendations.push('首次内容绘制时间较长，建议优化CSS');
        }

        const imageCount = document.querySelectorAll('.zhihu-article-body img').length;
        if (imageCount > 10) {
            recommendations.push('图片数量较多，建议使用懒加载');
        }

        return recommendations;
    }
}

// 创建全局实例
window.SafePerformanceOptimizer = new SafePerformanceOptimizer();

// 安全的性能优化CSS（使用textContent而不是innerHTML）
const performanceStyles = document.createElement('style');
performanceStyles.textContent = `
    /* 图片懒加载样式 */
    .zhihu-article-body img.loading {
        opacity: 0.7;
        filter: blur(1px);
        transition: opacity 0.3s ease, filter 0.3s ease;
    }

    .zhihu-article-body img.loaded {
        opacity: 1;
        filter: blur(0);
    }

    .zhihu-article-body img.error {
        display: none;
    }

    /* 图片占位符 */
    .zhihu-image-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--zhihu-bg-secondary, #F6F6F6);
        color: var(--zhihu-gray-secondary, #8590A6);
        font-size: var(--zhihu-font-size-small, 14px);
    }

    .zhihu-image-error {
        text-align: center;
        flex-direction: column;
        gap: 8px;
    }

    .zhihu-image-error i {
        font-size: 24px;
        margin-bottom: var(--zhihu-spacing-sm, 8px);
    }

    /* 动画延迟 */
    .zhihu-animate-in {
        animation: zhihu-slideInUp 0.5s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes zhihu-slideInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(performanceStyles);

// 页面加载完成后初始化性能优化器
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.SafePerformanceOptimizer.init();
    });
} else {
    window.SafePerformanceOptimizer.init();
}