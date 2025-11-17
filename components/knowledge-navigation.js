/**
 * 知识库导航组件管理器
 * 负责左侧导航栏的渲染和交互
 * 重构为纯导航组件，只负责交互和事件发送
 */

// 导入事件总线和事件类型
import globalEventBus, { EVENT_TYPES } from './event-bus.js';

class KnowledgeNavigation {
    constructor(eventBus = null) {
        // 注入依赖的事件总线
        this.eventBus = eventBus || globalEventBus;

        this.navData = null;
        this.cacheManager = new CacheManager();
        this.expandedCategories = new Set();
        this.baseUrl = this.getBaseUrl();
        this.isNavigationInitialized = false;
        this.lastRenderedState = null;
        this.isRendering = false;

        // 绑定方法
        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleSubcategoryClick = this.handleSubcategoryClick.bind(this);
        this.handleQuickFilterClick = this.handleQuickFilterClick.bind(this);
        this.handleDifficultyClick = this.handleDifficultyClick.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        console.log('🧭 KnowledgeNavigation initialized with event bus');
    }

    /**
     * 刷新缓存数据
     */
    async refreshCache() {
        console.log('🔄 手动刷新导航缓存...');
        try {
            const jsonUrl = `${this.baseUrl}data/articles.json`;
            const result = await this.cacheManager.forceRefresh(jsonUrl);

            if (result.data) {
                this.navData = result.data.navigation;
                this.isNavigationInitialized = true;
                console.log('✅ 缓存刷新完成');
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ 缓存刷新失败:', error);
            return false;
        }
    }

    /**
     * 获取基础URL路径
     */
    getBaseUrl() {
        const path = window.location.pathname;
        if (path.includes('/knowledge/')) {
            return '../';
        }
        return './';
    }

    /**
     * 初始化导航数据
     */
    async initializeNavigation() {
        // 防止重复初始化
        if (this.isNavigationInitialized) {
            console.log('🔄 导航已初始化，跳过重复加载');
            return true;
        }

        try {
            console.log('🚀 开始初始化导航系统...');

            const jsonUrl = `${this.baseUrl}data/articles.json`;
            console.log(`📡 加载导航数据（智能缓存）...`);

            // 使用缓存管理器加载数据
            const result = await this.cacheManager.loadData(jsonUrl);

            if (!result.data) {
                throw new Error('无法加载导航数据');
            }

            this.navData = result.data.navigation;

            // 显示缓存信息
            const cacheInfo = this.cacheManager.getCacheInfo();
            console.log(`📊 缓存信息: ${result.fromCache ? '命中缓存' : '网络加载'}, 版本: ${cacheInfo.version}, 大小: ${cacheInfo.sizeKB}KB`);

            if (result.expired) {
                console.log('⚠️ 使用的是过期缓存数据');
            }

            // 初始化展开状态
            this.navData.structure.forEach(category => {
                if (category.expanded) {
                    this.expandedCategories.add(category.id);
                }
            });

            this.isNavigationInitialized = true;
            console.log('🎉 导航系统初始化完成');
            return true;

        } catch (error) {
            console.error('❌ 导航数据加载失败:', error);
            return false;
        }
    }

    /**
     * 创建DOM元素 (安全方式)
     */
    createElement(tag, className = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    }

    /**
     * 创建文本节点
     */
    createTextNode(text) {
        return document.createTextNode(text);
    }

    /**
     * 创建图标元素
     */
    createIcon(iconClass) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        return icon;
    }

    /**
     * 渲染完整导航栏
     */
    renderNavigation(containerId) {
        // 防止重复渲染
        if (this.isRendering) {
            console.log('⏸️ 导航正在渲染中，跳过重复调用');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`导航容器 ${containerId} 未找到`);
            return;
        }

        // 创建当前状态的哈希值，用于比较
        const currentState = JSON.stringify({
            category: this.currentFilters.category,
            subcategory: this.currentFilters.subcategory,
            quickFilter: this.currentFilters.quickFilter,
            difficulty: this.currentFilters.difficulty,
            expandedCategories: Array.from(this.expandedCategories).sort()
        });

