/**
 * 知识库筛选引擎
 * 负责处理复杂的筛选逻辑和数据过滤
 */

class KnowledgeFilter {
    constructor() {
        this.allArticles = [];
        this.filteredArticles = [];
        this.currentFilters = {
            category: null,
            subcategory: null,
            quickFilter: 'all',
            difficulty: null,
            search: ''
        };
        this.baseUrl = this.getBaseUrl();
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
     * 初始化筛选器
     */
    async initializeFilter() {
        try {
            const jsonUrl = `${this.baseUrl}data/articles.json`;
            const response = await fetch(jsonUrl);

            if (!response.ok) {
                throw new Error(`Failed to load articles: ${response.status}`);
            }

            const data = await response.json();
            
            // 将所有文章合并到一个数组中
            this.allArticles = [];
            Object.keys(data.categories).forEach(categoryId => {
                data.categories[categoryId].forEach(article => {
                    this.allArticles.push({
                        ...article,
                        categoryId
                    });
                });
            });

            console.log(`✅ 筛选器初始化完成，共 ${this.allArticles.length} 篇文章`);
            return true;

        } catch (error) {
            console.error('❌ 筛选器初始化失败:', error);
            return false;
        }
    }

    /**
     * 应用筛选器
     */
    applyFilters(filters = {}) {
        this.currentFilters = { ...this.currentFilters, ...filters };

        let result = [...this.allArticles];

        // 1. 应用快速筛选
        result = this.applyQuickFilter(result, this.currentFilters.quickFilter);

        // 2. 应用分类筛选
        result = this.applyCategoryFilter(result, this.currentFilters.category, this.currentFilters.subcategory);

        // 3. 应用难度筛选
        result = this.applyDifficultyFilter(result, this.currentFilters.difficulty);

        // 4. 应用搜索筛选
        result = this.applySearchFilter(result, this.currentFilters.search);

        this.filteredArticles = result;
        return this.filteredArticles;
    }

    /**
     * 应用快速筛选
     */
    applyQuickFilter(articles, filterId) {
        switch (filterId) {
            case 'all':
                return [...articles];
            case 'featured':
                return articles.filter(article => article.featured);
            case 'recent':
                return [...articles].sort((a, b) => {
                    const dateA = this.parseChineseDate(a.date);
                    const dateB = this.parseChineseDate(b.date);
                    return dateB - dateA;
                });
            case 'popular':
                return [...articles].sort((a, b) => {
                    const viewsA = parseInt(a.views.replace(/[^0-9]/g, ''));
                    const viewsB = parseInt(b.views.replace(/[^0-9]/g, ''));
                    return viewsB - viewsA;
                });
            default:
                return articles;
        }
    }

    /**
     * 应用分类筛选
     */
    applyCategoryFilter(articles, categoryId, subcategoryId) {
        if (!categoryId) return articles;

        if (subcategoryId) {
            // 需要根据导航数据中的标签来筛选
            return this.filterBySubcategoryTags(articles, categoryId, subcategoryId);
        } else {
            // 筛选指定分类的文章
            return articles.filter(article => article.categoryId === categoryId);
        }
    }

    /**
     * 根据子分类标签筛选
     */
    async filterBySubcategoryTags(articles, categoryId, subcategoryId) {
        try {
            const jsonUrl = `${this.baseUrl}data/articles.json`;
            const response = await fetch(jsonUrl);
            const data = await response.json();

            const category = data.navigation.structure.find(c => c.id === categoryId);
            if (!category) return articles;

            const subcategory = category.children.find(child => child.id === subcategoryId);
            if (!subcategory) return articles;

            return articles.filter(article => {
                return subcategory.tags.some(tag => 
                    article.tags.some(articleTag => 
                        articleTag.toLowerCase().includes(tag.toLowerCase()) ||
                        tag.toLowerCase().includes(articleTag.toLowerCase())
                    )
                );
            });

        } catch (error) {
            console.error('获取子分类标签失败:', error);
            return articles;
        }
    }

    /**
     * 应用难度筛选
     */
    applyDifficultyFilter(articles, difficultyId) {
        if (!difficultyId) return articles;

        const difficultyMap = {
            'beginner': '初级',
            'intermediate': '中级', 
            'advanced': '高级'
        };

        const targetDifficulty = difficultyMap[difficultyId];
        if (!targetDifficulty) return articles;

        return articles.filter(article => article.difficulty === targetDifficulty);
    }

    /**
     * 应用搜索筛选
     */
    applySearchFilter(articles, searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') return articles;

        const searchTerms = searchTerm.toLowerCase().split(/\s+/).filter(term => term.length > 0);

        return articles.filter(article => {
            const searchText = [
                article.title,
                article.excerpt,
                article.category,
                ...article.tags,
                article.difficulty || ''
            ].join(' ').toLowerCase();

            return searchTerms.every(term => searchText.includes(term));
        });
    }

    /**
     * 解析中文日期
     */
    parseChineseDate(dateStr) {
        const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (match) {
            return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }
        return new Date(dateStr);
    }

    /**
     * 获取筛选统计
     */
    getFilterStats() {
        return {
            total: this.allArticles.length,
            filtered: this.filteredArticles.length,
            currentFilters: { ...this.currentFilters }
        };
    }

    /**
     * 获取热门标签
     */
    getPopularTags(limit = 10) {
        const tagCount = {};
        
        this.allArticles.forEach(article => {
            article.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });

        return Object.entries(tagCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([tag, count]) => ({ tag, count }));
    }

    /**
     * 获取推荐文章
     */
    getRecommendedArticles(limit = 3) {
        return this.filteredArticles
            .filter(article => article.featured)
            .slice(0, limit);
    }

    /**
     * 清除筛选
     */
    clearFilters() {
        this.currentFilters = {
            category: null,
            subcategory: null,
            quickFilter: 'all',
            difficulty: null,
            search: ''
        };
        this.filteredArticles = [...this.allArticles];
        return this.filteredArticles;
    }

    /**
     * 获取当前筛选器状态
     */
    getCurrentFilters() {
        return { ...this.currentFilters };
    }

    /**
     * 导出筛选结果
     */
    exportFilteredArticles() {
        return {
            articles: this.filteredArticles,
            filters: this.currentFilters,
            stats: this.getFilterStats(),
            timestamp: new Date().toISOString()
        };
    }
}

// 创建全局实例
window.knowledgeFilter = new KnowledgeFilter();

// 将类暴露给全局作用域
window.KnowledgeFilter = KnowledgeFilter;

// 导出类（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KnowledgeFilter;
}
