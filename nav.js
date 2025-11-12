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

// Update all elements with data-lang attributes
function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        const translation = t(key, element.textContent);
        element.textContent = translation;
    });

    // Update page title
    const pageKey = getPageTranslationKey();
    const titleKey = `pages.${pageKey}.title`;
    const titleTranslation = t(titleKey);
    if (titleTranslation) {
        document.title = titleTranslation;
    }

    // Update language switcher buttons
    document.querySelectorAll('[data-lang-btn]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang-btn') === currentLanguage);
    });
}

// Get current page translation key based on URL
function getPageTranslationKey() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    return page;
}

// Switch language
async function switchLanguage(lang) {
    if (lang === currentLanguage) return;

    currentLanguage = lang;
    localStorage.setItem('preferred-language', lang);

    await loadTranslations(lang);
    updateLanguage();
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
        <li><a href="lifestyle.html" data-lang="nav-lifestyle">生活帮忙</a></li>
        <li><a href="community.html" data-lang="nav-community">社群网络</a></li>
        <li><a href="education.html" data-lang="nav-education">留学教育</a></li>
        <li><a href="tourism.html" data-lang="nav-tourism">旅游服务</a></li>
        <li><a href="pet.html" data-lang="nav-pet">宠物帮帮忙</a></li>
        <li><a href="labor.html" data-lang="nav-labor">劳务派遣</a></li>
        <li><a href="index.html#stats" data-lang="nav-stats">成功案例</a></li>
        <li><a href="index.html#quick-consultation" data-lang="nav-contact">联系我们</a></li>
    </ul>
    <div class="language-switcher">
        <button data-lang-btn="zh" class="active">中文</button>
        <button data-lang-btn="ja">日本語</button>
        <button data-lang-btn="en">English</button>
    </div>
</nav>
`;

function injectNav() {
    const placeholder = document.getElementById('main-navbar');
    if (!placeholder) return;
    // Replace placeholder with actual nav
    const wrapper = document.createElement('div');
    wrapper.innerHTML = NAV_TEMPLATE;
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
            // Import the node into current document
            const imported = document.importNode(newMain, true);
            curMain.parentNode.replaceChild(imported, curMain);
        } else {
            // as a last resort, replace body (be careful)
            document.body.innerHTML = doc.body.innerHTML;
        }

        // CRITICAL: Clean up old nav behavior to prevent cached event listeners from interfering
        cleanupNavBehavior();

        // Re-initialize nav behavior for the new page content
        setupNavBehavior();

        // Execute scripts from fetched document, but avoid re-executing nav.js
        const scripts = Array.from(doc.querySelectorAll('script'));
        for (const s of scripts) {
            const src = s.getAttribute('src');
            if (src && src.includes('nav.js')) continue; // nav already present
            const script = document.createElement('script');
            if (src) {
                // respect relative URLs
                script.src = new URL(src, url).toString();
                script.async = false;
                document.body.appendChild(script);
            } else {
                script.textContent = s.textContent;
                document.body.appendChild(script);
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

        // Clone language switcher buttons to remove old listeners
        document.querySelectorAll('.language-switcher button[data-lang-btn]').forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
        });

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

    // Language switcher - use event delegation to avoid duplicate listeners
    const languageSwitcher = document.querySelector('.language-switcher');
    if (languageSwitcher) {
        languageSwitcher.addEventListener('click', async function (e) {
            if (!e.target.hasAttribute('data-lang-btn')) return;
            const newButton = e.target;
            const selectedLang = newButton.getAttribute('data-lang-btn');

            // Use the new switchLanguage function
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
