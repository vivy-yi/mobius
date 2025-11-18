/**
 * Mobius 折叠屏设备检测器 - Foldable Device Detector
 * 📱 检测折叠角度、折叠状态，实现响应式布局切换
 *
 * 核心功能:
 * - 折叠屏设备检测和识别
 * - 折叠角度和状态监控
 * - 响应式布局自适应切换
 * - 多区域布局优化
 * - 跨屏内容适配
 * - 手势交互增强
 */

class FoldableDeviceDetector {
    constructor(options = {}) {
        this.options = {
            enableAutoDetection: true,
            enableGestureControl: true,
            enableLayoutOptimization: true,
            detectionInterval: 1000,
            foldThreshold: 90, // 折叠角度阈值
            ...options
        };

        // 设备状态
        this.deviceState = {
            isFoldable: false,
            isFolded: false,
            foldAngle: 0,
            posture: 'unknown', // flat, folded, laptop, book, tent, tablet
            screenCount: 1,
            layoutMode: 'single',
            deviceType: 'unknown'
        };

        // 屏幕信息
        this.screenInfo = {
            segments: [],
            totalWidth: 0,
            totalHeight: 0,
            hingeArea: null,
            activeScreens: []
        };

        // 监控状态
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.observers = new Map();

        // 事件回调
        this.eventCallbacks = new Map();

        // 布局模式
        this.layoutModes = {
            single: 'single-screen-layout',
            dual: 'dual-screen-layout',
            triple: 'triple-screen-layout',
            laptop: 'laptop-layout',
            book: 'book-layout',
            tent: 'tent-layout'
        };

        this.init();
    }

    /**
     * 初始化折叠屏检测器
     */
    init() {
        if (this.isMonitoring) return;

        // console.log('📱 初始化折叠屏设备检测器...');

        this.detectFoldableDevice();
        this.setupScreenMonitoring();
        this.setupGestureControl();
        this.initLayoutOptimization();

        if (this.deviceState.isFoldable) {
            this.startMonitoring();
            // console.log('✅ 检测到折叠屏设备，启动增强模式');
        } else {
            // console.log('ℹ️ 未检测到折叠屏设备，保持标准模式');
        }
    }

    /**
     * 检测折叠屏设备
     */
    detectFoldableDevice() {
        // 方法1: 检查CSS环境变量
        this.checkCSSEnvironmentVariables();

        // 方法2: 检查屏幕尺寸和比例
        this.checkScreenCharacteristics();

        // 方法3: 检查浏览器API
        this.checkBrowserAPIs();

        // 方法4: 用户代理检测
        this.checkUserAgent();

        // 综合判断
        this.evaluateFoldableStatus();
    }

    /**
     * 检查CSS环境变量
     */
    checkCSSEnvironmentVariables() {
        const style = getComputedStyle(document.documentElement);

        // 检查折叠屏相关的CSS环境变量
        const envVars = [
            '--fold-bottom',
            '--fold-left',
            '--fold-right',
            '--fold-top',
            '--fold-width',
            '--fold-height'
        ];

        envVars.forEach(varName => {
            const value = style.getPropertyValue(varName);
            if (value && value !== 'none' && value !== '0px') {
                this.deviceState.isFoldable = true;
                // console.log(`检测到CSS环境变量: ${varName} = ${value}`);
            }
        });

        // 检查屏幕段落数量
        const screenSegments = style.getPropertyValue('--screen-segments');
        if (screenSegments && parseInt(screenSegments) > 1) {
            this.deviceState.screenCount = parseInt(screenSegments);
            this.deviceState.isFoldable = true;
        }
    }

