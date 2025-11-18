/**
 * 会话状态管理器
 * 解决浏览器返回键重新加载页面的问题
 */

class SessionManager {
    constructor() {
        this.sessionKey = 'mobius_knowledge_session';
        this.currentPageKey = 'mobius_current_page';
        this.pageStates = new Map();
        this.maxStates = 10; // 最多保存10个页面的状态
    }

    /**
     * 保存当前页面的状态
     */
    savePageState(pageUrl, stateData = {}) {
        const pageState = {
            url: pageUrl,
            timestamp: Date.now(),
            scrollY: window.scrollY,
            filters: stateData.filters || {},
            activeTab: stateData.activeTab || 'all',
            searchQuery: stateData.searchQuery || '',
            expandedCategories: Array.from(stateData.expandedCategories || []),
            ...stateData
        };

        // 存储到内存中
        this.pageStates.set(pageUrl, pageState);

        // 存储到 sessionStorage
        this.saveToSessionStorage();

        // console.log('💾 页面状态已保存:', pageUrl);
    }

    /**
     * 获取指定页面的状态
     */
    getPageState(pageUrl) {
        // 先从内存中获取
        let pageState = this.pageStates.get(pageUrl);

        // 如果内存中没有，从 sessionStorage 获取
        if (!pageState) {
            this.loadFromSessionStorage();
            pageState = this.pageStates.get(pageUrl);
        }

        return pageState;
    }

    /**
     * 恢复页面状态
     */
    restorePageState(pageUrl, restoreCallback) {
        const pageState = this.getPageState(pageUrl);

        if (!pageState) {
            // console.log('⚠️ 没有找到页面状态，使用默认状态');
            return false;
        }

        // console.log('🔄 恢复页面状态:', pageUrl);

        try {
            // 恢复滚动位置
            if (pageState.scrollY > 0) {
                window.scrollTo(0, pageState.scrollY);
            }

            // 恢复过滤器状态
            if (pageState.filters && window.knowledgeNavigation) {
                Object.assign(window.knowledgeNavigation.currentFilters, pageState.filters);
            }

            // 恢复活动标签
            if (pageState.activeTab && window.activateTab) {
                window.activateTab(pageState.activeTab);
            }

            // 恢复搜索查询
            if (pageState.searchQuery && window.knowledgeNavigation) {
                const searchInput = document.getElementById('knowledge-search');
                if (searchInput) {
                    searchInput.value = pageState.searchQuery;
                    window.knowledgeNavigation.searchTerm = pageState.searchQuery;
                }
            }

            // 恢复展开状态
            if (pageState.expandedCategories && window.knowledgeNavigation) {
                window.knowledgeNavigation.expandedCategories = new Set(pageState.expandedCategories);
            }

            // 调用自定义恢复回调
            if (typeof restoreCallback === 'function') {
                restoreCallback(pageState);
            }

            return true;

        } catch (error) {
            console.error('❌ 恢复页面状态失败:', error);
            return false;
        }
    }

    /**
     * 清理过期的页面状态
     */
    cleanupExpiredStates() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30分钟

        for (const [url, state] of this.pageStates.entries()) {
            if (now - state.timestamp > maxAge) {
                this.pageStates.delete(url);
                // console.log('🗑️ 清理过期页面状态:', url);
            }
        }

        // 限制页面状态数量
        if (this.pageStates.size > this.maxStates) {
            const entries = Array.from(this.pageStates.entries());
            entries.sort((a, b) => b[1].timestamp - a[1].timestamp);

            // 删除最旧的状态
            for (let i = this.maxStates; i < entries.length; i++) {
                this.pageStates.delete(entries[i][0]);
            }
        }

        this.saveToSessionStorage();
    }

    /**
     * 保存到 sessionStorage
     */
    saveToSessionStorage() {
        try {
            const data = {
                pageStates: Array.from(this.pageStates.entries()),
                currentPage: window.location.href
            };
            sessionStorage.setItem(this.sessionKey, JSON.stringify(data));
        } catch (error) {
            // console.warn('保存到 sessionStorage 失败:', error);
        }
    }

    /**
     * 从 sessionStorage 加载
     */
    loadFromSessionStorage() {
        try {
            const data = sessionStorage.getItem(this.sessionKey);
            if (data) {
                const parsed = JSON.parse(data);
                this.pageStates = new Map(parsed.pageStates || []);
                // console.log('📦 从 sessionStorage 加载状态');
            }
        } catch (error) {
            // console.warn('从 sessionStorage 加载失败:', error);
        }
    }

    /**
     * 监听页面可见性变化（用于处理返回键）
     */
    setupVisibilityHandler() {
        // 监听页面显示/隐藏
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageShow();
            }
        });

        // 监听 pageshow 事件（处理浏览器返回键）
        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                // console.log('🔙 检测到浏览器返回键，pageshow事件触发');
                this.handlePageShow(true);
            }
        });
    }

    /**
     * 处理页面显示
     */
    handlePageShow(isReturnNavigation = false) {
        const currentPage = window.location.href;
        const previousPage = sessionStorage.getItem(this.currentPageKey);

        if (isReturnNavigation && previousPage && previousPage !== currentPage) {
            // console.log('🔙 从其他页面返回，尝试恢复状态');

            // 如果是从其他页面返回，不恢复状态
            sessionStorage.setItem(this.currentPageKey, currentPage);
            return;
        }

        // 检查是否是刷新页面
        const navigationType = performance.getEntriesByType("navigation")[0]?.type;
        if (navigationType === 'reload') {
            // console.log('🔄 页面刷新，不恢复状态');
            return;
        }

        const pageState = this.getPageState(currentPage);
        if (pageState) {
            // console.log('✅ 找到页面状态，进行恢复');
            this.restorePageState(currentPage);
        }

        sessionStorage.setItem(this.currentPageKey, currentPage);
    }

    /**
     * 初始化会话管理器
     */
    init() {
        // console.log('🚀 初始化会话管理器');

        // 加载已保存的状态
        this.loadFromSessionStorage();

        // 设置事件监听器
        this.setupVisibilityHandler();

        // 定期清理过期状态
        setInterval(() => {
            this.cleanupExpiredStates();
        }, 5 * 60 * 1000); // 每5分钟清理一次

        // 保存当前页面
        this.saveCurrentPage();
    }

    /**
     * 保存当前页面状态
     */
    saveCurrentPage() {
        const currentPage = window.location.href;
        const stateData = {
            filters: window.knowledgeNavigation?.currentFilters,
            activeTab: window.currentActiveTab,
            searchQuery: document.getElementById('knowledge-search')?.value,
            expandedCategories: window.knowledgeNavigation?.expandedCategories
        };

        this.savePageState(currentPage, stateData);
    }

    /**
     * 清除所有状态
     */
    clearAllStates() {
        this.pageStates.clear();
        sessionStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.currentPageKey);
        // console.log('🗑️ 所有页面状态已清除');
    }

    /**
     * 获取状态统计信息
     */
    getStats() {
        return {
            totalStates: this.pageStates.size,
            totalSize: JSON.stringify(Array.from(this.pageStates.entries())).length,
            keys: Array.from(this.pageStates.keys())
        };
    }
}

// 导出类
window.SessionManager = SessionManager;