/**
 * Mobius 增强性能监控器 - Enhanced Performance Monitor
 * 📊 实时性能监控、用户行为分析、自动优化建议
 *
 * 核心功能:
 * - 实时性能指标监控 (Core Web Vitals)
 * - 用户行为分析 (点击、滚动、停留时间)
 * - 资源加载性能分析
 * - 自动性能优化建议
 * - 性能预警和报告
 * - A/B测试支持
 */

// 确保SafePerformanceOptimizer已加载
if (typeof SafePerformanceOptimizer === 'undefined') {
    // 如果未加载，定义基础类
    class SafePerformanceOptimizer {
        constructor() {
            this.isInitialized = false;
            this.metrics = {
                loadTime: 0,
                renderTime: 0,
                interactionTime: 0
            };
        }

        init() {
            if (this.isInitialized) return;
            this.measurePerformance();
            this.isInitialized = true;
        }

        measurePerformance() {
            window.addEventListener('load', () => {
                const navigation = performance.getEntriesByType('navigation')[0];
                this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
            });
        }

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

        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    }

    // Make it globally available
    window.SafePerformanceOptimizer = SafePerformanceOptimizer;
}

class EnhancedPerformanceMonitor extends SafePerformanceOptimizer {
    constructor(options = {}) {
        super();

        this.enhancedOptions = {
            enableRealTimeMonitoring: true,
            enableUserBehaviorTracking: true,
            enableResourceAnalysis: true,
            enableAutoOptimization: true,
            enableAlerts: true,
            reportingInterval: 30000, // 30秒
            alertThresholds: {
                lcp: 2500, // Largest Contentful Paint
                fid: 100,  // First Input Delay
                cls: 0.1,  // Cumulative Layout Shift
                memoryUsage: 80, // 内存使用率 %
                cpuUsage: 90    // CPU使用率 %
            },
            ...options
        };

        // 增强性能指标
        this.enhancedMetrics = {
            // Core Web Vitals
            lcp: 0,           // Largest Contentful Paint
            fid: 0,           // First Input Delay
            cls: 0,           // Cumulative Layout Shift

            // 导航性能
            domContentLoaded: 0,
            firstByte: 0,

            // 资源性能
            resourceCount: 0,
            totalResourceSize: 0,
            slowResources: [],

            // 用户交互
            clickCount: 0,
            scrollDepth: 0,
            timeOnPage: 0,
            interactions: [],

            // 内存使用
            memoryUsage: 0,
            memoryLimit: 0,

            // 网络信息
            connectionType: 'unknown',
            effectiveType: 'unknown',

            // 设备性能
            deviceScore: 0,
            gpuInfo: 'unknown'
        };

        // 监控状态
        this.isMonitoring = false;
        this.monitoringInterval = null;
        this.observers = new Map();
        this.startTime = Date.now();
        this.lastInteraction = Date.now();

        // 性能历史记录
        this.performanceHistory = [];
        this.alertHistory = [];

        // 用户行为追踪
        this.userBehavior = {
            clicks: [],
            scrolls: [],
            navigation: [],
            formInteractions: [],
            searchQueries: []
        };
    }

    /**
     * 初始化增强性能监控
     */
    initEnhanced() {
        if (this.isMonitoring) return;

        // console.log('🚀 启动增强性能监控系统...');

        this.initCoreWebVitals();
        this.initUserBehaviorTracking();
        this.initResourceAnalysis();
        this.initSystemMonitoring();
        this.startRealTimeMonitoring();
        this.createPerformanceDashboard();

        this.isMonitoring = true;
        // console.log('✅ 增强性能监控已启动');
    }

