/**
 * 知识库页面事件总线系统
 * 统一管理组件间的通信事件
 */

// 统一事件命名规范
export const EVENT_TYPES = {
  // 过滤相关事件
  FILTER_CHANGE: 'filter:change',
  FILTER_RESET: 'filter:reset',

  // 内容相关事件
  CONTENT_UPDATE: 'content:update',
  CONTENT_LOADING: 'content:loading',
  CONTENT_LOADED: 'content:loaded',
  CONTENT_ERROR: 'content:error',

  // 数据相关事件
  DATA_LOADED: 'data:loaded',
  DATA_ERROR: 'data:error',
  DATA_REFRESH: 'data:refresh',

  // 导航相关事件
  NAV_CATEGORY_CLICK: 'nav:category-click',
  NAV_TAG_CLICK: 'nav:tag-click',
  NAV_SEARCH: 'nav:search',
  NAV_DIFFICULTY_CLICK: 'nav:difficulty-click',

  // 页面状态事件
  PAGE_LOADING: 'page:loading',
  PAGE_READY: 'page:ready',
  PAGE_ERROR: 'page:error'
};

/**
 * 事件总线类
 * 提供发布订阅模式的事件管理
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.onceEvents = new Map();
    this.maxListeners = 50;
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Event callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`Event "${event}" has reached maximum listeners (${this.maxListeners})`);
    }

    const listener = {
      callback,
      context: options.context || null,
      priority: options.priority || 0,
      id: this.generateListenerId()
    };

    listeners.push(listener);

    // 按优先级排序（高优先级先执行）
    listeners.sort((a, b) => b.priority - a.priority);

    console.log(`📡 Event listener added: ${event} (ID: ${listener.id})`);

    return listener.id;
  }

  /**
   * 订阅一次性事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @param {Object} options - 选项
   */
  once(event, callback, options = {}) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      callback.apply(options.context || null, args);
    };

    wrapper.isOnce = true;
    return this.on(event, callback, options);
  }

  /**
   * 取消订阅事件
   * @param {string} event - 事件名称
   * @param {Function|string} callbackOrId - 回调函数或监听器ID
   */
  off(event, callbackOrId) {
    if (!this.events.has(event)) {
      console.warn(`Event "${event}" has no listeners`);
      return false;
    }

    const listeners = this.events.get(event);
    let removedCount = 0;

    if (typeof callbackOrId === 'string') {
      // 通过ID移除
      const initialLength = listeners.length;
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i].id === callbackOrId) {
          listeners.splice(i, 1);
          removedCount++;
        }
      }
    } else {
      // 通过回调函数移除
      const initialLength = listeners.length;
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i].callback === callbackOrId) {
          listeners.splice(i, 1);
          removedCount++;
        }
      }
    }

    // 如果没有监听器了，删除事件
    if (listeners.length === 0) {
      this.events.delete(event);
    }

    console.log(`📡 Event listeners removed: ${event} (${removedCount} removed)`);
    return removedCount > 0;
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   * @param {Object} options - 选项
   */
  emit(event, data = null, options = {}) {
    console.log(`📡 Emitting event: ${event}`, data);

    if (!this.events.has(event)) {
      if (options.warnIfNoListeners !== false) {
        console.warn(`Event "${event}" has no listeners`);
      }
      return false;
    }

    const listeners = this.events.get(event);
    const results = [];
    let hasError = false;

    // 执行所有监听器
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];

      try {
        const result = listener.callback.call(
          listener.context,
          data,
          event,
          this
        );
        results.push(result);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
        results.push({ error });
        hasError = true;

        if (options.stopOnError) {
          break;
        }
      }
    }

    // 如果有错误，触发错误事件
    if (hasError) {
      this.emit(EVENT_TYPES.CONTENT_ERROR, {
        sourceEvent: event,
        errors: results.filter(r => r.error)
      });
    }

    return !hasError;
  }

  /**
   * 获取事件的监听器数量
   * @param {string} event - 事件名称
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * 移除所有监听器
   * @param {string} event - 事件名称（可选，不提供则移除所有事件）
   */
  removeAllListeners(event = null) {
    if (event) {
      this.events.delete(event);
      console.log(`📡 All listeners removed for event: ${event}`);
    } else {
      this.events.clear();
      this.onceEvents.clear();
      console.log('📡 All event listeners removed');
    }
  }

  /**
   * 等待事件触发
   * @param {string} event - 事件名称
   * @param {number} timeout - 超时时间（毫秒）
   */
  waitFor(event, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(event, onEvent);
        reject(new Error(`Event "${event}" timeout after ${timeout}ms`));
      }, timeout);

      const onEvent = (data) => {
        clearTimeout(timer);
        resolve(data);
      };

      this.once(event, onEvent);
    });
  }

  /**
   * 生成监听器ID
   */
  generateListenerId() {
    return 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 调试信息
   */
  debug() {
    console.group('📡 EventBus Debug Info');
    console.log('Total events:', this.events.size);

    this.events.forEach((listeners, event) => {
      console.log(`${event}: ${listeners.length} listeners`);
      listeners.forEach(listener => {
        console.log(`  - ID: ${listener.id}, Priority: ${listener.priority}`);
      });
    });

    console.groupEnd();
  }
}

/**
 * 创建全局事件总线实例
 */
const globalEventBus = new EventBus();

// 在开发环境下添加全局访问
if (typeof window !== 'undefined') {
  window.KnowledgeEventBus = globalEventBus;
}

export { globalEventBus };

export default globalEventBus;