        // 如果状态没有变化，跳过渲染
        if (this.lastRenderedState === currentState) {
            console.log('🔄 导航状态未变化，跳过重新渲染');
            return;
        }

        this.isRendering = true;
        console.log('🎨 开始渲染导航...');

        try {
            container.innerHTML = '';
            container.className = 'knowledge-navigation';

            // 搜索框
            const searchSection = this.renderSearchSection();
            container.appendChild(searchSection);

            // 快速筛选
            const quickFiltersSection = this.renderQuickFiltersSection();
            container.appendChild(quickFiltersSection);

            // 主导航结构
            const mainNavSection = this.renderMainNavigationSection();
            container.appendChild(mainNavSection);

            // 难度筛选
            const difficultySection = this.renderDifficultySection();
            container.appendChild(difficultySection);

            // 缓存当前状态
            this.lastRenderedState = currentState;
            console.log('✅ 导航渲染完成');

        } catch (error) {
            console.error('❌ 导航渲染失败:', error);
        } finally {
            this.isRendering = false;
        }
    }

    
    /**
     * 渲染搜索框
     */
    renderSearchSection() {
        const section = this.createElement('div', 'nav-search-section');

        const searchContainer = this.createElement('div', 'search-container');
        const searchInput = this.createElement('input', 'search-input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索知识库...';
        searchInput.id = 'knowledge-search';

        const searchIcon = this.createElement('div', 'search-icon');
        searchIcon.appendChild(this.createIcon('fas fa-search'));

        const clearButton = this.createElement('button', 'search-clear');
        clearButton.textContent = '×';
        clearButton.style.display = 'none';
        clearButton.onclick = () => this.clearSearch();

        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(clearButton);

        // 搜索事件绑定
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
                clearButton.style.display = e.target.value ? 'block' : 'none';
            }, 300);
        });

        // 快捷键支持
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });

        section.appendChild(searchContainer);
        return section;
    }

    /**
     * 渲染快速筛选
     */
    renderQuickFiltersSection() {
        const section = this.createElement('div', 'nav-quick-filters');

        const title = this.createElement('h4', 'nav-section-title');
        title.appendChild(this.createIcon('fas fa-filter'));
        title.appendChild(this.createTextNode('快速筛选'));
        section.appendChild(title);

        const filtersContainer = this.createElement('div', 'filters-grid');

        if (this.navData.quickFilters) {
                    } else {
            console.warn('⚠️ 快速筛选数据未加载');
            return section;
        }

        this.navData.quickFilters.forEach(filter => {
            const filterButton = this.createElement('button', 'filter-button');

            if (this.currentFilters.quickFilterActive && this.currentFilters.quickFilter === filter.id) {
                filterButton.classList.add('active');
            } else {
                filterButton.classList.remove('active');
            }

            
            const icon = this.createIcon(filter.icon);
            const label = document.createElement('span');
            label.textContent = filter.name;

            filterButton.appendChild(icon);
            filterButton.appendChild(label);
            filterButton.title = filter.description;

            filterButton.onclick = () => this.handleQuickFilterClick(filter.id);
            filtersContainer.appendChild(filterButton);
        });

        section.appendChild(filtersContainer);
        return section;
    }

    /**
     * 渲染主导航结构
     */
    renderMainNavigationSection() {
        const section = this.createElement('div', 'nav-main-navigation');

        const title = this.createElement('h4', 'nav-section-title');
        title.appendChild(this.createIcon('fas fa-folder-tree'));
        title.appendChild(this.createTextNode('分类浏览'));
        section.appendChild(title);

        const navTree = this.createElement('div', 'nav-tree');

        this.navData.structure.forEach(category => {
            const categoryNode = this.renderCategoryNode(category);
            navTree.appendChild(categoryNode);
        });

        section.appendChild(navTree);
        return section;
    }

    /**
     * 渲染分类节点
     */
    renderCategoryNode(category) {
        const node = this.createElement('div', 'nav-category');

        if (this.currentFilters.category === category.id) {
            node.classList.add('active');
        }

        // 分类头部
        const header = this.createElement('div', 'nav-category-header');

        const expandIcon = this.createElement('div', 'nav-expand-icon');
        expandIcon.appendChild(this.createIcon(
            this.expandedCategories.has(category.id) ?
            'fas fa-chevron-down' : 'fas fa-chevron-right'
        ));

        const categoryIcon = this.createElement('div', 'nav-category-icon');
        categoryIcon.style.color = category.color;
        categoryIcon.appendChild(this.createIcon(category.icon));

        const categoryInfo = this.createElement('div', 'nav-category-info');
        const categoryName = this.createElement('span', 'nav-category-name');
        categoryName.textContent = category.name;
        const categoryCount = this.createElement('span', 'nav-category-count');
        categoryCount.textContent = category.count;

        categoryInfo.appendChild(categoryName);
        categoryInfo.appendChild(categoryCount);

        header.appendChild(expandIcon);
        header.appendChild(categoryIcon);
        header.appendChild(categoryInfo);

        header.onclick = () => this.handleCategoryClick(category.id);
        header.setAttribute('data-category-id', category.id);

        node.appendChild(header);

        // 子分类容器
        if (category.children && category.children.length > 0) {
            const childrenContainer = this.createElement('div', 'nav-children');
            childrenContainer.style.display =
                this.expandedCategories.has(category.id) ? 'block' : 'none';

            category.children.forEach(child => {
                const childNode = this.renderSubcategoryNode(child, category.id);
                childrenContainer.appendChild(childNode);
            });

            node.appendChild(childrenContainer);
        }

        return node;
    }

    /**
     * 渲染子分类节点
     */
    renderSubcategoryNode(subcategory, parentId) {
        const node = this.createElement('div', 'nav-subcategory');

        if (this.currentFilters.category === parentId &&
            this.currentFilters.subcategory === subcategory.id) {
            node.classList.add('active');
        }

        const icon = this.createElement('div', 'nav-subcategory-icon');
        icon.style.color = '#64748b';
        icon.appendChild(this.createIcon(subcategory.icon));

        const info = this.createElement('div', 'nav-subcategory-info');
        const name = this.createElement('span', 'nav-subcategory-name');
        name.textContent = subcategory.name;
        const count = this.createElement('span', 'nav-subcategory-count');
        count.textContent = subcategory.count;

        info.appendChild(name);
        info.appendChild(count);

        node.appendChild(icon);
        node.appendChild(info);

        node.onclick = () => this.handleSubcategoryClick(parentId, subcategory.id);
        node.title = subcategory.description;

        return node;
    }

    /**
     * 渲染难度筛选
     */
    renderDifficultySection() {
        const section = this.createElement('div', 'nav-difficulty-filters');

        const title = this.createElement('h4', 'nav-section-title');
        title.appendChild(this.createIcon('fas fa-layer-group'));
        title.appendChild(this.createTextNode('难度级别'));
        section.appendChild(title);

        const filtersContainer = this.createElement('div', 'difficulty-filters');

        this.navData.difficultyFilters.forEach(difficulty => {
            const filterButton = this.createElement('button', 'difficulty-button');

            if (this.currentFilters.difficulty === difficulty.id) {
                filterButton.classList.add('active');
            }

            filterButton.style.setProperty('--difficulty-color', difficulty.color);

            const icon = this.createIcon(difficulty.icon);
            const label = document.createElement('span');
            label.textContent = difficulty.name;

            filterButton.appendChild(icon);
            filterButton.appendChild(label);
            filterButton.title = difficulty.description;

            filterButton.onclick = () => this.handleDifficultyClick(difficulty.id);
            filtersContainer.appendChild(filterButton);
        });

        section.appendChild(filtersContainer);
        return section;
    }

    /**
     * 处理分类点击 - 重构为纯事件发送
     */
    handleCategoryClick(categoryId) {
        console.log(`🧭 分类点击: ${categoryId}`);

        // 特殊处理"全部"分类
        if (categoryId === 'all') {
            this.eventBus.emit(EVENT_TYPES.NAV_CATEGORY_CLICK, {
                type: 'category',
                value: 'all',
                action: 'show-all',
                metadata: {
                    source: 'navigation',
                    resetFilters: true
                }
            });

            // 只更新展开状态，不触发内容变更
            this.renderNavigation('knowledgeNavigation');
            return;
        }

        const category = this.navData.structure.find(c => c.id === categoryId);
        if (!category) {
            console.warn(`⚠️ 未找到分类: ${categoryId}`);
            return;
        }

        // 发送分类点击事件
        this.eventBus.emit(EVENT_TYPES.NAV_CATEGORY_CLICK, {
            type: 'category',
            value: categoryId,
            action: 'show-category',
            metadata: {
                source: 'navigation',
                categoryName: category.name,
                categoryIcon: category.icon,
                categoryColor: category.color,
                resetFilters: true
            }
        });

        // 处理展开/折叠状态
        this.toggleCategoryExpansion(categoryId);

        // 重新渲染导航
        this.renderNavigation('knowledgeNavigation');
    }

    /**
     * 切换分类展开状态
     * @param {string} categoryId - 分类ID
     */
    toggleCategoryExpansion(categoryId) {
        if (this.expandedCategories.has(categoryId)) {
            this.expandedCategories.delete(categoryId);
        } else {
            this.expandedCategories.add(categoryId);
        }

        this.updateExpandedStateOnly();
    }

    /**
     * 仅更新展开状态，不触发完整重新渲染
     */
    updateExpandedStateOnly() {
        console.log('📁 仅更新展开状态');

        // 更新展开/折叠图标
        this.navData.structure.forEach(category => {
            const header = document.querySelector(`[data-category-id="${category.id}"] .nav-expand-icon i`);
            if (header) {
                header.className = this.expandedCategories.has(category.id) ?
                    'fas fa-chevron-down' : 'fas fa-chevron-right';
            }

            const childrenContainer = document.querySelector(`[data-category-id="${category.id}"] + .nav-children`);
            if (childrenContainer) {
                childrenContainer.style.display = this.expandedCategories.has(category.id) ? 'block' : 'none';
            }
        });
    }

    /**
     * 处理子分类点击 - 重构为纯事件发送
     */
    handleSubcategoryClick(categoryId, subcategoryId) {
        console.log(`🧭 子分类点击: ${categoryId}/${subcategoryId}`);

        // 发送子分类点击事件
        this.eventBus.emit(EVENT_TYPES.NAV_CATEGORY_CLICK, {
            type: 'subcategory',
            value: { categoryId, subcategoryId },
            action: 'show-category-subcategory',
            metadata: {
                source: 'navigation',
                resetFilters: false
            }
        });
    }

    /**
     * 处理快速筛选点击 - 重构为纯事件发送
     */
    handleQuickFilterClick(filterId) {
        console.log(`🧭 快速筛选点击: ${filterId}`);

        // 发送快速筛选点击事件
        this.eventBus.emit(EVENT_TYPES.NAV_TAG_CLICK, {
            type: 'quickFilter',
            value: filterId,
            action: 'filter-by-tag',
            metadata: {
                source: 'navigation',
                filterType: this.getQuickFilterType(filterId),
                resetFilters: false
            }
        });

        // 重新渲染导航以更新UI状态
        this.renderNavigation('knowledgeNavigation');
    }

    /**
     * 根据分类ID获取容器ID
     */
    getContainerId(categoryId) {
        const containerMap = {
            'tax': 'tax-articles',
            'legal': 'legal-articles',
            'business': 'business-articles',  // 修复：直接映射到对应的容器
            'visa': 'visa-articles'           // 修复：直接映射到对应的容器
        };
        return containerMap[categoryId] || 'tax-articles';
    }

    /**
     * 查找与快速筛选匹配的导航分类
     */
    findMatchingNavigationCategory(filterId) {
        const categoryMap = {
            'all': null,          // 全部内容不对应任何具体分类
            'featured': null,     // 精选内容不对应任何具体分类
            'articles': null,     // 文章不对应任何具体分类
            'faq': null           // FAQ不对应任何具体分类
        };

        return categoryMap[filterId] || null;
    }

    /**
     * 处理难度筛选点击 - 重构为纯事件发送
     */
    handleDifficultyClick(difficultyId) {
        console.log(`🧭 难度筛选点击: ${difficultyId}`);

        // 发送难度筛选点击事件
        this.eventBus.emit(EVENT_TYPES.NAV_DIFFICULTY_CLICK, {
            type: 'difficulty',
            value: difficultyId,
            action: 'filter-by-difficulty',
            metadata: {
                source: 'navigation',
                resetFilters: false
            }
        });

        // 重新渲染导航以更新UI状态
        this.renderNavigation('knowledgeNavigation');
    }

    /**
     * 处理搜索 - 重构为纯事件发送
     */
    handleSearch(searchTerm) {
        console.log(`🧭 搜索: "${searchTerm}"`);

        // 发送搜索事件
        this.eventBus.emit(EVENT_TYPES.NAV_SEARCH, {
            type: 'search',
            value: searchTerm.trim(),
            action: 'search-content',
            metadata: {
                source: 'navigation'
            }
        });
    }

    /**
     * 清除搜索 - 重构为纯事件发送
     */
    clearSearch() {
        const searchInput = document.getElementById('knowledge-search');
        if (searchInput) {
            searchInput.value = '';
        }

        const clearButton = document.querySelector('.search-clear');
        if (clearButton) {
            clearButton.style.display = 'none';
        }

        // 发送清除搜索事件
        this.eventBus.emit(EVENT_TYPES.NAV_SEARCH, {
            type: 'search',
            value: '',
            action: 'clear-search',
            metadata: {
                source: 'navigation'
            }
        });
    }

    /**
     * 获取快速筛选类型
     * @param {string} filterId - 筛选器ID
     */
    getQuickFilterType(filterId) {
        const filterTypes = {
            'filter-all': 'all',
            'filter-featured': 'featured',
            'filter-articles': 'articles',
            'filter-faq': 'faq',
            'filter-recent': 'recent',
            'filter-popular': 'popular'
        };

        return filterTypes[filterId] || 'unknown';
    }
}

