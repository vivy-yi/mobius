/**
 * Mobius 统一设备检测器 - Unified Device Detector
 * 📱 权威的设备检测和响应式管理系统
 *
 * 核心功能:
 * - 统一设备状态管理
 * - 标准化CSS类命名体系
 * - 事件分发机制
 * - 性能优化的检测逻辑
 * - 完整的设备能力检测
 */

class UnifiedDeviceDetector {
    constructor(options = {}) {
        this.options = {
            enableDebug: false,
            enableEventDispatch: true,
            enablePerformanceOptimization: true,
            ...options
        };

        // 设备状态 - 单一权威状态
        this.deviceState = {
            // 基础设备信息
            width: 0,
            height: 0,
            pixelRatio: 1,
            orientation: 'landscape',
            touchSupport: false,
            hoverSupport: false,

            // 断点信息
            currentBreakpoint: 'desktop',
            currentLayout: 'single',

            // 设备类型
            deviceType: 'desktop',
            deviceCategory: 'large-screen',

            // 高级特性
            isFoldable: false,
            isRetina: false,
            isHighDensity: false,

            // 响应式能力
            supportsGrid: true,
            supportsFlexbox: true,
            supportsCustomProperties: true
        };

        // 断点配置
        this.breakpoints = {
            'nano-mobile': { min: 0, max: 475, type: 'mobile', layout: 'mobile' },
            'small-mobile': { min: 476, max: 767, type: 'mobile', layout: 'mobile' },
            'mobile': { min: 0, max: 767, type: 'mobile', layout: 'mobile' },
            'tablet': { min: 768, max: 1023, type: 'tablet', layout: 'tablet' },
            'small-laptop': { min: 1024, max: 1366, type: 'desktop', layout: 'desktop' },
            'desktop': { min: 1367, max: 1920, type: 'desktop', layout: 'desktop' },
            'large-desktop': { min: 1921, max: 2560, type: 'desktop', layout: 'desktop' },
            'ultra-wide': { min: 2561, max: 9999, type: 'desktop', layout: 'desktop' }
        };

        // 事件监听器管理
        this.listeners = new Map();
        this.resizeTimer = null;
        this.isInitialized = false;

        // 事件回调注册
        this.eventCallbacks = new Map();

        this.init();
    }

    /**
     * 初始化统一设备检测器
     */
    init() {
        if (this.isInitialized) {
            this.debug('UnifiedDeviceDetector already initialized');
            return;
        }

        this.debug('Initializing UnifiedDeviceDetector...');

        // 检测基础设备能力
        this.detectBasicCapabilities();

        // 初始化屏幕监听
        this.setupScreenListeners();

        // 初始化能力监听
        this.setupCapabilityListeners();

        // 执行初始检测
        this.updateDeviceState();

        this.isInitialized = true;
        this.dispatchDeviceReady();

        this.debug('UnifiedDeviceDetector initialized successfully');
    }

    /**
     * 检测基础设备能力
     */
    detectBasicCapabilities() {
        // 触摸支持检测
        this.deviceState.touchSupport = 'ontouchstart' in window ||
                                     navigator.maxTouchPoints > 0 ||
                                     navigator.msMaxTouchPoints > 0;

        // 悬停支持检测
        this.deviceState.hoverSupport = window.matchMedia('(hover: hover)').matches;

        // 像素比检测
        this.deviceState.pixelRatio = window.devicePixelRatio || 1;
        this.deviceState.isRetina = this.deviceState.pixelRatio > 1;

        // 高密度屏幕检测
        this.deviceState.isHighDensity = this.deviceState.pixelRatio >= 2;

        // CSS特性支持检测
        this.deviceState.supportsGrid = CSS.supports('display', 'grid');
        this.deviceState.supportsFlexbox = CSS.supports('display', 'flex');
        this.deviceState.supportsCustomProperties = CSS.supports('color', 'var(--test)');

        // 折叠屏检测
        this.detectFoldableCapability();

        this.debug('Basic capabilities detected:', this.deviceState);
    }

