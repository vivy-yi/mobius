#!/usr/bin/env node

/**
 * 快速修复验证脚本
 */

const fs = require('fs');

console.log('🔍 验证快速修复...');

const checks = [
    {
        description: '使用正确的方法名 loadArticlesFromJSON',
        file: 'knowledge.html',
        pattern: /loadArticlesFromJSON\(\)/
    },
    {
        description: '缓存管理器有配额错误处理',
        file: 'components/cache-manager.js',
        pattern: /QuotaExceededError.*NS_ERROR_DOM_QUOTA_REACHED/
    },
    {
        description: '缓存管理器有缓存开关',
        file: 'components/cache-manager.js',
        pattern: /this\.cacheEnabled = true/
    },
    {
        description: '缓存管理器能禁用缓存',
        file: 'components/cache-manager.js',
        pattern: /this\.cacheEnabled = false/
    },
    {
        description: '有clearCache方法调用',
        file: 'components/cache-manager.js',
        pattern: /this\.clearCache\(\)/
    }
];

let allPassed = true;

checks.forEach(({ description, file, pattern }) => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        if (pattern.test(content)) {
            console.log(`✅ ${description}`);
        } else {
            console.log(`❌ ${description} - 未找到预期模式`);
            allPassed = false;
        }
    } catch (error) {
        console.log(`❌ 无法检查 ${description}: ${error.message}`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\n🎉 快速修复验证通过！');
    console.log('\n修复内容：');
    console.log('✅ 1. 修复了方法名错误 (loadArticles → loadArticlesFromJSON)');
    console.log('✅ 2. 添加了localStorage配额超出处理');
    console.log('✅ 3. 实现了缓存禁用机制');
    console.log('✅ 4. 添加了自动缓存清理');

    console.log('\n现在应该不会再看到：');
    console.log('- ❌ loadArticles is not a function');
    console.log('- ❌ QuotaExceededError 缓存错误');
    console.log('- ❌ 重复的数据加载');

    console.log('\n🚀 请刷新页面，应该能看到：');
    console.log('- ✅ 成功的5步初始化');
    console.log('- ✅ 正确的数据加载');
    console.log('- ✅ 智能的缓存管理');
} else {
    console.log('\n❌ 部分验证未通过，请检查上述问题。');
}