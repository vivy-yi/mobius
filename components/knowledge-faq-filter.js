/**
 * 知识库文章FAQ过滤器
 * 为知识库页面的FAQ部分提供筛选功能
 * 支持难度级别筛选：初级、中级、高级
 */

class KnowledgeFAQFilter {
    constructor() {
        this.activeFilter = 'all';
        this.faqContainers = [];
        this.filterControls = [];
        this.init();
    }

    /**
     * 初始化FAQ过滤器
     */
    init() {
        this.findFAQElements();
        this.bindEvents();
        // console.log('✅ 知识库FAQ过滤器初始化完成');
    }

    /**
     * 查找FAQ相关元素
     */
    findFAQElements() {
        // 查找FAQ控制面板
        this.filterControls = document.querySelectorAll('.faq-controls');

        // 查找FAQ容器（使用多种可能的选择器）
        const containerSelectors = [
            '.faq-container',
            '.faq-list',
            '.faqs-container',
            '.faq-section',
            '[class*="faq"]'
        ];

        containerSelectors.forEach(selector => {
            const containers = document.querySelectorAll(selector);
            containers.forEach(container => {
                // 检查容器是否包含FAQ项目
                const hasItems = container.querySelector('li, .faq-item, [class*="question"], [class*="item"]');
                if (hasItems && !this.faqContainers.includes(container)) {
                    this.faqContainers.push(container);
                }
            });
        });

        // console.log(`找到 ${this.filterControls.length} 个FAQ控制面板和 ${this.faqContainers.length} 个FAQ容器`);
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 为每个FAQ控制面板绑定事件
        this.filterControls.forEach(control => {
            const filterButtons = control.querySelectorAll('button, [data-filter], [data-difficulty]');

            filterButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleFilterClick(button);
                });
            });
        });

        // 如果没有找到控制面板，创建简单的控制面板
        if (this.filterControls.length === 0 && this.faqContainers.length > 0) {
            this.createSimpleFilterControls();
        }
    }

    /**
     * 处理筛选按钮点击
     */
    handleFilterClick(button) {
        // 获取筛选类型
        let filterType = 'all';

        // 从按钮文本获取筛选类型
        const buttonText = button.textContent.trim();
        if (buttonText.includes('初级') || buttonText.includes('beginner')) {
            filterType = 'beginner';
        } else if (buttonText.includes('中级') || buttonText.includes('intermediate')) {
            filterType = 'intermediate';
        } else if (buttonText.includes('高级') || buttonText.includes('advanced')) {
            filterType = 'advanced';
        } else if (buttonText.includes('全部') || buttonText.includes('all')) {
            filterType = 'all';
        }

        // 从data属性获取筛选类型
        if (button.dataset.filter) {
            filterType = button.dataset.filter;
        } else if (button.dataset.difficulty) {
            filterType = button.dataset.difficulty;
        }

        // 更新按钮状态
        const siblings = button.parentElement.querySelectorAll('button');
        siblings.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // 应用筛选
        this.activeFilter = filterType;
        this.applyFilter();

        // console.log(`FAQ筛选器: ${filterType}`);
    }

    /**
     * 应用筛选到所有FAQ容器
     */
    applyFilter() {
        this.faqContainers.forEach(container => {
            this.filterContainer(container);
        });
    }

    /**
     * 筛选单个容器
     */
    filterContainer(container) {
        // 查找FAQ项目
        const faqItems = this.findFAQItems(container);

        if (faqItems.length === 0) {
            console.warn('FAQ容器中未找到FAQ项目');
            return;
        }

        let visibleCount = 0;

        faqItems.forEach(item => {
            const isVisible = this.isItemVisible(item);
            item.style.display = isVisible ? '' : 'none';
            item.classList.toggle('filtered-out', !isVisible);

            if (isVisible) visibleCount++;
        });

        // 显示筛选状态
        this.showFilterStatus(container, visibleCount, faqItems.length);
    }

    /**
     * 查找容器中的FAQ项目
     */
    findFAQItems(container) {
        const itemSelectors = [
            'li',
            '.faq-item',
            '.faq-list-item',
            '[class*="question"]',
            '[class*="item"]',
            'dt', 'dd' // 适用于定义列表
        ];

        let items = [];

        itemSelectors.forEach(selector => {
            const found = container.querySelectorAll(selector);
            if (found.length > items.length) {
                items = Array.from(found);
            }
        });

        // 过滤掉控制按钮和其他非FAQ元素
        return items.filter(item => {
            const text = item.textContent.toLowerCase();
            const hasQA = text.includes('q:') || text.includes('a:') ||
                         text.includes('问：') || text.includes('答：') ||
                         item.querySelector('strong') || item.querySelector('em');
            return hasQA || item.textContent.length > 20;
        });
    }

    /**
     * 检查FAQ项是否可见
     */
    isItemVisible(item) {
        if (this.activeFilter === 'all') {
            return true;
        }

        const text = item.textContent.toLowerCase();

        switch (this.activeFilter) {
            case 'beginner':
                return this.containsKeywords(text, [
                    '初学', '入门', '新手', '基础', '初级', '简单',
                    '什么是', '如何', '怎样', '怎样', '需要吗',
                    'beginner', 'basic', 'intro'
                ]);

            case 'intermediate':
                return this.containsKeywords(text, [
                    '进阶', '中级', '经验', '申请', '如何申请', '流程',
                    '条件', '要求', '文件', '手续', 'intermediate'
                ]);

            case 'advanced':
                return this.containsKeywords(text, [
                    '高级', '专业', '复杂', '策略', '筹划', '专家',
                    '税务筹划', '合规', '风险管理', 'advanced', 'professional'
                ]);

            default:
                return true;
        }
    }

    /**
     * 检查文本是否包含关键词
     */
    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    /**
     * 显示筛选状态
     */
    showFilterStatus(container, visibleCount, totalCount) {
        let statusElement = container.querySelector('.faq-filter-status');

        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.className = 'faq-filter-status';
            statusElement.style.cssText = `
                padding: 8px 12px;
                background: var(--light-bg, #f3f4f6);
                border-radius: 4px;
                font-size: 0.9rem;
                color: var(--light-text, #6b7280);
                margin: 10px 0;
                text-align: center;
            `;
            container.insertBefore(statusElement, container.firstChild);
        }

        if (visibleCount === totalCount) {
            statusElement.textContent = `显示全部 ${totalCount} 个FAQ项目`;
        } else {
            statusElement.textContent = `筛选结果：${visibleCount} / ${totalCount} 个FAQ项目`;
        }
    }

    /**
     * 创建简单的筛选控制面板
     */
    createSimpleFilterControls() {
        this.faqContainers.forEach((container, index) => {
            const controls = document.createElement('div');
            controls.className = 'faq-controls';
            controls.style.cssText = `
                margin: 20px 0;
                padding: 15px;
                background: var(--surface-primary, #f8f9fa);
                border-radius: 8px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                align-items: center;
            `;

            const label = document.createElement('span');
            label.textContent = '难度筛选：';
            label.style.fontWeight = 'bold';

            const filters = ['全部', '初级', '中级', '高级'];

            filters.forEach(filterText => {
                const button = document.createElement('button');
                button.textContent = filterText;
                button.className = 'faq-filter-btn';
                if (filterText === '全部') button.classList.add('active');

                button.style.cssText = `
                    padding: 6px 12px;
                    border: 1px solid var(--border-color, #ddd);
                    border-radius: 4px;
                    background: white;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                `;

                button.addEventListener('click', () => {
                    controls.querySelectorAll('button').forEach(btn => {
                        btn.classList.remove('active');
                        btn.style.background = 'white';
                    });
                    button.classList.add('active');
                    button.style.background = 'var(--tech-blue, #3b82f6)';
                    button.style.color = 'white';

                    // 触发筛选
                    const filterType = filterText === '全部' ? 'all' :
                                     filterText === '初级' ? 'beginner' :
                                     filterText === '中级' ? 'intermediate' : 'advanced';
                    this.activeFilter = filterType;
                    this.applyFilter();
                });

                controls.appendChild(button);
            });

            container.insertBefore(controls, container.firstChild);
            this.filterControls.push(controls);
        });
    }
}

// 添加样式
if (!document.querySelector('#knowledge-faq-filter-styles')) {
    const style = document.createElement('style');
    style.id = 'knowledge-faq-filter-styles';
    style.textContent = `
        .faq-filter-btn.active {
            background: var(--tech-blue, #3b82f6) !important;
            color: white !important;
            border-color: var(--tech-blue, #3b82f6) !important;
        }

        .faq-filter-btn:hover {
            background: var(--border-color, #e5e7eb) !important;
        }

        .faq-filter-btn.active:hover {
            background: var(--tech-blue-dark, #2563eb) !important;
        }

        .filtered-out {
            opacity: 0.3;
            transform: scale(0.95);
            transition: all 0.3s ease;
        }

        .faq-item {
            transition: all 0.3s ease;
        }

        .faq-filter-status {
            animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
}

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    // 稍微延迟以确保所有元素都已加载
    setTimeout(() => {
        if (!window.knowledgeFAQFilter) {
            window.knowledgeFAQFilter = new KnowledgeFAQFilter();
        }
    }, 100);
});

// 也可以手动初始化
window.KnowledgeFAQFilter = KnowledgeFAQFilter;