// 将类暴露给全局作用域
window.KnowledgeNavigation = new KnowledgeNavigation();
window.knowledgeNavigation = window.KnowledgeNavigation; // 添加小写别名

// 等待DOM加载完成和数据可用后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 等待一小段时间确保事件总线和状态管理器已加载
    setTimeout(async () => {
        if (window.knowledgeNavigation && window.knowledgeNavigation.isNavigationInitialized === false) {
            try {
                console.log('🧭 自动初始化导航组件...');
                await window.knowledgeNavigation.initializeNavigation();
            } catch (error) {
                console.warn('⚠️ 自动初始化导航失败:', error);
            }
        }
    }, 500);
});

/**
 * 知识库导航移动端抽屉功能
 * 为移动设备添加汉堡菜单和抽屉效果
 */
class KnowledgeNavigationDrawer {
    constructor() {
        this.isOpen = false;
        this.hamburger = null;
        this.overlay = null;
        this.navigation = null;
        this.init();
    }

    init() {
        this.createMobileElements();
        this.bindEvents();
        this.checkScreenSize();

        // 监听屏幕大小变化
        window.addEventListener('resize', () => {
            this.checkScreenSize();
        });
    }

    createMobileElements() {
        // 创建汉堡菜单按钮
        this.hamburger = document.createElement('div');
        this.hamburger.className = 'knowledge-nav-hamburger';
        this.hamburger.id = 'knowledgeNavHamburger';
        this.hamburger.innerHTML = '<span></span><span></span><span></span>';
        this.hamburger.style.cssText = `
            display: none;
            position: fixed;
            top: 80px;
            left: 20px;
            z-index: 1002;
            background: white;
            border-radius: 8px;
            padding: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        // 创建遮罩层
        this.overlay = document.createElement('div');
        this.overlay.className = 'knowledge-nav-overlay';
        this.overlay.id = 'knowledgeNavOverlay';
        this.overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // 添加到页面
        document.body.appendChild(this.hamburger);
        document.body.appendChild(this.overlay);

        // 获取导航元素
        this.navigation = document.getElementById('knowledgeNavigation');
    }

    bindEvents() {
        // 汉堡菜单点击事件
        this.hamburger.addEventListener('click', () => {
            this.toggle();
        });

        // 遮罩层点击事件
        this.overlay.addEventListener('click', () => {
            this.close();
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    checkScreenSize() {
        const isMobile = window.innerWidth <= 768;
        const navigation = document.getElementById('knowledgeNavigation');

        if (navigation) {
            if (isMobile) {
                // 移动端样式
                navigation.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 280px;
                    height: 100%;
                    background: white;
                    z-index: 1001;
                    transform: translateX(-100%);
                    transition: transform 0.3s ease;
                    box-shadow: 2px 0 10px rgba(0,0,0,0.1);
                `;

                // 显示汉堡菜单
                this.hamburger.style.display = 'block';
            } else {
                // 桌面端样式
                navigation.style.cssText = `
                    position: static;
                    transform: translateX(0);
                    box-shadow: none;
                    width: 280px;
                `;

                // 隐藏汉堡菜单
                this.hamburger.style.display = 'none';

                // 关闭抽屉（如果是打开状态）
                if (this.isOpen) {
                    this.close();
                }
            }
        }
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;

        // 更新汉堡菜单状态
        this.hamburger.classList.add('active');

        // 显示遮罩层
        this.overlay.style.display = 'block';
        setTimeout(() => {
            this.overlay.style.opacity = '1';
        }, 10);

        // 滑入导航
        if (this.navigation) {
            this.navigation.style.transform = 'translateX(0)';
        }

        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;

        // 更新汉堡菜单状态
        this.hamburger.classList.remove('active');

        // 隐藏遮罩层
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);

        // 滑出导航
        if (this.navigation) {
            this.navigation.style.transform = 'translateX(-100%)';
        }

        // 恢复背景滚动
        document.body.style.overflow = '';
    }
}

