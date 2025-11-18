#!/usr/bin/env node

/**
 * 快速错误检查脚本 - 验证用户报告的错误已修复
 */

const fs = require('fs');

console.log('🔍 快速检查用户报告的错误...');

const errorsToCheck = [
    {
        error: 'ReferenceError: Can\'t find variable: EventBus',
        file: 'components/article-card.js',
        pattern: /this\.eventBus = eventBus \|\| globalEventBus/,
        shouldBeFixed: true
    },
    {
        error: 'TypeError: undefined is not a constructor (evaluating \'new KnowledgeNavigation\')',
        file: 'components/knowledge-navigation.js',
        pattern: /export default KnowledgeNavigation/,
        shouldBeFixed: true
    },
    {
        error: 'HTML imports should use fallback method',
        file: 'knowledge.html',
        pattern: /knowledgeNavModule\.default \|\| knowledgeNavModule\.KnowledgeNavigation/,
        shouldBeFixed: true
    }
];

let allFixed = true;

errorsToCheck.forEach(({ error, file, pattern, shouldBeFixed }) => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const hasPattern = pattern.test(content);

        if (shouldBeFixed && hasPattern) {
            console.log(`✅ 修复已应用: ${error}`);
        } else if (shouldBeFixed && !hasPattern) {
            console.log(`❌ 修复缺失: ${error}`);
            console.log(`   文件: ${file}`);
            allFixed = false;
        } else {
            console.log(`ℹ️  ${error} - ${hasPattern ? '存在' : '不存在'}`);
        }
    } catch (err) {
        console.log(`❌ 无法检查文件 ${file}: ${err.message}`);
        allFixed = false;
    }
});

if (allFixed) {
    console.log('\n🎉 所有用户报告的错误都已修复！');
    console.log('\n现在应该不会再看到以下错误：');
    console.log('- ReferenceError: Can\'t find variable: EventBus');
    console.log('- TypeError: undefined is not a constructor (evaluating \'new KnowledgeNavigation\')');
    console.log('\n✨ 请刷新页面测试功能！');
} else {
    console.log('\n❌ 仍有错误需要修复');
}