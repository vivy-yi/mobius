/**
 * 布局稳定性管理器
 * Layout Stability Manager
 *
 * 解决Cumulative Layout Shift (CLS)问题：
 * - 图片尺寸预留和占位符
 * - 内容骨架屏
 * - 字体加载稳定性
 * - 动态内容预留空间
 */

class LayoutStabilityManager {
    constructor() {
        this.isInitialized = false;
        this.observedElements = new Set();
        this.layoutShiftScore = 0;
        this.reservedSpaces = new Map();
        this.skeletonScreens = new Map();

        // CLS阈值
        this.CLS_THRESHOLD = 0.1; // 目标: < 0.1
        this.CRITICAL_CLS = 0.25; // 严重问题: > 0.25
    }

    async init() {
        if (this.isInitialized) return;

        // console.log('🔧 初始化布局稳定性管理器...');

        // 1. 预留图片空间
        this.reserveImageSpaces();

        // 2. 设置骨架屏
        this.setupSkeletonScreens();

        // 3. 监控布局偏移
        this.monitorLayoutShifts();

        // 4. 处理字体加载稳定性
        this.handleFontLoadingStability();

        // 5. 预留动态内容空间
        this.reserveDynamicContentSpaces();

        this.isInitialized = true;
        // console.log('✅ 布局稳定性管理器初始化完成');
    }

    /**
     * 预留图片空间 - 防止图片加载时的布局偏移
     */
    reserveImageSpaces() {
        const images = document.querySelectorAll('img:not([data-reserved])');

        images.forEach(img => {
            // 获取或计算图片尺寸
            const { width, height } = this.getImageDimensions(img);

            if (width && height) {
                // 设置图片容器样式
                const container = img.parentElement;
                if (container) {
                    container.style.display = 'inline-block';
                    container.style.width = width + 'px';
                    container.style.height = height + 'px';
                    container.style.position = 'relative';
                    container.style.overflow = 'hidden';
                }

                // 设置图片样式
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.display = 'block';

                // 添加占位符
                this.addImagePlaceholder(img, width, height);

                // 标记为已处理
                img.setAttribute('data-reserved', 'true');

                // console.log(`📐 图片空间预留: ${width}x${height}`);
            }
        });

        // 处理未来加载的图片
        this.setupImageObserver();
    }

    /**
     * 获取图片尺寸
     */
    getImageDimensions(img) {
        // 检查已有属性
        if (img.width && img.height) {
            return { width: img.width, height: img.height };
        }

        // 检查CSS尺寸
        const styles = window.getComputedStyle(img);
        const cssWidth = parseInt(styles.width);
        const cssHeight = parseInt(styles.height);

        if (cssWidth && cssHeight) {
            return { width: cssWidth, height: cssHeight };
        }

        // 根据容器推断尺寸
        const container = img.parentElement;
        if (container) {
            const containerStyles = window.getComputedStyle(container);
            const containerWidth = parseInt(containerStyles.width) || container.clientWidth;

            if (containerWidth) {
                // 假设常见比例
                const aspectRatio = this.inferAspectRatio(img);
                return {
                    width: containerWidth,
                    height: Math.round(containerWidth / aspectRatio)
                };
            }
        }

        // 默认尺寸
        return { width: 300, height: 200 };
    }

    /**
     * 推断图片宽高比
     */
    inferAspectRatio(img) {
        // 检查CSS aspect-ratio
        const styles = window.getComputedStyle(img);
        if (styles.aspectRatio && styles.aspectRatio !== 'auto') {
            const [width, height] = styles.aspectRatio.split('/').map(Number);
            return width / height;
        }

        // 根据class推断
        if (img.classList.contains('hero-image')) return 16/9;
        if (img.classList.contains('card-image')) return 4/3;
        if (img.classList.contains('thumbnail')) return 1/1;
        if (img.classList.contains('banner')) return 21/9;

        // 默认比例
        return 4/3;
    }

