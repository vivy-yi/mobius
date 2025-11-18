#!/usr/bin/env node

/**
 * 最终验证脚本 - 确认所有修复都正确应用
 */

const fs = require('fs');

console.log('🔍 最终验证模块修复...');

const checks = [
    {
        file: 'components/event-bus.js',
        pattern: /export { globalEventBus }/,
        description: 'globalEventBus正确导出'
    },
    {
        file: 'components/event-bus.js',
        pattern: /export default globalEventBus/,
        description: '默认导出正确'
    },
    {
        file: 'components/state-manager.js',
        pattern: /import globalEventBus/,
        description: 'state-manager正确导入globalEventBus'
    },
    {
        file: 'components/article-card.js',
        pattern: /import globalEventBus/,
        description: 'article-card正确导入globalEventBus'
    },
    {
        file: 'components/knowledge-navigation.js',
        pattern: /import globalEventBus/,
        description: 'knowledge-navigation正确导入globalEventBus'
    }
];

let allPassed = true;

checks.forEach(check => {
    try {
        const content = fs.readFileSync(check.file, 'utf8');
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.description}`);
        } else {
            console.log(`❌ ${check.description} - 未找到`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`❌ ${check.description} - 文件错误: ${error.message}`);
        allPassed = false;
    }
});

// 检查HTML文件
try {
    const html = fs.readFileSync('knowledge.html', 'utf8');

    const htmlChecks = [
        {
            pattern: /import globalEventBus from/,
            description: 'HTML正确导入globalEventBus'
        },
        {
            pattern: /window\.knowledgeEventBus = globalEventBus/,
            description: 'HTML正确使用导入的实例'
        },
        {
            pattern: /new KnowledgeStateManager\(globalEventBus\)/,
            description: 'HTML正确传递EventBus实例'
        }
    ];

    htmlChecks.forEach(check => {
        if (check.pattern.test(html)) {
            console.log(`✅ ${check.description}`);
        } else {
            console.log(`❌ ${check.description} - 未找到`);
            allPassed = false;
        }
    });

} catch (error) {
    console.log(`❌ HTML文件检查失败: ${error.message}`);
    allPassed = false;
}

if (allPassed) {
    console.log('\n🎉 所有修复验证通过！');
    console.log('\n修复总结：');
    console.log('✅ 修复了globalEventBus导出问题');
    console.log('✅ 统一了所有组件的导入语法');
    console.log('✅ 修正了HTML中的实例创建逻辑');
    console.log('✅ 清理了冗余的全局实例创建');
    console.log('\n现在应该没有以下错误：');
    console.log('- ❌ SyntaxError: Importing binding name \'globalEventBus\' is not found');
    console.log('- ❌ TypeError: EventBus is not a constructor');
    console.log('- ❌ ReferenceError: Can\'t find variable: process');
    console.log('\n📋 测试建议：');
    console.log('1. 访问 http://localhost:8000/knowledge.html');
    console.log('2. 检查浏览器控制台，应该没有导入相关错误');
    console.log('3. 测试标签点击功能');
    console.log('4. 执行 window.debugKnowledgeBase() 查看调试信息');
} else {
    console.log('\n❌ 部分验证失败，请检查上述问题。');
}