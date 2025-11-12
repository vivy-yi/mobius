// nav.js
// 通用导航栏注入、点击与移动端菜单切换逻辑 + 滑动隐藏/显示行为 + PJAX 局部导航 + i18n 国际化支持

// i18n System
let currentLanguage = localStorage.getItem('preferred-language') || 'zh';
let translations = {};

// Load language files
async function loadTranslations(lang) {
    if (translations[lang]) return translations[lang];

    try {
        const response = await fetch(`i18n/${lang}.json`);
        if (!response.ok) throw new Error(`Failed to load ${lang}.json`);
        translations[lang] = await response.json();
        return translations[lang];
    } catch (error) {
        console.warn(`Could not load language file for ${lang}:`, error);
        // Fallback to Chinese if available
        if (lang !== 'zh' && translations['zh']) {
            return translations['zh'];
        }
        return {};
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
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        const translation = t(key, element.textContent);

        // Use textContent for security (no HTML injection)
        element.textContent = sanitizeText(translation);
    });

    // Update page title
    const pageKey = getPageTranslationKey();
    const titleKey = `pages.${pageKey}.title`;
    const titleTranslation = t(titleKey);
    if (titleTranslation) {
        document.title = titleTranslation;
    }

    // Update language selector
    const languageSelector = document.getElementById('language-select');
    if (languageSelector) {
        languageSelector.value = currentLanguage;
    }
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

// Initialize i18n system
async function initI18n() {
    await loadTranslations(currentLanguage);
    updateLanguage();
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
        <li><a href="index.html#customer-layers" data-lang="nav-layers">客户分层</a></li>
        <li><a href="ai-legal.html" data-lang="nav-ai-legal">⚖️ AI法律</a></li>
        <li><a href="ai-crm.html" data-lang="nav-ai-crm">🤖 AI CRM</a></li>
        <li><a href="knowledge.html" data-lang="nav-knowledge">知识库</a></li>
        <li><a href="professionals.html" data-lang="nav-professionals">专业人才</a></li>
        <li><a href="community.html" data-lang="nav-community">社群网络</a></li>
        <li><a href="education.html" data-lang="nav-education">留学教育</a></li>
        <li class="nav-dropdown">
            <a href="#" class="dropdown-toggle" data-lang="nav-other-services"
               role="button" aria-haspopup="true" aria-expanded="false">其他服务 ▼</a>
            <ul class="dropdown-menu" role="menu" aria-label="Other services">
                <li role="none"><a href="lifestyle.html" data-lang="nav-lifestyle" role="menuitem">生活帮忙</a></li>
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
    if (!placeholder) return;
    // Create navigation container safely
    const wrapper = document.createElement('div');

    // Use DOMParser for safe HTML parsing (prevents script execution)
    const parser = new DOMParser();
    const parsedNav = parser.parseFromString(NAV_TEMPLATE, 'text/html');
    const navElement = parsedNav.querySelector('.navbar');

    if (navElement) {
        wrapper.appendChild(document.importNode(navElement, true));
    }

    // Insert before placeholder and remove placeholder
    placeholder.parentNode.replaceChild(wrapper, placeholder);

    // add minimal CSS for hide/show on scroll if not already present
    if (!document.getElementById('nav-behavior-styles')) {
        const style = document.createElement('style');
        style.id = 'nav-behavior-styles';
        style.textContent = `
            header { transition: transform 0.25s ease, box-shadow 0.25s ease; will-change: transform; }
            header.nav-hidden { transform: translateY(-100%); }
            .mobile-menu-toggle { cursor: pointer; }
            .mobile-menu-toggle span { display:block; width:22px; height:3px; background:#fff; margin:4px 0; }
            .nav-menu { display:flex; gap:16px; align-items:center; }
            .nav-menu.active { /* used when mobile menu opened */ }

            /* Dropdown menu styles */
            .nav-dropdown { position: relative; }
            .dropdown-toggle { text-decoration: none; color: white; padding: 8px 12px; display: flex; align-items: center; gap: 4px; }
            .dropdown-menu {
                position: absolute;
                top: 100%;
                left: 0;
                background: var(--secondary, #2c5282);
                min-width: 180px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                z-index: 1001;
                padding: 8px 0;
                margin: 0;
                list-style: none;
            }
            .nav-dropdown:hover .dropdown-menu {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            .dropdown-menu li { margin: 0; }
            .dropdown-menu a {
                display: block;
                padding: 12px 20px;
                color: white;
                text-decoration: none;
                transition: background-color 0.2s ease;
                font-size: 0.95em;
            }
            .dropdown-menu a:hover { background-color: var(--primary, #1e3a5f); }

            /* Language selector styles */
            .language-selector {
                position: relative;
                margin-left: 16px;
            }
            .language-select {
                background: var(--secondary, #2c5282);
                color: white;
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 14px;
                cursor: pointer;
                outline: none;
                transition: all 0.2s ease;
            }
            .language-select:hover {
                background: var(--primary, #1e3a5f);
                border-color: rgba(255,255,255,0.4);
            }
            .language-select:focus {
                border-color: var(--gold, #d69e2e);
                box-shadow: 0 0 0 2px rgba(214, 158, 46, 0.2);
            }
            .language-select option {
                background: var(--secondary, #2c5282);
                color: white;
            }

            /* Screen reader support */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // attach behavior
    setupNavBehavior();

    // Initialize i18n system
    initI18n();
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
    const languageSelector = document.getElementById('language-select');
    if (languageSelector) {
        // Set initial value
        languageSelector.value = currentLanguage;

        languageSelector.addEventListener('change', async function (e) {
            const selectedLang = e.target.value;
            await switchLanguage(selectedLang);
        });
    }

    // Nav link handling: support fragments and PJAX for internal pages - use event delegation
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.addEventListener('click', function (e) {
            const link = e.target.closest('.nav-menu a');
            if (!link) return;
            
            const href = link.getAttribute('href');
            if (!href) return;

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
    }

    // Highlight active link now
    updateActiveLink();

    // Scroll hide/show - use a single global handler with RAF throttling
    if (!window._navScrollHandler) {
        let lastScroll = window.scrollY || 0;
        let ticking = false;
        window._navScrollHandler = function () {
            const current = window.scrollY || 0;
            const header = document.querySelector('header');
            if (!header) return;
            if (current > lastScroll && current > 60) {
                // scroll down -> hide
                header.classList.add('nav-hidden');
            } else {
                // scroll up -> show
                header.classList.remove('nav-hidden');
            }
            lastScroll = current;
            ticking = false;
        };
        
        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(window._navScrollHandler);
                ticking = true;
            }
        });
    }
}

// handle back/forward
window.addEventListener('popstate', function (e) {
    // When user navigates via back/forward, load the URL without pushing new history
    pjaxLoad(window.location.href, false);
});

// Ensure nav is injected whether DOMContentLoaded has already fired or not
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNav);
} else {
    // DOM already ready
    setTimeout(injectNav, 0);
}