// 添加移动端抽屉样式
if (!document.querySelector('#knowledge-nav-drawer-styles')) {
    const style = document.createElement('style');
    style.id = 'knowledge-nav-drawer-styles';
    style.textContent = `
        /* 汉堡菜单按钮样式 */
        .knowledge-nav-hamburger span {
            display: block;
            width: 20px;
            height: 2px;
            background: #333;
            margin: 3px 0;
            transition: all 0.3s ease;
            border-radius: 1px;
        }

        .knowledge-nav-hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(4px, 4px);
        }

        .knowledge-nav-hamburger.active span:nth-child(2) {
            opacity: 0;
        }

        .knowledge-nav-hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(4px, -4px);
        }

        .knowledge-nav-hamburger:hover {
            background: #f8f9fa !important;
            transform: scale(1.05);
        }

        /* 确保在移动端的知识库文章内容不重叠 */
        @media (max-width: 768px) {
            .zhihu-article-wrapper {
                margin-left: 0 !important;
                padding: 20px !important;
            }

            /* 遮罩层显示时防止页面滚动 */
            body.nav-open {
                overflow: hidden;
            }
        }

        /* 移动端导航项点击后自动关闭抽屉 */
        @media (max-width: 768px) {
            .knowledge-navigation .nav-category-header,
            .knowledge-navigation .nav-subcategory,
            .knowledge-navigation .filter-button,
            .knowledge-navigation .difficulty-button {
                cursor: pointer;
            }
        }
    `;
    document.head.appendChild(style);
}

// 自动初始化移动端抽屉功能
document.addEventListener('DOMContentLoaded', () => {
    // 等待知识库导航加载完成后再初始化抽屉
    setTimeout(() => {
        if (!window.knowledgeNavigationDrawer) {
            window.knowledgeNavigationDrawer = new KnowledgeNavigationDrawer();
            console.log('✅ 知识库导航移动端抽屉功能已初始化');
        }
    }, 500);
});

// 暴露类到全局作用域
window.KnowledgeNavigationDrawer = KnowledgeNavigationDrawer;

// ES6 模块导出
export { KnowledgeNavigation, KnowledgeNavigationDrawer };
export default KnowledgeNavigation;
