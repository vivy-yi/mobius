/**
 * 文章目录生成器
 * 自动扫描文章内容，生成可交互的目录
 */

class TOCGenerator {
    constructor(options = {}) {
        this.options = {
            containerSelector: '.mobius-toc-list',
            contentSelector: '.mobius-article-body',
            headingSelectors: ['h1', 'h2', 'h3', 'h4'],
            minHeadings: 2,
            scrollOffset: 80,
            activeClass: 'active',
            ...options
        };

        this.headings = [];
        this.tocItems = [];
        this.activeHeading = null;

        this.init();
    }

    init() {
        this.generateTOC();
        this.bindEvents();
    }

    // 生成目录
    generateTOC() {
        const container = document.querySelector(this.options.containerSelector);
        const content = document.querySelector(this.options.contentSelector);

        if (!container || !content) {
            console.warn('TOC Generator: Container or content not found');
            return;
        }

        // 获取所有标题
        const headings = content.querySelectorAll(this.options.headingSelectors.join(', '));

        if (headings.length < this.options.minHeadings) {
            // 如果标题数量太少，隐藏目录
            container.closest('.zhihu-sidebar').style.display = 'none';
            return;
        }

        // 清空现有目录
        container.innerHTML = '';
        this.headings = [];
        this.tocItems = [];

        // 为每个标题生成目录项
        headings.forEach((heading, index) => {
            const level = parseInt(heading.tagName.substring(1));
            const text = heading.textContent.trim();
            const id = this.generateId(text, index);

            // 为标题添加ID
            heading.id = id;

            // 创建目录项
            const tocItem = this.createTOCItem(text, id, level);
            container.appendChild(tocItem);

            // 保存引用
            this.headings.push({
                element: heading,
                id: id,
                level: level,
                text: text
            });

            this.tocItems.push(tocItem);
        });

        // 高亮当前可见的标题
        this.updateActiveHeading();
    }

    // 生成唯一ID
    generateId(text, index) {
        // 移除特殊字符，保留中文、英文、数字
        const cleanText = text
            .replace(/[^\u4e00-\u9fa5\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase();

        // 添加索引确保唯一性
        return `heading-${cleanText || 'item'}-${index}`;
    }

    // 创建目录项
    createTOCItem(text, id, level) {
        const li = document.createElement('li');
        li.className = 'mobius-toc-item';

        const link = document.createElement('a');
        link.href = `#${id}`;
        link.className = 'mobius-toc-link';
        link.textContent = text;

        // 根据标题级别设置缩进
        if (level > 2) {
            link.style.paddingLeft = `${(level - 2) * 16}px`;
        }

        // 绑定点击事件
        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.scrollToHeading(id);
        });

        li.appendChild(link);
        return li;
    }

    // 滚动到指定标题
    scrollToHeading(id) {
        const heading = document.getElementById(id);
        if (!heading) return;

        const targetPosition = heading.offsetTop - this.options.scrollOffset;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // 更新活动状态
        this.updateActiveHeading(id);
    }

    // 更新活动标题
    updateActiveHeading(targetId = null) {
        let activeId = targetId;

        if (!activeId) {
            // 根据滚动位置确定活动标题
            const scrollPosition = window.pageYOffset + this.options.scrollOffset + 50;

            for (let i = this.headings.length - 1; i >= 0; i--) {
                const heading = this.headings[i];
                if (heading.element.offsetTop <= scrollPosition) {
                    activeId = heading.id;
                    break;
                }
            }
        }

        // 更新目录项的活动状态
        this.tocItems.forEach(item => {
            const link = item.querySelector('.mobius-toc-link');
            const isActive = link.getAttribute('href') === `#${activeId}`;

            if (isActive) {
                link.classList.add(this.options.activeClass);
            } else {
                link.classList.remove(this.options.activeClass);
            }
        });

        this.activeHeading = activeId;
    }

    // 绑定事件
    bindEvents() {
        // 滚动事件
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            // 防抖处理
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }

            scrollTimer = setTimeout(() => {
                this.updateActiveHeading();
            }, 100);
        });

        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            this.updateActiveHeading();
        });

        // 为目录项添加键盘导航支持
        this.bindKeyboardNavigation();
    }

    // 键盘导航
    bindKeyboardNavigation() {
        const tocLinks = document.querySelectorAll('.mobius-toc-link');

        tocLinks.forEach((link, index) => {
            link.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        if (index > 0) {
                            tocLinks[index - 1].focus();
                        }
                        break;

                    case 'ArrowDown':
                        e.preventDefault();
                        if (index < tocLinks.length - 1) {
                            tocLinks[index + 1].focus();
                        }
                        break;

                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        link.click();
                        break;
                }
            });
        });
    }

    // 获取目录数据（用于导出或调试）
    getTOCData() {
        return this.headings.map(heading => ({
            id: heading.id,
            level: heading.level,
            text: heading.text,
            element: heading.element
        }));
    }

    // 重新生成目录（当内容动态变化时）
    regenerate() {
        this.generateTOC();
    }

    // 销毁实例
    destroy() {
        // 移除事件监听器等清理工作
        this.headings = [];
        this.tocItems = [];
        this.activeHeading = null;
    }
}

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否有目录容器
    const tocContainer = document.querySelector('.mobius-toc-list');
    if (tocContainer) {
        new TOCGenerator();
    }
});

// 导出类供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TOCGenerator;
}

// 添加一些增强功能的CSS样式
const tocStyle = document.createElement('style');
tocStyle.textContent = `
    .mobius-toc-link:focus {
        outline: 2px solid #0084FF;
        outline-offset: 2px;
    }

    .mobius-toc-link {
        transition: all 0.2s ease;
        position: relative;
    }

    .mobius-toc-link::before {
        content: '';
        position: absolute;
        left: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: #0084FF;
        border-radius: 2px;
        transition: height 0.2s ease;
    }

    .mobius-toc-link.active::before {
        height: 20px;
    }

    .mobius-toc-item {
        opacity: 0;
        animation: fadeInUp 0.3s ease forwards;
    }

    .mobius-toc-item:nth-child(1) { animation-delay: 0.1s; }
    .mobius-toc-item:nth-child(2) { animation-delay: 0.15s; }
    .mobius-toc-item:nth-child(3) { animation-delay: 0.2s; }
    .mobius-toc-item:nth-child(4) { animation-delay: 0.25s; }
    .mobius-toc-item:nth-child(5) { animation-delay: 0.3s; }
    .mobius-toc-item:nth-child(n+6) { animation-delay: 0.35s; }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 在移动端隐藏目录的优化 */
    @media (max-width: 1023px) {
        .zhihu-sidebar {
            position: static;
            width: 100%;
            margin-top: 32px;
        }

        .mobius-toc {
            max-height: 200px;
            overflow-y: auto;
        }

        .mobius-toc::-webkit-scrollbar {
            width: 4px;
        }

        .mobius-toc::-webkit-scrollbar-track {
            background: #F6F6F6;
        }

        .mobius-toc::-webkit-scrollbar-thumb {
            background: #B8BFC7;
            border-radius: 2px;
        }

        .mobius-toc::-webkit-scrollbar-thumb:hover {
            background: #8590A6;
        }
    }

    /* 打印时隐藏目录 */
    @media print {
        .zhihu-sidebar {
            display: none;
        }
    }
`;

document.head.appendChild(tocStyle);