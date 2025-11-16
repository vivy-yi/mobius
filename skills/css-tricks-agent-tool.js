/**
 * CSS Tricks Agent Tool - Comprehensive CSS Problem Solver
 *
 * A specialized agent tool that analyzes CSS problems and provides solutions
 * based on the CSS Tricks Agent knowledge base and Mobius project patterns.
 *
 * Usage: This tool is automatically invoked when CSS-related questions are detected.
 */

class CSSTricksAgentTool {
    constructor() {
        this.name = "CSS Tricks Agent Tool";
        this.version = "2.0.0";

        // Load knowledge base from existing css-tricks-agent.js
        this.initializeKnowledgeBase();

        // Mobius-specific patterns and variables
        this.mobiusPatterns = this.initializeMobiusPatterns();

        // Common CSS problem patterns
        this.problemPatterns = this.initializeProblemPatterns();
    }

    /**
     * Initialize knowledge base from existing CSS agent
     */
    initializeKnowledgeBase() {
        // Core CSS principles from the existing agent
        this.principles = {
            layout: {
                widthConstraints: {
                    principle: "块级元素宽度约束原则",
                    description: "当子元素使用flex/grid布局时，父级块元素必须设置明确的宽度约束",
                    solution: "width: 100%, display: block, box-sizing: border-box",
                    context: "确保父元素占据完整窗口宽度，子内容在max-width容器内居中"
                },
                containerHierarchy: {
                    principle: "容器层级结构原则",
                    description: "保持清晰的容器嵌套结构，避免样式冲突",
                    solution: "section > content-wrapper > actual-content",
                    context: "每个层级都有明确的职责，避免样式继承混乱"
                }
            },
            responsive: {
                mobileFirst: {
                    principle: "移动优先设计原则",
                    description: "先设计移动端体验，然后渐进增强到桌面端",
                    solution: "min-width媒体查询，默认移动端样式",
                    context: "确保在所有设备上都有良好的用户体验"
                }
            }
        };
    }

    /**
     * Initialize Mobius-specific CSS patterns
     */
    initializeMobiusPatterns() {
        return {
            variables: {
                colors: {
                    primary: "--primary-blue: #1e3a8a",
                    tech: "--tech-blue: #3b82f6",
                    accent: "--accent-red: #dc2626",
                    light: "--light-bg: #f0f9ff",
                    dark: "--dark-text: #1f2937"
                },
                spacing: {
                    xs: "--spacing-xs: 0.5rem",
                    sm: "--spacing-sm: 1rem",
                    md: "--spacing-md: 2rem",
                    lg: "--spacing-lg: 3rem"
                },
                gradients: {
                    primary: "--gradient-primary: linear-gradient(135deg, var(--tech-blue), var(--accent-red))",
                    blue: "--gradient-blue: linear-gradient(135deg, #3b82f6, #1e40af)"
                }
            },
            components: {
                hero: ".hero-section { background: var(--gradient-primary); min-height: 100vh; }",
                service: ".service-card { background: var(--gradient-glass); border-radius: var(--radius-lg); }",
                navigation: ".navbar { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }"
            },
            responsive: {
                breakpoints: {
                    mobile: "< 768px",
                    tablet: "768px - 1199px",
                    desktop: "1200px+"
                }
            }
        };
    }

    /**
     * Initialize common CSS problem patterns
     */
    initializeProblemPatterns() {
        return {
            widthIssues: {
                keywords: ["宽度", "width", "全屏", "居中", "空白", "不对称"],
                solutions: ["width: 100%", "display: block", "box-sizing: border-box", "margin: 0 auto"]
            },
            centeringIssues: {
                keywords: ["居中", "center", "对齐", "align", "偏移"],
                solutions: {
                    horizontal: ["margin: 0 auto", "justify-content: center", "text-align: center"],
                    vertical: ["align-items: center", "display: flex", "position: absolute; top: 50%; transform: translateY(-50%)"]
                }
            },
            responsiveIssues: {
                keywords: ["响应式", "mobile", "手机", "平板", "适配", "断点"],
                solutions: ["@media queries", "relative units", "flexbox/grid", "viewport meta"]
            },
            specificityIssues: {
                keywords: ["优先级", "override", "覆盖", "!important", "冲突"],
                solutions: ["increase selector specificity", "avoid !important", "check load order", "use semantic classes"]
            }
        };
    }

