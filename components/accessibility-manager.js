/**
 * Mobius 高级无障碍管理器 - AccessibilityManager
 * ♿️ 扩展无障碍功能，提供更全面的用户体验优化
 *
 * 新增功能:
 * - 动态字体大小调整
 * - 高对比度模式优化
 * - 实时键盘导航支持
 * - 屏幕阅读器增强
 * - 语音播报功能
 * - 手势控制支持
 * - 无障碍控制面板
 * - 响应式无障碍适配
 */

class AccessibilityManager extends SeoAccessibilityOptimizer {
    constructor(options = {}) {
        // 调用父类构造函数
        super();

        this.options = {
            ...this.options,
            enableDynamicFontSize: true,
            enableHighContrastMode: true,
            enableVoiceNavigation: true,
            enableGestureControl: false,
            enableControlPanel: true,
            fontSizeStep: 1,
            minFontSize: 12,
            maxFontSize: 24,
            defaultFontSize: 16,
            ...options
        };

        this.state = {
            currentFontSize: this.options.defaultFontSize,
            highContrastMode: false,
            voiceNavigationActive: false,
            focusVisible: false,
            reducedMotion: false,
            screenReaderOptimized: false
        };

        this.observers = [];
        this.controlPanel = null;

        this.init();
    }

    /**
     * 初始化高级无障碍功能
     */
    init() {
        // 先初始化基础SEO和可访问性功能
        super.init();

        console.log('🔧 初始化高级无障碍管理器...');

        // 初始化新功能
        this.initFontSizeControl();
        this.initHighContrastMode();
        this.initVoiceNavigation();
        this.initGestureControl();
        this.initAccessibilityPanel();
        this.initFocusManagement();
        this.initScreenReaderEnhancements();
        this.initReducedMotion();
        this.initKeyboardNavigationEnhancements();
        this.setupResponsiveAccessibility();

        this.isInitialized = true;
        console.log('✅ 高级无障碍管理器初始化完成');
    }

    /**
     * 动态字体大小控制
     */
    initFontSizeControl() {
        if (!this.options.enableDynamicFontSize) return;

        this.createFontSizeControls();
        this.loadFontSizePreference();
        this.applyFontSize(this.state.currentFontSize);
    }

    /**
     * 创建字体大小控制UI
     */
    createFontSizeControls() {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'font-size-controls';
        controlsContainer.setAttribute('role', 'toolbar');
        controlsContainer.setAttribute('aria-label', '字体大小控制');

        // 减小按钮
        const decreaseBtn = this.createAccessibleButton({
            text: 'A-',
            ariaLabel: '减小字体大小',
            onClick: () => this.adjustFontSize(-this.options.fontSizeStep)
        });

        // 当前字体大小显示
        const currentSize = document.createElement('span');
        currentSize.className = 'current-font-size';
        currentSize.setAttribute('aria-live', 'polite');
        currentSize.textContent = `${this.state.currentFontSize}px`;

        // 增大按钮
        const increaseBtn = this.createAccessibleButton({
            text: 'A+',
            ariaLabel: '增大字体大小',
            onClick: () => this.adjustFontSize(this.options.fontSizeStep)
        });

        // 重置按钮
        const resetBtn = this.createAccessibleButton({
            text: '重置',
            ariaLabel: '重置字体大小',
            onClick: () => this.resetFontSize()
        });

        controlsContainer.appendChild(decreaseBtn);
        controlsContainer.appendChild(currentSize);
        controlsContainer.appendChild(increaseBtn);
        controlsContainer.appendChild(resetBtn);

        // 添加到控制面板
        this.addToControlPanel('字体大小控制', controlsContainer);
    }

    /**
     * 调整字体大小
     */
    adjustFontSize(delta) {
        const newSize = Math.max(
            this.options.minFontSize,
            Math.min(
                this.options.maxFontSize,
                this.state.currentFontSize + delta
            )
        );

        this.state.currentFontSize = newSize;
        this.applyFontSize(newSize);
        this.saveFontSizePreference();
        this.updateFontSizeDisplay();
        this.announceFontSizeChange(newSize);
    }