    /**
     * 核心Web Vitals监控
     */
    initCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.enhancedMetrics.lcp = lastEntry.startTime;
                this.checkThreshold('lcp', this.enhancedMetrics.lcp);
            });

            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.set('lcp', lcpObserver);
            } catch (e) {
                // // console.warn('LCP monitoring not supported:', e);
            }

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (entry.name === 'first-input') {
                        this.enhancedMetrics.fid = entry.processingStart - entry.startTime;
                        this.checkThreshold('fid', this.enhancedMetrics.fid);
                    }
                });
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('fid', fidObserver);
            } catch (e) {
                // // console.warn('FID monitoring not supported:', e);
            }

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((entryList) => {
                for (const entry of entryList.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                this.enhancedMetrics.cls = clsValue;
                this.checkThreshold('cls', this.enhancedMetrics.cls);
            });

            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('cls', clsObserver);
            } catch (e) {
                // // console.warn('CLS monitoring not supported:', e);
            }
        }
    }

    /**
     * 用户行为追踪
     */
    initUserBehaviorTracking() {
        if (!this.enhancedOptions.enableUserBehaviorTracking) return;

        // 点击追踪
        document.addEventListener('click', (e) => {
            const clickData = {
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY,
                target: this.getSafeSelector(e.target),
                page: window.location.pathname
            };

            this.userBehavior.clicks.push(clickData);
            this.enhancedMetrics.clickCount++;
            this.lastInteraction = Date.now();

            // 保持最近100次点击
            if (this.userBehavior.clicks.length > 100) {
                this.userBehavior.clicks.shift();
            }
        });

        // 滚动追踪
        let maxScrollDepth = 0;
        const trackScroll = this.throttle(() => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollDepth = Math.round((window.scrollY / scrollHeight) * 100);
            maxScrollDepth = Math.max(maxScrollDepth, scrollDepth);
            this.enhancedMetrics.scrollDepth = maxScrollDepth;
        }, 1000);

        window.addEventListener('scroll', trackScroll, { passive: true });

        // 页面停留时间
        setInterval(() => {
            this.enhancedMetrics.timeOnPage = Date.now() - this.startTime;
        }, 1000);

        // 表单交互
        document.addEventListener('submit', (e) => {
            this.userBehavior.formInteractions.push({
                timestamp: Date.now(),
                formId: e.target.id || 'unknown',
                action: e.target.action || 'unknown'
            });
        });

        // 搜索查询
        const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="搜索"]');
        searchInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.value.trim()) {
                    this.userBehavior.searchQueries.push({
                        timestamp: Date.now(),
                        query: e.target.value.trim(),
                        inputId: e.target.id || 'unknown'
                    });
                }
            });
        });
    }

    /**
     * 资源加载分析
     */
    initResourceAnalysis() {
        if (!this.enhancedOptions.enableResourceAnalysis) return;

        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');

            this.enhancedMetrics.resourceCount = resources.length;
            this.enhancedMetrics.slowResources = [];

            let totalSize = 0;
            resources.forEach(resource => {
                // 估算资源大小
                const size = this.estimateResourceSize(resource);
                totalSize += size;

                // 识别慢资源 (>2秒)
                if (resource.duration > 2000) {
                    this.enhancedMetrics.slowResources.push({
                        name: resource.name,
                        duration: resource.duration,
                        size: size,
                        type: resource.initiatorType
                    });
                }
            });

            this.enhancedMetrics.totalResourceSize = totalSize;
        });
    }

    /**
     * 系统监控
     */
    initSystemMonitoring() {
        // 内存监控
        if (performance.memory) {
            setInterval(() => {
                this.enhancedMetrics.memoryUsage =
                    (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
                this.enhancedMetrics.memoryLimit = performance.memory.jsHeapSizeLimit;

                this.checkThreshold('memoryUsage', this.enhancedMetrics.memoryUsage);
            }, 5000);
        }

        // 网络信息
        if (navigator.connection) {
            this.enhancedMetrics.connectionType = navigator.connection.type || 'unknown';
            this.enhancedMetrics.effectiveType = navigator.connection.effectiveType || 'unknown';

            navigator.connection.addEventListener('change', () => {
                this.enhancedMetrics.connectionType = navigator.connection.type;
                this.enhancedMetrics.effectiveType = navigator.connection.effectiveType;
            });
        }

        // 设备性能评分
        this.calculateDeviceScore();
    }

    /**
     * 实时监控
     */
    startRealTimeMonitoring() {
        if (!this.enhancedOptions.enableRealTimeMonitoring) return;

        this.monitoringInterval = setInterval(() => {
            this.collectPerformanceSnapshot();
            this.analyzePerformance();
            this.generateOptimizations();
        }, this.enhancedOptions.reportingInterval);
    }

    /**
     * 收集性能快照
     */
    collectPerformanceSnapshot() {
        const snapshot = {
            timestamp: Date.now(),
            metrics: { ...this.enhancedMetrics },
            userBehavior: {
                recentClicks: this.userBehavior.clicks.slice(-10),
                scrollDepth: this.enhancedMetrics.scrollDepth,
                timeOnPage: this.enhancedMetrics.timeOnPage
            },
            system: {
                memoryUsage: this.enhancedMetrics.memoryUsage,
                deviceScore: this.enhancedMetrics.deviceScore,
                connectionType: this.enhancedMetrics.connectionType
            }
        };

        this.performanceHistory.push(snapshot);

        // 保存最近50个快照
        if (this.performanceHistory.length > 50) {
            this.performanceHistory.shift();
        }
    }

    /**
     * 性能分析
     */
    analyzePerformance() {
        const currentMetrics = this.enhancedMetrics;
        const issues = [];
        const recommendations = [];

        // Core Web Vitals分析
        if (currentMetrics.lcp > 2500) {
            issues.push('LCP过慢，影响加载体验');
            recommendations.push('优化关键资源加载，使用预加载');
        }

        if (currentMetrics.fid > 100) {
            issues.push('FID过长，交互响应慢');
            recommendations.push('减少JavaScript执行时间，拆分长任务');
        }

        if (currentMetrics.cls > 0.1) {
            issues.push('CLS过高，页面不稳定');
            recommendations.push('为图片和广告设置尺寸属性');
        }

        // 内存使用分析
        if (currentMetrics.memoryUsage > 80) {
            issues.push('内存使用率过高');
            recommendations.push('检查内存泄漏，优化数据结构');
        }

        // 用户行为分析
        if (currentMetrics.clickCount > 100 && currentMetrics.timeOnPage < 30000) {
            issues.push('用户可能遇到可用性问题');
            recommendations.push('检查页面导航和交互设计');
        }

        return { issues, recommendations };
    }

    /**
     * 生成优化建议
     */
    generateOptimizations() {
        if (!this.enhancedOptions.enableAutoOptimization) return;

        const analysis = this.analyzePerformance();

        if (analysis.recommendations.length > 0) {
            // console.log('🔧 性能优化建议:', analysis.recommendations);

            // 自动应用某些优化
            this.applyAutoOptimizations(analysis.recommendations);
        }
    }

    /**
     * 自动优化应用
     */
    applyAutoOptimizations(recommendations) {
        recommendations.forEach(recommendation => {
            if (recommendation.includes('预加载')) {
                this.enableResourcePreloading();
            }
            if (recommendation.includes('懒加载')) {
                this.enhanceLazyLoading();
            }
            if (recommendation.includes('内存')) {
                this.optimizeMemoryUsage();
            }
        });
    }

    /**
     * 阈值检查和警报
     */
    checkThreshold(metric, value) {
        if (!this.enhancedOptions.enableAlerts) return;

        const threshold = this.enhancedOptions.alertThresholds[metric];
        if (threshold && value > threshold) {
            const alert = {
                metric,
                value,
                threshold,
                timestamp: Date.now(),
                severity: this.getAlertSeverity(metric, value, threshold)
            };

            this.alertHistory.push(alert);
            // // console.warn(`⚠️ 性能警报: ${metric} (${value}) 超过阈值 (${threshold})`);

            this.showPerformanceAlert(alert);
        }
    }

    /**
     * 创建性能仪表板
     */
    createPerformanceDashboard() {
        // 创建性能面板容器
        const dashboard = document.createElement('div');
        dashboard.id = 'performance-dashboard';
        dashboard.className = 'performance-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            min-width: 250px;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // 创建性能指标显示元素
        this.createDashboardContent(dashboard);
        document.body.appendChild(dashboard);

        // 更新仪表板数据
        setInterval(() => {
            this.updateDashboard();
        }, 1000);

        // 切换显示/隐藏
        const toggleBtn = document.getElementById('toggle-dashboard');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const isVisible = dashboard.style.display !== 'none';
                dashboard.style.display = isVisible ? 'none' : 'block';
                toggleBtn.textContent = isVisible ? '显示' : '隐藏';
            });
        }

        // 添加键盘快捷键 (Ctrl+Shift+P)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                const isVisible = dashboard.style.display !== 'none';
                dashboard.style.display = isVisible ? 'none' : 'block';
            }
        });
    }

    /**
     * 创建仪表板内容
     */
    createDashboardContent(dashboard) {
        // 标题
        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.textContent = '🚀 性能监控';
        dashboard.appendChild(title);

        // 性能指标
        const metrics = [
            { id: 'metric-lcp', label: 'LCP:' },
            { id: 'metric-fid', label: 'FID:' },
            { id: 'metric-cls', label: 'CLS:' },
            { id: 'metric-memory', label: '内存:' },
            { id: 'metric-interactions', label: '交互:' },
            { id: 'metric-time', label: '时长:' }
        ];

        metrics.forEach(metric => {
            const metricDiv = document.createElement('div');
            const labelSpan = document.createElement('span');
            labelSpan.textContent = metric.label + ' ';

            const valueSpan = document.createElement('span');
            valueSpan.id = metric.id;
            valueSpan.textContent = '0';

            metricDiv.appendChild(labelSpan);
            metricDiv.appendChild(valueSpan);
            dashboard.appendChild(metricDiv);
        });

        // 控制按钮
        const controls = document.createElement('div');
        controls.style.marginTop = '10px';

        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'toggle-dashboard';
        toggleBtn.textContent = '隐藏';
        toggleBtn.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        `;

        controls.appendChild(toggleBtn);
        dashboard.appendChild(controls);
    }

    /**
     * 更新仪表板
     */
    updateDashboard() {
        const elements = {
            'metric-lcp': this.formatMetric(this.enhancedMetrics.lcp, 'ms'),
            'metric-fid': this.formatMetric(this.enhancedMetrics.fid, 'ms'),
            'metric-cls': this.formatMetric(this.enhancedMetrics.cls, ''),
            'metric-memory': this.formatMetric(this.enhancedMetrics.memoryUsage, '%'),
            'metric-interactions': this.enhancedMetrics.clickCount,
            'metric-time': this.formatMetric(this.enhancedMetrics.timeOnPage / 1000, 's')
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * 工具函数
     */
    getSafeSelector(element) {
        if (!element || !element.tagName) return 'unknown';

        if (element.id) return `#${element.id}`;
        if (element.className) return `.${element.className.split(' ')[0]}`;
        return element.tagName.toLowerCase();
    }

    estimateResourceSize(resource) {
        // 简单的资源大小估算
        if (resource.transferSize) return resource.transferSize;

        const type = resource.initiatorType;
        const baseSizes = {
            'script': 50000,
            'link': 20000,
            'img': 100000,
            'css': 30000
        };

        return baseSizes[type] || 25000;
    }

    calculateDeviceScore() {
        let score = 0;

        // CPU核心数
        if (navigator.hardwareConcurrency) {
            score += navigator.hardwareConcurrency * 10;
        }

        // 内存
        if (navigator.deviceMemory) {
            score += navigator.deviceMemory * 20;
        }

        // 连接速度
        if (navigator.connection) {
            const speedScores = {
                'slow-2g': 10, '2g': 20, '3g': 40, '4g': 60, '5g': 80
            };
            score += speedScores[navigator.connection.effectiveType] || 30;
        }

        this.enhancedMetrics.deviceScore = Math.min(100, score);
    }

    formatMetric(value, unit) {
        if (value === 0) return `0${unit}`;
        if (value < 0.01) return `<0.01${unit}`;
        return `${value.toFixed(1)}${unit}`;
    }

    getAlertSeverity(metric, value, threshold) {
        const ratio = value / threshold;
        if (ratio > 2) return 'critical';
        if (ratio > 1.5) return 'high';
        if (ratio > 1.2) return 'medium';
        return 'low';
    }

    showPerformanceAlert(alert) {
        // 创建临时通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            background: ${alert.severity === 'critical' ? '#dc3545' : '#ffc107'};
            color: ${alert.severity === 'critical' ? 'white' : 'black'};
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;

        const titleDiv = document.createElement('div');
        titleDiv.style.fontWeight = 'bold';
        titleDiv.textContent = '性能警报';

        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${alert.metric}: ${this.formatMetric(alert.value, this.getMetricUnit(alert.metric))}`;

        notification.appendChild(titleDiv);
        notification.appendChild(messageDiv);
        document.body.appendChild(notification);

        // 3秒后自动消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    getMetricUnit(metric) {
        const units = {
            lcp: 'ms',
            fid: 'ms',
            cls: '',
            memoryUsage: '%'
        };
        return units[metric] || '';
    }

    // 增强功能方法
    enableResourcePreloading() {
        // 预加载关键资源
        // console.log('🚀 启用资源预加载优化');
    }

    enhanceLazyLoading() {
        // 增强懒加载功能
        // console.log('🖼️ 启用增强懒加载优化');
    }

    optimizeMemoryUsage() {
        // 内存优化
        if (performance.memory) {
            // 清理不必要的缓存
            this.performanceHistory = this.performanceHistory.slice(-20);
            this.userBehavior.clicks = this.userBehavior.clicks.slice(-50);
        }
        // console.log('🧠 启用内存优化');
    }

    /**
     * 获取完整性能报告
     */
    getEnhancedPerformanceReport() {
        return {
            timestamp: Date.now(),
            summary: {
                deviceScore: this.enhancedMetrics.deviceScore,
                performance: this.getPerformanceGrade(),
                issues: this.analyzePerformance().issues.length
            },
            metrics: this.enhancedMetrics,
            userBehavior: this.userBehavior,
            history: this.performanceHistory.slice(-10),
            alerts: this.alertHistory.slice(-5),
            recommendations: this.analyzePerformance().recommendations,
            system: {
                userAgent: navigator.userAgent,
                connection: this.enhancedMetrics.connectionType,
                effectiveType: this.enhancedMetrics.effectiveType,
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    total: performance.memory.totalJSHeapSize
                } : null
            }
        };
    }

    /**
     * 获取性能等级
     */
    getPerformanceGrade() {
        let score = 100;

        // LCP评分 (0-40分)
        if (this.enhancedMetrics.lcp > 4000) score -= 40;
        else if (this.enhancedMetrics.lcp > 2500) score -= 25;
        else if (this.enhancedMetrics.lcp > 1800) score -= 10;

        // FID评分 (0-30分)
        if (this.enhancedMetrics.fid > 300) score -= 30;
        else if (this.enhancedMetrics.fid > 100) score -= 15;
        else if (this.enhancedMetrics.fid > 50) score -= 5;

        // CLS评分 (0-30分)
        if (this.enhancedMetrics.cls > 0.25) score -= 30;
        else if (this.enhancedMetrics.cls > 0.1) score -= 15;
        else if (this.enhancedMetrics.cls > 0.05) score -= 5;

        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * 导出性能数据
     */
    exportData() {
        const data = {
            metrics: this.enhancedMetrics,
            history: this.performanceHistory,
            alerts: this.alertHistory,
            userBehavior: this.userBehavior,
            report: this.getEnhancedPerformanceReport()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `mobius-performance-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * 停止监控
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }

        this.observers.forEach(observer => {
            observer.disconnect();
        });

        this.observers.clear();
        this.isMonitoring = false;

        // console.log('⏹️ 性能监控已停止');
    }

    /**
     * 销毁监控器
     */
    destroy() {
        this.stopMonitoring();

        const dashboard = document.getElementById('performance-dashboard');
        if (dashboard) {
            dashboard.remove();
        }

        // console.log('🗑️ 增强性能监控器已销毁');
    }
}