    /**
     * Main analysis function - detects CSS problem type and provides solutions
     */
    analyzeCSSProblem(userQuery, context = {}) {
        const analysis = {
            problemType: this.detectProblemType(userQuery),
            symptoms: this.extractSymptoms(userQuery),
            context: context,
            solutions: [],
            principles: [],
            codeExamples: [],
            bestPractices: []
        };

        // Generate solutions based on problem type
        switch (analysis.problemType) {
            case 'width-layout':
                analysis.solutions = this.solveWidthLayoutIssues(analysis.symptoms);
                analysis.principles = [this.principles.layout.widthConstraints];
                break;
            case 'centering':
                analysis.solutions = this.solveCenteringIssues(analysis.symptoms);
                break;
            case 'responsive':
                analysis.solutions = this.solveResponsiveIssues(analysis.symptoms);
                analysis.principles = [this.principles.responsive.mobileFirst];
                break;
            case 'specificity':
                analysis.solutions = this.solveSpecificityIssues(analysis.symptoms);
                break;
            default:
                analysis.solutions = this.solveGeneralCSSIssues(userQuery);
        }

        // Generate code examples
        analysis.codeExamples = this.generateCodeExamples(analysis.problemType, analysis.solutions);

        // Add best practices
        analysis.bestPractices = this.getRelevantBestPractices(analysis.problemType);

        return analysis;
    }

    /**
     * Detect the type of CSS problem based on user query
     */
    detectProblemType(query) {
        const lowerQuery = query.toLowerCase();

        for (const [type, pattern] of Object.entries(this.problemPatterns)) {
            if (pattern.keywords.some(keyword => lowerQuery.includes(keyword))) {
                return type;
            }
        }

        return 'general';
    }

    /**
     * Extract symptoms from user query
     */
    extractSymptoms(query) {
        const symptoms = [];
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('右侧') || lowerQuery.includes('空白')) {
            symptoms.push('右侧空白');
        }
        if (lowerQuery.includes('宽度') || lowerQuery.includes('width')) {
            symptoms.push('width问题');
        }
        if (lowerQuery.includes('居中') || lowerQuery.includes('center')) {
            symptoms.push('centering问题');
        }
        if (lowerQuery.includes('手机') || lowerQuery.includes('mobile')) {
            symptoms.push('移动端问题');
        }
        if (lowerQuery.includes('覆盖') || lowerQuery.includes('override')) {
            symptoms.push('样式覆盖问题');
        }