    /**
     * 应用字体大小
     */
    applyFontSize(size) {
        const rootElement = document.documentElement;
        rootElement.style.setProperty('--base-font-size', `${size}px`);

        // 为不同元素设置相对字体大小
        const fontSizes = {
            '--font-size-xs': `${size * 0.875}px`,
            '--font-size-sm': `${size}px`,
            '--font-size-base': `${size * 1.125}px`,
            '--font-size-lg': `${size * 1.25}px`,
            '--font-size-xl': `${size * 1.5}px`,
            '--font-size-2xl': `${size * 1.875}px`,
            '--font-size-3xl': `${size * 2.25}px`
        };

        Object.entries(fontSizes).forEach(([property, value]) => {
            rootElement.style.setProperty(property, value);
        });
    }

    /**
     * 重置字体大小
     */
    resetFontSize() {
        this.state.currentFontSize = this.options.defaultFontSize;
        this.applyFontSize(this.options.defaultFontSize);
        this.saveFontSizePreference();
        this.updateFontSizeDisplay();
    }

    /**
     * 更新字体大小显示
     */
    updateFontSizeDisplay() {
        const displayElement = document.querySelector('.current-font-size');
        if (displayElement) {
            displayElement.textContent = `${this.state.currentFontSize}px`;
        }
    }

    /**
     * 高对比度模式
     */
    initHighContrastMode() {
        if (!this.options.enableHighContrastMode) return;

        this.createHighContrastControls();
        this.detectSystemContrastPreference();
        this.setupContrastChangeListeners();
    }

    /**
     * 创建高对比度控制UI
     */
    createHighContrastControls() {
        const highContrastBtn = this.createAccessibleButton({
            text: '高对比',
            ariaLabel: '切换高对比度模式',
            onClick: () => this.toggleHighContrastMode()
        });

        this.addToControlPanel('视觉辅助', highContrastBtn);
    }

    /**
     * 切换高对比度模式
     */
    toggleHighContrastMode() {
        this.state.highContrastMode = !this.state.highContrastMode;
        document.documentElement.toggleAttribute('data-high-contrast', this.state.highContrastMode);

        this.updateHighContrastStyles();
        this.saveHighContrastPreference();
        this.announceHighContrastChange();
    }

