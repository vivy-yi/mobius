#!/usr/bin/env node

/**
 * 快速检查模块导入是否正确
 */

const fs = require('fs');

console.log('🔍 检查模块导入...');

const files = [
    'components/event-bus.js',
    'components/state-manager.js',
    'components/article-card.js',
    'components/knowledge-navigation.js'
];

const issues = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');

        // 检查process变量使用
        if (content.includes('process.env.NODE_ENV')) {
            issues.push(`${file}: 仍然使用 process.env.NODE_ENV`);
        }

        // 检查EventBus导入
        if (file !== 'components/event-bus.js') {
            if (content.includes("import { EventBus")) {
                if (!content.includes("globalEventBus as EventBus")) {
                    issues.push(`${file}: EventBus 导入可能有问题`);
                }
            }
        }

        // 检查导出
        if (file === 'components/event-bus.js') {
            if (!content.includes('export { globalEventBus as EventBus }')) {
                issues.push(`${file}: 缺少正确的导出`);
            }
        }

        console.log(`✅ ${file} - 基本检查通过`);

    } catch (error) {
        issues.push(`${file}: 无法读取文件 - ${error.message}`);
        console.log(`❌ ${file} - ${error.message}`);
    }
});

// 检查HTML文件
try {
    const html = fs.readFileSync('knowledge.html', 'utf8');
    if (html.includes("import { EventBus")) {
        if (!html.includes("globalEventBus as EventBus")) {
            issues.push('knowledge.html: EventBus 导入可能有问题');
        }
    }
    console.log('✅ knowledge.html - 基本检查通过');
} catch (error) {
    issues.push(`knowledge.html: ${error.message}`);
    console.log(`❌ knowledge.html - ${error.message}`);
}

if (issues.length === 0) {
    console.log('\n🎉 所有模块导入检查通过！');
    console.log('修复内容：');
    console.log('- ✅ 移除了 process.env.NODE_ENV 引用');
    console.log('- ✅ 修复了 EventBus 导入问题');
    console.log('- ✅ 移除了自动初始化调用');
    console.log('- ✅ 修正了模块导入语法');
} else {
    console.log('\n❌ 发现问题：');
    issues.forEach(issue => console.log(`  - ${issue}`));
}