    /**
     * 检测折叠屏能力
     */
    detectFoldableCapability() {
        // 检查CSS环境变量
        const style = getComputedStyle(document.documentElement);
        const envVars = [
            '--fold-bottom', '--fold-left', '--fold-right', '--fold-top',
            '--fold-width', '--fold-height', '--screen-segments'
        ];

        let hasFoldableSupport = false;
        envVars.forEach(varName => {
            const value = style.getPropertyValue(varName);
            if (value && value !== 'none' && value !== '0px') {
                hasFoldableSupport = true;
            }
        });

        // 检查媒体查询
        const foldableQueries = [
            '(horizontal-viewport-segments: 2)',
            '(vertical-viewport-segments: 2)',
            '(device-posture: folded)',
            '(device-posture: unfolded)'
        ];

        if (window.matchMedia) {
            foldableQueries.forEach(query => {
                if (window.matchMedia(query).matches) {
                    hasFoldableSupport = true;
                }
            });
        }

        // 检查窗口段落API
        if ('getWindowSegments' in window) {
            hasFoldableSupport = true;
        }

        // 检查用户代理
        const userAgent = navigator.userAgent;
        const foldableKeywords = [
            'Galaxy Fold', 'Galaxy Z Fold', 'Galaxy Z Flip',
            'Surface Duo', 'Surface Neo', 'Huawei Mate X',
            'Xiaomi Fold', 'Oppo Find N', 'Vivo Fold',
            'Royole FlexPai', 'LG G8X', 'TCL Fold'
        ];

        foldableKeywords.forEach(keyword => {
            if (userAgent.includes(keyword)) {
                hasFoldableSupport = true;
            }
        });

        this.deviceState.isFoldable = hasFoldableSupport;
    }