    /**
     * 更新高对比度样式
     */
    updateHighContrastStyles() {
        const styleId = 'high-contrast-styles';
        let styleElement = document.getElementById(styleId);

        if (!this.state.highContrastMode) {
            if (styleElement) {
                styleElement.remove();
            }
            return;
        }

        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;

            styleElement.textContent = `
                [data-high-contrast="true"] {
                    --primary-blue: #0066cc !important;
                    --tech-blue: #0080ff !important;
                    --accent-red: #ff0000 !important;
                    --success-green: #00aa00 !important;
                    --warning-yellow: #ffaa00 !important;
                    --dark-text: #000000 !important;
                    --light-text: #333333 !important;
                    --border-color: #000000 !important;
                    --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.4) !important;
                    --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5) !important;
                    --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.6) !important;
                }

                [data-high-contrast="true"] * {
                    text-shadow: none !important;
                }

                [data-high-contrast="true"] .card,
                [data-high-contrast="true"] .service-card,
                [data-high-contrast="true"] .feature-card {
                    border: 2px solid var(--border-color) !important;
                }

                [data-high-contrast="true"] .btn,
                [data-high-contrast="true"] button {
                    border: 2px solid var(--primary-blue) !important;
                }

                [data-high-contrast="true"] input,
                [data-high-contrast="true"] textarea,
                [data-high-contrast="true"] select {
                    border: 2px solid var(--border-color) !important;
                }
            `;

            document.head.appendChild(styleElement);
        }
    }

    /**
     * 检测系统对比度偏好
     */
    detectSystemContrastPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-contrast: high)');
            this.state.highContrastMode = mediaQuery.matches;

            if (mediaQuery.matches) {
                document.documentElement.setAttribute('data-high-contrast', 'true');
                this.updateHighContrastStyles();
            }

            // 监听变化
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', (e) => {
                    this.state.highContrastMode = e.matches;
                    document.documentElement.toggleAttribute('data-high-contrast', e.matches);
                    this.updateHighContrastStyles();
                    this.announceHighContrastChange();
                });
            }
        }
    }

    /**
     * 设置对比度变化监听器
     */
    setupContrastChangeListeners() {
        // 监听主题变化，相应调整高对比度
        window.themeManager?.addThemeChangeObserver((detail) => {
            if (this.state.highContrastMode) {
                this.updateHighContrastStyles();
            }
        });
    }

    /**
     * 语音导航功能
     */
    initVoiceNavigation() {
        if (!this.options.enableVoiceNavigation) return;

        this.createVoiceControls();
        this.initSpeechRecognition();
        this.initSpeechSynthesis();
    }

    /**
     * 创建语音控制UI
     */
    createVoiceControls() {
        const voiceContainer = document.createElement('div');
        voiceContainer.className = 'voice-controls';

        const voiceBtn = this.createAccessibleButton({
            text: '🎤',
            ariaLabel: '启动语音导航',
            onClick: () => this.toggleVoiceNavigation()
        });

        voiceContainer.appendChild(voiceBtn);
        this.addToControlPanel('语音控制', voiceContainer);
    }

    /**
     * 初始化语音识别
     */
    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('浏览器不支持语音识别');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRecognition();

        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = 'zh-CN';

        this.speechRecognition.onresult = (event) => {
            this.processVoiceCommand(event.results[event.resultIndex][0].transcript);
        };

        this.speechRecognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.handleVoiceError(event.error);
        };
    }

    /**
     * 初始化语音合成
     */
    initSpeechSynthesis() {
        if (!('speechSynthesis' in window)) {
            console.warn('浏览器不支持语音合成');
            return;
        }

        this.speechSynthesis = window.speechSynthesis;
        this.speechVoices = [];

        // 加载语音列表
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = () => {
                this.speechVoices = this.speechSynthesis.getVoices();
            };
        }
    }

    /**
     * 处理语音命令
     */
    processVoiceCommand(command) {
        const normalizedCommand = command.toLowerCase().trim();

        // 预定义的语音命令
        const commands = {
            '导航到首页': () => this.navigateTo('/'),
            '回到顶部': () => this.scrollToTop(),
            '增大字体': () => this.adjustFontSize(this.options.fontSizeStep),
            '减小字体': () => this.adjustFontSize(-this.options.fontSizeStep),
            '切换主题': () => window.themeManager?.toggleTheme(),
            '高对比度': () => this.toggleHighContrastMode(),
            '停止语音': () => this.stopVoiceNavigation()
        };

        // 查找匹配的命令
        for (const [key, action] of Object.entries(commands)) {
            if (normalizedCommand.includes(key)) {
                action();
                this.announce(`执行命令: ${key}`);
                return;
            }
        }

        this.announce(`未识别的命令: ${command}`);
    }

    /**
     * 切换语音导航
     */
    toggleVoiceNavigation() {
        if (this.state.voiceNavigationActive) {
            this.stopVoiceNavigation();
        } else {
            this.startVoiceNavigation();
        }
    }

    /**
     * 启动语音导航
     */
    startVoiceNavigation() {
        if (!this.speechRecognition) {
            this.announce('语音识别不可用');
            return;
        }

        try {
            this.speechRecognition.start();
            this.state.voiceNavigationActive = true;
            this.updateVoiceButton(true);
            this.announce('语音导航已启动，请说出命令');
        } catch (error) {
            console.error('启动语音识别失败:', error);
            this.announce('启动语音识别失败');
        }
    }

    /**
     * 停止语音导航
     */
    stopVoiceNavigation() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
        this.state.voiceNavigationActive = false;
        this.updateVoiceButton(false);
        this.announce('语音导航已停止');
    }

    /**
     * 更新语音按钮状态
     */
    updateVoiceButton(isActive) {
        const voiceBtn = document.querySelector('.voice-controls button');
        if (voiceBtn) {
            voiceBtn.setAttribute('aria-pressed', isActive);
            voiceBtn.textContent = isActive ? '🔇' : '🎤';
            voiceBtn.style.background = isActive ? 'var(--success-green)' : '';
        }
    }

    /**
     * 手势控制支持
     */
    initGestureControl() {
        if (!this.options.enableGestureControl) return;

        // 检测触摸支持
        if (!('ontouchstart' in window)) return;

        this.setupTouchGestures();
        this.setupSwipeGestures();
    }

    /**
     * 设置触摸手势
     */
    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // 双指点击切换高对比度
            if (e.touches.length === 0 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
                this.handleDoubleTap();
            }
        }, { passive: true });
    }

    /**
     * 设置滑动手势
     */
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (!startTime) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;

            // 水平滑滑调整字体大小
            if (Math.abs(deltaX) > 50) {
                this.adjustFontSize(deltaX > 0 ? 1 : -1);
                startX = currentX;
            }
        }, { passive: true });
    }

    /**
     * 处理双击
     */
    handleDoubleTap() {
        this.toggleHighContrastMode();
    }

    /**
     * 无障碍控制面板
     */
    initAccessibilityPanel() {
        if (!this.options.enableControlPanel) return;

        this.createAccessibilityPanel();
    }

    /**
     * 创建无障碍控制面板
     */
    createAccessibilityPanel() {
        // 创建面板容器
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'accessibility-panel';
        this.controlPanel.setAttribute('role', 'dialog');
        this.controlPanel.setAttribute('aria-labelledby', 'accessibility-panel-title');
        this.controlPanel.setAttribute('aria-hidden', 'true');

        // 面板标题
        const panelTitle = document.createElement('h2');
        panelTitle.id = 'accessibility-panel-title';
        panelTitle.textContent = '无障碍功能控制';

        // 关闭按钮
        const closeBtn = this.createAccessibleButton({
            text: '×',
            ariaLabel: '关闭无障碍面板',
            onClick: () => this.hideAccessibilityPanel()
        });

        // 面板内容容器
        const panelContent = document.createElement('div');
        panelContent.className = 'panel-content';

        // 添加到面板
        this.controlPanel.appendChild(closeBtn);
        this.controlPanel.appendChild(panelTitle);
        this.controlPanel.appendChild(panelContent);

        // 添加到body
        document.body.appendChild(this.controlPanel);

        // 添加样式
        this.addAccessibilityPanelStyles();
    }

    /**
     * 显示无障碍面板
     */
    showAccessibilityPanel() {
        if (this.controlPanel) {
            this.controlPanel.setAttribute('aria-hidden', 'false');
            this.controlPanel.focus();
        }
    }

    /**
     * 隐藏无障碍面板
     */
    hideAccessibilityPanel() {
        if (this.controlPanel) {
            this.controlPanel.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * 添加控制到面板
     */
    addToControlPanel(title, element) {
        if (this.controlPanel) {
            const section = document.createElement('section');
            section.className = 'accessibility-section';

            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = title;
            sectionTitle.id = `section-${title.replace(/\s+/g, '-')}`;

            section.appendChild(sectionTitle);
            section.appendChild(element);

            this.controlPanel.querySelector('.panel-content')?.appendChild(section);
        }
    }

    /**
     * 增强的焦点管理
     */
    initFocusManagement() {
        this.setupFocusVisibleIndicator();
        this.setupSkipLinksEnhanced();
        this.setupFocusTrapping();
    }

    /**
     * 设置焦点可见指示器
     */
    setupFocusVisibleIndicator() {
        // 为所有可聚焦元素添加焦点可见样式
        const style = document.createElement('style');
        style.textContent = `
            .js-focus-visible :focus {
                outline: 3px solid var(--tech-blue);
                outline-offset: 2px;
            }

            .js-focus-visible .focus-ring {
                position: absolute;
                top: -2px;
                left: -2px;
                right: -2px;
                bottom: -2px;
                border: 2px solid var(--tech-blue);
                border-radius: var(--radius-sm);
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s ease;
            }

            .js-focus-visible :focus .focus-ring {
                opacity: 1;
            }
        `;

        document.head.appendChild(style);

        // 添加焦点可见类
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('js-focus-visible');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('js-focus-visible');
        });
    }

    /**
     * 增强的跳转链接
     */
    setupSkipLinksEnhanced() {
        const skipLinks = [
            { href: '#main-content', text: '跳转到主内容' },
            { href: '#navigation', text: '跳转到导航' },
            { href: '#contact', text: '跳转到联系表单' }
        ];

        skipLinks.forEach((link, index) => {
            const skipLink = document.createElement('a');
            skipLink.href = link.href;
            skipLink.className = 'skip-link';
            skipLink.textContent = link.text;
            skipLink.setAttribute('aria-label', link.text);

            // 添加跳过样式
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--tech-blue);
                color: white;
                padding: 8px 16px;
                text-decoration: none;
                border-radius: var(--radius-sm);
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;

            skipLink.addEventListener('focus', () => {
                skipLink.style.opacity = '1';
            });

            skipLink.addEventListener('blur', () => {
                skipLink.style.opacity = '0';
            });

            document.body.appendChild(skipLink);
        });
    }

    /**
     * 设置焦点陷阱
     */
    setupFocusTrapping() {
        // 为模态框设置焦点陷阱
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && e.target.closest('.modal, .accessibility-panel')) {
                this.trapFocus(e.target.closest('.modal, .accessibility-panel'));
            }
        });
    }

    /**
     * 焦点陷阱实现
     */
    trapFocus(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * 屏幕阅读器增强
     */
    initScreenReaderEnhancements() {
        this.createLiveRegions();
        this.setupLandmarkRoles();
        this.generateSmartAriaLabels();
    }

    /**
     * 创建实时区域
     */
    createLiveRegions() {
        const regions = [
            { id: 'status-announcements', politeness: 'polite', label: '状态通知' },
            { id: 'content-changes', politeness: 'assertive', label: '内容变化' },
            { id: 'navigation-help', politeness: 'polite', label: '导航帮助' }
        ];

        regions.forEach(region => {
            let liveRegion = document.getElementById(region.id);
            if (!liveRegion) {
                liveRegion = document.createElement('div');
                liveRegion.id = region.id;
                liveRegion.setAttribute('aria-live', region.politeness);
                liveRegion.setAttribute('aria-atomic', 'true');
                liveRegion.setAttribute('aria-label', region.label);
                liveRegion.className = 'sr-only';
                document.body.appendChild(liveRegion);
            }
        });
    }

    /**
     * 设置地标角色
     */
    setupLandmarkRoles() {
        // 为主要区域添加地标角色
        const landmarks = [
            { selector: 'header', role: 'banner' },
            { selector: 'nav', role: 'navigation' },
            { selector: 'main', role: 'main' },
            { selector: 'footer', role: 'contentinfo' },
            { selector: '.hero', role: 'banner' },
            { selector: '.contact', role: 'form' }
        ];

        landmarks.forEach(({ selector, role }) => {
            document.querySelectorAll(selector).forEach(element => {
                if (!element.hasAttribute('role')) {
                    element.setAttribute('role', role);
                }
            });
        });
    }

    /**
     * 生成智能ARIA标签
     */
    generateSmartAriaLabels() {
        // 为图标按钮生成ARIA标签
        document.querySelectorAll('button i, .btn i').forEach(icon => {
            const button = icon.closest('button');
            if (button && !button.getAttribute('aria-label')) {
                const iconClass = Array.from(icon.classList).find(cls =>
                    cls.startsWith('fa-') || cls.includes('icon')
                );

                if (iconClass) {
                    const iconName = iconClass.replace(/^(fa-|icon-)/, '').replace(/-/g, ' ');
                    button.setAttribute('aria-label', iconName);
                }
            }
        });
    }

    /**
     * 减少运动偏好
     */
    initReducedMotion() {
        this.detectReducedMotionPreference();
        this.setupReducedMotionStyles();
    }

    /**
     * 检测减少运动偏好
     */
    detectReducedMotionPreference() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.state.reducedMotion = mediaQuery.matches;

            document.documentElement.classList.toggle('reduced-motion', this.state.reducedMotion);
        }
    }

    /**
     * 设置减少运动样式
     */
    setupReducedMotionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .reduced-motion *,
            .reduced-motion *::before,
            .reduced-motion *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 响应式无障碍
     */
    setupResponsiveAccessibility() {
        // 根据设备类型调整无障碍功能
        if (window.deviceDetector) {
            window.deviceDetector.addDeviceChangeObserver((detail) => {
                this.adjustForDeviceType(detail.deviceCategory);
            });
        }
    }

    /**
     * 根据设备类型调整
     */
    adjustForDeviceType(deviceCategory) {
        // 移动设备特殊处理
        if (deviceCategory.includes('mobile')) {
            this.enableMobileAccessibility();
        }

        // 平板设备特殊处理
        if (deviceCategory === 'tablet') {
            this.enableTabletAccessibility();
        }
    }

    /**
     * 启用移动设备无障碍功能
     */
    enableMobileAccessibility() {
        // 增大触摸目标
        this.enlargeTouchTargets();

        // 启用移动端特定的无障碍功能
        document.body.classList.add('mobile-accessibility');
    }

    /**
     * 启用平板设备无障碍功能
     */
    enableTabletAccessibility() {
        // 平板特有的无障碍设置
        document.body.classList.add('tablet-accessibility');
    }

    /**
     * 增大触摸目标
     */
    enlargeTouchTargets() {
        const style = document.createElement('style');
        style.textContent = `
            .mobile-accessibility button,
            .mobile-accessibility .btn,
            .mobile-accessibility a,
            .mobile-accessibility [role="button"] {
                min-height: 44px;
                min-width: 44px;
                padding: 12px 16px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 增强的键盘导航
     */
    initKeyboardNavigationEnhancements() {
        this.setupRovingTabIndex();
        this.setupKeyboardShortcuts();
        this.setupMenuKeyboardNavigation();
    }

    /**
     * 设置移动焦点指示器
     */
    setupRovingTabIndex() {
        // 为模态框设置移动的焦点指示
        this.setupModalFocusIndicator();
    }

    /**
     * 设置模态框焦点指示器
     */
    setupModalFocusIndicator() {
        // 当模态框打开时，设置移动的焦点指示器
        // 实现细节...
    }

    /**
     * 设置键盘快捷键
     */
    setupKeyboardShortcuts() {
        const shortcuts = {
            'Alt+1': () => this.setTheme('light'),
            'Alt+2': () => this.setTheme('dark'),
            'Alt+3': () => this.setTheme('auto'),
            'Alt+=': () => this.adjustFontSize(2),
            'Alt+-': () => this.adjustFontSize(-2),
            'Alt+0': () => this.resetFontSize(),
            'Alt+C': () => this.toggleHighContrastMode(),
            'Alt+S': () => this.toggleVoiceNavigation(),
            'Escape': () => this.hideAccessibilityPanel()
        };

        document.addEventListener('keydown', (e) => {
            const key = [];
            if (e.altKey) key.push('Alt');
            if (e.ctrlKey) key.push('Ctrl');
            if (e.shiftKey) key.push('Shift');
            key.push(e.key);

            const keyCombo = key.join('+');

            if (shortcuts[keyCombo]) {
                e.preventDefault();
                shortcuts[keyCombo]();
            }
        });
    }

    /**
     * 设置菜单键盘导航
     */
    setupMenuKeyboardNavigation() {
        // 为下拉菜单设置键盘导航
        const dropdowns = document.querySelectorAll('.nav-dropdown');

        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                // 为下拉切换添加键盘支持
                toggle.setAttribute('aria-expanded', 'false');
                toggle.setAttribute('aria-controls', dropdown.id || 'dropdown-content');
            }
        });
    }

    /**
     * 创建可访问按钮
     */
    createAccessibleButton(options) {
        const button = document.createElement('button');
        button.textContent = options.text;
        button.setAttribute('aria-label', options.ariaLabel);
        button.className = 'accessibility-btn';

        if (options.onClick) {
            button.addEventListener('click', options.onClick);
        }

        if (options.class) {
            button.classList.add(...options.class.split(' '));
        }

        return button;
    }

    /**
     * 导航到指定页面
     */
    navigateTo(path) {
        window.location.href = path;
    }

    /**
     * 滚动到顶部
     */
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * 设置主题
     */
    setTheme(theme) {
        window.themeManager?.setTheme(theme);
    }

    /**
     * 语音播报
     */
    announce(message) {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'zh-CN';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            this.speechSynthesis.speak(utterance);
        }
    }

    /**
     * 语音播报字体大小变化
     */
    announceFontSizeChange(size) {
        this.announce(`字体大小已调整为${size}像素`);
    }

    /**
     * 语音播报高对比度变化
     */
    announceHighContrastChange() {
        const status = this.state.highContrastMode ? '已启用' : '已禁用';
        this.announce(`高对比度模式${status}`);
    }

    /**
     * 处理语音错误
     */
    handleVoiceError(error) {
        let errorMessage = '语音识别出现错误';

        switch(error) {
            case 'not-allowed':
                errorMessage = '语音识别被拒绝，请检查麦克风权限';
                break;
            case 'no-speech':
                errorMessage = '未检测到语音输入';
                break;
            case 'service-not-allowed':
                errorMessage = '语音服务不可用';
                break;
            case 'network':
                errorMessage = '网络错误，请检查网络连接';
                break;
        }

        this.announce(errorMessage);
    }

    /**
     * 保存字体大小偏好
     */
    saveFontSizePreference() {
        try {
            localStorage.setItem('mobius-font-size', this.state.currentFontSize);
        } catch (error) {
            console.warn('无法保存字体大小偏好:', error);
        }
    }

    /**
     * 加载字体大小偏好
     */
    loadFontSizePreference() {
        try {
            const saved = localStorage.getItem('mobius-font-size');
            if (saved) {
                const size = parseInt(saved, 10);
                if (size >= this.options.minFontSize && size <= this.options.maxFontSize) {
                    this.state.currentFontSize = size;
                }
            }
        } catch (error) {
            console.warn('无法加载字体大小偏好:', error);
        }
    }

    /**
     * 保存高对比度偏好
     */
    saveHighContrastPreference() {
        try {
            localStorage.setItem('mobius-high-contrast', this.state.highContrastMode);
        } catch (error) {
            console.warn('无法保存高对比度偏好:', error);
        }
    }

    /**
     * 加载高对比度偏好
     */
    loadHighContrastPreference() {
        try {
            const saved = localStorage.getItem('mobius-high-contrast');
            if (saved) {
                this.state.highContrastMode = saved === 'true';
            }
        } catch (error) {
            console.warn('无法加载高对比度偏好:', error);
        }
    }

    /**
     * 添加无障碍面板样式
     */
    addAccessibilityPanelStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border: 2px solid var(--tech-blue);
                border-radius: var(--radius-lg);
                padding: 2rem;
                max-width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10000;
                box-shadow: var(--shadow-xl);
            }

            .accessibility-panel .close-btn {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: var(--accent-red);
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 1.5rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .accessibility-panel .close-btn:hover {
                background: var(--error-red);
                transform: scale(1.1);
            }

            .accessibility-panel h2 {
                margin: 0 0 1.5rem 0;
                color: var(--dark-text);
                font-size: 1.5rem;
            }

            .accessibility-section {
                margin-bottom: 2rem;
                padding-bottom: 1.5rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .accessibility-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
                padding-bottom: 0;
            }

            .accessibility-section h3 {
                margin: 0 0 1rem 0;
                color: var(--dark-text);
                font-size: 1.2rem;
            }

            .font-size-controls {
                display: flex;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1rem;
            }

            .accessibility-btn {
                background: var(--gradient-primary);
                color: white;
                border: none;
                border-radius: var(--radius-sm);
                padding: 0.75rem 1rem;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .accessibility-btn:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }

            .accessibility-btn:active {
                transform: translateY(0);
            }

            .accessibility-btn:active {
                transform: translateY(0);
            }

            .current-font-size {
                background: rgba(59, 130, 246, 0.1);
                padding: 0.5rem 1rem;
                border-radius: var(--radius-sm);
                font-weight: 600;
                min-width: 60px;
                text-align: center;
            }

            .voice-controls button {
                background: var(--info-blue);
                color: white;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .voice-controls button:hover {
                transform: scale(1.1);
                background: var(--success-green);
            }

            /* 响应式适配 */
            @media (max-width: 768px) {
                .accessibility-panel {
                    width: 95vw;
                    padding: 1.5rem;
                }
            }

            /* 高对比度模式适配 */
            [data-high-contrast="true"] .accessibility-panel {
                border-color: #000000;
                background: #ffffff;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 获取无障碍状态
     */
    getAccessibilityState() {
        return {
            fontSize: this.state.currentFontSize,
            highContrast: this.state.highContrastMode,
            voiceNavigation: this.state.voiceNavigationActive,
            reducedMotion: this.state.reducedMotion,
            focusVisible: this.state.focusVisible,
            screenReaderOptimized: this.state.screenReaderOptimized
        };
    }

    /**
     * 获取可用功能
     */
    getAvailableFeatures() {
        return {
            dynamicFontSize: this.options.enableDynamicFontSize,
            highContrastMode: this.options.enableHighContrastMode,
            voiceNavigation: this.options.enableVoiceNavigation,
            gestureControl: this.options.enableGestureControl,
            controlPanel: this.options.enableControlPanel,
            keyboardNavigation: this.options.enableKeyboardNavigation,
            reducedMotion: this.state.reducedMotion,
            deviceCapabilities: this.detectDeviceCapabilities()
        };
    }

    /**
     * 检测设备能力
     */
    detectDeviceCapabilities() {
        return {
            touchSupport: 'ontouchstart' in window,
            speechRecognition: !!(typeof SpeechRecognition === 'undefined' && typeof webkitSpeechRecognition === 'undefined'),
            speechSynthesis: 'speechSynthesis' in window,
            screenReader: navigator.userAgent.includes('NVDA') || navigator.userAgent.includes('JAWS')
        };
    }

    /**
     * 销毁无障碍管理器
     */
    destroy() {
        this.observers.forEach(observer => {
            if (typeof observer === 'function') {
                observer();
            }
        });
        this.observers = [];

        if (this.controlPanel) {
            this.controlPanel.remove();
            this.controlPanel = null;
        }

        // 停止语音识别
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }

        super.destroy();
        console.log('🔧 高级无障碍管理器已销毁');
    }
}

// 创建全局无障碍管理器实例
window.accessibilityManager = new AccessibilityManager({
    enableDynamicFontSize: true,
    enableHighContrastMode: true,
    enableVoiceNavigation: true,
    enableGestureControl: true,
    enableControlPanel: true
});

// 导出到全局作用域
window.AccessibilityManager = AccessibilityManager;

// 自动初始化
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}