    /**
     * 检查屏幕特征
     */
    checkScreenCharacteristics() {
        const { width, height, availWidth, availHeight } = window.screen;
        const aspectRatio = width / height;
        const devicePixelRatio = window.devicePixelRatio;

        // 检测非常规比例 (可能的双屏设备)
        if (aspectRatio > 3 || aspectRatio < 0.33) {
            this.deviceState.isFoldable = true;
            // console.log('检测到非常规屏幕比例:', aspectRatio);
        }

        // 检测大面积屏幕 (可能的可折叠设备)
        if (width > 2000 || height > 2000) {
            this.deviceState.isFoldable = true;
            // console.log('检测到大面积屏幕:', { width, height });
        }

        // 检测高DPI设备
        if (devicePixelRatio > 3) {
            // console.log('检测到高DPI设备:', devicePixelRatio);
        }
    }

    /**
     * 检查浏览器API
     */
    checkBrowserAPIs() {
        // 检查Window Segments API (实验性)
        if ('getWindowSegments' in window) {
            this.deviceState.isFoldable = true;
            // console.log('支持Window Segments API');
        }

        // 检查Screen Orientation API
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        }

        // 检查Media Queries for foldable devices
        if (window.matchMedia) {
            const foldableQueries = [
                '(horizontal-viewport-segments: 2)',
                '(vertical-viewport-segments: 2)',
                '(device-posture: folded)',
                '(device-posture: unfolded)'
            ];

            foldableQueries.forEach(query => {
                const mq = window.matchMedia(query);
                if (mq.matches) {
                    this.deviceState.isFoldable = true;
                    // console.log('匹配折叠屏媒体查询:', query);
                }
            });
        }
    }

    /**
     * 检查用户代理
     */
    checkUserAgent() {
        const userAgent = navigator.userAgent;

        // 已知的折叠屏设备标识
        const foldableDeviceKeywords = [
            'Galaxy Fold', 'Galaxy Z Fold', 'Galaxy Z Flip',
            'Surface Duo', 'Surface Neo', 'Huawei Mate X',
            'Xiaomi Fold', 'Oppo Find N', 'Vivo Fold',
            'Royole FlexPai', 'LG G8X', 'TCL Fold'
        ];

        foldableDeviceKeywords.forEach(keyword => {
            if (userAgent.includes(keyword)) {
                this.deviceState.isFoldable = true;
                this.deviceState.deviceType = keyword;
                // console.log('用户代理检测到折叠屏设备:', keyword);
            }
        });
    }

    /**
     * 综合评估折叠屏状态
     */
    evaluateFoldableStatus() {
        let foldableScore = 0;

        // CSS环境变量权重: 30%
        if (this.deviceState.isFoldable) foldableScore += 30;

        // 屏幕特征权重: 25%
        const { width, height } = window.screen;
        if (width > 2000 || height > 2000 || (width / height) > 3) {
            foldableScore += 25;
        }

        // API支持权重: 25%
        if ('getWindowSegments' in window) foldableScore += 25;
        if (window.matchMedia && window.matchMedia('(horizontal-viewport-segments: 2)').matches) {
            foldableScore += 25;
        }

        // 用户代理权重: 20%
        const userAgent = navigator.userAgent;
        const foldableDeviceKeywords = [
            'Galaxy Fold', 'Galaxy Z Fold', 'Galaxy Z Flip',
            'Surface Duo', 'Surface Neo', 'Huawei Mate X',
            'Xiaomi Fold', 'Oppo Find N', 'Vivo Fold',
            'Royole FlexPai', 'LG G8X', 'TCL Fold'
        ];
        if (foldableDeviceKeywords.some(keyword => userAgent.includes(keyword))) {
            foldableScore += 20;
        }

        this.deviceState.isFoldable = foldableScore >= 40;

        // console.log(`折叠屏评估得分: ${foldableScore}/100`, this.deviceState);
    }

    /**
     * 设置屏幕监控
     */
    setupScreenMonitoring() {
        // 监听窗口大小变化 - 降低频率以提高性能
        window.addEventListener('resize', this.debounce(() => {
            this.handleScreenChange();
        }, 500));

        // 监听屏幕方向变化
        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.handleOrientationChange();
            });
        }

        // 定期检查设备状态
        if (this.deviceState.isFoldable) {
            this.monitoringInterval = setInterval(() => {
                this.updateDeviceState();
            }, this.options.detectionInterval);
        }
    }

    /**
     * 设置手势控制
     */
    setupGestureControl() {
        if (!this.options.enableGestureControl) return;

        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        });

        document.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                touchEndX = e.changedTouches[0].clientX;
                touchEndY = e.changedTouches[0].clientY;
                this.handleGesture(touchStartX, touchStartY, touchEndX, touchEndY);
            }
        });
    }

    /**
     * 处理手势
     */
    handleGesture(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // 需要足够长的滑动距离
        if (distance < 100) return;

        // 检测滑动方向
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;

        if (angle > -45 && angle < 45) {
            // 向右滑动
            this.handleSwipeRight();
        } else if (angle > 135 || angle < -135) {
            // 向左滑动
            this.handleSwipeLeft();
        } else if (angle > 45 && angle < 135) {
            // 向下滑动
            this.handleSwipeDown();
        } else {
            // 向上滑动
            this.handleSwipeUp();
        }
    }

    /**
     * 初始化布局优化
     */
    initLayoutOptimization() {
        if (!this.options.enableLayoutOptimization) return;

        this.createFoldableStyles();
        this.optimizeContentForFoldable();
    }

    /**
     * 创建折叠屏样式
     */
    createFoldableStyles() {
        const styleId = 'foldable-device-styles';

        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 折叠屏设备通用样式 */
            .foldable-device {
                --hinge-width: 0px;
                --fold-threshold: 90deg;
                --screen-gap: 0px;
            }

            /* 单屏模式 */
            .single-screen-layout {
                display: block;
                width: 100%;
                height: 100vh;
            }

            /* 双屏模式 */
            .dual-screen-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-gap: var(--hinge-width, 0px);
                height: 100vh;
            }

            .dual-screen-layout .left-screen {
                grid-column: 1;
                padding-right: var(--screen-gap, 20px);
            }

            .dual-screen-layout .right-screen {
                grid-column: 2;
                padding-left: var(--screen-gap, 20px);
            }

            /* 笔记本模式 */
            .laptop-layout {
                display: grid;
                grid-template-rows: 60% 40%;
                height: 100vh;
            }

            .laptop-layout .top-screen {
                grid-row: 1;
                border-bottom: var(--hinge-width, 2px) solid #ccc;
            }

            .laptop-layout .bottom-screen {
                grid-row: 2;
            }

            /* 书本模式 */
            .book-layout {
                display: grid;
                grid-template-columns: 1fr 1fr;
                height: 100vh;
            }

            .book-layout .left-page {
                grid-column: 1;
                padding-right: 20px;
                border-right: 1px solid #ddd;
            }

            .book-layout .right-page {
                grid-column: 2;
                padding-left: 20px;
            }

            /* 帐篷模式 */
            .tent-layout {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }

            .tent-layout .main-content {
                max-width: 80%;
                max-height: 80%;
            }

            /* 折叠线指示器 */
            .fold-indicator {
                position: absolute;
                background: rgba(0, 0, 0, 0.1);
                z-index: 999; /* 低于导航栏的1000 */
                pointer-events: none;
            }

            .fold-indicator.horizontal {
                width: 100%;
                height: 2px;
                left: 0;
            }

            .fold-indicator.vertical {
                width: 2px;
                height: 100%;
                top: 0;
            }

            /* 内容适配 */
            .foldable-content {
                transition: all 0.3s ease;
            }

            .foldable-content.two-column {
                column-count: 2;
                column-gap: 30px;
            }

            /* 铰接区域优化 */
            .hinge-area {
                background: #000;
                opacity: 0.8;
                position: relative;
            }

            .hinge-area::before {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 10px;
                height: 10px;
                background: #333;
                border-radius: 50%;
            }

            /* 响应式适配 */
            @media (horizontal-viewport-segments: 2) {
                .container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                }
            }

            @media (vertical-viewport-segments: 2) {
                .container {
                    display: grid;
                    grid-template-rows: 1fr 1fr;
                }
            }

            @media (device-posture: folded) {
                body {
                    font-size: 14px;
                }
            }

            @media (device-posture: unfolded) {
                body {
                    font-size: 16px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * 开始监控
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        // console.log('📱 开始监控折叠屏设备状态...');

        // 启动实时监控
        this.monitoringInterval = setInterval(() => {
            this.updateDeviceState();
        }, this.options.detectionInterval);
    }

    /**
     * 更新设备状态
     */
    updateDeviceState() {
        const previousState = { ...this.deviceState };

        // 获取窗口段落信息
        this.updateScreenSegments();

        // 检测设备姿态
        this.detectDevicePosture();

        // 检测折叠角度
        this.detectFoldAngle();

        // 更新布局模式
        this.updateLayoutMode();

        // 触发状态变化事件
        if (this.hasStateChanged(previousState, this.deviceState)) {
            this.handleStateChange(previousState, this.deviceState);
        }
    }

    /**
     * 更新屏幕段落
     */
    updateScreenSegments() {
        if ('getWindowSegments' in window) {
            try {
                const segments = window.getWindowSegments();
                this.screenInfo.segments = segments;
                this.deviceState.screenCount = segments.length;
                this.screenInfo.activeScreens = segments.filter(seg =>
                    seg.width > 0 && seg.height > 0
                );
            } catch (e) {
                // console.warn('无法获取窗口段落:', e);
            }
        }
    }

    /**
     * 检测设备姿态
     */
    detectDevicePosture() {
        if (window.matchMedia) {
            const postures = ['flat', 'folded', 'laptop', 'book', 'tent'];

            postures.forEach(posture => {
                const query = window.matchMedia(`(device-posture: ${posture})`);
                if (query.matches) {
                    this.deviceState.posture = posture;
                }
            });
        }

        // 基于屏幕数量和角度推断姿态
        if (this.deviceState.screenCount === 2) {
            const angle = this.deviceState.foldAngle;

            if (angle < 30) {
                this.deviceState.posture = 'flat';
            } else if (angle < 300) {
                this.deviceState.posture = 'laptop';
            } else if (angle < 210) {
                this.deviceState.posture = 'tent';
            } else {
                this.deviceState.posture = 'book';
            }
        }
    }

    /**
     * 检测折叠角度
     */
    detectFoldAngle() {
        // 使用CSS环境变量检测折叠角度
        const style = getComputedStyle(document.documentElement);
        const foldAngle = style.getPropertyValue('--fold-angle');

        if (foldAngle) {
            this.deviceState.foldAngle = parseFloat(foldAngle);
        } else {
            // 基于设备方向估算
            this.estimateFoldAngleFromOrientation();
        }

        // 判断折叠状态
        this.deviceState.isFolded = this.deviceState.foldAngle > this.options.foldThreshold;
    }

    /**
     * 从方向估算折叠角度
     */
    estimateFoldAngleFromOrientation() {
        const { width, height } = window.screen;
        const orientation = window.orientation || 0;

        // 简单的角度估算逻辑
        if (this.deviceState.screenCount === 2) {
            if (width > height) {
                this.deviceState.foldAngle = 180; // 展开状态
            } else {
                this.deviceState.foldAngle = 90;  // 折叠状态
            }
        }
    }

    /**
     * 更新布局模式
     */
    updateLayoutMode() {
        const { screenCount, posture, isFolded } = this.deviceState;

        if (screenCount === 1) {
            this.deviceState.layoutMode = 'single';
        } else if (screenCount === 2) {
            switch (posture) {
                case 'laptop':
                    this.deviceState.layoutMode = 'laptop';
                    break;
                case 'book':
                    this.deviceState.layoutMode = 'book';
                    break;
                case 'tent':
                    this.deviceState.layoutMode = 'tent';
                    break;
                default:
                    this.deviceState.layoutMode = isFolded ? 'dual' : 'single';
            }
        } else if (screenCount >= 3) {
            this.deviceState.layoutMode = 'triple';
        }

        this.applyLayoutMode();
    }

    /**
     * 应用布局模式
     */
    applyLayoutMode() {
        const body = document.body;
        const mainContainer = document.querySelector('.container, main, .mobius-container');

        // 移除所有布局类
        Object.values(this.layoutModes).forEach(modeClass => {
            body.classList.remove(modeClass);
            if (mainContainer) {
                mainContainer.classList.remove(modeClass);
            }
        });

        // 应用新布局类
        const currentLayoutClass = this.layoutModes[this.deviceState.layoutMode];
        if (currentLayoutClass) {
            body.classList.add(currentLayoutClass);
            if (mainContainer) {
                mainContainer.classList.add(currentLayoutClass);
            }
        }

        // console.log(`应用布局模式: ${this.deviceState.layoutMode} (${currentLayoutClass})`);
    }

    /**
     * 处理屏幕变化
     */
    handleScreenChange() {
        // console.log('屏幕尺寸发生变化');
        this.updateDeviceState();
    }

    /**
     * 处理方向变化
     */
    handleOrientationChange() {
        // console.log('屏幕方向发生变化:', screen.orientation.angle);
        this.updateDeviceState();
    }

    /**
     * 手势处理方法
     */
    handleSwipeLeft() {
        // console.log('检测到向左滑动');
        this.triggerEvent('swipe-left');
    }

    handleSwipeRight() {
        // console.log('检测到向右滑动');
        this.triggerEvent('swipe-right');
    }

    handleSwipeUp() {
        // console.log('检测到向上滑动');
        this.triggerEvent('swipe-up');
    }

    handleSwipeDown() {
        // console.log('检测到向下滑动');
        this.triggerEvent('swipe-down');
    }

    /**
     * 状态变化处理
     */
    handleStateChange(previousState, currentState) {
        // console.log('设备状态发生变化:', {
            previous: previousState,
            current: currentState
        });

        this.triggerEvent('state-change', { previousState, currentState });

        // 优化内容显示
        this.optimizeContentForCurrentState();

        // 更新用户界面
        this.updateUIForNewState();
    }

    /**
     * 优化内容显示
     */
    optimizeContentForCurrentState() {
        const { layoutMode, posture, isFolded } = this.deviceState;

        // 根据布局模式优化内容
        switch (layoutMode) {
            case 'dual':
                this.optimizeForDualScreen();
                break;
            case 'laptop':
                this.optimizeForLaptopMode();
                break;
            case 'book':
                this.optimizeForBookMode();
                break;
            case 'tent':
                this.optimizeForTentMode();
                break;
            default:
                this.optimizeForSingleScreen();
        }
    }

    /**
     * 双屏优化
     */
    optimizeForDualScreen() {
        // console.log('优化双屏显示');

        // 将主要内容分配到左屏
        const mainContent = document.querySelector('main, .main-content');
        if (mainContent) {
            mainContent.classList.add('left-screen');
        }

        // 将侧边栏或辅助内容分配到右屏
        const sidebar = document.querySelector('aside, .sidebar, .secondary-content');
        if (sidebar) {
            sidebar.classList.add('right-screen');
        }
    }

    /**
     * 笔记本模式优化
     */
    optimizeForLaptopMode() {
        // console.log('优化笔记本模式显示');

        // 上屏显示主要内容
        const mainContent = document.querySelector('main, .main-content');
        if (mainContent) {
            mainContent.classList.add('top-screen');
        }

        // 下屏显示控制面板或输入区域
        const controls = document.querySelector('form, .controls, .input-area');
        if (controls) {
            controls.classList.add('bottom-screen');
        }
    }

    /**
     * 书本模式优化
     */
    optimizeForBookMode() {
        // console.log('优化书本模式显示');

        // 模拟书本翻页效果
        const content = document.querySelector('.content, article');
        if (content) {
            content.classList.add('foldable-content', 'two-column');
        }
    }

    /**
     * 帐篷模式优化
     */
    optimizeForTentMode() {
        // console.log('优化帐篷模式显示');

        // 居中显示内容，适合展示
        const mainContent = document.querySelector('main, .main-content');
        if (mainContent) {
            mainContent.classList.add('main-content');
        }
    }

    /**
     * 单屏优化
     */
    optimizeForSingleScreen() {
        // console.log('优化单屏显示');

        // 移除所有多屏相关的类
        const multiScreenClasses = [
            'left-screen', 'right-screen', 'top-screen', 'bottom-screen',
            'left-page', 'right-page', 'main-content'
        ];

        multiScreenClasses.forEach(className => {
            document.querySelectorAll(`.${className}`).forEach(element => {
                element.classList.remove(className);
            });
        });
    }

    /**
     * 优化折叠屏内容
     */
    optimizeContentForFoldable() {
        // 为图片添加跨屏显示支持
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
        });

        // 优化表格显示
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
        });

        // 优化视频显示
        const videos = document.querySelectorAll('video, iframe');
        videos.forEach(video => {
            video.style.maxWidth = '100%';
            video.style.height = 'auto';
        });
    }

    /**
     * 更新新状态的用户界面
     */
    updateUIForNewState() {
        // 可以在这里添加特定的UI更新逻辑
        this.triggerEvent('ui-update', this.deviceState);
    }

    /**
     * 工具方法
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

    hasStateChanged(previous, current) {
        return JSON.stringify(previous) !== JSON.stringify(current);
    }

    /**
     * 事件处理
     */
    on(event, callback) {
        if (!this.eventCallbacks.has(event)) {
            this.eventCallbacks.set(event, []);
        }
        this.eventCallbacks.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventCallbacks.has(event)) {
            const callbacks = this.eventCallbacks.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    triggerEvent(event, data = null) {
        if (this.eventCallbacks.has(event)) {
            this.eventCallbacks.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event callback for ${event}:`, error);
                }
            });
        }

        // 同时触发DOM事件
        const domEvent = new CustomEvent(`foldable-${event}`, { detail: data });
        document.dispatchEvent(domEvent);
    }

    /**
     * 获取设备信息
     */
    getDeviceInfo() {
        return {
            deviceState: this.deviceState,
            screenInfo: this.screenInfo,
            capabilities: {
                hasFoldableSupport: this.deviceState.isFoldable,
                hasMultiScreen: this.deviceState.screenCount > 1,
                hasGestureControl: this.options.enableGestureControl,
                hasLayoutOptimization: this.options.enableLayoutOptimization
            },
            options: this.options
        };
    }

    /**
     * 设置设备状态
     */
    setDeviceState(newState) {
        const previousState = { ...this.deviceState };
        Object.assign(this.deviceState, newState);
        this.handleStateChange(previousState, this.deviceState);
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.isMonitoring = false;
        // console.log('⏹️ 折叠屏设备监控已停止');
    }

    /**
     * 销毁检测器
     */
    destroy() {
        this.stopMonitoring();
        this.eventCallbacks.clear();

        const style = document.getElementById('foldable-device-styles');
        if (style) {
            style.remove();
        }

        // console.log('🗑️ 折叠屏设备检测器已销毁');
    }
}

// 创建全局折叠屏检测实例
window.FoldableDeviceDetector = new FoldableDeviceDetector({
    enableAutoDetection: true,
    enableGestureControl: true,
    enableLayoutOptimization: true,
    detectionInterval: 1000,
    foldThreshold: 90
});

// 导出到全局作用域
window.FoldableDeviceDetectorClass = FoldableDeviceDetector;

// 控制台API (用于调试)
window.mobiusFoldable = {
    getInfo: () => window.FoldableDeviceDetector.getDeviceInfo(),
    setMode: (mode) => window.FoldableDeviceDetector.setDeviceState({ layoutMode: mode }),
    setPosture: (posture) => window.FoldableDeviceDetector.setDeviceState({ posture }),
    stopMonitoring: () => window.FoldableDeviceDetector.stopMonitoring(),
    startMonitoring: () => window.FoldableDeviceDetector.startMonitoring()
};

// console.log('📱 折叠屏设备检测器已加载');

// 页面加载完成后确保初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.FoldableDeviceDetector.init();
    });
} else {
    window.FoldableDeviceDetector.init();
}