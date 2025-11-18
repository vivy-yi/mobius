#!/usr/bin/env node

/**
 * 简单检查脚本
 */

const fs = require('fs');

console.log('🔍 简单检查修复状态...');

// 检查state-manager.js
try {
    const stateContent = fs.readFileSync('components/state-manager.js', 'utf8');

    if (stateContent.includes('this.eventBus = eventBus || globalEventBus')) {
        console.log('✅ KnowledgeStateManager正确使用globalEventBus');
    } else {
        console.log('❌ KnowledgeStateManager没有正确使用globalEventBus');
    }

    // 确保没有引用未定义的EventBus
    const lines = stateContent.split('\n');
    let hasEventBusReference = false;
    lines.forEach((line, index) => {
        if (line.includes('|| EventBus') && !line.includes('globalEventBus')) {
            console.log(`❌ 第${index + 1}行发现未定义的EventBus引用: ${line.trim()}`);
            hasEventBusReference = true;
        }
    });

    if (!hasEventBusReference) {
        console.log('✅ 没有发现未定义的EventBus引用');
    }

} catch (error) {
    console.log(`❌ state-manager.js检查失败: ${error.message}`);
}

// 检查其他组件
try {
    const navContent = fs.readFileSync('components/knowledge-navigation.js', 'utf8');
    if (navContent.includes('import globalEventBus')) {
        console.log('✅ KnowledgeNavigation正确导入globalEventBus');
    } else {
        console.log('❌ KnowledgeNavigation导入有问题');
    }
} catch (error) {
    console.log(`❌ knowledge-navigation.js检查失败: ${error.message}`);
}

try {
    const cardContent = fs.readFileSync('components/article-card.js', 'utf8');
    if (cardContent.includes('import globalEventBus')) {
        console.log('✅ ArticleCardManager正确导入globalEventBus');
    } else {
        console.log('❌ ArticleCardManager导入有问题');
    }
} catch (error) {
    console.log(`❌ article-card.js检查失败: ${error.message}`);
}

console.log('\n🎯 验证结果:');
console.log('如果所有检查都通过，应该没有以下错误：');
console.log('- ReferenceError: Can\'t find variable: EventBus');
console.log('- ReferenceError: Can\'t find variable: testEventBus');
console.log('- ReferenceError: Can\'t find variable: testStateManager');
console.log('- ReferenceError: Can\'t find variable: testDataLoading');
console.log('- ReferenceError: Can\'t find variable: testCompleteFlow');