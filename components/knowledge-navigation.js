/**
 * 知识库导航组件管理器
 * 负责左侧导航栏的渲染和交互
 */

class KnowledgeNavigation {
    constructor() {
        this.navData = null;
        this.currentFilters = {
            category: null,
            subcategory: null,
            quickFilter: null,  // 修复：不要默认选中任何热门标签
            difficulty: null,
            search: '',
            navigationActive: false,
            quickFilterActive: false
        };
        this.expandedCategories = new Set();
        this.baseUrl = this.getBaseUrl();

        // 绑定方法
        this.handleCategoryClick = this.handleCategoryClick.bind(this);
        this.handleSubcategoryClick = this.handleSubcategoryClick.bind(this);
        this.handleQuickFilterClick = this.handleQuickFilterClick.bind(this);
        this.handleDifficultyClick = this.handleDifficultyClick.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
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
        try {
            const jsonUrl = `${this.baseUrl}data/articles.json`;
            const response = await fetch(jsonUrl);

            if (!response.ok) {
                throw new Error(`Failed to load navigation: ${response.status}`);
            }

            const data = await response.json();
            this.navData = data.navigation;

            // 初始化展开状态
            this.navData.structure.forEach(category => {
                if (category.expanded) {
                    this.expandedCategories.add(category.id);
                }
            });

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
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`导航容器 ${containerId} 未找到`);
            return;
        }

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
     * 处理分类点击
     */
    handleCategoryClick(categoryId) {
        const category = this.navData.structure.find(c => c.id === categoryId);
        if (!category) return;

        
        // 切换展开状态
        if (this.expandedCategories.has(categoryId)) {
            this.expandedCategories.delete(categoryId);
        } else {
            this.expandedCategories.add(categoryId);
        }

        // 映射分类点击到统一的数据结构
        const containerMap = {
            'tax': 'tax-articles',
            'legal': 'legal-articles',
            'business': 'subsidy-articles',
            'visa': 'faq-articles'
        };

        const categoryMap = {
            'tax': 'tax',
            'legal': 'legal',
            'business': 'business',
            'visa': 'visa'
        };

        // 更新过滤器为统一结构 - 级联筛选逻辑
        if (this.currentFilters.category === categoryId) {
            // 如果点击已激活的分类，保持选中，只取消热门标签
            this.currentFilters.quickFilter = null;
            this.currentFilters.quickFilterActive = false;
            this.currentFilters.action = 'show-category';
            this.currentFilters.targetContainer = containerMap[categoryId];
            this.currentFilters.dataCategory = categoryMap[categoryId];
            this.currentFilters.dataCategories = [categoryMap[categoryId]];
            this.currentFilters.navigationActive = true;
        } else {
            // 选择新的导航分类
            this.currentFilters = {
                category: categoryId,
                subcategory: null,
                quickFilter: null,
                action: 'show-category',
                targetContainer: containerMap[categoryId],
                dataCategory: categoryMap[categoryId],
                dataCategories: [categoryMap[categoryId]],
                navigationActive: true,
                quickFilterActive: false
            };
        }

        
        // 重新渲染导航
        this.renderNavigation('knowledgeNavigation');

        // 触发筛选事件
        this.triggerFilterChange();
    }

    /**
     * 处理子分类点击
     */
    handleSubcategoryClick(categoryId, subcategoryId) {
        this.currentFilters.category = categoryId;
        this.currentFilters.subcategory = subcategoryId;

        // 设置二级标签筛选的action和相关字段
        const containerMap = {
            'tax': 'tax-articles',
            'legal': 'legal-articles',
            'business': 'business-articles',
            'visa': 'faq-articles',
            'life': 'all-articles' // life分类使用全部容器，因为生活支援内容通常较少
        };

        const categoryMap = {
            'tax': 'tax',
            'legal': 'legal',
            'business': 'business',
            'visa': 'visa',
            'life': 'life'
        };

        this.currentFilters.action = 'show-category-subcategory';
        this.currentFilters.targetContainer = containerMap[categoryId] || 'tax-articles';
        this.currentFilters.dataCategory = categoryMap[categoryId] || 'tax';
        this.currentFilters.dataCategories = [categoryMap[categoryId] || 'tax'];
        this.currentFilters.navigationActive = true;

        // 重新渲染导航
        this.renderNavigation('knowledgeNavigation');

        // 触发筛选事件
        this.triggerFilterChange();
    }