        return symptoms;
    }

    /**
     * Solve width and layout issues
     */
    solveWidthLayoutIssues(symptoms) {
        const solutions = [];

        if (symptoms.includes('右侧空白') || symptoms.includes('width问题')) {
            solutions.push({
                problem: "父元素没有占据全屏宽度",
                solution: "添加 width: 100% 和 display: block",
                code: this.generateWidthConstraintsCode()
            });
        }

        if (symptoms.includes('centering问题')) {
            solutions.push({
                problem: "内容没有正确居中",
                solution: "使用 margin: 0 auto 或 flexbox 居中",
                code: this.generateCenteringCode()
            });
        }

        return solutions;
    }

    /**
     * Solve centering issues
     */
    solveCenteringIssues(symptoms) {
        return [
            {
                method: "水平居中 - 块级元素",
                code: ".element { margin: 0 auto; width: fit-content; }"
            },
            {
                method: "水平居中 - Flexbox",
                code: ".container { display: flex; justify-content: center; }"
            },
            {
                method: "垂直居中 - Flexbox",
                code: ".container { display: flex; align-items: center; min-height: 100vh; }"
            },
            {
                method: "完全居中 - Grid",
                code: ".container { display: grid; place-items: center; min-height: 100vh; }"
            }
        ];
    }

    /**
     * Solve responsive design issues
     */
    solveResponsiveIssues(symptoms) {
        return [
            {
                problem: "移动端布局错误",
                solution: "实现移动优先设计",
                code: this.generateResponsiveCode()
            },
            {
                problem: "断点设置不当",
                solution: "基于内容设置断点",
                code: "@media (min-width: 768px) { /* 平板样式 */ }"
            }
        ];
    }

    /**
     * Solve CSS specificity issues
     */
    solveSpecificityIssues(symptoms) {
        return [
            {
                problem: "样式覆盖不生效",
                solution: "增加选择器特异性",
                code: ".parent .child { /* 更高的特异性 */ }"
            },
            {
                problem: "!important 滥用",
                solution: "使用语义化类名替代",
                code: ".button-primary { /* 替代 !important */ }"
            }
        ];
    }

    /**
     * Generate code examples for different problem types
     */
    generateCodeExamples(problemType, solutions) {
        const examples = {
            'width-layout': this.generateWidthConstraintsCode(),
            'centering': this.generateCenteringCode(),
            'responsive': this.generateResponsiveCode(),
            'specificity': this.generateSpecificityCode()
        };

        return examples[problemType] || this.generateGeneralCSSCode();
    }

    /**
     * Generate width constraints code example
     */
    generateWidthConstraintsCode() {
        return `/* CSS布局原则：确保块级元素占据完整宽度 */
.section-element {
    width: 100%;           /* 占据父元素完整宽度 */
    display: block;        /* 确保块级显示 */
    box-sizing: border-box; /* 包含padding和border在宽度内 */
}

/* Mobius风格的内容居中容器 */
.content-wrapper {
    max-width: var(--content-max-width, 1200px);
    margin: 0 auto;        /* 水平居中 */
    padding: 0 var(--spacing-md);
}

/* 使用CSS变量保持一致性 */
.service-section {
    width: 100%;
    background: var(--light-bg);
    padding: var(--spacing-lg) 0;
}`;
    }

    /**
     * Generate centering code example
     */
    generateCenteringCode() {
        return `/* 现代CSS居中解决方案 */

/* 水平居中 - 块级元素 */
.horizontal-center {
    width: fit-content;
    margin: 0 auto;
}

/* Flexbox完全居中 */
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

/* Grid完全居中 */
.grid-center {
    display: grid;
    place-items: center;
    min-height: 100vh;
}

/* Mobius卡片居中 */
.service-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--spacing-lg);
}`;
    }

    /**
     * Generate responsive design code example
     */
    generateResponsiveCode() {
        return `/* Mobius风格的移动优先响应式设计 */

/* 移动端默认样式 */
.container {
    width: 100%;
    padding: var(--spacing-sm);
    font-size: 16px; /* 防止iOS缩放 */
}

/* 平板端 (768px+) */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }

    .service-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
    }
}

/* 桌面端 (1024px+) */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        padding: var(--spacing-lg);
    }

    .service-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--spacing-lg);
    }
}

/* 大屏幕 (1440px+) */
@media (min-width: 1440px) {
    .container {
        max-width: 1400px;
    }
}`;
    }

    /**
     * Generate specificity management code example
     */
    generateSpecificityCode() {
        return `/* CSS特异性管理 - Mobius最佳实践 */

/* 好的做法 - 适中的特异性 */
.service-card .title {
    color: var(--dark-text);
    font-size: 1.25rem;
}

/* 更好的做法 - 使用语义化类名 */
.service-card__title {
    color: var(--dark-text);
    font-size: 1.25rem;
}

/* 组件变体 */
.service-card--featured .service-card__title {
    color: var(--primary-blue);
    font-weight: 600;
}

/* 避免的做法 - 过度特异 */
body .main .section .service .card .title {
    color: var(--dark-text) !important; /* 避免这样做 */
}

/* 状态类 */
.button--primary {
    background: var(--gradient-primary);
    color: white;
}

.button--primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}`;
    }

    /**
     * Get relevant best practices for problem type
     */
    getRelevantBestPractices(problemType) {
        const practices = {
            'width-layout': [
                "始终使用 box-sizing: border-box",
                "为块级元素设置明确的宽度约束",
                "保持容器层级结构清晰",
                "使用CSS变量管理尺寸"
            ],
            'centering': [
                "选择合适的居中方法（flexbox/grid最简单）",
                "考虑内容对齐方式",
                "确保容器有明确的尺寸",
                "测试不同屏幕尺寸的居中效果"
            ],
            'responsive': [
                "采用移动优先设计方法",
                "基于内容而非设备设置断点",
                "使用相对单位（rem, %, vw）",
                "确保触摸目标至少44px"
            ],
            'specificity': [
                "使用语义化类名（BEM方法论）",
                "避免 !important 除非绝对必要",
                "保持选择器简洁（3层以内）",
                "使用CSS变量减少重复样式"
            ]
        };

        return practices[problemType] || [
            "保持CSS代码简洁和可维护",
            "使用现代CSS特性（Grid, Flexbox, Variables）",
            "测试跨浏览器兼容性",
            "定期重构和优化CSS代码"
        ];
    }

    /**
     * Generate comprehensive CSS analysis report
     */
    generateCSSReport(userQuery, context = {}) {
        const analysis = this.analyzeCSSProblem(userQuery, context);

        return {
            timestamp: new Date().toISOString(),
            query: userQuery,
            analysis: analysis,
            recommendations: this.generateRecommendations(analysis),
            mobiusSpecific: this.getMobiusSpecificAdvice(analysis),
            nextSteps: this.getNextSteps(analysis)
        };
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];

        analysis.solutions.forEach(solution => {
            if (solution.code) {
                recommendations.push({
                    priority: 'high',
                    action: '实施CSS修复',
                    description: solution.solution || '应用提供的CSS代码',
                    code: solution.code
                });
            }
        });

        analysis.bestPractices.forEach(practice => {
            recommendations.push({
                priority: 'medium',
                action: '最佳实践优化',
                description: practice
            });
        });

        return recommendations;
    }

    /**
     * Get Mobius-specific advice
     */
    getMobiusSpecificAdvice(analysis) {
        const advice = [];

        if (analysis.problemType === 'width-layout') {
            advice.push("确保使用Mobius的CSS变量系统：--spacing-md, --light-bg等");
            advice.push("遵循Mobius的容器结构：.section > .container > .content");
        }

        if (analysis.problemType === 'responsive') {
            advice.push("使用Mobius的断点系统：<768px, 768-1199px, 1200px+");
            advice.push("确保在不同设备上保持Mobius的视觉一致性");
        }

        return advice;
    }

    /**
     * Get next steps for implementation
     */
    getNextSteps(analysis) {
        return [
            "1. 在开发环境中测试提供的CSS解决方案",
            "2. 检查是否影响其他组件的样式",
            "3. 在不同设备尺寸下验证修复效果",
            "4. 更新相关的CSS文档",
            "5. 考虑将修复方案应用到类似问题"
        ];
    }
}

// Create global instance
window.csstricksagent = new CSSTricksAgentTool();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSSTricksAgentTool;
}

/**
 * Usage Example:
 *
 * const report = window.csstricksagent.generateCSSReport(
 *     "我的div元素没有占据全屏宽度，右侧有空白",
 *     { elementType: 'section', hasChildren: true }
 * );
 *
 * // Report includes:
 * // - Problem analysis
 * // - CSS solutions with code
 * // - Best practices
 * // - Mobius-specific advice
 * // - Implementation steps
 */