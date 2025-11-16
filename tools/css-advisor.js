/**
 * CSS Advisor Tool - CSS问题自动诊断和解决工具
 * 当用户询问CSS布局和样式问题时自动加载到上下文
 */

class CSSAdvisor {
    constructor() {
        this.name = "CSS Advisor";
        this.version = "1.0.0";

        // CSS问题关键词映射
        this.problemKeywords = {
            width: ['width', '宽度', '全屏', '占满', 'stretch', 'full'],
            layout: ['layout', '布局', 'position', '居中', 'center', 'align'],
            responsive: ['responsive', '响应式', 'mobile', '手机', 'tablet', '适配'],
            override: ['override', '覆盖', 'priority', '优先级', '!important', 'specificity'],
            styling: ['style', '样式', 'css', '美化', '外观', 'design']
        };

        // 核心解决方案库
        this.solutions = this.initializeSolutions();
    }

    /**
     * 初始化解决方案库
     */
    initializeSolutions() {
        return {
            widthConstraints: {
                problem: "元素没有占据完整宽度",
                solution: {
                    css: `
/* 宽度约束解决方案 - 基于Mobius项目经验 */
.parent-element {
    width: 100%;           /* 关键：占据父元素完整宽度 */
    display: block;        /* 确保块级显示 */
    box-sizing: border-box; /* 包含padding和border */
}

.content-wrapper {
    max-width: 800px;      /* 内容限制宽度 */
    margin: 0 auto;        /* 水平居中 */
    padding: 0 var(--spacing-md);
}`,
                    explanation: "当子元素使用flex/grid布局时，父级块元素必须有明确宽度约束",
                    principle: "这是从Mobius community.html布局问题中总结的核心原则"
                }
            },

            centeringSolutions: {
                problem: "元素居中失败",
                solution: {
                    css: `
/* 多种居中解决方案 */

/* 1. 块级元素水平居中 */
.block-center {
    width: fit-content;
    margin: 0 auto;
}

/* 2. Flexbox居中（推荐） */
.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 3. Grid居中 */
.grid-center {
    display: grid;
    place-items: center;
}

/* 4. 绝对定位居中 */
.absolute-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}`,
                    explanation: "根据具体场景选择合适的居中方法"
                }
            },

            responsiveDesign: {
                problem: "响应式设计问题",
                solution: {
                    css: `
/* Mobius项目响应式设计模式 */
.container {
    width: 100%;
    padding: var(--spacing-sm);
}

/* 平板端 768px+ */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
        padding: var(--spacing-md);
    }
}

/* 桌面端 1200px+ */
@media (min-width: 1200px) {
    .container {
        max-width: 1200px;
        padding: var(--spacing-lg);
    }
}`,
                    explanation: "采用移动优先的设计方法，基于内容设置断点"
                }
            },

            specificityManagement: {
                problem: "CSS样式覆盖不生效",
                solution: {
                    css: `
/* CSS特异性管理最佳实践 */

/* 避免：使用!important */
.dont-do {
    color: red !important;
}

/* 推荐：使用具体的选择器 */
.component .button-primary {
    background: var(--tech-blue);
}

/* 最佳：语义化BEM命名 */
.btn--primary {
    background: var(--tech-blue);
    border: none;
    padding: var(--spacing-sm) var(--spacing-md);
}`,
                    explanation: "通过合理的选择器特异性控制样式优先级"
                }
            }
        };
    }

    /**
     * 检测用户查询中的CSS问题类型
     */
    detectProblemType(query) {
        const detectedProblems = [];

        for (const [category, keywords] of Object.entries(this.problemKeywords)) {
            if (keywords.some(keyword =>
                query.toLowerCase().includes(keyword.toLowerCase())
            )) {
                detectedProblems.push(category);
            }
        }

        return detectedProblems;
    }

    /**
     * 生成问题诊断报告
     */
    generateDiagnosis(query, context = {}) {
        const problemTypes = this.detectProblemType(query);

        const diagnosis = {
            query: query,
            detectedProblems: problemTypes,
            recommendations: [],
            solutions: [],
            mobiusContext: context.mobiusProject || false
        };

        // 根据检测到的问题类型提供解决方案
        problemTypes.forEach(problemType => {
            if (this.solutions[problemType]) {
                diagnosis.solutions.push(this.solutions[problemType]);
            }
        });

        // 如果检测到是Mobius项目，添加项目特定的建议
        if (context.mobiusProject) {
            diagnosis.mobiusSpecificTips = [
                "使用Mobius CSS变量保持设计一致性",
                "遵循项目的响应式断点（768px, 1200px）",
                "应用BEM命名规范：.component, .component__element, .component--modifier",
                "参考已建立的CSS布局原则：父元素必须设置明确宽度约束"
            ];
        }

        return diagnosis;
    }

    /**
     * 生成CSS代码示例
     */
    generateCodeExample(problemType, customRequirements = {}) {
        const baseSolution = this.solutions[problemType];

        if (!baseSolution) {
            return "// 问题类型未找到，请检查输入";
        }

        let code = baseSolution.solution.css;

        // 如果有自定义需求，修改代码
        if (customRequirements.width) {
            code = code.replace('max-width: 800px', `max-width: ${customRequirements.width}`);
        }

        if (customRequirements.variables) {
            // 使用Mobius CSS变量
            Object.entries(customRequirements.variables).forEach(([key, value]) => {
                code = code.replace(new RegExp(`var\\(--${key}\\)`, 'g'), value);
            });
        }

        return code;
    }

    /**
     * 获取最佳实践建议
     */
    getBestPractices() {
        return {
            layout: [
                "始终使用 box-sizing: border-box",
                "为块级元素设置明确宽度约束",
                "保持容器层级结构清晰",
                "避免使用固定像素值"
            ],

            performance: [
                "限制选择器深度在3层以内",
                "避免通用选择器",
                "使用transform进行动画",
                "压缩和优化CSS文件"
            ],

            maintainability: [
                "使用CSS变量管理主题",
                "采用BEM命名规范",
                "按组件组织CSS",
                "定期重构和清理"
            ]
        };
    }

    /**
     * 创建CSS修复建议
     */
    createFixRecommendation(problemDescription, currentCode = '') {
        const diagnosis = this.generateDiagnosis(problemDescription);

        const recommendation = {
            problem: problemDescription,
            diagnosis: diagnosis,
            suggestedFix: null,
            beforeCode: currentCode,
            afterCode: '',
            explanation: '',
            testingSteps: []
        };

        // 根据诊断结果生成修复建议
        if (diagnosis.detectedProblems.length > 0) {
            const mainProblem = diagnosis.detectedProblems[0];
            recommendation.suggestedFix = this.solutions[mainProblem];
            recommendation.afterCode = this.generateCodeExample(mainProblem);
            recommendation.explanation = this.solutions[mainProblem].solution.explanation;

            // 添加测试步骤
            recommendation.testingSteps = [
                "应用建议的CSS代码",
                "在不同屏幕尺寸下测试",
                "检查浏览器开发者工具中的计算样式",
                "验证响应式行为是否正确"
            ];
        }

        return recommendation;
    }
}

// 创建全局CSS顾问实例
window.cssAdvisor = new CSSAdvisor();

// 导出为模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSSAdvisor;
}

/**
 * 使用示例：
 *
 * const advisor = window.cssAdvisor;
 * const diagnosis = advisor.generateDiagnosis("我的div没有占满全屏宽度", {mobiusProject: true});
 * const fix = advisor.createFixRecommendation("元素无法居中");
 */