    /**
     * 处理快速筛选点击
     */
    handleQuickFilterClick(filterId) {
                
        // 检查是否有激活的导航分类
        const activeNavigationCategory = this.currentFilters.category;
        const isNavigationActive = this.currentFilters.navigationActive;


        // 映射快速筛选到统一的数据结构
        let filterData = {};

        switch(filterId) {
            case 'filter-all':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选全部内容
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-all',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的全部内容
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-all',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            case 'filter-featured':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选精选内容
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-featured',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        filterBy: 'featured',
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的精选内容
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-featured',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        filterBy: 'featured',
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            case 'filter-articles':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选文章
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-articles',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        filterBy: 'article',
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的文章
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-articles',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        filterBy: 'article',
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            case 'filter-faq':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选FAQ
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-faq',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        filterBy: 'faq',
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的FAQ
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-faq',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        filterBy: 'faq',
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            case 'filter-recent':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选最新内容
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-recent',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        filterBy: 'recent',
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的最新内容
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-recent',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        filterBy: 'recent',
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            case 'filter-popular':
                if (isNavigationActive && activeNavigationCategory) {
                    // 基于当前导航分类筛选热门内容
                    const categoryMap = {
                        'tax': 'tax',
                        'legal': 'legal',
                        'business': 'business',
                        'visa': 'visa'
                    };
                    filterData = {
                        category: activeNavigationCategory,
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-category-popular',
                        targetContainer: this.getContainerId(activeNavigationCategory),
                        dataCategory: categoryMap[activeNavigationCategory],
                        dataCategories: [categoryMap[activeNavigationCategory]],
                        filterBy: 'popular',
                        navigationActive: true,
                        quickFilterActive: true,
                        basedOnNavigation: true,
                        originalNavigationCategory: activeNavigationCategory
                    };
                } else {
                    // 显示所有分类的热门内容
                    filterData = {
                        category: 'all',
                        subcategory: null,
                        quickFilter: filterId,
                        action: 'show-popular',
                        targetContainer: 'tax-articles',
                        dataCategories: ['tax', 'legal', 'business', 'visa'],
                        filterBy: 'popular',
                        navigationActive: false,
                        quickFilterActive: true,
                        basedOnNavigation: false
                    };
                }
                break;
            default:
                filterData = {
                    quickFilter: filterId,
                    navigationActive: false,
                    quickFilterActive: true,
                    basedOnNavigation: false,
                    action: 'show-unknown',
                    category: 'all',
                    targetContainer: 'tax-articles',
                    dataCategories: ['tax', 'legal', 'business', 'visa']
                };
        }

        // 检查是否有对应的导航分类
        const matchingCategory = this.findMatchingNavigationCategory(filterId);
        if (matchingCategory) {
            filterData.targetNavigationCategory = matchingCategory;
        } else {
            filterData.targetNavigationCategory = null;
        }

        this.currentFilters = filterData;


        // 重新渲染导航
        this.renderNavigation('knowledgeNavigation');

        // 触发筛选事件
        this.triggerFilterChange();
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
     * 处理难度筛选点击
     */
    handleDifficultyClick(difficultyId) {
        if (this.currentFilters.difficulty === difficultyId) {
            this.currentFilters.difficulty = null;
        } else {
            this.currentFilters.difficulty = difficultyId;
        }

        // 设置难度筛选的action和相关字段
        if (this.currentFilters.category && this.currentFilters.category !== 'all') {
            // 如果有选中的分类，进行分类内难度筛选
            const containerMap = {
                'tax': 'tax-articles',
                'legal': 'legal-articles',
                'business': 'business-articles',
                'visa': 'faq-articles',
                'all': 'all-articles'
            };

            const categoryMap = {
                'tax': 'tax',
                'legal': 'legal',
                'business': 'business',
                'visa': 'visa',
                'all': 'all'
            };

            this.currentFilters.action = 'show-category-difficulty';
            this.currentFilters.targetContainer = containerMap[this.currentFilters.category] || 'all-articles';
            this.currentFilters.dataCategory = categoryMap[this.currentFilters.category] || 'tax';
            this.currentFilters.dataCategories = [categoryMap[this.currentFilters.category] || 'tax'];
            this.currentFilters.navigationActive = true;
        } else {
            // 如果没有选中分类，进行全局难度筛选
            this.currentFilters.action = 'show-difficulty';
            this.currentFilters.targetContainer = 'all-articles';
            this.currentFilters.dataCategory = 'all';
            this.currentFilters.dataCategories = ['tax', 'legal', 'business', 'visa'];
            this.currentFilters.navigationActive = false;
        }

        // 重新渲染导航
        this.renderNavigation('knowledgeNavigation');

        // 触发筛选事件
        this.triggerFilterChange();
    }

    /**
     * 处理搜索
     */
    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm.trim();

        // 触发筛选事件
        this.triggerFilterChange();
    }

    /**
     * 清除搜索
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

        this.currentFilters.search = '';
        this.triggerFilterChange();
    }

    /**
     * 触发筛选变化事件
     */
    triggerFilterChange() {
        console.log('准备触发事件, 当前filters:', this.currentFilters);

        // 添加数据容器状态信息到事件数据中
        const hasDataContainer2 = window.articleCardManager && window.articleCardManager.hasDataContainer2();
        const eventData = {
            filters: { ...this.currentFilters },
            hasDataContainer2: hasDataContainer2
        };
        console.log('事件数据:', eventData);

        const event = new CustomEvent('navigationFilterChange', {
            detail: eventData
        });
        console.log('事件已创建，准备发送');
        document.dispatchEvent(event);
        console.log('事件已发送');
    }

    /**
     * 获取当前筛选器状态
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * 设置筛选器状态
     */
    setFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        this.renderNavigation('knowledgeNavigation');
        this.triggerFilterChange();
    }

    /**
     * 清除所有筛选器
     */
    clearAllFilters() {
        this.currentFilters = {
            category: null,
            subcategory: null,
            quickFilter: 'all',
            difficulty: null,
            search: ''
        };

        const searchInput = document.getElementById('knowledge-search');
        if (searchInput) {
            searchInput.value = '';
        }

        const clearButton = document.querySelector('.search-clear');
        if (clearButton) {
            clearButton.style.display = 'none';
        }

        this.renderNavigation('knowledgeNavigation');
        this.triggerFilterChange();
    }
}

// 将类暴露给全局作用域
window.KnowledgeNavigation = KnowledgeNavigation;
