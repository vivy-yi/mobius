# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-page static website for a Japanese business services platform called "日本商务通" (Japan Business Hub). The website provides various services including legal consulting, CRM systems, lifestyle services, education, and more for Japanese and Chinese business communities.

## Architecture

### Static Website Structure
- **Technology**: Pure HTML/CSS/JavaScript (no build system required)
- **Navigation**: Centralized navigation system with PJAX-style page switching
- **Multi-language**: Chinese/English language support prepared
- **Responsive**: Mobile-first responsive design

### Key Components

#### Navigation System (`nav.js`)
- **Purpose**: Centralized navigation management with PJAX-style loading
- **Key Features**:
  - Single source of truth for navigation HTML (`NAV_TEMPLATE`)
  - PJAX-based page switching for smooth transitions
  - Mobile responsive menu with hamburger toggle
  - Scroll-based hide/show behavior
  - Language switcher support
  - Automatic style injection and cleanup

#### Page Structure
All pages follow a consistent header structure:
```html
<header>
    <div class="container">
        <nav id="main-navbar"></nav>
    </div>
</header>
```

#### CSS Architecture
- **CSS Variables**: Standardized color scheme using CSS custom properties
- **Primary Colors**:
  - `--primary: #1e3a5f` (deep blue)
  - `--secondary: #2c5282` (medium blue)
  - `--gold: #d69e2e` (gold accent for hover states)
  - `--success: #38a169` (green)
- **Fixed Header**: All pages use fixed header with 100px top margin for content

## File Organization

```
/
├── staticSPA/              # Main website pages
│   ├── index.html         # Homepage
│   ├── ai-crm.html        # CRM system demo
│   ├── ai-legal.html      # Legal services
│   ├── knowledge.html     # Knowledge base
│   ├── professionals.html # Professional services
│   ├── lifestyle.html     # Lifestyle services
│   ├── community.html     # Community features
│   ├── education.html     # Education services
│   ├── labor.html         # Labor services
│   ├── tourism.html       # Tourism services
│   ├── pet.html          # Pet services
│   └── nav.js            # Central navigation system
├── CRM/                   # Documentation and research
│   ├── type.md           # CRM system analysis
│   └── type2.md          # No-code CRM tools comparison
├── staticSPA/plan.md     # Mini-program development plan
└── FIXES_SUMMARY.md      # Recent fixes and improvements summary
```

## Common Development Tasks

### Adding New Pages
1. Create new HTML file in `staticSPA/` directory
2. Include the standard header structure with `<nav id="main-navbar"></nav>`
3. Include `nav.js` script at the end of body: `<script src="nav.js"></script>`
4. Add navigation link to `NAV_TEMPLATE` in `nav.js`
5. Follow the established CSS variable patterns

### Modifying Navigation
- **Edit Location**: `nav.js` file, `NAV_TEMPLATE` constant
- **Key Points**:
  - All navigation HTML is centralized in `NAV_TEMPLATE`
  - Use `data-lang` attributes for translatable text
  - Maintain consistent icon and text patterns

### CSS Customization
- **Color Scheme**: Modify CSS variables in `:root` selector
- **Typography**: Font families are defined in the body styles
- **Responsive**: Use existing mobile-first media queries as patterns

### PJAX Navigation
The `nav.js` system implements PJAX-style navigation:
- Fetches pages via `fetch()` API
- Replaces `<main>` content dynamically
- Handles style sheet injection and cleanup
- Maintains navigation state and scroll position
- Gracefully falls back to full page loads on errors

## Important Implementation Notes

### Security Considerations
- Uses `textContent` instead of `innerHTML` for dynamic content to prevent XSS
- Sanitizes user inputs in forms
- Safe DOM manipulation practices in `nav.js`

### Performance Optimizations
- Event delegation used extensively to prevent memory leaks
- Cleanup functions remove old event listeners
- RequestAnimationFrame throttling for scroll handlers
- Single global scroll handler instance

### Browser Compatibility
- Modern ES6+ JavaScript features used
- CSS Grid and Flexbox for layouts
- CSS custom properties (variables) for theming

## Development Workflow

### Testing the Website
1. Use a local HTTP server (required for PJAX to work properly):
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (if available)
   npx serve .

   # PHP (if available)
   php -S localhost:8000
   ```

2. Navigate to `http://localhost:8000/staticSPA/`

### Making Changes
1. Edit HTML/CSS/JS files directly
2. Refresh browser to see changes immediately
3. Test navigation between pages to ensure PJAX works correctly
4. Verify responsive behavior on mobile viewport sizes

### Debugging PJAX Issues
- Check browser console for JavaScript errors
- Verify all pages have the correct header structure
- Ensure `nav.js` is included on all pages
- Check that internal links use correct relative paths

## Content Management

### Language Support
The site is prepared for bilingual support:
- Navigation items use `data-lang` attributes
- Language switcher is present in navigation
- `switchLanguage()` function is available for implementation

### Service Categories
The website covers these main service areas:
- Legal services (⚖️ AI法律)
- CRM systems (🤖 AI CRM)
- Knowledge base (知识库)
- Professional services (专业人才)
- Lifestyle assistance (生活帮忙)
- Community networking (社群网络)
- Education services (留学教育)
- Tourism services (旅游服务)
- Pet services (宠物帮帮忙)
- Labor services (劳务派遣)

## Known Issues and Fixes

Recent fixes documented in `FIXES_SUMMARY.md`:
- Navigation style consistency across pages
- PJAX style sheet replacement logic
- Event listener cleanup and memory management
- CSS variable standardization
- Mobile menu functionality

## Future Development Plans

Mini-program development plans are outlined in `staticSPA/plan.md` for extending the platform to mobile applications with enhanced CRM capabilities.