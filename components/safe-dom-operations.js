/**
 * 安全DOM操作工具类
 * 替代innerHTML，防止XSS攻击
 * 提供安全的DOM创建和操作方法
 */

class SafeDOMOperations {
    /**
     * 创建DOM元素的完全安全方法
     * @param {string} tag - HTML标签名
     * @param {string} className - CSS类名
     * @param {string|Node|NodeList} content - 内容（文本或节点），安全替代innerHTML
     * @param {Object} attributes - HTML属性对象
     * @returns {Element} 创建的DOM元素
     */
    static createElement(tag, className = '', content = '', attributes = {}) {
        const element = document.createElement(tag);

        // 设置类名
        if (className) {
            element.className = className;
        }

        // 设置属性
        Object.entries(attributes).forEach(([key, value]) => {
            if (key.startsWith('aria-') || key.startsWith('data-')) {
                element.setAttribute(key, value);
            } else {
                element[key] = value;
            }
        });

        // 安全地设置内容
        SafeDOMOperations.safeSetContent(element, content);

        return element;
    }

    /**
     * 创建图标元素的安全方法
     * @param {string} iconClass - Font Awesome图标类名
     * @param {string} ariaLabel - 可访问性标签
     * @param {Object} attributes - 额外属性
     * @returns {Element} 图标元素
     */
    static createIcon(iconClass, ariaLabel = '', attributes = {}) {
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.setAttribute('aria-hidden', 'true');

        // 设置额外属性
        Object.entries(attributes).forEach(([key, value]) => {
            icon.setAttribute(key, value);
        });

        if (ariaLabel) {
            // 创建可访问的标签容器
            const container = document.createElement('span');
            container.appendChild(icon);

            const srOnly = document.createElement('span');
            srOnly.className = 'sr-only';
            srOnly.textContent = ariaLabel;
            container.appendChild(srOnly);

            return container;
        }

        return icon;
    }

    /**
     * 创建加载指示器
     * @param {string} message - 加载消息
     * @param {string} className - 额外的CSS类名
     * @returns {Element} 加载指示器元素
     */
    static createLoadingSpinner(message = '加载中...', className = 'loading-spinner') {
        const container = SafeDOMOperations.createElement('div', className);

        const spinner = SafeDOMOperations.createElement('div', 'spinner');
        const icon = SafeDOMOperations.createIcon('fas fa-spinner fa-spin');
        spinner.appendChild(icon);

        const text = SafeDOMOperations.createElement('span', 'loading-text', message);
        text.setAttribute('aria-live', 'polite');

        container.appendChild(spinner);
        container.appendChild(text);

        return container;
    }

    /**
     * 创建空状态提示
     * @param {string} message - 空状态消息
     * @param {string} iconClass - 图标类名
     * @param {string} className - CSS类名
     * @returns {Element} 空状态元素
     */
    static createEmptyState(message = '暂无内容', iconClass = 'fas fa-inbox', className = 'empty-state') {
        const container = SafeDOMOperations.createElement('div', className);

        const icon = SafeDOMOperations.createIcon(iconClass);
        const title = SafeDOMOperations.createElement('h3', 'empty-title', message);
        const description = SafeDOMOperations.createElement('p', 'empty-description', '请尝试其他筛选条件或稍后再试');

        container.appendChild(icon);
        container.appendChild(title);
        container.appendChild(description);

        return container;
    }

    /**
     * 创建错误消息
     * @param {string} message - 错误消息
     * @param {Error} error - 错误对象
     * @param {string} className - CSS类名
     * @returns {Element} 错误消息元素
     */
    static createErrorMessage(message = '操作失败', error = null, className = 'error-message') {
        const container = SafeDOMOperations.createElement('div', className);
        container.setAttribute('role', 'alert');

        const icon = SafeDOMOperations.createIcon('fas fa-exclamation-triangle');
        const title = SafeDOMOperations.createElement('h3', 'error-title', message);

        container.appendChild(icon);
        container.appendChild(title);

        if (error && error.message) {
            const errorDetail = SafeDOMOperations.createElement('p', 'error-detail', error.message);
            container.appendChild(errorDetail);
        }

        return container;
    }

