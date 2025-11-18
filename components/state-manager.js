/**
 * 知识库页面状态管理系统
 * 统一管理页面的所有状态
 */

import globalEventBus, { EVENT_TYPES } from './event-bus.js';

/**
 * 知识库状态管理器
 */
class KnowledgeStateManager {
  constructor(eventBus = null) {
    this.eventBus = eventBus || globalEventBus;
    this.subscribers = new Map();

    // 初始状态
    this.state = {
      // 过滤器状态
      filters: {
        category: 'all',
        tags: [],
        difficulty: null,
        search: '',
        quickFilter: null,
        dateRange: null
      },

      // 分页状态
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },

      // 数据状态
      data: {
        articles: [],
        categories: [],
        tags: [],
        isLoading: false,
        isLoaded: false,
        lastUpdated: null,
        error: null
      },

      // UI状态
      ui: {
        activeNavigation: null,
        expandedCategories: new Set(),
        sidebarCollapsed: false,
        mobileMenuOpen: false
      },

      // 缓存状态
      cache: {
        filteredArticles: null,
        filterHash: null,
        lastFilterTime: null
      }
    };

    // 状态变更历史记录（用于调试）
    this.history = [];
    this.maxHistorySize = 50;

    // 绑定方法
    this.updateState = this.updateState.bind(this);
    this.getState = this.getState.bind(this);

