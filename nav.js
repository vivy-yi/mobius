// nav.js
// 通用导航栏注入、点击与移动端菜单切换逻辑 + 滑动隐藏/显示行为 + PJAX 局部导航 + i18n 国际化支持

// i18n System
let currentLanguage = localStorage.getItem('preferred-language') || 'zh';
let translations = {};

// Content Data System
let pageContent = {};
let serviceContent = {};

// Load language files
async function loadTranslations(lang) {
    if (translations[lang]) {
        console.log(`Translations for ${lang} already cached`);
        return translations[lang];
    }

    console.log(`Loading translations for ${lang}...`);

    try {
        const response = await fetch(`i18n/${lang}.json`);
        console.log(`Fetch response for ${lang}.json:`, response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load ${lang}.json`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Invalid content type: ${contentType}`);
        }

        const data = await response.json();
        console.log(`Successfully loaded ${lang}.json with ${Object.keys(data).length} keys`);

        // Validate the structure
        if (!data.navigation || !data.navigation['nav-home']) {
            throw new Error(`Invalid translation file structure for ${lang}`);
        }

        translations[lang] = data;
        console.log(`Translations for ${lang} cached successfully`);
        return translations[lang];

    } catch (error) {
        console.error(`Failed to load language file for ${lang}:`, error);

        // Fallback to Chinese if available
        if (lang !== 'zh' && translations['zh']) {
            console.log(`Falling back to Chinese translations`);
            return translations['zh'];
        }

        // Return minimal fallback if Chinese also fails
        console.log(`Using minimal fallback translations`);
        return {
            navigation: {
                'page-title': '日本商务通',
                'nav-home': '首页',
                'nav-ai-legal': '⚖️ AI法律',
                'nav-ai-crm': '🤖 AI CRM',
                'nav-knowledge': '知识库',
                'nav-professionals': '专业人才',
                'nav-education': '留学教育',
                'nav-other-services': '其他服务',
                'nav-lifestyle': '生活帮忙',
                'nav-community': '社群网络',
                'nav-labor': '劳务派遣',
                'nav-pet': '宠物帮帮忙',
                'nav-tourism': '旅游服务',
                'nav-stats': '成功案例',
                'nav-contact': '联系我们'
            }
        };
    }
}

// Get translation text
function t(key, fallback = '') {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return fallback;
        }
    }

    return value || fallback;
}

// Load page content from JSON
async function loadPageContent() {
    if (Object.keys(pageContent).length > 0) {
        console.log('Page content already loaded');
        return pageContent;
    }

    console.log('Loading page content from JSON...');

    try {
        const response = await fetch('data/pages.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load pages.json`);
        }

        const data = await response.json();
        pageContent = data;
        console.log('Page content loaded successfully');
        return pageContent;

    } catch (error) {
        console.error('Failed to load page content:', error);
        return {};
    }
}

// Load service content from JSON
async function loadServiceContent() {
    if (Object.keys(serviceContent).length > 0) {
        console.log('Service content already loaded');
        return serviceContent;
    }

    console.log('Loading service content from JSON...');

    try {
        const response = await fetch('data/services.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to load services.json`);
        }

        const data = await response.json();
        serviceContent = data;
        console.log('Service content loaded successfully');
        return serviceContent;

    } catch (error) {
        console.error('Failed to load service content:', error);
        return {};
    }
}

// Get content text with current language support
function getContentText(contentObj, key = '') {
    if (!contentObj) return key;

    // If it's a string, return as is
    if (typeof contentObj === 'string') return contentObj;

    // If it's an object with language keys, get the current language
    if (typeof contentObj === 'object' && contentObj[currentLanguage]) {
        return contentObj[currentLanguage];
    }

    // Fallback to Chinese if available
    if (typeof contentObj === 'object' && contentObj.zh) {
        return contentObj.zh;
    }

    // Fallback to English if available
    if (typeof contentObj === 'object' && contentObj.en) {
        return contentObj.en;
    }

    return key;
}

// Generate HTML content from JSON data
function generateHeroHTML(heroData) {
    if (!heroData) return '';

    const title = getContentText(heroData.title);
    const subtitle = getContentText(heroData.subtitle);
    const description = getContentText(heroData.description);

    return `
        <div class="hero-section">
            <div class="container">
                <div class="hero-content">
                    <h1 class="hero-title">${sanitizeText(title)}</h1>
                    <p class="hero-subtitle">${sanitizeText(subtitle)}</p>
                    ${description ? `<p class="hero-description">${sanitizeText(description)}</p>` : ''}
                </div>
            </div>
        </div>
    `;
}

function generateFeaturesHTML(features) {
    if (!features || !Array.isArray(features)) return '';

    let html = '<section class="features-section"><div class="container"><div class="features-grid">';

    features.forEach(feature => {
        const title = getContentText(feature.title);
        const description = getContentText(feature.description);
        const icon = feature.icon || '🔧';

        html += `
            <div class="feature-card">
                <div class="feature-icon">${icon}</div>
                <h3 class="feature-title">${sanitizeText(title)}</h3>
                <p class="feature-description">${sanitizeText(description)}</p>
            </div>
        `;
    });

    html += '</div></div></section>';
    return html;
}