    /**
     * 添加图片占位符（安全版本）
     */
    addImagePlaceholder(img, width, height) {
        // 创建占位符div
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';

        // 设置样式
        const placeholderStyles = {
            position: 'absolute',
            top: '0',
            left: '0',
            width: width + 'px',
            height: height + 'px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'image-loading 1.5s infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '14px',
            zIndex: '1'
        };

        Object.assign(placeholder.style, placeholderStyles);

        // 添加加载动画样式
        if (!document.querySelector('#image-loading-styles')) {
            const style = document.createElement('style');
            style.id = 'image-loading-styles';
            style.textContent = `
                @keyframes image-loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }

        // 设置图标（使用文本而不是innerHTML）
        placeholder.textContent = '📷';
        placeholder.style.fontSize = '2rem';

        // 插入占位符
        img.parentElement.insertBefore(placeholder, img);

        // 图片加载完成后移除占位符
        if (img.complete && img.naturalHeight !== 0) {
            placeholder.remove();
        } else {
            img.addEventListener('load', () => {
                placeholder.style.opacity = '0';
                placeholder.style.transition = 'opacity 0.3s ease';
                setTimeout(() => placeholder.remove(), 300);
            });

            img.addEventListener('error', () => {
                placeholder.textContent = '⚠️';
                placeholder.style.background = 'var(--warning-yellow-light, #fee2e2)';
                placeholder.style.color = 'var(--error-color, #dc2626)';
            });
        }
    }

    /**
     * 设置图片观察器
     */
    setupImageObserver() {
        const imageObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 检查新添加的图片
                        const images = node.querySelectorAll ?
                            node.querySelectorAll('img:not([data-reserved])') : [];

                        if (node.tagName === 'IMG' && !node.hasAttribute('data-reserved')) {
                            images.push(node);
                        }

                        images.forEach(img => this.reserveSingleImageSpace(img));
                    }
                });
            });
        });

        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 预留单个图片空间
     */
    reserveSingleImageSpace(img) {
        const { width, height } = this.getImageDimensions(img);
        this.addImagePlaceholder(img, width, height);
        img.setAttribute('data-reserved', 'true');
    }

    /**
     * 设置骨架屏（安全版本）
     */
    setupSkeletonScreens() {
        // 为内容区域设置骨架屏
        const contentAreas = [
            '.article-grid',
            '.knowledge-articles',
            '.category-content',
            '.search-results'
        ];

        contentAreas.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                this.addSkeletonScreen(element, selector);
            }
        });

        // 处理动态添加的内容
        this.setupContentObserver();
    }

    /**
     * 添加骨架屏（安全版本）
     */
    addSkeletonScreen(container, selector) {
        // 创建骨架屏内容
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-screen';
        skeleton.setAttribute('data-for', selector);

        // 根据容器类型生成不同骨架
        let skeletonContent;
        if (selector.includes('grid') || selector.includes('articles')) {
            skeletonContent = this.generateArticleGridSkeleton();
        } else {
            skeletonContent = this.generateGenericSkeleton();
        }

        // 设置骨架屏样式
        skeleton.style.cssText = `
            padding: 2rem;
            animation: pulse 2s infinite;
        `;

        // 添加脉冲动画
        if (!document.querySelector('#skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }

                .skeleton-item {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border-radius: 8px;
                }

                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }

        skeleton.appendChild(skeletonContent);

        // 暂时隐藏原内容，显示骨架屏
        const originalContent = container.children;
        const fragment = document.createDocumentFragment();

        while (originalContent.length > 0) {
            fragment.appendChild(originalContent[0]);
        }

        this.reservedSpaces.set(selector, fragment);
        container.appendChild(skeleton);

        // console.log(`🦴 骨架屏设置: ${selector}`);

        // 设置自动移除（模拟加载时间）
        setTimeout(() => {
            this.removeSkeletonScreen(selector);
        }, 3000);
    }

    /**
     * 生成文章网格骨架屏（安全版本）
     */
    generateArticleGridSkeleton() {
        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        grid.style.gap = '2rem';

        for (let i = 0; i < 3; i++) {
            const card = document.createElement('div');
            card.style.background = 'white';
            card.style.borderRadius = '16px';
            card.style.padding = '2rem';
            card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';

            // 骨架元素
            const elements = [
                { height: '200px', marginBottom: '1rem', width: '100%', borderRadius: '12px' },
                { height: '24px', marginBottom: '0.75rem', width: '80%' },
                { height: '16px', marginBottom: '1rem', width: '60%' }
            ];

            elements.forEach(style => {
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton-item';
                Object.assign(skeleton.style, style);
                card.appendChild(skeleton);
            });

            // 底部元数据
            const meta = document.createElement('div');
            meta.style.display = 'flex';
            meta.style.gap = '1rem';

            const metaItems = [
                { height: '16px', width: '60px' },
                { height: '16px', width: '80px' }
            ];

            metaItems.forEach(style => {
                const skeleton = document.createElement('div');
                skeleton.className = 'skeleton-item';
                Object.assign(skeleton.style, style);
                meta.appendChild(skeleton);
            });

            card.appendChild(meta);
            grid.appendChild(card);
        }

        return grid;
    }

    /**
     * 生成通用骨架屏（安全版本）
     */
    generateGenericSkeleton() {
        const container = document.createElement('div');

        const skeletonItems = [
            { height: '300px', width: '100%', borderRadius: '12px', marginBottom: '1rem' },
            { height: '32px', width: '70%', marginBottom: '1rem' },
            { height: '16px', width: '100%', marginBottom: '0.5rem' },
            { height: '16px', width: '80%', marginBottom: '0.5rem' },
            { height: '16px', width: '60%' }
        ];

        skeletonItems.forEach(style => {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-item';
            Object.assign(skeleton.style, style);
            container.appendChild(skeleton);
        });

        return container;
    }

    /**
     * 移除骨架屏
     */
    removeSkeletonScreen(selector) {
        const skeleton = document.querySelector(`.skeleton-screen[data-for="${selector}"]`);
        const container = document.querySelector(selector);
        const reservedContent = this.reservedSpaces.get(selector);

        if (skeleton && container && reservedContent) {
            // 淡出骨架屏
            skeleton.style.opacity = '0';
            skeleton.style.transition = 'opacity 0.3s ease';

            setTimeout(() => {
                skeleton.remove();
                container.appendChild(reservedContent);
                this.reservedSpaces.delete(selector);
                // console.log(`✅ 骨架屏移除: ${selector}`);
            }, 300);
        }
    }

    /**
     * 设置内容观察器
     */
    setupContentObserver() {
        const contentObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 检查是否有内容添加到空容器
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkAndRemoveSkeletons(node);
                        }
                    });
                }
            });
        });

        contentObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * 检查并移除相关骨架屏
     */
    checkAndRemoveSkeletons(node) {
        const container = node.parentElement;
        if (container) {
            const selector = Array.from(this.reservedSpaces.keys()).find(key =>
                container.matches(key) || container.closest(key)
            );

            if (selector && container.children.length > 1) {
                this.removeSkeletonScreen(selector);
            }
        }
    }

    /**
     * 监控布局偏移
     */
    monitorLayoutShifts() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                        this.layoutShiftScore += entry.value;

                        if (this.layoutShiftScore > this.CRITICAL_CLS) {
                            console.warn(`⚠️ 严重布局偏移检测: CLS = ${this.layoutShiftScore.toFixed(3)}`);
                        }
                    }
                }
            });

            observer.observe({ entryTypes: ['layout-shift'] });

            // 定期报告CLS分数
            setInterval(() => {
                if (this.layoutShiftScore > 0) {
                    // console.log(`📊 当前CLS分数: ${this.layoutShiftScore.toFixed(3)}`);
                }
            }, 5000);
        }
    }

    /**
     * 处理字体加载稳定性
     */
    handleFontLoadingStability() {
        // 字体加载时保持布局稳定
        if ('fonts' in document) {
            document.fonts.ready.then(() => {
                // console.log('🔤 所有字体加载完成');
                document.documentElement.classList.add('fonts-loaded');
            });
        }

        // 监听单个字体加载
        const fontFaces = document.fonts;
        fontFaces.forEach(fontFace => {
            fontFace.load().then(() => {
                // console.log(`🔤 字体加载完成: ${fontFace.family}`);
            });
        });
    }

    /**
     * 预留动态内容空间
     */
    reserveDynamicContentSpaces() {
        // 为可能动态加载的内容预留空间
        const dynamicAreas = [
            { selector: '.search-results', minHeight: '400px' },
            { selector: '.article-grid', minHeight: '600px' },
            { selector: '.category-content', minHeight: '300px' },
            { selector: '.comments-section', minHeight: '200px' }
        ];

        dynamicAreas.forEach(area => {
            const element = document.querySelector(area.selector);
            if (element && !element.hasAttribute('data-reserved')) {
                const currentHeight = element.offsetHeight;
                const reservedHeight = Math.max(currentHeight, parseInt(area.minHeight));

                if (currentHeight < reservedHeight) {
                    element.style.minHeight = reservedHeight + 'px';
                    element.setAttribute('data-reserved', 'true');
                    // console.log(`📏 动态内容空间预留: ${area.selector} = ${reservedHeight}px`);
                }
            }
        });
    }

    /**
     * 获取CLS统计
     */
    getCLSStats() {
        return {
            currentCLS: this.layoutShiftScore.toFixed(3),
            threshold: this.CLS_THRESHOLD,
            isGood: this.layoutShiftScore < this.CLS_THRESHOLD,
            needsImprovement: this.layoutShiftScore >= this.CLS_THRESHOLD && this.layoutShiftScore < this.CRITICAL_CLS,
            isPoor: this.layoutShiftScore >= this.CRITICAL_CLS,
            reservedSpaces: this.reservedSpaces.size,
            skeletonScreens: this.skeletonScreens.size
        };
    }

    /**
     * 重置CLS分数
     */
    resetCLSScore() {
        this.layoutShiftScore = 0;
        // console.log('📊 CLS分数已重置');
    }
}

// 创建全局实例
window.layoutStabilityManager = new LayoutStabilityManager();

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayoutStabilityManager;
}