/**
 * Mobius 响应式设备检测器 - 使用外部库简化版本
 * 相比手动实现的90行代码，这个版本只需要30行
 */

// 使用 responsive.js 库进行设备检测
class SimplifiedDeviceDetector {
  constructor() {
    // 检查库是否已加载
    if (typeof responsive === 'undefined') {
      console.warn('Responsive.js库未加载，请先引入');
      return;
    }

    this.initResponsiveDetection();
    this.initCapabilityDetection();
  }

  initResponsiveDetection() {
    // 检查统一设备检测器是否已存在
    if (window.UnifiedDeviceDetector && window.unifiedDeviceDetector) {
      console.log('🔗 统一设备检测器已存在，跳过简化版设备类名管理');
      return; // 跳过设备类名管理，由统一检测器处理
    }

    // 使用我们的6断点系统
    responsive({
      breakpoints: {
        'nano-mobile': { max: 475 },
        'small-mobile': { min: 476, max: 768 },
        'tablet': { min: 769, max: 1024 },
        'small-laptop': { min: 1025, max: 1366 },
        'standard-desktop': { min: 1367, max: 1920 },
        'large-desktop': { min: 1921 }
      },
      onEnter: (breakpoint) => {
        document.body.classList.add(`device-${breakpoint}`);
        document.body.classList.remove(
          'device-nano-mobile', 'device-small-mobile', 'device-tablet',
          'device-small-laptop', 'device-standard-desktop', 'device-large-desktop'
        );

        console.log(`📱 进入设备模式: ${breakpoint}`);
        this.dispatchDeviceChange(breakpoint);
      }
    });
  }

  initCapabilityDetection() {
    // 设备能力检测 - 简化版
    const capabilities = [
      { name: 'touch', query: '(pointer: coarse)' },
      { name: 'hover', query: '(hover: hover)' },
      { name: 'fine-pointer', query: '(pointer: fine)' }
    ];

    capabilities.forEach(capability => {
      const mq = window.matchMedia(capability.query);
      mq.addListener(e => {
        document.body.classList.toggle(`device-${capability.name}`, e.matches);
      });

      // 初始设置
      document.body.classList.toggle(`device-${capability.name}`, mq.matches);
    });

    // 混合设备检测（平板特殊处理）
    const tabletQuery = window.matchMedia('(min-width: 769px) and (max-width: 1024px)');
    const touchQuery = window.matchMedia('(pointer: coarse)');
    const hoverQuery = window.matchMedia('(hover: hover)');

    const updateHybridStatus = () => {
      const isHybrid = tabletQuery.matches && touchQuery.matches && hoverQuery.matches;
      document.body.classList.toggle('device-hybrid', isHybrid);
    };

    [tabletQuery, touchQuery, hoverQuery].forEach(mq => {
      mq.addListener(updateHybridStatus);
    });
    updateHybridStatus();
  }

  // 添加协调方法，允许禁用设备类名添加功能
  disableDeviceClassAddition() {
    this.deviceClassAdditionDisabled = true;
    console.log('🔧 SimplifiedDeviceDetector: 设备类名添加功能已禁用');
  }

  dispatchDeviceChange(deviceType) {
    const event = new CustomEvent('deviceChange', {
      detail: {
        deviceType,
        capabilities: {
          touch: document.body.classList.contains('device-touch'),
          hover: document.body.classList.contains('device-hover'),
          hybrid: document.body.classList.contains('device-hybrid')
        }
      }
    });
    document.dispatchEvent(event);
  }
}

// 一键初始化
window.addEventListener('DOMContentLoaded', () => {
  // 检查统一设备检测器是否已存在
  if (window.UnifiedDeviceDetector && window.unifiedDeviceDetector) {
    console.log('🔗 统一设备检测器已存在，跳过简化版初始化');
    return;
  }

  // 检查是否有responsive.js库，如果没有则提供CDN链接
  if (typeof responsive === 'undefined') {
    console.log('📦 加载responsive.js库...');
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/responsive-js@latest/dist/responsive.min.js';
    script.onload = () => {
      window.simplifiedDeviceDetector = new SimplifiedDeviceDetector();
    };
    document.head.appendChild(script);
  } else {
    window.simplifiedDeviceDetector = new SimplifiedDeviceDetector();
  }
});