    /**
     * 安全地清空容器内容
     * @param {Element} container - 要清空的容器元素
     */
    static safeClearContainer(container) {
        if (!container) return;

        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    /**
     * 安全地设置容器内容
     * @param {Element} container - 容器元素
     * @param {string|Node|NodeList} content - 新内容
     */
    static safeSetContent(container, content) {
        if (!container) return;

        // 清空现有内容
        SafeDOMOperations.safeClearContainer(container);

        if (content === null || content === undefined) {
            return;
        }

        if (typeof content === 'string') {
            // 对于字符串，总是使用textContent来避免XSS
            container.textContent = content;
        } else if (content instanceof Node) {
            container.appendChild(content);
        } else if (content instanceof NodeList || Array.isArray(content)) {
            content.forEach(node => {
                if (node instanceof Node) {
                    container.appendChild(node);
                }
            });
        }
    }

    /**
     * 安全地添加内容到容器末尾
     * @param {Element} container - 容器元素
     * @param {string|Node|NodeList} content - 要添加的内容
     */
    static safeAppendContent(container, content) {
        if (!container) return;

        if (typeof content === 'string') {
            const textNode = document.createTextNode(content);
            container.appendChild(textNode);
        } else if (content instanceof Node) {
            container.appendChild(content);
        } else if (content instanceof NodeList || Array.isArray(content)) {
            content.forEach(node => {
                if (node instanceof Node) {
                    container.appendChild(node);
                }
            });
        }
    }

    /**
     * 安全地在指定位置插入内容
     * @param {Element} container - 容器元素
     * @param {string|Node|NodeList} content - 要插入的内容
     * @param {number} index - 插入位置
     */
    static safeInsertContent(container, content, index) {
        if (!container) return;

        const children = container.children;
        const referenceNode = index < children.length ? children[index] : null;

        if (typeof content === 'string') {
            const textNode = document.createTextNode(content);
            container.insertBefore(textNode, referenceNode);
        } else if (content instanceof Node) {
            container.insertBefore(content, referenceNode);
        } else if (content instanceof NodeList || Array.isArray(content)) {
            content.forEach((node, i) => {
                if (node instanceof Node) {
                    container.insertBefore(node, referenceNode);
                }
            });
        }
    }

    /**
     * 创建安全的链接元素
     * @param {string} href - 链接地址
     * @param {string} text - 链接文本
     * @param {string} className - CSS类名
     * @param {Object} attributes - 额外属性
     * @returns {Element} 链接元素
     */
    static createLink(href, text, className = '', attributes = {}) {
        const link = SafeDOMOperations.createElement('a', className, text, {
            href: href,
            ...attributes
        });

        // 确保外部链接有安全属性
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
            link.setAttribute('rel', 'noopener noreferrer');
            link.setAttribute('target', '_blank');
        }

        return link;
    }

    /**
     * 创建安全的按钮元素
     * @param {string} text - 按钮文本
     * @param {Function} onClick - 点击处理函数
     * @param {string} className - CSS类名
     * @param {Object} attributes - 额外属性
     * @returns {Element} 按钮元素
     */
    static createButton(text, onClick = null, className = 'btn', attributes = {}) {
        const button = SafeDOMOperations.createElement('button', className, text, {
            type: 'button',
            ...attributes
        });

        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * 创建带图标的按钮
     * @param {string} text - 按钮文本
     * @param {string} iconClass - 图标类名
     * @param {Function} onClick - 点击处理函数
     * @param {string} className - CSS类名
     * @param {Object} attributes - 额外属性
     * @returns {Element} 按钮元素
     */
    static createIconButton(text, iconClass, onClick = null, className = 'btn', attributes = {}) {
        const button = SafeDOMOperations.createElement('button', className, '', {
            type: 'button',
            ...attributes
        });

        const icon = SafeDOMOperations.createIcon(iconClass);
        button.appendChild(icon);

        if (text) {
            const textNode = document.createTextNode(' ' + text);
            button.appendChild(textNode);
        }

        if (onClick && typeof onClick === 'function') {
            button.addEventListener('click', onClick);
        }

        return button;
    }

    /**
     * 验证并清理HTML字符串（移除危险标签和属性）
     * @param {string} html - HTML字符串
     * @returns {string} 清理后的安全HTML
     * @deprecated 建议使用DOM方法而不是HTML字符串
     */
    static sanitizeHTML(html) {
        // 如果可能，避免使用HTML字符串
        // console.warn('sanitizeHTML已弃用，请使用安全的DOM操作方法');

        // 基本的HTML清理（仅用于特殊情况）
        return html
            .replace(/<script[^>]*>.*?<\/script>/gis, '')
            .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
            .replace(/<object[^>]*>.*?<\/object>/gis, '')
            .replace(/<embed[^>]*>/gis, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
}

// 导出工具类（支持不同的模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeDOMOperations;
} else if (typeof window !== 'undefined') {
    window.SafeDOMOperations = SafeDOMOperations;
}

// 添加到全局作用域以便使用
if (typeof window !== 'undefined') {
    window.safeDOM = SafeDOMOperations;
}