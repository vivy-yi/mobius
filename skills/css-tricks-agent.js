/**
 * CSS Tricks Agent - CSS冲突解决和最佳实践专家
 *
 * 专门解决常见CSS布局冲突、样式覆盖、响应式设计等问题
 * 提供标准化解决方案和设计原则
 */

class CSSTricksAgent {
    constructor() {
        this.name = "CSS Tricks Agent";
        this.version = "1.0.0";
        this.specialties = [
            "CSS布局冲突解决",
            "样式优先级管理",
            "响应式设计问题",
            "Flexbox/Grid布局优化",
            "浏览器兼容性问题",
            "性能优化建议"
        ];

        // 核心解决原则库
        this.principles = this.initializePrinciples();

        // 常见问题解决方案库
        this.solutions = this.initializeSolutions();
    }

    /**
     * 初始化CSS设计原则
     */
    initializePrinciples() {
        return {
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
                },

                specificityManagement: {
                    principle: "CSS特异性管理原则",
                    description: "避免使用!important，通过合理的选择器特异性控制样式优先级",
                    solution: "使用类选择器 > 属性选择器 > 伪类 > 标签选择器",
                    context: "保持CSS的可维护性和可预测性"
                }
            },

            responsive: {
                mobileFirst: {
                    principle: "移动优先设计原则",
                    description: "先设计移动端体验，然后渐进增强到桌面端",
                    solution: "min-width媒体查询，默认移动端样式",
                    context: "确保在所有设备上都有良好的用户体验"
                },

                breakpointStrategy: {
                    principle: "断点策略原则",
                    description: "基于内容而非设备设置断点",
                    solution: "当布局自然需要调整时设置断点",
                    context: "创建更灵活、适应未来设备的响应式设计"
                }
            },

