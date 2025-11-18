/**
 * 智能脚本加载器
 * Smart Script Loader
 *
 * 优化JavaScript加载顺序：
 * - 关键脚本优先加载
 * - 非关键脚本延迟加载
 * - 代码分割和异步加载
 * - 错误处理和重试机制
 */

class SmartScriptLoader {
    constructor() {
        this.isInitialized = false;
        this.loadedScripts = new Set();
        this.loadingScripts = new Map();
        this.scriptQueue = [];
        this.criticalScripts = [
            'components/components.js',  // 组件系统
            'components/cache-manager.js', // 缓存管理
            'components/session-manager.js' // 会话管理
        ];

        this.importantScripts = [
            'components/knowledge-navigation.js', // 导航功能
            'components/article-card.js', // 文章卡片
            'components/knowledge-filter.js' // 筛选功能
        ];

        this.nonCriticalScripts = [
            'script.js', // 主要交互
            'components/performance-optimizer-safe.js', // 性能优化
            'components/seo-accessibility.js' // SEO和可访问性（移到最后，降级处理）
        ];
    }

    async init() {
        if (this.isInitialized) return;

        console.log('🚀 初始化智能脚本加载器...');

        // 按优先级加载脚本
        await this.loadCriticalScripts();
        await this.loadImportantScripts();
        await this.loadNonCriticalScripts();

        this.isInitialized = true;
        console.log('✅ 所有脚本加载完成');
    }

    /**
     * 加载关键脚本（同步，必须首先加载）
     */
    async loadCriticalScripts() {
        console.log('⚡ 加载关键脚本...');

        for (const script of this.criticalScripts) {
            await this.loadScript(script, { priority: 'critical', async: false });
        }
    }

    /**
     * 加载重要脚本（高优先级异步）
     */
    async loadImportantScripts() {
        console.log('🔥 加载重要脚本...');

        // 使用Promise.all并行加载重要脚本
        const promises = this.importantScripts.map(script =>
            this.loadScript(script, { priority: 'important', async: true })
        );

        await Promise.all(promises);
    }

    /**
     * 加载非关键脚本（低优先级，延迟加载）
     */
    async loadNonCriticalScripts() {
        console.log('📦 加载非关键脚本...');

        // 等待页面空闲后加载
        if ('requestIdleCallback' in window) {
            await new Promise(resolve => {
                requestIdleCallback(async () => {
                    for (const script of this.nonCriticalScripts) {
                        await this.loadScript(script, { priority: 'low', async: true });
                    }
                    resolve();
                });
            });
        } else {
            // 降级到setTimeout延迟加载
            await new Promise(resolve => setTimeout(resolve, 1000));

            for (const script of this.nonCriticalScripts) {
                await this.loadScript(script, { priority: 'low', async: true });
            }
        }
    }

    /**
     * 加载单个脚本
     */
    loadScript(src, options = {}) {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (this.loadedScripts.has(src)) {
                console.log(`📋 脚本已加载: ${src}`);
                resolve();
                return;
            }

            // 检查是否正在加载
            if (this.loadingScripts.has(src)) {
                console.log(`⏳ 等待脚本加载: ${src}`);
                this.loadingScripts.get(src).then(resolve).catch(reject);
                return;
            }

            console.log(`📥 加载脚本: ${src} (优先级: ${options.priority})`);

            const loadPromise = this.createScriptElement(src, options)
                .then(() => {
                    this.loadedScripts.add(src);
                    this.loadingScripts.delete(src);
                    console.log(`✅ 脚本加载成功: ${src}`);
                    resolve();
                })
                .catch(err => {
                    this.loadingScripts.delete(src);
                    console.error(`❌ 脚本加载失败: ${src}`, err);

                    // 关键脚本失败时重试
                    if (options.priority === 'critical') {
                        console.log(`🔄 重试加载关键脚本: ${src}`);
                        setTimeout(() => {
                            this.loadScript(src, options).then(resolve).catch(reject);
                        }, 1000);
                    } else {
                        resolve(); // 非关键脚本失败不阻塞
                    }
                });

            this.loadingScripts.set(src, loadPromise);
        });
    }

    /**
     * 创建脚本元素
     */
    createScriptElement(src, options) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = this.addVersion(src);

            // 设置加载属性
            if (options.async) {
                script.async = true;
            } else {
                script.async = false; // 关键脚本按顺序执行
                script.defer = false;
            }

            // 设置完整性检查（如果可用）
            if (options.integrity) {
                script.integrity = options.integrity;
                script.crossOrigin = 'anonymous';
            }

            // 错误处理
            script.onload = () => resolve();
            script.onerror = () => {
                console.warn(`⚠️ 脚本加载失败，继续执行: ${src}`);
                resolve(); // 非关键脚本失败不阻塞
            };

            // 添加错误监控
            script.addEventListener('error', (e) => {
                console.warn(`⚠️ 脚本执行错误: ${src}`, e);
                // 对于SEO组件等非关键脚本，不抛出异常
                if (!src.includes('seo-accessibility')) {
                    reject(new Error(`Script execution failed: ${src}`));
                }
            });

            // 插入到DOM
            if (options.priority === 'critical') {
                // 关键脚本插入到head中
                document.head.appendChild(script);
            } else {
                // 非关键脚本插入到body末尾
                document.body.appendChild(script);
            }
        });
    }

    /**
     * 添加版本号防止缓存
     */
    addVersion(src) {
        const versionMap = {
            'components/components.js': 'v=2.1',
            'components/knowledge-navigation.js': 'v=4.3',
            'components/knowledge-filter.js': 'v=2.2',
            'components/article-card.js': 'v=2.1',
            'script.js': 'v=2.2'
        };

        const separator = src.includes('?') ? '&' : '?';
        const version = versionMap[src] || `v=${Date.now()}`;

        return `${src}${separator}${version}`;
    }

    /**
     * 预加载脚本（不立即执行）
     */
    preloadScript(src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = this.addVersion(src);
        document.head.appendChild(link);

        console.log(`🎯 预加载脚本: ${src}`);
    }

    /**
     * 延迟加载脚本模块
     */
    async loadModule(moduleName, src) {
        try {
            console.log(`📦 加载模块: ${moduleName}`);
            await this.loadScript(src, { priority: 'low', async: true });
            console.log(`✅ 模块加载成功: ${moduleName}`);
            return true;
        } catch (error) {
            console.error(`❌ 模块加载失败: ${moduleName}`, error);
            return false;
        }
    }

    /**
     * 获取加载统计
     */
    getLoadingStats() {
        return {
            loadedScripts: this.loadedScripts.size,
            loadingScripts: this.loadingScripts.size,
            totalCritical: this.criticalScripts.length,
            totalImportant: this.importantScripts.length,
            totalNonCritical: this.nonCriticalScripts.length
        };
    }

    /**
     * 检查脚本是否加载完成
     */
    isScriptLoaded(src) {
        return this.loadedScripts.has(src);
    }

    /**
     * 等待特定脚本加载
     */
    async waitForScript(src, timeout = 5000) {
        if (this.loadedScripts.has(src)) {
            return true;
        }

        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (this.loadedScripts.has(src)) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
            }, 100);

            // 超时处理
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(false);
            }, timeout);
        });
    }
}

// 创建全局实例
window.smartScriptLoader = new SmartScriptLoader();

// 立即初始化
window.smartScriptLoader.init().catch(err => {
    console.error('脚本加载器初始化失败:', err);
});

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartScriptLoader;
}