    console.log('🗃️ KnowledgeStateManager initialized');
  }

  /**
   * 订阅状态变化
   * @param {Function} callback - 状态变化回调
   * @param {string|Array} paths - 监听的状态路径（可选）
   * @param {Object} options - 选项
   */
  subscribe(callback, paths = null, options = {}) {
    const subscriber = {
      id: this.generateSubscriberId(),
      callback,
      paths: Array.isArray(paths) ? paths : (paths ? [paths] : null),
      context: options.context || null,
      immediate: options.immediate || false
    };

    this.subscribers.set(subscriber.id, subscriber);

    // 如果设置了立即执行，立即调用回调
    if (subscriber.immediate) {
      this.notifySubscriber(subscriber, this.state);
    }

    console.log(`📝 State subscriber added: ${subscriber.id}`);

    // 返回取消订阅函数
    return () => {
      this.subscribers.delete(subscriber.id);
      console.log(`📝 State subscriber removed: ${subscriber.id}`);
    };
  }

  /**
   * 更新状态
   * @param {Object|Function} updates - 状态更新
   * @param {Object} options - 选项
   */
  updateState(updates, options = {}) {
    const timestamp = Date.now();
    let newUpdates;

    // 支持函数形式的状态更新
    if (typeof updates === 'function') {
      newUpdates = updates(this.state);
    } else {
      newUpdates = updates;
    }

    // 深度合并状态
    const previousState = { ...this.state };
    this.state = this.deepMerge(this.state, newUpdates);

    // 记录历史
    this.recordHistory(previousState, this.state, newUpdates, options);

    // 通知订阅者
    this.notifySubscribers(newUpdates, previousState);

    // 触发状态变化事件
    this.eventBus.emit(EVENT_TYPES.CONTENT_UPDATE, {
      state: this.state,
      updates: newUpdates,
      previousState,
      timestamp
    });

    console.log('🗃️ State updated:', newUpdates);

    return this.state;
  }

  /**
   * 获取当前状态或指定路径的状态
   * @param {string} path - 状态路径（可选）
   */
  getState(path = null) {
    if (!path) {
      return this.state;
    }

    return this.getNestedProperty(this.state, path);
  }

  /**
   * 重置状态
   * @param {string|Array} paths - 要重置的状态路径（可选）
   */
  reset(paths = null) {
    if (paths) {
      const resetUpdates = {};
      const pathArray = Array.isArray(paths) ? paths : [paths];

      pathArray.forEach(path => {
        this.setNestedProperty(resetUpdates, path, this.getDefaultStateValue(path));
      });

      this.updateState(resetUpdates, { type: 'reset' });
    } else {
      // 重置所有状态
      this.state = this.getDefaultState();
      this.notifySubscribers({}, {});
      this.eventBus.emit(EVENT_TYPES.FILTER_RESET, { timestamp: Date.now() });
    }

    console.log('🗃️ State reset');
  }

  /**
   * 更新过滤器状态
   * @param {string} filterType - 过滤器类型
   * @param {*} value - 过滤器值
   * @param {Object} options - 选项
   */
  updateFilter(filterType, value, options = {}) {
    const currentFilters = { ...this.state.filters };

    // 根据过滤器类型更新状态
    switch (filterType) {
      case 'category':
        currentFilters.category = value;
        // 切换分类时重置其他过滤器
        if (options.resetOthers !== false) {
          currentFilters.tags = [];
          currentFilters.quickFilter = null;
        }
        break;

      case 'tags':
        if (Array.isArray(value)) {
          currentFilters.tags = [...value];
        } else {
          // 单个标签切换
          const index = currentFilters.tags.indexOf(value);
          if (index >= 0) {
            currentFilters.tags.splice(index, 1);
          } else {
            currentFilters.tags.push(value);
          }
        }
        break;

      case 'difficulty':
        currentFilters.difficulty = value;
        break;

      case 'search':
        currentFilters.search = value;
        break;

      case 'quickFilter':
        currentFilters.quickFilter = value;
        break;

      case 'dateRange':
        currentFilters.dateRange = value;
        break;
    }

    this.updateState({ filters: currentFilters }, {
      type: 'filter_update',
      filterType,
      value
    });
  }

  /**
   * 设置加载状态
   * @param {boolean} loading - 是否正在加载
   * @param {string} message - 加载消息（可选）
   */
  setLoading(loading, message = '') {
    this.updateState({
      data: {
        ...this.state.data,
        isLoading: loading
      }
    }, { type: 'loading_state', loading, message });
  }

  /**
   * 设置错误状态
   * @param {Error|string} error - 错误信息
   * @param {Object} context - 错误上下文
   */
  setError(error, context = {}) {
    const errorState = {
      data: {
        ...this.state.data,
        error: error instanceof Error ? error.message : error,
        isLoading: false
      }
    };

    this.updateState(errorState, { type: 'error_state', error, context });

    // 触发错误事件
    this.eventBus.emit(EVENT_TYPES.CONTENT_ERROR, {
      error,
      context,
      timestamp: Date.now()
    });
  }

  /**
   * 清除错误状态
   */
  clearError() {
    this.updateState({
      data: {
        ...this.state.data,
        error: null
      }
    }, { type: 'clear_error' });
  }

  /**
   * 更新分页状态
   * @param {Object} paginationUpdates - 分页更新
   */
  updatePagination(paginationUpdates) {
    this.updateState({
      pagination: {
        ...this.state.pagination,
        ...paginationUpdates
      }
    }, { type: 'pagination_update' });
  }

  /**
   * 切换UI状态
   * @param {string} uiPath - UI路径
   * @param {*} value - 新值
   */
  toggleUI(uiPath, value = null) {
    const currentValue = this.getState(`ui.${uiPath}`);
    const newValue = value !== null ? value : !currentValue;

    this.setNestedProperty(this.state.ui, uiPath, newValue);

    this.updateState({ ui: { ...this.state.ui } }, {
      type: 'ui_toggle',
      uiPath,
      value: newValue
    });
  }

  /**
   * 计算当前过滤器的哈希值
   */
  calculateFilterHash() {
    const { filters } = this.state;
    const filterString = JSON.stringify(filters);
    return this.simpleHash(filterString);
  }

  /**
   * 检查缓存是否有效
   */
  isCacheValid() {
    const { cache } = this.state;
    const currentFilterHash = this.calculateFilterHash();

    return cache.filterHash === currentFilterHash &&
           cache.filteredArticles &&
           cache.lastFilterTime;
  }

  /**
   * 更新缓存
   * @param {Array} filteredArticles - 过滤后的文章
   */
  updateCache(filteredArticles) {
    this.updateState({
      cache: {
        filteredArticles: [...filteredArticles],
        filterHash: this.calculateFilterHash(),
        lastFilterTime: Date.now()
      }
    }, { type: 'cache_update' });
  }

  /**
   * 获取状态历史
   * @param {number} limit - 限制条数
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * 调试状态
   */
  debug() {
    console.group('🗃️ State Manager Debug Info');
    console.log('Current State:', this.state);
    console.log('Filter Hash:', this.calculateFilterHash());
    console.log('Cache Valid:', this.isCacheValid());
    console.log('Subscribers:', this.subscribers.size);
    console.log('History:', this.getHistory(5));
    console.groupEnd();
  }

  // 私有方法

  /**
   * 通知所有订阅者
   */
  notifySubscribers(updates, previousState) {
    this.subscribers.forEach(subscriber => {
      this.notifySubscriber(subscriber, this.state, updates, previousState);
    });
  }

  /**
   * 通知单个订阅者
   */
  notifySubscriber(subscriber, state, updates = {}, previousState = {}) {
    try {
      // 如果订阅者指定了监听的路径，检查是否有相关更新
      if (subscriber.paths && updates) {
        const hasRelevantUpdate = subscriber.paths.some(path =>
          this.isPathInUpdates(path, updates)
        );

        if (!hasRelevantUpdate) {
          return;
        }
      }

      subscriber.callback.call(subscriber.context, state, updates, previousState);
    } catch (error) {
      console.error(`Error in state subscriber ${subscriber.id}:`, error);
    }
  }

  /**
   * 检查路径是否在更新中
   */
  isPathInUpdates(path, updates) {
    const pathParts = path.split('.');
    return this.hasNestedPath(updates, pathParts);
  }

  /**
   * 深度合并对象
   */
  deepMerge(target, source) {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (this.isObject(source[key]) && this.isObject(result[key])) {
          result[key] = this.deepMerge(result[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }

  /**
   * 检查是否是对象
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * 获取嵌套属性
   */
  getNestedProperty(obj, path) {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  /**
   * 设置嵌套属性
   */
  setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    let current = obj;

    for (const part of parts) {
      if (!(part in current) || !this.isObject(current[part])) {
        current[part] = {};
      }
      current = current[part];
    }

    current[lastPart] = value;
  }

  /**
   * 检查对象是否有嵌套路径
   */
  hasNestedPath(obj, pathParts) {
    let current = obj;

    for (const part of pathParts) {
      if (this.isObject(current) && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return true;
  }

  /**
   * 记录历史
   */
  recordHistory(previousState, newState, updates, options) {
    const record = {
      timestamp: Date.now(),
      type: options.type || 'manual',
      updates,
      stateDiff: this.calculateStateDiff(previousState, newState)
    };

    this.history.push(record);

    // 限制历史记录数量
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * 计算状态差异
   */
  calculateStateDiff(previousState, newState) {
    const diff = {};

    // 简化版的差异计算
    for (const key in newState) {
      if (previousState[key] !== newState[key]) {
        diff[key] = {
          previous: previousState[key],
          current: newState[key]
        };
      }
    }

    return diff;
  }

  /**
   * 获取默认状态值
   */
  getDefaultStateValue(path) {
    const defaults = {
      'filters.category': 'all',
      'filters.tags': [],
      'filters.difficulty': null,
      'filters.search': '',
      'filters.quickFilter': null,
      'pagination.page': 1,
      'pagination.limit': 12,
      'data.isLoading': false,
      'data.error': null
    };

    return defaults[path];
  }

  /**
   * 获取默认状态
   */
  getDefaultState() {
    return {
      filters: {
        category: 'all',
        tags: [],
        difficulty: null,
        search: '',
        quickFilter: null,
        dateRange: null
      },
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      },
      data: {
        articles: [],
        categories: [],
        tags: [],
        isLoading: false,
        isLoaded: false,
        lastUpdated: null,
        error: null
      },
      ui: {
        activeNavigation: null,
        expandedCategories: new Set(),
        sidebarCollapsed: false,
        mobileMenuOpen: false
      },
      cache: {
        filteredArticles: null,
        filterHash: null,
        lastFilterTime: null
      }
    };
  }

  /**
   * 简单哈希函数
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash.toString();
  }

  /**
   * 生成订阅者ID
   */
  generateSubscriberId() {
    return 'subscriber_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// 创建全局状态管理器实例
const globalStateManager = new KnowledgeStateManager();

// 在开发环境下添加全局访问
if (typeof window !== 'undefined') {
  window.KnowledgeStateManager = globalStateManager;
}

export { KnowledgeStateManager, globalStateManager };
export default KnowledgeStateManager;