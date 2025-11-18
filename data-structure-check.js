#!/usr/bin/env node

/**
 * 数据结构检查脚本
 */

const fs = require('fs');

console.log('🔍 检查 articles.json 数据结构...');

try {
    const data = JSON.parse(fs.readFileSync('data/articles.json', 'utf8'));

    console.log('顶层键:', Object.keys(data));

    if (data.articles) {
        console.log('articles 键存在');
        console.log('articles 类型:', typeof data.articles);
        if (typeof data.articles === 'object') {
            console.log('articles 键:', Object.keys(data.articles));
            if (Object.keys(data.articles).length > 0) {
                const firstArticleKey = Object.keys(data.articles)[0];
                console.log('第一篇文章键:', firstArticleKey);
                console.log('第一篇文章:', data.articles[firstArticleKey]);
            }
        }
    } else {
        console.log('articles 键不存在');

        // 查找文章数据
        let articleCount = 0;
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && value !== null && value.id && value.title) {
                articleCount++;
                if (articleCount <= 3) {
                    console.log(`找到文章 (${key}):`, value.title);
                }
            }
        }
        console.log(`总共找到 ${articleCount} 篇文章`);
    }

} catch (error) {
    console.log('错误:', error.message);
}