// Get current page ID from URL
function getCurrentPageId() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();

    if (!filename || filename === 'index.html' || filename === '') {
        return 'index';
    }

    // Remove .html extension
    const pageId = filename.replace('.html', '');
    return pageId;
}

// Initialize content system
async function initContentSystem() {
    console.log('Initializing content system...');

    try {
        // Load content data
        await Promise.all([
            loadPageContent(),
            loadServiceContent()
        ]);

        // Get current page and update content
        const pageId = getCurrentPageId();
        await updatePageContent(pageId);

        console.log('Content system initialized successfully');
    } catch (error) {
        console.error('Failed to initialize content system:', error);
    }
}

// Update page content dynamically
async function updatePageContent(pageId) {
    console.log(`Updating content for page: ${pageId}`);

    // Load content if not already loaded
    if (Object.keys(pageContent).length === 0) {
        await loadPageContent();
    }
    if (Object.keys(serviceContent).length === 0) {
        await loadServiceContent();
    }

    // Find content for current page
    let content = null;
    if (pageId === 'index') {
        content = pageContent.index;
    } else if (serviceContent[pageId]) {
        content = serviceContent[pageId];
    }

    if (!content) {
        console.warn(`No content found for page: ${pageId}`);
        return;
    }

    // Update page title
    if (content.meta && content.meta.title) {
        const pageTitle = getContentText(content.meta.title);
        document.title = sanitizeText(pageTitle);
        console.log(`Updated page title to: ${pageTitle}`);
    }

    // Update page description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (content.meta && content.meta.description && descriptionMeta) {
        const pageDescription = getContentText(content.meta.description);
        descriptionMeta.content = sanitizeText(pageDescription);
    }

    // Generate and inject hero section
    const mainElement = document.querySelector('main');
    if (mainElement && content.hero) {
        const heroHTML = generateHeroHTML(content.hero);
        mainElement.innerHTML = heroHTML;

        // Add features section if available
        if (content.features) {
            mainElement.innerHTML += generateFeaturesHTML(content.features);
        }
    }

    console.log(`Page content updated for: ${pageId}`);
}

// Sanitize text content to prevent XSS
function sanitizeText(text) {
    if (typeof text !== 'string') return '';

    // Remove potentially dangerous HTML tags and scripts
    return text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
}

// Update all elements with data-lang attributes
function updateLanguage() {
    console.log('Updating language to:', currentLanguage);
    console.log('Available translations:', translations[currentLanguage] ? 'Yes' : 'No');

    // Update all navigation elements
    const elements = document.querySelectorAll('[data-lang]');
    console.log('Found elements with data-lang:', elements.length);

    elements.forEach((element, index) => {
        const key = element.getAttribute('data-lang');

        // Skip dropdown toggle as it needs special handling to preserve ▼ arrow
        if (element.classList.contains('dropdown-toggle')) {
            return;
        }

        const originalText = element.textContent;

        // Prefix navigation keys with 'navigation.' for proper JSON lookup
        const translationKey = key.startsWith('nav-') ? `navigation.${key}` : key;
        const translation = t(translationKey, element.textContent);

        // Only update if translation is different from current text
        if (translation && translation !== originalText) {
            // Use textContent for security (no HTML injection)
            element.textContent = sanitizeText(translation);
            console.log(`Updated element ${index + 1}/${elements.length}: ${translationKey} = "${translation}"`);
        } else if (!translation) {
            console.warn(`No translation found for key: ${translationKey}`);
        }
    });

    // Update page title
    const pageKey = getPageTranslationKey();
    const titleKey = `pages.${pageKey}.title`;
    const titleTranslation = t(titleKey);
    if (titleTranslation && document.title !== titleTranslation) {
        document.title = titleTranslation;
        console.log(`Updated page title to: ${titleTranslation}`);
    }

    // Update language selector
    const languageSelector = document.getElementById('language-select');
    if (languageSelector && languageSelector.value !== currentLanguage) {
        languageSelector.value = currentLanguage;
        console.log(`Updated language selector to: ${currentLanguage}`);
    }

    // Special handling for dropdown toggle to preserve the ▼ arrow
    const dropdownToggle = document.querySelector('.dropdown-toggle[data-lang="nav-other-services"]');
    if (dropdownToggle) {
        const translationKey = 'navigation.nav-other-services';
        const translation = t(translationKey, '其他服务');
        console.log(`Dropdown translation lookup for '${translationKey}':`, translation);
        if (translation) {
            // Keep the ▼ arrow
            dropdownToggle.innerHTML = sanitizeText(translation) + ' ▼';
            console.log(`Updated dropdown toggle to: ${translation}`);
        }
    }

    console.log('Language update completed');
}

// Get current page translation key based on URL
function getPageTranslationKey() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

// Race condition protection
let isLanguageSwitching = false;

