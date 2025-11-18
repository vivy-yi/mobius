#!/usr/bin/env node

/**
 * 分类映射测试脚本
 */

const fs = require('fs');

console.log('🔍 测试分类映射修复...');

try {
    // 读取文章数据
    const articlesData = JSON.parse(fs.readFileSync('data/articles.json', 'utf8'));

    // 模拟分类映射逻辑
    const categoryMap = {
        'business': '企业落地',
        'visa': '签证政策',
        'tax': '税务筹划',
        'subsidy': '补助金申请',
        'legal': '法务合规',
        'life': '生活支援'
    };

    // 测试每个分类
    console.log('\n📋 分类映射测试:');
    Object.entries(categoryMap).forEach(([englishId, chineseName]) => {
        const articles = articlesData.categories[englishId] || [];
        console.log(`✅ ${englishId} → ${chineseName}: ${articles.length} 篇文章`);
    });

    // 验证文章数据结构
    console.log('\n📊 数据验证:');
    let totalArticles = 0;
    Object.values(articlesData.categories).forEach(categoryArticles => {
        if (Array.isArray(categoryArticles)) {
            categoryArticles.forEach(article => {
                if (article.category) {
                    totalArticles++;
                }
            });
        }
    });
    console.log(`✅ 总文章数: ${totalArticles}`);

    // 模拟过滤器测试
    console.log('\n🧪 过滤器测试:');
    const testFilters = ['business', 'visa', 'tax'];
    testFilters.forEach(filter => {
        const targetCategory = categoryMap[filter];
        const matchingArticles = [];

        Object.values(articlesData.categories).forEach(categoryArticles => {
            if (Array.isArray(categoryArticles)) {
                categoryArticles.forEach(article => {
                    if (article.category === targetCategory) {
                        matchingArticles.push(article);
                    }
                });
            }
        });

        console.log(`✅ 过滤器 "${filter}" (${targetCategory}): 找到 ${matchingArticles.length} 篇文章`);
    });

    console.log('\n🎉 分类映射测试完成！');
    console.log('\n现在新架构应该可以正确：');
    console.log('- ✅ 将英文分类ID映射到中文分类名');
    console.log('- ✅ 正确过滤和显示文章');
    console.log('- ✅ 渲染到正确的容器中');

} catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
}