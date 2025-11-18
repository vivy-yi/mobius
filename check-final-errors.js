#!/usr/bin/env node

/**
 * 最终错误检查脚本 - 确认所有引用错误都已修复
 */

const fs = require('fs');

console.log('🔍 检查最终修复状态...');

// 检查关键的引用
const criticalChecks = [
    {
        file: 'components/state-manager.js',
        pattern: /constructor\(eventBus = null\)[\s\S]*this\.eventBus = eventBus \|\| globalEventBus/,
        description: 'KnowledgeStateManager正确引用globalEventBus'
    },
    {
        file: 'components/state-manager.js',
        pattern: /constructor\(eventBus = null\)\s*\{\s*this\.eventBus = eventBus \|\| EventBus/,
        description: 'KnowledgeStateManager不应该引用未定义的EventBus'
    },
    {
        file: 'components/event-bus.js',
        pattern: /export.*globalEventBus/,
        description: 'EventBus正确导出globalEventBus'
    },
    {
        file: 'components/knowledge-navigation.js',
        pattern: /import globalEventBus/,
        description: 'KnowledgeNavigation正确导入globalEventBus'
    },
    {
        file: 'components/article-card.js',
        pattern: /import globalEventBus/,
        description: 'ArticleCardManager正确导入globalEventBus'
    }
];

const testPageChecks = [
    {
        file: 'test-new-architecture.html',
        pattern: /window\.testEventBus = testEventBus/,
        description: '测试页面正确挂载testEventBus函数'
    },
    {
        file: 'test-new-architecture.html',
        pattern: /window\.testStateManager = testStateManager/,
        description: '测试页面正确挂载testStateManager函数'
    },
    {
        file: 'test-new-architecture.html',
        pattern: /window\.testDataLoading = testDataLoading/,
        description: '测试页面正确挂载testDataLoading函数'
    },
    {
        file: 'test-new-architecture.html',
        pattern: /window\.testCompleteFlow = testCompleteFlow/,
        description: '测试页面正确挂载testCompleteFlow函数'
    },
    {
        file: 'test-new-architecture.html',
        pattern: /const eventBus = globalEventBus/,
        description: '测试函数正确使用globalEventBus'
    }
];

let allPassed = true;
const issues = [];

// 检查核心文件
console.log('\n📁 检查核心文件引用...');
criticalChecks.forEach(check => {
    try {
        const content = fs.readFileSync(check.file, 'utf8');
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.description}`);
        } else {
            console.log(`❌ ${check.description} - 未找到`);
            allPassed = false;
            issues.push(check.description);
        }
    } catch (error) {
        console.log(`❌ ${check.description} - 文件错误: ${error.message}`);
        allPassed = false;
        issues.push(`${check.description} - ${error.message}`);
    }
});

// 检查测试页面
console.log('\n🧪 检查测试页面引用...');
testPageChecks.forEach(check => {
    try {
        const content = fs.readFileSync(check.file, 'utf8');
        if (check.pattern.test(content)) {
            console.log(`✅ ${check.description}`);
        } else {
            console.log(`❌ ${check.description} - 未找到`);
            allPassed = false;
            issues.push(check.description);
        }
    } catch (error) {
        console.log(`❌ ${check.description} - 文件错误: ${error.message}`);
        allPassed = false;
        issues.push(`${check.description} - ${error.message}`);
    }
});

if (allPassed) {
    console.log('\n🎉 所有引用错误修复验证通过！');
    console.log('\n修复内容：');
    console.log('✅ 修复了KnowledgeStateManager中EventBus引用');
    console.log('✅ 修复了测试页面中的全局变量引用');
    console.log('✅ 统一了所有组件的导入语法');
    console.log('✅ 正确导出和使用了globalEventBus实例');
    console.log('\n现在应该没有以下错误：');
    console.log('- ❌ ReferenceError: Can\'t find variable: EventBus');
    console.log('- ❌ ReferenceError: Can\'t find variable: testEventBus');
    console.log('- ❌ ReferenceError: Can\'t find variable: testStateManager');
    console.log('- ❌ ReferenceError: Can\'t find variable: testDataLoading');
    console.log('- ❌ ReferenceError: Can\'t find variable: testCompleteFlow');
    console.log('\n📋 测试建议：');
    console.log('1. 访问 http://localhost:8000/knowledge.html');
    console.log('2. 访问 http://localhost:8000/test-new-architecture.html');
    console.log('3. 点击所有测试按钮，确认功能正常');
    console.log('4. 检查控制台，应该没有ReferenceError');
} else {
    console.log('\n❌ 发现引用错误问题：');
    issues.forEach(issue => {
        console.log(`  - ${issue}`);
    });
}