// Switch language
async function switchLanguage(lang) {
    if (lang === currentLanguage) return;

    // Prevent race conditions
    if (isLanguageSwitching) {
        console.log('Language switch already in progress, ignoring request');
        return;
    }

    isLanguageSwitching = true;

    try {
        currentLanguage = lang;
        localStorage.setItem('preferred-language', lang);

        await loadTranslations(lang);
        updateLanguage();
    } catch (error) {
        console.error('Language switch failed:', error);
        // Revert to previous language on error
        const previousLang = localStorage.getItem('preferred-language') || 'zh';
        currentLanguage = previousLang;
    } finally {
        isLanguageSwitching = false;
    }
}

// Add Content Security Policy via meta tag
function addCSPMeta() {
    // Check if CSP meta tag already exists
    if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        return;
    }

    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // 'unsafe-inline' needed for navigation scripts
        "style-src 'self' 'unsafe-inline'",   // 'unsafe-inline' needed for inline CSS
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');

    document.head.appendChild(cspMeta);
}

// Add other security headers via meta tags
function addSecurityHeaders() {
    // Prevent clickjacking
    const frameOptionsMeta = document.createElement('meta');
    frameOptionsMeta.httpEquiv = 'X-Frame-Options';
    frameOptionsMeta.content = 'DENY';
    document.head.appendChild(frameOptionsMeta);

    // Prevent MIME type sniffing
    const contentTypeMeta = document.createElement('meta');
    contentTypeMeta.httpEquiv = 'X-Content-Type-Options';
    contentTypeMeta.content = 'nosniff';
    document.head.appendChild(contentTypeMeta);

    // Enable XSS protection
    const xssProtectionMeta = document.createElement('meta');
    xssProtectionMeta.httpEquiv = 'X-XSS-Protection';
    xssProtectionMeta.content = '1; mode=block';
    document.head.appendChild(xssProtectionMeta);

    // Strict transport security (only on HTTPS)
    if (window.location.protocol === 'https:') {
        const hstsMeta = document.createElement('meta');
        hstsMeta.httpEquiv = 'Strict-Transport-Security';
        hstsMeta.content = 'max-age=31536000; includeSubDomains';
        document.head.appendChild(hstsMeta);
    }
}

// Lazy loading for images
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Load the image
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    // Load srcset if available
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                        img.removeAttribute('data-srcset');
                    }

                    // Add fade-in effect
                    img.style.opacity = '0';
                    img.onload = function() {
                        img.style.transition = 'opacity 0.3s ease-in-out';
                        img.style.opacity = '1';
                    };

                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });

        return imageObserver;
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
        return null;
    }
}