    /**
     * 设置屏幕监听器
     */
    setupScreenListeners() {
        // 窗口大小变化监听
        if (this.options.enablePerformanceOptimization) {
            window.addEventListener('resize', this.debounce(() => {
                this.handleScreenChange();
            }, 100), { passive: true });

            window.addEventListener('orientationchange', this.debounce(() => {
                this.handleOrientationChange();
            }, 100), { passive: true });
        } else {
            window.addEventListener('resize', () => {
                this.handleScreenChange();
            }, { passive: true });

            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            }, { passive: true });
        }
    }

    /**
     * 设置能力监听器
     */
    setupCapabilityListeners() {
        // 媒体查询监听
        if (window.matchMedia) {
            // 触摸能力监听
            const touchQuery = window.matchMedia('(pointer: coarse)');
            touchQuery.addListener(() => {
                this.deviceState.touchSupport = touchQuery.matches;
                this.updateDeviceState();
            });

            // 悬停能力监听
            const hoverQuery = window.matchMedia('(hover: hover)');
            hoverQuery.addListener(() => {
                this.deviceState.hoverSupport = hoverQuery.matches;
                this.updateDeviceState();
            });

            // 高对比度监听
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addListener(() => {
                this.updateDeviceState();
            });

            // 减少动画监听
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addListener(() => {
                this.updateDeviceState();
            });
        }
    }

    /**
     * 处理屏幕变化
     */
    handleScreenChange() {
        const previousState = { ...this.deviceState };
        this.updateDeviceState();

        if (this.hasStateChanged(previousState, this.deviceState)) {
            this.dispatchDeviceChange(previousState, this.deviceState);
        }
    }

    /**
     * 处理方向变化
     */
    handleOrientationChange() {
        this.updateDeviceState();
        this.dispatchOrientationChange();
    }

    /**
     * 更新设备状态
     */
    updateDeviceState() {
        // 更新基础信息
        this.deviceState.width = window.innerWidth;
        this.deviceState.height = window.innerHeight;

        // 更新方向
        this.deviceState.orientation = this.deviceState.width > this.deviceState.height ? 'landscape' : 'portrait';

        // 确定当前断点
        this.deviceState.currentBreakpoint = this.getCurrentBreakpoint();

        // 确定设备类型
        this.deviceState.deviceType = this.getDeviceType();

        // 确定设备分类
        this.deviceState.deviceCategory = this.getDeviceCategory();

        // 更新布局模式
        this.deviceState.currentLayout = this.getCurrentLayout();

        // 应用CSS类
        this.applyDeviceClasses();

        this.debug('Device state updated:', this.deviceState);
    }

    /**
     * 获取当前断点
     */
    getCurrentBreakpoint() {
        const width = this.deviceState.width;

        for (const [breakpoint, config] of Object.entries(this.breakpoints)) {
            if (width >= config.min && width <= config.max) {
                return breakpoint;
            }
        }

        // 默认返回最大断点
        return 'ultra-wide';
    }

    /**
     * 获取设备类型
     */
    getDeviceType() {
        const breakpoint = this.deviceState.currentBreakpoint;
        return this.breakpoints[breakpoint]?.type || 'desktop';
    }

    /**
     * 获取设备分类
     */
    getDeviceCategory() {
        const width = this.deviceState.width;

        if (width <= 767) return 'mobile';
        if (width <= 1023) return 'tablet';
        if (width <= 1366) return 'small-desktop';
        return 'large-screen';
    }

    /**
     * 获取当前布局
     */
    getCurrentLayout() {
        // 折叠屏特殊布局
        if (this.deviceState.isFoldable) {
            return this.getFoldableLayout();
        }

        // 基础布局
        const breakpoint = this.deviceState.currentBreakpoint;
        return this.breakpoints[breakpoint]?.layout || 'desktop';
    }

    /**
     * 获取折叠屏布局
     */
    getFoldableLayout() {
        // 这里可以添加更复杂的折叠屏布局检测逻辑
        // 暂时返回双屏布局
        return 'dual-screen';
    }

    /**
     * 应用设备CSS类
     */
    applyDeviceClasses() {
        const body = document.body;
        if (!body) return;

        // 移除所有设备相关类
        this.removeAllDeviceClasses(body);

        // 添加设备类型类
        body.classList.add(`device-${this.deviceState.deviceType}`);

        // 添加设备分类类
        body.classList.add(`category-${this.deviceState.deviceCategory}`);

        // 添加断点类
        body.classList.add(`breakpoint-${this.deviceState.currentBreakpoint}`);

        // 添加布局类
        body.classList.add(`layout-${this.deviceState.currentLayout}`);

        // 添加能力类
        if (this.deviceState.touchSupport) {
            body.classList.add('supports-touch');
        }
        if (this.deviceState.hoverSupport) {
            body.classList.add('supports-hover');
        }
        if (this.deviceState.isFoldable) {
            body.classList.add('device-foldable');
        }
        if (this.deviceState.isRetina) {
            body.classList.add('device-retina');
        }
        if (this.deviceState.isHighDensity) {
            body.classList.add('device-high-density');
        }

        // 添加方向类
        body.classList.add(`orientation-${this.deviceState.orientation}`);

        this.debug('Applied device classes:', {
            deviceType: this.deviceState.deviceType,
            breakpoint: this.deviceState.currentBreakpoint,
            layout: this.deviceState.currentLayout
        });
    }

    /**
     * 移除所有设备相关类
     */
    removeAllDeviceClasses(element) {
        const deviceClasses = [
            // 设备类型类
            'device-mobile', 'device-tablet', 'device-desktop',

            // 旧的设备类（向后兼容）
            'device-nano-mobile', 'device-small-mobile',

            // 设备分类类
            'category-mobile', 'category-tablet', 'category-small-desktop', 'category-large-screen',

            // 断点类
            'breakpoint-nano-mobile', 'breakpoint-small-mobile', 'breakpoint-tablet',
            'breakpoint-small-laptop', 'breakpoint-desktop', 'breakpoint-large-desktop', 'breakpoint-ultra-wide',

            // 布局类
            'layout-mobile', 'layout-tablet', 'layout-desktop', 'layout-dual-screen',
            'layout-laptop', 'layout-book', 'layout-tent',

            // 能力类
            'supports-touch', 'supports-hover', 'device-foldable',
            'device-retina', 'device-high-density',

            // 方向类
            'orientation-landscape', 'orientation-portrait',

            // 其他可能的类
            'device-touch', 'device-hover', 'device-hybrid'
        ];

        deviceClasses.forEach(className => {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            }
        });
    }

    /**
     * 检查状态是否发生变化
     */
    hasStateChanged(previous, current) {
        const keys = [
            'currentBreakpoint', 'currentLayout', 'deviceType',
            'deviceCategory', 'orientation', 'width', 'height'
        ];

        return keys.some(key => previous[key] !== current[key]);
    }

    /**
     * 分发设备就绪事件
     */
    dispatchDeviceReady() {
        if (this.options.enableEventDispatch) {
            const event = new CustomEvent('deviceReady', {
                detail: this.deviceState
            });
            document.dispatchEvent(event);

            // 触发回调
            this.triggerCallback('ready', this.deviceState);
        }
    }

    /**
     * 分发设备变化事件
     */
    dispatchDeviceChange(previousState, currentState) {
        if (this.options.enableEventDispatch) {
            const event = new CustomEvent('deviceChange', {
                detail: {
                    previous: previousState,
                    current: currentState,
                    changes: this.getChanges(previousState, currentState)
                }
            });
            document.dispatchEvent(event);

            // 触发回调
            this.triggerCallback('change', {
                previous: previousState,
                current: currentState,
                changes: this.getChanges(previousState, currentState)
            });
        }
    }

    /**
     * 分发方向变化事件
     */
    dispatchOrientationChange() {
        if (this.options.enableEventDispatch) {
            const event = new CustomEvent('orientationChange', {
                detail: {
                    orientation: this.deviceState.orientation,
                    width: this.deviceState.width,
                    height: this.deviceState.height
                }
            });
            document.dispatchEvent(event);

            // 触发回调
            this.triggerCallback('orientation', {
                orientation: this.deviceState.orientation,
                width: this.deviceState.width,
                height: this.deviceState.height
            });
        }
    }

    /**
     * 获取状态变化
     */
    getChanges(previous, current) {
        const changes = {};
        const keys = ['currentBreakpoint', 'currentLayout', 'deviceType', 'deviceCategory', 'orientation'];

        keys.forEach(key => {
            if (previous[key] !== current[key]) {
                changes[key] = {
                    from: previous[key],
                    to: current[key]
                };
            }
        });

        return changes;
    }

    /**
     * 注册事件回调
     */
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);

        // 返回取消函数
        return () => {
            const callbacks = this.eventCallbacks.get(event);
            if (callbacks) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        };
    }

    /**
     * 触发回调
     */
    triggerCallback(event, data) {
        const callbacks = this.eventCallbacks.get(event);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in device event callback (${event}):`, error);
                }
            });
        }
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            ...this.deviceState,
            breakpoints: this.breakpoints,
            capabilities: {
                touch: this.deviceState.touchSupport,
                hover: this.deviceState.hoverSupport,
                retina: this.deviceState.isRetina,
                highDensity: this.deviceState.isHighDensity,
                foldable: this.deviceState.isFoldable
            }
        };
    }

    /**
     * 获取当前断点信息
     */
    getCurrentBreakpointInfo() {
        const breakpoint = this.deviceState.currentBreakpoint;
        return this.breakpoints[breakpoint] || {};
    }

    /**
     * 检查是否为移动设备
     */
    isMobile() {
        return this.deviceState.deviceType === 'mobile';
    }

    /**
     * 检查是否为平板设备
     */
    isTablet() {
        return this.deviceState.deviceType === 'tablet';
    }

    /**
     * 检查是否为桌面设备
     */
    isDesktop() {
        return this.deviceState.deviceType === 'desktop';
    }

    /**
     * 检查是否支持触摸
     */
    isTouch() {
        return this.deviceState.touchSupport;
    }

    /**
     * 检查是否为折叠屏设备
     */
    isFoldable() {
        return this.deviceState.isFoldable;
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
     * 调试日志
     */
    debug(message, data = null) {
        if (this.options.enableDebug) {
            // console.log(`[UnifiedDeviceDetector] ${message}`, data || '');
        }
    }

    /**
     * 销毁检测器
     */
    destroy() {
        this.debug('Destroying UnifiedDeviceDetector...');

        // 清理事件监听器
        if (this.resizeTimer) {
            clearTimeout(this.resizeTimer);
        }

        // 清理回调
        this.eventCallbacks.clear();

        // 移除设备类
        const body = document.body;
        if (body) {
            this.removeAllDeviceClasses(body);
        }

        this.isInitialized = false;
        this.debug('UnifiedDeviceDetector destroyed');
    }

    /**
     * 获取可用的断点列表
     */
    getAvailableBreakpoints() {
        return Object.keys(this.breakpoints).map(key => ({
            name: key,
            ...this.breakpoints[key]
        }));
    }

    /**
     * 手动设置断点（用于测试）
     */
    setBreakpoint(breakpoint) {
        if (!this.breakpoints[breakpoint]) {
            console.warn(`Unknown breakpoint: ${breakpoint}`);
            return;
        }

        const previousState = { ...this.deviceState };
        this.deviceState.currentBreakpoint = breakpoint;
        this.deviceState.deviceType = this.breakpoints[breakpoint].type;
        this.deviceState.currentLayout = this.breakpoints[breakpoint].layout;

        this.applyDeviceClasses();
        this.dispatchDeviceChange(previousState, this.deviceState);
    }
}

// 创建全局统一设备检测器实例
window.UnifiedDeviceDetector = new UnifiedDeviceDetector({
    enableDebug: false,
    enableEventDispatch: true,
    enablePerformanceOptimization: true
});

// 导出到全局作用域
window.UnifiedDeviceDetectorClass = UnifiedDeviceDetector;

// 控制台API
window.mobiusDevice = {
    getInfo: () => window.UnifiedDeviceDetector.getDeviceInfo(),
    getCurrentBreakpoint: () => window.UnifiedDeviceDetector.getCurrentBreakpoint(),
    isMobile: () => window.UnifiedDeviceDetector.isMobile(),
    isTablet: () => window.UnifiedDeviceDetector.isTablet(),
    isDesktop: () => window.UnifiedDeviceDetector.isDesktop(),
    isFoldable: () => window.UnifiedDeviceDetector.isFoldable(),
    isTouch: () => window.UnifiedDeviceDetector.isTouch(),
    setBreakpoint: (bp) => window.UnifiedDeviceDetector.setBreakpoint(bp),
    on: (event, callback) => window.UnifiedDeviceDetector.on(event, callback)
};

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.UnifiedDeviceDetector.init();
    });
} else {
    window.UnifiedDeviceDetector.init();
}

// console.log('📱 统一设备检测器已加载');
// console.log('🎯 使用 mobiusDevice API 进行调试');
// console.log('📋 事件监听: mobiusDevice.on("change", callback)');