            performance: {
                reflowOptimization: {
                    principle: "重排/重绘优化原则",
                    description: "最小化布局变化和样式重计算",
                    solution: "使用transform和opacity进行动画，避免直接操作layout属性",
                    context: "提升页面渲染性能和用户体验"
                },

                selectorEfficiency: {
                    principle: "选择器效率原则",
                    description: "避免过度复杂的选择器",
                    solution: "限制选择器深度在3层以内，避免通用选择器",
                    context: "提高CSS匹配速度和渲染性能"
                }
            }
        };
    }

    /**
     * 初始化常见问题解决方案
     */
    initializeSolutions() {
        return {
            widthIssues: {
                parentNotFullWidth: {
                    problem: "父元素没有占据全屏宽度",
                    symptoms: ["右侧出现空白", "子元素宽度受限", "布局不对称"],
                    causes: ["缺少width: 100%", "flex子元素影响父元素", "box-sizing问题"],
                    solutions: [
                        "给父元素添加 width: 100%",
                        "设置 display: block",
                        "添加 box-sizing: border-box",
                        "检查子元素的总宽度是否超过父元素"
                    ]
                },

                childOverflowing: {
                    problem: "子元素宽度超出父元素",
                    symptoms: ["水平滚动条", "元素被截断", "布局错乱"],
                    causes: ["padding/margin计算错误", "border宽度", "固定宽度过大"],
                    solutions: [
                        "使用 box-sizing: border-box",
                        "检查所有margin、padding、border的总和",
                        "考虑使用max-width替代width",
                        "确保百分比宽度计算正确"
                    ]
                }
            },

            centeringIssues: {
                horizontalCentering: {
                    problem: "水平居中失败",
                    methods: {
                        blockLevel: "margin: 0 auto",
                        flexLevel: "justify-content: center",
                        gridLevel: "place-items: center",
                        absoluteLevel: "left: 50%; transform: translateX(-50%)"
                    }
                },

                verticalCentering: {
                    problem: "垂直居中失败",
                    methods: {
                        flexLevel: "align-items: center",
                        gridLevel: "place-items: center",
                        absoluteLevel: "top: 50%; transform: translateY(-50%)",
                        tableLevel: "display: table-cell; vertical-align: middle"
                    }
                }
            },

            specificityConflicts: {
                overrideNotWorking: {
                    problem: "样式覆盖不生效",
                    causes: ["特异性不够", "!important优先级", "加载顺序问题", "选择器匹配错误"],
                    solutions: [
                        "增加选择器特异性",
                        "避免使用!important",
                        "检查样式表加载顺序",
                        "验证选择器语法正确性"
                    ]
                }
            },

            responsiveProblems: {
                mobileLayoutBroken: {
                    problem: "移动端布局错误",
                    checkPoints: [
                        "viewport meta标签是否正确",
                        "媒体查询断点是否合适",
                        "字体大小是否可读",
                        "触摸目标是否足够大"
                    ]
                }
            }
        };
    }

    /**
     * 分析CSS问题并提供解决方案
     */
    analyzeIssue(issueDescription, symptoms = []) {
        const analysis = {
            problem: issueDescription,
            symptoms: symptoms,
            possibleCauses: [],
            recommendedSolutions: [],
            principles: [],
            codeExamples: []
        };

        // 基于症状分析可能的原因
        if (symptoms.includes('width') || symptoms.includes('布局') || symptoms.includes('居中')) {
            analysis.possibleCauses.push('宽度约束问题');
            analysis.recommendedSolutions.push(this.solutions.widthIssues);
            analysis.principles.push(this.principles.layout.widthConstraints);
        }

        if (symptoms.includes('responsive') || symptoms.includes('mobile') || symptoms.includes('适配')) {
            analysis.possibleCauses.push('响应式设计问题');
            analysis.recommendedSolutions.push(this.solutions.responsiveProblems);
            analysis.principles.push(this.principles.responsive.mobileFirst);
        }

        if (symptoms.includes('override') || symptoms.includes('priority') || symptoms.includes('优先级')) {
            analysis.possibleCauses.push('CSS特异性冲突');
            analysis.recommendedSolutions.push(this.solutions.specificityConflicts);
            analysis.principles.push(this.principles.layout.specificityManagement);
        }

        return analysis;
    }

    /**
     * 生成CSS解决方案代码示例
     */
    generateSolutionCode(problemType, specificIssue) {
        const codeExamples = {
            widthConstraints: `
/* CSS布局原则：确保块级元素占据完整宽度 */
.section-element {
    width: 100%;           /* 占据父元素完整宽度 */
    display: block;        /* 确保块级显示 */
    box-sizing: border-box; /* 包含padding和border在宽度内 */
}

/* 内容居中容器 */
.content-wrapper {
    max-width: 800px;      /* 限制内容最大宽度 */
    margin: 0 auto;        /* 水平居中 */
    padding: 0 20px;       /* 左右内边距 */
}`,

            responsiveDesign: `
/* 移动优先的响应式设计 */
.container {
    width: 100%;
    padding: 1rem;
}

/* 平板端 */
@media (min-width: 768px) {
    .container {
        max-width: 750px;
        margin: 0 auto;
    }
}

/* 桌面端 */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        padding: 2rem;
    }
}`,

            specificityManagement: `
/* CSS特异性管理：避免!important，使用合理的选择器 */

/* 好的做法 - 适中的特异性 */
.component .button-primary {
    background-color: var(--primary-color);
}

/* 避免的做法 - 过度特异 */
body .main .section .component .button-primary {
    background-color: var(--primary-color) !important;
}

/* 更好的做法 - 使用语义化类名 */
.btn--primary {
    background-color: var(--primary-color);
}`,

            modernLayout: `
/* 现代CSS布局解决方案 */
.flex-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    place-items: center;
}`
        };

        return codeExamples[problemType] || '// 代码示例生成中...';
    }

    /**
     * 获取最佳实践建议
     */
    getBestPractices(category = 'all') {
        const practices = {
            layout: [
                "始终使用box-sizing: border-box",
                "为块级元素设置明确的宽度约束",
                "保持容器层级结构清晰",
                "避免固定的像素值，使用相对单位"
            ],

            responsive: [
                "采用移动优先设计方法",
                "基于内容而非设备设置断点",
                "使用相对单位（rem, em, %, vw, vh）",
                "确保触摸目标至少44px"
            ],

            performance: [
                "限制选择器深度在3层以内",
                "避免通用选择器（*）",
                "使用transform进行动画，避免layout属性",
                "压缩CSS文件，移除未使用样式"
            ],

            maintenance: [
                "使用CSS变量管理主题和颜色",
                "采用BEM命名规范",
                "按组件组织CSS代码",
                "定期重构和优化CSS"
            ]
        };

        return category === 'all' ? practices : practices[category] || [];
    }

    /**
     * 生成CSS诊断报告
     */
    generateDiagnosticReport(issues) {
        const report = {
            timestamp: new Date().toISOString(),
            issues: [],
            principles: [],
            recommendations: [],
            codeFixes: []
        };

        issues.forEach(issue => {
            const analysis = this.analyzeIssue(issue.description, issue.symptoms);
            report.issues.push(analysis);
            report.principles.push(...analysis.principles);
            report.recommendations.push(...analysis.recommendedSolutions);

            // 为每个问题生成代码修复示例
            if (analysis.principles.length > 0) {
                const principleType = analysis.principles[0].principle.includes('宽度') ? 'widthConstraints' : 'general';
                report.codeFixes.push(this.generateSolutionCode(principleType, issue));
            }
        });

        return report;
    }

    /**
     * 导出为JSON格式供其他系统使用
     */
    exportKnowledge() {
        return {
            agent: {
                name: this.name,
                version: this.version,
                specialties: this.specialties
            },
            principles: this.principles,
            solutions: this.solutions,
            bestPractices: this.getBestPractices()
        };
    }
}

// 创建全局CSS专家实例
window.cssTricksAgent = new CSSTricksAgent();

// 导出为模块（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSSTricksAgent;
}

/**
 * 使用示例：
 *
 * // 分析CSS问题
 * const analysis = window.cssTricksAgent.analyzeIssue(
 *     '父元素没有占据全屏宽度',
 *     ['width', '布局', '居中']
 * );
 *
 * // 获取最佳实践
 * const practices = window.cssTricksAgent.getBestPractices('layout');
 *
 * // 生成代码示例
 * const code = window.cssTricksAgent.generateSolutionCode('widthConstraints', null);
 *
 * // 生成诊断报告
 * const report = window.cssTricksAgent.generateDiagnosticReport([
 *     { description: '布局问题', symptoms: ['width', 'centering'] }
 * ]);
 */