// Preload critical resources
function preloadCriticalResources() {
    const criticalResources = [
        'i18n/zh.json',
        'i18n/ja.json',
        'i18n/en.json'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
}

// Initialize i18n system
async function initI18n() {
    console.log('Initializing i18n system with language:', currentLanguage);

    // Load current language first
    await loadTranslations(currentLanguage);
    console.log('Current language loaded');

    // Preload other languages in background
    const otherLanguages = ['zh', 'ja', 'en'].filter(lang => lang !== currentLanguage);
    const preloadPromises = otherLanguages.map(async (lang) => {
        try {
            await loadTranslations(lang);
            console.log(`Preloaded language: ${lang}`);
        } catch (error) {
            console.warn(`Failed to preload language ${lang}:`, error);
        }
    });

    // Don't wait for preloading to complete
    Promise.allSettled(preloadPromises);

    // Apply initial language update
    updateLanguage();
    console.log('Initial i18n setup completed');
}

// canonical nav HTML (single source). Keep this small and stable — updates here will reflect across pages.
const NAV_TEMPLATE = `
<nav class="navbar">
    <a href="index.html" class="logo">
        <div class="logo-icon">🏢</div>
        <span data-lang="page-title">日本商务通</span>
    </a>
    <div class="mobile-menu-toggle" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
    </div>
    <ul class="nav-menu">
        <li><a href="index.html" data-lang="nav-home">首页</a></li>
        <li><a href="ai-legal.html" data-lang="nav-ai-legal">⚖️ AI法律</a></li>
        <li><a href="ai-crm.html" data-lang="nav-ai-crm">🤖 AI CRM</a></li>
        <li><a href="knowledge.html" data-lang="nav-knowledge">知识库</a></li>
        <li><a href="professionals.html" data-lang="nav-professionals">专业人才</a></li>
        <li><a href="education.html" data-lang="nav-education">留学教育</a></li>
        <li class="nav-dropdown">
            <a href="#" class="dropdown-toggle" data-lang="nav-other-services"
               role="button" aria-haspopup="true" aria-expanded="false">其他服务 ▼</a>
            <ul class="dropdown-menu" role="menu" aria-label="Other services">
                <li role="none"><a href="lifestyle.html" data-lang="nav-lifestyle" role="menuitem">生活帮忙</a></li>
                <li role="none"><a href="community.html" data-lang="nav-community" role="menuitem">社群网络</a></li>
                <li role="none"><a href="labor.html" data-lang="nav-labor" role="menuitem">劳务派遣</a></li>
                <li role="none"><a href="pet.html" data-lang="nav-pet" role="menuitem">宠物帮帮忙</a></li>
                <li role="none"><a href="tourism.html" data-lang="nav-tourism" role="menuitem">旅游服务</a></li>
            </ul>
        </li>
        <li><a href="index.html#stats" data-lang="nav-stats">成功案例</a></li>
        <li><a href="index.html#quick-consultation" data-lang="nav-contact">联系我们</a></li>
    </ul>
    <div class="language-selector">
        <label for="language-select" class="sr-only">Language selection</label>
        <select id="language-select" class="language-select" aria-label="Select language">
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="en">English</option>
        </select>
    </div>
</nav>
`;

function injectNav() {
    const placeholder = document.getElementById('main-navbar');
    if (!placeholder) {
        console.error('Navigation placeholder not found!');
        return;
    }

    console.log('Injecting navigation...');

    try {
        // Create navigation container safely
        const wrapper = document.createElement('div');

        // Use DOMParser for safe HTML parsing (prevents script execution)
        const parser = new DOMParser();
        const parsedNav = parser.parseFromString(NAV_TEMPLATE, 'text/html');
        const navElement = parsedNav.querySelector('.navbar');

        if (navElement) {
            // Import the navigation element
            const importedNav = document.importNode(navElement, true);
            wrapper.appendChild(importedNav);
            console.log('Navigation element created and imported');
        } else {
            console.error('Failed to parse navigation template');
            return;
        }

        // Verify the wrapper has content
        if (!wrapper.querySelector('.navbar')) {
            console.error('Navigation wrapper is empty');
            return;
        }

        // Replace placeholder with navigation
        if (placeholder.parentNode) {
            placeholder.parentNode.replaceChild(wrapper, placeholder);
            console.log('Navigation injected successfully');
        } else {
            console.error('Placeholder has no parent node');
            return;
        }

        // Verify navigation exists in DOM
        setTimeout(() => {
            const injectedNav = document.querySelector('.navbar');
            if (injectedNav) {
                console.log('Navigation verified in DOM');
            } else {
                console.error('Navigation not found in DOM after injection');
            }
        }, 100);

    } catch (error) {
        console.error('Error injecting navigation:', error);
        // Fallback: try to create navigation directly
        tryDirectFallback();
    }

    // Load external navigation CSS if not already present
    function loadNavigationCSS() {
        const cssId = 'navigation-styles';
        if (document.getElementById(cssId)) return;

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'styles/navigation.css';

        // Fallback if CSS file fails to load
        link.onerror = function() {
            console.error('Navigation CSS failed to load, using fallback styles');
            addFallbackStyles();
        };

        // Success callback
        link.onload = function() {
            console.log('Navigation CSS loaded successfully');
            // Load content CSS after navigation CSS
            loadContentCSS();
        };

        document.head.appendChild(link);

        // Add fallback styles immediately as backup
        setTimeout(() => {
            if (!document.querySelector('link[href="styles/navigation.css"][rel="stylesheet"]')) {
                console.warn('CSS not loaded after timeout, applying fallback');
                addFallbackStyles();
            }
        }, 1000);
    }

    // Load content styles for JSON-generated content
    function loadContentCSS() {
        const cssId = 'content-styles';
        if (document.getElementById(cssId)) return;

        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'styles/content.css';

        // Fallback if CSS file fails to load
        link.onerror = function() {
            console.error('Content CSS failed to load');
        };

        // Success callback
        link.onload = function() {
            console.log('Content CSS loaded successfully');
        };

        document.head.appendChild(link);
    }

    // Fallback styles for when CSS file fails to load
    function addFallbackStyles() {
        const style = document.createElement('style');
        style.id = 'nav-fallback-styles';
        style.textContent = `
            /* CRITICAL: Ensure header is visible */
            header {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                z-index: 1000 !important;
                background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%) !important;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
                transition: transform 0.25s ease, box-shadow 0.25s ease !important;
                will-change: transform !important;
            }

            header.nav-hidden { transform: translateY(-100%) !important; }

            /* Navigation container */
            .navbar {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                width: 100% !important;
                padding: 1rem 2rem !important;
                background: transparent !important;
                position: relative !important;
                z-index: 1000 !important;
            }

            /* Logo styles */
            .navbar .logo {
                display: flex !important;
                align-items: center !important;
                color: #ffffff !important;
                font-size: 1.8rem !important;
                font-weight: 700 !important;
                text-decoration: none !important;
                transition: all 0.3s ease !important;
            }

            .navbar .logo-icon {
                width: 40px !important;
                height: 40px !important;
                background: #d69e2e !important;
                border-radius: 10px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin-right: 12px !important;
                font-size: 1.5rem !important;
            }

            /* Mobile menu toggle */
            .mobile-menu-toggle {
                cursor: pointer !important;
                display: none !important;
                flex-direction: column !important;
                gap: 4px !important;
                background: none !important;
                border: none !important;
                padding: 5px !important;
            }

            .mobile-menu-toggle span {
                display:block !important;
                width:22px !important;
                height:3px !important;
                background:#fff !important;
                margin:0 !important;
                border-radius: 2px !important;
                transition: all 0.3s ease !important;
            }

            /* Navigation menu */
            .nav-menu {
                display:flex !important;
                gap:16px !important;
                align-items:center !important;
                list-style: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
            }

            .nav-menu a {
                color: #ffffff !important;
                text-decoration: none !important;
                padding: 8px 12px !important;
                border-radius: 6px !important;
                font-weight: 500 !important;
                transition: all 0.3s ease !important;
            }

            .nav-menu a:hover,
            .nav-menu a.active {
                background: rgba(255,255,255,0.1) !important;
                color: #d69e2e !important;
            }

            /* Dropdown menu */
            .nav-dropdown { position: relative !important; }

            .dropdown-toggle {
                text-decoration: none !important;
                color: #ffffff !important;
                padding: 8px 12px !important;
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                border: none !important;
                background: transparent !important;
                font-size: inherit !important;
                font-family: inherit !important;
                transition: all 0.3s ease !important;
            }

            .dropdown-toggle:hover {
                background: rgba(255,255,255,0.1) !important;
                color: #d69e2e !important;
            }

            .dropdown-menu {
                position: absolute !important;
                top: 100% !important;
                left: 0 !important;
                background: #2c5282 !important;
                min-width: 180px !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
                opacity: 0 !important;
                visibility: hidden !important;
                transform: translateY(-10px) !important;
                transition: all 0.3s ease !important;
                z-index: 1001 !important;
                padding: 8px 0 !important;
                margin: 0 !important;
                list-style: none !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
            }

            .nav-dropdown:hover .dropdown-menu {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
            }

            .dropdown-menu li {
                margin: 0 !important;
                padding: 0 !important;
            }

            .dropdown-menu a {
                display: block !important;
                padding: 12px 20px !important;
                color: #ffffff !important;
                text-decoration: none !important;
                transition: background-color 0.2s ease !important;
                font-size: 0.95em !important;
                border-radius: 0 !important;
            }

            .dropdown-menu a:hover {
                background: #1e3a5f !important;
                color: #d69e2e !important;
            }

            /* Language selector */
            .language-selector {
                position: relative !important;
                margin-left: 16px !important;
            }

            .language-select {
                background: #2c5282 !important;
                color: #ffffff !important;
                border: 1px solid rgba(255,255,255,0.2) !important;
                border-radius: 6px !important;
                padding: 8px 12px !important;
                font-size: 14px !important;
                cursor: pointer !important;
                outline: none !important;
                transition: all 0.3s ease !important;
                min-width: 120px !important;
            }

            .language-select:hover {
                background: #1e3a5f !important;
                border-color: rgba(255,255,255,0.4) !important;
            }

            .language-select:focus {
                border-color: #d69e2e !important;
                box-shadow: 0 0 0 2px rgba(214, 158, 46, 0.2) !important;
            }

            .language-select option {
                background: #2c5282 !important;
                color: #ffffff !important;
            }

            /* Screen reader support */
            .sr-only {
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
                clip: rect(0,0,0,0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .mobile-menu-toggle { display: flex !important; }
                .nav-menu {
                    position: fixed !important;
                    top: 70px !important;
                    left: 0 !important;
                    right: 0 !important;
                    background: #2c5282 !important;
                    flex-direction: column !important;
                    gap: 0 !important;
                    padding: 1rem !important;
                    transform: translateX(-100%) !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    transition: all 0.3s ease !important;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
                    max-height: calc(100vh - 70px) !important;
                    overflow-y: auto !important;
                }
                .nav-menu.active {
                    transform: translateX(0) !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                }
                .nav-menu li { width: 100% !important; }
                .nav-menu a { display: block !important; padding: 12px 16px !important; border-radius: 4px !important; margin-bottom: 4px !important; }
                .dropdown-menu { position: static !important; opacity: 1 !important; visibility: visible !important; transform: none !important; box-shadow: none !important; background: rgba(0,0,0,0.1) !important; margin-top: 8px !important; margin-left: 16px !important; min-width: auto !important; }
                .language-selector { margin-top: 1rem !important; margin-left: 0 !important; width: 100% !important; }
                .language-select { width: 100% !important; }
            }
        `;
        document.head.appendChild(style);
        console.log('Fallback navigation styles applied');
    }

    loadNavigationCSS();

    // Immediately apply fallback styles for guaranteed visibility
    addFallbackStyles();

    // attach behavior
    setupNavBehavior();

    // Add security headers
    addCSPMeta();
    addSecurityHeaders();

    // Initialize i18n system
    initI18n();

    // Initialize content system
    initContentSystem();

    // Initialize performance optimizations
    preloadCriticalResources();
    initLazyLoading();
}

// Utility: check if a link is same-origin and internal (not external or mailto)
function isInternalLink(href) {
    if (!href) return false;
    // skip javascript:, mailto:, tel:, and absolute http(s) different origins
    if (href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    try {
        const url = new URL(href, window.location.href);
        return url.origin === window.location.origin;
    } catch (e) {
        return false;
    }
}

// PJAX loader: fetches url, replaces <main class="main-content">, executes inline scripts from response,
// updates document.title, and optionally pushes history state.
async function pjaxLoad(url, addToHistory = true) {
    try {
        const res = await fetch(url, { credentials: 'same-origin' });
        if (!res.ok) {
            window.location.href = url; // fallback
            return;
        }
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');

        // Update title
        if (doc.title) document.title = doc.title;

        // CRITICAL: Replace page-specific styles and meta tags from new document
        // Remove old page-specific stylesheets (keep nav-behavior-styles)
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('nav.js')) {
                link.remove();
            }
        });
        
        // Add new stylesheets from fetched document
        doc.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.href = link.getAttribute('href');
            document.head.appendChild(newLink);
        });

        // Remove old page-specific inline styles (keep nav-behavior-styles)
        document.querySelectorAll('style').forEach(style => {
            if (style.id !== 'nav-behavior-styles') {
                style.remove();
            }
        });

        // Add new inline styles from fetched document
        doc.querySelectorAll('style').forEach(style => {
            if (style.id !== 'nav-behavior-styles') {
                const newStyle = document.createElement('style');
                if (style.id) newStyle.id = style.id;
                newStyle.textContent = style.textContent;
                document.head.appendChild(newStyle);
            }
        });

        // find new main
        let newMain = doc.querySelector('main.main-content') || doc.querySelector('main') || doc.body;
        let curMain = document.querySelector('main.main-content') || document.querySelector('main') || document.body;

        if (newMain && curMain) {
            // Import the node into current document (safe)
            const imported = document.importNode(newMain, true);
            curMain.parentNode.replaceChild(imported, curMain);
        } else {
            // as a last resort, replace body content safely
            // Remove all existing content to prevent script execution
            while (document.body.firstChild) {
                document.body.removeChild(document.body.firstChild);
            }

            // Clone nodes safely without executing scripts
            const newBodyNodes = doc.body.cloneNode(true);
            Array.from(newBodyNodes.childNodes).forEach(node => {
                // Remove script elements to prevent XSS
                if (node.nodeName.toLowerCase() !== 'script') {
                    document.body.appendChild(document.importNode(node, true));
                }
            });
        }

        // CRITICAL: Clean up old nav behavior to prevent cached event listeners from interfering
        cleanupNavBehavior();

        // Re-initialize nav behavior for the new page content
        setupNavBehavior();

        // Execute scripts from fetched document, but avoid re-executing nav.js
        // Only execute scripts from same origin to prevent XSS
        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const s of scripts) {
            const src = s.getAttribute('src');
            if (src && src.includes('nav.js')) continue; // nav already present

            // Security check: only execute same-origin scripts or inline scripts
            let isSafeScript = true;

            if (src) {
                try {
                    const scriptUrl = new URL(src, url);
                    // Only allow same-origin scripts
                    if (scriptUrl.origin !== window.location.origin) {
                        console.warn('Blocked external script:', src);
                        isSafeScript = false;
                    }
                } catch (e) {
                    console.warn('Invalid script URL:', src);
                    isSafeScript = false;
                }
            } else {
                // For inline scripts, check for potentially dangerous content
                const scriptContent = s.textContent;
                const dangerousPatterns = [
                    /eval\s*\(/,
                    /Function\s*\(/,
                    /setTimeout\s*\(/,
                    /setInterval\s*\(/,
                    /document\.write/,
                    /innerHTML\s*=/,
                    /outerHTML\s*=/,
                    /insertAdjacentHTML/,
                ];

                if (dangerousPatterns.some(pattern => pattern.test(scriptContent))) {
                    console.warn('Blocked potentially dangerous inline script');
                    isSafeScript = false;
                }
            }

            if (isSafeScript) {
                try {
                    const script = document.createElement('script');
                    if (src) {
                        script.src = new URL(src, url).toString();
                        script.async = false;
                        document.body.appendChild(script);
                    } else {
                        // Use textContent for inline scripts (safer than innerHTML)
                        script.textContent = s.textContent;
                        document.body.appendChild(script);
                    }
                } catch (e) {
                    console.error('Failed to execute script:', e);
                }
            }
        }

        // Update active link classes
        updateActiveLink();

        // Update language after page content is loaded
        updateLanguage();

        // Update JSON-based content for new page
        const pageId = getCurrentPageId();
        await updatePageContent(pageId);

        // Optionally update history
        if (addToHistory) {
            history.pushState({ pjax: true }, '', url);
        }

        // smooth scroll to top of content area
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('PJAX load failed for', url, err);
        window.location.href = url; // degrade gracefully
    }
}

function updateActiveLink() {
    try {
        const path = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
        document.querySelectorAll('.nav-menu a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            const link = href.split('/').pop();
            if (link === path || (path === '' && link === 'index.html') || (link.includes('#') && path === 'index.html')) {
                a.classList.add('active');
            }
        });
    } catch (e) { /* ignore */ }
}

// Clean up old nav behavior to prevent memory leaks and duplicate listeners
function cleanupNavBehavior() {
    try {
        // Remove old event listeners by cloning and replacing nav elements
        const oldMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (oldMenuToggle) {
            const newToggle = oldMenuToggle.cloneNode(true);
            oldMenuToggle.parentNode.replaceChild(newToggle, oldMenuToggle);
        }

        const oldNavMenu = document.querySelector('.nav-menu');
        if (oldNavMenu) {
            const newMenu = oldNavMenu.cloneNode(true);
            oldNavMenu.parentNode.replaceChild(newMenu, oldNavMenu);
        }

        // Clone language selector to remove old listeners
        const oldLanguageSelector = document.getElementById('language-select');
        if (oldLanguageSelector) {
            const newSelector = oldLanguageSelector.cloneNode(true);
            oldLanguageSelector.parentNode.replaceChild(newSelector, oldLanguageSelector);
        }

        // Clone nav links to remove old PJAX listeners
        document.querySelectorAll('.nav-menu a').forEach(a => {
            const newLink = a.cloneNode(true);
            a.parentNode.replaceChild(newLink, a);
        });

        // Remove scroll event listeners (will be re-attached in setupNavBehavior)
        // Note: We rely on element cloning above to clean up; global scroll listeners persist but are idempotent
    } catch (e) {
        console.warn('cleanupNavBehavior error:', e);
    }
}


function setupNavBehavior() {
    // Mobile menu
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        // close when clicking outside
        document.addEventListener('click', function (event) {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }

    // Language selector - handle change events
    function setupLanguageSelector() {
        const languageSelector = document.getElementById('language-select');
        if (languageSelector) {
            console.log('Setting up language selector, current language:', currentLanguage);

            // Set initial value
            languageSelector.value = currentLanguage;

            // Remove any existing listeners to prevent duplicates
            const newSelector = languageSelector.cloneNode(true);
            languageSelector.parentNode.replaceChild(newSelector, languageSelector);

            // Add the change listener
            newSelector.addEventListener('change', async function (e) {
                const selectedLang = e.target.value;
                console.log('Language selector changed to:', selectedLang);

                // Prevent multiple simultaneous switches
                if (isLanguageSwitching) {
                    console.log('Language switch already in progress, ignoring');
                    return;
                }

                try {
                    // Show immediate feedback
                    e.target.disabled = true;
                    console.log('Language selector disabled during switch');

                    await switchLanguage(selectedLang);

                    // Force immediate update after language switch completes
                    setTimeout(() => {
                        console.log('Forcing immediate language update after switch');
                        updateLanguage();
                        e.target.disabled = false;
                        console.log('Language selector re-enabled');
                    }, 200);

                } catch (error) {
                    console.error('Error during language switch:', error);
                    e.target.disabled = false;
                    e.target.value = currentLanguage; // Reset on error
                }
            });

            console.log('Language selector setup completed');
        } else {
            console.error('Language selector element not found!');
        }
    }

    // Call the setup function
    setupLanguageSelector();

    // Nav link handling: support fragments and PJAX for internal pages - use event delegation
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.addEventListener('click', function (e) {
            const link = e.target.closest('.nav-menu a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href) return;

            // Prevent dropdown toggle from page navigation
            if (link.classList.contains('dropdown-toggle')) {
                e.preventDefault();
                return;
            }

            // in-page fragment
            if (href.startsWith('#') || href.includes(window.location.pathname.split('/').pop() + '#')) {
                e.preventDefault();
                const target = document.querySelector(href.replace(/^.*#/, '#'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
                return;
            }

            // internal same-origin HTML files -> use PJAX
            if (isInternalLink(href) && (href.endsWith('.html') || !href.includes('.'))) {
                e.preventDefault();
                const absolute = new URL(href, window.location.href).toString();
                pjaxLoad(absolute, true);
                // close mobile menu if open
                if (navMenu) { navMenu.classList.remove('active'); }
                if (menuToggle) { menuToggle.classList.remove('active'); }
                return;
            }
            // otherwise let browser handle (external link, download, etc.)
        });

        // Handle dropdown toggle separately
        navbar.addEventListener('click', function (e) {
            const dropdownToggle = e.target.closest('.dropdown-toggle');
            if (!dropdownToggle) return;

            e.preventDefault();

            // Toggle dropdown menu manually (CSS hover will handle most cases)
            const dropdownMenu = dropdownToggle.nextElementSibling;
            if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                const isVisible = dropdownMenu.style.visibility === 'visible';
                dropdownMenu.style.visibility = isVisible ? 'hidden' : 'visible';
                dropdownMenu.style.opacity = isVisible ? '0' : '1';
                dropdownMenu.style.transform = isVisible ? 'translateY(-10px)' : 'translateY(0)';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function (e) {
            const dropdownMenu = document.querySelector('.dropdown-menu');
            const dropdownToggle = document.querySelector('.dropdown-toggle');

            if (dropdownMenu && dropdownToggle &&
                !dropdownMenu.contains(e.target) &&
                !dropdownToggle.contains(e.target)) {
                dropdownMenu.style.visibility = 'hidden';
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.transform = 'translateY(-10px)';
            }
        });
    }

    // Highlight active link now
    updateActiveLink();

    // Scroll hide/show - use a single global handler with RAF throttling and memory management
    if (!window._navScrollHandler) {
        let lastScroll = window.scrollY || 0;
        let ticking = false;

        window._navScrollHandler = function () {
            const current = window.scrollY || 0;
            const header = document.querySelector('header');

            if (header) {
                if (current > lastScroll && current > 60) {
                    // scroll down -> hide
                    header.classList.add('nav-hidden');
                } else {
                    // scroll up -> show
                    header.classList.remove('nav-hidden');
                }
            }

            lastScroll = current;
            ticking = false;
        };

        window._navScrollEvent = function () {
            if (!ticking) {
                window.requestAnimationFrame(window._navScrollHandler);
                ticking = true;
            }
        };

        // Use passive event listener for better performance
        window.addEventListener('scroll', window._navScrollEvent, { passive: true });
    }
}

// Global cleanup function for memory management
function cleanupGlobalHandlers() {
    // Clean up scroll event listener if it exists
    if (window._navScrollEvent) {
        window.removeEventListener('scroll', window._navScrollEvent);
        window._navScrollEvent = null;
    }
    if (window._navScrollHandler) {
        window._navScrollHandler = null;
    }
}

// Performance monitoring
function logPerformanceMetrics() {
    // Log navigation performance metrics in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('🔧 Performance Metrics:');
        console.log('- Active DOM nodes:', document.querySelectorAll('*').length);
        console.log('- Event listeners count:', (window.getEventListeners ? Object.keys(window.getEventListeners(window)).length : 'N/A'));
        console.log('- Memory usage:', performance.memory ?
            `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB` : 'N/A');
    }
}

// handle back/forward
window.addEventListener('popstate', function (e) {
    // When user navigates via back/forward, load the URL without pushing new history
    pjaxLoad(window.location.href, false);
});

// Log performance metrics on page load
window.addEventListener('load', function() {
    setTimeout(logPerformanceMetrics, 1000);
});

// Direct fallback function for emergencies (using safe DOM methods)
function tryDirectFallback() {
    console.warn('Attempting direct navigation fallback...');

    const placeholder = document.getElementById('main-navbar');
    if (!placeholder || !placeholder.parentNode) {
        console.error('Cannot apply fallback - placeholder unavailable');
        return;
    }

    // Create minimal navigation safely
    const minimalNav = document.createElement('div');
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';

    // Set styles directly (safe)
    navbar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; width: 100%; padding: 1rem 2rem; background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; position: fixed; top: 0; left: 0; z-index: 1000;';

    // Create logo
    const logo = document.createElement('a');
    logo.href = 'index.html';
    logo.style.cssText = 'color: white; text-decoration: none; font-size: 1.8rem; font-weight: 700; display: flex; align-items: center;';

    const logoIcon = document.createElement('span');
    logoIcon.style.cssText = 'width: 40px; height: 40px; background: #d69e2e; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 1.5rem;';
    logoIcon.textContent = '🏢';

    const logoText = document.createElement('span');
    logoText.textContent = '日本商务通';

    logo.appendChild(logoIcon);
    logo.appendChild(logoText);

    // Create nav menu
    const navMenu = document.createElement('div');
    navMenu.style.cssText = 'display: flex; gap: 16px; align-items: center; list-style: none; margin: 0; padding: 0;';

    // Create nav links
    const links = [
        { href: 'index.html', text: '首页' },
        { href: 'ai-legal.html', text: 'AI法律' },
        { href: 'ai-crm.html', text: 'AI CRM' }
    ];

    links.forEach(linkData => {
        const link = document.createElement('a');
        link.href = linkData.href;
        link.style.cssText = 'color: white; text-decoration: none; padding: 8px 12px; border-radius: 4px;';
        link.textContent = linkData.text;
        navMenu.appendChild(link);
    });

    // Create language selector
    const languageSelect = document.createElement('select');
    languageSelect.id = 'language-select';
    languageSelect.style.cssText = 'background: #2c5282; color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; padding: 8px 12px;';

    const options = [
        { value: 'zh', text: '中文' },
        { value: 'ja', text: '日本語' },
        { value: 'en', text: 'English' }
    ];

    options.forEach(optionData => {
        const option = document.createElement('option');
        option.value = optionData.value;
        option.textContent = optionData.text;
        languageSelect.appendChild(option);
    });

    navMenu.appendChild(languageSelect);

    // Assemble navigation
    navbar.appendChild(logo);
    navbar.appendChild(navMenu);
    minimalNav.appendChild(navbar);

    placeholder.parentNode.replaceChild(minimalNav, placeholder);
    console.log('Direct fallback navigation applied safely');

    // Re-attach basic behavior
    setTimeout(() => {
        const languageSelectEl = document.getElementById('language-select');
        if (languageSelectEl) {
            console.log('Setting up fallback language selector');
            languageSelectEl.value = currentLanguage;

            // Add change listener for fallback
            languageSelectEl.addEventListener('change', async function (e) {
                const selectedLang = e.target.value;
                console.log('Fallback language selector changed to:', selectedLang);

                if (isLanguageSwitching) {
                    console.log('Language switch already in progress, ignoring');
                    return;
                }

                try {
                    e.target.disabled = true;
                    await switchLanguage(selectedLang);
                    setTimeout(() => {
                        updateLanguage();
                        e.target.disabled = false;
                    }, 200);
                } catch (error) {
                    console.error('Fallback language switch error:', error);
                    e.target.disabled = false;
                    e.target.value = currentLanguage;
                }
            });
        }
    }, 100);
}

// Ensure nav is injected whether DOMContentLoaded has already fired or not
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
} else {
    // DOM already ready
    setTimeout(injectNav, 0);
}