// 创建全局增强性能监控实例
window.EnhancedPerformanceMonitor = new EnhancedPerformanceMonitor({
    enableRealTimeMonitoring: true,
    enableUserBehaviorTracking: true,
    enableResourceAnalysis: true,
    enableAutoOptimization: true,
    enableAlerts: true,
    reportingInterval: 30000,
    alertThresholds: {
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        memoryUsage: 80,
        cpuUsage: 90
    }
});

// 页面加载完成后初始化增强性能监控
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.EnhancedPerformanceMonitor.initEnhanced();
    });
} else {
    window.EnhancedPerformanceMonitor.initEnhanced();
}

// 导出到全局作用域
window.EnhancedPerformanceMonitorClass = EnhancedPerformanceMonitor;

// 控制台API (用于调试)
window.mobiusPerformance = {
    getReport: () => window.EnhancedPerformanceMonitor.getEnhancedPerformanceReport(),
    exportData: () => window.EnhancedPerformanceMonitor.exportData(),
    stopMonitoring: () => window.EnhancedPerformanceMonitor.stopMonitoring(),
    startMonitoring: () => window.EnhancedPerformanceMonitor.initEnhanced(),
    getGrade: () => window.EnhancedPerformanceMonitor.getPerformanceGrade()
};

// console.log('📊 增强性能监控器已加载，使用 Ctrl+Shift+P 显示性能面板');